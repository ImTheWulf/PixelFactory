from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any


class WorkspaceService:
    """Tracks the current working image for Pixel Factory.

    The workspace is intentionally temporary. It is the image currently moving
    through the pipeline: generate -> palette -> repair -> export.
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.workspace = project_root / "Workspace"
        self.workspace.mkdir(parents=True, exist_ok=True)
        self.image_file = self.workspace / "current.png"
        self.meta_file = self.workspace / "current.json"

    def set_from_bytes(self, image_bytes: bytes, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
        self.image_file.write_bytes(image_bytes)
        meta = {
            "has_image": True,
            "image_path": self.image_file.relative_to(self.project_root).as_posix(),
            "image_url": "/api/workspace/image",
            "updated": datetime.now().isoformat(timespec="seconds"),
            **(metadata or {}),
        }
        self.meta_file.write_text(json.dumps(meta, indent=2), encoding="utf-8")
        return meta

    def set_from_asset(self, asset: dict[str, Any], image_path: Path) -> dict[str, Any]:
        data = image_path.read_bytes()
        return self.set_from_bytes(
            data,
            {
                "source": "asset",
                "asset_id": asset.get("id"),
                "asset_name": asset.get("name"),
                "asset_type": asset.get("type"),
                "status": asset.get("status"),
                "prompt": asset.get("prompt", ""),
                "recipe_id": asset.get("recipe_id", ""),
                "workflow": asset.get("workflow", ""),
                "width": asset.get("width"),
                "height": asset.get("height"),
            },
        )

    def get(self) -> dict[str, Any]:
        if not self.image_file.exists():
            return {"has_image": False}
        if self.meta_file.exists():
            try:
                meta = json.loads(self.meta_file.read_text(encoding="utf-8"))
            except Exception:
                meta = {}
        else:
            meta = {}
        meta.update({"has_image": True, "image_url": "/api/workspace/image"})
        return meta

    def image_path(self) -> Path | None:
        if not self.image_file.exists():
            return None
        return self.image_file

    def clear(self) -> dict[str, Any]:
        if self.image_file.exists():
            self.image_file.unlink()
        if self.meta_file.exists():
            self.meta_file.unlink()
        return {"has_image": False}
