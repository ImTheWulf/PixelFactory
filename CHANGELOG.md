## PF-0100 — Product Direction Notes

- Clarified Palette Lab as a post-generation cleanup tool.
- Clarified Tile Studio as a staged texture-to-tile production workflow.
- Documented chroma key background cleanup as a future pipeline feature.
- Confirmed presets are broad style controls while recipes are curated generation strategies.
- Added future direction for Tile Builder, Terrain Builder, Building Generation, and Portrait Studio.

## PF-0100 — Documentation Consolidation

- Consolidated project documentation into `/docs`.
- Removed `PixelFactory-Docs` as a separate documentation source.
- Confirmed `PixelFactory-Web` as the active application.
- Archived `PixelFactory-App` as prototype/reference only.
- Confirmed Godot and Aseprite as the only export targets.
- Established `/docs` as the project source of truth.

## PF-0013.3c - Selected Export UI Cleanup

- Fixed export checkbox click propagation so selection stays visible after card interactions.
- Moved card status badge to the top-left to avoid overlap with Export checkbox.
- Fixed inspector status badge stretching by resetting bottom/height constraints.
- Kept Asset Browser export actions while preserving existing Exporter page controls.

## PF-0012.3 — Favorite Click Reliability

- Fixed asset card star click handler.
- Added static cache busting for frontend assets.
- Routed inspector Favorite through the same toggle path.


## PF-0012 — UI Layout + Asset Filter Polish

- Moved ComfyUI connection into a compact global status bar.
- Added Asset Browser Favorites filter.
- Added dynamic Asset Browser headings based on filter.
- Fixed favorite badge overlap on asset thumbnails.
- Random seed now fills the seed input immediately.
- Tightened sidebar overflow behavior.


## PF-0011 - Generation Settings Fix

- Added Pixel Factory-side random seed resolution.
- Saved actual seed instead of `-1` in generated asset metadata.
- Added Use Random Seed and Reuse Last Seed controls.
- Character Studio now displays the actual seed returned by generation.
- Comfy KSampler is now patched with a fixed actual seed for reproducibility.
- Kept generation sizes locked to safe square values.

# Changelog

## PF-0008 — Workspace Pipeline

- Added temporary Workspace service.
- Character Studio now sends the latest generated image into Workspace.
- Palette Lab can load Workspace directly.
- Asset Browser can set an asset as Workspace.
- Added automatic ComfyUI status check on page load.
- Added Palette Lab Fit / Actual Pixels preview mode.


## v0.7 / PF-0007 — Recipe Framework

- Added data-driven recipe framework.
- Added Character, Tile, and Repair recipe examples.
- Added Pixel Factory Default style preset.
- Added backend services: RecipeService, WorkflowService, EngineService, AssetService.
- Character Studio now loads defaults from `character.default`.
- Character generation metadata now records recipe id and resolved prompt.
- Accepted assets no longer show the Accept button in the inspector.


## v0.6 - Asset Browser

- Added Asset Browser page.
- Character generations now save into `PixelFactory-Projects/default/Incoming/Characters`.
- Added metadata JSON per generated asset.
- Added Accept, Download, Delete, and Send to Palette Lab actions.
- Pixel Factory now starts organizing outputs instead of only showing loose images.


## v0.5 - Comfy Connector
- Added PixelFactory-Web Character Studio.
- Added ComfyUI connection check.
- Added backend Comfy client.
- Added UI workflow to Comfy API prompt converter for current Flux GGUF LoRA workflows.
- Added `PixelFactory-Web/workflows/character.json` and `tile.json` as data workflows.
- Palette Lab remains deterministic.

## v0.4 - Web Scaffold
- Added FastAPI web application scaffold.
- Added Palette Lab web UI.

## v0.1-v0.3
- Early Comfy workflow experiments and desktop app prototype.

## PF-0009 — Universal Image Viewer

- Added shared full-screen image viewer modal.
- Added Fit / 1:1 / Zoom controls.
- Added click-to-view behavior for Palette Lab previews, generated images, and asset inspector previews.
- Fixed Palette Lab preview mode CSS to avoid squashing images.


## PF-0009.1
- Asset Browser thumbnail images now open the universal viewer directly.
- Card body still selects the asset for inspection.
- Zoom overlay is now visually tied to the clickable thumbnail area.


## PF-0010.1 Asset State Clarity Patch

- Clear Incoming / Accepted asset badges.
- Inspector shows current image path, original image path, accepted copy path, and project root.
- Accepted assets use the accepted copy as their active image.
- Generated assets keep stable default names.
- Character generation is locked to safe square sizes: 512, 768, 1024.

## PF-0012.2

Quick favorite toggle and seed UI cleanup.

## PF-0013 Export Foundation: Godot + Aseprite

- Pixel Factory is intentionally focused on only two external tools: Godot and Aseprite.
- Export foundation is PNG-first: copied image, sidecar JSON, and per-target manifest.
- Export paths live under `PixelFactory-Projects/default/Exports/Godot` and `PixelFactory-Projects/default/Exports/Aseprite`.
- Future export work should build on this foundation rather than adding unrelated external app targets.


## PF-0013.3 — Export Selection Foundation

- Added selected-asset batch export endpoint for Godot/Aseprite.
- Added Asset Browser export checkboxes and inspector selection toggle.
- Added Exporter controls for exporting selected assets and clearing selection.
- Kept PF-0013 export scope PNG-first with JSON sidecars and manifests.
