
## PF-0017.7 — Palette Lab Save Result Flow

- Added native save flow for processed Palette Lab previews.
- Palette Lab results can now be saved as Candidate assets or saved and accepted immediately.
- Saved cleanup results preserve source asset context, Palette Lab operation settings, and cleanup tags.

## PF-0014.4 Candidate Rules

Candidates are generated assets that are not yet saved.

Rules:

- Favoriting a Candidate automatically accepts/saves it.
- Accepted assets are never removed by candidate cleanup.
- Favorite assets are never removed by candidate cleanup.
- Clear Unsaved Candidates deletes only temporary Candidate assets.
- Tile assets should be stored under `Tiles`, not singular `Tile`, going forward.

# 00 — Project Memory

> This is the canonical memory file for Pixel Factory. Read this first when continuing development.

Pixel Factory is a **local-first 2D game asset production pipeline**. It is not just an AI image generator and it is not a generic ComfyUI frontend.

The goal is to help a developer create usable 2D game assets, especially pixel-art assets, then process, organize, and export them cleanly into **Godot** and **Aseprite**.

---

## Core Product Identity

Pixel Factory connects:

```text
ComfyUI generation
    → Pixel Factory curation / workspace / repair / organization
    → Godot + Aseprite export
```

The app should feel like a production tool, not a prompt toy.

Pixel Factory is inspired by tools and workflows like PixelLab, Retro Diffusion, and Sprite Fusion, but the direction is a local pipeline creator for game assets with ComfyUI behind the scenes.

---

## Non-Negotiable Direction

- Pixel Factory is the center of the application experience.
- Studios, workbenches, recipes, presets, exports, and the asset library all support the larger production pipeline.
- ComfyUI is the backend engine, not the user experience.
- The user should not need to understand ComfyUI nodes, samplers, schedulers, model paths, or workflow JSON.
- Pixel Factory should hide technical complexity behind clear production actions.
- Godot and Aseprite are the only supported external targets right now.
- Do not add Unity, GameMaker, RPG Maker, Construct, Phaser, Defold, MonoGame, Unreal, Photoshop, or other export targets unless the project owner explicitly changes this rule.
- Deterministic tools should remain deterministic. Palette reduction, resizing, indexing, tile preview, export, and metadata management should not randomly call AI.
- Pixel-perfect behavior matters. Use nearest-neighbor scaling and avoid blurry previews or destructive anti-aliasing.
- Features must help build a 2D game faster or more cleanly.

---

## What Pixel Factory Is

- A local-first 2D game asset production suite.
- A ComfyUI-powered generation pipeline wrapped in a clean application.
- A place to create asset families, not just loose PNG files.
- A tile, character, prop, icon, and palette workflow manager.
- A Godot + Aseprite export bridge.
- A tool built around recipes, presets, metadata, workspaces, and game-ready outputs.

## What Pixel Factory Is Not

- Not a generic AI art website.
- Not a node editor.
- Not a ComfyUI replacement.
- Not a general image gallery.
- Not a multi-engine exporter.
- Not a Photoshop clone.
- Not an everything-app.
---

## Current Application Direction

Pixel Factory currently has:

- Character Studio baseline.
- Asset Browser.
- Workspace pipeline.
- Palette Lab.
- Export foundation.
- Recipe / preset folder structure.
- Godot + Aseprite export foundation.
- Metadata tracking and asset state management.
- Selected asset export foundation.

The next major direction is **Tile Studio**, especially top-down seamless tile generation and variation creation for usable tilemaps.

---

## Current Pipeline Understanding

### 1. Generation

ComfyUI creates candidate pixel images from Pixel Factory recipe/workflow settings.

Important generation metadata:

- recipe id
- workflow id / workflow file
- preset id, when used
- prompt
- resolved prompt
- negative prompt, when applicable
- seed
- dimensions
- model / LoRA / sampler settings when available
- generation date

### 2. Incoming Assets

Generated images land in an Incoming area first.

Incoming assets are candidates, not final production assets.

### 3. Accepted Assets

Accepted assets are committed to the project library.

Accepted assets should preserve useful metadata:

- source generation
- prompt information
- recipe / preset
- seed
- file paths
- user notes
- tags
- favorite state
- export history

### 4. Workspace

The workspace is the active working image.

The workspace is not the full asset library. It is the current document moving through the production pipeline.

```text
Generate → Workspace → Palette Lab → Repair Bench → Export
```

The Asset Browser can set any asset as the current workspace.

### 5. Processing

Processing tools should feel like workbenches:

