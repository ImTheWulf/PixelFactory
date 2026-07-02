from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class RecipeError(RuntimeError):
    pass


class RecipeService:
    """Loads Pixel Factory recipes from JSON.

    A recipe describes *how* to create or process an asset. The UI should ask for a
    recipe id like `character.default`; it should not hardcode workflow names,
    model settings, prompt defaults, or output type.
    """

    def __init__(self, recipes_root: Path):
        self.recipes_root = recipes_root

    def _recipe_path(self, recipe_id: str) -> Path:
        if not recipe_id or "/" in recipe_id or "\\" in recipe_id or ".." in recipe_id:
            raise RecipeError(f"Invalid recipe id: {recipe_id!r}")
        parts = recipe_id.split(".")
        if len(parts) < 2:
            raise RecipeError("Recipe id must look like 'category.name', for example 'character.default'.")
        category = parts[0]
        name = ".".join(parts[1:])
        return self.recipes_root / category / f"{name}.json"

    def load(self, recipe_id: str) -> dict[str, Any]:
        path = self._recipe_path(recipe_id)
        if not path.exists():
            raise RecipeError(f"Recipe not found: {recipe_id}")
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise RecipeError(f"Recipe JSON is invalid: {path}: {exc}") from exc
        data.setdefault("id", recipe_id)
        return data

    def list(self, category: str | None = None) -> list[dict[str, Any]]:
        base = self.recipes_root / category if category else self.recipes_root
        if not base.exists():
            return []
        recipes: list[dict[str, Any]] = []
        for path in sorted(base.rglob("*.json")):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except Exception:
                continue
            rel = path.relative_to(self.recipes_root)
            recipe_id = ".".join([rel.parts[0], rel.stem]) if len(rel.parts) >= 2 else rel.stem
            recipes.append({
                "id": data.get("id", recipe_id),
                "display_name": data.get("display_name", data.get("name", recipe_id)),
                "category": data.get("category", rel.parts[0] if rel.parts else "general"),
                "description": data.get("description", ""),
                "workflow": data.get("workflow", ""),
                "engine": data.get("engine", ""),
            })
        return recipes

    @staticmethod
    def merged_prompt(recipe: dict[str, Any], user_prompt: str | None = None) -> str:
        prompt_template = recipe.get("prompt_template") or recipe.get("positive_prompt") or "{prompt}"
        user_prompt = (user_prompt or "").strip()
        if "{prompt}" in prompt_template:
            return prompt_template.replace("{prompt}", user_prompt)
        if user_prompt:
            return f"{prompt_template.strip()}\n\n{user_prompt}"
        return prompt_template.strip()

    @staticmethod
    def negative_prompt(recipe: dict[str, Any], override: str | None = None) -> str:
        if override and override.strip():
            return override.strip()
        return (recipe.get("negative_prompt") or recipe.get("negative_template") or "").strip()

    @staticmethod
    def generation_defaults(recipe: dict[str, Any]) -> dict[str, Any]:
        resolution = recipe.get("resolution") or {}
        if isinstance(resolution, list) and len(resolution) >= 2:
            width, height = resolution[0], resolution[1]
        else:
            width, height = resolution.get("width", 1024), resolution.get("height", 1024)
        return {
            "recipe_id": recipe.get("id", ""),
            "display_name": recipe.get("display_name", recipe.get("name", "Recipe")),
            "positive": recipe.get("prompt_template", recipe.get("positive_prompt", "")),
            "negative": recipe.get("negative_prompt", recipe.get("negative_template", "")),
            "width": int(width),
            "height": int(height),
            "batch_size": int(recipe.get("batch_size", 1)),
            "steps": int(recipe.get("steps", 24)),
            "sampler": recipe.get("sampler", "euler"),
            "scheduler": recipe.get("scheduler", "simple"),
        }
