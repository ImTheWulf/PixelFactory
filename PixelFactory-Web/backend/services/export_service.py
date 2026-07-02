from __future__ import annotations

import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from backend.services.asset_service import AssetService


class ExportError(ValueError):
    pass


class ExportService:
    """Copies curated Pixel Factory assets into external-tool export folders.

    PF-0013 is intentionally PNG-first. Godot and Aseprite can both consume PNGs,
    and later iterations can add Godot .import helpers, sprite sheets, frame data,
    or Aseprite CLI/.aseprite support without changing the public API shape.
    """

    TARGETS = {"godot": "Godot", "aseprite": "Aseprite"}

    def __init__(self, project_root: Path, asset_service: AssetService):
        self.project_root = project_root
        self.asset_service = asset_service
        self.exports = project_root / "Exports"
        for target_name in self.TARGETS.values():
            (self.exports / target_name).mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _slug(text: str, fallback: str = "asset") -> str:
        safe = "".join(ch.lower() if ch.isalnum() else "_" for ch in text.strip())
        safe = "_".join(part for part in safe.split("_") if part)
        return safe[:64] or fallback

    @staticmethod
    def _bucket(asset_type: str) -> str:
        if asset_type == "character":
            return "Characters"
        if asset_type == "tile":
            return "Tiles"
        if asset_type == "repair":
            return "Repairs"
        return "Assets"

    def _target_root(self, target: str) -> Path:
        key = target.lower().strip()
        if key not in self.TARGETS:
            raise ExportError("Export target must be either 'godot' or 'aseprite'.")
        path = self.exports / self.TARGETS[key]
        path.mkdir(parents=True, exist_ok=True)
        return path

    def _rel(self, path: Path) -> str:
        return path.relative_to(self.project_root).as_posix()

    def _manifest_path(self, target_root: Path) -> Path:
        return target_root / "manifest.json"

    def _load_manifest(self, target_root: Path) -> dict[str, Any]:
        path = self._manifest_path(target_root)
        if not path.exists():
            return {"version": 1, "tool": target_root.name, "updated": None, "exports": []}
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(data.get("exports"), list):
                data["exports"] = []
            return data
        except Exception:
            return {"version": 1, "tool": target_root.name, "updated": None, "exports": []}

    def _write_manifest(self, target_root: Path, record: dict[str, Any]) -> dict[str, Any]:
        manifest = self._load_manifest(target_root)
        exports = [item for item in manifest.get("exports", []) if item.get("asset_id") != record["asset_id"]]
        exports.insert(0, record)
        manifest["exports"] = exports
        manifest["updated"] = datetime.now().isoformat(timespec="seconds")
        self._manifest_path(target_root).write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        return manifest

    def export_asset(self, asset_id: str, target: str) -> dict[str, Any]:
        meta = self.asset_service.load(asset_id)
        if not meta:
            raise ExportError("Asset not found.")
        image_path = self.asset_service.image_path(asset_id)
        if not image_path or not image_path.exists():
            raise ExportError("Asset image missing.")

        target_root = self._target_root(target)
        bucket = self._bucket(str(meta.get("type", "asset")))
        folder = target_root / bucket
        folder.mkdir(parents=True, exist_ok=True)

        base_name = self._slug(str(meta.get("name") or meta.get("id") or "asset"), "asset")
        filename = f"{base_name}_{asset_id[-8:]}.png"
        export_path = folder / filename
        shutil.copy2(image_path, export_path)

        sidecar_path = export_path.with_suffix(".json")
        sidecar = {
            "asset_id": asset_id,
            "name": meta.get("name"),
            "type": meta.get("type"),
            "status": meta.get("status"),
            "source_image_path": meta.get("active_image_path") or meta.get("accepted_image_path") or meta.get("image_path"),
            "export_target": target.lower().strip(),
            "exported_at": datetime.now().isoformat(timespec="seconds"),
            "prompt": meta.get("prompt", ""),
            "negative_prompt": meta.get("negative_prompt", ""),
            "seed": meta.get("seed"),
            "recipe_id": meta.get("recipe_id"),
            "workflow": meta.get("workflow"),
            "tags": meta.get("tags", []),
            "notes": meta.get("notes", ""),
        }
        sidecar_path.write_text(json.dumps(sidecar, indent=2), encoding="utf-8")

        record = {
            "asset_id": asset_id,
            "name": meta.get("name"),
            "type": meta.get("type"),
            "status": meta.get("status"),
            "target": target.lower().strip(),
            "image_path": self._rel(export_path),
            "metadata_path": self._rel(sidecar_path),
            "exported_at": sidecar["exported_at"],
        }
        self._write_manifest(target_root, record)
        return {"ok": True, "export": record, "manifest_path": self._rel(self._manifest_path(target_root))}

    def export_accepted(self, target: str) -> dict[str, Any]:
        exported = []
        failures = []
        for asset in self.asset_service.list(status="accepted"):
            try:
                exported.append(self.export_asset(asset["id"], target)["export"])
            except Exception as exc:
                failures.append({"asset_id": asset.get("id"), "error": str(exc)})
        return {"ok": not failures, "target": target.lower().strip(), "count": len(exported), "exports": exported, "failures": failures}

    def status(self) -> dict[str, Any]:
        targets = {}
        accepted_assets = self.asset_service.list(status="accepted")
        incoming_assets = self.asset_service.list(status="incoming")
        for key, label in self.TARGETS.items():
            root = self.exports / label
            manifest = self._load_manifest(root)
            exports = manifest.get("exports", [])
            enriched_exports = []
            for item in exports[:12]:
                image_path = self.project_root / str(item.get("image_path", ""))
                metadata_path = self.project_root / str(item.get("metadata_path", ""))
                enriched_exports.append({
                    **item,
                    "image_exists": image_path.exists(),
                    "metadata_exists": metadata_path.exists(),
                })
            targets[key] = {
                "folder": self._rel(root),
                "manifest_path": self._rel(self._manifest_path(root)),
                "manifest_exists": self._manifest_path(root).exists(),
                "count": len(exports),
                "updated": manifest.get("updated"),
                "recent_exports": enriched_exports,
            }
        return {
            "ok": True,
            "exports_root": self._rel(self.exports),
            "accepted_count": len(accepted_assets),
            "incoming_count": len(incoming_assets),
            "targets": targets,
        }
