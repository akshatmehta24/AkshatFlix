import React, {useEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import {EndCard} from './Demo3';
import {Film, SceneProps, TL, voEnv, voWords} from './film';
import {Lockup} from './Logo';
import {AsciiMark, Fan, GlowWave, HLine, K, MONO, SANS, T, Type, VLine} from './s2';
import tlj from './tl_concept.json';
import {clamp, eio, eo, hash, lerp, noise1, prog} from './theme';

export const TL_CONCEPT = tlj as unknown as TL;

// ---------- 1. cursor: one keystroke at a time; tiles of keys begin to fall ----------
const KEYS = 'QWERTYUIOPASDFGHJKLZXCVBNM{}();=<>/+-*#';
const Cursor: React.FC<SceneProps> = ({S, D}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const typed = 'hello, world';
  const n = Math.min(typed.length, Math.max(0, Math.floor((l - 16) / 4)));
  const rain = clamp((l - 50) / (D - 70));
  const tiles: React.ReactNode[] = [];
  const N = Math.floor(160 * eio(rain));
  for (let i = 0; i < N; i++) {
    const sp = 2 + hash(i * 3) * 5;
    const x = hash(i) * 1920;
    const y = ((hash(i + 7) * 1400 + (l - 50) * sp) % 1300) - 140;
    const s = 26 + hash(i + 2) * 46;
    const r = (hash(i + 4) - 0.5) * 60 + l * (hash(i + 5) - 0.5) * 2;
    const ch = KEYS[Math.floor(hash(i + 11) * KEYS.length)];
    const near = hash(i + 13) > 0.7;
    tiles.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: s,
          height: s,
          transform: `rotate(${r}deg)`,
          border: `1.5px solid ${near ? K.w : K.g2}`,
          background: near ? 'rgba(255,255,255,0.9)' : 'transparent',
          color: near ? '#000' : K.g1,
          fontFamily: MONO,
          fontSize: s * 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.25 + 0.75 * hash(i + 17),
        }}
      >
        {ch}
      </div>,
    );
  }
  return (
    <>
      {tiles}
      <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: MONO, fontSize: 56, color: K.w}}>
        <span style={{background: '#000', padding: '0 16px'}}>
          {typed.slice(0, n)}
          <span style={{display: 'inline-block', width: 32, height: 60, background: Math.floor(l / 12) % 2 === 0 || n < typed.length ? K.w : 'transparent', verticalAlign: 'text-bottom'}} />
        </span>
      </div>
      <T x={64} y={110} size={22} color={K.g2} style={{opacity: eo(prog(l, 4, 10))}}>
        {`input: keyboard   ·   since 1976`}
      </T>
    </>
  );
};

// ---------- 2. count: huge kinetic number over a data field ----------
const DataField: React.FC<{t: number}> = ({t}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = '12px JBMono';
    for (let i = 0; i < 1400 * t; i++) {
      const x = hash(i) * c.width;
      const y = hash(i + 1) * c.height;
      const v = noise1(x * 0.004 + f * 0.02, Math.floor(y / 40));
      ctx.fillStyle = `rgba(255,255,255,${0.08 + v * 0.35})`;
      if (hash(i + 3) > 0.6) ctx.fillText(hash(i + Math.floor(f / 3)).toFixed(2), x, y);
      else ctx.fillRect(x, y, 2 + hash(i + 4) * 40, 2 + hash(i + 5) * 14);
    }
  }, [f, t]);
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />;
};
const Count: React.FC<SceneProps> = ({S}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const v = Math.floor(1000000 + 9000000 * eio(clamp(l / 70)) + l * 1371);
  const s = v.toLocaleString('en-US');
  return (
    <>
      <DataField t={eo(clamp(l / 20))} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 230, color: K.w, letterSpacing: '-0.04em', textShadow: '0 0 40px rgba(0,0,0,0.9)', opacity: eo(clamp(l / 8))}}>{s}</div>
      <Type text="keystrokes" start={S + 16} cps={1} x={960} y={600} size={44} align="center" cursor="end" />
    </>
  );
};

