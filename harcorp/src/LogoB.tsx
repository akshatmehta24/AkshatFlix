import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import logo from './logo.json';
import {Backdrop, Scr, Txt} from './fui';
import {Lockup, LK, indX} from './Logo';
import {C, F, clamp, eio, eo, ex, hash, lerp, pad, prog} from './theme';

// Direction B — "FROM THE POINT"
// Harcorp: "from the point to the superstructure". One point of light becomes
// a field of raw matter (characters); the field is pulled into the lockup,
// locks cell by cell and resolves into the solid mark.

export const LOGO_B_CUES = {
  point: 4,
  burst: 16,
  condense: 44,
  lockScan: 76,
  resolve: 92,
};
const Q = LOGO_B_CUES;

const CW = 10; // cell width
const CH = 14; // cell height
const COLS = Math.ceil(1920 / CW);
const ROWS = Math.ceil(1080 / CH);
const LIGHT = '·.:-=+*';
const DENSE = '#%&@$8B0WM';

let maskCache: Float32Array | null = null;
const buildMask = (): Float32Array => {
  if (maskCache) return maskCache;
  const c = document.createElement('canvas');
  c.width = 1920;
  c.height = 1080;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.setTransform(LK.s, 0, 0, LK.s, LK.x, LK.y);
  const m = logo.mark as Record<string, string>;
  [...Object.values(m), logo.ring, ...logo.letters.flat()].forEach((d) => ctx.fill(new Path2D(d)));
  ctx.font = `700 111px "Liberation Sans", Arial`;
  'INDUSTRIES'.split('').forEach((ch, i) => {
    ctx.save();
    ctx.scale(0.94, 1);
    ctx.fillText(ch, indX(i) / 0.94, 735.8);
    ctx.restore();
  });
  const data = ctx.getImageData(0, 0, 1920, 1080).data;
  const out = new Float32Array(COLS * ROWS);
  for (let r = 0; r < ROWS; r++)
    for (let q = 0; q < COLS; q++) {
      let s = 0;
      let n = 0;
      for (let y = r * CH; y < Math.min(1080, r * CH + CH); y += 2)
        for (let x = q * CW; x < Math.min(1920, q * CW + CW); x += 2) {
          s += data[(y * 1920 + x) * 4 + 3];
          n++;
        }
      out[r * COLS + q] = s / (n * 255);
    }
  maskCache = out;
  return out;
};

const GlyphField: React.FC<{f: number}> = ({f}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    const handle = delayRender('glyph-field');
    document.fonts.load('14px Departure').then(() => {
      if (cancelled) return;
      const cv = ref.current!;
      const ctx = cv.getContext('2d')!;
      ctx.clearRect(0, 0, 1920, 1080);
      const mask = buildMask();
      ctx.font = '14px Departure';
      ctx.textBaseline = 'top';
      const cx = 960;
      const cy = 540;
      const maxD = Math.hypot(960, 540);
      const front = maxD * 1.05 * ex(prog(f, Q.burst, 26));
      const cond = prog(f, Q.condense, 34); // outside cells collapse
      const scan = prog(f, Q.lockScan, 16); // inside cells lock left->right
      const fadeAll = eo(prog(f, Q.resolve, 12));
      for (let r = 0; r < ROWS; r++) {
        for (let q = 0; q < COLS; q++) {
          const i = r * COLS + q;
          const x = q * CW;
          const y = r * CH;
          const dx = x + CW / 2 - cx;
          const dy = y + CH / 2 - cy;
          const d = Math.hypot(dx, dy);
          if (d > front) continue;
          const h = hash(i * 1.37);
          const m = mask[i];
          const inside = m > 0.35;
          // wavefront brightness then settle
          const since = (front - d) / 160;
          const flash = Math.exp(-since * 2.2);
          let a = 0.2 + 0.16 * h + 0.8 * flash;
          let ox = 0;
          let oy = 0;
          let glyph = LIGHT[Math.floor(hash(i + Math.floor((f + h * 20) / 3)) * LIGHT.length)];
          let col = C.ink;
          if (!inside) {
            // collapse: far cells first; drift toward centre while fading
            const order = 1 - d / maxD; // far = 0
            const local = clamp((cond - order * 0.55) / 0.45);
            const pull = eio(local);
            a *= 1 - pull;
            ox = -dx * 0.35 * pull;
            oy = -dy * 0.35 * pull;
            if (h > 0.985 && cond < 0.5) col = C.accent;
          } else {
            const grow = eo(clamp(cond * 1.6));
            a = lerp(a, 0.55 + 0.45 * m, grow);
            if (grow > 0.3) glyph = DENSE[Math.floor(hash(i + Math.floor(f / 2) * 3.1) * DENSE.length)];
            const lockAt = (x - LK.x) / (LK.w + 20);
            if (scan > lockAt) {
              const t = (scan - lockAt) * 16;
              glyph = '█';
              col = t < 1 ? C.accent : C.ink;
              a = 1;
            }
          }
          a *= 1 - fadeAll;
          if (a < 0.02) continue;
          ctx.globalAlpha = clamp(a);
          ctx.fillStyle = col;
          ctx.fillText(glyph, x + ox, y + oy);
        }
      }
      ctx.globalAlpha = 1;
      continueRender(handle);
    });
    return () => {
      cancelled = true;
      continueRender(handle);
    };
  }, [f]);
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />;
};

