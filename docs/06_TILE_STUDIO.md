# TILE STUDIO

Goals
- Seamless generation
- Variant generation
- Terrain/autotile creation
- Tilemap preview
- Godot-ready export

## PF-0014 Foundation Scope

Tile Studio begins as a simple base tile generator.

The foundation includes:

- tile recipe selector
- tile prompt and negative prompt
- seed controls
- square output size controls
- batch and steps controls
- ComfyUI generation route
- asset saving as `tile`
- Workspace handoff
- Palette Lab handoff through existing Workspace behavior

The foundation intentionally excludes:

- seamless correction
- variant generation
- texture-to-tile stage
- masks and overlays
- terrain builder
- tile sheet builder
- Godot terrain metadata

Those belong to later milestones after the base Tile Studio path is stable.

