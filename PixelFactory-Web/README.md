# PixelFactory Web v0.6

Local browser UI for Pixel Factory.

## Run

```powershell
cd PixelFactory-Web
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

Open `http://127.0.0.1:8000`.

## v0.6

- Palette Lab remains deterministic.
- Character Studio runs ComfyUI workflows.
- Generated images are saved as assets.
- Asset Browser lists generated assets.
- Assets can be accepted, downloaded, deleted, or sent to Palette Lab.
