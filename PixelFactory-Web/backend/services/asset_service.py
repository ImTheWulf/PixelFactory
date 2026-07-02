from __future__ import annotations

import json
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any


class AssetService:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.incoming = project_root / "Incoming"
        self.accepted = project_root / "Accepted"
        self.metadata = project_root / "metadata"
        for p in [self.incoming / "Characters", self.incoming / "Tiles", self.incoming / "Repairs", self.accepted / "Characters", self.accepted / "Tiles", self.accepted / "Repairs", self.metadata]:
            p.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _slug(text: str, fallback: str = "asset") -> str:
        safe = "".join(ch.lower() if ch.isalnum() else "_" for ch in text.strip())
        safe = "_".join(part for part in safe.split("_") if part)
        return safe[:48] or fallback

    def _rel(self, path: Path) -> str:
        return path.relative_to(self.project_root).as_posix()

    def metadata_path(self, asset_id: str) -> Path:
        return self.metadata / f"{asset_id}.json"

    def asset_url(self, asset_id: str) -> str:
        return f"/api/assets/{asset_id}/image"

    def save_asset(self, image_bytes: bytes, asset_type: str, **meta_values: Any) -> dict[str, Any]:
        prompt = str(meta_values.get("prompt", ""))
        batch_index = int(meta_values.get("batch_index", 0))
        asset_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        name = f"{self._slug(prompt, asset_type)}_{batch_index + 1:02d}"
        folder_name = "Characters" if asset_type == "character" else asset_type.capitalize()
        folder = self.incoming / folder_name
        folder.mkdir(parents=True, exist_ok=True)
        image_path = folder / f"{asset_id}.png"
        image_path.write_bytes(image_bytes)
        meta = {
            "id": asset_id,
            "name": name,
            "type": asset_type,
            "status": "incoming",
            "image_path": self._rel(image_path),
            "created": datetime.now().isoformat(timespec="seconds"),
            **meta_values,
        }
        self.metadata_path(asset_id).write_text(json.dumps(meta, indent=2), encoding="utf-8")
        meta["image_url"] = self.asset_url(asset_id)
        return meta

    def load(self, asset_id: str) -> dict[str, Any] | None:
        path = self.metadata_path(asset_id)
        if not path.exists():
            return None
        meta = json.loads(path.read_text(encoding="utf-8"))
        meta["image_url"] = self.asset_url(asset_id)
        return meta

    def list(self, status: str | None = None, asset_type: str | None = None) -> list[dict[str, Any]]:
        assets: list[dict[str, Any]] = []
        for path in sorted(self.metadata.glob("*.json"), reverse=True):
            try:
                meta = json.loads(path.read_text(encoding="utf-8"))
            except Exception:
                continue
            if status and meta.get("status") != status:
                continue
            if asset_type and meta.get("type") != asset_type:
                continue
            meta["image_url"] = self.asset_url(meta["id"])
            assets.append(meta)
        return assets

    def image_path(self, asset_id: str) -> Path | None:
        meta = self.load(asset_id)
        if not meta:
            return None
        return self.project_root / meta["image_path"]

    def accept(self, asset_id: str) -> dict[str, Any] | None:
        meta = self.load(asset_id)
        if not meta:
            return None
        old_path = self.project_root / meta["image_path"]
        if not old_path.exists():
            return None
        folder_name = "Characters" if meta.get("type") == "character" else str(meta.get("type", "Assets")).capitalize()
        target_folder = self.accepted / folder_name
        target_folder.mkdir(parents=True, exist_ok=True)
        new_path = target_folder / old_path.name
        if old_path.resolve() != new_path.resolve():
            shutil.copy2(old_path, new_path)
        meta["status"] = "accepted"
        meta["accepted"] = datetime.now().isoformat(timespec="seconds")
        meta["accepted_image_path"] = self._rel(new_path)
        clean = {k: v for k, v in meta.items() if k != "image_url"}
        self.metadata_path(asset_id).write_text(json.dumps(clean, indent=2), encoding="utf-8")
        meta["image_url"] = self.asset_url(asset_id)
        return meta

    def delete(self, asset_id: str) -> bool:
        meta = self.load(asset_id)
        if not meta:
            return False
        for key in ["image_path", "accepted_image_path"]:
            value = meta.get(key)
            if value:
                path = self.project_root / value
                if path.exists():
                    path.unlink()
        mp = self.metadata_path(asset_id)
        if mp.exists():
            mp.unlink()
        return True
