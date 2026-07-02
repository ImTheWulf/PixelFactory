# Pixel Factory App v0.1.1

Fixes:
- Image operations run in a background worker so the app should not freeze / show Not Responding as often.
- Adds status messages and progress bar.
- Keeps original image untouched.
- Supports Open Image, Nearest Resize, Palette Reduction, Reset, Save PNG.

Run:

```powershell
cd PixelFactory-App
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Overwrite your existing PixelFactory-App files with these files.
