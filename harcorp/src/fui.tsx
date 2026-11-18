import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, F, clamp, eo, hash, prog, scramble} from './theme';

type CSS = React.CSSProperties;

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(c.width, c.height);
    let s = (f * 9301 + 49297) % 233280;
    for (let i = 0; i < img.data.length; i += 4) {
      s = (s * 9301 + 49297) % 233280;
      const v = (s / 233280) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [f]);
  return (
    <canvas
      ref={ref}
      width={480}
      height={270}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, mixBlendMode: 'screen', pointerEvents: 'none'}}
    />
  );
};

export const Backdrop: React.FC<{grid?: number; gridOpacity?: number; children?: React.ReactNode; grain?: boolean; fx?: number}> = ({
  fx = 1,
  grid = 1,
  gridOpacity = 1,
  children,
  grain = true,
}) => {
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {grid > 0 && (
        <AbsoluteFill style={{opacity: gridOpacity * grid}}>
          <svg width={1920} height={1080} style={{position: 'absolute'}}>
            <defs>
              <pattern id="g-small" width={40} height={40} patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke={C.ghost} strokeWidth={1} />
              </pattern>
              <pattern id="g-big" width={160} height={160} patternUnits="userSpaceOnUse">
                <rect width={160} height={160} fill="url(#g-small)" />
                <path d="M160 0H0V160" fill="none" stroke="rgba(228,236,231,0.09)" strokeWidth={1} />
                <path d="M-4 0H4M0 -4V4" stroke={C.faint} strokeWidth={1} transform="translate(0,0)" />
              </pattern>
            </defs>
            <rect x={0} y={20} width={1920} height={1080} fill="url(#g-big)" />
          </svg>
        </AbsoluteFill>
      )}
      {children}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
          opacity: fx,
        }}
      />
      {grain && <Grain opacity={0.05 * fx + 0.015} />}
    </AbsoluteFill>
  );
};

