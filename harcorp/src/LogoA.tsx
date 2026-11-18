import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop, Brackets, MicroColumn, Plus, Scr, Txt, Ruler} from './fui';
import {Lockup, LK, MARK_C, RING_R} from './Logo';
import logo from './logo.json';
import {C, clamp, eio, eo, ex, lerp, pad, prog} from './theme';

// Direction A — "ACQUISITION"
// The system finds Harcorp: crosshairs search, a sweep draws the ring,
// the H is built part by part, the reticle locks, then the name prints.

export const LOGO_A_CUES = {
  lines: 0,
  reticle: 8,
  sweep: 24,
  stemLeft: 42,
  bar: 48,
  stemRight: 54,
  dotTop: 61,
  dotBottom: 65,
  lock: 72,
  slide: 82,
  letters: 94, // + i*3
  industries: 110,
  resolve: 112,
};

const Q = LOGO_A_CUES;
const MARK_SCREEN_SCALE = 0.62; // px per lockup unit while the mark is alone

export const LogoA: React.FC = () => {
  const f = useCurrentFrame();

  // ---- mark placement: centred & large -> lockup position ----
  const mv = eio(prog(f, Q.slide, 20));
  const k0 = MARK_SCREEN_SCALE / LK.s;
  const d0x = (960 - LK.x) / LK.s - MARK_C.x;
  const d0y = (540 - LK.y) / LK.s - MARK_C.y;
  const k = lerp(k0, 1, mv);
  const dx = lerp(d0x, 0, mv);
  const dy = lerp(d0y, 0, mv);
  const markTransform = `translate(${MARK_C.x + dx} ${MARK_C.y + dy}) scale(${k}) translate(${-MARK_C.x} ${-MARK_C.y})`;

  // screen-space centre & radius of the ring (for HUD)
  const cx = LK.x + (MARK_C.x + dx) * LK.s;
  const cy = LK.y + (MARK_C.y + dy) * LK.s;
  const ringPx = RING_R * LK.s * k;

  const mark = {
    ring: eio(prog(f, Q.sweep, 22)),
    stemLeft: eo(prog(f, Q.stemLeft, 6)),
    bar: eo(prog(f, Q.bar, 6)),
    stemRight: eo(prog(f, Q.stemRight, 6)),
    dotTop: prog(f, Q.dotTop, 3),
    dotBottom: prog(f, Q.dotBottom, 3),
  };
  const letters = Array.from({length: 7}, (_, i) => eo(prog(f, Q.letters + i * 2.5, 6)));
  const industries = prog(f, Q.industries, 10);

  // HUD lifecycle
  const hudIn = eo(prog(f, Q.lines, 14));
  const hudOut = eo(prog(f, Q.slide - 2, 14));
  const hud = hudIn * (1 - hudOut);
  const gridOp = eo(prog(f, 0, 12)) * (1 - eo(prog(f, 100, 22)));

  // crosshair lines from centre
  const lineT = eo(prog(f, Q.lines, 16)) * (1 - eo(prog(f, Q.slide - 4, 12)));

  // reticle brackets fly in, then snap tight on lock
  const fly = eo(prog(f, Q.reticle, 20));
  const lockT = ex(prog(f, Q.lock, 5));
  const boxHalf = lerp(lerp(560, 330, fly), ringPx + 22, lockT);
  const locked = f >= Q.lock;

  // sweep beam angle follows ring reveal front (ring starts at 40deg)
  const sweepA = 40 + 360 * mark.ring;
  const sweepOn = mark.ring > 0 && mark.ring < 1;

  // glitch: 2 frames on lock
  const glitch = f === Q.lock + 1 || f === Q.lock + 3;

  const acq = Math.round(100 * eio(prog(f, Q.reticle, Q.lock - Q.reticle)));

  // ticks ring
  const ticksShown = Math.floor(90 * eo(prog(f, Q.reticle + 4, 18)));
  const ticks: string[] = [];
  for (let i = 0; i < ticksShown; i++) {
    const a = (i / 90) * Math.PI * 2 - Math.PI / 2;
    const r1 = ringPx + 40;
    const r2 = r1 + (i % 5 === 0 ? 14 : 6);
    ticks.push(`M${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}L${cx + Math.cos(a) * r2} ${cy + Math.sin(a) * r2}`);
  }
  const outerR = ringPx + 90;
  const outerC = 2 * Math.PI * outerR;

  return (
    <AbsoluteFill>
      <Backdrop gridOpacity={gridOp} fx={1 - eo(prog(f, 108, 18))}>
        {/* HUD layer */}
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: hud}}>
          {/* crosshair */}
          <g stroke={C.faint} strokeWidth={1} shapeRendering="crispEdges">
            <line x1={cx - 960 * lineT} x2={cx - ringPx - 70} y1={cy} y2={cy} />
            <line x1={cx + ringPx + 70} x2={cx + 960 * lineT} y1={cy} y2={cy} />
            <line y1={cy - 540 * lineT} y2={cy - ringPx - 70} x1={cx} x2={cx} />
            <line y1={cy + ringPx + 70} y2={cy + 540 * lineT} x1={cx} x2={cx} />
          </g>
          <Ruler x={cx - 900 * lineT} y={cy - 1} w={Math.max(0, 900 * lineT - ringPx - 110)} step={12} major={5} />
          <Ruler x={cx + ringPx + 110} y={cy + 1} w={Math.max(0, 900 * lineT - ringPx - 110)} step={12} major={5} down />
          {/* outer dashed orbit */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke={C.hair}
            strokeWidth={1}
            strokeDasharray={`2 6`}
            opacity={eo(prog(f, Q.reticle, 16))}
            transform={`rotate(${f * 0.6} ${cx} ${cy})`}
          />
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 12}
            fill="none"
            stroke={locked ? C.accent : C.dim}
            strokeWidth={2}
            strokeDasharray={`${outerC * 0.08} ${outerC}`}
            transform={`rotate(${-90 + f * 2.4} ${cx} ${cy})`}
            opacity={eo(prog(f, Q.reticle + 6, 10))}
          />
          <path d={ticks.join('')} stroke={C.dim} strokeWidth={1} />
          {/* sweep beam */}
          {sweepOn && (
            <line
              x1={cx}
              y1={cy}
              x2={cx + Math.cos((sweepA * Math.PI) / 180) * (ringPx + 60)}
              y2={cy + Math.sin((sweepA * Math.PI) / 180) * (ringPx + 60)}
              stroke={C.accent}
              strokeWidth={1.5}
            />
          )}
          {/* reticle */}
          <Brackets x={cx - boxHalf} y={cy - boxHalf} w={boxHalf * 2} h={boxHalf * 2} len={lerp(40, 26, lockT)} color={locked ? C.accent : C.ink} sw={2} t={fly} />
          <Plus x={cx - boxHalf - 30} y={cy - boxHalf - 30} />
          <Plus x={cx + boxHalf + 30} y={cy - boxHalf - 30} />
          <Plus x={cx - boxHalf - 30} y={cy + boxHalf + 30} />
          <Plus x={cx + boxHalf + 30} y={cy + boxHalf + 30} />
        </svg>

        {/* HUD text */}
        <div style={{position: 'absolute', inset: 0, opacity: hud}}>
          <Scr text="HARCORP // IDENT-SYS" start={4} dur={12} x={80} y={72} size={22} color={C.ink} track={0.2} />
          <Scr text="MODULE 01 — MARK ACQUISITION" start={8} dur={12} x={80} y={104} size={11} color={C.dim} track={0.2} />
          <Txt x={1840} y={72} size={22} color={locked ? C.accent : C.ink} align="right" track={0.2}>
            {`ACQ ${pad(acq, 3)}%`}
          </Txt>
          <Scr text={locked ? 'STATUS  LOCKED' : 'STATUS  SEARCHING'} start={6} dur={8} x={1840} y={104} size={11} color={locked ? C.accent : C.dim} align="right" track={0.2} seed={locked ? 9 : 4} />
          <Txt x={80} y={990} size={11} color={C.dim} track={0.2}>
            {`X ${pad(cx * eo(prog(f, 6, 40)), 4, 2)}   Y ${pad(cy * eo(prog(f, 6, 40)), 4, 2)}   R ${pad(ringPx * mark.ring, 3, 1)}`}
          </Txt>
          <Txt x={1840} y={990} size={11} color={C.dim} align="right" track={0.2}>
            {`T+${pad(f / 30, 2, 2)}  FRM ${pad(f, 4)}`}
          </Txt>
          <MicroColumn x={80} y={160} rows={14} seed={2} t={prog(f, 10, 30)} />
          <MicroColumn x={1640} y={160} rows={14} seed={5} t={prog(f, 14, 30)} />
          <Txt x={cx + boxHalf + 40} y={cy - boxHalf - 6} size={11} color={C.dim} track={0.2}>
            {`AZ ${pad(((sweepA % 360) + 360) % 360, 3, 1)}°`}
          </Txt>
          <Txt x={cx + boxHalf + 40} y={cy - boxHalf + 12} size={11} color={C.faint} track={0.2}>
            {`EL ${pad(90 * fly, 3, 1)}°`}
          </Txt>
          <Txt x={cx - boxHalf - 40} y={cy + boxHalf - 4} size={11} color={C.dim} align="right" track={0.2}>
            {`TGT-0001`}
          </Txt>
          <Txt x={cx - boxHalf - 40} y={cy + boxHalf + 14} size={11} color={C.faint} align="right" track={0.2}>
            {`CONF ${pad(0.999 * acq / 100, 1, 3)}`}
          </Txt>
          <div style={{position: 'absolute', left: 80, top: 1020, width: 1760 * eo(prog(f, 6, 60)), height: 2, background: C.faint}} />
          <div style={{position: 'absolute', left: 80, top: 1020, width: 1760 * (acq / 100), height: 2, background: locked ? C.accent : C.dim}} />
          {locked && (
            <Scr
              text="TARGET LOCKED / HARCORP INDUSTRIES"
              start={Q.lock}
              dur={8}
              x={cx}
              y={cy + boxHalf + 46}
              size={11}
              color={C.accent}
              align="center"
              track={0.3}
            />
          )}
        </div>

        {/* logo */}
        <svg
          width={1920}
          height={1080}
          style={{
            position: 'absolute',
            transform: glitch ? 'translateX(6px)' : undefined,
            filter: f >= Q.lock && f < Q.lock + 8 ? `drop-shadow(0 0 ${12 * (1 - prog(f, Q.lock, 8))}px ${C.accent})` : undefined,
          }}
        >
          <g transform={`translate(${LK.x} ${LK.y}) scale(${LK.s})`}>
            <Lockup id="A" mark={mark} letters={letters} industries={industries} markTransform={markTransform} ringStart={40} />
          </g>
          {/* print cursor leading the letters */}
          {letters.some((t) => t > 0 && t < 1) &&
            (() => {
              const i = letters.findIndex((t) => t < 1);
              if (i < 0) return null;
              const ux = logo.letterX[i] + 366 * letters[i];
              return <rect x={LK.x + ux * LK.s} y={LK.y + 140 * LK.s} width={10} height={425 * LK.s} fill={C.accent} />;
            })()}
        </svg>
        {glitch && (
          <svg width={1920} height={1080} style={{position: 'absolute', mixBlendMode: 'screen', transform: 'translateX(-8px)', opacity: 0.7}}>
            <g transform={`translate(${LK.x} ${LK.y}) scale(${LK.s})`}>
              <Lockup id="Ag" mark={mark} letters={letters} industries={industries} markTransform={markTransform} color={C.accent} />
            </g>
          </svg>
        )}
      </Backdrop>
    </AbsoluteFill>
  );
};
