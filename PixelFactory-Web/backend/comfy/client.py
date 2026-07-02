from __future__ import annotations

import copy
import json
import time
import uuid
from pathlib import Path
from typing import Any

import requests


class ComfyError(RuntimeError):
    pass


class ComfyClient:
    def __init__(self, base_url: str = "http://127.0.0.1:8188", timeout: float = 15.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.client_id = str(uuid.uuid4())

    def status(self) -> dict[str, Any]:
        try:
            r = requests.get(f"{self.base_url}/system_stats", timeout=3)
            r.raise_for_status()
            return {"connected": True, "url": self.base_url, "system": r.json()}
        except Exception as exc:
            return {"connected": False, "url": self.base_url, "error": str(exc)}

    def queue_prompt(self, api_prompt: dict[str, Any]) -> str:
        payload = {"prompt": api_prompt, "client_id": self.client_id}
        r = requests.post(f"{self.base_url}/prompt", json=payload, timeout=self.timeout)
        if not r.ok:
            raise ComfyError(f"Comfy queue failed: HTTP {r.status_code}: {r.text[:500]}")
        data = r.json()
        prompt_id = data.get("prompt_id")
        if not prompt_id:
            raise ComfyError(f"Comfy did not return prompt_id: {data}")
        return prompt_id

    def wait_for_history(self, prompt_id: str, timeout_seconds: int = 300) -> dict[str, Any]:
        start = time.time()
        while time.time() - start < timeout_seconds:
            r = requests.get(f"{self.base_url}/history/{prompt_id}", timeout=self.timeout)
            if r.ok:
                hist = r.json()
                if prompt_id in hist:
                    return hist[prompt_id]
            time.sleep(1.0)
        raise ComfyError(f"Timed out waiting for Comfy prompt {prompt_id}")

    def download_image(self, image_info: dict[str, Any]) -> bytes:
        params = {
            "filename": image_info["filename"],
            "subfolder": image_info.get("subfolder", ""),
            "type": image_info.get("type", "output"),
        }
        r = requests.get(f"{self.base_url}/view", params=params, timeout=self.timeout)
        if not r.ok:
            raise ComfyError(f"Image download failed: HTTP {r.status_code}")
        return r.content

    def run_prompt_and_get_images(self, api_prompt: dict[str, Any], timeout_seconds: int = 300) -> list[bytes]:
        prompt_id = self.queue_prompt(api_prompt)
        hist = self.wait_for_history(prompt_id, timeout_seconds=timeout_seconds)
        outputs = hist.get("outputs", {})
        images: list[bytes] = []
        for _node_id, out in outputs.items():
            for img in out.get("images", []):
                images.append(self.download_image(img))
        return images


def _widget_values(node: dict[str, Any]) -> list[Any]:
    vals = node.get("widgets_values")
    return vals if isinstance(vals, list) else []


def _link_value(node_input: dict[str, Any], link_sources: dict[int, tuple[int, int]]) -> list[Any] | None:
    link_id = node_input.get("link")
    if link_id is None:
        return None
    src = link_sources.get(int(link_id))
    if not src:
        return None
    return [str(src[0]), src[1]]


def comfy_ui_workflow_to_api(ui_workflow: dict[str, Any]) -> dict[str, Any]:
    """Convert the small Pixel Factory UI-style workflows into Comfy prompt API JSON.

    This intentionally supports the node classes used in our current Flux GGUF LoRA
    workflows. It is not a general Comfy workflow converter.
    """
    link_sources: dict[int, tuple[int, int]] = {}
    for link in ui_workflow.get("links", []):
        # [link_id, origin_id, origin_slot, target_id, target_slot, type]
        link_sources[int(link[0])] = (int(link[1]), int(link[2]))

    api: dict[str, Any] = {}
    for node in ui_workflow.get("nodes", []):
        node_id = str(node["id"])
        class_type = node["type"]
        inputs: dict[str, Any] = {}
        widgets = _widget_values(node)

        # Linked inputs first.
        for inp in node.get("inputs") or []:
            v = _link_value(inp, link_sources)
            if v is not None:
                inputs[inp["name"]] = v

        if class_type == "DualCLIPLoader":
            inputs.update({"clip_name1": widgets[0], "clip_name2": widgets[1], "type": widgets[2]})
        elif class_type == "UnetLoaderGGUF":
            inputs.update({"unet_name": widgets[0]})
        elif class_type == "LoraLoader":
            inputs.update({"lora_name": widgets[0], "strength_model": widgets[1], "strength_clip": widgets[2]})
        elif class_type == "VAELoader":
            inputs.update({"vae_name": widgets[0]})
        elif class_type == "CLIPTextEncode":
            inputs.update({"text": widgets[0]})
        elif class_type == "EmptyLatentImage":
            inputs.update({"width": widgets[0], "height": widgets[1], "batch_size": widgets[2]})
        elif class_type == "KSampler":
            inputs.update({
                "seed": int(widgets[0]),
                "control_after_generate": widgets[1],
                "steps": int(widgets[2]),
                "cfg": float(widgets[3]),
                "sampler_name": widgets[4],
                "scheduler": widgets[5],
                "denoise": float(widgets[6]),
            })
        elif class_type in {"VAEDecode", "PreviewImage", "SaveImage", "LoadImage", "VAEEncode"}:
            pass
        elif class_type == "PixelArtDetectorSave":
            # Not used in the web connector yet.
            pass
        else:
            # Keep unknown nodes with linked inputs only; Comfy will reject if required widget inputs are missing.
            pass

        api[node_id] = {"class_type": class_type, "inputs": inputs}
    return api


def load_workflow(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def patch_character_workflow(
    ui_workflow: dict[str, Any],
    positive: str | None = None,
    negative: str | None = None,
    seed: int | None = None,
    width: int | None = None,
    height: int | None = None,
    batch_size: int | None = None,
    steps: int | None = None,
) -> dict[str, Any]:
    wf = copy.deepcopy(ui_workflow)
    for node in wf.get("nodes", []):
        title = node.get("title", "")
        typ = node.get("type")
        widgets = node.get("widgets_values")
        if not isinstance(widgets, list):
            continue
        if typ == "CLIPTextEncode" and "Positive" in title and positive is not None:
            widgets[0] = positive
        if typ == "CLIPTextEncode" and "Negative" in title and negative is not None:
            widgets[0] = negative
        if typ == "EmptyLatentImage":
            if width is not None: widgets[0] = int(width)
            if height is not None: widgets[1] = int(height)
            if batch_size is not None: widgets[2] = int(batch_size)
        if typ == "KSampler":
            if seed is not None and seed >= 0:
                widgets[0] = int(seed)
                widgets[1] = "fixed"
            else:
                widgets[1] = "randomize"
            if steps is not None: widgets[2] = int(steps)
    return wf
