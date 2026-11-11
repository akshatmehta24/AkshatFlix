import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadLilita } from "@remotion/google-fonts/LilitaOne";
import { loadFont as loadShrikhand } from "@remotion/google-fonts/Shrikhand";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import timing from "../timing/t5.json";
import { DAY, END_YEAR, HER, HIM, MONTH, MONTH_INDEX, Photo, YEARS, clamp, makeTiming, photoAt, Grain } from "../shared";

const { fontFamily: BUBBLE } = loadLilita("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: RETRO } = loadShrikhand("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: COND } = loadOswald("normal", { weights: ["600"], subsets: ["latin"] });

const T = makeTiming(timing);
export const T5_DURATION = T.total;

const PINK = "#e2306f";
const MAROON = "#7a1630";
const GREEN = "#1f5a3f";
const CREAM = "#f6e7cc";
const SAALGIRAH = `${YEARS}VI SAALGIRAH`;

// ---------- Decorative pieces ----------
const Paisley: React.FC<{ x: number; y: number; s: number; r: number; color?: string }> = ({ x, y, s, r, color = PINK }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 60 C-42 60 -58 22 -44 -8 C-30 -38 4 -48 22 -72 C30 -82 44 -78 40 -64 C36 -50 22 -46 30 -30 C50 -6 46 30 28 48 C20 56 10 60 0 60 Z" fill={color} stroke={CREAM} strokeWidth="5" />
    <path d="M0 42 C-26 42 -36 18 -27 -2 C-18 -22 4 -28 16 -40 C18 -26 30 -14 30 6 C30 28 16 42 0 42 Z" fill="none" stroke="#ffd36b" strokeWidth="4" />
    <circle cx="0" cy="12" r="10" fill="#ffd36b" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <circle key={i} cx={Math.cos((i / 7) * Math.PI * 2) * 52} cy={10 + Math.sin((i / 7) * Math.PI * 2) * 58} r="4" fill={CREAM} />
    ))}
  </g>
);

const Rose: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r="34" fill="#d8344f" />
    <path d="M-20 0 A20 20 0 1 1 0 20 A14 14 0 1 1 10 -6 A7 7 0 1 1 0 4" fill="none" stroke="#8e1430" strokeWidth="4" />
    <ellipse cx="-38" cy="18" rx="18" ry="8" fill="#3f8a4e" transform="rotate(-30 -38 18)" />
    <ellipse cx="36" cy="22" rx="18" ry="8" fill="#3f8a4e" transform="rotate(30 36 22)" />
  </g>
);

const Marigolds: React.FC<{ y: number; count: number; width: number; drop?: boolean }> = ({ y, count, width, drop }) => (
  <>
    {new Array(count).fill(0).map((_, i) => {
      const x = (i + 0.5) * (width / count);
      const yy = y + (drop ? Math.sin((i / (count - 1)) * Math.PI) * 60 : 0);
      return (
        <g key={i}>
          <circle cx={x} cy={yy} r="30" fill={i % 2 ? "#f59a1b" : "#ffc928"} />
          <circle cx={x} cy={yy} r="18" fill={i % 2 ? "#e57a10" : "#f5a91b"} />
        </g>
      );
    })}
  </>
);

const PaisleyField: React.FC<{ w: number; h: number; drift: number }> = ({ w, h, drift }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
    <rect width={w} height={h} fill={CREAM} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={i % 2 ? w * 0.5 : 0} y={i * (h / 3)} width={w * 0.5} height={h / 3} fill={GREEN} />
    ))}
    {new Array(14).fill(0).map((_, i) => (
      <Paisley
        key={i}
        x={(random(`px${i}`) * w + drift) % w}
        y={random(`py${i}`) * h}
        s={0.9 + random(`ps${i}`) * 1.2}
        r={random(`pr${i}`) * 360}
        color={i % 3 === 0 ? "#f27aa0" : PINK}
      />
    ))}
    {new Array(8).fill(0).map((_, i) => (
      <Rose key={i} x={random(`rx${i}`) * w} y={random(`ry${i}`) * h} s={0.8 + random(`rs${i}`) * 0.8} />
    ))}
    <Marigolds y={18} count={Math.round(w / 60)} width={w} />
    <Marigolds y={h - 18} count={Math.round(w / 60)} width={w} />
  </svg>
);

const bubbleText = (size: number): React.CSSProperties => ({
  fontFamily: BUBBLE,
  fontSize: size,
  lineHeight: 0.92,
  color: PINK,
  WebkitTextStroke: `${size * 0.06}px #fff`,
  paintOrder: "stroke fill",
  textShadow: `0 ${size * 0.06}px 0 ${MAROON}, 0 ${size * 0.1}px ${size * 0.15}px rgba(0,0,0,0.4)`,
  textAlign: "center",
});

