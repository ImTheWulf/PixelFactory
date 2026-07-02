# PF-0011 — Generation Settings Fix

Status: Implemented

## Goals

- Resolve `-1` random seeds inside Pixel Factory before sending jobs to ComfyUI.
- Save the actual seed to asset metadata.
- Show the actual seed in Character Studio after generation.
- Add Use Random Seed and Reuse Last Seed controls.
- Keep Comfy KSampler fixed to the actual seed for reproducible assets.
- Keep generation sizes restricted to safe square values for now.

## Notes

The weird output differences across 512 / 768 / 1024 are being treated cautiously.
PF-0011 guarantees that every Comfy job receives a consistent square latent size and a real seed.
Further workflow-specific size tuning can move into recipes later.
