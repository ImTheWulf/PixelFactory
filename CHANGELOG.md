## PF-0019.1 - Palette Lab canvas controls cleanup

- Moved Palette Lab diagnostics into the main Canvas header as compact chips.
- Moved Apply Preview into the Canvas toolbar beside Update Preview.
- Removed the visible duplicate Force Update action from Repair Toolbox.
- Kept Repair Toolbox focused on tool controls only.
- Added scroll-position protection so Palette Lab toggles do not jump the page to the bottom.

## PF-0019.0 - Palette Lab single-canvas consolidation

- Consolidated Palette Lab around one primary Canvas instead of duplicate Original/Processed/Compare work areas.
- Reframed fullscreen compare as inspection mode only.
- Moved editing controls back to the main Palette Lab repair toolbox.
- Added canvas toolbar actions for Fit, 1:1, Grid, Difference, Inspect, Update Preview, and Download.
- Converted Processing Pipeline into compact chips with an expandable detail view.
- Kept History collapsed as an undo-style timeline foundation.


## PF-0018.10 - Palette cleanup diagnostics

- Added native Pixel Snap cleanup diagnostics after processing.
- Backend now returns source/output color counts, changed-pixel count, changed percentage, detected grid, confidence, and resize scale.
- Palette Lab readout now shows Colors, Pixels Changed, and Resize so users can understand what the cleanup actually did.

## PF-0018.9 - Native Pixel Snap detection pass
- Improved Palette Lab's native Pixel Snap auto-detection using image reconstruction scoring instead of only canvas-size guessing.
- Backend now returns detected grid, confidence, palette target, and resize scale with every Palette Lab process result.
- Pixel Snap readout now shows processed-result metadata after Update Preview and falls back to estimated values before processing.
- Kept the workflow native to Pixel Factory; no external Pixel Snapper UI, web server, or route dependency was added.

## PF-0018.8 - Palette Lab apply preview flow
- Added Apply Preview so processed output can become the active Palette Lab canvas without immediately saving.
- Save / Save As / Download can now use either the current processed preview or an applied unsaved canvas.
- Applying a preview marks the canvas as unsaved and keeps the current accepted asset relationship intact.
- Saving a Palette Lab result promotes the saved image back into the active canvas and clears stale processed-preview state.
- Kept Candidate generation separate from Palette Lab editing; Save As still creates accepted assets only.

## PF-0018.7 - Palette Lab save flow polish
- Added a native Save As dialog instead of the browser prompt.
- Save As now clearly creates a new accepted asset, never a temporary Candidate.
- Save now only overwrites accepted assets; Candidates and uploads must use Save As.
- Palette Lab now keeps source asset status clearer while editing and after saving.
- Added backend protection against overwriting Candidate assets from Palette Lab.

## PF-0018.6 - Palette Lab color cleanup clarity
- Added Original colors palette target so Palette Lab can keep the source palette without forced color reduction.
- Removed the visible Snap Colors toggle from the main Color Cleanup UI to reduce confusion.
- Color Cleanup now controls palette reduction while Pixel Snap controls grid cleanup.
- Prevented Palette Lab from jumping/scrolling to the bottom when toggles are clicked.
- Backend processing now treats palette color value 0 as keep original colors.


## PF-0018.5 - Palette Lab primary compare workflow
- Made the before/after compare panel the primary Palette Lab work canvas.
- Hid redundant Original/Processed panels while keeping their image state available internally.
- Renamed Discard Preview to Discard and made it reset the Palette Lab session.
- Moved Update Preview and Download PNG into the compare canvas header.
- Renamed Pixel Snap update action to Force Update.


## PF-0018.3 - Palette Lab tool toggle polish
- Polished Palette Lab tool toggles into consistent on/off pill buttons.
- Added green/red toggle states for Pixel Snap, Color Cleanup, Resize, grid, transparency, and auto-update controls.
- Tightened Pixel Snap tool layout so toggles sit with their related settings.
- Kept `.venv` excluded from release zip.


## PF-0018.2 - Palette Lab tool controls cleanup
- Moved Palette Lab load/upload flow into the main canvas header.
- Consolidated resize, palette, and Pixel Snap settings into the Pixel Snap tool panel.
- Replaced operation dropdown workflow with native on/off tool toggles.
- Made Original/Processed Fit and 1:1 controls center the preview viewport.


