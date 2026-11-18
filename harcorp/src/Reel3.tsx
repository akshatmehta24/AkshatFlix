import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {synthLevel} from './components';
import {Film, SceneProps, TL} from './film';
import {Lockup} from './Logo';
import {DashRing, Fan, GlowRing, GlowWave, HLine, K, MONO, SANS, T, Type, VLine} from './s2';
import tlj from './tl_reel.json';
import {clamp, eio, eo, hash, lerp, noise1, prog} from './theme';

export const TL_REEL = tlj as unknown as TL;
const IN = 4;
const IDLE = 40;
const OUT = 128;

// ---------- C1 ----------
const C1: React.FC<{S: number; D: number}> = ({S, D}) => {
  const at = (n: number) => S + Math.round((n * D) / 150);
  const f = useCurrentFrame();
  const tin = prog(f, at(IN), 22);
  const tout = eio(prog(f, at(OUT), 18));
  const level = (t: number) => (0.08 + 0.92 * synthLevel(t)) * (1 - tout) * eo(prog(t, at(IN) + 10, 16));
  const lv = level(f);
  const db = -60 + 52 * Math.sqrt(lv);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, #071634 0%, #000 62%)', opacity: eo(tin) * (1 - tout)}} />
      <GlowWave x0={lerp(960, 120, eio(tin)) + lerp(0, 840, tout)} x1={lerp(960, 1800, eio(tin)) - lerp(0, 840, tout)} y={540} level={level} amp={260} t={1} />
      <Type text="listening." start={at(IN) + 14} cps={0.8} out={at(OUT)} x={120} y={330} size={30} color={K.g1} cursor="end" />
      <T x={1800} y={330} size={22} color={K.g2} align="right" style={{opacity: eo(prog(f, at(20), 8)) * (1 - tout)}}>
        {`${db.toFixed(1)} dBFS   48 kHz`}
      </T>
      <T x={1800} y={720} size={22} color={lv > 0.25 ? K.blueSoft : K.g2} align="right" style={{opacity: eo(prog(f, at(24), 8)) * (1 - tout)}}>
        {lv > 0.25 ? '● speech' : '○ silence'}
      </T>
    </>
  );
};

// ---------- C2 ----------
const C2: React.FC<{S: number; D: number}> = ({S, D}) => {
  const at = (n: number) => S + Math.round((n * D) / 150);
  const f = useCurrentFrame();
  const L = at(52);
  const P = at(88);
  const tin = prog(f, at(IN), 18);
  const tout = eio(prog(f, at(OUT), 16));
  const wI = (1 - eo(prog(f, L, 8))) * (1 - tout);
  const wL = eo(prog(f, L, 8)) * (1 - eo(prog(f, P, 8))) * (1 - tout);
  const wP = eo(prog(f, P, 8)) * (1 - tout);
  const lv = 0.3 + 0.7 * synthLevel(f);
  const pct = Math.min(99, Math.round(100 * eio(prog(f, P, 40))));
  const word = f < L ? 'idle.' : f < P ? 'listening.' : 'thinking.';
  return (
    <>
      {wI > 0 && <DashRing cx={960} cy={500} r={170} t={eo(tin) * wI} spin={1.2} n={8} />}
      {wL > 0 && <GlowRing cx={960} cy={500} r={210} t={wL} pulse={lv} />}
      {wL > 0 && <T x={960} y={486} size={30} align="center" style={{opacity: wL}}>listening.</T>}
      {wP > 0 && <DashRing cx={960} cy={500} r={150} t={wP} spin={7} n={10} color={K.orange} len={0.42} sw={12} />}
      {wP > 0 && <DashRing cx={960} cy={500} r={200} t={wP} spin={-2.5} n={40} color={K.g2} len={0.3} sw={4} />}
      {wP > 0 && <T x={960} y={474} size={52} align="center" style={{opacity: wP}}>{`${pct}%`}</T>}
      <T x={960} y={790} size={34} align="center" color={f < L ? K.w : f < P ? K.blueSoft : K.orange} style={{opacity: eo(tin) * (1 - tout)}}>
        {word}
      </T>
      <div style={{position: 'absolute', left: 0, width: 1920, top: 860, display: 'flex', justifyContent: 'center', gap: 40, fontFamily: MONO, fontSize: 20, opacity: eo(tin) * (1 - tout)}}>
        {['idle', 'listening', 'processing'].map((s, k) => {
          const on = (k === 0 && f < L) || (k === 1 && f >= L && f < P) || (k === 2 && f >= P);
          return (
            <span key={s} style={{color: on ? K.w : K.g3}}>
              {on ? '■ ' : '□ '}
              {s}
            </span>
          );
        })}
      </div>
    </>
  );
};

