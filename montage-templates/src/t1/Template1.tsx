import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadVibes } from "@remotion/google-fonts/GreatVibes";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadTiro } from "@remotion/google-fonts/TiroDevanagariHindi";
import timing from "../timing/t1.json";
import { DATE_DOTS, DAY, DAYS_TOGETHER, END_YEAR, HER, HIM, MONTH, PHOTO_COUNT, START_YEAR, YEARS, ordinal, photoAt } from "../shared";

const { fontFamily: SCRIPT } = loadVibes("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: SERIF } = loadCormorant("normal", { weights: ["400", "600"], subsets: ["latin"] });
const { fontFamily: SANS } = loadMontserrat("normal", { weights: ["500"], subsets: ["latin"] });
const { fontFamily: HINDI } = loadTiro("normal", { weights: ["400"], subsets: ["devanagari"] });

// Photo used by the scene currently on screen (set per scene below).
const PhotoCtx = React.createContext(photoAt(0).src);

// ---------- Timing ----------
const FPS = 30;
// Beat times + length come from tools/prepare_song.py (re-run it for a new song).
const TOTAL = Math.round(timing.duration * FPS);
const BEATS = timing.beats.map((s: number) => Math.round(s * FPS));
const PERIOD = (BEATS[BEATS.length - 1] - BEATS[0]) / (BEATS.length - 1);
const beat = (i: number) =>
  i < BEATS.length ? BEATS[i] : Math.round(BEATS[BEATS.length - 1] + (i - BEATS.length + 1) * PERIOD);

// ---------- Palette ----------
const MAROON = "#3a0b16";
const DEEP = "#1d050b";
const GOLD = "#e8c77e";
const SILVER_TEXT =
  "linear-gradient(100deg,#9c9c9c 0%,#f5f5f5 22%,#bdbdbd 40%,#ffffff 55%,#a8a8a8 75%,#e9e9e9 100%)";
const GOLD_TEXT = "linear-gradient(100deg,#b8893b 0%,#f7e2a4 30%,#d4a64f 55%,#fff1c9 75%,#b8893b 100%)";

// ---------- Small building blocks ----------
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Photo: React.FC<{
  dur: number;
  from?: number;
  to?: number;
  fx?: number;
  fy?: number;
  dx?: number;
  dy?: number;
  filter?: string;
  style?: React.CSSProperties;
}> = ({ dur, from = 1.04, to = 1.16, fx = 38, fy = 60, dx = 0, dy = 0, filter, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], clamp);
  const s = from + (to - from) * p;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <Img
        src={staticFile(React.useContext(PhotoCtx))}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${fx}% ${fy}%`,
          transform: `translate(${dx * p}px, ${dy * p}px) scale(${s})`,
          transformOrigin: `${fx}% ${fy}%`,
          filter,
        }}
      />
    </div>
  );
};

const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.18 }) => {
  const f = useCurrentFrame();
  const id = `grain-${f}`;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 37} />
        </filter>
        <rect width="540" height="960" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

const BottomScrim: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(20,3,8,0.55) 75%, rgba(20,3,8,0.85) 100%)",
    }}
  />
);

const LightLeak: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, dur], [-20, 120]);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: 0.55,
        background: `radial-gradient(circle at ${x}% 20%, rgba(255,150,60,0.75) 0%, rgba(255,90,60,0.25) 25%, rgba(0,0,0,0) 55%)`,
      }}
    />
  );
};

const Paper: React.FC = () => (
  <AbsoluteFill
    style={{ background: `radial-gradient(ellipse at 50% 35%, #5a1424 0%, ${MAROON} 45%, ${DEEP} 100%)` }}
  />
);

const Dust: React.FC<{ count?: number; color?: string }> = ({ count = 60, color = GOLD }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const speed = 0.4 + random(`s${i}`) * 1.4;
        const y = (random(`y${i}`) * 2100 - f * speed * 2) % 2100;
        const yy = y < 0 ? y + 2100 : y;
        const size = 2 + random(`z${i}`) * 6;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / (8 + random(`t${i}`) * 14) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(f / 30 + i) * 14,
              top: yy - 100,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: tw * 0.8,
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{
  kicker?: string;
  script?: string;
  hindi?: string;
  bottom?: number;
  color?: string;
}> = ({ kicker, script, hindi, bottom = 190, color = "#fff" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 3, fps, config: { damping: 16, mass: 0.7 } });
  const k = interpolate(f, [0, 10], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom,
        textAlign: "center",
        color,
        textShadow: "0 4px 24px rgba(0,0,0,0.65)",
      }}
    >
      {kicker ? (
        <div
          style={{
            fontFamily: SANS,
            fontSize: 40,
            letterSpacing: interpolate(k, [0, 1], [24, 10]),
            textTransform: "uppercase",
            opacity: k,
            color: GOLD,
            marginBottom: 10,
          }}
        >
          {kicker}
        </div>
      ) : null}
      {script ? (
        <div
          style={{
            fontFamily: SCRIPT,
            fontSize: 118,
            lineHeight: 1.1,
            opacity: s,
            transform: `translateY(${(1 - s) * 40}px)`,
          }}
        >
          {script}
        </div>
      ) : null}
      {hindi ? (
        <div
          style={{
            fontFamily: HINDI,
            fontSize: 96,
            lineHeight: 1.3,
            opacity: s,
            transform: `translateY(${(1 - s) * 40}px)`,
          }}
        >
          {hindi}
        </div>
      ) : null}
    </div>
  );
};