- Palette Lab
- Repair Bench
- future Tile Cleaner
- future Outline tools
- future Sprite Sheet Builder

Most processing tools should be deterministic unless a feature explicitly calls generation.

### 6. Export

Exports are currently focused only on:

- Godot
- Aseprite

The export foundation should include:

- PNG output
- JSON sidecars
- manifests
- export history
- batch selected export
- clear folder conventions

---

## Asset Families

Pixel Factory should eventually understand that game assets are often families, not single files.

Example tile family:

```text
Forest Grass Tile Set
├── base grass
├── variation A
├── variation B
├── edge north
├── edge south
├── edge east
├── edge west
├── corner NE
├── corner NW
├── corner SE
├── corner SW
└── metadata
```

Example character family:

```text
Knight
├── portrait
├── idle
├── walk
├── attack
├── hurt
├── death
├── inventory icon
└── metadata
```

This direction is important because Pixel Factory should generate and manage usable game assets, not unrelated image files.

---

## Tile Studio Direction

Tile Studio is expected to become one of the most important studios.

The intended direction:

```text
Tile Studio
    → generate one top-down tile
    → make it seamless
    → create matching variation tiles
    → create edge/corner/transition tiles
    → preview the tilemap
    → export Godot-ready assets
    → optionally open or edit in Aseprite
```

Possible Tile Studio concepts:

- seamless tile generation
- nearest-neighbor preview
- repeat preview
- variant generation
- terrain sets
- autotile sets
- edge/corner matching
- blob tile support
- Wang tile support
- Godot TileSet export helpers
- tile relationship metadata

---

## Recipes vs Presets

This distinction is critical.

- **Workflow** = the actual ComfyUI graph.
- **Recipe** = the production process Pixel Factory runs.
- **Preset** = configuration/defaults for a recipe.

Recipes execute. Presets configure.

Example:

```text
Workflow:
character_flux_pixel.json

Recipe:
character.default

Presets:
fantasy_npc
dark_knight
merchant
goblin
villager
```

The UI should ask for a recipe/preset. The backend resolves that into workflow + settings + metadata.

---

## Current Hard Export Rule

Supported external tools:

- Godot
- Aseprite

Nothing else is planned.

Do not add “future export targets” to the roadmap unless the owner requests them.

---

## Archived

Past Archived tools & project:

- PixelFactory-App was an early prototype. It has been moved out of the repo. PixelFactory-Web is the active application.

---

## Development Reminder

Every new feature should answer:

1. What problem does it solve?
2. Who uses it?
3. Where does it fit in the pipeline?
4. Can it be simpler?

If the feature does not clearly help someone build a 2D game faster, cleaner, or with less friction, it probably does not belong.

## PF-0014 Active Coding Direction

Tile Studio foundation is the next active coding milestone.

The first implementation should stay small: generate base top-down tile candidates through existing ComfyUI workflow plumbing, save them as tile assets, and hand the first result to Workspace/Palette Lab.

Do not add tile variations, terrain sets, masks, seamless processing, or tilesheet builders in PF-0014. Those are later stages.

## PF-0014.2 Tile / Asset Workflow Cleanup

Tile Studio results must stay inside Tile Studio. Character Studio results must stay inside Character Studio.

Palette Lab remains a post-generation cleanup destination. It can load the current workspace or a selected recent asset so batch generations are not limited to only the first workspace image.

Asset Browser language now treats generated unsaved results as **Candidates** instead of user-facing "Incoming" assets. Accepted and favorited assets are saved library assets. Favoriting an asset automatically accepts it.

Unsaved candidates may be cleared from the Asset Browser without deleting accepted or favorited assets.


---

## PF-0014.3 Global UI Target + Candidate Cleanup

The generated dark multi-panel UI concept from PF-0014 is now the global Pixel Factory UI target, not just a Tile Studio target.

The target direction applies to the whole app:

- modern dark interface
- stronger Pixel Factory logo/brand area
- left navigation with clear studio sections
- top ComfyUI connection bar
- center production workspace
- right-side contextual browser/inspector panels where useful
- clean spacing with no cramped panels, oversized empty gaps, or broken card layouts
- consistent cards, icon buttons, badges, and filters
- asset management that feels integrated into the active workflow

PF-0014.3 also fixes candidate cleanup behavior. Clear Unsaved Candidates should delete only unsaved candidate assets, keep accepted/favorited assets, refresh the browser, and clear stale workspace state if the workspace came from a deleted candidate.

## PF-0014.6 Reload UI Cache Control

Pixel Factory now has a Reload UI button in the global top bar near the ComfyUI status controls.

