import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Photo, PhotoInfo, clamp } from "./index";

// =====================================================================
// Light leaks: a soft warm bloom sweeps across the frame on every cut,
// plus a faint drifting glow the rest of the time.
// =====================================================================
type Palette = "warm" | "rose" | "gold";
const PALETTES: Record<Palette, [string, string, string]> = {
  warm: ["255,168,82", "255,104,72", "255,226,160"],
  rose: ["255,140,170", "255,96,120", "255,214,226"],
  gold: ["255,200,110", "255,150,60", "255,240,200"],
};

export const LightLeaks: React.FC<{ cuts: number[]; palette?: Palette; ambient?: number; strength?: number }> = ({
  cuts,
  palette = "warm",
  ambient = 0.18,
  strength = 0.9,
}) => {
  const f = useCurrentFrame();
  const [a, b, c] = PALETTES[palette];
  const blobs: React.ReactNode[] = [];
  cuts.forEach((cut, i) => {
    const d = f - cut;
    if (d < -18 || d > 34) return;
    const intensity = d < 0 ? Math.exp(-(d * d) / (2 * 7 * 7)) : Math.exp(-d / 13);
    const dir = i % 2 ? -1 : 1;
    const x = interpolate(d, [-18, 34], dir > 0 ? [-25, 125] : [125, -25]);
    const y = 25 + (i * 37) % 50;
    blobs.push(
      <AbsoluteFill
        key={i}
        style={{
          opacity: intensity * strength,
          background: `radial-gradient(ellipse 55% 75% at ${x}% ${y}%, rgba(${c},0.95) 0%, rgba(${a},0.7) 28%, rgba(${b},0.3) 52%, rgba(0,0,0,0) 72%)`,
        }}
      />,
    );
    // a short overexposure flash right on the cut
    if (d >= -3 && d < 8) {
      blobs.push(
        <AbsoluteFill key={`f${i}`} style={{ background: `rgba(${c},1)`, opacity: interpolate(d, [-3, 0, 8], [0, 0.35, 0], clamp) * strength }} />,
      );
    }
  });
  const ax = 50 + Math.sin(f / 70) * 45;
  const ay = 15 + Math.cos(f / 90) * 10;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          opacity: ambient,
          background: `radial-gradient(ellipse 70% 45% at ${ax}% ${ay}%, rgba(${a},0.8) 0%, rgba(${b},0.25) 45%, rgba(0,0,0,0) 70%)`,
        }}
      />
      {blobs}
    </AbsoluteFill>
  );
};

// =====================================================================
// Shot transitions
// =====================================================================
export type Enter = "blur" | "wipe" | "zoom" | "iris" | "fade" | "rise";
export type Exit = "blur" | "zoom" | "fade" | "none";

