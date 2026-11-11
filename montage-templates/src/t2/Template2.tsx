import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadKaushan } from "@remotion/google-fonts/KaushanScript";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadHomemade } from "@remotion/google-fonts/HomemadeApple";
import timing from "../timing/t2.json";
import { DATE_DOTS, END_YEAR, HER, HIM, Photo, PhotoInfo, START_YEAR, YEARS, clamp, makeTiming, ordinal, photoAt, Grain, Vignette } from "../shared";

const { fontFamily: BRUSH } = loadKaushan("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: HAND } = loadCaveat("normal", { weights: ["500"], subsets: ["latin"] });
const { fontFamily: INK } = loadHomemade("normal", { weights: ["400"], subsets: ["latin"] });

const T = makeTiming(timing);
export const T2_DURATION = T.total;

// ---------- Background: old brown paper / table ----------
const SCRIBBLES = [
  "my dearest, every day with you is a gift",
  "forever yours, always and always",
  "the summer we first met, the rain, the tea",
  "with all my love, today and every day",
  "you and me, through every season",
  "a promise kept, a home made with love",
];

const Paper: React.FC = () => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, T.total], [1.0, 1.12]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#2a180c" }}>
      <AbsoluteFill style={{ transform: `scale(${drift}) rotate(${interpolate(f, [0, T.total], [0, 2])}deg)` }}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 35% 30%, #9a6a3d 0%, #6e4624 35%, #46290f 70%, #22130a 100%)",
          }}
        />
        <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.95 }}>
          <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none">
            <filter id="stain">
              <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={4} seed={7} />
              <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.18  0 0 0 1.4 -0.35" />
            </filter>
            <rect width="1080" height="1920" filter="url(#stain)" />
          </svg>
        </AbsoluteFill>
        <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity: 0.5 }}>
          <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none">
            <filter id="fibre">
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.04" numOctaves={2} seed={3} />
            </filter>
            <rect width="1080" height="1920" filter="url(#fibre)" />
          </svg>
        </AbsoluteFill>
        {SCRIBBLES.map((line, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -80 + (i % 2) * 140,
              top: 160 + i * 300,
              width: 1400,
              fontFamily: INK,
              fontSize: 44,
              color: "#f3dfc0",
              opacity: 0.14,
              transform: `rotate(${-8 + (i % 3) * 3}deg)`,
              whiteSpace: "nowrap",
            }}
          >
            {line} &nbsp; {line}
          </div>
        ))}
        <svg width="460" height="460" viewBox="0 0 100 100" style={{ position: "absolute", right: -60, top: 120, opacity: 0.12 }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="#f3dfc0" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#f3dfc0" strokeWidth="0.6" />
        </svg>
      </AbsoluteFill>
      <Grain opacity={0.2} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

// ---------- A printed photo with a white border ----------
const OLD = "sepia(0.6) saturate(0.85) contrast(1.05) brightness(0.96)";
const NEW = "saturate(1.08) contrast(1.03)";

const Print: React.FC<{
  photo: PhotoInfo;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  dur: number;
  filter: string;
  delay?: number;
}> = ({ photo, x, y, w, h, rot, dur, filter, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = delay ? spring({ frame: f - delay, fps, config: { damping: 15, mass: 0.8 } }) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        padding: 18,
        background: "#f7f1e6",
        boxShadow: "0 25px 50px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.35)",
        transform: `rotate(${rot}deg) scale(${pop}) translateY(${(1 - pop) * 120}px)`,
        opacity: pop > 0.02 ? 1 : 0,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <Photo photo={photo} dur={dur} from={1.06} to={1.14} filter={filter} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,30,10,0.35) 100%)",
          }}
        />
      </div>
    </div>
  );
};

type Layout = { x: number; y: number; w: number; h: number; rot: number; inset?: boolean }[];
const LAYOUTS: Layout[] = [
  [{ x: 70, y: 520, w: 940, h: 720, rot: -3 }],
  [
    { x: 150, y: 330, w: 780, h: 1020, rot: 2 },
    { x: 520, y: 1160, w: 470, h: 360, rot: -6, inset: true },
  ],
  [
    { x: 50, y: 260, w: 820, h: 620, rot: -5 },
    { x: 210, y: 960, w: 820, h: 620, rot: 4, inset: true },
  ],
  [
    { x: 60, y: 480, w: 960, h: 730, rot: 1.5 },
    { x: 640, y: 1100, w: 370, h: 480, rot: 7, inset: true },
  ],
  [{ x: 110, y: 300, w: 860, h: 1180, rot: -2 }],
];

// Direction each slide pans in from: like a camera moving across a table.
const DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