// ---------- 3. race: idea vs hands ----------
const Race: React.FC<SceneProps> = ({S, D}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const idea = eio(clamp((l - 8) / 30));
  const hands = clamp((l - 8) / (D * 5)) ;
  const handsX = 300 + 1400 * hands;
  const code = 'const delay = Math.min(BASE * 2 ** attempt, 30000)';
  const nTyped = Math.floor(code.length * hands * 1.0);
  const gap = Math.round((1 - hands) * 100);
  return (
    <>
      <T x={120} y={330} size={26} color={K.blueSoft} style={{opacity: eo(clamp(l / 8))}}>idea</T>
      <GlowWave x0={300} x1={1700} y={345} level={() => 0.25} amp={30} t={idea} />
      <T x={120} y={620} size={26} color={K.g1} style={{opacity: eo(clamp(l / 8))}}>hands</T>
      <HLine y={636} t={1} from={300} x0={300} x1={1700} color={K.g3} />
      <div style={{position: 'absolute', left: 300, top: 560, fontFamily: MONO, fontSize: 30, color: K.w, whiteSpace: 'pre'}}>{code.slice(0, nTyped)}<span style={{display: 'inline-block', width: 16, height: 32, background: K.w, verticalAlign: 'text-bottom'}} /></div>
      <VLine x={handsX + 30} t={eo(clamp((l - 40) / 12))} from={490} y0={360} y1={620} color={K.orange} />
      <VLine x={1700} t={eo(clamp((l - 40) / 12))} from={490} y0={360} y1={620} color={K.orange} />
      <HLine y={490} t={eo(clamp((l - 46) / 12))} from={(handsX + 1730) / 2} x0={handsX + 30} x1={1700} color={K.orange} />
      <T x={(handsX + 1730) / 2} y={440} size={30} color={K.orange} align="center" style={{opacity: eo(clamp((l - 52) / 8))}}>{`gap ${gap}%`}</T>
    </>
  );
};

// ---------- 4. listen: white page, one question ----------
const Listen: React.FC<SceneProps> = ({S, vo}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const q = vo[0];
  const qAt = q ? q.at + Math.round(q.dur * 0.42) : S + 50;
  const mic = clamp((f - qAt - 30) / 10);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, #ffffff 0%, #e9e9e6 100%)'}} />
      <div style={{position: 'absolute', left: 120, top: 0, bottom: 0, width: 30}}>
        {Array.from({length: 22}).map((_, i) => (
          <div key={i} style={{position: 'absolute', top: 60 + i * 46, left: 0, fontFamily: MONO, fontSize: 24, color: 'rgba(0,0,0,0.55)', opacity: eo(clamp((l - i) / 6))}}>+</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 200, top: 470, fontFamily: MONO, fontSize: 54, color: '#111'}}>
        {f < qAt ? (
          <span>
            {'> '}
            <span style={{display: 'inline-block', width: 30, height: 58, background: Math.floor(l / 12) % 2 === 0 ? '#111' : 'transparent', verticalAlign: 'text-bottom'}} />
          </span>
        ) : (
          <Type text="> what if the terminal could listen?" start={qAt} cps={1.1} x={0} y={0} size={54} color="#111" cursor />
        )}
      </div>
      {mic > 0 && (
        <div style={{position: 'absolute', left: 200, top: 580, display: 'flex', alignItems: 'center', gap: 18, opacity: mic}}>
          <div style={{width: 22, height: 22, borderRadius: 11, background: K.blue, boxShadow: `0 0 ${14 + 10 * Math.sin(l / 4)}px ${K.blue}`}} />
          <span style={{fontFamily: MONO, fontSize: 26, color: '#333'}}>microphone ready</span>
        </div>
      )}
    </>
  );
};

// ---------- 5. meet: ascii mark × HARCODE ----------
const Meet: React.FC<SceneProps> = ({S}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const solid = eo(prog(l, 18, 8));
  const slide = eio(prog(l, 26, 14));
  const mx = lerp(960, 640, slide);
  return (
    <>
      {solid < 1 && <AsciiMark cx={960} cy={500} size={380} t={prog(l, 0, 18)} solid={solid} />}
      {solid > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: solid}}>
          <g transform={`translate(${mx - (300 / 900) * 497} ${500 - (300 / 900) * 450}) scale(${300 / 900})`}>
            <Lockup id="meet" letters={[0, 0, 0, 0, 0, 0, 0]} industries={0} />
          </g>
        </svg>
      )}
      {l >= 34 && <T x={880} y={462} size={54} color={K.g2} style={{opacity: eo(prog(l, 34, 6))}}>×</T>}
      {l >= 38 && <Type text="HARCODE" start={S + 38} cps={0.8} x={960} y={444} size={96} cursor="end" />}
      {l >= 50 && <Type text="from Harcorp Industries" start={S + 50} cps={1.6} x={966} y={560} size={28} color={K.g1} cursor="end" />}
    </>
  );
};