## PF-0018 — Palette Lab Editor Save Flow

- Replaced Palette Lab Candidate save flow with editor-style Save and Save As.
- Save now updates the currently loaded asset instead of creating a Candidate.
- Save As creates a new accepted asset with source/edit metadata.
- Palette Lab edits now preserve non-destructive history metadata on the asset.
- Renamed Operation Stack to Processing Pipeline for clearer editor language.


## PF-0017.7 — Palette Lab Save Result Flow

- Added native save flow for processed Palette Lab previews.
- Palette Lab results can now be saved as Candidate assets or saved and accepted immediately.
- Saved cleanup results preserve source asset context, Palette Lab operation settings, and cleanup tags.

## PF-0017.6 — Difference View and Pixel Inspector

- Added a Difference mode to the Palette Lab compare viewer.
- Added hover pixel inspector readout for original and processed pixels.
- Updated Pixel Factory version/cache labels.

## PF-0017.5 — Pixel Snap Grid Overlay and Workflow Compact

- Compacted Palette Lab History and Operation Stack when collapsed.
- Fixed grid overlay sizing so it follows the rendered image bounds instead of filling the empty preview area.
- Kept grid overlays out of the main Original/Processed preview cards.
- Updated Palette Lab version/cache label.


## PF-0017.4 — Pixel Snap Live Preview/Grid Polish

- Clarified Live Preview as Auto-update Preview.
- Auto-update Preview now actually controls automatic preview processing.
- Pixel Snap grid overlay is locked to the compare canvas while zooming/panning.
- Improved compare overlay refresh after zoom and compare layout changes.

## PF-0017.2 — Pixel Snap Engine UI

- Added Pixel Snap readout for detected grid, confidence, and palette target.
- Added optional grid overlay for Palette Lab previews and compare viewer.
- Added live preview toggle for Pixel Snap controls.
- Improved native Pixel Snap tool feedback inside Palette Lab.


## PF-0017.1 — Native Pixel Snap Panel

- Hardened Palette Lab process requests to avoid HTTP 422 payload mismatches.
- Added native Pixel Snap controls for grid size, strength, palette snapping, and alpha preservation.
- Improved Pixel Snap processing as a first-class Palette Lab cleanup tool.
- Added clearer processing errors from the backend.

## PF-0016.11 — Palette Compare Zoom Origin

- Improved Palette Lab compare viewer zoom origin so first zoom does not jump to the top-left.
- Kept compare canvas centered when smaller than the viewport.
- Reviewed Sprite Fusion Pixel Snapper as the target direction for Palette Lab pixel snap/repair integration.

## PF-0016.9 — Palette Compare Interaction Polish

- Removed the compare divider handle so the before/after line stays clean.
- Improved compare viewer wheel zoom so zooming anchors near the cursor instead of jumping to the top-left.
- Centered Palette Lab actual-pixels preview mode so images do not snap left when switching modes.


## PF-0016.8 — Palette Lab Workflow and Live Editing Foundation

- Simplified Palette Lab sidebar asset loading into a single current asset / change asset flow.
- Added automatic preview refresh when Palette Lab processing controls change.
- Added compare viewer keyboard shortcuts and panning foundation.
- Polished before/after compare slider handle.

## PF-0016.7 — Palette Compare Zoom Fix

- Fixed compare viewer zoom so before/after layers scale together.
- Added output resolution feedback after Palette Lab processing.
- Made processed preview history include operation, palette color count, and resize scale.
- Tightened compare viewer behavior so resize/palette changes are easier to confirm.


## PF-0016.5 — Palette Lab Live Compare Polish

- Renamed routed workspace wording to clearer Asset from Browser language.
- Added finer palette color options from 2 through 24 colors.
- Expanded Palette Lab compare viewer to use nearly the full screen.
- Added Ctrl/Shift + mouse wheel zoom inside the compare viewer.
- Compare viewer controls now auto-update the processed preview with a short debounce.
- Tightened compare viewer controls so they no longer take excessive vertical space.


## PF-0016.3 — Palette Compare Cleanup

- Palette Lab no longer auto-loads the previous workspace just by opening the page.
- Renamed workspace loading action to Load Current Workspace.
- Added a dedicated full-screen Palette Lab compare viewer.
- Compare viewer includes resize, palette color, and operation controls.
- Compare preview keeps original and processed images aligned for before/after review.