const Polaroid: React.FC<{
  width?: number;
  rotate?: number;
  fx?: number;
  fy?: number;
  zoom?: number;
  filter?: string;
  label?: string;
  dur: number;
  style?: React.CSSProperties;
}> = ({ width = 760, rotate = 0, fx = 38, fy = 70, zoom = 1.1, filter, label, dur, style }) => (
  <div
    style={{
      position: "absolute",
      width,
      padding: 28,
      paddingBottom: label ? 150 : 110,
      background: "#fbf7ef",
      boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
      transform: `rotate(${rotate}deg)`,
      ...style,
    }}
  >
    <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden" }}>
      <Photo dur={dur} from={zoom} to={zoom + 0.08} fx={fx} fy={fy} filter={filter} />
    </div>
    {label ? (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 30,
          textAlign: "center",
          fontFamily: SCRIPT,
          fontSize: 76,
          color: "#3a2a20",
        }}
      >
        {label}
      </div>
    ) : null}
  </div>
);

const HeartShape: React.FC<{ size: number; color: string; style?: React.CSSProperties }> = ({
  size,
  color,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path
      d="M50 88 C20 66 4 48 4 30 C4 16 15 6 28 6 C38 6 46 12 50 21 C54 12 62 6 72 6 C85 6 96 16 96 30 C96 48 80 66 50 88 Z"
      fill={color}
    />
  </svg>
);

// ---------- Scenes ----------

const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - beat(1), fps, config: { damping: 12, mass: 0.9 } });
  const shine = interpolate(f, [0, dur], [0, 200]);
  const line1 = interpolate(f, [beat(3), beat(3) + 12], [0, 1], clamp);
  const line2 = interpolate(f, [beat(5), beat(5) + 12], [0, 1], clamp);
  const ring = interpolate(f, [0, beat(2)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Paper />
      <Dust count={70} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <svg width="760" height="760" viewBox="0 0 760 760" style={{ position: "absolute", top: 420 }}>
          <circle
            cx="380"
            cy="380"
            r="350"
            fill="none"
            stroke={GOLD}
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * 350}
            strokeDashoffset={(1 - ring) * 2 * Math.PI * 350}
            opacity={0.8}
          />
          <circle cx="380" cy="380" r="330" fill="none" stroke={GOLD} strokeWidth="1" opacity={0.35 * ring} />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 430,
            width: "100%",
            textAlign: "center",
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 520,
            lineHeight: 1.4,
            backgroundImage: SILVER_TEXT,
            backgroundSize: "200% 100%",
            backgroundPosition: `${shine}% 0`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transform: `scale(${0.6 + 0.4 * pop})`,
            opacity: pop,
            filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))",
          }}
        >
          {YEARS}
        </div>
        <div
          style={{
            position: "absolute",
            top: 1240,
            width: "100%",
            textAlign: "center",
            fontFamily: SANS,
            fontSize: 46,
            letterSpacing: 16,
            color: GOLD,
            opacity: line1,
            textTransform: "uppercase",
          }}
        >
          Years of Togetherness
        </div>
        <div
          style={{
            position: "absolute",
            top: 1320,
            width: "100%",
            textAlign: "center",
            fontFamily: SCRIPT,
            fontSize: 120,
            color: "#fff",
            opacity: line2,
            transform: `translateY(${(1 - line2) * 30}px)`,
          }}
        >
          A Silver Jubilee
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Names: React.FC<{ dur: number; start: number }> = ({ dur, start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = (i: number) => beat(i) - start;
  const a = spring({ frame: f - rel(8), fps, config: { damping: 14 } });
  const amp = spring({ frame: f - rel(10), fps, config: { damping: 10 } });
  const b = spring({ frame: f - rel(11), fps, config: { damping: 14 } });
  const tag = interpolate(f, [rel(13), rel(13) + 12], [0, 1], clamp);
  const fadeIn = interpolate(f, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Photo dur={dur} from={1.25} to={1.12} filter="blur(18px) brightness(0.55) saturate(1.2)" />
      <AbsoluteFill style={{ background: "rgba(40,6,14,0.45)" }} />
      <Dust count={40} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div
          style={{
            fontFamily: SCRIPT,
            fontSize: 230,
            color: "#fff",
            opacity: a,
            transform: `translateX(${(1 - a) * -120}px)`,
            textShadow: "0 8px 40px rgba(0,0,0,0.6)",
            marginTop: -120,
          }}
        >
          {HER}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 150,
            color: GOLD,
            opacity: amp,
            transform: `scale(${0.4 + 0.6 * amp})`,
            margin: "-40px 0",
          }}
        >
          &amp;
        </div>
        <div
          style={{
            fontFamily: SCRIPT,
            fontSize: 230,
            color: "#fff",
            opacity: b,
            transform: `translateX(${(1 - b) * 120}px)`,
            textShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {HIM}
        </div>
        <div
          style={{
            marginTop: 50,
            fontFamily: SANS,
            fontSize: 42,
            letterSpacing: 12,
            color: GOLD,
            opacity: tag,
            textTransform: "uppercase",
          }}
        >
          Celebrating {YEARS} years of love
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type CardProps = { dur: number; start: number };

// 1. Vintage black & white — "where it began"
const CardVintage: React.FC<CardProps> = ({ dur }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo dur={dur} from={1.18} to={1.04} filter="grayscale(1) contrast(1.15) brightness(0.95)" />
    <Grain opacity={0.28} />
    <Vignette strength={0.85} />
    <BottomScrim />
    <Caption kicker={`${DAY} ${MONTH} ${START_YEAR}`} script="Where it all began" />
  </AbsoluteFill>
);

// 2. Sepia polaroid dropping onto the table
const CardPolaroid: React.FC<CardProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 13, mass: 0.8 } });
  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Polaroid
          dur={dur}
          rotate={interpolate(s, [0, 1], [-16, -4])}
          filter="sepia(0.75) contrast(1.05) brightness(1.02)"
          label="Ek vaada, saath phere"
          style={{ transform: `translateY(${(1 - s) * -700}px) rotate(${interpolate(s, [0, 1], [-16, -4])}deg)`, top: 260 }}
        />
      </AbsoluteFill>
      <Caption kicker="The promise" bottom={150} />
      <Grain opacity={0.12} />
    </AbsoluteFill>
  );
};

