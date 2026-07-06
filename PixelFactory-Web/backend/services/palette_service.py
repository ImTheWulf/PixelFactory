"""Palette Lab deterministic pixel-art processing.

Extracted from backend/main.py (PF-0100-refactor) so the FastAPI route file
stays thin and this domain logic can be unit-tested and reused on its own.

No behavior changes were made during this move: every method below is the
same function body that used to live in main.py, just relocated and renamed
(the leading underscore dropped, calls between them now go through
PaletteLabService.<name>(...) instead of a bare module-level name).

No AI inference happens here — this is the "deterministic pixel-art
processing" layer described in docs/08_PALETTE_LAB.md.
"""

from __future__ import annotations

import math

from PIL import Image, ImageChops, ImageStat


class PaletteLabService:
    """Stateless collection of Palette Lab image-processing passes.

    All methods are static: there is no per-request or per-app state here,
    only pure image-in/image-out (or image-in/stat-out) functions. Kept as a
    class (rather than bare module functions) to match the existing service
    pattern used by AssetService, WorkspaceService, ExportService, etc.
    """

    @staticmethod
    def auto_pixel_size(width: int, height: int) -> int:
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


    @staticmethod
    def candidate_pixel_sizes(width: int, height: int) -> list[int]:
        smallest = max(1, min(width, height))
        return [px for px in (2, 4, 8, 16, 32, 64) if px <= max(1, smallest // 2)] or [1]


    @staticmethod
    def reconstruction_error(img: Image.Image, pixel_size: int) -> float:
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


    @staticmethod
    def detect_pixel_size(img: Image.Image, override: int = 0) -> tuple[int, int]:
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

        fallback = PaletteLabService.auto_pixel_size(w, h)
        candidates = PaletteLabService.candidate_pixel_sizes(w, h)
        scored: list[tuple[float, int, float]] = []
        for px in candidates:
            error = PaletteLabService.reconstruction_error(img, px)
            fallback_penalty = abs(math.log2(max(px, 1) / max(fallback, 1))) * 4.0
            small_grid_penalty = max(0.0, 3.0 - math.log2(max(px, 2))) * 1.25
            scored.append((error + fallback_penalty + small_grid_penalty, px, error))

        scored.sort(key=lambda item: item[0])
        best_score, best_px, best_error = scored[0]
        second_score = scored[1][0] if len(scored) > 1 else best_score + 8.0
        margin = max(0.0, second_score - best_score)
        confidence = int(max(35, min(98, 96 - best_error * 1.7 + margin * 2.5)))
        return best_px, confidence



    @staticmethod
    def rgba_color_count(img: Image.Image, limit: int = 100000) -> int:
        """Count unique RGBA colors with a safe cap for UI diagnostics."""
        try:
            colors = img.convert("RGBA").getcolors(maxcolors=limit)
            if colors is None:
                return limit
            return len(colors)
        except Exception:
            return 0




    @staticmethod
    def transparent_pixel_percent(img: Image.Image) -> float:
        """Return transparent pixel percentage for UI metadata."""
        try:
            rgba = img.convert("RGBA")
            total = max(1, rgba.size[0] * rgba.size[1])
            transparent = sum(1 for _r, _g, _b, a in rgba.getdata() if a < 255)
            return round((transparent / total) * 100.0, 2)
        except Exception:
            return 0.0

    @staticmethod
    def changed_pixel_stats(before: Image.Image, after: Image.Image) -> tuple[int, float]:
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


    @staticmethod
    def match_alpha_size(alpha: Image.Image, size: tuple[int, int]) -> Image.Image:
        """Resize an alpha channel to match the current processing image safely."""
        return alpha if alpha.size == size else alpha.resize(size, Image.Resampling.NEAREST)

    @staticmethod
    def blend_with_matching_size(base: Image.Image, overlay: Image.Image, amount: float) -> Image.Image:
        """Blend while resizing the base image when earlier stages changed dimensions."""
        if base.size != overlay.size:
            base = base.resize(overlay.size, Image.Resampling.NEAREST)
        return Image.blend(base.convert("RGBA"), overlay.convert("RGBA"), amount)


    @staticmethod
    def alpha_cleanup_rgba(img: Image.Image, *, threshold: int = 12) -> Image.Image:
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

    @staticmethod
    def quantize_rgba(img: Image.Image, colors: int) -> Image.Image:
        """Palette Quantization v2.

        Uses an adaptive palette when available, preserves transparent pixels, and
        keeps fully-transparent RGB stable so invisible fringe colors do not bloat
        the palette count. This stays compatible with the existing API while giving
        cleaner color reduction for pixel-art sources.
        """
        colors = int(colors or 0)
        if colors <= 0:
            return img.copy()
        colors = max(2, min(256, colors))
        src = img.convert("RGBA")
        alpha = src.getchannel("A")
        rgb = Image.new("RGB", src.size, (0, 0, 0))
        rgb.paste(src.convert("RGB"), mask=alpha)
        method = Image.Quantize.MEDIANCUT
        try:
            quantized = rgb.quantize(colors=colors, method=Image.Quantize.FASTOCTREE)
        except Exception:
            quantized = rgb.quantize(colors=colors, method=method)
        out = quantized.convert("RGBA")
        out.putalpha(alpha)
        # Normalize invisible pixels so transparent garbage colors do not count as
        # unique palette entries downstream.
        pixels = [(0, 0, 0, 0) if a == 0 else (r, g, b, a) for r, g, b, a in out.getdata()]
        out.putdata(pixels)
        return out


    @staticmethod
    def smart_downscale_rgba(
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
        px, _confidence = PaletteLabService.detect_pixel_size(img, int(pixel_size or 0))
        px = max(1, min(px, max(1, min(w, h) // 2)))
        if px <= 1:
            return img.copy()
        down_w = max(1, round(w / px))
        down_h = max(1, round(h / px))
        out = img.resize((down_w, down_h), Image.Resampling.BOX)
        if quantize and int(palette_colors or 0) > 0:
            out = PaletteLabService.quantize_rgba(out, palette_colors)
        return out


    @staticmethod
    def pixel_snap_rgba(
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
        px, _confidence = PaletteLabService.detect_pixel_size(img, int(pixel_size or 0))
        px = max(1, min(px, max(1, min(w, h) // 2)))

        snapped_w = max(1, round(w / px))
        snapped_h = max(1, round(h / px))
        small = img.resize((snapped_w, snapped_h), Image.Resampling.BOX)
        if quantize:
            small = PaletteLabService.quantize_rgba(small, palette_colors)
        return small.resize((w, h), Image.Resampling.NEAREST)



    @staticmethod
    def palette_normalize_rgba(img: Image.Image, *, tolerance: int = 8) -> Image.Image:
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


    @staticmethod
    def morphology_cleanup_rgba(img: Image.Image, *, strength: float = 0.35) -> Image.Image:
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
        fill_required = 7 if strength < 0.35 else 6 if strength < 0.70 else 5
        remove_required_empty = 6 if strength < 0.50 else 5
        max_changes = int(max(250, w * h * (0.003 + strength * 0.014)))
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
                    transparent_neighbors = 8 - len(opaque_neighbors)
                    if transparent_neighbors >= remove_required_empty and similar <= min_same:
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

    @staticmethod
    def orphan_cleanup_rgba(img: Image.Image, *, sensitivity: float = 0.35) -> Image.Image:
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



    @staticmethod
    def jaggy_cleanup_rgba(img: Image.Image, *, strength: float = 0.30) -> Image.Image:
        """Repair obvious stair-step/jaggy edge pixels without blurring.

        This is a focused unfake-inspired pass for diagonal edge artifacts. It only
        edits a pixel when the local 3x3 area shows a strong straight/diagonal vote
        and the center pixel looks like a tiny protrusion or stair-step artifact.
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
        alpha_cutoff = 16
        rgb_tol = 24 + int(strength * 20)
        required = 6 if strength < 0.50 else 5 if strength < 0.85 else 4
        max_changes = max(1, int(w * h * (0.0015 + strength * 0.012)))
        changed = 0

        def visible(c):
            return c[3] > alpha_cutoff

        def close(a, b, tol=rgb_tol):
            if not visible(a) or not visible(b):
                return False
            return abs(a[0] - b[0]) <= tol and abs(a[1] - b[1]) <= tol and abs(a[2] - b[2]) <= tol

        def average(colors):
            return tuple(int(round(sum(c[i] for c in colors) / len(colors))) for i in range(4))

        for y in range(1, h - 1):
            for x in range(1, w - 1):
                c = pix[x, y]
                if not visible(c):
                    continue

                n = pix[x, y - 1]
                s = pix[x, y + 1]
                e = pix[x + 1, y]
                wv = pix[x - 1, y]
                ne = pix[x + 1, y - 1]
                nw = pix[x - 1, y - 1]
                se = pix[x + 1, y + 1]
                sw = pix[x - 1, y + 1]
                neighbors = [n, s, e, wv, ne, nw, se, sw]
                visible_neighbors = [p for p in neighbors if visible(p)]
                if len(visible_neighbors) < required:
                    continue

                # Skip pixels that already have enough same-color support.
                same = sum(1 for p in visible_neighbors if close(p, c, tol=10))
                if same >= 3 or len(visible_neighbors) >= 7:
                    continue

                # Diagonal stair tests: one diagonal pair agrees, while the opposing
                # direct neighbors make the center look like a protruding jag.
                candidates = []
                if close(nw, se) and (not close(n, c) or not close(wv, c)):
                    candidates.extend([nw, se])
                if close(ne, sw) and (not close(n, c) or not close(e, c)):
                    candidates.extend([ne, sw])
                if close(n, s) and (not close(e, c) or not close(wv, c)):
                    candidates.extend([n, s])
                if close(e, wv) and (not close(n, c) or not close(s, c)):
                    candidates.extend([e, wv])

                if len(candidates) < 2:
                    # Fallback: local majority bucket, still conservative.
                    buckets: dict[tuple[int, int, int], list[tuple[int, int, int, int]]] = {}
                    for p in visible_neighbors:
                        key = (p[0] // 16, p[1] // 16, p[2] // 16)
                        buckets.setdefault(key, []).append(p)
                    if not buckets:
                        continue
                    _key, votes = max(buckets.items(), key=lambda item: len(item[1]))
                    if len(votes) < required:
                        continue
                    candidates = votes

                replacement = average(candidates)
                contrast = abs(c[0] - replacement[0]) + abs(c[1] - replacement[1]) + abs(c[2] - replacement[2])
                if contrast > 180 and strength < 0.70:
                    continue
                outpix[x, y] = replacement
                changed += 1
                if changed >= max_changes:
                    return out
        return out

    @staticmethod
    def edge_cleanup_rgba(img: Image.Image, *, strength: float = 0.30) -> Image.Image:
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
        required = 7 if strength < 0.34 else 6 if strength < 0.67 else 5
        max_changes = max(1, int(w * h * (0.012 + strength * 0.045)))
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
                    key = (col[0] // 16, col[1] // 16, col[2] // 16)
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
                if contrast > 120 and strength < 0.70:
                    continue
                outpix[x, y] = avg
                changed += 1
                if changed >= max_changes:
                    return out
        return out
