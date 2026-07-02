# Pixel Factory Web

Local web UI for Pixel Factory.

## Run

```powershell
cd PixelFactory-Web
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

## PF-0007 Recipe Framework

Character Studio now uses recipes from:

```text
PixelFactory-Web/recipes/character/default.json
```

Recipes are configuration. They describe workflow id, default prompt, negative prompt, resolution, batch size, steps, model hints, LoRA hints, and export targets.

The UI should not hardcode generation logic. It should load recipes and send recipe ids to the backend.

## PF-0009 — Universal Image Viewer

- Added shared full-screen image viewer modal.
- Added Fit / 1:1 / Zoom controls.
- Added click-to-view behavior for Palette Lab previews, generated images, and asset inspector previews.
- Fixed Palette Lab preview mode CSS to avoid squashing images.



## PF-0010.1 Asset State Clarity Patch

- Clear Incoming / Accepted asset badges.
- Inspector shows current image path, original image path, accepted copy path, and project root.
- Accepted assets use the accepted copy as their active image.
- Generated assets keep stable default names.
- Character generation is locked to safe square sizes: 512, 768, 1024.

## PF-0012.2

Quick favorite toggle and seed UI cleanup.