// ---------- 6. speak: voice -> code ----------
const Speak: React.FC<SceneProps> = ({S, vo}) => {
  const f = useCurrentFrame();
  const dev = vo.find((v) => v.spk === 'D');
  const after = vo[2];
  const transcript = voWords(dev, f);
  const codeAt = after ? after.at : S + 200;
  const rise = eio(prog(f, codeAt - 10, 16));
  const code = ['const delay = Math.min(', '  BASE_MS * 2 ** attempt,', '  30_000,', ')'];
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #06122a 0%, #000 60%)', opacity: 1 - rise * 0.6}} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-rise * 240}px)`, opacity: 1 - rise * 0.5}}>
        <GlowWave x0={120} x1={1800} y={420} level={(t) => 0.04 + voEnv(dev, t) * 1.1} amp={180} t={prog(f, S, 18)} />
        <div style={{position: 'absolute', left: 120, top: 600, width: 1680, fontFamily: MONO, fontSize: 40, lineHeight: 1.3, color: K.w}}>
          {transcript ? `“${transcript}${dev && f > dev.at + dev.dur ? '”' : ''}` : ''}
        </div>
      </div>
      {rise > 0 &&
        code.map((c, i) => {
          const at = codeAt + 8 + i * 10;
          if (f < at) return null;
          const n = Math.floor(c.length * clamp((f - at) / 8));
          const hl = eo(clamp((f - at - 6) / 8));
          return (
            <div key={i} style={{position: 'absolute', left: 420, top: 520 + i * 70, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 44}}>
              <span style={{color: K.g2, width: 80, fontSize: 28}}>{41 + i}</span>
              <span style={{background: `rgba(40,200,64,${0.88 * hl})`, color: hl > 0.5 ? '#050505' : K.w, padding: '2px 14px', whiteSpace: 'pre'}}>{c.slice(0, n)}</span>
              {n >= c.length && (
                <svg width={50} height={40} style={{marginLeft: 16}}>
                  <path d="M4 20l12 12L46 4" fill="none" stroke="#28c840" strokeWidth={6} strokeLinecap="round" strokeDasharray={`${70 * eo(clamp((f - at - 10) / 6))} 70`} />
                </svg>
              )}
            </div>
          );
        })}
    </>
  );
};