const retro3D = (size: number, fill: string, edge: string): React.CSSProperties => ({
  fontFamily: RETRO,
  fontSize: size,
  lineHeight: 1.05,
  color: fill,
  textAlign: "center",
  textShadow: new Array(8)
    .fill(0)
    .map((_, i) => `${i + 1}px ${i + 1}px 0 ${edge}`)
    .join(", ") + ", 0 18px 30px rgba(0,0,0,0.35)",
});

// ---------- Scene 1: retro TV, zoom into the screen ----------
const TVScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textPop = spring({ frame: f - (T.beat(1) - 0), fps, config: { damping: 9 } });
  const zoomStart = T.beat(3);
  const zoom = interpolate(f, [zoomStart, dur], [1, 3.4], { ...clamp, easing: Easing.in(Easing.cubic) });
  const full = interpolate(f, [dur - 8, dur], [0, 1], clamp);
  const staticOn = f < 6;
  return (
    <AbsoluteFill style={{ background: "#2a0d10" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 46%" }}>
        {/* curtains + table */}
        <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, #5a1a22 0px, #3d0f16 40px, #6a222b 80px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "linear-gradient(180deg, #6b3d1f, #3b2010)" }} />
        {/* antenna */}
        <svg width="1080" height="600" style={{ position: "absolute", top: 0 }}>
          <line x1="540" y1="520" x2="330" y2="120" stroke="#2a2a2a" strokeWidth="8" />
          <line x1="540" y1="520" x2="780" y2="90" stroke="#2a2a2a" strokeWidth="8" />
          <circle cx="540" cy="525" r="34" fill="#2e2e2e" />
        </svg>
        {/* cabinet */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 520,
            width: 940,
            height: 840,
            borderRadius: 50,
            background: "linear-gradient(180deg, #7a4a24, #4b2b12)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 4px 0 rgba(255,220,170,0.25)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 50,
              top: 50,
              width: 840,
              height: 620,
              borderRadius: 70,
              overflow: "hidden",
              boxShadow: "inset 0 0 60px rgba(0,0,0,0.8), 0 0 0 14px #2b1a0e",
            }}
          >
            <PaisleyField w={840} h={620} drift={f * 0.6} />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <div style={{ ...bubbleText(150), transform: `scale(${textPop}) rotate(-4deg)` }}>
                SAVE
                <br />
                THE
                <br />
                DATE
              </div>
            </AbsoluteFill>
            <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)" }} />
            <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25), rgba(0,0,0,0) 45%)" }} />
            {staticOn ? <Grain opacity={1} blend="normal" /> : null}
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: 640 + i * 90, top: 720, width: 60, height: 60, borderRadius: "50%", background: "#2b1a0e", boxShadow: "inset 0 3px 0 rgba(255,220,170,0.3)" }} />
          ))}
          <div style={{ position: "absolute", left: 80, top: 735, width: 420, height: 30, borderRadius: 8, background: "repeating-linear-gradient(90deg, #2b1a0e 0px, #2b1a0e 8px, #5e3a1c 8px, #5e3a1c 14px)" }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: CREAM, opacity: full }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 2: full-screen SAVE THE DATE ----------
const SaveTheDate: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  // Pulse the text on every beat.
  const abs = f + T.beat(CUTS.save);
  const since = Math.min(...T.beats.filter((b) => b <= abs).map((b) => abs - b), 99);
  const pulse = Math.exp(-since / 4);
  const zoomIn = interpolate(f, [0, dur], [1.15, 1]);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
      <PaisleyField w={1080} h={1920} drift={f * 1.5} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...bubbleText(300), transform: `rotate(-5deg) scale(${1 + pulse * 0.06})` }}>
          SAVE
          <br />
          THE
          <br />
          DATE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 3: ribbon heart with names ----------
const HeartScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(f, [0, 24], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const t1 = spring({ frame: f - 6, fps, config: { damping: 12 } });
  const t2 = spring({ frame: f - 12, fps, config: { damping: 12 } });
  const burst = interpolate(f, [0, 10], [0.3, 1], clamp);
  const colors = ["#1aa39a", "#2f9e44", "#d63a4a", "#e0a020", "#6b4bd6", "#e2306f"];
  const heart = "M540 1380 C 300 1220 130 1060 130 830 C 130 640 270 520 420 520 C 480 520 520 545 540 580 C 560 545 600 520 660 520 C 810 520 950 640 950 830 C 950 1060 780 1220 540 1380 C 470 1450 420 1520 470 1580 C 520 1630 600 1600 560 1530";
  return (
    <AbsoluteFill style={{ background: CREAM, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "repeating-conic-gradient(from 0deg at 50% 48%, rgba(226,48,111,0.18) 0deg 8deg, rgba(255,201,40,0.18) 8deg 16deg, rgba(26,163,154,0.14) 16deg 24deg)",
          transform: `scale(${burst * 1.6}) rotate(${f * 0.4}deg)`,
        }}
      />
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 380 + random(`br${i}`) * 260;
        const p = interpolate(f, [0, 18], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(a) * r * p - 70,
              top: 900 + Math.sin(a) * r * 1.3 * p - 70,
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: `16px solid ${colors[i % colors.length]}`,
              boxShadow: "inset 0 4px 8px rgba(255,255,255,0.6), 0 6px 12px rgba(0,0,0,0.25)",
              transform: `rotateX(${55 + i * 7}deg) rotate(${f * 2 + i * 30}deg)`,
            }}
          />
        );
      })}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <path d={heart} fill="none" stroke={MAROON} strokeWidth="18" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={draw} />
        <Rose x={150} y={420} s={1.4} />
        <Rose x={940} y={1500} s={1.6} />
        <Rose x={900} y={420} s={1.0} />
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 300 }}>
        <div style={{ ...retro3D(80, MAROON, "#e8b9a0"), transform: `scale(${t1})` }}>FOR</div>
        <div style={{ ...retro3D(118, "#f6e7cc", MAROON), transform: `scale(${t2})`, WebkitTextStroke: `3px ${MAROON}` }}>
          {HER.toUpperCase()}
          <br />
          <span style={{ fontSize: 90 }}>&amp;</span>
          <br />
          {HIM.toUpperCase()}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 4: "Ki 25vi saalgirah" with the couple photo ----------
const ArchPhoto: React.FC<{ w: number; h: number; dur: number; index: number; style?: React.CSSProperties }> = ({ w, h, dur, index, style }) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: h,
      borderRadius: `${w / 2}px ${w / 2}px 24px 24px`,
      border: `14px solid ${MAROON}`,
      boxShadow: "0 0 0 8px #e8b84a, 0 30px 60px rgba(0,0,0,0.45)",
      overflow: "hidden",
      ...style,
    }}
  >
    <Photo photo={photoAt(index)} dur={dur} from={1.12} to={1.04} filter="saturate(1.12)" />
  </div>
);

