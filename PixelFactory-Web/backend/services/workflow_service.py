from __future__ import annotations

from pathlib import Path
from typing import Any

from backend.comfy.client import load_workflow


class WorkflowError(RuntimeError):
    pass


class WorkflowService:
    """Resolves workflow ids to Comfy workflow JSON files."""

    def __init__(self, workflows_root: Path):
        self.workflows_root = workflows_root

    def resolve(self, workflow_id: str) -> Path:
        if not workflow_id or "/" in workflow_id or "\\" in workflow_id or ".." in workflow_id:
            raise WorkflowError(f"Invalid workflow id: {workflow_id!r}")
        path = self.workflows_root / f"{workflow_id}.json"
        if not path.exists():
            raise WorkflowError(f"Workflow not found: {workflow_id}")
        return path

    def load(self, workflow_id: str) -> dict[str, Any]:
        return load_workflow(self.resolve(workflow_id))

    def list(self) -> list[dict[str, str]]:
        if not self.workflows_root.exists():
            return []
        return [
            {"id": path.stem, "path": str(path.relative_to(self.workflows_root))}
            for path in sorted(self.workflows_root.glob("*.json"))
        ]
