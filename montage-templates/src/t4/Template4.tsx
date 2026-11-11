import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadAllura } from "@remotion/google-fonts/Allura";
import { loadFont as loadBungee } from "@remotion/google-fonts/Bungee";
import timing from "../timing/t4.json";
import { HER, HIM, YEARS, clamp, makeTiming, ordinal, photoAt, Grain, Vignette } from "../shared";
import { ArchWindow, BoothStrip, Diptych, FilmFrame, FullBleed, LightLeaks, ShotSpec, Shots } from "../shared/fx";
import { Lyrics } from "../shared/lyrics";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import lyrics from "../lyrics/t4.json";

const { fontFamily: MARKER } = loadMarker("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["500"], subsets: ["latin"] });
const { fontFamily: SCRIPT } = loadAllura("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: NEON } = loadBungee("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: SERIF } = loadCormorant("italic", { weights: ["500"], subsets: ["latin"] });

const T = makeTiming(timing);
export const T4_DURATION = T.total;

const ANNIV = `${ordinal(YEARS)} anniversary`;

// ---------- Cassette tape ----------
const Reel: React.FC<{ cx: number; cy: number; angle: number; tape: number }> = ({ cx, cy, angle, tape }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={tape} fill="#3b2418" />
    <circle r={40} fill="#e8e0cf" />
    <g transform={`rotate(${angle})`}>
      {new Array(6).fill(0).map((_, i) => (
        <rect key={i} x={-5} y={-30} width={10} height={14} fill="#2b2724" transform={`rotate(${i * 60})`} />
      ))}
    </g>
    <circle r={16} fill="#2b2724" />
  </g>
);

const Cassette: React.FC<{ spin: number }> = ({ spin }) => (
  <svg width="840" height="540" viewBox="0 0 840 540">
    <defs>
      <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3430" />
        <stop offset="1" stopColor="#1e1b19" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="832" height="532" rx="30" fill="url(#body)" stroke="#0e0d0c" strokeWidth="4" />
    <rect x="44" y="40" width="752" height="330" rx="18" fill="#efe4c9" />
    <rect x="44" y="40" width="752" height="22" rx="10" fill="#c8452f" />
    <rect x="44" y="62" width="752" height="10" fill="#e89a3c" />
    <text x="420" y="150" textAnchor="middle" fontFamily={MARKER} fontSize="64" fill="#1f1a17">
      {HER} ♥ {HIM}
    </text>
    <rect x="240" y="180" width="360" height="120" rx="58" fill="#15110f" stroke="#6a625a" strokeWidth="4" />
    <Reel cx={315} cy={240} angle={spin} tape={52} />
    <Reel cx={525} cy={240} angle={spin} tape={44} />
    <text x="420" y="350" textAnchor="middle" fontFamily={MARKER} fontSize="44" fill="#1f1a17">
      {ANNIV.toUpperCase()}
    </text>
    <text x="80" y="110" fontFamily={OSWALD} fontSize="34" fill="#8a7a62">A</text>
    <path d="M170 536 L220 420 L620 420 L670 536 Z" fill="#26221f" stroke="#0e0d0c" strokeWidth="3" />
    {[[30, 30], [810, 30], [30, 510], [810, 510], [420, 470]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="9" fill="#5e5852" stroke="#1a1816" strokeWidth="2" />
    ))}
  </svg>
);

