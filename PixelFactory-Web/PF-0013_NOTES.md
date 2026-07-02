# PF-0013 Export Foundation: Godot + Aseprite

Pixel Factory now has a PNG-first export foundation for the two external tools this project is designed to support: Godot and Aseprite.

## Added

- `backend/services/export_service.py`
  - Exports individual assets to `PixelFactory-Projects/default/Exports/Godot` or `PixelFactory-Projects/default/Exports/Aseprite`.
  - Copies the active asset image, preferring the accepted copy when present.
  - Writes a sidecar JSON file beside every exported PNG.
  - Maintains a per-target `manifest.json`.
- API routes:
  - `GET /api/exports`
  - `POST /api/assets/{asset_id}/export`
  - `POST /api/exports/{target}/accepted`
- UI:
  - Export buttons in the Asset Inspector: `Export Godot` and `Export Aseprite`.
  - New Exporter view for export status and bulk accepted-asset export.

## Intentional scope

This milestone is PNG-first. Godot and Aseprite both work with PNG files, so the first foundation avoids pretending we have deeper integrations before they are real.

Later iterations can add:

- Godot import helper files.
- Sprite sheet export.
- Frame/tag metadata.
- Aseprite CLI integration.
- `.aseprite` document export/import workflows.