const Saalgirah: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ki = spring({ frame: f - 2, fps, config: { damping: 11 } });
  const big = spring({ frame: f - 8, fps, config: { damping: 10 } });
  const photo = spring({ frame: f - 4, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #e0b056 0%, #c48d33 45%, #8e5c1c 100%)", overflow: "hidden" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.18 }}>
        {new Array(10).fill(0).map((_, i) => (
          <circle key={i} cx="540" cy="760" r={80 + i * 90} fill="none" stroke="#fff3d0" strokeWidth="3" strokeDasharray="6 14" transform={`rotate(${f * (i % 2 ? 0.3 : -0.3)} 540 760)`} />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0 }}>
        <div style={{ ...retro3D(130, "#ffe08a", "#5a2e0c"), transform: `scale(${ki})` }}>KI</div>
        <div style={{ ...retro3D(150, "#ffe08a", "#5a2e0c"), transform: `scale(${big})` }}>
          {YEARS}VI
          <br />
          SAALGIRAH
        </div>
      </div>
      <ArchPhoto w={700} h={860} dur={dur} index={0} style={{ left: 190, top: 900, transform: `translateY(${(1 - photo) * 900}px)` }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 5: calendar with the date circled ----------
const Calendar: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame: f, fps, config: { damping: 13 } });
  const circle = interpolate(f, [10, 26], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const firstDow = new Date(END_YEAR, MONTH_INDEX, 1).getDay();
  const days = new Date(END_YEAR, MONTH_INDEX + 1, 0).getDate();
  const cells: (number | null)[] = [...new Array(firstDow).fill(null), ...new Array(days).fill(0).map((_, i) => i + 1)];
  const cw = 130;
  const ch = 120;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #e0b056 0%, #c48d33 45%, #8e5c1c 100%)" }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 380,
          width: 940,
          padding: "40px 15px 30px",
          background: "#fffaf0",
          borderRadius: 24,
          boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
          transform: `translateX(${(1 - slide) * 1200}px) rotate(${(1 - slide) * 10 - 2}deg)`,
        }}
      >
        <div style={{ position: "absolute", top: -26, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
          {new Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ width: 22, height: 56, borderRadius: 11, background: "#555", border: "4px solid #222" }} />
          ))}
        </div>
        <div style={{ fontFamily: RETRO, fontSize: 92, color: MAROON, textAlign: "center", marginBottom: 20 }}>
          {MONTH.toUpperCase()} {END_YEAR}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cw}px)`, rowGap: 6 }}>
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
            <div key={d} style={{ fontFamily: COND, fontSize: 38, textAlign: "center", color: i === 0 ? PINK : "#333" }}>
              {d}
            </div>
          ))}
          {cells.map((d, i) => (
            <div key={i} style={{ position: "relative", height: ch, fontFamily: COND, fontSize: 64, textAlign: "center", lineHeight: `${ch}px`, color: i % 7 === 0 ? PINK : "#222" }}>
              {d ?? ""}
              {d === DAY ? (
                <svg width={cw + 30} height={ch + 10} style={{ position: "absolute", left: -15, top: -5 }}>
                  <ellipse cx={(cw + 30) / 2} cy={(ch + 10) / 2} rx={(cw + 10) / 2} ry={(ch - 10) / 2} fill="none" stroke="#e01b3c" strokeWidth="8" pathLength={1} strokeDasharray="1" strokeDashoffset={circle} transform={`rotate(-8 ${(cw + 30) / 2} ${(ch + 10) / 2})`} />
                </svg>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 230, left: 0, right: 0, ...retro3D(96, "#ffe08a", "#5a2e0c"), opacity: interpolate(f, [16, 26], [0, 1], clamp) }}>
        SAVE THE DATE!
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 6: the final poster ----------
const Poster: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (k: number) => spring({ frame: f - k * 6, fps, config: { damping: 12 } });
  const out = interpolate(f, [dur - 10, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#f8ecd6", overflow: "hidden", opacity: out }}>
      <svg width="1080" height="1920" style={{ position: "absolute" }}>
        <Marigolds y={30} count={18} width={1080} />
        <Marigolds y={95} count={15} width={1080} drop />
        {[90, 990].map((x) => (
          <g key={x}>
            <line x1={x} y1={60} x2={x} y2={380} stroke="#e8a21b" strokeWidth="6" />
            {new Array(5).fill(0).map((_, i) => (
              <circle key={i} cx={x} cy={110 + i * 55} r="24" fill={i % 2 ? "#f59a1b" : "#ffc928"} />
            ))}
            <path d={`M${x - 22} 400 L${x + 22} 400 L${x + 12} 470 L${x - 12} 470 Z`} fill={PINK} />
          </g>
        ))}
        {new Array(24).fill(0).map((_, i) => {
          const tw = Math.abs(Math.sin(f / 8 + i));
          return <circle key={i} cx={random(`sx${i}`) * 1080} cy={300 + random(`sy${i}`) * 1500} r={3 + tw * 4} fill="#f2c14e" opacity={tw} />;
        })}
      </svg>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: COND, fontSize: 92, color: MAROON, letterSpacing: 4, transform: `scale(${at(0)})` }}>SAVE THE DATE</div>
        <div style={{ fontFamily: COND, fontSize: 50, color: MAROON, transform: `scale(${at(1)})` }}>— FOR —</div>
        <div style={{ ...retro3D(104, PINK, MAROON), whiteSpace: "nowrap", transform: `scale(${at(2)})` }}>
          {HER} &amp; {HIM}
        </div>
        <div style={{ ...retro3D(80, PINK, MAROON), transform: `scale(${at(3)})` }}>KI {SAALGIRAH}</div>
        <div style={{ fontFamily: COND, fontSize: 64, color: "#3a1a10", marginTop: 14, transform: `scale(${at(4)})` }}>
          {DAY} {MONTH.toUpperCase()}, {END_YEAR}
        </div>
      </div>
      <ArchPhoto w={620} h={760} dur={dur} index={1} style={{ left: 230, top: 1060, transform: `translateY(${(1 - at(5)) * 900}px)` }} />
    </AbsoluteFill>
  );
};

// ---------- Running order (in beats; the song is ~103 BPM) ----------
const CUTS = { save: 4, heart: 7, saal: 11, cal: 15, poster: 18 };

export const Template5: React.FC = () => {
  const b = T.beat;
  const scenes: [number, number, React.FC<{ dur: number }>][] = [
    [0, b(CUTS.save), TVScene],
    [b(CUTS.save), b(CUTS.heart), SaveTheDate],
    [b(CUTS.heart), b(CUTS.saal), HeartScene],
    [b(CUTS.saal), b(CUTS.cal), Saalgirah],
    [b(CUTS.cal), b(CUTS.poster), Calendar],
    [b(CUTS.poster), T.total, Poster],
  ];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/t5.mp3")} />
      {scenes.map(([s, e, C], i) => (
        <Sequence key={i} from={s} durationInFrames={e - s}>
          <C dur={e - s} />
        </Sequence>
      ))}
      <Flash cuts={scenes.slice(1).map(([s]) => s)} />
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const f = useCurrentFrame();
  let o = 0;
  for (const c of cuts) if (f >= c && f < c + 6) o = Math.max(o, interpolate(f, [c, c + 5], [0.7, 0]));
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};