// ---------- C3 ----------
const C3: React.FC<{S: number; D: number}> = ({S, D}) => {
  const at = (n: number) => S + Math.round((n * D) / 150);
  const f = useCurrentFrame();
  const o = at(OUT);
  const gridT = eo(prog(f, at(IN), 12)) * (1 - eio(prog(f, o + 8, 12)));
  const code: {t: string; at: number}[] = [
    {t: 'const delay = Math.min(', at: at(66)},
    {t: '  BASE_MS * 2 ** attempt,', at: at(74)},
    {t: '  30_000,', at: at(84)},
    {t: ')', at: at(90)},
  ];
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: gridT * 0.5, backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '64px 64px'}} />
      <div style={{position: 'absolute', left: 300, top: 250, padding: '6px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 6, fontFamily: SANS, fontSize: 18, color: K.g1, opacity: gridT}}>⬡ harcode</div>
      <Type text={[{t: '>', c: K.w}, {t: 'Harcode', c: K.green}, {t: '/listen', c: K.w}]} start={at(IN) + 6} cps={1.2} out={o + 8} x={300} y={310} size={40} cursor="end" />
      <Type
        text={[{t: '>Heard:', c: K.w}, {t: ' "make the retry delay exponential,', c: K.blueSoft}]}
        start={at(24)}
        cps={2.2}
        out={o + 4}
        x={300}
        y={370}
        size={40}
        cursor="end"
      />
      <Type text={[{t: '        cap it at thirty seconds"', c: K.blueSoft}]} start={at(42)} cps={2.2} out={o + 2} x={300} y={420} size={40} cursor="end" />
      <Type text={[{t: '>Status:', c: K.w}, {t: f < at(96) ? 'WRITING' : 'DONE', c: f < at(96) ? K.orange : K.green}]} start={at(56)} cps={1.6} out={o} x={300} y={480} size={40} cursor="end" />
      {code.map((c, i) => {
        if (f < c.at || f >= o + 6 - i) return null;
        const n = Math.floor(c.t.length * clamp((f - c.at) / Math.max(5, c.t.length * 0.3)));
        const hl = eo(clamp((f - c.at - 4) / 8));
        return (
          <div key={i} style={{position: 'absolute', left: 300, top: 580 + i * 58, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 36}}>
            <span style={{color: K.g2, width: 70, fontSize: 24}}>{41 + i}</span>
            <span style={{background: `rgba(40,200,64,${0.88 * hl})`, color: hl > 0.5 ? '#050505' : K.w, padding: '2px 12px', whiteSpace: 'pre'}}>{c.t.slice(0, n)}</span>
            {n >= c.t.length && (
              <svg width={44} height={34} style={{marginLeft: 14}}>
                <path d="M4 17l10 10L40 3" fill="none" stroke="#28c840" strokeWidth={5} strokeLinecap="round" strokeDasharray={`${60 * eo(clamp((f - c.at - 8) / 6))} 60`} />
              </svg>
            )}
          </div>
        );
      })}
    </>
  );
};

// ---------- C4 ----------
const C4: React.FC<{S: number; D: number}> = ({S, D}) => {
  const at = (n: number) => S + Math.round((n * D) / 150);
  const f = useCurrentFrame();
  const o = at(OUT);
  const dot = eo(prog(f, at(IN), 8)) * (1 - eio(prog(f, o + 10, 8)));
  const a = at(14);
  return (
    <>
      <div style={{position: 'absolute', left: 340 - 9, top: 540 - 9, width: 18, height: 18, borderRadius: 9, background: K.blue, boxShadow: `0 0 30px ${K.blue}`, opacity: dot}} />
      <Type text="acme-api/" start={at(IN) + 4} cps={1} out={o + 6} x={300} y={580} size={26} color={K.g1} cursor="end" />
      <Fan
        ox={340}
        oy={540}
        out={o}
        targets={[
          {x: 1150, y: 170, label: 'routes/auth.ts', sub: 'login()', at: a, hot: f >= at(62)},
          {x: 1260, y: 290, label: 'routes/users.ts', at: a + 3},
          {x: 1320, y: 410, label: 'middleware/rateLimit.ts', sub: 'touched by change', at: a + 6, hot: f >= at(74)},
          {x: 1340, y: 530, label: 'middleware/session.ts', at: a + 9},
          {x: 1320, y: 650, label: 'lib/redis.ts', sub: 'dependency', at: a + 12, hot: f >= at(84)},
          {x: 1260, y: 770, label: 'lib/db.ts', at: a + 15},
          {x: 1150, y: 890, label: 'tests/auth.spec.ts', sub: '14 tests', at: a + 18, hot: f >= at(92)},
        ]}
      />
      <T x={1800} y={980} size={20} color={K.g2} align="right" style={{opacity: dot}}>
        {`files ${Math.round(214 * eo(prog(f, at(14), 30)))}/214   deps 38`}
      </T>
    </>
  );
};

