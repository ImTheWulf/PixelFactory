from __future__ import annotations

import base64
import io
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

app = FastAPI(title="Pixel Factory by Wulf", version="0.5-web")
app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (TEMPLATES / "index.html").read_text(encoding="utf-8")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": "Pixel Factory Web", "version": "0.5"}


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
        return {"ok": True, "count": len(images), "images": [_image_bytes_to_data_url(img) for img in images]}
    except ComfyError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
