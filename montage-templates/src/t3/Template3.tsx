import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadParisienne } from "@remotion/google-fonts/Parisienne";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import timing from "../timing/t3.json";
import { DATE_DOTS, END_YEAR, HER, HIM, Photo, PhotoInfo, START_YEAR, YEARS, clamp, makeTiming, photoAt } from "../shared";

const { fontFamily: SCRIPT } = loadParisienne("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: SANS } = loadMontserrat("normal", { weights: ["500"], subsets: ["latin"] });
const { fontFamily: SERIF } = loadCormorant("normal", { weights: ["500"], subsets: ["latin"] });

const T = makeTiming(timing);
export const T3_DURATION = T.total;

// ---------- Dreamy background: blurred, tinted collage of the photos ----------
const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const rot = interpolate(f, [0, T.total], [-4, 6]);
  const zoom = interpolate(f, [0, T.total], [1.15, 1.35]);
  const tiles = new Array(9).fill(0).map((_, i) => ({
    x: (i % 3) * 420 - 160 + random(`bx${i}`) * 120,
    y: Math.floor(i / 3) * 700 - 200 + random(`by${i}`) * 140,
    r: random(`br${i}`) * 40 - 20,
  }));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#1b0f22" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) rotate(${rot}deg)`, filter: "blur(22px) brightness(0.8) saturate(1.3)" }}>
        {tiles.map((t, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              width: 620,
              height: 760,
              transform: `rotate(${t.r}deg)`,
              borderRadius: 30,
              overflow: "hidden",
            }}
          >
            <Photo photo={photoAt(i + 3)} dur={T.total} from={1.2} to={1.2} />
          </div>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(190,90,200,0.55), rgba(70,25,110,0.6))", mixBlendMode: "color" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,200,230,0.12) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <Bokeh />
    </AbsoluteFill>
  );
};

const Bokeh: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(26).fill(0).map((_, i) => {
        const size = 20 + random(`ks${i}`) * 90;
        const x = random(`kx${i}`) * 1080 + Math.sin(f / 60 + i) * 30;
        const y = (random(`ky${i}`) * 2200 - f * (0.4 + random(`kv${i}`))) % 2200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y < 0 ? y + 2200 : y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,220,240,0.55) 0%, rgba(255,180,220,0.08) 70%, rgba(0,0,0,0) 100%)",
              opacity: 0.5 + 0.5 * Math.sin(f / 25 + i),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- A photo card flying through 3D space ----------
type Move = "swing" | "flip" | "drop";

