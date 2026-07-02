# Changelog

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