// ---------- 7. city: the codebase as a wireframe city ----------
type B = {x: number; z: number; w: number; d: number; h: number; label?: string; hot?: number};
const BLD: B[] = (() => {
  const out: B[] = [];
  let i = 0;
  for (let gx = -6; gx <= 6; gx++)
    for (let gz = -4; gz <= 5; gz++) {
      i++;
      if (hash(i * 3.1) < 0.42) continue;
      out.push({x: gx * 120, z: gz * 120, w: 60 + hash(i) * 40, d: 60 + hash(i + 1) * 40, h: 40 + Math.pow(hash(i + 2), 2) * 260});
    }
  return out;
})();
const LABELED: [number, string, number][] = [
  [8, 'routes/auth.ts', 0],
  [22, 'middleware/rateLimit.ts', 1],
  [37, 'lib/redis.ts', 2],
  [51, 'tests/auth.spec.ts', 3],
  [64, 'lib/db.ts', -1],
  [15, 'routes/users.ts', -1],
];
const City: React.FC<SceneProps> = ({S, D}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const yaw = lerp(-0.35, 0.2, eio(clamp(l / D)));
  const pitch = 0.62;
  const dist = lerp(2000, 1650, eio(clamp(l / D)));
  const grow = eo(clamp(l / 36));
  const proj = (x: number, y: number, z: number) => {
    const cx = Math.cos(yaw) * x - Math.sin(yaw) * z;
    const cz = Math.sin(yaw) * x + Math.cos(yaw) * z;
    const cy = y;
    const y2 = Math.cos(pitch) * cy - Math.sin(pitch) * cz;
    const z2 = Math.sin(pitch) * cy + Math.cos(pitch) * cz + dist;
    const s = 1100 / z2;
    return [960 + cx * s, 620 - y2 * s, z2] as const;
  };
  const lines: string[] = [];
  const hotLines: string[] = [];
  const pathIdx = LABELED.filter((p) => p[2] >= 0).sort((a, b) => a[2] - b[2]).map((p) => p[0]);
  const hotOn = (k: number) => l > 40 + k * 14;
  BLD.forEach((b, i) => {
    const h = b.h * grow * clamp(grow * 3 - (i % 7) * 0.15);
    const x0 = b.x - b.w / 2;
    const x1 = b.x + b.w / 2;
    const z0 = b.z - b.d / 2;
    const z1 = b.z + b.d / 2;
    const P = [
      proj(x0, 0, z0), proj(x1, 0, z0), proj(x1, 0, z1), proj(x0, 0, z1),
      proj(x0, h, z0), proj(x1, h, z0), proj(x1, h, z1), proj(x0, h, z1),
    ];
    const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const k = pathIdx.indexOf(i);
    const tgt = k >= 0 && hotOn(k) ? hotLines : lines;
    E.forEach(([a, c]) => tgt.push(`M${P[a][0].toFixed(1)} ${P[a][1].toFixed(1)}L${P[c][0].toFixed(1)} ${P[c][1].toFixed(1)}`));
  });
  // ground grid
  const grid: string[] = [];
  for (let g = -8; g <= 8; g++) {
    const a = proj(g * 120 - 60, 0, -600);
    const b = proj(g * 120 - 60, 0, 900);
    grid.push(`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`);
    const c = proj(-1000, 0, g * 120 - 60);
    const d = proj(1000, 0, g * 120 - 60);
    grid.push(`M${c[0]} ${c[1]}L${d[0]} ${d[1]}`);
  }
  // dependency path (dashed orange) between hot buildings, drawn progressively
  const pathPts = pathIdx.map((i) => proj(BLD[i].x, BLD[i].h * grow + 20, BLD[i].z));
  const pathD = pathPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const pathT = clamp((l - 40) / 50);
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={grid.join('')} stroke="rgba(255,255,255,0.08)" strokeWidth={1} fill="none" />
        <path d={lines.join('')} stroke="rgba(255,255,255,0.55)" strokeWidth={1} fill="none" />
        <path d={hotLines.join('')} stroke={K.orange} strokeWidth={2} fill="none" />
        <path d={pathD} stroke={K.orange} strokeWidth={2.5} fill="none" strokeDasharray="10 8" pathLength={1000} style={{strokeDashoffset: 0}} opacity={pathT > 0 ? 1 : 0} clipPath="url(#cp)" />
        <defs>
          <clipPath id="cp">
            <rect x={0} y={0} width={1920 * pathT + 1} height={1080} />
          </clipPath>
        </defs>
      </svg>
      {LABELED.map(([i, name, k], j) => {
        const b = BLD[i];
        if (!b) return null;
        const p = proj(b.x, b.h * grow, b.z);
        const on = k >= 0 ? hotOn(k) : l > 30;
        const o = eo(clamp((l - (k >= 0 ? 40 + k * 14 : 30 + j * 3)) / 8));
        return (
          <div key={name} style={{position: 'absolute', left: p[0], top: p[1] - 70, opacity: o}}>
            <div style={{position: 'absolute', left: 0, top: 24, width: 1.5, height: 46, background: on && k >= 0 ? K.orange : K.g2}} />
            <div style={{display: 'flex', gap: 8, alignItems: 'center', fontFamily: MONO, fontSize: 20, color: on && k >= 0 ? K.w : K.g1, transform: 'translateX(-10px)'}}>
              <span style={{display: 'inline-block', width: 12, height: 12, border: `2px solid ${on && k >= 0 ? K.orange : K.g2}`}} />
              {name}
            </div>
          </div>
        );
      })}
      <T x={64} y={110} size={22} color={K.g2} style={{opacity: eo(prog(l, 4, 10))}}>
        {`acme-api   ·   214 files   ·   38 dependencies`}
      </T>
      <T x={1856} y={110} size={22} color={K.orange} align="right" style={{opacity: eo(prog(l, 44, 10))}}>
        {`change path · 4 files`}
      </T>
    </>
  );
};

