from __future__ import annotations

import base64
import io
import json
import math
import random
import shutil
import uuid
from datetime import datetime
from time import perf_counter
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageChops, ImageStat
from pydantic import BaseModel

from backend.comfy.client import ComfyError, comfy_ui_workflow_to_api, patch_character_workflow
from backend.services.asset_service import AssetService
from backend.services.engine_service import EngineService
from backend.services.export_service import ExportError, ExportService
from backend.services.recipe_service import RecipeError, RecipeService
from backend.services.workflow_service import WorkflowError, WorkflowService
from backend.services.workspace_service import WorkspaceService
from backend.services.palette_service import PaletteLabService

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
STATIC = FRONTEND / "static"
TEMPLATES = FRONTEND / "templates"
WORKFLOWS = ROOT / "workflows"
RECIPES = ROOT / "recipes"
PROJECT_ROOT = ROOT.parent / "PixelFactory-Projects" / "default"

recipe_service = RecipeService(RECIPES)
workflow_service = WorkflowService(WORKFLOWS)
engine_service = EngineService()
asset_service = AssetService(PROJECT_ROOT)
workspace_service = WorkspaceService(PROJECT_ROOT)
export_service = ExportService(PROJECT_ROOT, asset_service)
palette_lab_service = PaletteLabService()

app = FastAPI(title="Pixel Factory by Wulf", version="0.28-pf0036-cleanup-quality-pack")
app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (TEMPLATES / "index.html").read_text(encoding="utf-8")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": "Pixel Factory Web", "version": "0.14", "milestone": "PF-0014.2 Tile asset workflow cleanup"}


def _read_image(data: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(data))
    return img.convert("RGBA")


def _png_response(img: Image.Image, headers: dict[str, str] | None = None) -> Response:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png", headers=headers or {})



