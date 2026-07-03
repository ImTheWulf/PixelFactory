## PF-0100 Documentation Source of Truth

**Decision:** `/docs` is the only active documentation folder.

**Status:** Accepted

**Reason:** Splitting documentation between `/docs` and `PixelFactory-Docs` caused confusion and duplicated context. All project memory, roadmap, architecture, design rules, and milestone notes should now live inside `/docs`.

---

## PixelFactory-Web Is the Active App

**Decision:** PixelFactory-Web is the active implementation.

**Status:** Accepted

**Reason:** PixelFactory-App was only a prototype. The working product direction has moved into PixelFactory-Web.

---

## Export Targets Are Limited

**Decision:** Pixel Factory only supports Godot and Aseprite export targets.

**Status:** Accepted

**Reason:** The project is built around the user’s actual 2D game development workflow, not broad engine support.

## Palette Lab Is Post-Processing

**Decision:** Palette Lab is a cleanup and post-processing tool, not a generation tool.

**Status:** Accepted

**Reason:** Palette Lab should be used after assets are generated to clean pixels, reduce palettes, snap pixels, remove chroma key backgrounds, and prepare assets for export.

## Tile Studio Uses Staged Generation

**Decision:** Tile Studio should be built as a staged workflow.

**Status:** Accepted

**Reason:** Tile creation is more than generating one image. The intended workflow includes texture generation, tile generation, seamless cleanup, variations, masking, and export preparation.

## Presets Are Broad, Recipes Are Curated

**Decision:** Presets can be broad across asset types, but recipes must be curated for specific generation goals.

**Status:** Accepted

**Reason:** Presets such as fantasy, medieval, sci-fi, modern, or horror can apply across characters, props, buildings, and tiles. Recipes are more specific because they define how Pixel Factory asks ComfyUI to create a particular kind of asset.