// ---------- 8. ship: terminal status run ----------
const Ship: React.FC<SceneProps> = ({S}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const rows: {t: {t: string; c?: string}[]; at: number}[] = [
    {t: [{t: '>'}, {t: 'harcode', c: K.green}, {t: '/write  middleware/rateLimit.ts'}], at: 4},
    {t: [{t: '>'}, {t: 'harcode', c: K.green}, {t: '/edit   routes/auth.ts   +3  −1'}], at: 22},
    {t: [{t: '>Tests: '}, {t: '14 / 14 passed', c: K.green}], at: 44},
    {t: [{t: '>Status: '}, {t: 'READY TO REVIEW', c: K.orange}], at: 64},
  ];
  const blocks = clamp((l - 72) / 18);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '64px 64px'}} />
      {rows.map((r, i) => (
        <Type key={i} text={r.t} start={S + r.at} cps={2.4} x={260} y={260 + i * 90} size={46} cursor="end" />
      ))}
      {blocks > 0 && (
        <>
          <HLine y={700} t={blocks} from={0} x0={0} x1={1920} />
          {Array.from({length: 14}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 40 + i * 132, top: 730, width: 112, height: 70, background: K.orange, opacity: i < Math.floor(blocks * 15) ? 1 : 0}} />
          ))}
          <HLine y={830} t={blocks} from={1920} x0={0} x1={1920} />
        </>
      )}
    </>
  );
};

// ---------- 9. alert: white card over dithered matter ----------
const Alert: React.FC<SceneProps> = ({S, D, vo}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const v = vo[0];
  const R = v ? v.at - S + Math.round(v.dur * 0.62) : 70;
  const isAlert = l < R;
  const glitch = l === 6 || l === 8 || l === 11;
  const blink = isAlert && Math.floor(l / 6) % 2 === 0;
  return (
    <>
      <DataField t={1} />
      {isAlert && <div style={{position: 'absolute', inset: 0, background: 'rgba(229,72,77,0.14)', opacity: blink ? 1 : 0.5}} />}
      <div style={{position: 'absolute', left: 620 + (glitch ? 16 : 0), top: 380, width: 680, padding: '36px 36px 30px', background: '#fff', opacity: eo(clamp(l / 6))}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 84, lineHeight: 1.0, color: isAlert ? '#D0312D' : '#0a0a0a', whiteSpace: 'pre'}}>{isAlert ? 'TEST\nFAILED' : 'FIXED'}</div>
        <div style={{fontFamily: SANS, fontSize: 20, color: isAlert ? '#D0312D' : '#1f9d3a', marginTop: 22, lineHeight: 1.35}}>
          {isAlert ? 'auth.spec.ts:42 — expected 429, received 200.' : 'HARCODE patched middleware/rateLimit.ts · 14 of 14 tests passing.'}
        </div>
      </div>
      <T x={1856} y={110} size={22} color={isAlert ? K.red : K.green} align="right">{isAlert ? '● alert' : '● resolved'}</T>
      <span style={{display: 'none'}}>{D}</span>
    </>
  );
};

// ---------- 10. less typing / more building ----------
const Less: React.FC<SceneProps> = ({S, vo}) => {
  const f = useCurrentFrame();
  const v = vo[0];
  const swap = v ? v.at + Math.round(v.dur * 0.48) : S + 40;
  const a = f < swap;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: a ? 420 : 300, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: a ? 150 : 110, color: a ? K.w : K.g2, letterSpacing: '-0.03em', opacity: eo(clamp((f - S) / 6))}}>Less typing.</div>
      {!a && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 170, color: K.w, letterSpacing: '-0.03em', opacity: eo(clamp((f - swap) / 5))}}>
          More <span style={{color: K.orange}}>building.</span>
        </div>
      )}
    </>
  );
};

export const Concept: React.FC = () => (
  <Film
    tl={TL_CONCEPT}
    dark={(id) => id === 'listen'}
    scenes={{cursor: Cursor, count: Count, race: Race, listen: Listen, meet: Meet, speak: Speak, city: City, ship: Ship, alert: Alert, less: Less, end: EndCard}}
  />
);
export const _c = {Fan};