// ---------- C5 ----------
const TASKS: [string, number, number][] = [
  ['parse intent', 10, 14],
  ['map context', 20, 22],
  ['write patch', 34, 26],
  ['run tests', 52, 30],
  ['lint + format', 74, 14],
];
const C5: React.FC<{S: number; D: number}> = ({S, D}) => {
  const at = (n: number) => S + Math.round((n * D) / 150);
  const f = useCurrentFrame();
  const l = ((f - S) * 150) / D;
  const o = at(OUT);
  const active = TASKS.findIndex(([, st, du]) => l >= st && l < st + du);
  const blocks = prog(f, at(92), 14);
  return (
    <>
      <div style={{position: 'absolute', left: 300, top: 300, width: 1400}}>
        {TASKS.map(([n, st, du], i) => {
          const rin = eo(clamp((l - IN - i * 3) / 8));
          const rout = clamp((f - o - (TASKS.length - i) * 2) / 6);
          const p = clamp((l - st) / du);
          const isA = i === active;
          const segs = 44;
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', height: 76, opacity: rin * (1 - rout) * (isA || p >= 1 ? 1 : 0.4), border: isA ? '2px solid rgba(255,255,255,0.85)' : '2px solid transparent', paddingLeft: 18}}>
              <span style={{fontFamily: MONO, fontSize: 26, color: K.g2, width: 70}}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{fontFamily: MONO, fontSize: 32, color: K.green, width: 46}}>{p >= 1 ? '✓' : '+'}</span>
              <span style={{fontFamily: MONO, fontSize: 32, color: K.w, width: 420}}>{n}</span>
              <span style={{fontFamily: MONO, fontSize: 18, color: K.g1, width: 80}}>{`${Math.round(p * 100)}%`}</span>
              <div style={{display: 'flex', gap: 4}}>
                {Array.from({length: segs}).map((_, k) => (
                  <div key={k} style={{width: 13, height: 24, background: k < Math.floor(eio(p) * segs) ? (isA ? K.orange : K.w) : 'rgba(255,255,255,0.12)'}} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {blocks > 0 && f < o && (
        <>
          <HLine y={760} t={blocks} from={0} x0={0} x1={1920} />
          {Array.from({length: 14}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 40 + i * 132, top: 790, width: 112, height: 70, background: K.orange, opacity: i < Math.floor(blocks * 15) ? 1 : 0}} />
          ))}
          <HLine y={890} t={blocks} from={1920} x0={0} x1={1920} />
        </>
      )}
    </>
  );
};

// ---------- C6 ----------
const Dither: React.FC<{t: number; alert: number}> = ({t, alert}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = '13px JBMono';
    ctx.textBaseline = 'top';
    const cs = 16;
    for (let y = 0; y < c.height / cs; y++)
      for (let x = 0; x < c.width / cs; x++) {
        const v = 0.5 + 0.5 * Math.sin(x * 0.09 + f * 0.04) * Math.cos(y * 0.13 - f * 0.03) + 0.25 * (noise1(x * 0.2 + f * 0.1, y) - 0.5);
        const lv = clamp(v * t * (0.55 + 0.45 * alert * (hash(x + y * 999 + Math.floor(f / 2)) > 0.5 ? 1 : 0.6)));
        if (lv < 0.08) continue;
        const g = Math.floor(70 + 160 * lv);
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        ctx.fillText('0123456789'[Math.floor(hash(x * 7 + y * 13 + Math.floor(f / 3)) * 10)], x * cs, y * cs);
      }
  }, [f, t, alert]);
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.55}} />;
};
const C6: React.FC<{S: number; D: number}> = ({S, D}) => {
  const at = (n: number) => S + Math.round((n * D) / 150);
  const f = useCurrentFrame();
  const A = at(46);
  const R = at(82);
  const o = at(OUT);
  const tin = eo(prog(f, at(IN), 14));
  const tout = eio(prog(f, o, 14));
  const isAlert = f >= A && f < R;
  const bg = tin * (1 - tout);
  const glitch = f === A || f === A + 2 || f === A + 5;
  const blink = isAlert && Math.floor((f - A) / 6) % 2 === 0;
  const title = f < A ? 'ALL SYSTEMS\nNOMINAL' : f < R ? 'TEST\nFAILED' : 'RESOLVED';
  const sub = f < A ? '14 of 14 tests passing. Uptime 99.98%.' : f < R ? 'auth.spec.ts:42 — expected 429, received 200. Login is not rate limited.' : 'HARCODE patched middleware/rateLimit.ts. 14 of 14 tests passing in 3.4 s.';
  const subC = f < A ? '#555' : f < R ? '#D0312D' : '#1f9d3a';
  const cardX = 620 + (glitch ? 14 : 0);
  return (
    <>
      <Dither t={bg} alert={isAlert ? 1 : 0} />
      {isAlert && <div style={{position: 'absolute', inset: 0, background: 'rgba(229,72,77,0.10)', opacity: blink ? 1 : 0.4}} />}
      {/* black ascii box */}
      <div style={{position: 'absolute', left: 1010, top: 250, width: 420, height: 170, background: '#000', border: '2px solid #fff', opacity: bg, overflow: 'hidden', fontFamily: MONO, fontWeight: 700, fontSize: 34, color: '#fff', lineHeight: 1.1, padding: '6px 12px', whiteSpace: 'pre'}}>
        {[0, 1, 2, 3].map((r) => Array.from({length: 18}).map((_, k) => ";:'+=>!~cJtYS5"[Math.floor(hash(r * 31 + k + Math.floor(f / (isAlert ? 2 : 5))) * 14)]).join('')).join('\n')}
      </div>
      <div style={{position: 'absolute', left: 1330, top: 222, background: '#000', color: '#fff', fontFamily: SANS, fontSize: 14, padding: '4px 10px', opacity: bg}}>{isAlert ? 'Alert' : 'Monitor'}</div>
      {/* white card */}
      <div
        style={{
          position: 'absolute',
          left: cardX,
          top: 410 + (1 - tin) * 40,
          width: 640,
          padding: '34px 34px 30px',
          background: '#fff',
          opacity: bg,
          transform: `scaleY(${f >= A && f < A + 3 ? 0.96 : 1})`,
        }}
      >
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 72, lineHeight: 1.0, color: isAlert ? '#D0312D' : '#0a0a0a', whiteSpace: 'pre', letterSpacing: '-0.01em'}}>{title}</div>
        <div style={{fontFamily: SANS, fontSize: 18, color: subC, marginTop: 22, lineHeight: 1.35}}>{sub}</div>
      </div>
    </>
  );
};


