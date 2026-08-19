import qrcode
from qrcode.constants import ERROR_CORRECT_H

URL = "https://gt-lmsa-website.vercel.app/links"
OUT_DIR = "assets/qr"

import os
os.makedirs(OUT_DIR, exist_ok=True)

def make(path, fill, back):
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,  # high correction so a logo/print scan still works
        box_size=40,                        # large boxes => high-res for print
        border=4,
    )
    qr.add_data(URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fill, back_color=back).convert("RGB")
    img.save(path)
    print(f"saved {path} ({img.size[0]}x{img.size[1]}px)")

# Classic black on white
make(f"{OUT_DIR}/lmsa-links-qr-black.png", "black", "white")
# GT Navy on cream (brand)
make(f"{OUT_DIR}/lmsa-links-qr-navy.png", "#003057", "#F8F7F2")
# GT Navy on transparent-like white for flexible placement
make(f"{OUT_DIR}/lmsa-links-qr-navy-white.png", "#003057", "white")
