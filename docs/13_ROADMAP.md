# 13 — Roadmap

> This is the active planning document for Pixel Factory. It should stay focused and should not become a random wishlist.

---

## Current Milestone: PF-0100 Documentation Consolidation

Goal:

- Make `/docs` the single source of truth.
- Remove redundant `docs` references.
- Preserve useful old docs by moving them under `/docs`.
- Clarify long-term product direction.
- Clarify recipes vs presets.
- Clarify Godot + Aseprite only export scope.

---

## Completed / Recent

### PF-0007 — Recipe Framework

- Added `recipes/` folder.
- Added `presets/` folder.
- Added `RecipeService`.
- Added `WorkflowService`.
- Added `EngineService`.
- Added `AssetService`.
- Character Studio loads defaults from `character.default`.
- Character generation records `recipe_id` and resolved prompt in metadata.

### PF-0008 — Workspace Pipeline

- Added `WorkspaceService`.
- Added `/api/workspace` endpoints.
- Latest Character Studio generation becomes current workspace image.
- Palette Lab can load current workspace image.
- Asset Browser can set an asset as current workspace.

### PF-0009 — Universal Image Viewer

- Full-screen modal viewer.
- Fit-to-window mode.
- Actual pixel / 1:1 mode.
- Zoom controls.
- Mouse wheel zoom.
- Drag/pan while zoomed.
- Keyboard shortcuts.

### PF-0010 — Asset Metadata + Inspector Polish

- Editable asset name.
- Editable tags.
- Editable notes.
- Favorite toggle.
- Improved inspector.
- Generation metadata grid.
- File path display.
- Copy buttons for prompt fields.
- Backend metadata update endpoint.

### PF-0011 — Generation Settings Fix

- Resolve random seeds inside Pixel Factory before sending to ComfyUI.
- Save actual seed to metadata.
- Show actual seed in Character Studio.
- Add Use Random Seed and Reuse Last Seed controls.
- Keep KSampler fixed to the actual seed for reproducible assets.
- Keep generation sizes restricted to safe square values for now.

### PF-0012 — UI Layout + Asset Filter Polish

- Moved ComfyUI connection controls to top status area.
- Added Favorites filter to Asset Browser.
- Improved asset badges and sidebar behavior.
- Improved seed controls.

### PF-0013 — Export Foundation

- Godot export foundation.
- Aseprite export foundation.
- PNG-first export.
- JSON sidecars.
- Per-target manifest files.
- Export verification.
- Export selected assets.
- Asset Browser export checkboxes.
- Export UI cleanup and star alignment fixes.

---

## Next Planned Work

### PF-0014 — Tile Studio Foundation

Goal:

Create the first usable Tile Studio.

Initial scope:

- Tile Studio page/studio shell.
- Top-down tile generation UI.
- Tile recipe support.
- Workspace integration.
- Seamless/repeat preview.
- Save tile asset metadata.
- Send tile to Asset Browser.
- Godot/Aseprite export compatibility.

Do not overbuild autotile generation in the first pass.

### PF-0015 — Recipe System Expansion

Goal:

Turn recipes into stable production blueprints.

Scope:

- Recipe registry.
- Recipe metadata.
- Recipe categories by studio.
- Recipe validation.
- Better backend resolution from recipe → workflow → engine settings.
- Recipe UI selector.

### PF-0016 — Preset System Expansion

Goal:

Presets configure recipes without changing recipe logic.

Scope:

- Preset registry.
- Preset metadata.
- Preset selector.
- Preset categories.
- Preset defaults for prompt, style, size, palette, and asset type.

### PF-0017 — Asset Families

Goal:

Represent related outputs as one production unit.

Scope:

- Family id.
- Parent/child relationships.
- Tile families.
- Character families.
- Family-aware Asset Browser display.
- Metadata relationship tracking.

### PF-0018 — Tile Variation Tools

Goal:

Create related tiles from a base tile.

Scope:

- Generate variations from current tile.
- Mark variants as part of a tile family.
- Basic tile grid preview.
- Save variation metadata.

### PF-0019 — Export Polish

Goal:

Make current Godot/Aseprite export foundation feel production-ready.

Scope:

- Export history UI.
- Better manifest display.
- Open export folder button.
- Export selected/family options.
- Export naming rules.

---

## Persistent Planning Rules

- Keep Godot and Aseprite as the only planned external targets.
- Keep ComfyUI hidden behind recipes and studios.
- Keep the application centered on 2D game asset production.
- Put ideas in `14_FEATURES.md`, not directly into active roadmap.
- Update `00_PROJECT_MEMORY.md` whenever a major product decision changes.

## PF-0014.2 — Tile / Asset Workflow Cleanup

Status: Added

- Keep Tile Studio and Character Studio generation results isolated.
- Improve Palette Lab asset loading after batch generation.
- Rename user-facing incoming assets to candidates.
- Add better Asset Browser filtering by status and type.
- Make favoriting automatically accept/save the asset.
- Add cleanup path for unsaved candidates.

