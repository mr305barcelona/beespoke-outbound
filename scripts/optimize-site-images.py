"""Rebuild committed display variants with Pillow; originals remain unchanged."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ['noah_levy_profile_picture.png', 'nestle_logo.png', 'danone_logo.png',
           'crate_barrel_logo.png', 'bimbo_logo.png', 'paypal_logo.png',
           'belgium_federal_police_logo.png', 'maserati_logo.png',
           'republic_bank_logo.png', 'orange_cyberdefense_logo.png', 'presidio_logo.webp']

def main():
    destination = ROOT / 'assets/optimized'
    destination.mkdir(exist_ok=True)
    records = []
    for name in SOURCES:
        source = ROOT / name
        image = Image.open(source).convert('RGBA')
        founder = name == 'noah_levy_profile_picture.png'
        for size in ([240, 480] if founder else [320]):
            resized = image.copy()
            resized.thumbnail((size, size), Image.Resampling.LANCZOS)
            relative = f'assets/optimized/{source.stem}-{size}.webp'
            output = ROOT / relative
            resized.save(output, 'WEBP', lossless=not founder, quality=88, method=6, exact=True)
            if output.stat().st_size >= source.stat().st_size:
                output.unlink()
                continue
            records.append({'source': name, 'sourceBytes': source.stat().st_size,
                'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                'output': relative, 'outputBytes': output.stat().st_size,
                'width': resized.width, 'height': resized.height, 'alphaPreserved': True,
                'conversion': 'resize with Lanczos; transparent WebP; no generative edits',
                'losslessEncoding': not founder, 'useVariant': True})
    (ROOT / 'data/site-image-variants.json').write_text(json.dumps(records, indent=2) + '\n')
    print(f'Prepared {len(records)} smaller display variants; all original assets preserved.')

if __name__ == '__main__':
    main()
