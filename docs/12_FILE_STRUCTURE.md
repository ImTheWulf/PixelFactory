# 12 — File Structure

This document describes the intended project layout.

```text
PixelFactory/
├── docs/                       # Canonical documentation root
│   ├── 00_PROJECT_MEMORY.md
│   ├── 13_ROADMAP.md
│   ├── architecture/            # Historical architecture notes
│   ├── issues/                  # Historical PF issue notes
│   ├── milestones/              # Historical milestone notes
│   └── reference/               # Start guides and reference notes
│
├── PixelFactory-Web/            # Current long-term app direction
├── PixelFactory-App/            # Earlier PySide/prototype reference
├── PixelFactory-Comfy/          # ComfyUI-related project notes/assets
├── PixelFactory-Presets/        # Preset storage/reference
├── PixelFactory-Projects/       # Project/workspace/export data
└── tools/                       # Helper scripts
```

## Documentation Rule

`/docs` is the only documentation root.

Do not recreate:

```text
PixelFactory-Docs/
```

That folder was consolidated during PF-0100.
