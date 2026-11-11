import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS, clamp } from "./index";

/**
 * Lyric / poem subtitles, Instagram style, in a Hindi + English mix:
 *   - a key word in Devanagari glows in above the line,
 *   - the line itself (Hindi in English letters) appears word by word as it is said,
 *   - a small English meaning fades in underneath.
 *
 * Data (src/lyrics/tN.json): { "lines": [{ "start", "end", "text", "hi", "en", "words": [{ "t", "w" }] }] }
 * Times are seconds in the final video.
 */
export type LyricLine = { start: number; end: number; text: string; hi?: string; en?: string; words?: { t: number; w: string }[] };
export type LyricsData = { lines: LyricLine[] };

export const Lyrics: React.FC<{
  data: LyricsData;
  font: string;
  hiFont?: string;
  enFont?: string;
  size?: number;
  bottom?: number;
  color?: string;
  accent?: string;
  glow?: string;
}> = ({ data, font, hiFont, enFont, size = 64, bottom = 230, color = "#fffaf2", accent = "#ffd9a8", glow = "rgba(255,190,120,0.55)" }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const idx = data.lines.findIndex((l, i) => {
    const next = data.lines[i + 1];
    const until = Math.min(l.end + 1.0, next ? next.start - 0.2 : l.end + 1.0);
    return t >= l.start - 0.3 && t <= until;
  });
  if (idx < 0) return null;
  const line = data.lines[idx];
  const next = data.lines[idx + 1];
  const until = Math.min(line.end + 1.0, next ? next.start - 0.2 : line.end + 1.0);
  const words =
    line.words ??
    line.text.split(/\s+/).map((w, i, all) => ({ w, t: line.start + ((line.end - line.start) * 0.7 * i) / Math.max(1, all.length) }));
  // Two lines with about the same number of letters (one line if it is short).
  const indexed = words.map((w, i) => ({ w, i }));
  let cut = indexed.length;
  if (indexed.length >= 4) {
    const total = words.reduce((n, w) => n + w.w.length, 0);
    let best = Infinity;
    let left = 0;
    for (let k = 1; k < words.length; k++) {
      left += words[k - 1].w.length;
      const diff = Math.abs(total - 2 * left);
      if (diff < best) {
        best = diff;
        cut = k;
      }
    }
  }
  const rows = [indexed.slice(0, cut), indexed.slice(cut)];
  const out = interpolate(t, [until - 0.4, until], [1, 0], clamp);
  const outBlur = interpolate(t, [until - 0.4, until], [0, 10], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* soft shade so text reads over any photo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: bottom + 520,
          opacity: out * 0.9,
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,4,14,0.55) 45%, rgba(10,4,14,0.7) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom,
          textAlign: "center",
          opacity: out,
          filter: outBlur > 0.2 ? `blur(${outBlur}px)` : undefined,
        }}
      >
        {[rows[0], rows[1]].filter((r) => r.length).map((row, ri) => (
        <div key={ri} style={{ lineHeight: 1.3, whiteSpace: "nowrap" }}>
          {row.map(({ w, i }) => {
            const p = interpolate(t, [w.t - 0.05, w.t + 0.3], [0, 1], clamp);
            const nextT = words[i + 1]?.t ?? line.end;
            const active = t >= w.t && t < nextT;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: size * 0.26,
                  fontFamily: font,
                  fontSize: size,
                  color,
                  opacity: p * (active ? 1 : 0.9),
                  transform: `translateY(${(1 - p) * 16}px) scale(${active ? 1.05 : 1})`,
                  filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
                  textShadow: `0 0 ${active ? 24 : 12}px ${glow}, 0 3px 14px rgba(0,0,0,0.6)`,
                }}
              >
                {w.w}
              </span>
            );
          })}
        </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