export const Txt: React.FC<{
  x: number;
  y: number;
  size?: number;
  color?: string;
  children: React.ReactNode;
  track?: number;
  font?: string;
  align?: 'left' | 'right' | 'center';
  style?: CSS;
}> = ({x, y, size = 22, color = C.dim, children, track = 0.12, font = F.label, align = 'left', style}) => (
  <div
    style={{
      position: 'absolute',
      left: align === 'left' ? x : undefined,
      right: align === 'right' ? 1920 - x : undefined,
      top: y,
      ...(align === 'center' ? {left: x, transform: 'translateX(-50%)'} : {}),
      fontFamily: font,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: `${track}em`,
      color,
      whiteSpace: 'pre',
      textTransform: font === F.label ? 'uppercase' : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

// text that types/scrambles in over [start, start+dur] and scrambles out at [out, out+outDur]
export const Scr: React.FC<{
  text: string;
  start: number;
  dur?: number;
  out?: number;
  outDur?: number;
  seed?: number;
  x: number;
  y: number;
  size?: number;
  color?: string;
  track?: number;
  font?: string;
  align?: 'left' | 'right' | 'center';
  style?: CSS;
}> = ({text, start, dur = 12, out = 1e9, outDur = 8, seed = 1, ...rest}) => {
  const f = useCurrentFrame();
  const tin = prog(f, start, dur);
  const tout = prog(f, out, outDur);
  if (tin <= 0 || tout >= 1) return null;
  let s = scramble(text, tin, seed, f);
  if (tout > 0) {
    const keep = Math.floor((1 - tout) * text.length);
    s = text
      .split('')
      .map((ch, i) => (i < keep ? ch : ch === ' ' ? ' ' : hash(seed + i + f) > 0.6 ? '_' : ' '))
      .join('');
  }
  return <Txt {...rest}>{s}</Txt>;
};

// corner brackets around a rect
export const Brackets: React.FC<{x: number; y: number; w: number; h: number; len?: number; color?: string; sw?: number; t?: number}> = ({
  x,
  y,
  w,
  h,
  len = 18,
  color = C.ink,
  sw = 2,
  t = 1,
}) => {
  const l = len * clamp(t);
  if (l <= 0.5) return null;
  const d = `M${x} ${y + l}V${y}H${x + l} M${x + w - l} ${y}H${x + w}V${y + l} M${x + w} ${y + h - l}V${y + h}H${x + w - l} M${x + l} ${y + h}H${x}V${y + h - l}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="square" />;
};

// a hairline rectangle that draws on (from top-left both ways) and retracts
export const DrawRect: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string; sw?: number; fill?: string}> = ({
  x,
  y,
  w,
  h,
  t,
  color = C.hair,
  sw = 1,
  fill = 'none',
}) => {
  const per = 2 * (w + h);
  const tt = clamp(t);
  if (tt <= 0) return null;
  return (
    <>
      {fill !== 'none' && <rect x={x} y={y} width={w} height={h} fill={fill} opacity={tt} />}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={`${per * tt} ${per}`}
        shapeRendering="crispEdges"
      />
    </>
  );
};

// tick ruler along a horizontal line
export const Ruler: React.FC<{x: number; y: number; w: number; t?: number; step?: number; major?: number; color?: string; offset?: number; down?: boolean}> = ({
  x,
  y,
  w,
  t = 1,
  step = 10,
  major = 5,
  color = C.faint,
  offset = 0,
  down = false,
}) => {
  const n = Math.floor(w / step);
  const shown = Math.floor(n * clamp(t));
  const parts: string[] = [];
  const off = ((offset % step) + step) % step;
  for (let i = 0; i <= shown; i++) {
    const px = x + i * step - off;
    if (px < x || px > x + w) continue;
    const idx = i + Math.floor(offset / step);
    const hgt = idx % major === 0 ? 10 : 4;
    parts.push(`M${px.toFixed(1)} ${y}V${down ? y + hgt : y - hgt}`);
  }
  return <path d={parts.join('')} stroke={color} strokeWidth={1} shapeRendering="crispEdges" />;
};

export const Plus: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 6, color = C.dim}) => (
  <path d={`M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}`} stroke={color} strokeWidth={1} shapeRendering="crispEdges" />
);

// standard component frame: draws border, header strip, ids and corner brackets
export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  f: number;
  inAt: number;
  outAt?: number;
  title: string;
  id: string;
  active?: boolean;
  alert?: boolean;
  children?: React.ReactNode;
}> = ({x, y, w, h, f, inAt, outAt = 1e9, title, id, active, alert, children}) => {
  const tin = eo(prog(f, inAt, 14));
  const tout = eo(prog(f, outAt, 12));
  const t = tin * (1 - tout);
  if (t <= 0) return null;
  const col = alert ? C.red : active ? C.accent : C.ink;
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <DrawRect x={x} y={y} w={w} h={h} t={t} fill={C.panel} />
        <line x1={x} x2={x + w * t} y1={y + 34} y2={y + 34} stroke={C.faint} shapeRendering="crispEdges" />
        <Brackets x={x - 6} y={y - 6} w={w + 12} h={h + 12} t={t} color={col} len={14} sw={2} />
        <Ruler x={x + w - 160} y={y + h} w={150} t={t} step={6} major={5} down />
      </svg>
      <Scr text={title} start={inAt + 4} dur={10} out={outAt} x={x + 16} y={y + 11} size={14} color={C.ink} track={0.18} seed={id.length * 7} />
      <Scr text={id} start={inAt + 6} dur={10} out={outAt} x={x + w - 16} y={y + 11} size={14} color={C.dim} track={0.14} align="right" seed={3} />
      <div style={{position: 'absolute', left: x, top: y + 35, width: w, height: h - 35, overflow: 'hidden', opacity: tout > 0 ? 1 - tout : 1}}>
        {children}
      </div>
    </>
  );
};

// small blinking status dot
export const Dot: React.FC<{x: number; y: number; color?: string; blink?: boolean; r?: number}> = ({x, y, color = C.accent, blink = true, r = 4}) => {
  const f = useCurrentFrame();
  const on = !blink || Math.floor(f / 8) % 2 === 0;
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, background: color, opacity: on ? 1 : 0.25}} />;
};

// microtext column: dense pseudo-system data as texture
export const MicroColumn: React.FC<{x: number; y: number; rows: number; seed: number; t?: number; color?: string; width?: number}> = ({
  x,
  y,
  rows,
  seed,
  t = 1,
  color = C.faint,
  width = 22,
}) => {
  const f = useCurrentFrame();
  const shown = Math.floor(rows * clamp(t));
  const lines: string[] = [];
  for (let i = 0; i < shown; i++) {
    const k = seed * 31 + i;
    const a = Math.floor(hash(k) * 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const b = Math.floor(hash(k + 3 + Math.floor((f + i * 3) / 6)) * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, '0');
    const c = (hash(k + 9) * 99).toFixed(2).padStart(5, '0');
    lines.push(`${a} ${b} ${c}`.slice(0, width));
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: F.label, fontSize: 11, lineHeight: '15px', color, letterSpacing: '0.08em', whiteSpace: 'pre'}}>
      {lines.join('\n')}
    </div>
  );
};
