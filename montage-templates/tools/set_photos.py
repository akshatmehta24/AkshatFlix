"""Point the templates at the photos in public/photos/.

Photos are used in file-name order (01.jpg, 02.jpg, ...), so name them
oldest first. Each photo gets a focus point (fx/fy, in %) centred on the
faces it finds (needs: pip install opencv-python-headless); focus points
already set for a file are kept.

Usage: python3 tools/set_photos.py
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, "public", "photos")
PROJECT = os.path.join(ROOT, "src", "project.json")
EXTS = (".jpg", ".jpeg", ".png", ".webp")


def find_focus(path):
    """Centre of all detected faces, in % of the image; None if unsure."""
    try:
        import cv2
    except ImportError:
        return None
    img = cv2.imread(path)
    if img is None:
        return None
    h, w = img.shape[:2]
    gray = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    min_size = (int(w * 0.06), int(w * 0.06))
    faces = []
    for name in ("haarcascade_frontalface_default.xml", "haarcascade_profileface.xml"):
        det = cv2.CascadeClassifier(cv2.data.haarcascades + name)
        faces += list(det.detectMultiScale(gray, 1.1, 6, minSize=min_size))
    if not faces:
        return None
    x0 = min(f[0] for f in faces)
    y0 = min(f[1] for f in faces)
    x1 = max(f[0] + f[2] for f in faces)
    y1 = max(f[1] + f[3] for f in faces)
    # aim a little below the faces so shoulders are in frame too
    cx = (x0 + x1) / 2 / w * 100
    cy = min(95, ((y0 + y1) / 2 + (y1 - y0) * 0.6) / h * 100)
    return round(cx), round(cy)


def main():
    with open(PROJECT) as f:
        project = json.load(f)
    known = {p["src"]: p for p in project.get("photos", [])}
    files = sorted(n for n in os.listdir(PHOTOS) if n.lower().endswith(EXTS) and n != "demo.jpg")
    if not files:
        print("No photos found in public/photos/ — keeping the current list.")
        return
    photos = []
    for n in files:
        entry = known.get(f"photos/{n}", {"src": f"photos/{n}"})
        if "fx" not in entry:
            focus = find_focus(os.path.join(PHOTOS, n))
            if focus:
                entry["fx"], entry["fy"] = focus
        photos.append(entry)
    project["photos"] = photos
    with open(PROJECT, "w") as f:
        json.dump(project, f, indent=2)
        f.write("\n")
    print(f"{len(files)} photos set: {', '.join(files)}")


if __name__ == "__main__":
    main()