// ---------- Tape deck scene ----------
const Deck: React.FC<{ drop: number; spin: number; neon: string; neonOn: number; press: number; zoom: number }> = ({
  drop,
  spin,
  neon,
  neonOn,
  press,
  zoom,
}) => (
  <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 15%, #7a4a22 0%, #3d2412 40%, #160c05 100%)" }} />
    {/* top panel */}
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: 290,
        height: 230,
        borderRadius: 18,
        background: "linear-gradient(180deg, #3a2a1c, #20160d)",
        boxShadow: "inset 0 2px 0 rgba(255,220,170,0.15), 0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ position: "absolute", left: 40, top: 26, fontFamily: OSWALD, fontSize: 24, color: "#b9a487", letterSpacing: 3 }}>
        VT-25 &nbsp; STEREO
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 80, textAlign: "center", fontFamily: OSWALD, fontSize: 68, color: "#e2d6c1", letterSpacing: 6 }}>
        {ANNIV.toUpperCase()}
      </div>
      <div style={{ position: "absolute", left: 40, bottom: 18, fontFamily: OSWALD, fontSize: 22, color: "#b9a487" }}>VE-25</div>
    </div>
    {/* tape door */}
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 590,
        width: 900,
        height: 640,
        borderRadius: 22,
        background: "linear-gradient(180deg, #120c08, #24180f)",
        boxShadow: "inset 0 20px 50px rgba(0,0,0,0.9), 0 2px 0 rgba(255,220,170,0.12)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 30, top: 50 + drop, transform: `rotate(${(drop / -900) * 6}deg)` }}>
        <Cassette spin={spin} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,230,190,0.16), rgba(0,0,0,0) 40%)" }} />
    </div>
    {/* buttons */}
    <div style={{ position: "absolute", left: 90, top: 1280, width: 900, display: "flex", gap: 14 }}>
      {["◀◀", "▶", "▶▶", "■", "⏏"].map((b, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 110,
            borderRadius: 10,
            background: "linear-gradient(180deg, #4a3a2c, #241a12)",
            boxShadow: "0 8px 0 #0d0905, inset 0 2px 0 rgba(255,220,170,0.2)",
            transform: `translateY(${i === 1 ? press * 8 : 0}px)`,
            color: i === 1 && press > 0.5 ? "#ffcf6a" : "#cdbb9f",
            fontSize: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: OSWALD,
          }}
        >
          {b}
        </div>
      ))}
    </div>
    {/* neon sign */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1500,
        textAlign: "center",
        fontFamily: NEON,
        fontSize: 170,
        color: neonOn > 0.5 ? "#ffe6a8" : "#5a4630",
        textShadow:
          neonOn > 0.5
            ? "0 0 10px #ffb347, 0 0 30px #ff9a1f, 0 0 60px #ff7b00, 0 0 110px #ff5e00"
            : "none",
        opacity: neonOn > 0 ? 1 : 0,
      }}
    >
      {neon}
    </div>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 75% 10%, rgba(255,170,80,0.35), rgba(0,0,0,0) 45%)", mixBlendMode: "screen" }} />
    <Grain opacity={0.16} />
    <Vignette strength={0.65} />
  </AbsoluteFill>
);

// Neon flicker pattern: off/on blips, then steady.
const flicker = (f: number, start: number) => {
  const pattern = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1];
  const i = Math.floor((f - start) / 2);
  if (f < start) return 0;
  return i < pattern.length ? pattern[i] : 1;
};

const IntroDeck: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seat = spring({ frame: f - 4, fps, config: { damping: 13, mass: 1.1 }, durationInFrames: T.beat(3) });
  const spinStart = T.beat(5);
  const spin = f < spinStart ? 0 : (f - spinStart) * 9;
  const pressAt = T.beat(6);
  const press = interpolate(f, [pressAt, pressAt + 3, pressAt + 10], [0, 1, 0.6], clamp);
  const zoom = interpolate(f, [dur - 20, dur + 10], [1, 2.2], { ...clamp, easing: Easing.in(Easing.cubic) });
  const blur = interpolate(f, [dur - 14, dur + 10], [0, 20], clamp);
  return (
    <AbsoluteFill style={{ filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <Deck drop={(1 - seat) * -1100} spin={spin} neon="PLAY" neonOn={flicker(f, T.beat(7))} press={press} zoom={zoom} />
    </AbsoluteFill>
  );
};

const OutroDeck: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const inA = interpolate(f, [0, 8], [0, 1], clamp);
  const out = interpolate(f, [dur - 14, dur], [1, 0], clamp);
  const zoom = interpolate(f, [0, 20], [1.6, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: Math.min(inA, out), background: "#000" }}>
      <Deck drop={0} spin={f * 9} neon="FOREVER" neonOn={flicker(f, 10)} press={0} zoom={zoom} />
    </AbsoluteFill>
  );
};

