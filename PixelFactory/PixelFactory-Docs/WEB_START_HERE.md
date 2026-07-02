# PixelFactory Web Start Here

Run this from VS Code terminal:

```powershell
cd PixelFactory-Web
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

Open:

http://127.0.0.1:8000

## Current Tool

Palette Lab can:

- Load PNG/JPG/WebP
- Preview original and processed image
- Reduce palette
- Nearest-neighbor resize
- Download processed PNG

## Next Tool

Speckle Cleaner.
