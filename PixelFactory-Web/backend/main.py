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

from backend.comfy.client import ComfyClient, ComfyError, comfy_ui_workflow_to_api, load_workflow, patch_character_workflow

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
STATIC = FRONTEND / "static"
TEMPLATES = FRONTEND / "templates"
WORKFLOWS = ROOT / "workflows"
PROJECT_ROOT = ROOT.parent / "PixelFactory-Projects" / "default"
INCOMING = PROJECT_ROOT / "Incoming"
ACCEPTED = PROJECT_ROOT / "Accepted"
METADATA = PROJECT_ROOT / "metadata"
for _p in [INCOMING / "Characters", INCOMING / "Tiles", INCOMING / "Repairs", ACCEPTED / "Characters", ACCEPTED / "Tiles", ACCEPTED / "Repairs", METADATA]:
    _p.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Pixel Factory by Wulf", version="0.6-web")
app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (TEMPLATES / "index.html").read_text(encoding="utf-8")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": "Pixel Factory Web", "version": "0.6"}


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




def _slug(text: str, fallback: str = "asset") -> str:
    safe = "".join(ch.lower() if ch.isalnum() else "_" for ch in text.strip())
    safe = "_".join(part for part in safe.split("_") if part)
    return (safe[:48] or fallback)


def _asset_rel_path(path: Path) -> str:
    return path.relative_to(PROJECT_ROOT).as_posix()


def _asset_url(asset_id: str) -> str:
    return f"/api/assets/{asset_id}/image"


def _metadata_path(asset_id: str) -> Path:
    return METADATA / f"{asset_id}.json"


def _save_asset(
    image_bytes: bytes,
    asset_type: str,
    prompt: str = "",
    negative_prompt: str = "",
    seed: int = -1,
    workflow: str = "character",
    width: int | None = None,
    height: int | None = None,
    steps: int | None = None,
    batch_index: int = 0,
) -> dict:
    asset_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    name = f"{_slug(prompt, asset_type)}_{batch_index + 1:02d}"
    folder = INCOMING / ("Characters" if asset_type == "character" else asset_type.capitalize())
    folder.mkdir(parents=True, exist_ok=True)
    image_path = folder / f"{asset_id}.png"
    image_path.write_bytes(image_bytes)
    meta = {
        "id": asset_id,
        "name": name,
        "type": asset_type,
        "status": "incoming",
        "image_path": _asset_rel_path(image_path),
        "created": datetime.now().isoformat(timespec="seconds"),
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "workflow": workflow,
        "width": width,
        "height": height,
        "steps": steps,
        "batch_index": batch_index,
    }
    _metadata_path(asset_id).write_text(json.dumps(meta, indent=2), encoding="utf-8")
    meta["image_url"] = _asset_url(asset_id)
    return meta