// 3. Heart-shaped window
const CardHeart: React.FC<CardProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 11 } });
  return (
    <AbsoluteFill>
      <Photo dur={dur} filter="blur(22px) brightness(0.5)" from={1.3} to={1.3} />
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="heartClip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.88 C0.2,0.66 0.04,0.48 0.04,0.3 C0.04,0.16 0.15,0.06 0.28,0.06 C0.38,0.06 0.46,0.12 0.5,0.21 C0.54,0.12 0.62,0.06 0.72,0.06 C0.85,0.06 0.96,0.16 0.96,0.3 C0.96,0.48 0.8,0.66 0.5,0.88 Z" />
          </clipPath>
        </defs>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 300,
          width: 900,
          height: 900,
          transform: `scale(${s})`,
          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
        }}
      >
        <div style={{ position: "absolute", inset: 0, clipPath: "url(#heartClip)" }}>
          <Photo dur={dur} from={1.3} to={1.42} fx={40} fy={74} filter="saturate(1.15) brightness(1.05)" />
        </div>
      </div>
      <Caption kicker="Two hearts" script="One journey" bottom={230} />
    </AbsoluteFill>
  );
};

// 4. Full colour punch-in on the faces
const CardPunch: React.FC<CardProps> = ({ dur }) => (
  <AbsoluteFill>
    <Photo dur={dur} from={1.0} to={1.9} fx={36} fy={50} filter="saturate(1.15) contrast(1.05)" />
    <LightLeak dur={dur} />
    <BottomScrim />
    <Caption hindi="हर पल साथ" kicker="Every moment, together" bottom={170} />
  </AbsoluteFill>
);

