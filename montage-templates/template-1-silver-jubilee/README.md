# Template 1 — Silver Jubilee (25th anniversary montage)

Vertical 1080×1920 video, ~52 s, cuts synced to the song's beat.
Built with [Remotion](https://remotion.dev).

**Scenes:** "25" intro → names → 13 photo cards (vintage B&W, polaroid, heart,
punch-in, triptych, film strip, circle, polaroid stack, warm, B&W→colour wipe,
2×2 grid, pull-out, gold frame) → 2001→2026 year counter → finale.

Photos and songs are **not** stored in git (see `.gitignore`).

## Make a video

```bash
npm i
pip install librosa                     # for the song helper (needs ffmpeg)

# 1. Song: any audio/video file. Trims, loops on the beat if short, detects beats.
python3 tools/prepare_song.py path/to/song.mp3            # optional: --start 12 --end 70 --target 55

# 2. Photo(s): put them in public/ (default file name: photo.jpg)

# 3. Preview / render
npx remotion studio
npx remotion render Anniversary out/video.mp4 --crf=18
```

## What to edit

All in `src/Composition.tsx`:

- `HER`, `HIM`, `PHOTO` near the top: names and photo file.
- Each `Card…` component: its caption text (`kicker`, `script`, `hindi`) and
  photo crop (`fx`/`fy` = focus point in %, `from`/`to` = zoom).
- `Finale`: dates line and closing message.
- To use a different photo per card, give each `Photo` its own `src`
  (swap `staticFile(PHOTO)` for a prop).