// ---------- Photo section: calm shots joined by light leaks ----------
const PhotoReel: React.FC<{ startBeat: number; endBeat: number }> = ({ startBeat, endBeat }) => {
  const f = useCurrentFrame();
  const start = T.beat(startBeat);
  const dur = T.beat(endBeat) - start;
  const at = (beat: number) => T.beat(beat) - start;
  const title = interpolate(f, [6, 24], [0, 1], clamp);
  const out = interpolate(f, [dur - 10, dur], [1, 0], clamp);
  const warm = "sepia(0.25) saturate(1.05) contrast(1.03)";
  const shots: ShotSpec[] = [
    { from: 0, to: at(startBeat + 4), enter: "zoom", exit: "blur", render: (d) => <FilmFrame photo={photoAt(0)} dur={d} num={1} filter="sepia(0.55) contrast(1.05)" /> },
    { from: at(startBeat + 4), to: at(startBeat + 8), enter: "wipe", exit: "blur", render: (d) => <FullBleed photo={photoAt(1)} dur={d} filter={warm} /> },
    { from: at(startBeat + 8), to: at(startBeat + 12), enter: "blur", exit: "zoom", render: (d) => <BoothStrip photos={[photoAt(2), photoAt(3), photoAt(4)]} dur={d} font={SCRIPT} label="us, always" filter={warm} /> },
    { from: at(startBeat + 12), to: at(startBeat + 16), enter: "iris", exit: "blur", render: (d) => <Diptych a={photoAt(5)} b={photoAt(6)} dur={d} bg="#120d09" filter={warm} /> },
    { from: at(startBeat + 16), to: at(startBeat + 20), enter: "blur", exit: "blur", render: (d) => (
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #3a2414 0%, #120b06 100%)" }}>
        <ArchWindow photo={photoAt(9)} dur={d} left={150} top={430} w={780} h={1080} border="#e9cf9a" filter={warm} />
      </AbsoluteFill>
    ) },
    { from: at(startBeat + 20), to: dur, enter: "wipe", render: (d) => <FullBleed photo={photoAt(11)} dur={d} filter={warm} /> },
  ];
  const cuts = shots.map((s) => s.from);
  return (
    <AbsoluteFill style={{ background: "#0b0805", opacity: out }}>
      <Shots shots={shots} overlap={12} inLen={16} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 16%)" }} />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: SCRIPT, fontSize: 110, color: "#fbf3e6", opacity: title, textShadow: "0 4px 24px rgba(0,0,0,0.7)" }}>
        {ANNIV}
      </div>
      <LightLeaks cuts={cuts} palette="warm" />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};

// ---------- Running order (in beats; the song is ~108 BPM) ----------
const PHOTOS_FROM = 10;
const PHOTOS_TO = 34;

export const Template4: React.FC = () => {
  const introEnd = T.beat(PHOTOS_FROM);
  const outroStart = T.beat(PHOTOS_TO);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/t4.mp3")} />
      <Sequence durationInFrames={introEnd + 12}>
        <IntroDeck dur={introEnd} />
      </Sequence>
      <Sequence from={introEnd} durationInFrames={outroStart - introEnd}>
        <PhotoReel startBeat={PHOTOS_FROM} endBeat={PHOTOS_TO} />
      </Sequence>
      <Sequence from={outroStart} durationInFrames={T.total - outroStart}>
        <OutroDeck dur={T.total - outroStart} />
      </Sequence>
      <LightLeaks cuts={[introEnd, outroStart]} palette="gold" ambient={0} />
      <Lyrics data={lyrics} font={SERIF} italic size={70} bottom={230} />
    </AbsoluteFill>
  );
};
