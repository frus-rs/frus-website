"""Turns the example-shots PNGs into the WebP pictures the site serves.

The pages show a screen at most 220 CSS pixels wide, so 540 pixels covers a high-density
display, and WebP at that size is a tenth of the PNG: the site is read on slow lines too.

    python tools/example-shots/shrink.py static/examples
"""

import sys
from pathlib import Path

from PIL import Image

WIDTH = 540

folder = Path(sys.argv[1] if len(sys.argv) > 1 else "static/examples")
for png in sorted(folder.glob("*.png")):
    with Image.open(png) as image:
        height = round(image.height * WIDTH / image.width)
        small = image.convert("RGB").resize((WIDTH, height), Image.LANCZOS)
        webp = png.with_suffix(".webp")
        small.save(webp, "WEBP", quality=82, method=6)
    png.unlink()
    print(f"{webp} {webp.stat().st_size // 1024} KB")
