import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadParisienne } from "@remotion/google-fonts/Parisienne";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import timing from "../timing/t3.json";
import lyrics from "../lyrics/t3.json";
import { DATE_DOTS, END_YEAR, HER, HIM, Photo, PhotoInfo, START_YEAR, YEARS, clamp, makeTiming, photoAt } from "../shared";
import { ArchWindow, Diptych, DoubleExposure, Enter, LightLeaks, ShotSpec, Shots } from "../shared/fx";
import { Lyrics } from "../shared/lyrics";

const { fontFamily: SCRIPT } = loadParisienne("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: SANS } = loadMontserrat("normal", { weights: ["500"], subsets: ["latin"] });
const { fontFamily: SERIF } = loadCormorant("italic", { weights: ["500"], subsets: ["latin"] });

const T = makeTiming(timing);
export const T3_DURATION = T.total;

// ---------- Dreamy backdrop: the shot's own photo, blurred and tinted ----------
const Dreamy: React.FC<{ photo: PhotoInfo; dur: number; children?: React.ReactNode }> = ({ photo, dur, children }) => (
  <AbsoluteFill style={{ background: "#1b0f22" }}>
    <Photo photo={photo} dur={dur} from={1.35} to={1.5} filter="blur(30px) brightness(0.75) saturate(1.2)" />
    <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(190,90,200,0.5), rgba(70,25,110,0.55))", mixBlendMode: "color" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,210,235,0.14) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
    {children}
  </AbsoluteFill>
);

/** A rounded photo card floating gently in 3D. */
const FloatCard: React.FC<{ photo: PhotoInfo; dur: number; w?: number; h?: number; side?: number; filter?: string }> = ({
  photo,
  dur,
  w = 860,
  h = 1290,
  side = 1,
  filter,
}) => {
  const f = useCurrentFrame();
  const p = f / dur;
  const ry = Math.sin(p * Math.PI) * 7 * side - 3 * side;
  const rx = Math.cos(p * Math.PI) * 3;
  const z = p * 90;
  return (
    <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: w,
          height: h,
          borderRadius: 40,
          overflow: "hidden",
          border: "5px solid rgba(255,255,255,0.85)",
          boxShadow: "0 50px 100px rgba(20,0,30,0.6)",
          transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
        }}
      >
        <Photo photo={photo} dur={dur} from={1.1} to={1.02} filter={filter} />
      </div>
    </AbsoluteFill>
  );
};

const Collage: React.FC<{ photos: PhotoInfo[]; dur: number }> = ({ photos, dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 900, height: 1340, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, transform: `rotateY(${interpolate(f, [0, dur], [-6, 6])}deg)` }}>
        {photos.map((p, i) => {
          const r = interpolate(f, [i * 8, i * 8 + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ position: "relative", borderRadius: 30, overflow: "hidden", opacity: r, transform: `scale(${0.85 + 0.15 * r})`, filter: `blur(${(1 - r) * 12}px)`, border: "4px solid rgba(255,255,255,0.8)" }}>
              <Photo photo={p} dur={dur} from={1.12} to={1.04} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Bokeh: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(24).fill(0).map((_, i) => {
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
              background: "radial-gradient(circle, rgba(255,220,240,0.5) 0%, rgba(255,180,220,0.08) 70%, rgba(0,0,0,0) 100%)",
              opacity: 0.45 + 0.45 * Math.sin(f / 25 + i),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Text scenes ----------
const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [6, 30], [0, 1], clamp);
  const b = interpolate(f, [26, 56], [0, 1], clamp);
  const out = interpolate(f, [dur - 18, dur], [1, 0], clamp);
  return (
    <Dreamy photo={photoAt(19)} dur={dur}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: out }}>
        <div style={{ fontFamily: SANS, fontSize: 50, letterSpacing: 16, color: "#ffd9ea", opacity: a, textTransform: "uppercase" }}>{YEARS} years of</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 156, lineHeight: 1.15, color: "#fff", opacity: b, filter: `blur(${(1 - b) * 10}px)`, textShadow: "0 6px 30px rgba(120,20,80,0.7)", padding: "0 70px" }}>
          love, laughter
          <br />& togetherness
        </div>
      </AbsoluteFill>
    </Dreamy>
  );
};

