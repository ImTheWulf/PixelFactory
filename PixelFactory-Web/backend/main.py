from __future__ import annotations

import base64
import io
import json
import random
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel

from backend.comfy.client import ComfyError, comfy_ui_workflow_to_api, patch_character_workflow
from backend.services.asset_service import AssetService
from backend.services.engine_service import EngineService
from backend.services.export_service import ExportError, ExportService
from backend.services.recipe_service import RecipeError, RecipeService
from backend.services.workflow_service import WorkflowError, WorkflowService
from backend.services.workspace_service import WorkspaceService

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

app = FastAPI(title="Pixel Factory by Wulf", version="0.16-pf0018.6-palette-color-cleanup")
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


def _png_response(img: Image.Image) -> Response:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")



def _auto_pixel_size(width: int, height: int) -> int:
    """Small local Pixel Snapper-style heuristic for AI pixel-art cleanup.

    This is not the upstream Sprite Fusion WASM/Rust implementation yet. It is a
    lightweight foundation that gives Palette Lab a usable snap-to-grid pass while
    leaving room to vendor the real MIT Pixel Snapper engine later.
    """
    smallest = max(1, min(width, height))
    if smallest >= 1024:
        return 32
    if smallest >= 512:
        return 16
    if smallest >= 256:
        return 8
    if smallest >= 128:
        return 4
    return 2


def _quantize_rgba(img: Image.Image, colors: int) -> Image.Image:
    colors = int(colors or 0)
    if colors <= 0:
        return img.copy()
    colors = max(2, min(256, colors))
    alpha = img.getchannel("A")
    rgb = img.convert("RGB")
    quantized = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    out = quantized.convert("RGBA")
    out.putalpha(alpha)
    return out


def _pixel_snap_rgba(
    img: Image.Image,
    *,
    pixel_size: int = 0,
    palette_colors: int = 64,
    quantize: bool = True,
) -> Image.Image:
    """Snap uneven AI pixels to a coarse grid, then restore with NEAREST.

    Conceptually follows the Pixel Snapper goal: consistent pixel grid + optional
    strict palette. It downsamples to grid cells, optionally quantizes, then
    nearest-neighbor upscales back to the original size.
    """
    w, h = img.size
    px = int(pixel_size or 0)
    if px <= 0:
        px = _auto_pixel_size(w, h)
    px = max(1, min(px, max(1, min(w, h) // 2)))

    snapped_w = max(1, round(w / px))
    snapped_h = max(1, round(h / px))
    small = img.resize((snapped_w, snapped_h), Image.Resampling.BOX)
    if quantize:
        small = _quantize_rgba(small, palette_colors)
    return small.resize((w, h), Image.Resampling.NEAREST)


@app.post("/api/process")
async def process_image(
    image: UploadFile = File(...),
    resize_scale: int = Form(1),
    palette_colors: int = Form(0),
    operation: str = Form("resize_palette"),
    pixel_size: int = Form(0),
    pixel_strength: float = Form(1.0),
    snap_palette: bool = Form(True),
    preserve_alpha: bool = Form(True),
) -> Response:
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
    palette_colors = max(0, min(256, int(palette_colors or 0)))
    pixel_size = max(0, int(pixel_size or 0))
    pixel_strength = max(0.0, min(1.0, float(pixel_strength or 1.0)))

    original = img.copy()

    if operation == "pixel_snap":
        img = _pixel_snap_rgba(img, pixel_size=pixel_size, palette_colors=palette_colors, quantize=bool(snap_palette) and palette_colors > 0)
    elif operation == "pixel_snap_only":
        img = _pixel_snap_rgba(img, pixel_size=pixel_size, palette_colors=palette_colors, quantize=False)
    elif operation in {"palette", "resize_palette"}:
        img = _quantize_rgba(img, palette_colors)

    if operation.startswith("pixel_snap") and pixel_strength < 0.999:
        img = Image.blend(original, img, pixel_strength)

    if preserve_alpha and img.mode == "RGBA":
        img.putalpha(original.getchannel("A"))

    if operation in {"resize", "resize_palette", "pixel_snap"} and resize_scale > 1:
        w, h = img.size
        img = img.resize((w * resize_scale, h * resize_scale), Image.Resampling.NEAREST)

    return _png_response(img)


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
