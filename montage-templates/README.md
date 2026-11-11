# Anniversary montage templates

Vertical (1080×1920) beat-synced montages built with [Remotion](https://remotion.dev).
One project, one composition per template. Photos and songs are **not** stored in
git (see `.gitignore`); add them locally.

| ID | Style | Length | Song (from the reference) |
|----|-------|--------|---------------------------|
| `Template1` | Silver Jubilee: "25" intro, names, 13 styled photo cards, year counter, finale | ~52 s | Rafi — Shaadi Ke Liye Razamand Kar Li (looped) |
| `Template2` | Vintage album: brown paper, tilted white-border prints, handwritten message, colour section | ~55 s | Reference 2 soundtrack |
| `Template3` | Dreamy 3D: photo cards flying/flipping over a blurred purple collage | ~60 s | A.R. Rahman — Muzumathi (Jodhaa Akbar) |
| `Template4` | Cassette: tape drops into a deck, neon PLAY, fast photo flip-through | ~21 s | Rafi — Shaadi Ke Liye Razamand Kar Li |
| `Template5` | 90s save-the-date: retro TV, paisley, ribbon heart, "Ki 25vi Saalgirah", calendar, poster | ~14 s | 90s Mehndi track |

## Make a video

```bash
npm i
pip install librosa            # song helper (needs ffmpeg)

# 1. Names and dates: edit src/project.json (her, him, weddingDate, years)

# 2. Photos: copy into public/photos/ named oldest-first (01.jpg, 02.jpg, ...)
python3 tools/set_photos.py
#    Optional per photo in src/project.json: "fx"/"fy" = focus point in % (faces)

# 3. Song (only if changing it): any audio/video file
python3 tools/prepare_song.py path/to/song.mp3 --name t2 --start 1.15 --end 56.3 --no-loop
#    t1 loops the clip on the beat if it is short (omit --no-loop)

# 4. Preview frames, then render
node tools/preview.mjs Template2          # contact sheet in out/preview/
npx remotion render Template2 out/template2.mp4 --crf=20
```

## Layout

- `src/shared/` — names/dates/photos from `project.json`, beat timing helper, shared visuals.
- `src/t1` … `src/t5` — one folder per template; captions and text live there.
- `src/timing/tN.json` — beats + length for each song (from `tools/prepare_song.py`).
- `public/audio/tN.mp3`, `public/photos/` — local media (git-ignored).
