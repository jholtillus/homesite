# Writes src/data/image-sizes.json ({"/images/...": [w, h]}) for every raster image in public/images.
# Run after adding or replacing images:  python3 scripts/image-sizes.py
import json, glob
from PIL import Image
out = {}
for f in sorted(glob.glob('public/images/**/*.*', recursive=True)):
    if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        out[f[len('public'):]] = list(Image.open(f).size)
json.dump(out, open('src/data/image-sizes.json', 'w'), indent=0)
print(len(out), 'images')