const Slide: React.FC<{ layout: Layout; first: number; dur: number; filter: string; dir: number[]; insetDelay: number }> = ({
  layout,
  first,
  dur,
  filter,
  dir,
  insetDelay,
}) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 16], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const exit = interpolate(f, [dur - 12, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const dx = (enter * dir[0] - exit * dir[0]) * 1250;
  const dy = (enter * dir[1] - exit * dir[1]) * 2100;
  const zoom = interpolate(f, [0, dur], [1.0, 1.05]);
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${zoom})` }}>
      {layout.map((p, i) => (
        <Print key={i} photo={photoAt(first + i)} {...p} dur={dur} filter={filter} delay={p.inset ? insetDelay : 0} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- Text scenes ----------
const Title: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const w1 = interpolate(f, [6, 30], [100, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const w2 = interpolate(f, [26, 56], [100, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const out = interpolate(f, [dur - 10, dur], [1, 0], clamp);
  const style: React.CSSProperties = {
    fontFamily: BRUSH,
    color: "#fffaf0",
    textAlign: "center",
    textShadow: "0 4px 18px rgba(0,0,0,0.6)",
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
      <div style={{ ...style, fontSize: 92, clipPath: `inset(0 ${w1}% 0 0)` }}>Happy {ordinal(YEARS)} Anniversary</div>
      <div style={{ ...style, fontSize: 128, marginTop: 10, whiteSpace: "nowrap", clipPath: `inset(0 ${w2}% 0 0)` }}>
        {HER} &amp; {HIM}
      </div>
    </AbsoluteFill>
  );
};

const QUOTE = [
  `${YEARS} years of love,`,
  "laughter and togetherness.",
  "Through every season,",
  "you chose each other.",
  "Thank you for showing us",
  "what forever looks like.",
];

const Quote: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 10, dur], [1, 0], clamp);
  const per = (dur - 40) / QUOTE.length;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
      {QUOTE.map((line, i) => {
        const a = interpolate(f, [8 + i * per, 8 + i * per + 14], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              fontFamily: HAND,
              fontSize: 90,
              lineHeight: 1.35,
              color: "#fffaf0",
              opacity: a,
              transform: `translateY(${(1 - a) * 16}px)`,
              textShadow: "0 3px 14px rgba(0,0,0,0.6)",
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Finale: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [4, 22], [0, 1], clamp);
  const b = interpolate(f, [18, 40], [0, 1], clamp);
  const white = interpolate(f, [dur - 30, dur], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontFamily: BRUSH, fontSize: 92, color: "#fffaf0", opacity: a, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>
          Happy {ordinal(YEARS)} Anniversary
        </div>
        <div style={{ fontFamily: BRUSH, fontSize: 128, whiteSpace: "nowrap", color: "#fffaf0", opacity: a, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>
          {HER} &amp; {HIM}
        </div>
        <div style={{ fontFamily: HAND, fontSize: 66, color: "#f3dfc0", opacity: b, marginTop: 30 }}>
          {DATE_DOTS(START_YEAR)} — {DATE_DOTS(END_YEAR)}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fbf6ee", opacity: white }} />
    </AbsoluteFill>
  );
};

// ---------- Running order (in beats; the song is ~112 BPM) ----------
const OLD_SLIDES = 8;
const NEW_SLIDES = 4;
const SLIDE_BEATS = 6;
const TITLE_END = 8;
const OLD_END = TITLE_END + OLD_SLIDES * SLIDE_BEATS; // 56
const QUOTE_END = OLD_END + 12; // 68
const NEW_END = QUOTE_END + NEW_SLIDES * SLIDE_BEATS; // 92
const OVERLAP = 12;

export const Template2: React.FC = () => {
  let photoIndex = 0;
  const slides: React.ReactNode[] = [];
  const addSlides = (count: number, startBeat: number, filter: string, layoutOffset: number) => {
    for (let k = 0; k < count; k++) {
      const s = T.beat(startBeat + k * SLIDE_BEATS);
      const e = T.beat(startBeat + (k + 1) * SLIDE_BEATS) + OVERLAP;
      const layout = LAYOUTS[(k + layoutOffset) % LAYOUTS.length];
      const first = photoIndex;
      photoIndex += layout.length;
      slides.push(
        <Sequence key={`${startBeat}-${k}`} from={s} durationInFrames={e - s}>
          <Slide
            layout={layout}
            first={first}
            dur={e - s}
            filter={filter}
            dir={DIRS[(k + layoutOffset) % DIRS.length]}
            insetDelay={T.beat(startBeat + k * SLIDE_BEATS + 2) - s}
          />
        </Sequence>,
      );
    }
  };
  addSlides(OLD_SLIDES, TITLE_END, OLD, 0);
  addSlides(NEW_SLIDES, QUOTE_END, NEW, 1);

  // Floating dust in front of everything.
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/t2.mp3")} />
      <Paper />
      <Sequence durationInFrames={T.beat(TITLE_END) + OVERLAP}>
        <Title dur={T.beat(TITLE_END) + OVERLAP} />
      </Sequence>
      {slides}
      <Sequence from={T.beat(OLD_END) + 6} durationInFrames={T.beat(QUOTE_END) - T.beat(OLD_END)}>
        <Quote dur={T.beat(QUOTE_END) - T.beat(OLD_END)} />
      </Sequence>
      <Sequence from={T.beat(NEW_END) + 4} durationInFrames={T.total - T.beat(NEW_END) - 4}>
        <Finale dur={T.total - T.beat(NEW_END) - 4} />
      </Sequence>
      <Dust />
    </AbsoluteFill>
  );
};

const Dust: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(40).fill(0).map((_, i) => {
        const x = random(`dx${i}`) * 1080 + Math.sin(f / 40 + i) * 20;
        const y = (random(`dy${i}`) * 1920 + f * (0.3 + random(`dv${i}`) * 0.8)) % 1920;
        const s = 2 + random(`ds${i}`) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: "#ffe9c4",
              opacity: 0.25 + 0.3 * Math.abs(Math.sin(f / 20 + i)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