const Ending: React.FC<{ dur: number; photo: PhotoInfo }> = ({ dur, photo }) => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [0, 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const text = interpolate(f, [44, 70], [0, 1], clamp);
  const out = interpolate(f, [dur - 36, dur], [1, 0], clamp);
  const w = interpolate(grow, [0, 1], [860, 1080]);
  const h = interpolate(grow, [0, 1], [1290, 1920]);
  const r = interpolate(grow, [0, 1], [40, 0]);
  return (
    <Dreamy photo={photo} dur={dur}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
        <div style={{ position: "relative", width: w, height: h, borderRadius: r, overflow: "hidden" }}>
          <Photo photo={photo} dur={dur} from={1.1} to={1.0} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(40,10,40,0.8) 100%)", opacity: text }} />
        </div>
        <div style={{ position: "absolute", bottom: 200, left: 0, right: 0, textAlign: "center", opacity: text, filter: `blur(${(1 - text) * 8}px)` }}>
          <div style={{ fontFamily: SCRIPT, fontSize: 124, whiteSpace: "nowrap", color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>
            {HER} &amp; {HIM}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 56, color: "#ffd9ea", letterSpacing: 3 }}>
            {DATE_DOTS(START_YEAR)} — {DATE_DOTS(END_YEAR)}
          </div>
        </div>
      </AbsoluteFill>
    </Dreamy>
  );
};

// ---------- Running order (in beats; the song is ~92 BPM, 8 beats ≈ 5.2 s) ----------
const SOFT = "saturate(1.05) contrast(1.02)";
const SHOTS: { enter: Enter; render: (d: number) => React.ReactNode }[] = [
  { enter: "blur", render: (d) => <Dreamy photo={photoAt(0)} dur={d}><FloatCard photo={photoAt(0)} dur={d} filter="sepia(0.35)" /></Dreamy> },
  { enter: "zoom", render: (d) => <DoubleExposure base={photoAt(1)} over={photoAt(13)} dur={d} /> },
  { enter: "blur", render: (d) => <Dreamy photo={photoAt(3)} dur={d}><FloatCard photo={photoAt(3)} dur={d} side={-1} filter={SOFT} /></Dreamy> },
  { enter: "iris", render: (d) => <Diptych a={photoAt(4)} b={photoAt(5)} dur={d} bg="#24122c" filter={SOFT} /> },
  { enter: "blur", render: (d) => <Dreamy photo={photoAt(6)} dur={d}><FloatCard photo={photoAt(6)} dur={d} filter={SOFT} /></Dreamy> },
  { enter: "wipe", render: (d) => <Dreamy photo={photoAt(8)} dur={d}><ArchWindow photo={photoAt(8)} dur={d} left={150} top={300} w={780} h={1250} border="rgba(255,225,240,0.9)" filter={SOFT} /></Dreamy> },
  { enter: "blur", render: (d) => <Dreamy photo={photoAt(9)} dur={d}><FloatCard photo={photoAt(9)} dur={d} side={-1} filter={SOFT} /></Dreamy> },
  { enter: "zoom", render: (d) => <Dreamy photo={photoAt(11)} dur={d}><Collage photos={[photoAt(11), photoAt(12), photoAt(14), photoAt(15)]} dur={d} /></Dreamy> },
  { enter: "blur", render: (d) => <Dreamy photo={photoAt(16)} dur={d}><FloatCard photo={photoAt(16)} dur={d} filter={SOFT} /></Dreamy> },
];
const INTRO_BEATS = 8;
const SHOT_BEATS = 8;

export const Template3: React.FC = () => {
  const endBeat = INTRO_BEATS + SHOTS.length * SHOT_BEATS;
  const shots: ShotSpec[] = SHOTS.map((s, k) => ({
    from: T.beat(INTRO_BEATS + k * SHOT_BEATS),
    to: T.beat(INTRO_BEATS + (k + 1) * SHOT_BEATS),
    enter: s.enter,
    exit: "blur",
    render: s.render,
  }));
  const endFrom = T.beat(endBeat);
  const cuts = [...shots.map((s) => s.from), endFrom];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/t3.mp3")} />
      <Sequence durationInFrames={T.beat(INTRO_BEATS) + 20}>
        <Intro dur={T.beat(INTRO_BEATS) + 20} />
      </Sequence>
      <Shots shots={shots} overlap={20} inLen={26} />
      <Sequence from={endFrom} durationInFrames={T.total - endFrom}>
        <Ending dur={T.total - endFrom} photo={photoAt(17)} />
      </Sequence>
      <Bokeh />
      <LightLeaks cuts={cuts} palette="rose" ambient={0.16} />
      <Lyrics data={lyrics} font={SERIF} italic size={72} bottom={230} glow="rgba(255,170,220,0.6)" />
    </AbsoluteFill>
  );
};