## PF-0016.1 — Palette Lab Workspace Workflow

- Added current workspace metadata cards for type, status, recipe, and resolution.
- Added saved/modified dirty state for Palette Lab previews.
- Added Palette Lab history list for load/process/download/discard actions.
- Added an operation stack foundation for palette reduction, resize, and future cleanup tools.
- Added before/after compare panel with slider after processing.
- Added Download Result and Discard Preview workspace actions.

## PF-0016 — Palette Lab Workspace Foundation

- Upgraded Palette Lab into a clearer workspace/canvas foundation.
- Added loaded asset state inside Palette Lab.
- Added Palette Lab workspace action card with Browse Assets and New Tile shortcuts.
- Added cleanup tool dock for future Pixel Snap, Repair Bench, Chroma Key, and Edge Cleanup.
- Polished original/processed preview panels for workspace use.

## PF-0015.10 — Viewer and Selection Controls

- Empty Asset Browser space now clears the active selection.
- Image viewer now supports Download All for multi-image collections.
- Shift + mouse wheel now moves previous/next through selected viewer images.
- Updated cache-buster and version label.

## PF-0015.9 — Multi-select Action Polish

- Standardized multi-select inspector action button sizing.
- Renamed multi-select export action to Export Selected.
- Added View Images to the bottom selection bar.
- Hooked Exporter empty-state Browse Assets button to return to Asset Browser.
- Cleaned Candidate wording in multi-select status summaries.

## PF-0015.8 — Candidate Actions and Selection Viewer

- Renamed Clear Unsaved Candidates to Delete Unsaved Candidates in the UI.
- Added multi-selected asset thumbnail opening in the image viewer.
- Added previous/next controls and thumbnail strip for selected image viewer sets.
- Added Favorite Selected, Accept Selected, Download Selected, and Export actions to multi-select inspector.
- Continued user-facing candidate wording cleanup.

## PF-0015.7 — Selection Behavior Cleanup

- Normal asset clicks now exit multi-select mode and inspect only the clicked asset.
- Modifier-click remains the explicit multi-select behavior.
- Selection state clears when leaving Asset Browser unless routing into Exporter.
- Bottom multi-select bar no longer persists across unrelated studios.
- Centered the main Exporter action button.


## PF-0015.6 — Selection and Export Cleanup

- Removed confusing add/remove selection action from the single-asset inspector.
- Moved favorite/unfavorite into the inspector image overlay.
- Kept Asset Browser selection editing focused on Shift/Ctrl/Cmd multi-select.
- Simplified Exporter to one main export action after choosing Godot or Aseprite.
- Collapsed export paths/history/manifest information behind a details panel.
- Tightened accepted/candidate status badge styling.

## PF-0015.5 — Exporter selection cleanup

- Cleaned Exporter to use one focused export action for loaded selections.
- Removed redundant Export All Accepted and Clear Selection actions from the main Exporter panel.
- Kept Godot/Aseprite target choice inside the Exporter panel.
- Hid the bottom multi-select bar while viewing Exporter so selection routing does not duplicate Exporter controls.
- Removed Clear Selection from the multi-select inspector and added selected download/accept utility actions.

## PF-0015.4 — Exporter Panel Actions

- Added export target controls directly inside the Exporter selection panel.
- Added Export Selected, Export All Accepted, and Clear Selection actions to the main Exporter panel.
- Updated Exporter language from Incoming assets to Candidate assets.
- Kept Asset Browser export routing focused on sending assets into the Exporter.


## PF-0015.3 — Export Routing Cleanup

- Removed redundant direct Godot/Aseprite export setup buttons from Asset Browser inspector.
- Removed Asset Browser sidebar export target controls.
- Consolidated asset export flow through the Exporter panel.
- Added selected asset preview thumbnails and selection summaries to the Exporter panel.
- Kept Palette Lab single-asset routing separate from batch export routing.

## PF-0015.2 — Asset Multi-Select Foundation

- Removed the small Export checkbox pill from asset thumbnails.
- Added Shift/Ctrl/Cmd-click multi-select behavior in Asset Browser.
- Added selected asset highlighting and a bottom selection bar.
- Added multi-select Inspector summary with preview thumbnails, type/status counts, and tag summary.
- Multi-selected assets can now be routed into Exporter for Godot or Aseprite setup.
- Updated visible version label to PF-0015.2.