// 5. Three-panel triptych
const CardTriptych: React.FC<CardProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const panels = [
    { fx: 20, filter: "grayscale(1) contrast(1.1)", dir: -1, z: 1.6 },
    { fx: 40, filter: "sepia(0.6)", dir: 1, z: 1.9 },
    { fx: 55, filter: "saturate(1.2)", dir: -1, z: 1.6 },
  ];
  return (
    <AbsoluteFill style={{ background: DEEP }}>
      {panels.map((p, i) => {
        const t = interpolate(f, [i * 5, i * 5 + 14], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 24 + i * 352,
              top: 120,
              width: 336,
              height: 1380,
              overflow: "hidden",
              transform: `translateY(${t * p.dir * 1500}px)`,
              border: `2px solid ${GOLD}55`,
            }}
          >
            <Photo dur={dur} from={p.z} to={p.z + 0.12} fx={p.fx} fy={56} filter={p.filter} />
          </div>
        );
      })}
      <Caption kicker="Through every season" script="Hasi, khushi, pyaar" bottom={110} />
    </AbsoluteFill>
  );
};

// 6. Film strip scrolling upward
const CardFilm: React.FC<CardProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, dur], [0, -900]);
  const frames = [
    { fx: 38, fy: 55, z: 1.5, filter: "sepia(0.5)" },
    { fx: 30, fy: 48, z: 2.2, filter: "grayscale(1)" },
    { fx: 50, fy: 60, z: 1.8, filter: "saturate(1.1)" },
    { fx: 38, fy: 70, z: 1.2, filter: "sepia(0.3)" },
    { fx: 45, fy: 45, z: 2.4, filter: "grayscale(0.6)" },
  ];
  return (
    <AbsoluteFill style={{ background: "#0d0d0d" }}>
      <div
        style={{
          position: "absolute",
          left: 170,
          width: 740,
          top: 140,
          transform: `translateY(${y}px) rotate(-3deg)`,
          background: "#141414",
          padding: "0 70px",
        }}
      >
        {frames.map((fr, i) => (
          <div key={i} style={{ position: "relative", height: 520, margin: "24px 0", overflow: "hidden" }}>
            <Photo dur={dur} from={fr.z} to={fr.z} fx={fr.fx} fy={fr.fy} filter={fr.filter} />
          </div>
        ))}
        {[0, 1].map((side) => (
          <div
            key={side}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              [side ? "right" : "left"]: 18,
              width: 34,
              backgroundImage:
                "repeating-linear-gradient(180deg, #e9e2d0 0px, #e9e2d0 28px, transparent 28px, transparent 56px)",
              opacity: 0.85,
              borderRadius: 4,
            }}
          />
        ))}
      </div>
      <Grain opacity={0.2} />
      <Vignette />
      <BottomScrim />
      <Caption kicker="Frame by frame" script="Every little moment" bottom={150} />
    </AbsoluteFill>
  );
};

// 7. Circle frame with a gold ring
const CardCircle: React.FC<CardProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 14 } });
  const rot = interpolate(f, [0, dur], [0, 40]);
  return (
    <AbsoluteFill>
      <Paper />
      <Dust count={35} />
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 330,
          width: 800,
          height: 800,
          borderRadius: "50%",
          overflow: "hidden",
          transform: `scale(${s})`,
          boxShadow: `0 0 0 10px ${GOLD}, 0 0 0 26px rgba(232,199,126,0.25), 0 30px 80px rgba(0,0,0,0.6)`,
        }}
      >
        <Photo dur={dur} from={1.2} to={1.35} fx={40} fy={70} filter="saturate(1.1)" />
      </div>
      <svg
        width="920"
        height="920"
        viewBox="0 0 920 920"
        style={{ position: "absolute", left: 80, top: 270, transform: `rotate(${rot}deg)` }}
      >
        <circle cx="460" cy="460" r="448" fill="none" stroke={GOLD} strokeWidth="3" strokeDasharray="4 18" />
      </svg>
      <Caption kicker="A home built with" script="Love & laughter" bottom={210} />
    </AbsoluteFill>
  );
};