const NAMES = ['Voice waveform', 'Listening & thinking', 'Voice → code', 'Codebase map', 'Task pipeline', 'Alert state'];
const Seg = (i: number, Comp: React.FC<{S: number; D: number}>): React.FC<SceneProps> => ({S, D}) => {
  const f = useCurrentFrame();
  const l = ((f - S) * 150) / D;
  const phase = l < IDLE ? 0 : l < OUT ? 1 : 2;
  return (
    <>
      <Comp S={S} D={D} />
      <Type text={[{t: `C-0${i + 1}  `, c: K.orange}, {t: NAMES[i], c: K.w}]} start={S + 2} cps={1.4} x={64} y={110} size={30} cursor="end" />
      <T x={1856} y={110} size={22} color={K.g2} align="right">{`${String(i + 1).padStart(2, '0')} / 06`}</T>
      <div style={{position: 'absolute', left: 64, top: 940, display: 'flex', gap: 28, fontFamily: MONO, fontSize: 20}}>
        {['build-on', 'idle', 'build-off'].map((s, k) => (
          <span key={s} style={{color: phase === k ? K.orange : K.g2}}>
            {phase === k ? '■ ' : '□ '}
            {s}
          </span>
        ))}
      </div>
    </>
  );
};
const Intro: React.FC<SceneProps> = ({S}) => {
  const f = useCurrentFrame();
  return (
    <>
      <Type text="HARCODE" start={S + 2} cps={0.8} x={960} y={420} size={96} align="center" cursor="end" />
      <Type text="interface components · 06" start={S + 14} cps={1.6} x={960} y={560} size={30} color={K.g1} align="center" cursor="end" />
      <HLine y={640} t={prog(f, S + 10, 14)} />
    </>
  );
};
const Outro: React.FC<SceneProps> = ({S}) => {
  const f = useCurrentFrame();
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: eo(prog(f, S + 2, 10))}}>
        <g transform={`translate(${960 - 330} ${400}) scale(${660 / 4160})`}>
          <Lockup id="r3o" />
        </g>
      </svg>
      <Type text="HARCODE interface kit" start={S + 12} cps={1.6} x={960} y={620} size={30} color={K.g1} align="center" cursor="end" />
    </>
  );
};
export const Reel3: React.FC = () => (
  <Film tl={TL_REEL} scenes={{intro: Intro, c1: Seg(0, C1), c2: Seg(1, C2), c3: Seg(2, C3), c4: Seg(3, C4), c5: Seg(4, C5), c6: Seg(5, C6), outro: Outro}} />
);
export const _r3 = {AbsoluteFill, VLine, lerp, SANS, hash, noise1, useEffect, useRef, clamp, eio, synthLevel, DashRing, Fan, GlowRing, GlowWave};
