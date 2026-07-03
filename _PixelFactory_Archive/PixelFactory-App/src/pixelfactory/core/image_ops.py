from PIL import Image


def nearest_resize(image: Image.Image, scale: int) -> Image.Image:
    """Resize using nearest-neighbor for crisp pixel art."""
    if scale <= 0:
        raise ValueError("scale must be positive")
    return image.resize((image.width * scale, image.height * scale), Image.Resampling.NEAREST)


def reduce_palette(image: Image.Image, colors: int = 32) -> Image.Image:
    """Basic palette reduction placeholder for PaletteLab v0.1."""
    if colors < 2:
        raise ValueError("colors must be >= 2")
    return image.convert("P", palette=Image.Palette.ADAPTIVE, colors=colors).convert("RGBA")
