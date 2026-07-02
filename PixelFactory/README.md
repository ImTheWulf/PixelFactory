# PixelFactoryByWulf

A modular pixel-art asset production toolkit.

## Main Direction

- `PixelFactory-Web/` is the new long-term local web UI.
- `PixelFactory-Comfy/` stores ComfyUI workflows and model notes.
- `PixelFactory-App/` is the older PySide prototype kept for reference.

## Start Here

1. Open `PixelFactory-Docs/GIT_START_HERE.md` for Git/GitHub notes.
2. Open `PixelFactory-Web/README.md` to run the new browser-based Palette Lab.


## Current Milestone

PF-0008 Workspace Pipeline: latest generations are placed into a temporary workspace for Palette Lab and future repair/export tools.

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
