from __future__ import annotations

import base64
import io
import json
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

app = FastAPI(title="Pixel Factory by Wulf", version="0.8-pf0008-workspace")
app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (TEMPLATES / "index.html").read_text(encoding="utf-8")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": "Pixel Factory Web", "version": "0.8", "milestone": "PF-0008 Workspace Pipeline"}


def _read_image(data: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(data))
    return img.convert("RGBA")


def _png_response(img: Image.Image) -> Response:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")


@app.post("/api/process")
async def process_image(
    image: UploadFile = File(...),
    resize_scale: int = Form(1),
    palette_colors: int = Form(64),
    operation: Literal["resize", "palette", "resize_palette"] = Form("resize_palette"),
) -> Response:
    data = await image.read()
    img = _read_image(data)

    if operation in {"palette", "resize_palette"}:
        alpha = img.getchannel("A")
        rgb = img.convert("RGB")
        quantized = rgb.quantize(colors=max(2, min(256, palette_colors)), method=Image.Quantize.MEDIANCUT)
        img = quantized.convert("RGBA")
        img.putalpha(alpha)

    if operation in {"resize", "resize_palette"} and resize_scale > 1:
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


def _image_bytes_to_data_url(data: bytes) -> str:
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:image/png;base64,{encoded}"


@app.post("/api/generate/character")
def generate_character(req: CharacterGenerateRequest) -> dict:
    try:
        recipe = recipe_service.load(req.recipe_id)
        workflow_id = recipe.get("workflow", "character")
        ui_wf = workflow_service.load(workflow_id)
        positive = recipe_service.merged_prompt(recipe, req.prompt)
        negative = recipe_service.negative_prompt(recipe, req.negative_prompt)
        patched = patch_character_workflow(
            ui_wf,
            positive=positive,
            negative=negative,
            seed=req.seed,
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
                seed=req.seed,
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
                },
            )
        return {
            "ok": True,
            "recipe": {"id": req.recipe_id, "display_name": recipe.get("display_name", req.recipe_id)},
            "count": len(images),
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
def list_assets(status: str | None = None, asset_type: str | None = None) -> dict:
    assets = asset_service.list(status=status, asset_type=asset_type)
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


@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: str) -> dict:
    if not asset_service.delete(asset_id):
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"ok": True, "deleted": asset_id}
