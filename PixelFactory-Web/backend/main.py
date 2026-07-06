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

app = FastAPI(title="Pixel Factory by Wulf", version="0.22-pf0031-morphology-cleanup-v1")
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



def _auto_pixel_size(width: int, height: int) -> int:
    """Fallback pixel-size guess for Palette Lab's native Pixel Snap pass."""
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


def _candidate_pixel_sizes(width: int, height: int) -> list[int]:
    smallest = max(1, min(width, height))
    return [px for px in (2, 4, 8, 16, 32, 64) if px <= max(1, smallest // 2)] or [1]


def _reconstruction_error(img: Image.Image, pixel_size: int) -> float:
    """Score how well an image survives a snap/downsample/rebuild at a size.

    This is intentionally native and local. It follows the Pixel Snapper idea of
    finding the grid that best represents the artwork, without depending on the
    Sprite Fusion UI, WASM bundle, or a second server.
    """
    w, h = img.size
    px = max(1, int(pixel_size or 1))
    sw = max(1, round(w / px))
    sh = max(1, round(h / px))
    small = img.resize((sw, sh), Image.Resampling.BOX)
    rebuilt = small.resize((w, h), Image.Resampling.NEAREST)
    diff = ImageChops.difference(img.convert("RGB"), rebuilt.convert("RGB"))
    stat = ImageStat.Stat(diff)
    return float(sum(stat.mean) / max(1, len(stat.mean)))


def _detect_pixel_size(img: Image.Image, override: int = 0) -> tuple[int, int]:
    """Return detected grid size and a readable confidence score.

    Manual override always wins. Auto mode compares several grid candidates and
    blends reconstruction error with the size-based fallback so Auto stays stable
    on noisy AI output but can still improve when a clearer grid is present.
    """
    w, h = img.size
    smallest = max(1, min(w, h))
    if override and override > 0:
        px = max(1, min(int(override), max(1, smallest // 2)))
        confidence = 94 if (w % px == 0 and h % px == 0) else 82
        return px, confidence

    fallback = _auto_pixel_size(w, h)
    candidates = _candidate_pixel_sizes(w, h)
    scored: list[tuple[float, int, float]] = []
    for px in candidates:
        error = _reconstruction_error(img, px)
        fallback_penalty = abs(math.log2(max(px, 1) / max(fallback, 1))) * 4.0
        small_grid_penalty = max(0.0, 3.0 - math.log2(max(px, 2))) * 1.25
        scored.append((error + fallback_penalty + small_grid_penalty, px, error))

    scored.sort(key=lambda item: item[0])
    best_score, best_px, best_error = scored[0]
    second_score = scored[1][0] if len(scored) > 1 else best_score + 8.0
    margin = max(0.0, second_score - best_score)
    confidence = int(max(35, min(98, 96 - best_error * 1.7 + margin * 2.5)))
    return best_px, confidence



def _rgba_color_count(img: Image.Image, limit: int = 100000) -> int:
    """Count unique RGBA colors with a safe cap for UI diagnostics."""
    try:
        colors = img.convert("RGBA").getcolors(maxcolors=limit)
        if colors is None:
            return limit
        return len(colors)
    except Exception:
        return 0




def _transparent_pixel_percent(img: Image.Image) -> float:
    """Return transparent pixel percentage for UI metadata."""
    try:
        rgba = img.convert("RGBA")
        total = max(1, rgba.size[0] * rgba.size[1])
        transparent = sum(1 for _r, _g, _b, a in rgba.getdata() if a < 255)
        return round((transparent / total) * 100.0, 2)
    except Exception:
        return 0.0

def _changed_pixel_stats(before: Image.Image, after: Image.Image) -> tuple[int, float]:
    """Return changed pixel count and percentage between two same-size previews."""
    if before.size != after.size:
        before = before.resize(after.size, Image.Resampling.NEAREST)
    b = before.convert("RGBA")
    a = after.convert("RGBA")
    changed = 0
    total = max(1, a.size[0] * a.size[1])
    for bp, ap in zip(b.getdata(), a.getdata()):
        if bp != ap:
            changed += 1
    return changed, round((changed / total) * 100.0, 2)


def _match_alpha_size(alpha: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Resize an alpha channel to match the current processing image safely."""
    return alpha if alpha.size == size else alpha.resize(size, Image.Resampling.NEAREST)

def _blend_with_matching_size(base: Image.Image, overlay: Image.Image, amount: float) -> Image.Image:
    """Blend while resizing the base image when earlier stages changed dimensions."""
    if base.size != overlay.size:
        base = base.resize(overlay.size, Image.Resampling.NEAREST)
    return Image.blend(base.convert("RGBA"), overlay.convert("RGBA"), amount)


def _alpha_cleanup_rgba(img: Image.Image, *, threshold: int = 12) -> Image.Image:
    """Clean weak transparency fringes without changing RGB artwork.

    Native Pixel Factory alpha cleanup inspired by the unfake.js cleanup
    direction: near-transparent pixels are removed and nearly-opaque pixels are
    hardened. Mid-alpha pixels are preserved so soft intentional transparency is
    not destroyed.
    """
    threshold = max(0, min(96, int(threshold or 0)))
    if threshold <= 0:
        return img.copy()
    src = img.convert("RGBA")
    out_pixels = []
    low = threshold
    high = 255 - threshold
    for r, g, b, a in src.getdata():
        if a <= low:
            out_pixels.append((r, g, b, 0))
        elif a >= high:
            out_pixels.append((r, g, b, 255))
        else:
            out_pixels.append((r, g, b, a))
    out = Image.new("RGBA", src.size)
    out.putdata(out_pixels)
    return out

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


def _smart_downscale_rgba(
    img: Image.Image,
    *,
    pixel_size: int = 0,
    palette_colors: int = 0,
    quantize: bool = False,
) -> Image.Image:
    """Normalize oversized pixel-art sources down to the detected sprite grid.

    PF-0027 keeps this opt-in and conservative: the detected grid becomes the
    divisor, BOX sampling chooses a stable representative color per cell, and
    optional palette quantize can be applied to the normalized sprite. The normal
    resize control can then upscale the clean sprite back out with NEAREST.
    """
    w, h = img.size
    px, _confidence = _detect_pixel_size(img, int(pixel_size or 0))
    px = max(1, min(px, max(1, min(w, h) // 2)))
    if px <= 1:
        return img.copy()
    down_w = max(1, round(w / px))
    down_h = max(1, round(h / px))
    out = img.resize((down_w, down_h), Image.Resampling.BOX)
    if quantize and int(palette_colors or 0) > 0:
        out = _quantize_rgba(out, palette_colors)
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
    px, _confidence = _detect_pixel_size(img, int(pixel_size or 0))
    px = max(1, min(px, max(1, min(w, h) // 2)))

    snapped_w = max(1, round(w / px))
    snapped_h = max(1, round(h / px))
    small = img.resize((snapped_w, snapped_h), Image.Resampling.BOX)
    if quantize:
        small = _quantize_rgba(small, palette_colors)
    return small.resize((w, h), Image.Resampling.NEAREST)



def _palette_normalize_rgba(img: Image.Image, *, tolerance: int = 8) -> Image.Image:
    """Merge near-identical colors without forcing a small palette count.

    This is different from quantize/reduce. It keeps the artwork's general
    palette size and style, but collapses tiny AI color variations into a
    cleaner, more production-friendly palette. Alpha is preserved.
    """
    tolerance = max(1, min(64, int(tolerance or 8)))
    src = img.convert("RGBA")
    w, h = src.size
    pixels = list(src.getdata())
    # Bucket similar RGB colors. Alpha stays separate so transparency edges are
    # not accidentally filled or erased by palette normalization.
    buckets: dict[tuple[int, int, int], list[int]] = {}
    for idx, (r, g, b, a) in enumerate(pixels):
        if a <= 0:
            continue
        key = (r // tolerance, g // tolerance, b // tolerance)
        buckets.setdefault(key, []).append(idx)

    if not buckets:
        return src

    out_pixels = pixels[:]
    for indexes in buckets.values():
        if len(indexes) < 2:
            continue
        # Use the average color as the clean representative for this small cluster.
        total_r = total_g = total_b = 0
        for idx in indexes:
            r, g, b, _a = pixels[idx]
            total_r += r
            total_g += g
            total_b += b
        count = len(indexes)
        nr = int(round(total_r / count))
        ng = int(round(total_g / count))
        nb = int(round(total_b / count))
        for idx in indexes:
            _r, _g, _b, a = pixels[idx]
            out_pixels[idx] = (nr, ng, nb, a)

    out = Image.new("RGBA", (w, h))
    out.putdata(out_pixels)
    return out


def _morphology_cleanup_rgba(img: Image.Image, *, strength: float = 0.35) -> Image.Image:
    """Conservative pixel-art morphology cleanup.

    This pass is inspired by the unfake.js cleanup direction but implemented
    natively for PixelFactory: it removes isolated opaque specks and fills tiny
    one-pixel transparent holes when the surrounding neighborhood clearly votes
    for a local color. It avoids blur and only changes single-pixel defects.
    """
    strength = max(0.0, min(1.0, float(strength or 0.0)))
    if strength <= 0:
        return img.copy()

    src = img.convert("RGBA")
    w, h = src.size
    if w < 3 or h < 3:
        return src.copy()

    out = src.copy()
    pix = src.load()
    outpix = out.load()
    alpha_cutoff = 12
    min_same = 2 if strength >= 0.70 else 1
    fill_required = 6 if strength < 0.50 else 5
    max_changes = int(max(250, w * h * (0.004 + strength * 0.018)))
    changed = 0

    def close_rgb(a, b, tol=28):
        return abs(a[0] - b[0]) <= tol and abs(a[1] - b[1]) <= tol and abs(a[2] - b[2]) <= tol

    for y in range(1, h - 1):
        for x in range(1, w - 1):
            center = pix[x, y]
            neighbors = [
                pix[x - 1, y - 1], pix[x, y - 1], pix[x + 1, y - 1],
                pix[x - 1, y],                     pix[x + 1, y],
                pix[x - 1, y + 1], pix[x, y + 1], pix[x + 1, y + 1],
            ]
            opaque_neighbors = [c for c in neighbors if c[3] > alpha_cutoff]

            # Remove isolated visible specks surrounded by transparent/empty space.
            if center[3] > alpha_cutoff:
                similar = sum(1 for c in opaque_neighbors if close_rgb(c, center))
                if len(opaque_neighbors) <= min_same and similar <= min_same:
                    outpix[x, y] = (center[0], center[1], center[2], 0)
                    changed += 1
            # Fill pinholes only when a strong local color consensus exists.
            elif len(opaque_neighbors) >= fill_required:
                buckets: dict[tuple[int, int, int], list[tuple[int, int, int, int]]] = {}
                for c in opaque_neighbors:
                    key = (c[0] // 16, c[1] // 16, c[2] // 16)
                    buckets.setdefault(key, []).append(c)
                _key, votes = max(buckets.items(), key=lambda item: len(item[1]))
                if len(votes) >= fill_required:
                    avg = tuple(int(round(sum(c[i] for c in votes) / len(votes))) for i in range(4))
                    outpix[x, y] = (avg[0], avg[1], avg[2], max(220, avg[3]))
                    changed += 1

            if changed >= max_changes:
                return out
    return out

def _orphan_cleanup_rgba(img: Image.Image, *, sensitivity: float = 0.35) -> Image.Image:
    """Remove tiny isolated color artifacts without acting like a blur/filter.

    Conservative by design: only replaces a pixel when its 8-neighbor area strongly
    agrees on a different replacement color. This is intended as the first native
    Repair Pipeline stage after Pixel Snap, not a general denoise filter.
    """
    sensitivity = max(0.0, min(1.0, float(sensitivity or 0.0)))
    if sensitivity <= 0:
        return img.copy()
    src = img.convert("RGBA")
    w, h = src.size
    if w < 3 or h < 3:
        return src
    pix = src.load()
    out = src.copy()
    outpix = out.load()
    # Higher sensitivity means fewer agreeing neighbors required.
    required = 6 if sensitivity < 0.34 else 5 if sensitivity < 0.67 else 4
    alpha_threshold = 12
    changed = 0
    max_changes = max(1, int(w * h * 0.08))
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            center = pix[x, y]
            if center[3] <= alpha_threshold:
                continue
            counts = {}
            opaque_neighbors = 0
            same_neighbors = 0
            for yy in (y - 1, y, y + 1):
                for xx in (x - 1, x, x + 1):
                    if xx == x and yy == y:
                        continue
                    col = pix[xx, yy]
                    if col[3] <= alpha_threshold:
                        continue
                    opaque_neighbors += 1
                    if col == center:
                        same_neighbors += 1
                    counts[col] = counts.get(col, 0) + 1
            if opaque_neighbors < required or same_neighbors > 1 or not counts:
                continue
            replacement, amount = max(counts.items(), key=lambda item: item[1])
            if replacement != center and amount >= required:
                outpix[x, y] = replacement
                changed += 1
                if changed >= max_changes:
                    return out
    return out


def _edge_cleanup_rgba(img: Image.Image, *, strength: float = 0.30) -> Image.Image:
    """Clean small jaggy/stair-step edge artifacts without blurring the asset.

    Inspired by unfake.js' artifact cleanup direction, but implemented natively
    for Pixel Factory. This is intentionally conservative: it only replaces a
    pixel when the local 8-neighbor area strongly agrees on a different color.
    It works best after Pixel Snap / Palette Normalize because nearby pixels are
    already clustered into cleaner colors.
    """
    strength = max(0.0, min(1.0, float(strength or 0.0)))
    if strength <= 0:
        return img.copy()
    src = img.convert("RGBA")
    w, h = src.size
    if w < 3 or h < 3:
        return src

    pix = src.load()
    out = src.copy()
    outpix = out.load()
    alpha_threshold = 16
    # Conservative threshold at low strengths, stronger cleanup at higher values.
    required = 6 if strength < 0.34 else 5 if strength < 0.67 else 4
    max_changes = max(1, int(w * h * (0.025 + strength * 0.075)))
    changed = 0

    def close_rgb(a: tuple[int, int, int, int], b: tuple[int, int, int, int], tol: int = 10) -> bool:
        if a[3] <= alpha_threshold or b[3] <= alpha_threshold:
            return a[3] <= alpha_threshold and b[3] <= alpha_threshold
        return abs(a[0] - b[0]) <= tol and abs(a[1] - b[1]) <= tol and abs(a[2] - b[2]) <= tol

    for y in range(1, h - 1):
        for x in range(1, w - 1):
            center = pix[x, y]
            if center[3] <= alpha_threshold:
                continue

            neighbors = [
                pix[x - 1, y - 1], pix[x, y - 1], pix[x + 1, y - 1],
                pix[x - 1, y],                 pix[x + 1, y],
                pix[x - 1, y + 1], pix[x, y + 1], pix[x + 1, y + 1],
            ]
            same = sum(1 for col in neighbors if close_rgb(col, center, tol=8))
            if same >= 3:
                continue

            # Cluster neighbors into tolerance buckets so normalized-but-not-exact
            # colors can still vote together.
            buckets: dict[tuple[int, int, int], list[tuple[int, int, int, int]]] = {}
            for col in neighbors:
                if col[3] <= alpha_threshold:
                    continue
                key = (col[0] // 12, col[1] // 12, col[2] // 12)
                buckets.setdefault(key, []).append(col)
            if not buckets:
                continue
            _key, votes = max(buckets.items(), key=lambda item: len(item[1]))
            if len(votes) < required:
                continue

            # Avoid wiping intentional bright details: only repair if candidate is
            # visually close enough to the local area, not a totally unrelated color.
            avg = tuple(int(round(sum(c[i] for c in votes) / len(votes))) for i in range(4))
            contrast = abs(center[0] - avg[0]) + abs(center[1] - avg[1]) + abs(center[2] - avg[2])
            if contrast > 150 and strength < 0.70:
                continue
            outpix[x, y] = avg
            changed += 1
            if changed >= max_changes:
                return out
    return out


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
    palette_colors = max(0, min(256, int(palette_colors or 0)))
    pixel_size = max(0, int(pixel_size or 0))
    pixel_strength = max(0.0, min(1.0, float(pixel_strength or 1.0)))

    original = img.copy()
    source_width, source_height = original.size
    source_color_count = _rgba_color_count(original)
    source_transparent_percent = _transparent_pixel_percent(original)
    detected_grid, grid_confidence = _detect_pixel_size(original, pixel_size if pixel_size > 0 else 0)

    step_stats: dict[str, int] = {}

    def record_step(name: str, before_step: Image.Image, after_step: Image.Image) -> None:
        changed, _percent = _changed_pixel_stats(before_step, after_step)
        step_stats[name] = changed

    smart_downscale_requested = bool(smart_downscale)
    smart_downscale_applied = False
    smart_downscale_grid = detected_grid if detected_grid > 1 else 1

    if smart_downscale_requested and smart_downscale_grid > 1:
        before_step = img.copy()
        img = _smart_downscale_rgba(
            img,
            pixel_size=smart_downscale_grid,
            palette_colors=palette_colors,
            quantize=bool(snap_palette) and palette_colors > 0,
        )
        smart_downscale_applied = img.size != before_step.size
        record_step("smart_downscale", before_step, img)

    if operation == "pixel_snap":
        before_step = img.copy()
        img = _pixel_snap_rgba(img, pixel_size=pixel_size, palette_colors=palette_colors, quantize=bool(snap_palette) and palette_colors > 0)
        if pixel_strength < 0.999:
            img = _blend_with_matching_size(original, img, pixel_strength)
        record_step("pixel_snap", before_step, img)
    elif operation == "pixel_snap_only":
        before_step = img.copy()
        img = _pixel_snap_rgba(img, pixel_size=pixel_size, palette_colors=palette_colors, quantize=False)
        if pixel_strength < 0.999:
            img = _blend_with_matching_size(original, img, pixel_strength)
        record_step("pixel_snap", before_step, img)
    elif operation in {"palette", "resize_palette"}:
        before_step = img.copy()
        img = _quantize_rgba(img, palette_colors)
        record_step("palette_quantize", before_step, img)

    if palette_normalize:
        before_step = img.copy()
        img = _palette_normalize_rgba(img, tolerance=normalize_tolerance)
        record_step("palette_normalize", before_step, img)

    if orphan_cleanup:
        before_step = img.copy()
        img = _orphan_cleanup_rgba(img, sensitivity=orphan_strength)
        record_step("orphan_cleanup", before_step, img)

    if edge_cleanup:
        before_step = img.copy()
        img = _edge_cleanup_rgba(img, strength=edge_strength)
        record_step("edge_cleanup", before_step, img)

    if morphology_cleanup:
        before_step = img.copy()
        img = _morphology_cleanup_rgba(img, strength=morphology_strength)
        record_step("morphology_cleanup", before_step, img)

    if preserve_alpha and img.mode == "RGBA":
        before_step = img.copy()
        img.putalpha(_match_alpha_size(original.getchannel("A"), img.size))
        record_step("alpha_preserve", before_step, img)

    if alpha_cleanup:
        before_step = img.copy()
        img = _alpha_cleanup_rgba(img, threshold=alpha_threshold)
        record_step("alpha_cleanup", before_step, img)

    if operation in {"resize", "resize_palette", "pixel_snap"} and resize_scale > 1:
        before_step = img.copy()
        w, h = img.size
        img = img.resize((w * resize_scale, h * resize_scale), Image.Resampling.NEAREST)
        step_stats["resize"] = (img.size[0] * img.size[1]) - (before_step.size[0] * before_step.size[1])

    output_width, output_height = img.size
    output_color_count = _rgba_color_count(img)
    output_transparent_percent = _transparent_pixel_percent(img)
    changed_pixels, changed_percent = _changed_pixel_stats(original, img)
    sprite_grid = max(1, int(detected_grid or 1))
    sprite_width = max(1, int(round(source_width / sprite_grid)))
    sprite_height = max(1, int(round(source_height / sprite_grid)))

    headers = {
        "X-PF-Detected-Grid": str(detected_grid),
        "X-PF-Grid-Confidence": str(grid_confidence),
        "X-PF-Palette-Target": str(palette_colors if bool(snap_palette) and palette_colors > 0 else 0),
        "X-PF-Resize-Scale": str(resize_scale),
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
