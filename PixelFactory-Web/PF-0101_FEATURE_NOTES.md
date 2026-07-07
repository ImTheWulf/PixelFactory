# PF-0101 — Palette Lock/Import, Dithering, Manual Grid-Offset Nudge

## What's new

**1. Palette Lock / Import** — new "Palette Lock" tab in the Repair Toolbox.
Paste a list of hex colors (any mix of `#RRGGBB`, `RRGGBB`, `#fff` shorthand,
separated by commas, spaces, or newlines) and turn Palette Lock on. Every
visible pixel gets forced to the *nearest* color in that exact list — not an
auto-picked N-color palette, the literal colors you gave it. Transparent
pixels are left alone.

**2. Dither toggle** — sits right next to Palette Lock, only does anything
while Palette Lock is on. Turns on Floyd-Steinberg dithering across your
locked palette, so limited palettes get a classic dithered look instead of
flat nearest-color fill.

*Why these two are one feature, not two:* I checked empirically before
building anything — in this Pillow version, the `dither` flag has **zero
effect** on the existing Color Cleanup / auto-quantize path (verified byte-
identical output with dither on vs off, across three quantize methods). It
only ever does something when quantizing against a fixed palette. That's
also the only context where dithering is meaningful for pixel art anyway —
you dither *because* you're constrained to a small fixed set of colors. So
dithering lives inside Palette Lock, not as a separate always-visible toggle
on Color Cleanup where it would silently do nothing.

**3. Grid Offset X / Y nudge** — added to the existing Pixel Snap tab. Two
number inputs (0 up to image width/height) plus a Reset button. If Pixel
Snap's detected (or manually chosen) grid size is right but the sampling
window starts a pixel or two early/late relative to the sprite's actual
cell boundaries, nudge these until the Canvas preview lines up. Canvas size
never changes — the offset only shifts which source pixels get grouped into
which output cell before the downsample.

## Where the code lives

| File | What changed |
|---|---|
| `backend/services/palette_service.py` | 3 new methods: `apply_grid_offset_rgba`, `parse_hex_palette`, `quantize_to_fixed_palette_rgba`. `smart_downscale_rgba`/`pixel_snap_rgba` gained optional `grid_offset_x`/`grid_offset_y` kwargs (default 0). |
| `backend/main.py` | 5 new `Form(...)` fields on `/api/process`; new Palette Lock pipeline stage right after Palette Normalize; new `X-PF-*` response headers. |
| `frontend/templates/index.html` | New Palette Lock tab/pane, new pipeline-manager card, Grid Offset X/Y inputs + Reset button in the Pixel Snap pane. |
| `frontend/static/js/01_palette-lab.js` | New DOM refs, `parsePaletteLockColors()` + `updatePaletteLockSummary()` (client-side swatch preview, no round trip needed), pipeline stage wiring, 5 new form fields on both `/api/process` call sites (live preview + save/export). |
| `frontend/static/styles.css` | Small addition: palette-lock textarea + swatch row styling. |

## What did NOT change

Every existing function behaves identically at default settings
(`grid_offset=0`, Palette Lock off) — this was re-verified, not assumed: the
full regression suite from the PF-0100.1 refactor (18 functions × real
project images, 60 checks) still comes back 60/60 byte-identical after
these additions. No existing route field, UI element, or tab was removed or
renamed.

## How this was actually tested (not just written)

- **Palette Lock correctness**: ran it against a real project image with a
  known 5-color target palette and confirmed every output pixel (except
  transparent ones) came from that exact list. This caught a real bug during
  testing — unused palette slots were padded with black, which could
  out-compete a real dark color for near-black pixels. Fixed by padding with
  a repeat of the last real color instead, and re-verified.
- **Dither**: confirmed dithered output differs from flat output, and still
  never leaves the locked palette.
- **Grid offset**: confirmed output actually changes vs. offset (0,0), and
  that output canvas size never changes — including at deliberately
  out-of-range offsets (larger than the image), which clamp instead of
  crashing.
- **No regression**: re-ran the complete PF-0100.1 regression suite (not
  just spot checks) after every round of edits.
- **Syntax**: all 5 split JS files still pass `node --check` individually.
  `index.html` fieldset/button tag counts balanced before and after (9/9
  fieldsets, 100/100 buttons) — a basic but real check that nothing got left
  unclosed.

I still don't have a browser here, so — same as the app.js split — please
click through this one before trusting it fully.

## How to test

1. Drop these files into your project (see the file list above for exact
   paths — you're replacing `main.py`, `palette_service.py`, `index.html`,
   `01_palette-lab.js`, and `styles.css`).
2. Restart the server, hard-refresh.
3. Open Palette Lab, load an asset, open the new **Palette Lock** tab.
4. Paste a few hex colors, e.g. `#1a1a1e, #c83232, #f0f0f0, #3a6e3c`, turn
   Palette Lock on, hit Update — the canvas should snap to just those
   colors. Toggle Dither on/off and compare.
5. Switch to the **Pixel Snap** tab, try nudging Grid Offset X/Y by a few
   pixels on a sprite where the grid already looks slightly misaligned, and
   confirm the canvas preview shifts and (ideally) lines up better.
6. Check the **Processing Pipeline** manager panel — you should see a new
   "Palette Lock" card that reflects on/off + color count + dither state,
   and clicking it should jump you to the Palette Lock tab.

## If something breaks

Tell me what you did and what you saw (console error, wrong colors, canvas
not updating, etc.) — same as before, I'll start from wherever the error
actually points rather than guessing.
