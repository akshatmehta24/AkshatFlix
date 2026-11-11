import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import project from "../project.json";

export const FPS = 30;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Project details (edit src/project.json) ----------
export type PhotoInfo = { src: string; fx?: number; fy?: number; w?: number; h?: number; box?: number[] };

/**
 * Where to crop a photo so the faces (box = [x0, y0, x1, y1] as fractions)
 * stay in frame with headroom, for a frame of the given aspect (width / height).
 */
const cropFor = (photo: PhotoInfo, aspect: number) => {
  if (!photo.box || !photo.w || !photo.h) return null;
  const [x0, y0, x1, y1] = photo.box;
  const ia = photo.w / photo.h;
  const vw = ia > aspect ? aspect / ia : 1; // visible part of the image, as a fraction
  const vh = ia > aspect ? 1 : ia / aspect;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  let wy0 = y0 - 0.2 * vh; // faces start 20% down the frame
  if (y1 > wy0 + vh * 0.8) wy0 = cy - vh / 2; // too tall: centre them instead
  wy0 = Math.min(Math.max(wy0, 0), 1 - vh);
  const wx0 = Math.min(Math.max(cx - vw / 2, 0), 1 - vw);
  return {
    pos: `${vw < 1 ? (wx0 / (1 - vw)) * 100 : 50}% ${vh < 1 ? (wy0 / (1 - vh)) * 100 : 50}%`,
    origin: `${((cx - wx0) / vw) * 100}% ${((cy - wy0) / vh) * 100}%`,
  };
};
export const HER: string = project.her;
export const HIM: string = project.him;
export const YEARS: number = project.years;
/** Names in the order they appear on screen ("Naveen & Neeru"). */
const himFirst = (project as { nameOrder?: string }).nameOrder === "him-first";
export const FIRST: string = himFirst ? HIM : HER;
export const SECOND: string = himFirst ? HER : HIM;
const wedding = new Date(project.weddingDate + "T00:00:00");
export const START_YEAR = wedding.getFullYear();
export const END_YEAR = START_YEAR + YEARS;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const DAY = wedding.getDate();
export const MONTH_INDEX = wedding.getMonth();
export const MONTH = MONTHS[MONTH_INDEX];
export const pad2 = (n: number) => String(n).padStart(2, "0");
export const DATE_DOTS = (y: number) => `${pad2(DAY)} · ${pad2(MONTH_INDEX + 1)} · ${y}`;
export const DAYS_TOGETHER = Math.round(
  (new Date(END_YEAR, MONTH_INDEX, DAY).getTime() - wedding.getTime()) / 86400000,
);
export const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const PHOTOS: PhotoInfo[] = project.photos;
/** Photo number i (wraps around if there are fewer photos than slots). */
export const photoAt = (i: number): PhotoInfo => PHOTOS[((i % PHOTOS.length) + PHOTOS.length) % PHOTOS.length];
export const PHOTO_COUNT = PHOTOS.length;

// ---------- Song timing (made by tools/prepare_song.py) ----------
export type Timing = { duration: number; beats: number[] };
export const makeTiming = (t: Timing) => {
  const beats = t.beats.map((s) => Math.round(s * FPS));
  const period = (beats[beats.length - 1] - beats[0]) / (beats.length - 1);
  const beat = (i: number) =>
    i < beats.length ? beats[i] : Math.round(beats[beats.length - 1] + (i - beats.length + 1) * period);
  return { total: Math.round(t.duration * FPS), beats, beat, period };
};

// ---------- Visual building blocks ----------
export const Photo: React.FC<{
  photo: PhotoInfo;
  dur: number;
  from?: number;
  to?: number;
  fx?: number;
  fy?: number;
  dx?: number;
  dy?: number;
  filter?: string;
  style?: React.CSSProperties;
  /** frame width / height, so the crop keeps faces in view (default: full 9:16 frame) */
  aspect?: number;
}> = ({ photo, dur, from = 1.04, to = 1.14, fx, fy, dx = 0, dy = 0, filter, style, aspect = 1080 / 1920 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, Math.max(1, dur)], [0, 1], clamp);
  const s = from + (to - from) * p;
  const x = fx ?? photo.fx ?? 50;
  const y = fy ?? photo.fy ?? 45;
  const crop = fx === undefined && fy === undefined ? cropFor(photo, aspect) : null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <Img
        src={staticFile(photo.src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: crop?.pos ?? `${x}% ${y}%`,
          transform: `translate(${dx * p}px, ${dy * p}px) scale(${s})`,
          transformOrigin: crop?.origin ?? `${x}% ${y}%`,
          filter,
        }}
      />
    </div>
  );
};

export const Grain: React.FC<{ opacity?: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({
  opacity = 0.18,
  blend = "overlay",
}) => {
  const f = useCurrentFrame();
  const id = `grain-${f}`;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: blend, pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 37} />
        </filter>
        <rect width="540" height="960" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Fades in over `fin` frames and out over the last `fout` frames of a sequence. */
export const useFade = (dur: number, fin = 8, fout = 8) => {
  const f = useCurrentFrame();
  return Math.min(interpolate(f, [0, fin], [0, 1], clamp), interpolate(f, [dur - fout, dur], [1, 0], clamp));
};