@app.post("/api/process")
async def process_image(
    image: UploadFile = File(...),
    resize_scale: int = Form(1),
    export_target_size: str = Form("scale"),
    palette_colors: int = Form(0),
    operation: str = Form("resize_palette"),
    pixel_size: int = Form(0),
    pixel_strength: float = Form(1.0),
    snap_palette: bool = Form(True),
    preserve_alpha: bool = Form(True),
    orphan_cleanup: bool = Form(False),
    orphan_strength: float = Form(0.35),
    palette_normalize: bool = Form(False),
    normalize_tolerance: int = Form(8),
    edge_cleanup: bool = Form(False),
    edge_strength: float = Form(0.30),
    smart_downscale: bool = Form(False),
    alpha_cleanup: bool = Form(False),
    alpha_threshold: int = Form(12),
    morphology_cleanup: bool = Form(False),
    morphology_strength: float = Form(0.35),
    jaggy_cleanup: bool = Form(False),
    jaggy_strength: float = Form(0.30),
) -> Response:
    started_at = perf_counter()
    data = await image.read()
    img = _read_image(data)

    operation = (operation or "resize_palette").strip().lower()
    aliases = {
        "nearest": "resize",
        "nearest_resize": "resize",
        "palette_resize": "resize_palette",
        "snap": "pixel_snap",
        "pixel-snap": "pixel_snap",
    }
    operation = aliases.get(operation, operation)
    allowed = {"resize", "palette", "resize_palette", "pixel_snap", "pixel_snap_only"}
    if operation not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported Palette Lab operation: {operation}")

    resize_scale = max(1, min(16, int(resize_scale or 1)))
    export_target_raw = str(export_target_size or "scale").strip().lower()
    export_target_px = 0
    if export_target_raw not in {"", "scale", "use_scale", "auto"}:
        try:
            export_target_px = int(export_target_raw.replace("px", "").split("x")[0].strip())
        except Exception:
            export_target_px = 0
        allowed_targets = {16, 32, 64, 128, 256, 512, 1024, 1536, 2048}
        if export_target_px not in allowed_targets:
            export_target_px = 0
    palette_colors = max(0, min(256, int(palette_colors or 0)))
    pixel_size = max(0, int(pixel_size or 0))
    pixel_strength = max(0.0, min(1.0, float(pixel_strength or 1.0)))

    original = img.copy()
    source_width, source_height = original.size
    source_color_count = palette_lab_service.rgba_color_count(original)
    source_transparent_percent = palette_lab_service.transparent_pixel_percent(original)
    detected_grid, grid_confidence = palette_lab_service.detect_pixel_size(original, pixel_size if pixel_size > 0 else 0)

    step_stats: dict[str, int] = {}

    def record_step(name: str, before_step: Image.Image, after_step: Image.Image) -> None:
        changed, _percent = palette_lab_service.changed_pixel_stats(before_step, after_step)
        step_stats[name] = changed

    smart_downscale_requested = bool(smart_downscale)
    smart_downscale_applied = False
    smart_downscale_grid = detected_grid if detected_grid > 1 else 1

    if smart_downscale_requested and smart_downscale_grid > 1:
        before_step = img.copy()
        img = palette_lab_service.smart_downscale_rgba(
            img,
            pixel_size=smart_downscale_grid,
            palette_colors=palette_colors,
            quantize=bool(snap_palette) and palette_colors > 0,
        )
        smart_downscale_applied = img.size != before_step.size
        record_step("smart_downscale", before_step, img)

    if operation == "pixel_snap":
        before_step = img.copy()
        img = palette_lab_service.pixel_snap_rgba(img, pixel_size=pixel_size, palette_colors=palette_colors, quantize=bool(snap_palette) and palette_colors > 0)
        if pixel_strength < 0.999:
            img = palette_lab_service.blend_with_matching_size(original, img, pixel_strength)
        record_step("pixel_snap", before_step, img)
    elif operation == "pixel_snap_only":
        before_step = img.copy()
        img = palette_lab_service.pixel_snap_rgba(img, pixel_size=pixel_size, palette_colors=palette_colors, quantize=False)
        if pixel_strength < 0.999:
            img = palette_lab_service.blend_with_matching_size(original, img, pixel_strength)
        record_step("pixel_snap", before_step, img)
    elif operation in {"palette", "resize_palette"}:
        before_step = img.copy()
        img = palette_lab_service.quantize_rgba(img, palette_colors)
        record_step("palette_quantize", before_step, img)

    if palette_normalize:
        before_step = img.copy()
        img = palette_lab_service.palette_normalize_rgba(img, tolerance=normalize_tolerance)
        record_step("palette_normalize", before_step, img)

    if orphan_cleanup:
        before_step = img.copy()
        img = palette_lab_service.orphan_cleanup_rgba(img, sensitivity=orphan_strength)
        record_step("orphan_cleanup", before_step, img)

    if edge_cleanup:
        before_step = img.copy()
        img = palette_lab_service.edge_cleanup_rgba(img, strength=edge_strength)
        record_step("edge_cleanup", before_step, img)

    if morphology_cleanup:
        before_step = img.copy()
        img = palette_lab_service.morphology_cleanup_rgba(img, strength=morphology_strength)
        record_step("morphology_cleanup", before_step, img)

    if jaggy_cleanup:
        before_step = img.copy()
        img = palette_lab_service.jaggy_cleanup_rgba(img, strength=jaggy_strength)
        record_step("jaggy_cleanup", before_step, img)

    if preserve_alpha and img.mode == "RGBA":
        before_step = img.copy()
        img.putalpha(palette_lab_service.match_alpha_size(original.getchannel("A"), img.size))
        record_step("alpha_preserve", before_step, img)

    if alpha_cleanup:
        before_step = img.copy()
        img = palette_lab_service.alpha_cleanup_rgba(img, threshold=alpha_threshold)
        record_step("alpha_cleanup", before_step, img)

    if operation in {"resize", "resize_palette", "pixel_snap"}:
        before_step = img.copy()
        w, h = img.size
        if export_target_px > 0:
            img = img.resize((export_target_px, export_target_px), Image.Resampling.NEAREST)
        elif resize_scale > 1:
            img = img.resize((w * resize_scale, h * resize_scale), Image.Resampling.NEAREST)
        if img.size != before_step.size:
            step_stats["resize"] = abs((img.size[0] * img.size[1]) - (before_step.size[0] * before_step.size[1]))
        else:
            step_stats["resize"] = 0

    output_width, output_height = img.size
    output_color_count = palette_lab_service.rgba_color_count(img)
    output_transparent_percent = palette_lab_service.transparent_pixel_percent(img)
    changed_pixels, changed_percent = palette_lab_service.changed_pixel_stats(original, img)
    sprite_grid = max(1, int(detected_grid or 1))
    sprite_width = max(1, int(round(source_width / sprite_grid)))
    sprite_height = max(1, int(round(source_height / sprite_grid)))

    headers = {
        "X-PF-Detected-Grid": str(detected_grid),
        "X-PF-Grid-Confidence": str(grid_confidence),
        "X-PF-Palette-Target": str(palette_colors if bool(snap_palette) and palette_colors > 0 else 0),
        "X-PF-Resize-Scale": str(resize_scale),
        "X-PF-Export-Target-Size": str(export_target_px) if export_target_px > 0 else "scale",
        "X-PF-Export-Mode": "target" if export_target_px > 0 else "scale",
        "X-PF-Source-Colors": str(source_color_count),
        "X-PF-Output-Colors": str(output_color_count),
        "X-PF-Changed-Pixels": str(changed_pixels),
        "X-PF-Changed-Percent": str(changed_percent),
        "X-PF-Palette-Normalize": "true" if palette_normalize else "false",
        "X-PF-Normalize-Tolerance": str(max(1, min(64, int(normalize_tolerance or 8)))),
        "X-PF-Edge-Cleanup": "true" if edge_cleanup else "false",
        "X-PF-Edge-Strength": str(max(0, min(100, int(round(float(edge_strength or 0) * 100))))),
        "X-PF-Processing-MS": str(max(0, int(round((perf_counter() - started_at) * 1000)))),
        "X-PF-Smart-Downscale": "true" if smart_downscale_applied else "false",
        "X-PF-Smart-Downscale-Requested": "true" if smart_downscale_requested else "false",
        "X-PF-Smart-Downscale-Applied": "true" if smart_downscale_applied else "false",
        "X-PF-Smart-Downscale-Grid": str(smart_downscale_grid),
        "X-PF-Step-Smart-Downscale": str(step_stats.get("smart_downscale", 0)),
        "X-PF-Step-Pixel-Snap": str(step_stats.get("pixel_snap", 0)),
        "X-PF-Step-Palette-Quantize": str(step_stats.get("palette_quantize", 0)),
        "X-PF-Step-Palette-Normalize": str(step_stats.get("palette_normalize", 0)),
        "X-PF-Step-Orphan-Cleanup": str(step_stats.get("orphan_cleanup", 0)),
        "X-PF-Step-Edge-Cleanup": str(step_stats.get("edge_cleanup", 0)),
        "X-PF-Morphology-Cleanup": "true" if morphology_cleanup else "false",
        "X-PF-Morphology-Strength": str(max(0, min(100, int(round(float(morphology_strength or 0) * 100))))),
        "X-PF-Step-Morphology-Cleanup": str(step_stats.get("morphology_cleanup", 0)),
        "X-PF-Jaggy-Cleanup": "true" if jaggy_cleanup else "false",
        "X-PF-Jaggy-Strength": str(max(0, min(100, int(round(float(jaggy_strength or 0) * 100))))),
        "X-PF-Step-Jaggy-Cleanup": str(step_stats.get("jaggy_cleanup", 0)),
        "X-PF-Step-Alpha-Preserve": str(step_stats.get("alpha_preserve", 0)),
        "X-PF-Alpha-Cleanup": "true" if alpha_cleanup else "false",
        "X-PF-Alpha-Threshold": str(max(0, min(96, int(alpha_threshold or 12)))),
        "X-PF-Step-Alpha-Cleanup": str(step_stats.get("alpha_cleanup", 0)),
        "X-PF-Step-Resize-Pixels": str(step_stats.get("resize", 0)),
        "X-PF-Source-Width": str(source_width),
        "X-PF-Source-Height": str(source_height),
        "X-PF-Output-Width": str(output_width),
        "X-PF-Output-Height": str(output_height),
        "X-PF-Source-Transparent-Percent": str(source_transparent_percent),
        "X-PF-Output-Transparent-Percent": str(output_transparent_percent),
        "X-PF-Estimated-Sprite-Width": str(sprite_width),
        "X-PF-Estimated-Sprite-Height": str(sprite_height),
    }
    return _png_response(img, headers=headers)