const PhotoCard: React.FC<{ photos: PhotoInfo[]; dur: number; side: number; move: Move; landscape?: boolean }> = ({
  photos,
  dur,
  side,
  move,
  landscape,
}) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 28], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const outP = interpolate(f, [dur - 22, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const hold = interpolate(f, [0, dur], [0, 1]);

  let x = 0;
  let y = 0;
  let z = 0;
  let ry = 0;
  let rz = 0;
  let rx = 0;
  if (move === "swing") {
    x = (1 - inP) * side * 700;
    z = (1 - inP) * -1600;
    ry = (1 - inP) * side * -55;
    rz = (1 - inP) * side * 14;
  } else if (move === "flip") {
    ry = (1 - inP) * 180 * side;
    z = (1 - inP) * -500;
  } else {
    y = (1 - inP) * -1500;
    rx = (1 - inP) * 50;
    rz = (1 - inP) * side * -20;
  }
  // gentle float while on screen
  ry += Math.sin(hold * Math.PI * 2) * 6 * side;
  rz += -2.5 * side + hold * 2 * side;
  z += hold * 160;
  // fly out past the camera
  x += outP * -side * 1300;
  z += outP * 500;
  ry += outP * side * 70;
  const opacity = Math.min(interpolate(f, [0, 8], [0, 1], clamp), 1 - outP * 0.6);

  const w = landscape ? 980 : 900;
  const h = landscape ? 735 : 1150;
  return (
    <AbsoluteFill style={{ perspective: 1700, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: w,
          height: h,
          transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
          borderRadius: 34,
          overflow: "hidden",
          opacity,
          border: "6px solid rgba(255,255,255,0.85)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
          backfaceVisibility: "hidden",
          background: "#fff",
          display: "grid",
          gridTemplateColumns: photos.length > 1 ? "1fr 1fr" : "1fr",
          gap: photos.length > 1 ? 8 : 0,
        }}
      >
        {photos.map((p, i) => (
          <div key={i} style={{ position: "relative", overflow: "hidden" }}>
            <Photo photo={p} dur={dur} from={1.12} to={1.02} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Text scenes ----------
const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [6, 26], [0, 1], clamp);
  const b = interpolate(f, [24, 48], [0, 1], clamp);
  const out = interpolate(f, [dur - 18, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: out }}>
      <div style={{ fontFamily: SANS, fontSize: 54, letterSpacing: 16, color: "#ffd9ea", opacity: a, textTransform: "uppercase" }}>
        {YEARS} years of
      </div>
      <div
        style={{
          fontFamily: SCRIPT,
          fontSize: 160,
          lineHeight: 1.15,
          color: "#fff",
          opacity: b,
          transform: `scale(${0.92 + 0.08 * b})`,
          textShadow: "0 6px 30px rgba(120,20,80,0.7)",
          padding: "0 80px",
        }}
      >
        love, laughter
        <br />& togetherness
      </div>
    </AbsoluteFill>
  );
};

const Ending: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [0, 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const text = interpolate(f, [40, 62], [0, 1], clamp);
  const out = interpolate(f, [dur - 30, dur], [1, 0], clamp);
  const w = interpolate(grow, [0, 1], [900, 1080]);
  const h = interpolate(grow, [0, 1], [1150, 1920]);
  const r = interpolate(grow, [0, 1], [34, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
      <div style={{ position: "relative", width: w, height: h, borderRadius: r, overflow: "hidden" }}>
        <Photo photo={photoAt(0)} dur={dur} from={1.1} to={1.0} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(40,10,40,0.75) 100%)", opacity: text }} />
      </div>
      <div style={{ position: "absolute", bottom: 200, left: 0, right: 0, textAlign: "center", opacity: text }}>
        <div style={{ fontFamily: SCRIPT, fontSize: 124, whiteSpace: "nowrap", color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>
          {HER} &amp; {HIM}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 58, color: "#ffd9ea", letterSpacing: 3 }}>
          {DATE_DOTS(START_YEAR)} — {DATE_DOTS(END_YEAR)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Running order (in beats; the song is ~92 BPM) ----------
const INTRO_BEATS = 8;
const CARD_BEATS = 8;
const CARDS = 9;
const OVERLAP = 22;
const MOVES: Move[] = ["swing", "swing", "flip", "swing", "drop", "flip", "swing", "swing", "flip"];

export const Template3: React.FC = () => {
  let next = 1;
  const endBeat = INTRO_BEATS + CARDS * CARD_BEATS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/t3.mp3")} />
      <Backdrop />
      <Sequence durationInFrames={T.beat(INTRO_BEATS) + 10}>
        <Intro dur={T.beat(INTRO_BEATS) + 10} />
      </Sequence>
      {new Array(CARDS).fill(0).map((_, k) => {
        const s = T.beat(INTRO_BEATS + k * CARD_BEATS) - (k === 0 ? 0 : OVERLAP);
        const e = T.beat(INTRO_BEATS + (k + 1) * CARD_BEATS);
        const collage = k === 5;
        const photos = collage ? [0, 1, 2, 3].map((j) => photoAt(next + j)) : [photoAt(next)];
        next += photos.length;
        return (
          <Sequence key={k} from={s} durationInFrames={e - s}>
            <PhotoCard photos={photos} dur={e - s} side={k % 2 ? -1 : 1} move={MOVES[k % MOVES.length]} landscape={k % 4 === 3} />
          </Sequence>
        );
      })}
      <Sequence from={T.beat(endBeat) - 10} durationInFrames={T.total - T.beat(endBeat) + 10}>
        <Ending dur={T.total - T.beat(endBeat) + 10} />
      </Sequence>
    </AbsoluteFill>
  );
};
