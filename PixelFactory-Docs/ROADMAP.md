# Roadmap

## Milestone 1: App Shell
- Open image
- Preview image
- Nearest resize
- Basic palette reduction
- Export accepted asset

## Milestone 2: PaletteLab
- Limit palette
- Remove isolated speckles
- Merge near-identical colors
- Compare before/after

## Milestone 3: Repair Bench
- Load accepted image
- Create repair prompt presets
- Optional masked img2img via ComfyUI later

## Milestone 4: Tile Studio
- Slice texture into candidate tiles
- Preview tile repeat
- Export selected tile
- Build basic tilesheet

## Milestone 5: Project Memory
- Track prompts, seeds, model, LoRA, VAE, repairs, accepted assets

## Milestone 6: Export Foundation
- Export accepted assets to Godot-friendly folders
- Export accepted assets to Aseprite-friendly folders
- Track export history in manifest files
- Keep Godot and Aseprite as the only planned external export targets for now

## Persistent Planning
- Update `PixelFactory-Docs/PROJECT_MEMORY.md` whenever important ideas, feature decisions, or roadmap direction are discussed.

## PF-0013 Export Foundation: Godot + Aseprite

- Pixel Factory is intentionally focused on only two external tools: Godot and Aseprite.
- Export foundation is PNG-first: copied image, sidecar JSON, and per-target manifest.
- Export paths live under `PixelFactory-Projects/default/Exports/Godot` and `PixelFactory-Projects/default/Exports/Aseprite`.
- Future export work should build on this foundation rather than adding unrelated external app targets.