class ComfyStatusRequest(BaseModel):
    url: str = "http://127.0.0.1:8188"





def _asset_url(asset_id: str) -> str:
    return asset_service.asset_url(asset_id)

def _load_asset(asset_id: str) -> dict:
    meta = asset_service.load(asset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Asset not found")
    return meta

def _save_asset(image_bytes: bytes, asset_type: str, **kwargs) -> dict:
    return asset_service.save_asset(image_bytes, asset_type, **kwargs)






class ExportRequest(BaseModel):
    target: Literal["godot", "aseprite"]

class ExportAssetsRequest(BaseModel):
    asset_ids: list[str]

class AssetMetadataUpdateRequest(BaseModel):
    name: str | None = None
    tags: str | list[str] | None = None
    notes: str | None = None
    favorite: bool | None = None


class CharacterGenerateRequest(BaseModel):
    comfy_url: str = "http://127.0.0.1:8188"
    recipe_id: str = "character.default"
    prompt: str
    negative_prompt: str = "photorealistic, realistic, 3D, CGI, painting, smooth shading, blurry, anti-aliased, random colored speckles, noisy texture, extra limbs, extra hands, bad anatomy, text, watermark, logo"
    seed: int = -1
    width: int = 1024
    height: int = 1024
    batch_size: int = 1
    steps: int = 24


class TileGenerateRequest(BaseModel):
    comfy_url: str = "http://127.0.0.1:8188"
    recipe_id: str = "tile.cobblestone"
    prompt: str
    negative_prompt: str = "character, person, building scene, perspective, horizon, realistic, photorealistic, blurry, anti-aliased, text, watermark, border, frame"
    seed: int = -1
    width: int = 256
    height: int = 256
    batch_size: int = 4
    steps: int = 24


@app.post("/api/comfy/status")
def comfy_status(req: ComfyStatusRequest) -> dict:
    return engine_service.comfy_status(req.url)


@app.get("/api/recipes")
def list_recipes(category: str | None = None) -> dict:
    return {"ok": True, "recipes": recipe_service.list(category)}


@app.get("/api/recipes/{category}/{name}")
def get_recipe(category: str, name: str) -> dict:
    recipe_id = f"{category}.{name}"
    try:
        return {"ok": True, "recipe": recipe_service.load(recipe_id)}
    except RecipeError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get("/api/workflows")
def list_workflows() -> dict:
    return {"ok": True, "workflows": workflow_service.list()}


@app.get("/api/workflows/character/defaults")
def character_defaults(recipe_id: str = "character.default") -> dict:
    try:
        recipe = recipe_service.load(recipe_id)
        return recipe_service.generation_defaults(recipe)
    except RecipeError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get("/api/workflows/tile/defaults")
def tile_defaults(recipe_id: str = "tile.cobblestone") -> dict:
    try:
        recipe = recipe_service.load(recipe_id)
        return recipe_service.generation_defaults(recipe)
    except RecipeError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


def _image_bytes_to_data_url(data: bytes) -> str:
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:image/png;base64,{encoded}"


@app.post("/api/generate/character")
def generate_character(req: CharacterGenerateRequest) -> dict:
    try:
        safe_sizes = {512, 768, 1024}
        if req.width != req.height or req.width not in safe_sizes:
            raise HTTPException(status_code=400, detail="Only safe square sizes are supported right now: 512, 768, or 1024.")
        recipe = recipe_service.load(req.recipe_id)
        workflow_id = recipe.get("workflow", "character")
        ui_wf = workflow_service.load(workflow_id)
        positive = recipe_service.merged_prompt(recipe, req.prompt)
        negative = recipe_service.negative_prompt(recipe, req.negative_prompt)

        # PF-0011: never send -1 into Comfy as the final stored seed.
        # Pixel Factory owns randomization so the exact seed can be saved, reused,
        # copied, and written into metadata for regeneration later.
        actual_seed = int(req.seed) if int(req.seed) >= 0 else random.randint(1, 2_147_483_647)

        patched = patch_character_workflow(
            ui_wf,
            positive=positive,
            negative=negative,
            seed=actual_seed,
            width=req.width,
            height=req.height,
            batch_size=req.batch_size,
            steps=req.steps,
        )
        api_prompt = comfy_ui_workflow_to_api(patched)
        images = engine_service.run_comfy(req.comfy_url, api_prompt, timeout_seconds=600)
        assets = [
            _save_asset(
                img,
                asset_type=recipe.get("asset_type", "character"),
                name="",
                prompt=req.prompt,
                resolved_prompt=positive,
                negative_prompt=negative,
                seed=actual_seed,
                requested_seed=req.seed,
                workflow=workflow_id,
                recipe_id=req.recipe_id,
                recipe_name=recipe.get("display_name", req.recipe_id),
                width=req.width,
                height=req.height,
                steps=req.steps,
                batch_index=i,
                engine=recipe.get("engine", "comfy"),
                export_targets=recipe.get("export_targets", ["godot", "aseprite"]),
                tags=recipe.get("tags", []),
            )
            for i, img in enumerate(images)
        ]
        workspace = None
        if images and assets:
            workspace = workspace_service.set_from_bytes(
                images[0],
                {
                    "source": "generation",
                    "asset_id": assets[0]["id"],
                    "asset_name": assets[0].get("name", "Generated asset"),
                    "asset_type": assets[0].get("type", "character"),
                    "recipe_id": req.recipe_id,
                    "recipe_name": recipe.get("display_name", req.recipe_id),
                    "workflow": workflow_id,
                    "prompt": req.prompt,
                    "width": req.width,
                    "height": req.height,
                    "seed": actual_seed,
                },
            )
        return {
            "ok": True,
            "recipe": {"id": req.recipe_id, "display_name": recipe.get("display_name", req.recipe_id)},
            "count": len(images),
            "seed": actual_seed,
            "requested_seed": req.seed,
            "images": [_image_bytes_to_data_url(img) for img in images],
            "assets": assets,
            "workspace": workspace,
        }
    except (ComfyError, WorkflowError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except RecipeError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/generate/tile")
def generate_tile(req: TileGenerateRequest) -> dict:
    try:
        safe_sizes = {256, 512, 768, 1024}
        if req.width != req.height or req.width not in safe_sizes:
            raise HTTPException(status_code=400, detail="Only safe square tile sizes are supported right now: 256, 512, 768, or 1024.")
        recipe = recipe_service.load(req.recipe_id)
        workflow_id = recipe.get("workflow", "tile")
        ui_wf = workflow_service.load(workflow_id)
        positive = recipe_service.merged_prompt(recipe, req.prompt)
        negative = recipe_service.negative_prompt(recipe, req.negative_prompt)

        actual_seed = int(req.seed) if int(req.seed) >= 0 else random.randint(1, 2_147_483_647)

        patched = patch_character_workflow(
            ui_wf,
            positive=positive,
            negative=negative,
            seed=actual_seed,
            width=req.width,
            height=req.height,
            batch_size=req.batch_size,
            steps=req.steps,
        )
        api_prompt = comfy_ui_workflow_to_api(patched)
        images = engine_service.run_comfy(req.comfy_url, api_prompt, timeout_seconds=600)
        assets = [
            _save_asset(
                img,
                asset_type=recipe.get("asset_type", "tile"),
                name="",
                prompt=req.prompt,
                resolved_prompt=positive,
                negative_prompt=negative,
                seed=actual_seed,
                requested_seed=req.seed,
                workflow=workflow_id,
                recipe_id=req.recipe_id,
                recipe_name=recipe.get("display_name", req.recipe_id),
                width=req.width,
                height=req.height,
                steps=req.steps,
                batch_index=i,
                engine=recipe.get("engine", "comfy"),
                export_targets=recipe.get("export_targets", ["godot", "aseprite"]),
                tags=recipe.get("tags", ["tile"]),
            )
            for i, img in enumerate(images)
        ]
        workspace = None
        if images and assets:
            workspace = workspace_service.set_from_bytes(
                images[0],
                {
                    "source": "tile_generation",
                    "asset_id": assets[0]["id"],
                    "asset_name": assets[0].get("name", "Generated tile"),
                    "asset_type": assets[0].get("type", "tile"),
                    "recipe_id": req.recipe_id,
                    "recipe_name": recipe.get("display_name", req.recipe_id),
                    "workflow": workflow_id,
                    "prompt": req.prompt,
                    "width": req.width,
                    "height": req.height,
                    "seed": actual_seed,
                },
            )
        return {
            "ok": True,
            "recipe": {"id": req.recipe_id, "display_name": recipe.get("display_name", req.recipe_id)},
            "count": len(images),
            "seed": actual_seed,
            "requested_seed": req.seed,
            "images": [_image_bytes_to_data_url(img) for img in images],
            "assets": assets,
            "workspace": workspace,
        }
    except (ComfyError, WorkflowError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except RecipeError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/assets")
def list_assets(status: str | None = None, asset_type: str | None = None, favorite: bool = False) -> dict:
    assets = asset_service.list(status=status, asset_type=asset_type, favorite=favorite)
    return {"ok": True, "count": len(assets), "assets": assets}


@app.get("/api/assets/{asset_id}")
def get_asset(asset_id: str) -> dict:
    return _load_asset(asset_id)


@app.get("/api/assets/{asset_id}/image")
def get_asset_image(asset_id: str) -> Response:
    image_path = asset_service.image_path(asset_id)
    if not image_path or not image_path.exists():
        raise HTTPException(status_code=404, detail="Asset image missing")
    return Response(content=image_path.read_bytes(), media_type="image/png")






@app.post("/api/assets/from-palette")
async def save_palette_result(
    image: UploadFile = File(...),
    asset_type: str = Form("repair"),
    source_asset_id: str = Form(""),
    source_asset_name: str = Form(""),
    operation: str = Form("palette_lab"),
    palette_colors: int = Form(0),
    resize_scale: int = Form(1),
    pixel_size: int = Form(0),
    pixel_strength: float = Form(1.0),
    accept: bool = Form(False),
) -> dict:
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="No processed image supplied")

    safe_type = str(asset_type or "repair").strip().lower()
    if safe_type in {"—", "upload", "manual", "asset"}:
        safe_type = "repair"

    base_name = str(source_asset_name or "palette_lab_result").replace(".png", "")
    meta = _save_asset(
        data,
        asset_type=safe_type,
        name=f"{base_name}_clean",
        prompt=f"Palette Lab processed result from {base_name}",
        workflow="palette_lab",
        recipe_id="palette_lab.pixel_cleanup",
        recipe_name="Palette Lab Cleanup",
        source_asset_id=source_asset_id or None,
        source_asset_name=source_asset_name or None,
        operation=operation,
        palette_colors=palette_colors,
        resize_scale=resize_scale,
        pixel_size=pixel_size,
        pixel_strength=pixel_strength,
        engine="pixel_factory",
        tags=["palette-lab", "processed", "pixel-cleanup", safe_type],
    )
    if accept:
        accepted = asset_service.accept(meta["id"])
        if accepted:
            meta = accepted
    return {"ok": True, "asset": meta}


@app.post("/api/assets/{asset_id}/palette-save")
async def save_palette_edit(
    asset_id: str,
    image: UploadFile = File(...),
    operation: str = Form("palette_lab"),
    palette_colors: int = Form(0),
    resize_scale: int = Form(1),
    pixel_size: int = Form(0),
    pixel_strength: float = Form(1.0),
) -> dict:
    current_meta = asset_service.load(asset_id)
    if not current_meta:
        raise HTTPException(status_code=404, detail="Palette Lab save target not found")
    if str(current_meta.get("status", "")).lower() != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted assets can be overwritten. Use Save As to create an accepted cleaned asset.")

    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="No processed image supplied")
    edit_meta = {
        "operation": operation,
        "palette_colors": int(palette_colors),
        "resize_scale": int(resize_scale),
        "pixel_size": int(pixel_size),
        "pixel_strength": float(pixel_strength),
    }
    meta = asset_service.overwrite_asset_image(asset_id, data, edit_meta)
    if not meta:
        raise HTTPException(status_code=404, detail="Palette Lab save target not found")
    return {"ok": True, "asset": meta}


@app.post("/api/assets/palette-save-as")
async def save_palette_edit_as(
    image: UploadFile = File(...),
    name: str = Form(""),
    asset_type: str = Form("repair"),
    source_asset_id: str = Form(""),
    source_asset_name: str = Form(""),
    operation: str = Form("palette_lab"),
    palette_colors: int = Form(0),
    resize_scale: int = Form(1),
    pixel_size: int = Form(0),
    pixel_strength: float = Form(1.0),
) -> dict:
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="No processed image supplied")
    edit_meta = {
        "source_asset_name": source_asset_name,
        "operation": operation,
        "palette_colors": int(palette_colors),
        "resize_scale": int(resize_scale),
        "pixel_size": int(pixel_size),
        "pixel_strength": float(pixel_strength),
    }
    meta = asset_service.save_palette_variant(
        data,
        source_asset_id=source_asset_id,
        name=name,
        asset_type=asset_type,
        edit_meta=edit_meta,
    )
    return {"ok": True, "asset": meta}