## PF-0015.1 — Export Routing and UI Control Polish

- Routed asset inspector export actions into the Exporter instead of exporting immediately.
- Selecting Godot or Aseprite export setup now loads the asset into the Exporter with the selected target.
- Improved dropdown/select contrast for dark theme consistency.
- Moved Repair Bench direction under Palette Lab as a future one-click repair/cleanup tool.
- Updated version label to PF-0015.1.

## PF-0015 — Global Design Foundation

- Added Start screen as the default application landing view.
- Added global icon navigation foundation.
- Added refreshed brand lockup and PF-0015 version label.
- Added shared design-system CSS tokens for the future Pixel Factory UI refresh.
- Cleaned the Asset Inspector action language around Palette Lab.

## PF-0014.6 — Reload UI Cache Control

- Added a top-bar Reload UI button beside the ComfyUI Check control.
- Reload UI appends a cache-busting timestamp query parameter so stale frontend files are easier to flush during local testing.
- Updated frontend asset cache-buster strings and visible PF version label to PF-0014.6.

## PF-0014.4 — Candidate Favorite and Cleanup Fix

- Fixed candidate cleanup so unsaved Candidate assets are deleted from metadata and image storage.
- Kept Accepted and Favorite assets safe during cleanup.
- Confirmed Favorite promotes Candidate assets to Accepted.
- Standardized tile asset storage folders to `Incoming/Tiles` and `Accepted/Tiles`.

## PF-0014 - Tile Studio Foundation

- Enabled Tile Studio navigation and first-pass UI.
- Added tile recipe loading and defaults.
- Added Tile Studio seed, size, batch, and steps controls.
- Added `/api/generate/tile` backend route.
- Tile generations now save as `tile` assets with metadata.
- First generated tile is sent to Workspace for Palette Lab cleanup.
- Kept Tile Studio focused on base tile candidates only; seamless cleanup, variations, masks, and tilesheets remain future work.

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

## PF-0016.4 — Palette Lab workflow clarity

- Renamed workspace language to routed asset / loaded canvas for clarity.
- Made Palette Lab processing action more prominent.
- Removed redundant disabled repair-tools sidebar button.
- Synchronized compare viewer controls with Palette Lab sidebar controls.
- Tightened compare modal control layout and image alignment.


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

## PF-0014.2 — Tile / Asset Workflow Cleanup

- Kept Tile Studio generation results routed to Tile Studio.
- Added Palette Lab source selection for recent assets.
- Improved Palette Lab preview containment for larger generated assets.
- Added Asset Browser type filter and sort controls.
- Renamed user-facing Incoming language to Candidate language.
- Added cleanup for unsaved candidate assets.
- Made favorites automatically accept/save assets.


## PF-0014.3 — Candidate Cleanup Fix

- Fixed Clear Unsaved Candidates so it deletes unsaved candidate assets from disk and metadata.
- Kept accepted and favorited assets safe during candidate cleanup.
- Clears stale workspace state if the current workspace points to a deleted candidate.
- Documented the PF-0014 generated dark multi-panel UI concept as the global Pixel Factory UI target.


## PF-0017 — Pixel Snap Foundation

- Added first Palette Lab Pixel Snap processing path.
- Added Pixel Size controls for Palette Lab and compare viewer.
- Added Pixel Snap operation modes for preview processing.
- Enabled Pixel Snap cleanup card in Palette Lab.
- This is a local foundation inspired by Sprite Fusion Pixel Snapper; upstream engine integration can be evaluated later.


## PF-0018.1
- Unified Palette Lab layout around the loaded canvas.
- Moved Processing Pipeline and History into the canvas area.
- Removed duplicate sidebar Pixel Size control; Pixel Snap Grid Size now drives snap pixel size.
- Added preview camera controls and compare grid toggle.

## PF-0018.4 - Compare Viewer Control Polish
- Tightened Palette Lab compare viewer controls so the image area stays dominant.
- Added a compact Review Controls label to clarify compare controls are synced with Palette Lab.
- Polished compare toolbar button sizing/alignment.
- Strengthened compare grid overlay layering and on/off visual states.
