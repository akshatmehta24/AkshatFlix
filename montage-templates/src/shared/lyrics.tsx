import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS, clamp } from "./index";

/**
 * Lyric / poem subtitles, Instagram style: each word drifts up out of a blur
 * as it is sung, the line glows softly, then dissolves.
 *
 * Data (src/lyrics/tN.json): { "lines": [{ "start": 3.2, "end": 6.8, "text": "..." }] }
 * Times are seconds in the final video. Optional "words": [{ "t": 3.4, "w": "..." }]
 * gives exact word times; otherwise words are spread over the line.
 */
export type LyricLine = { start: number; end: number; text: string; words?: { t: number; w: string }[] };
export type LyricsData = { lines: LyricLine[] };

export const Lyrics: React.FC<{
  data: LyricsData;
  font: string;
  size?: number;
  bottom?: number;
  color?: string;
  glow?: string;
  italic?: boolean;
  uppercase?: boolean;
}> = ({ data, font, size = 64, bottom = 260, color = "#fffaf2", glow = "rgba(255,190,120,0.55)", italic, uppercase }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const line = data.lines.find((l) => t >= l.start - 0.25 && t <= l.end + 0.5);
  if (!line) return null;
  const words =
    line.words ??
    line.text.split(/\s+/).map((w, i, all) => ({ w, t: line.start + ((line.end - line.start) * 0.7 * i) / Math.max(1, all.length) }));
  const out = interpolate(t, [line.end, line.end + 0.5], [1, 0], clamp);
  const outBlur = interpolate(t, [line.end, line.end + 0.5], [0, 10], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom,
          textAlign: "center",
          opacity: out,
          filter: outBlur > 0.2 ? `blur(${outBlur}px)` : undefined,
          lineHeight: 1.3,
        }}
      >
        {words.map((w, i) => {
          const p = interpolate(t, [w.t, w.t + 0.35], [0, 1], clamp);
          const next = words[i + 1]?.t ?? line.end;
          const active = t >= w.t && t < next;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: size * 0.28,
                fontFamily: font,
                fontSize: size,
                fontStyle: italic ? "italic" : undefined,
                textTransform: uppercase ? "uppercase" : undefined,
                color,
                opacity: p * (active ? 1 : 0.88),
                transform: `translateY(${(1 - p) * 18}px) scale(${active ? 1.04 : 1})`,
                filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
                textShadow: `0 0 ${active ? 26 : 14}px ${glow}, 0 3px 14px rgba(0,0,0,0.55)`,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
