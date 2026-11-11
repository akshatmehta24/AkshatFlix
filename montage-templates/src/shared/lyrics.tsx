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
  const out = interpolate(t, [until - 0.4, until], [1, 0], clamp);
  const outBlur = interpolate(t, [until - 0.4, until], [0, 10], clamp);
  const hiIn = interpolate(t, [line.start - 0.3, line.start + 0.4], [0, 1], clamp);
  const enIn = interpolate(t, [line.start + (line.end - line.start) * 0.45, line.start + (line.end - line.start) * 0.45 + 0.5], [0, 1], clamp);
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
        {line.hi && hiFont ? (
          <div
            style={{
              fontFamily: hiFont,
              fontSize: size * 1.45,
              lineHeight: 1.25,
              color: accent,
              opacity: hiIn,
              transform: `scale(${0.9 + 0.1 * hiIn})`,
              filter: hiIn < 1 ? `blur(${(1 - hiIn) * 10}px)` : undefined,
              textShadow: `0 0 30px ${glow}, 0 4px 16px rgba(0,0,0,0.6)`,
              marginBottom: 6,
            }}
          >
            {line.hi}
          </div>
        ) : null}
        <div style={{ lineHeight: 1.25 }}>
          {words.map((w, i) => {
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
        {line.en ? (
          <div
            style={{
              fontFamily: enFont ?? font,
              fontStyle: "italic",
              fontSize: size * 0.66,
              letterSpacing: 1,
              color: "rgba(255,245,235,0.85)",
              marginTop: 14,
              opacity: enIn,
              transform: `translateY(${(1 - enIn) * 10}px)`,
              textShadow: "0 2px 10px rgba(0,0,0,0.7)",
            }}
          >
            {line.en}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
