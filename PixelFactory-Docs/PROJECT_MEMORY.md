# PixelFactory Project Memory

This file is the persistent brain for PixelFactory. Update it whenever a feature idea, product decision, roadmap change, workflow rule, or design direction is discussed.

The goal is simple: if a chat crashes, a machine changes, or someone returns later, this file should preserve the why behind the project — not just the code.

---

## Core Product Identity

PixelFactory is a local-first pixel art production pipeline for game developers.

It connects:

```text
ComfyUI generation → PixelFactory curation / repair / organization → Godot + Aseprite export
```

PixelFactory is not trying to support every art tool. The only external creation/game-development tools currently planned are:

- **ComfyUI** for AI-assisted pixel generation.
- **Aseprite** for pixel-art editing, animation, cleanup, and sprite-sheet work.
- **Godot** for game-engine use.

The app should feel like a production pipeline, not just an image generator.

---

## Non-Negotiable Direction

- PixelFactory-Web is the long-term app direction.
- The PySide desktop prototype remains reference material only.
- The app should stay focused on pixel-art game assets.
- Accepted assets are more important than raw generations.
- Metadata matters: prompts, seeds, recipes, workflow names, states, favorites, export history, and edits should be tracked.
- Godot and Aseprite are the only outside programs we are building export foundations for right now.
- ComfyUI remains the generation backend, not something PixelFactory replaces.

---

## Current Pipeline Understanding

### 1. Generation

ComfyUI creates candidate pixel images from PixelFactory recipe/workflow settings.

Important generation metadata:

- recipe id
- workflow id / workflow file
- prompt
- resolved prompt
- negative prompt, when applicable
- seed
- dimensions
- model / LoRA / sampler settings when available
- generation date

### 2. Incoming Assets

Generated images land in an Incoming area first. They are candidates, not final assets.

Incoming assets can be:

- previewed
- favorited
- accepted
- deleted
- sent to Palette Lab
- later sent to Repair Bench

### 3. Accepted Assets

Accepted assets are the project-owned version of a useful generated image.

Accepted assets should become the source for:

- repairs
- palette cleanup
- Godot export
- Aseprite export
- sprite-sheet or tile-sheet building later

### 4. Export

Export is not just downloading a file. Export should eventually become a tracked production step with destination, target program, asset category, filename, and manifest metadata.

---

## Next Major Iteration

## PF-0013 — Export Foundation: Godot + Aseprite

Purpose: create the first real export layer for accepted assets.

### Scope

Add a backend export service and UI hooks that let PixelFactory export accepted assets to structured folders for Godot and Aseprite.

### First-pass export behavior

- Export selected accepted asset to Godot.
- Export selected accepted asset to Aseprite.
- Export all accepted assets later.
- Create export folders if missing.
- Copy PNGs without destructive changes.
- Generate or update an export manifest.
- Keep filenames stable and game-dev friendly.

### Proposed folder layout

```text
PixelFactory-Projects/default/
  Exports/
    Godot/
      Characters/
      Tiles/
      UI/
      manifest.json
    Aseprite/
      Characters/
      Tiles/
      UI/
      manifest.json
```

### Godot export foundation

Initial version:

- Copy accepted PNG into `Exports/Godot/<Category>/`.
- Use stable, clean filenames.
- Add manifest record for exported file.

Later:

- Add Godot-specific import metadata if useful.
- Support project-relative paths.
- Support naming conventions for scenes/resources.
- Support tile sets, sprite sheets, and animated sprites.

### Aseprite export foundation

Initial version:

- Copy accepted PNG into `Exports/Aseprite/<Category>/`.
- Add manifest record for exported file.

Later:

- Add optional Aseprite CLI integration.
- Support `.aseprite` file creation if practical.
- Support frame tags, animation slices, sprite sheets, and layered cleanup workflows.

### Manifest idea

Each export manifest entry should track:

- asset id
- source image path
- accepted image path
- export target: `godot` or `aseprite`
- exported file path
- category
- filename
- exported at timestamp
- recipe id
- seed
- prompt summary or prompt reference

---

## Ideas To Preserve

These are not all immediate tasks. They are remembered direction.

### Asset Browser

- Incoming / Accepted distinction should stay obvious.
- Favorites are useful for narrowing candidates.
- Filters should help with production decisions, not just browsing.
- Asset cards should stay fast and reliable.
- Inspector should show enough path/state info to understand what file is being used.

### Character Studio

