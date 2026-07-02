from __future__ import annotations

from typing import Any

from backend.comfy.client import ComfyClient


class EngineService:
    """Engine boundary. Today this talks to ComfyUI; later it can route to other engines."""

    def comfy_status(self, url: str) -> dict[str, Any]:
        return ComfyClient(url).status()

    def run_comfy(self, url: str, api_prompt: dict[str, Any], timeout_seconds: int = 600) -> list[bytes]:
        return ComfyClient(url).run_prompt_and_get_images(api_prompt, timeout_seconds=timeout_seconds)
