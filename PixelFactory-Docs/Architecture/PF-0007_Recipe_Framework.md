# PF-0007 — Recipe Framework

Pixel Factory now separates **what the user wants** from **how ComfyUI creates it**.

## Core idea

The UI should not hardcode prompts, workflow filenames, LoRA names, or model settings. The UI asks for a recipe, and the backend resolves the recipe into workflow + engine settings.

```text
UI → RecipeService → WorkflowService → EngineService → ComfyUI
```

## Concepts

### Studio
Creates assets.

Examples: Character Studio, Tile Studio, Building Studio.

### Tool
Changes assets.

Examples: Palette Lab, Repair Bench, Resize, Crop, Export.

### Recipe
Describes how to make or process something.

Examples: `character.default`, `tile.cobblestone`, `repair.character`.

### Preset
Describes how something should look.

Examples: Pixel Factory Default, SNES, Game Boy, Dark Fantasy.

## Current recipe folders

```text
PixelFactory-Web/recipes/
├── character/default.json
├── tile/cobblestone.json
└── repair/character.json
```

## Current services

```text
PixelFactory-Web/backend/services/
├── recipe_service.py
├── workflow_service.py
├── engine_service.py
└── asset_service.py
```

## Rule

No page should talk directly to ComfyUI. Engine calls go through `EngineService`.
