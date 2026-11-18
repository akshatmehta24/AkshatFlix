// Style 2 — reference-driven look: pure black, large clean mono type, full-bleed hairlines,
// typewriter terminals, orange accent bars/blocks, glowing blue voice line, white cards, ASCII dither.
import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import logo from './logo.json';
import {clamp, eio, eo, hash, lerp, noise1, prog} from './theme';

export const K = {
  bg: '#000000',
  w: '#F2F2F2',
  g1: 'rgba(242,242,242,0.62)',
  g2: 'rgba(242,242,242,0.32)',
  g3: 'rgba(242,242,242,0.14)',
  line: 'rgba(242,242,242,0.85)',
  orange: '#FF6A1F',
  green: '#9BE15D',
  blue: '#3D8BFF',
  blueSoft: '#9CC4FF',
  red: '#E5484D',
};
export const MONO = 'JBMono, monospace';
export const SANS = '"Liberation Sans", Arial, sans-serif';

export const Watermark: React.FC<{text?: string; dark?: boolean}> = ({text = 'Harcorp Industries', dark}) => (
  <div style={{position: 'absolute', left: 64, top: 52, fontFamily: SANS, fontSize: 18, color: dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)', letterSpacing: '0.01em'}}>{text}</div>
);

export const T: React.FC<{x: number; y: number; size?: number; color?: string; children: React.ReactNode; align?: 'left' | 'center' | 'right'; font?: string; weight?: number; style?: React.CSSProperties; lh?: number}> = ({
  x,
  y,
  size = 32,
  color = K.w,
  children,
  align = 'left',
  font = MONO,
  weight = 400,
  style,
  lh = 1.15,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: align === 'center' ? 'translateX(-50%)' : align === 'right' ? 'translateX(-100%)' : undefined,
      fontFamily: font,
      fontSize: size,
      color,
      fontWeight: weight,
      lineHeight: lh,
      whiteSpace: 'pre',
      ...style,
    }}
  >
    {children}
  </div>
);

// typewriter with block cursor
export const Type: React.FC<{
  text: string | {t: string; c?: string}[];
  start: number;
  cps?: number; // chars per frame
  x: number;
  y: number;
  size?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  cursor?: boolean | 'end';
  out?: number;
  font?: string;
  lh?: number;
}> = ({text, start, cps = 0.9, x, y, size = 32, color = K.w, align = 'left', cursor = true, out = 1e9, font = MONO, lh}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const parts = typeof text === 'string' ? [{t: text, c: color}] : text;
  const total = parts.reduce((a, p) => a + p.t.length, 0);
  let n = Math.floor((f - start) * cps);
  if (f >= out) n = Math.max(0, total - Math.floor((f - out) * cps * 2.2));
  n = Math.min(n, total);
  if (f >= out && n <= 0) return null;
  const done = n >= total;
  let left = n;
  const spans = parts.map((p, i) => {
    const s = p.t.slice(0, Math.max(0, left));
    left -= p.t.length;
    return (
      <span key={i} style={{color: p.c ?? color}}>
        {s}
      </span>
    );
  });
  const showCursor = cursor === true ? !done || Math.floor(f / 12) % 2 === 0 : cursor === 'end' ? !done : false;
  return (
    <T x={x} y={y} size={size} color={color} align={align} font={font} lh={lh}>
      {spans}
      {showCursor && <span style={{display: 'inline-block', width: size * 0.55, height: size * 1.05, background: K.w, verticalAlign: 'text-bottom', marginLeft: 2}} />}
    </T>
  );
};

// full-bleed hairline that draws from an origin point
export const HLine: React.FC<{y: number; t: number; from?: number; x0?: number; x1?: number; color?: string; w?: number}> = ({y, t, from = 960, x0 = -20, x1 = 1940, color = K.line, w = 2}) => {
  const a = lerp(from, x0, eio(t));
  const b = lerp(from, x1, eio(t));
  if (t <= 0) return null;
  return <div style={{position: 'absolute', left: a, top: y - w / 2, width: b - a, height: w, background: color}} />;
};
export const VLine: React.FC<{x: number; t: number; from?: number; y0?: number; y1?: number; color?: string; w?: number}> = ({x, t, from = 540, y0 = -20, y1 = 1100, color = K.line, w = 2}) => {
  const a = lerp(from, y0, eio(t));
  const b = lerp(from, y1, eio(t));
  if (t <= 0) return null;
  return <div style={{position: 'absolute', top: a, left: x - w / 2, height: b - a, width: w, background: color}} />;
};
export const BoxLine: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string; sw?: number; fill?: string}> = ({x, y, w, h, t, color = K.line, sw = 2, fill = K.bg}) => {
  if (t <= 0) return null;
  const per = 2 * (w + h);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <rect x={x} y={y} width={w} height={h} fill={fill} opacity={clamp(t * 2)} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={`${per * eio(t)} ${per}`} />
    </svg>
  );
};