// 8. Stack of polaroids landing on the beat
const CardStack: React.FC<CardProps> = ({ dur, start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const firstBeat = BEATS.findIndex((b) => b >= start);
  const items = [
    { rot: -10, x: 90, y: 200, filter: "grayscale(1)", fx: 30, fy: 50, z: 1.6 },
    { rot: 8, x: 230, y: 330, filter: "sepia(0.7)", fx: 50, fy: 62, z: 1.4 },
    { rot: -3, x: 150, y: 460, filter: "saturate(1.1)", fx: 38, fy: 60, z: 1.1 },
  ];
  return (
    <AbsoluteFill>
      <Paper />
      {items.map((it, i) => {
        const at = beat(firstBeat + i) - start;
        const s = spring({ frame: f - at, fps, config: { damping: 14, mass: 0.7 } });
        return (
          <Polaroid
            key={i}
            dur={dur}
            width={700}
            fx={it.fx}
            fy={it.fy}
            zoom={it.z}
            filter={it.filter}
            style={{
              left: it.x,
              top: it.y,
              opacity: s > 0.01 ? 1 : 0,
              transform: `translateY(${(1 - s) * 1400}px) rotate(${it.rot * s}deg) scale(${1.2 - 0.2 * s})`,
            }}
          />
        );
      })}
      <Caption kicker="Memories we made" bottom={130} />
    </AbsoluteFill>
  );
};

// 9. Warm full-bleed with light leak
const CardWarm: React.FC<CardProps> = ({ dur }) => (
  <AbsoluteFill>
    <Photo dur={dur} from={1.15} to={1.0} dx={-30} filter="sepia(0.25) saturate(1.25) brightness(1.05)" />
    <LightLeak dur={dur} />
    <BottomScrim />
    <Caption kicker={`${YEARS} years later`} script="Still choosing each other" bottom={170} />
  </AbsoluteFill>
);

// 10. Black & white to colour wipe, Hindi line
const CardWipe: React.FC<CardProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [6, dur - 16], [100, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Photo dur={dur} from={1.1} to={1.2} filter="grayscale(1) contrast(1.1)" />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${w}%)` }}>
        <Photo dur={dur} from={1.1} to={1.2} filter="saturate(1.2)" />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${w}%`,
          width: 6,
          background: GOLD,
          boxShadow: `0 0 30px ${GOLD}`,
          opacity: w > 0.5 && w < 99.5 ? 1 : 0,
        }}
      />
      <BottomScrim />
      <Caption kicker="Then & now" hindi="पच्चीस साल का साथ" bottom={170} />
    </AbsoluteFill>
  );
};

// 11. 2x2 grid popping in on the beat
const CardGrid: React.FC<CardProps> = ({ dur, start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const firstBeat = BEATS.findIndex((b) => b >= start);
  const tiles = [
    { fx: 30, fy: 48, z: 2.0, filter: "grayscale(1)" },
    { fx: 50, fy: 52, z: 2.0, filter: "sepia(0.6)" },
    { fx: 38, fy: 75, z: 1.6, filter: "saturate(1.2)" },
    { fx: 40, fy: 58, z: 1.2, filter: "contrast(1.05) saturate(1.1)" },
  ];
  return (
    <AbsoluteFill style={{ background: DEEP }}>
      {tiles.map((t, i) => {
        const at = i === 0 ? 0 : beat(firstBeat + i - 1) - start;
        const s = spring({ frame: f - at, fps, config: { damping: 12 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 40 + (i % 2) * 510,
              top: 130 + Math.floor(i / 2) * 700,
              width: 490,
              height: 680,
              overflow: "hidden",
              transform: `scale(${s})`,
              border: `3px solid ${GOLD}`,
            }}
          >
            <Photo dur={dur} from={t.z} to={t.z + 0.1} fx={t.fx} fy={t.fy} filter={t.filter} />
          </div>
        );
      })}
      <Caption kicker="Partners in" script="Everything" bottom={90} />
    </AbsoluteFill>
  );
};

// 12. Extreme close-up pulling out
const CardPullOut: React.FC<CardProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 30, mass: 1.6 }, durationInFrames: dur });
  return (
    <AbsoluteFill>
      <Photo dur={dur} from={2.6 - 1.55 * s} to={2.6 - 1.55 * s} fx={36} fy={49} filter="saturate(1.15)" />
      <BottomScrim />
      <Caption kicker="Through every up & down" script="Hand in hand" bottom={170} />
    </AbsoluteFill>
  );
};

