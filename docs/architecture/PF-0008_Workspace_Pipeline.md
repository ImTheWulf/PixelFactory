# PF-0008 Workspace Pipeline

Pixel Factory now has a temporary workspace image.

The workspace represents the image currently moving through the production pipeline:

```text
Generate → Workspace → Palette Lab → Repair Bench → Export
```

The Asset Browser remains the library. The Workspace is the active document.

## Backend

`WorkspaceService` stores:

- `PixelFactory-Projects/default/Workspace/current.png`
- `PixelFactory-Projects/default/Workspace/current.json`

## API

- `GET /api/workspace`
- `GET /api/workspace/image`
- `POST /api/workspace/from-asset/{asset_id}`
- `POST /api/workspace/clear`

## Design Rule

Studios create assets. Tools operate on the current workspace.
