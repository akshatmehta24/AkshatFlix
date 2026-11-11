import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadKaushan } from "@remotion/google-fonts/KaushanScript";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadHomemade } from "@remotion/google-fonts/HomemadeApple";
import { loadFont as loadTiro } from "@remotion/google-fonts/TiroDevanagariHindi";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import timing from "../timing/t2.json";
import { DATE_DOTS, END_YEAR, FIRST, SECOND, START_YEAR, YEARS, clamp, makeTiming, ordinal, photoAt, Grain, Vignette } from "../shared";
import { ArchWindow, BlurFill, Diptych, Enter, FullBleed, LightLeaks, ShotSpec, Shots, TapedPolaroid, TornPaper } from "../shared/fx";
import { Lyrics } from "../shared/lyrics";
import lyrics from "../lyrics/t2.json";

const { fontFamily: BRUSH } = loadKaushan("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: HAND } = loadCaveat("normal", { weights: ["500"], subsets: ["latin"] });
const { fontFamily: INK } = loadHomemade("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: HINDI } = loadTiro("normal", { weights: ["400"], subsets: ["devanagari"] });
const { fontFamily: SERIF } = loadCormorant("italic", { weights: ["500"], subsets: ["latin"] });

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
        {FIRST} &amp; {SECOND}
      </div>
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
          {FIRST} &amp; {SECOND}
        </div>
        <div style={{ fontFamily: HAND, fontSize: 66, color: "#f3dfc0", opacity: b, marginTop: 30 }}>
          {DATE_DOTS(START_YEAR)} — {DATE_DOTS(END_YEAR)}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fbf6ee", opacity: white }} />
    </AbsoluteFill>
  );
};

// ---------- Running order (in beats; the song is ~112 BPM, 8 beats ≈ 4.3 s) ----------
const OLD = "sepia(0.55) saturate(0.85) contrast(1.05)";
const SOFT = "sepia(0.15) saturate(1.05)";
const cream = "radial-gradient(ellipse at 50% 40%, #f5ecdc 0%, #e6d6bb 70%, #cdb894 100%)";

const SHOTS: { beats: [number, number]; enter: Enter; render: (d: number) => React.ReactNode }[] = [
  { beats: [8, 16], enter: "rise", render: (d) => <TornPaper photo={photoAt(0)} dur={d} left={130} top={230} w={820} h={1150} rot={-2} filter={OLD} seed={1} /> },
  { beats: [16, 24], enter: "blur", render: (d) => <TapedPolaroid photo={photoAt(1)} dur={d} left={170} top={250} w={740} rot={-3} label="the early days" font={HAND} filter={OLD} /> },
  { beats: [24, 32], enter: "wipe", render: (d) => <BlurFill photo={photoAt(2)} dur={d} box={{ left: 110, top: 260, width: 860, height: 950 }} radius={6} filter={OLD} /> },
  { beats: [32, 40], enter: "iris", render: (d) => <Diptych a={photoAt(3)} b={photoAt(4)} dur={d} stacked bg="#efe5d2" filter={SOFT} /> },
  { beats: [40, 48], enter: "blur", render: (d) => (
    <AbsoluteFill style={{ background: cream }}>
      <TapedPolaroid photo={photoAt(5)} dur={d} left={80} top={150} w={540} rot={-6} filter={SOFT} />
      <TapedPolaroid photo={photoAt(6)} dur={d} left={470} top={640} w={520} rot={5} label="always us" font={HAND} filter={SOFT} />
    </AbsoluteFill>
  ) },
  { beats: [48, 58], enter: "blur", render: (d) => (
    <AbsoluteFill style={{ background: cream }}>
      <TapedPolaroid photo={photoAt(9)} dur={d} left={300} top={140} w={560} rot={4} filter={SOFT} />
      <TapedPolaroid photo={photoAt(7)} dur={d} left={70} top={620} w={540} rot={-5} label="little celebrations" font={HAND} filter={SOFT} />
    </AbsoluteFill>
  ) },
  { beats: [58, 66], enter: "blur", render: (d) => <BlurFill photo={photoAt(13)} dur={d} box={{ left: 70, top: 560, width: 940, height: 640 }} filter={SOFT} /> },
  { beats: [66, 74], enter: "iris", render: (d) => (
    <AbsoluteFill style={{ background: cream }}>
      <ArchWindow photo={photoAt(15)} dur={d} left={190} top={220} w={700} h={1120} border="#b8925a" filter={SOFT} />
    </AbsoluteFill>
  ) },
  { beats: [74, 82], enter: "rise", render: (d) => <TornPaper photo={photoAt(17)} dur={d} left={130} top={230} w={820} h={1150} rot={2} filter={SOFT} seed={4} /> },
  { beats: [82, 90], enter: "wipe", render: (d) => <FullBleed photo={photoAt(19)} dur={d} filter={SOFT} line="rgba(255,240,215,0.6)" /> },
];
const TITLE_END = 8;
const FINALE_BEAT = 90;

export const Template2: React.FC = () => {
  const shots: ShotSpec[] = SHOTS.map((sh) => ({
    from: T.beat(sh.beats[0]),
    to: T.beat(sh.beats[1]),
    enter: sh.enter,
    exit: "blur",
    render: sh.render,
  }));
  const finaleFrom = T.beat(FINALE_BEAT) + 6;
  const cuts = [...shots.map((s) => s.from), finaleFrom];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/t2.mp3")} />
      <Paper />
      <Sequence durationInFrames={T.beat(TITLE_END) + 14}>
        <Title dur={T.beat(TITLE_END) + 14} />
      </Sequence>
      <Shots shots={shots} overlap={16} inLen={20} />
      <Sequence from={finaleFrom} durationInFrames={T.total - finaleFrom}>
        <Finale dur={T.total - finaleFrom} />
      </Sequence>
      <LightLeaks cuts={cuts} palette="warm" ambient={0.14} />
      <Lyrics data={lyrics} font={HAND} hiFont={HINDI} enFont={SERIF} size={80} bottom={150} accent="#ffe2b0" />
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
