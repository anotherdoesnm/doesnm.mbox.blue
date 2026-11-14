#!/usr/bin/env python3
"""Convert an Android vector drawable (<vector>) to a plain SVG.

Only the subset used by app icons is handled: <vector>, <group> and <path>,
with fill/stroke colours, fill types and the common group transforms.
"""
import sys, xml.etree.ElementTree as ET

A = "{http://schemas.android.com/apk/res/android}"

def parse_transform(g):
    parts = []
    if (v := g.get(A + "translateX")) or (v := g.get(A + "translateY")):
        parts.append(f"translate({g.get(A+'translateX','0')} {g.get(A+'translateY','0')})")
    if (v := g.get(A + "scaleX")) or (v := g.get(A + "scaleY")):
        parts.append(f"scale({g.get(A+'scaleX','1')} {g.get(A+'scaleY','1')})")
    if v := g.get(A + "rotation"):
        px, py = g.get(A + "pivotX", "0"), g.get(A + "pivotY", "0")
        parts.append(f"rotate({v} {px} {py})")
    return " ".join(parts)

def colour(v, default="none"):
    if not v:
        return default
    if v.startswith("@"):
        return "#000000"      # resource reference: caller substitutes
    return v

def path_attrs(p):
    out = {"d": p.get(A + "pathData", "")}
    fill = colour(p.get(A + "fillColor"), "#000000")
    if fill != "none":
        out["fill"] = fill
    else:
        out["fill"] = "none"
    if p.get(A + "fillType") in ("evenOdd", "1"):
        out["fill-rule"] = "evenodd"
    stroke = p.get(A + "strokeColor")
    if stroke:
        out["stroke"] = colour(stroke)
        out["stroke-width"] = p.get(A + "strokeWidth", "1")
        out["stroke-linecap"] = p.get(A + "strokeLineCap", "butt")
        out["stroke-linejoin"] = p.get(A + "strokeLineJoin", "miter")
    return out

def convert(src, out_path, override_fill=None):
    root = ET.parse(src).getroot()
    w = root.get(A + "viewportWidth", "24")
    h = root.get(A + "viewportHeight", "24")
    body = []

    def walk(el, indent="  "):
        tag = el.tag.split("}")[-1]
        if tag == "group":
            t = parse_transform(el)
            tr = ' transform="' + t + '"' if t else ''
            body.append(indent + "<g" + tr + ">")
            for child in el:
                walk(child, indent + "  ")
            body.append(f"{indent}</g>")
        elif tag == "path":
            attrs = path_attrs(el)
            if override_fill:
                attrs["fill"] = override_fill
            body.append(indent + "<path " + " ".join(f'{k}="{v}"' for k, v in attrs.items()) + "/>")

    for child in root:
        walk(child)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
           f'width="{w}" height="{h}">\n' + "\n".join(body) + "\n</svg>\n")
    open(out_path, "w").write(svg)
    print(f"{out_path}: {len(svg)} bytes, viewBox 0 0 {w} {h}, paths={svg.count('<path')}")

if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