This button does not restart the backend or ComfyUI. It reloads the browser UI with a cache-busting timestamp so stale frontend JavaScript/CSS is less likely to confuse local testing.

Use Reload UI when a recently patched frontend change does not appear to be running in the browser.

## PF-0014.7 Palette Lab Workspace Routing

Palette Lab is currently the active workspace/canvas destination in Pixel Factory.

The old **Set Workspace** language is too abstract for the current UI. Asset Browser actions should use **Open in Palette Lab** or **Send to Palette Lab** language.

Expected behavior:

1. User selects an asset.
2. User clicks **Open in Palette Lab**.
3. Pixel Factory sets that asset as the current workspace internally.
4. Pixel Factory navigates to Palette Lab.
5. Palette Lab immediately loads the selected asset.

The backend Workspace service can remain as implementation plumbing, but user-facing UI should treat Palette Lab as the practical editing/touch-up workspace until a separate canvas system exists.

## PF-0015.3 Export Flow Direction

Asset Browser should select assets and route them into Exporter.

Asset Browser should not expose separate direct Godot/Aseprite export actions in the inspector because that duplicates the Exporter panel. The Exporter panel is where export target, selected asset preview, and export action should live.

Palette Lab remains a single-asset workspace for now. Batch Palette Lab processing can come later if needed.


## PF-0015.5 Exporter Cleanup

Exporter is the only place where selected assets are actually exported. Asset Browser routes single or multi-selected assets into Exporter. The Exporter panel should stay focused: choose Godot or Aseprite, review the loaded selection, then run one export action. Redundant Export All Accepted and Clear Selection controls should not clutter the main Exporter panel.

## PF-0016.1 Palette Lab Workspace Workflow

Palette Lab now has a stronger workspace/editor foundation:

- current canvas metadata
- saved/modified state
- operation stack
- history list
- before/after compare slider
- discard/download result actions

This continues the direction that Palette Lab is the user-facing workspace/canvas for post-generation cleanup.
## PF-0016.3 Palette Lab Compare Cleanup

Palette Lab should not auto-load stale workspace assets on startup or when opening the Palette Lab page. It should open blank until the user explicitly opens an asset, sends one from Asset Browser, uploads one, or clicks Load Current Workspace.

The before/after compare should use a dedicated full-screen compare viewer, not the generic image viewer. The compare viewer should keep original and processed previews aligned and allow resize, palette color, and operation changes before processing again.



## PF-0017 — Pixel Snap Foundation

- Added first Palette Lab Pixel Snap processing path.
- Added Pixel Size controls for Palette Lab and compare viewer.
- Added Pixel Snap operation modes for preview processing.
- Enabled Pixel Snap cleanup card in Palette Lab.
- This is a local foundation inspired by Sprite Fusion Pixel Snapper; upstream engine integration can be evaluated later.

## PF-0017.1 Pixel Snap Direction

Pixel Snap is being built as a native Pixel Factory cleanup tool inside Palette Lab. It should not depend on a separate web UI or external server. The first native pass includes grid size, strength, palette snap, and alpha preservation controls.


## PF-0017.2 Pixel Snap Engine UI

Pixel Snap is a native Palette Lab cleanup tool, not an external web UI.

Current direction:

- detect or select a pixel grid size
- show a grid overlay when requested
- show confidence/readout information so users understand what Pixel Factory is doing
- keep the tool inside Palette Lab's design system
- use live preview when possible, with manual Apply available as fallback
---

## PF-0018.9 Native Pixel Snap Detection

Palette Lab Pixel Snap remains native to Pixel Factory. The Sprite Fusion Pixel Snapper project is a design/reference point only. Pixel Factory now performs local grid detection and returns detected grid/confidence metadata from its own backend processing route. Do not add external Pixel Snapper UI, external web servers, or alternate export targets unless the owner explicitly asks.


## PF-0018.10 Palette Cleanup Diagnostics

Palette Lab Pixel Snap is native. The current direction is to make every cleanup operation explain itself. After processing, the backend returns detected grid, confidence, palette target, resize scale, source/output colors, and changed-pixel percentage. This supports the Pixel Snapper-inspired goal of making AI pixel-art cleanup visible, testable, and understandable inside Pixel Factory without external services.

## PF-0019.1 Palette Lab Canvas Controls Cleanup

Palette Lab continues the single-canvas direction. Preview/apply/download controls are consolidated in the canvas toolbar. Repair Toolbox no longer exposes a second Force Update action and is reserved for tool settings. Diagnostics now live as compact chips in the Canvas header. Palette Lab control toggles preserve scroll position to prevent the page from jumping while tuning settings.