def _load_asset(asset_id: str) -> dict:
    path = _metadata_path(asset_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Asset not found")
    meta = json.loads(path.read_text(encoding="utf-8"))
    meta["image_url"] = _asset_url(asset_id)
    return meta

class CharacterGenerateRequest(BaseModel):
    comfy_url: str = "http://127.0.0.1:8188"
    prompt: str
    negative_prompt: str = "photorealistic, realistic, 3D, CGI, painting, smooth shading, blurry, anti-aliased, random colored speckles, noisy texture, extra limbs, extra hands, bad anatomy, text, watermark, logo"
    seed: int = -1
    width: int = 1024
    height: int = 1024
    batch_size: int = 1
    steps: int = 24


@app.post("/api/comfy/status")
def comfy_status(req: ComfyStatusRequest) -> dict:
    return ComfyClient(req.url).status()


@app.get("/api/workflows/character/defaults")
def character_defaults() -> dict:
    wf = load_workflow(WORKFLOWS / "character.json")
    result = {"positive": "", "negative": "", "width": 1024, "height": 1024, "batch_size": 1, "steps": 24}
    for node in wf.get("nodes", []):
        title = node.get("title", "")
        widgets = node.get("widgets_values") or []
        if node.get("type") == "CLIPTextEncode" and "Positive" in title:
            result["positive"] = widgets[0]
        if node.get("type") == "CLIPTextEncode" and "Negative" in title:
            result["negative"] = widgets[0]
        if node.get("type") == "EmptyLatentImage":
            result["width"], result["height"], result["batch_size"] = widgets[:3]
        if node.get("type") == "KSampler":
            result["steps"] = widgets[2]
    return result


def _image_bytes_to_data_url(data: bytes) -> str:
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:image/png;base64,{encoded}"


@app.post("/api/generate/character")
def generate_character(req: CharacterGenerateRequest) -> dict:
    try:
        ui_wf = load_workflow(WORKFLOWS / "character.json")
        patched = patch_character_workflow(
            ui_wf,
            positive=req.prompt,
            negative=req.negative_prompt,
            seed=req.seed,
            width=req.width,
            height=req.height,
            batch_size=req.batch_size,
            steps=req.steps,
        )
        api_prompt = comfy_ui_workflow_to_api(patched)
        images = ComfyClient(req.comfy_url).run_prompt_and_get_images(api_prompt, timeout_seconds=600)
        assets = [
            _save_asset(
                img,
                asset_type="character",
                prompt=req.prompt,
                negative_prompt=req.negative_prompt,
                seed=req.seed,
                workflow="character",
                width=req.width,
                height=req.height,
                steps=req.steps,
                batch_index=i,
            )
            for i, img in enumerate(images)
        ]
        return {
            "ok": True,
            "count": len(images),
            "images": [_image_bytes_to_data_url(img) for img in images],
            "assets": assets,
        }
    except ComfyError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/assets")
def list_assets(status: str | None = None, asset_type: str | None = None) -> dict:
    assets = []
    for path in sorted(METADATA.glob("*.json"), reverse=True):
        try:
            meta = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        if status and meta.get("status") != status:
            continue
        if asset_type and meta.get("type") != asset_type:
            continue
        meta["image_url"] = _asset_url(meta["id"])
        assets.append(meta)
    return {"ok": True, "count": len(assets), "assets": assets}


@app.get("/api/assets/{asset_id}")
def get_asset(asset_id: str) -> dict:
    return _load_asset(asset_id)


@app.get("/api/assets/{asset_id}/image")
def get_asset_image(asset_id: str) -> Response:
    meta = _load_asset(asset_id)
    image_path = PROJECT_ROOT / meta["image_path"]
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Asset image missing")
    return Response(content=image_path.read_bytes(), media_type="image/png")


@app.post("/api/assets/{asset_id}/accept")
def accept_asset(asset_id: str) -> dict:
    meta = _load_asset(asset_id)
    old_path = PROJECT_ROOT / meta["image_path"]
    if not old_path.exists():
        raise HTTPException(status_code=404, detail="Asset image missing")
    target_folder = ACCEPTED / ("Characters" if meta.get("type") == "character" else str(meta.get("type", "Assets")).capitalize())
    target_folder.mkdir(parents=True, exist_ok=True)
    new_path = target_folder / old_path.name
    if old_path.resolve() != new_path.resolve():
        shutil.copy2(old_path, new_path)
    meta["status"] = "accepted"
    meta["accepted"] = datetime.now().isoformat(timespec="seconds")
    meta["accepted_image_path"] = _asset_rel_path(new_path)
    _metadata_path(asset_id).write_text(json.dumps({k:v for k,v in meta.items() if k != "image_url"}, indent=2), encoding="utf-8")
    meta["image_url"] = _asset_url(asset_id)
    return {"ok": True, "asset": meta}


@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: str) -> dict:
    meta = _load_asset(asset_id)
    for key in ["image_path", "accepted_image_path"]:
        value = meta.get(key)
        if value:
            path = PROJECT_ROOT / value
            if path.exists():
                path.unlink()
    mp = _metadata_path(asset_id)
    if mp.exists():
        mp.unlink()
    return {"ok": True, "deleted": asset_id}