// 13. Gold frame zoom-out
const CardFramed: React.FC<CardProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const inset = interpolate(f, [0, 18], [0, 50], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: MAROON }}>
      <div style={{ position: "absolute", inset, overflow: "hidden", boxShadow: `0 0 0 4px ${GOLD}` }}>
        <Photo dur={dur} from={1.1} to={1.0} filter="saturate(1.1)" />
        <BottomScrim />
      </div>
      <div style={{ position: "absolute", inset: inset + 22, border: `1.5px solid ${GOLD}aa` }} />
      <Caption kicker="Today, tomorrow" script="Forever & always" bottom={200} />
    </AbsoluteFill>
  );
};

const Timeline: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [4, dur - 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const year = Math.round(START_YEAR + YEARS * p);
  const days = Math.round(DAYS_TOGETHER * p);
  const done = interpolate(f, [dur - 30, dur - 18], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Photo dur={dur} from={1.2} to={1.3} filter="blur(20px) brightness(0.4) saturate(1.2)" />
      <AbsoluteFill style={{ background: "rgba(40,6,14,0.5)" }} />
      <Dust count={50} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 44, letterSpacing: 14, color: GOLD, marginBottom: 10 }}>
          FROM {START_YEAR} TO
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 300,
            lineHeight: 1.1,
            backgroundImage: done > 0 ? GOLD_TEXT : SILVER_TEXT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transform: `scale(${1 + 0.08 * done})`,
          }}
        >
          {year}
        </div>
        <div style={{ position: "relative", width: 800, height: 6, background: "rgba(255,255,255,0.2)", marginTop: 40 }}>
          <div style={{ width: `${p * 100}%`, height: "100%", background: GOLD, boxShadow: `0 0 20px ${GOLD}` }} />
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 72, color: "#fff", marginTop: 50 }}>
          {days.toLocaleString("en-IN")} days
        </div>
        <div style={{ fontFamily: SCRIPT, fontSize: 110, color: "#fff", opacity: done, marginTop: 10 }}>
          of togetherness
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Finale: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arch = spring({ frame: f, fps, config: { damping: 16 } });
  const t1 = spring({ frame: f - 14, fps, config: { damping: 14 } });
  const t2 = spring({ frame: f - 30, fps, config: { damping: 14 } });
  const t3 = interpolate(f, [48, 62], [0, 1], clamp);
  const endFade = interpolate(f, [dur - 24, dur], [1, 0], clamp);
  const shine = interpolate(f, [0, dur], [0, 200]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: endFade }}>
        <Paper />
        <div
          style={{
            position: "absolute",
            left: 230,
            top: 130,
            width: 620,
            height: 860,
            borderRadius: "310px 310px 18px 18px",
            overflow: "hidden",
            transform: `translateY(${(1 - arch) * 80}px)`,
            opacity: arch,
            boxShadow: `0 0 0 8px ${GOLD}, 0 0 0 22px rgba(232,199,126,0.22), 0 40px 90px rgba(0,0,0,0.6)`,
          }}
        >
          <Photo dur={dur} from={1.25} to={1.12} fx={40} fy={72} filter="saturate(1.12)" />
        </div>
        {/* falling hearts */}
        {new Array(22).fill(0).map((_, i) => {
          const x = random(`hx${i}`) * 1000;
          const sp = 3 + random(`hs${i}`) * 4;
          const y = -120 + ((f * sp + random(`hy${i}`) * 2100) % 2100);
          const size = 26 + random(`hz${i}`) * 34;
          return (
            <HeartShape
              key={i}
              size={size}
              color={i % 3 === 0 ? "#f2b8c6" : GOLD}
              style={{
                position: "absolute",
                left: x + Math.sin((f + i * 20) / 18) * 30,
                top: y,
                opacity: 0.75,
                transform: `rotate(${Math.sin((f + i * 10) / 15) * 25}deg)`,
              }}
            />
          );
        })}
        <div style={{ position: "absolute", top: 1050, width: "100%", textAlign: "center" }}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 46,
              letterSpacing: 14,
              color: GOLD,
              opacity: t1,
              textTransform: "uppercase",
            }}
          >
            Happy {ordinal(YEARS)} Anniversary
          </div>
          <div
            style={{
              fontFamily: SCRIPT,
              fontSize: 168,
              lineHeight: 1.25,
              marginTop: 10,
              backgroundImage: GOLD_TEXT,
              backgroundSize: "200% 100%",
              backgroundPosition: `${shine}% 0`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: t2,
              transform: `scale(${0.85 + 0.15 * t2})`,
              filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.5))",
            }}
          >
            {HER} &amp; {HIM}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 60, color: "#fff", opacity: t3, marginTop: 20, letterSpacing: 4 }}>
            {DATE_DOTS(START_YEAR)} &nbsp;—&nbsp; {DATE_DOTS(END_YEAR)}
          </div>
          <div style={{ fontFamily: SCRIPT, fontSize: 84, color: "#f7e2a4", opacity: t3, marginTop: 30 }}>
            Forever to go
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Timeline of the whole video ----------
const CARDS = [
  CardVintage,
  CardPolaroid,
  CardHeart,
  CardPunch,
  CardTriptych,
  CardFilm,
  CardCircle,
  CardStack,
  CardWarm,
  CardWipe,
  CardGrid,
  CardPullOut,
  CardFramed,
];
const MONTAGE_START_BEAT = 15;
const BEATS_PER_CARD = 4;
const TIMELINE_START = beat(MONTAGE_START_BEAT + CARDS.length * BEATS_PER_CARD); // beat 67
const FINALE_START = Math.min(beat(75), TOTAL - 9 * FPS);

