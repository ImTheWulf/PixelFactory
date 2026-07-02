# PixelFactory Web v0.5

Local browser UI for Pixel Factory.

## Run

```powershell
cd PixelFactory-Web
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

## v0.5

- Palette Lab remains deterministic.
- Adds ComfyUI connector.
- Adds Character Studio web UI.
- Runs `workflows/character.json` through ComfyUI API.

## Before generating

Start ComfyUI normally and make sure it is reachable at:

```text
http://127.0.0.1:8188
```

Click **Check Comfy** in Pixel Factory. If connected, go to Character Studio and generate.
