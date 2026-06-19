"""Generate custom 32x32 token icons in ghostpixxells-style pixel art."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

OUTLINE = (26, 26, 26, 255)
CUP = (248, 242, 230, 255)
CUP_SHADE = (220, 208, 188, 255)
SLEEVE = (176, 132, 88, 255)
SLEEVE_SHADE = (140, 100, 62, 255)
LID = (236, 228, 214, 255)
LID_RIM = (196, 180, 156, 255)
TRANSPARENT = (0, 0, 0, 0)
ICE = (196, 232, 255, 255)
ICE_SHADE = (132, 196, 236, 255)
ICE_HIGHLIGHT = (244, 252, 255, 255)


def set_px(img: Image.Image, x: int, y: int, color: tuple[int, int, int, int]) -> None:
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), color)


def draw_cup(height: int, sleeve_rows: int) -> Image.Image:
    img = Image.new('RGBA', (32, 32), TRANSPARENT)
    top = 32 - height - 4
    bottom = 31
    left = 8
    right = 23

    # Lid stack
    for x in range(left + 1, right):
        set_px(img, x, top, LID_RIM)
    for x in range(left, right + 1):
        set_px(img, x, top + 1, LID)
        set_px(img, x, top + 2, LID)
    for x in range(left + 1, right):
        set_px(img, x, top + 3, LID_RIM)
    set_px(img, 15, top + 1, OUTLINE)
    set_px(img, 16, top + 1, OUTLINE)

    body_top = top + 4
    for y in range(body_top, bottom):
        taper = 0 if y < body_top + 2 else min(2, (y - body_top) // 5)
        row_left = left + taper
        row_right = right - taper

        for x in range(row_left, row_right + 1):
            in_sleeve = body_top + 2 <= y < body_top + 2 + sleeve_rows
            if x == row_left or x == row_right:
                set_px(img, x, y, OUTLINE)
            elif in_sleeve:
                set_px(img, x, y, SLEEVE if x % 2 == y % 2 else SLEEVE_SHADE)
            else:
                set_px(img, x, y, CUP if x < (row_left + row_right) // 2 + 1 else CUP_SHADE)

    for x in range(left + 1, right):
        set_px(img, x, bottom, OUTLINE)

    return img


def draw_ice_cube(img: Image.Image, origin_x: int, origin_y: int, size: int) -> None:
    for y in range(size):
        for x in range(size):
            px = origin_x + x
            py = origin_y + y
            on_edge = x == 0 or y == 0 or x == size - 1 or y == size - 1
            if on_edge:
                set_px(img, px, py, OUTLINE)
            elif x == 1 and y == 1:
                set_px(img, px, py, ICE_HIGHLIGHT)
            elif x + y >= size - 1:
                set_px(img, px, py, ICE_SHADE)
            else:
                set_px(img, px, py, ICE)


def draw_ice_cubes() -> Image.Image:
    img = Image.new('RGBA', (32, 32), TRANSPARENT)
    draw_ice_cube(img, 7, 17, 8)
    draw_ice_cube(img, 17, 17, 8)
    draw_ice_cube(img, 12, 9, 8)
    return img


def main() -> None:
    out_dir = Path(__file__).resolve().parents[1] / 'public' / 'icons' / 'ghostpixxells'
    out_dir.mkdir(parents=True, exist_ok=True)

    icons = {
        'cup_8oz.png': draw_cup(height=14, sleeve_rows=4),
        'cup_12oz.png': draw_cup(height=18, sleeve_rows=5),
        'cup_16oz.png': draw_cup(height=22, sleeve_rows=6),
        'ice.png': draw_ice_cubes(),
    }

    for name, image in icons.items():
        image.save(out_dir / name)
        print('wrote', out_dir / name)


if __name__ == '__main__':
    main()