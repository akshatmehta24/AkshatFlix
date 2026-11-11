"""Point the templates at the photos in public/photos/.

Photos are used in file-name order (01.jpg, 02.jpg, ...), so name them
oldest first. Focus points (fx/fy, in %) already set for a file are kept.

Usage: python3 tools/set_photos.py
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, "public", "photos")
PROJECT = os.path.join(ROOT, "src", "project.json")
EXTS = (".jpg", ".jpeg", ".png", ".webp")


def main():
    with open(PROJECT) as f:
        project = json.load(f)
    known = {p["src"]: p for p in project.get("photos", [])}
    files = sorted(n for n in os.listdir(PHOTOS) if n.lower().endswith(EXTS) and n != "demo.jpg")
    if not files:
        print("No photos found in public/photos/ — keeping the current list.")
        return
    project["photos"] = [known.get(f"photos/{n}", {"src": f"photos/{n}"}) for n in files]
    with open(PROJECT, "w") as f:
        json.dump(project, f, indent=2)
        f.write("\n")
    print(f"{len(files)} photos set: {', '.join(files)}")


if __name__ == "__main__":
    main()
