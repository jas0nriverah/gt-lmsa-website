import os
import qrcode
from qrcode.constants import ERROR_CORRECT_H

URL = "https://gt-lmsa-website.vercel.app/links"
OUT_DIR = "assets/qr"
os.makedirs(OUT_DIR, exist_ok=True)

NAVY = "#003057"
GOLD = "#B3A369"
DARK_GOLD = "#6F622F"
CREAM = "#F8F7F2"
WHITE = "#FFFFFF"


def luminance(hex_color):
    hex_color = hex_color.lstrip("#")
    channels = []
    for i in (0, 2, 4):
        c = int(hex_color[i:i + 2], 16) / 255
        c = c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
        channels.append(c)
    r, g, b = channels
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg, bg):
    l1, l2 = luminance(fg), luminance(bg)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def make(filename, fill, back, label):
    qr = qrcode.QRCode(
        error_correction=ERROR_CORRECT_H,
        box_size=40,
        border=4,
    )
    qr.add_data(URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fill, back_color=back).convert("RGB")
    path = f"{OUT_DIR}/{filename}"
    img.save(path)
    ratio = contrast(fill, back)
    verdict = "GOOD" if ratio >= 7 else ("OK" if ratio >= 4 else "RISKY")
    print(f"{verdict:6} contrast {ratio:4.1f}:1  {label}  ->  {path}")


make("lmsa-links-qr-gold-on-navy.png", GOLD, NAVY, "Gold on Navy (inverted)")
make("lmsa-links-qr-darkgold-on-cream.png", DARK_GOLD, CREAM, "Dark Gold on Cream")
make("lmsa-links-qr-darkgold-on-white.png", DARK_GOLD, WHITE, "Dark Gold on White")
make("lmsa-links-qr-gold-on-white.png", GOLD, WHITE, "Bright Gold on White")