- Seed handling must stay reproducible.
- Random seed should resolve to a real saved seed.
- Safe square generation sizes are preferred for now: 512, 768, 1024.
- Character generation should remain recipe-driven.

### Palette Lab

- Palette cleanup is part of the production pipeline.
- Workspace image handoff matters.
- Fit / actual-pixel viewing is important for pixel art.
- Eventually Palette Lab should feed repaired/cleaned versions back into accepted assets.

### Repair Bench

- Future place for improving accepted assets.
- Could use ComfyUI img2img or masked repair later.
- Should preserve original asset and create a new revision rather than overwriting blindly.

### Tile Studio

- Tile generation and tile cleanup should become a dedicated workflow.
- Needs tile repeat preview.
- Later support tilesheets and Godot TileSet-friendly exports.

### Project Memory / Metadata

- Every asset should eventually have a clear story:
  - where it came from
  - what generated it
  - what edits/repairs happened
  - whether it was accepted
  - whether it was exported
  - where it was exported
- This file should be updated whenever important direction changes.

---

## Working Rules For Future Iterations

When we start a new feature or make a meaningful decision, update this file.

Good things to add here:

- new feature ideas
- dropped ideas
- design decisions
- naming conventions
- folder conventions
- export rules
- pipeline rules
- ticket priorities
- important bugs or gotchas
- anything discussed in chat that would be painful to lose

Do not use this file as a full changelog. Use `CHANGELOG.md` for completed code changes. Use this file for project memory and direction.

---

## Open Questions

- Should exports be per-project only, or should the user be able to point Godot/Aseprite exports to an external folder?
- Should Godot export copy files into the Godot project directly, or stage them inside PixelFactory first?
- Should Aseprite export eventually require Aseprite CLI, or stay PNG/sprite-sheet based unless configured?
- How should asset revisions be named after Palette Lab or Repair Bench edits?
- Should accepted assets have human-readable names before export?

---

## Latest Remembered Context

The chat that was lost contained export-foundation planning. The important recovered direction is:

- PixelFactory is a pipeline for game-dev pixel image generation.
- ComfyUI is used to create pixel generations.
- Godot and Aseprite are the only external programs we are currently targeting.
- The next iteration should establish export foundations for those two targets.
- A persistent project-memory file is necessary so future chat crashes do not wipe out product direction.

## PF-0013 Export Foundation: Godot + Aseprite

- Pixel Factory is intentionally focused on only two external tools: Godot and Aseprite.
- Export foundation is PNG-first: copied image, sidecar JSON, and per-target manifest.
- Export paths live under `PixelFactory-Projects/default/Exports/Godot` and `PixelFactory-Projects/default/Exports/Aseprite`.
- Future export work should build on this foundation rather than adding unrelated external app targets.


## Recipes vs Presets Decision

- Recipes and presets are different concepts.
- A recipe is the production workflow definition: what kind of asset is being made, which ComfyUI workflow to use, required generation fields, asset type, expected size, default tags, and supported export targets.
- A preset is the flavor/style layer inside or alongside a recipe: medieval, fantasy, sci-fi, cyberpunk, cozy farming, horror, etc.
- In practical terms: recipes answer "what are we making and how does it flow through PixelFactory?" Presets answer "what artistic/theme direction should this run use?"
- Future UI should avoid merging these concepts. Recipe selection should feel like choosing the pipeline. Preset selection should feel like choosing a style pack for that pipeline.

## PF-0013.1 Export Verification

- The first export screen existed but was too quiet; it did not prove that exports actually happened.
- Exporter needs to show accepted asset count, incoming asset count, target folders, manifest existence, recent exported files, and whether PNG/JSON files still exist.
- Individual asset export buttons are useful during testing, but the intended production flow remains: generate incoming asset -> accept asset -> export accepted asset(s).

## PF-0013.2 Export Stability Lesson

The export foundation failure showed why the repo handoff must be clean and canonical. A ZIP that contains a nested stale `PixelFactory/` copy can cause the user to run the wrong backend and get `Not Found` even though the UI looks correct. Future handoffs should avoid duplicate project roots and should include restart notes when backend routes change.

Recipes vs presets remains an important product distinction:
- Recipes are the production workflow contracts: what kind of asset is being made, what ComfyUI workflow is used, required inputs, output expectations, metadata, validation, and allowed export targets.
- Presets are creative/style lenses applied inside a recipe: medieval, fantasy, sci-fi, cozy, horror, SNES-like, Game Boy-like, palette/style direction, etc.
- In plain terms: recipe = the pipeline/job type; preset = the art direction for that job.