// glowing voice line (blue) — level fn drives amplitude; history scrolls left
export const GlowWave: React.FC<{x0: number; x1: number; y: number; level: (f: number) => number; amp?: number; t?: number; color?: string; split?: number}> = ({
  x0,
  x1,
  y,
  level,
  amp = 120,
  t = 1,
  color = K.blue,
}) => {
  const f = useCurrentFrame();
  const n = 220;
  const pts: string[] = [];
  const xe = lerp(x0, x1, eio(t));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = lerp(x0, xe, u);
    // env: older samples to the left
    const lv = level(f - (1 - u) * 26);
    const taper = Math.sin(Math.PI * clamp(u * 1.05)) ** 0.6;
    const v = Math.sin(u * 64 - f * 0.9) * 0.6 + Math.sin(u * 23 + f * 0.37) * 0.4;
    const yy = y + v * amp * lv * taper * (0.6 + 0.4 * noise1(u * 12 + f * 0.2, 3));
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${yy.toFixed(1)}`);
  }
  const d = pts.join('');
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <filter id="gw" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth={10} opacity={0.55} filter="url(#gw)" />
      <path d={d} fill="none" stroke={color} strokeWidth={3} opacity={0.95} />
      <path d={d} fill="none" stroke="#E8F1FF" strokeWidth={1.2} opacity={0.9} />
    </svg>
  );
};

// spinner ring of white dashes (reference: loader)
export const DashRing: React.FC<{cx: number; cy: number; r: number; t: number; n?: number; color?: string; spin?: number; len?: number; sw?: number}> = ({cx, cy, r, t, n = 8, color = K.w, spin = 4, len = 0.32, sw = 14}) => {
  const f = useCurrentFrame();
  if (t <= 0) return null;
  const segs: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 360 + f * spin;
    const L = (360 / n) * len * eo(clamp(t * 1.4 - i * 0.05));
    const r0 = ((a0 - L / 2) * Math.PI) / 180;
    const r1 = ((a0 + L / 2) * Math.PI) / 180;
    segs.push(
      <path
        key={i}
        d={`M${cx + Math.cos(r0) * r} ${cy + Math.sin(r0) * r}A${r} ${r} 0 0 1 ${cx + Math.cos(r1) * r} ${cy + Math.sin(r1) * r}`}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />,
    );
  }
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {segs}
    </svg>
  );
};

// glowing ring (reference: "connected.")
export const GlowRing: React.FC<{cx: number; cy: number; r: number; t: number; pulse?: number; color?: string}> = ({cx, cy, r, t, pulse = 0, color = K.blue}) => {
  if (t <= 0) return null;
  const rr = r * (0.6 + 0.4 * eo(t)) * (1 + 0.04 * pulse);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: clamp(t * 1.5)}}>
      <defs>
        <filter id="gr" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <radialGradient id="grf">
          <stop offset="0.8" stopColor="#000" />
          <stop offset="1" stopColor="#081631" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={rr} fill="none" stroke={color} strokeWidth={34 + 16 * pulse} opacity={0.75} filter="url(#gr)" />
      <circle cx={cx} cy={cy} r={rr} fill="url(#grf)" stroke={color} strokeWidth={10 + 6 * pulse} />
      <circle cx={cx} cy={cy} r={rr - 7} fill="none" stroke="#CFE2FF" strokeWidth={1.5} opacity={0.8} />
    </svg>
  );
};

// fan of curves from an origin to targets (reference: voice splitting into tasks/files)
export type FanTarget = {x: number; y: number; label: string; sub?: string; at: number; hot?: boolean};
export const Fan: React.FC<{ox: number; oy: number; targets: FanTarget[]; out?: number}> = ({ox, oy, targets, out = 1e9}) => {
  const f = useCurrentFrame();
  const to = eio(prog(f, out, 12));
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - to}}>
        {targets.map((tg, i) => {
          const t = eio(prog(f, tg.at, 16));
          if (t <= 0) return null;
          const c1x = ox + (tg.x - ox) * 0.45;
          const d = `M${ox} ${oy}C${c1x} ${oy},${c1x} ${tg.y},${tg.x} ${tg.y}`;
          const L = 2000;
          const dotT = clamp((f - tg.at - 16) / 30) % 1;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={tg.hot ? K.w : K.g2} strokeWidth={tg.hot ? 2 : 1.5} strokeDasharray={`${L * t} ${L}`} />
              {t >= 1 && <circle cx={tg.x} cy={tg.y} r={4} fill={tg.hot ? K.w : K.g1} />}
              {tg.hot && t >= 1 && <path d={d} fill="none" stroke={K.blue} strokeWidth={3} strokeDasharray={`40 ${L}`} strokeDashoffset={-dotT * 1200} opacity={0.9} />}
            </g>
          );
        })}
      </svg>
      {targets.map((tg, i) => {
        const t = eo(prog(f, tg.at + 10, 10));
        if (t <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: tg.x + 18, top: tg.y - 20, opacity: t * (1 - to), display: 'flex', gap: 14, alignItems: 'center'}}>
            <FileIcon hot={tg.hot} />
            <div>
              <div style={{fontFamily: SANS, fontSize: 24, color: tg.hot ? K.w : K.g1}}>{tg.label}</div>
              {tg.sub && <div style={{fontFamily: SANS, fontSize: 14, color: K.g2, marginTop: 4}}>{tg.sub}</div>}
            </div>
          </div>
        );
      })}
    </>
  );
};
export const FileIcon: React.FC<{hot?: boolean}> = ({hot}) => (
  <svg width={26} height={30} viewBox="0 0 26 30">
    <path d="M2 2h14l8 8v18H2z" fill="none" stroke={hot ? K.w : K.g1} strokeWidth={2} />
    <path d="M16 2v8h8" fill="none" stroke={hot ? K.w : K.g1} strokeWidth={2} />
    <path d="M7 17l-3 3 3 3M19 17l3 3-3 3" fill="none" stroke={hot ? K.w : K.g2} strokeWidth={1.6} />
  </svg>
);

// grayscale procedural seascape (stands in for photographic plates)
export const Sea: React.FC<{opacity?: number; drift?: number}> = ({opacity = 1, drift = 0}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const W = c.width;
    const H = c.height;
    const hz = H * 0.6;
    const g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, '#2b2b2b');
    g.addColorStop(0.55, '#6a6a6a');
    g.addColorStop(1, '#a9a9a9');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, hz);
    // soft clouds
    for (let i = 0; i < 40; i++) {
      const x = ((hash(i) * W * 1.4 + f * 0.25 + drift) % (W * 1.4)) - W * 0.2;
      const y = hash(i + 9) * hz * 0.7;
      const r = 80 + hash(i + 3) * 220;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `rgba(200,200,200,${0.05 + hash(i + 7) * 0.06})`);
      rg.addColorStop(1, 'rgba(200,200,200,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.8, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const sg = ctx.createLinearGradient(0, hz, 0, H);
    sg.addColorStop(0, '#5a5a5a');
    sg.addColorStop(1, '#141414');
    ctx.fillStyle = sg;
    ctx.fillRect(0, hz, W, H - hz);
    // wave streaks
    for (let r = 0; r < 140; r++) {
      const p = r / 140;
      const y = hz + Math.pow(p, 1.8) * (H - hz);
      const th = 0.6 + p * 3.5;
      for (let k = 0; k < 10 + p * 18; k++) {
        const x = ((hash(r * 31 + k) * W + f * (0.4 + p * 1.6)) % (W + 200)) - 100;
        const len = 20 + hash(r * 7 + k) * (80 + p * 260);
        ctx.fillStyle = `rgba(${hash(k + r) > 0.5 ? '210,210,210' : '20,20,20'},${0.08 + p * 0.12})`;
        ctx.fillRect(x, y, len, th);
      }
    }
    // horizon haze
    const hg = ctx.createLinearGradient(0, hz - 30, 0, hz + 30);
    hg.addColorStop(0, 'rgba(180,180,180,0)');
    hg.addColorStop(0.5, 'rgba(180,180,180,0.35)');
    hg.addColorStop(1, 'rgba(180,180,180,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, hz - 30, W, 60);
  }, [f, drift]);
  return <canvas ref={ref} width={960} height={540} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, opacity, filter: 'blur(0.6px)'}} />;
};

// ASCII/dither rendering of the Harcorp mark (or any mask) on canvas
let markMask: Float32Array | null = null;
const MC = 96;
const MR = 96;
const buildMarkMask = () => {
  if (markMask) return markMask;
  const c = document.createElement('canvas');
  c.width = MC * 4;
  c.height = MR * 4;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  const s = (MC * 4) / 900;
  ctx.setTransform(s, 0, 0, s, -47 * s, -0 * s);
  const m = logo.mark as Record<string, string>;
  [...Object.values(m), logo.ring].forEach((d) => ctx.fill(new Path2D(d)));
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const out = new Float32Array(MC * MR);
  for (let r = 0; r < MR; r++)
    for (let q = 0; q < MC; q++) {
      let a = 0;
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) a += data[((r * 4 + y) * c.width + q * 4 + x) * 4 + 3];
      out[r * MC + q] = a / (16 * 255);
    }
  markMask = out;
  return out;
};
const ASC = ' .:-=+*#%@';
export const AsciiMark: React.FC<{cx: number; cy: number; size: number; t: number; solid?: number}> = ({cx, cy, size, t, solid = 0}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const h = delayRender('ascii');
    document.fonts.load('12px JBMono').then(() => {
      const c = ref.current;
      if (!c) return continueRender(h);
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, c.width, c.height);
      const mask = buildMarkMask();
      const cell = c.width / MC;
      ctx.font = `${cell * 1.25}px JBMono`;
      ctx.textBaseline = 'top';
      ctx.fillStyle = K.w;
      for (let r = 0; r < MR; r++)
        for (let q = 0; q < MC; q++) {
          const m = mask[r * MC + q];
          const d = Math.hypot(q - MC / 2, r - MR / 2) / (MC / 2);
          const appear = clamp((t * 1.6 - d * 0.6) * 3);
          if (appear <= 0) continue;
          let v = m * appear;
          if (m < 0.05) v = hash(r * MC + q + Math.floor(f / 2)) < 0.03 * (1 - t) ? 0.4 : 0;
          if (v <= 0.02) continue;
          const gi = Math.min(ASC.length - 1, Math.floor(v * (ASC.length - 1) * (0.7 + 0.3 * hash(q * 3 + r + Math.floor(f / 3)))) + 1);
          ctx.globalAlpha = 1 - solid;
          ctx.fillText(ASC[gi], q * cell, r * cell);
        }
      continueRender(h);
    });
  }, [f, t, solid]);
  return <canvas ref={ref} width={size} height={size} style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size}} />;
};

// digits matrix (reference)
export const Digits: React.FC<{x: number; y: number; cols: number; rows: number; size?: number; t: number; seed?: number; boxed?: boolean}> = ({x, y, cols, rows, size = 30, t, seed = 1, boxed = true}) => {
  const f = useCurrentFrame();
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    let s = '';
    for (let c = 0; c < cols; c++) {
      const on = hash(seed + r * 13 + c) < t * 1.2;
      s += on ? String(Math.floor(hash(seed + r * 7 + c * 3 + Math.floor(f / 4)) * 10)) : ' ';
      s += ' ';
    }
    lines.push(s);
  }
  const w = cols * size * 1.2 + 24;
  const h = rows * size * 1.2 + 16;
  return (
    <>
      {boxed && <BoxLine x={x} y={y} w={w} h={h} t={t} color={K.w} fill="#000" />}
      <T x={x + 14} y={y + 10} size={size} color={K.w} lh={1.2} style={{fontWeight: 700}}>
        {lines.join('\n')}
      </T>
    </>
  );
};

// camera: translate+scale the whole canvas
export const Cam: React.FC<{x?: number; y?: number; s?: number; children: React.ReactNode}> = ({x = 0, y = 0, s = 1, children}) => (
  <AbsoluteFill style={{transform: `translate(${-x}px, ${-y}px) scale(${s})`, transformOrigin: '960px 540px'}}>{children}</AbsoluteFill>
);
