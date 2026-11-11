"""Prepare a song for the montage.

Takes any audio or video file, trims it, loops it on the beat if it is too
short, detects beats, and writes:
  public/song.mp3          the final soundtrack
  src/song-timing.json     beat times + duration the video syncs to

Usage:
  pip install librosa
  python3 tools/prepare_song.py <input file> [--start S] [--end S] [--target 52]
"""

import argparse
import json
import os
import subprocess
import tempfile

import librosa
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("--start", type=float, default=None, help="seconds; default = first audible sound")
    ap.add_argument("--end", type=float, default=None, help="seconds; default = last audible sound")
    ap.add_argument("--target", type=float, default=52.0, help="final length in seconds")
    a = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "full.wav")
        run(["ffmpeg", "-y", "-i", a.input, "-vn", "-ac", "1", "-ar", "22050", wav])
        y, sr = librosa.load(wav, sr=22050)

    # Find the audible part.
    rms = librosa.feature.rms(y=y)[0]
    t = librosa.frames_to_time(np.arange(len(rms)), sr=sr)
    loud = t[rms > 0.01]
    start = a.start if a.start is not None else max(0.0, float(loud[0]) - 0.02)
    end = a.end if a.end is not None else float(loud[-1])

    _, frames = librosa.beat.beat_track(y=y, sr=sr)
    beats = [b for b in librosa.frames_to_time(frames, sr=sr) if start <= b <= end]
    period = float(np.median(np.diff(beats)))
    seg = [b - start for b in beats]  # beats inside one copy of the clip
    seg_len = end - start

    # Lay copies of the clip end to end, each one starting on the beat
    # right after the previous copy's last beat.
    pieces, timeline = [], []
    offset = 0.0
    while offset < a.target:
        pieces.append(offset)
        timeline += [offset + b for b in seg]
        next_offset = offset + seg[-1] + period - seg[0]
        if next_offset <= offset:
            break
        offset = next_offset
    duration = min(a.target, pieces[-1] + seg_len)
    timeline = [round(b, 3) for b in timeline if b < duration]

    # Build the audio with ffmpeg: each copy delayed to its offset, then mixed.
    filters, labels = [], []
    for i, off in enumerate(pieces):
        filters.append(
            f"[0:a]atrim={start}:{end},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,"
            f"afade=t=out:st={max(0, seg_len - 0.05)}:d=0.05,adelay={int(off * 1000)}:all=1[p{i}]"
        )
        labels.append(f"[p{i}]")
    fade = max(0.0, duration - 2.7)
    filters.append(
        f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0,atrim=0:{duration},"
        f"afade=t=out:st={fade}:d=2.7,loudnorm=I=-14:TP=-1.5[o]"
    )
    out_mp3 = os.path.join(ROOT, "public", "song.mp3")
    run(["ffmpeg", "-y", "-i", a.input, "-filter_complex", ";".join(filters), "-map", "[o]",
         "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "256k", out_mp3])

    with open(os.path.join(ROOT, "src", "song-timing.json"), "w") as f:
        json.dump({"duration": round(duration, 3), "beats": timeline}, f, indent=1)

    print(f"tempo ~{60 / period:.0f} BPM, {len(timeline)} beats, {duration:.1f}s, {len(pieces)} copies")
    if len(timeline) < 80:
        print("WARNING: template needs ~80 beats; use a longer clip or raise --target")


if __name__ == "__main__":
    main()
