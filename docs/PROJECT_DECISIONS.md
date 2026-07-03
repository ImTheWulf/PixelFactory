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