const ShotFX: React.FC<{ dur: number; inLen: number; outLen: number; enter: Enter; exit: Exit; children: React.ReactNode }> = ({
  dur,
  inLen,
  outLen,
  enter,
  exit,
  children,
}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, inLen], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const x = interpolate(f, [dur - outLen, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  let opacity = 1;
  let blur = 0;
  let scale = 1;
  let y = 0;
  let mask: string | undefined;
  if (enter === "blur") {
    opacity = e;
    blur = (1 - e) * 26;
    scale = 1.06 - 0.06 * e;
  } else if (enter === "zoom") {
    opacity = e;
    blur = (1 - e) * 18;
    scale = 1.3 - 0.3 * e;
  } else if (enter === "fade") {
    opacity = e;
  } else if (enter === "rise") {
    opacity = e;
    y = (1 - e) * 140;
    blur = (1 - e) * 10;
  } else if (enter === "wipe") {
    const p = interpolate(e, [0, 1], [-30, 130]);
    mask = `linear-gradient(105deg, #000 ${p - 30}%, rgba(0,0,0,0) ${p}%)`;
  } else if (enter === "iris") {
    const r = interpolate(e, [0, 1], [0, 95]);
    mask = `radial-gradient(circle at 50% 45%, #000 ${r}%, rgba(0,0,0,0) ${r + 14}%)`;
  }
  if (exit === "blur") {
    opacity *= 1 - x;
    blur += x * 18;
    scale *= 1 + 0.05 * x;
  } else if (exit === "zoom") {
    opacity *= 1 - x;
    blur += x * 14;
    scale *= 1 + 0.25 * x;
  } else if (exit === "fade") {
    opacity *= 1 - x;
  }
  return (
    <AbsoluteFill
      style={{
        opacity,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        transform: `translateY(${y}px) scale(${scale})`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export type ShotSpec = {
  from: number;
  to: number;
  enter?: Enter;
  exit?: Exit;
  render: (dur: number) => React.ReactNode;
};

/** Lays shots on the timeline; each one overlaps the next by `overlap` frames. */
export const Shots: React.FC<{ shots: ShotSpec[]; overlap?: number; inLen?: number }> = ({ shots, overlap = 14, inLen = 18 }) => (
  <>
    {shots.map((s, i) => {
      const last = i === shots.length - 1;
      const dur = s.to - s.from + (last ? 0 : overlap);
      return (
        <Sequence key={i} from={s.from} durationInFrames={dur}>
          <ShotFX dur={dur} inLen={inLen} outLen={last ? 1 : overlap + 4} enter={s.enter ?? "blur"} exit={last ? "none" : (s.exit ?? "fade")}>
            {s.render(dur)}
          </ShotFX>
        </Sequence>
      );
    })}
  </>
);

// =====================================================================
// Creative frames (vertical-first, minimal)
// =====================================================================

/** Full-bleed photo with a slow push-in and a thin inset line. */
export const FullBleed: React.FC<{ photo: PhotoInfo; dur: number; line?: string; filter?: string; push?: [number, number] }> = ({
  photo,
  dur,
  line = "rgba(255,255,255,0.55)",
  filter,
  push = [1.04, 1.14],
}) => (
  <AbsoluteFill>
    <Photo photo={photo} dur={dur} from={push[0]} to={push[1]} filter={filter} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)" }} />
    {line ? <div style={{ position: "absolute", inset: 46, border: `2px solid ${line}` }} /> : null}
  </AbsoluteFill>
);

/** Blurred copy of the photo fills the frame; the sharp photo sits inside a rounded window. */
export const BlurFill: React.FC<{ photo: PhotoInfo; dur: number; box: React.CSSProperties; radius?: number | string; filter?: string; tint?: string }> = ({
  photo,
  dur,
  box,
  radius = 28,
  filter,
  tint = "rgba(0,0,0,0.25)",
}) => (
  <AbsoluteFill>
    <Photo photo={photo} dur={dur} from={1.3} to={1.4} filter={`blur(34px) brightness(0.8) saturate(1.1) ${filter ?? ""}`} />
    <AbsoluteFill style={{ background: tint }} />
    <div style={{ position: "absolute", overflow: "hidden", borderRadius: radius, boxShadow: "0 30px 80px rgba(0,0,0,0.45)", ...box }}>
      <Photo photo={photo} dur={dur} from={1.02} to={1.1} filter={filter} aspect={Number(box.width) / Number(box.height)} />
    </div>
  </AbsoluteFill>
);

/** Arch-shaped window. */
export const ArchWindow: React.FC<{ photo: PhotoInfo; dur: number; left: number; top: number; w: number; h: number; border?: string; filter?: string }> = ({
  photo,
  dur,
  left,
  top,
  w,
  h,
  border = "rgba(255,255,255,0.9)",
  filter,
}) => (
  <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: `${w / 2}px ${w / 2}px 10px 10px`, overflow: "hidden", boxShadow: `0 0 0 3px ${border}, 0 30px 70px rgba(0,0,0,0.45)` }}>
    <Photo photo={photo} dur={dur} from={1.04} to={1.14} filter={filter} aspect={w / h} />
  </div>
);

/** Two photos side by side (or stacked) with a hairline gap, revealed one after the other. */
export const Diptych: React.FC<{ a: PhotoInfo; b: PhotoInfo; dur: number; stacked?: boolean; gap?: number; bg?: string; filter?: string }> = ({
  a,
  b,
  dur,
  stacked,
  gap = 14,
  bg = "#f4efe6",
  filter,
}) => {
  const f = useCurrentFrame();
  const r1 = interpolate(f, [0, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const r2 = interpolate(f, [12, 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const half: React.CSSProperties = stacked
    ? { position: "absolute", left: gap, right: gap, height: (1920 - gap * 3) / 2, overflow: "hidden" }
    : { position: "absolute", top: gap, bottom: gap, width: (1080 - gap * 3) / 2, overflow: "hidden" };
  const halfAspect = stacked ? (1080 - gap * 2) / ((1920 - gap * 3) / 2) : (1080 - gap * 3) / 2 / (1920 - gap * 2);
  return (
    <AbsoluteFill style={{ background: bg }}>
      <div style={{ ...half, ...(stacked ? { top: gap } : { left: gap }), clipPath: stacked ? `inset(0 ${(1 - r1) * 100}% 0 0)` : `inset(0 0 ${(1 - r1) * 100}% 0)` }}>
        <Photo photo={a} dur={dur} from={1.12} to={1.04} filter={filter} aspect={halfAspect} />
      </div>
      <div style={{ ...half, ...(stacked ? { bottom: gap } : { right: gap }), clipPath: stacked ? `inset(0 0 0 ${(1 - r2) * 100}%)` : `inset(${(1 - r2) * 100}% 0 0 0)` }}>
        <Photo photo={b} dur={dur} from={1.04} to={1.12} filter={filter} aspect={halfAspect} />
      </div>
    </AbsoluteFill>
  );
};

/** Polaroid with washi tape and a handwritten line. */
export const TapedPolaroid: React.FC<{
  photo: PhotoInfo;
  dur: number;
  left: number;
  top: number;
  w: number;
  rot?: number;
  label?: string;
  font?: string;
  filter?: string;
  tape?: string;
}> = ({ photo, dur, left, top, w, rot = 0, label, font, filter, tape = "rgba(240,214,160,0.85)" }) => (
  <div style={{ position: "absolute", left, top, width: w, padding: 22, paddingBottom: label ? 130 : 80, background: "#fbf8f1", boxShadow: "0 25px 60px rgba(0,0,0,0.4)", transform: `rotate(${rot}deg)` }}>
    <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden" }}>
      <Photo photo={photo} dur={dur} from={1.04} to={1.12} filter={filter} aspect={0.8} />
    </div>
    {label ? (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: font, fontSize: 64, color: "#3b2c22" }}>{label}</div>
    ) : null}
    <div style={{ position: "absolute", top: -22, left: "50%", width: 200, height: 54, marginLeft: -100, background: tape, transform: "rotate(-4deg)", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
  </div>
);

/** Photo with torn-paper edges. */
export const TornPaper: React.FC<{ photo: PhotoInfo; dur: number; left: number; top: number; w: number; h: number; rot?: number; filter?: string; seed?: number }> = ({
  photo,
  dur,
  left,
  top,
  w,
  h,
  rot = 0,
  filter,
  seed = 1,
}) => {
  // jagged polygon around the edge
  const pts: string[] = [];
  const n = 26;
  const jag = (i: number, k: string) => 1.2 + ((Math.sin(i * 12.9898 + seed * 78.233 + k.length) * 43758.5453) % 1 + 1) % 1 * 2.2;
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${jag(i, "t")}%`);
  for (let i = 0; i <= n; i++) pts.push(`${100 - jag(i, "rr")}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - jag(i, "bbb")}%`);
  for (let i = n; i >= 0; i--) pts.push(`${jag(i, "llll")}% ${(i / n) * 100}%`);
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h, transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.45))" }}>
      <div style={{ position: "absolute", inset: 0, background: "#f3ead8", clipPath: `polygon(${pts.join(",")})` }} />
      <div style={{ position: "absolute", inset: 26, overflow: "hidden" }}>
        <Photo photo={photo} dur={dur} from={1.04} to={1.12} filter={filter} aspect={(w - 52) / (h - 52)} />
      </div>
    </div>
  );
};

/** 35mm film frame with sprocket holes and edge markings. */
export const FilmFrame: React.FC<{ photo: PhotoInfo; dur: number; num: number; filter?: string }> = ({ photo, dur, num, filter }) => {
  const f = useCurrentFrame();
  const slide = interpolate(f, [0, dur], [40, -40]);
  const holes = new Array(14).fill(0);
  return (
    <AbsoluteFill style={{ background: "#0b0907" }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 180 + slide, height: 1560, background: "#16120e", borderRadius: 6 }}>
        {[0, 1].map((side) => (
          <div key={side} style={{ position: "absolute", top: 0, bottom: 0, [side ? "right" : "left"]: 18, width: 46, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            {holes.map((_, i) => (
              <div key={i} style={{ height: 64, borderRadius: 8, background: "#e9dfc8", opacity: 0.85 }} />
            ))}
          </div>
        ))}
        <div style={{ position: "absolute", left: 90, right: 90, top: 70, bottom: 70, overflow: "hidden" }}>
          <Photo photo={photo} dur={dur} from={1.06} to={1.12} filter={filter} aspect={780 / 1420} />
        </div>
        <div style={{ position: "absolute", left: 90, top: 20, fontFamily: "monospace", fontSize: 26, color: "#e8a23a", letterSpacing: 4 }}>KODAK 400 ▸ {num}A</div>
        <div style={{ position: "absolute", right: 90, bottom: 18, fontFamily: "monospace", fontSize: 26, color: "#e8a23a", letterSpacing: 4 }}>{num + 1} ▸ 25</div>
      </div>
    </AbsoluteFill>
  );
};

/** Vertical photo-booth strip of three photos. */
export const BoothStrip: React.FC<{ photos: PhotoInfo[]; dur: number; bg?: string; font?: string; label?: string; filter?: string }> = ({ photos, dur, bg = "#1a1410", font, label, filter }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg }}>
      <div style={{ position: "absolute", left: 250, top: 300, width: 580, padding: 24, paddingBottom: 100, background: "#fbf8f1", transform: "rotate(-2deg)", boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
        {photos.slice(0, 3).map((p, i) => {
          const r = interpolate(f, [i * 10, i * 10 + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ position: "relative", height: 430, marginBottom: i < 2 ? 18 : 0, overflow: "hidden", background: "#ddd" }}>
              <div style={{ position: "absolute", inset: 0, opacity: r, filter: `brightness(${1 + (1 - r) * 1.5})` }}>
                <Photo photo={p} dur={dur} from={1.08} to={1.14} filter={filter} aspect={532 / 430} />
              </div>
            </div>
          );
        })}
        {label ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, textAlign: "center", fontFamily: font, fontSize: 60, color: "#3b2c22" }}>{label}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/** Two photos blended like a double exposure. */
export const DoubleExposure: React.FC<{ base: PhotoInfo; over: PhotoInfo; dur: number }> = ({ base, over, dur }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, dur], [0.15, 0.55]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Photo photo={base} dur={dur} from={1.04} to={1.12} />
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: o }}>
        <Photo photo={over} dur={dur} from={1.3} to={1.18} filter="blur(2px) saturate(0.9)" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Plain still image (no Ken Burns) — handy for textures. */
export const Still: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />
);