const FlashOnCuts: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const f = useCurrentFrame();
  let o = 0;
  for (const c of cuts) {
    if (f >= c && f < c + 8) o = Math.max(o, interpolate(f, [c, c + 7], [0.55, 0]));
  }
  return <AbsoluteFill style={{ background: "#fff8ea", opacity: o, pointerEvents: "none" }} />;
};

export const Template1: React.FC = () => {
  const namesStart = beat(7);
  const montageStart = beat(MONTAGE_START_BEAT);
  const cardStarts = CARDS.map((_, i) => beat(MONTAGE_START_BEAT + i * BEATS_PER_CARD));
  const cuts = [montageStart, ...cardStarts.slice(1), TIMELINE_START, FINALE_START];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/t1.mp3")} />
      <Sequence durationInFrames={namesStart + 6}>
        <Intro dur={namesStart + 6} />
      </Sequence>
      <Sequence from={namesStart} durationInFrames={montageStart - namesStart}>
        <PhotoCtx.Provider value={photoAt(0).src}>
          <Names dur={montageStart - namesStart} start={namesStart} />
        </PhotoCtx.Provider>
      </Sequence>
      {CARDS.map((C, i) => {
        const s = cardStarts[i];
        const e = i + 1 < CARDS.length ? cardStarts[i + 1] : TIMELINE_START;
        return (
          <Sequence key={i} from={s} durationInFrames={e - s}>
            <PhotoCtx.Provider value={photoAt(i).src}>
              <C dur={e - s} start={s} />
            </PhotoCtx.Provider>
          </Sequence>
        );
      })}
      <Sequence from={TIMELINE_START} durationInFrames={FINALE_START - TIMELINE_START}>
        <PhotoCtx.Provider value={photoAt(0).src}>
          <Timeline dur={FINALE_START - TIMELINE_START} />
        </PhotoCtx.Provider>
      </Sequence>
      <Sequence from={FINALE_START} durationInFrames={TOTAL - FINALE_START}>
        <PhotoCtx.Provider value={photoAt(PHOTO_COUNT - 1).src}>
          <Finale dur={TOTAL - FINALE_START} />
        </PhotoCtx.Provider>
      </Sequence>
      <FlashOnCuts cuts={cuts} />
    </AbsoluteFill>
  );
};

export const T1_DURATION = TOTAL;