export const LogoB: React.FC = () => {
  const f = useCurrentFrame();
  const pointOn = f >= Q.point && f < Q.burst + 4;
  const pointBlink = f < Q.burst ? (Math.floor((f - Q.point) / 3) % 2 === 0 ? 1 : 0.35) : 1 - prog(f, Q.burst, 4);
  const pointSize = f >= Q.burst - 2 ? lerp(3, 14, prog(f, Q.burst - 2, 4)) : 4;
  const solid = eo(prog(f, Q.resolve - 2, 10));
  const bloom = f >= Q.resolve ? 1 - eo(prog(f, Q.resolve, 22)) : 0;
  const ring = f >= Q.burst ? ex(prog(f, Q.burst, 20)) : 0;
  const labelsOut = Q.resolve - 6;

  return (
    <AbsoluteFill>
      <Backdrop grid={0} fx={1 - eo(prog(f, 100, 20))}>
        {f >= Q.burst && f < Q.resolve + 14 && <GlyphField f={f} />}
        {/* shock ring from the burst */}
        {ring > 0 && ring < 1 && (
          <svg width={1920} height={1080} style={{position: 'absolute'}}>
            <circle cx={960} cy={540} r={ring * 1150} fill="none" stroke={C.ink} strokeOpacity={0.5 * (1 - ring)} strokeWidth={1.5} />
          </svg>
        )}
        {pointOn && (
          <div
            style={{
              position: 'absolute',
              left: 960 - pointSize / 2,
              top: 540 - pointSize / 2,
              width: pointSize,
              height: pointSize,
              background: C.ink,
              opacity: pointBlink,
              boxShadow: `0 0 ${pointSize * 3}px ${C.ink}`,
            }}
          />
        )}
        {/* minimal system labels */}
        <Scr text="00 / ORIGIN" start={Q.point} dur={8} out={labelsOut} x={80} y={72} size={22} color={C.ink} track={0.2} />
        <Scr text="FROM THE POINT TO THE SUPERSTRUCTURE" start={Q.point + 4} dur={14} out={labelsOut} x={80} y={104} size={11} color={C.dim} track={0.25} />
        <Txt x={1840} y={72} size={22} color={f >= Q.lockScan ? C.accent : C.ink} align="right" track={0.2} style={{opacity: 1 - prog(f, labelsOut, 6)}}>
          {`MATTER ${pad(Math.round(100 * eio(prog(f, Q.burst, Q.resolve - Q.burst))), 3)}%`}
        </Txt>
        <Txt x={80} y={990} size={11} color={C.dim} track={0.2} style={{opacity: 1 - prog(f, labelsOut, 6)}}>
          {`CELLS ${pad(Math.round(COLS * ROWS * ex(prog(f, Q.burst, 26)) * (1 - 0.8 * eio(prog(f, Q.condense, 34)))), 5)}   GRID ${COLS}×${ROWS}`}
        </Txt>
        <Txt x={1840} y={990} size={11} color={C.dim} align="right" track={0.2} style={{opacity: 1 - prog(f, labelsOut, 6)}}>
          {`T+${pad(f / 30, 2, 2)}`}
        </Txt>
        {/* solid lockup */}
        <svg
          width={1920}
          height={1080}
          style={{
            position: 'absolute',
            opacity: solid,
            filter: bloom > 0 ? `drop-shadow(0 0 ${18 * bloom}px rgba(228,236,231,${0.8 * bloom}))` : undefined,
          }}
        >
          <g transform={`translate(${LK.x} ${LK.y}) scale(${LK.s})`}>
            <Lockup id="B" />
          </g>
        </svg>
      </Backdrop>
    </AbsoluteFill>
  );
};
export const _unused = F;