@app.patch("/api/assets/{asset_id}/metadata")
def update_asset_metadata(asset_id: str, req: AssetMetadataUpdateRequest) -> dict:
    changes = {k: v for k, v in req.model_dump().items() if v is not None}
    meta = asset_service.update_metadata(asset_id, changes)
    if not meta:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"ok": True, "asset": meta}


@app.post("/api/assets/{asset_id}/accept")
def accept_asset(asset_id: str) -> dict:
    meta = asset_service.accept(asset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Asset not found or image missing")
    return {"ok": True, "asset": meta}


@app.get("/api/workspace")
def get_workspace() -> dict:
    return {"ok": True, "workspace": workspace_service.get()}


@app.get("/api/workspace/image")
def get_workspace_image() -> Response:
    image_path = workspace_service.image_path()
    if not image_path or not image_path.exists():
        raise HTTPException(status_code=404, detail="Workspace image missing")
    return Response(content=image_path.read_bytes(), media_type="image/png")


@app.post("/api/workspace/from-asset/{asset_id}")
def workspace_from_asset(asset_id: str) -> dict:
    meta = _load_asset(asset_id)
    image_path = asset_service.image_path(asset_id)
    if not image_path or not image_path.exists():
        raise HTTPException(status_code=404, detail="Asset image missing")
    workspace = workspace_service.set_from_asset(meta, image_path)
    return {"ok": True, "workspace": workspace}


@app.post("/api/workspace/clear")
def clear_workspace() -> dict:
    return {"ok": True, "workspace": workspace_service.clear()}



def _clear_candidate_assets() -> dict:
    result = asset_service.delete_candidates()

    # If the current workspace came from one of the deleted candidates, clear it
    # so Palette Lab does not keep previewing a stale candidate.
    workspace = workspace_service.get()
    if workspace.get("asset_id") in result.get("deleted_ids", []):
        workspace_service.clear()
        result["workspace_cleared"] = True
    else:
        result["workspace_cleared"] = False

    return {"ok": True, **result}



@app.post("/api/assets/clear-candidates")
def clear_candidate_assets_short_route() -> dict:
    # Explicit non-nested route used by the frontend so it cannot be confused
    # with individual asset routes during local testing/cache mismatches.
    return _clear_candidate_assets()

@app.post("/api/assets/candidates/clear")
def clear_candidate_assets() -> dict:
    return _clear_candidate_assets()


@app.delete("/api/assets/candidates")
def delete_candidate_assets() -> dict:
    # Backward-compatible route kept for any older UI code.
    return _clear_candidate_assets()

@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: str) -> dict:
    if not asset_service.delete(asset_id):
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"ok": True, "deleted": asset_id}


@app.get("/api/exports")
def export_status() -> dict:
    return export_service.status()


@app.post("/api/assets/{asset_id}/export")
def export_asset(asset_id: str, req: ExportRequest) -> dict:
    try:
        return export_service.export_asset(asset_id, req.target)
    except ExportError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/exports/{target}/assets")
def export_selected_assets(target: Literal["godot", "aseprite"], req: ExportAssetsRequest) -> dict:
    try:
        return export_service.export_assets(req.asset_ids, target)
    except ExportError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/exports/{target}/accepted")
def export_accepted_assets(target: Literal["godot", "aseprite"]) -> dict:
    try:
        return export_service.export_accepted(target)
    except ExportError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
