import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {voLevel} from './components';
import {Grain} from './fui';
import {Lockup} from './Logo';
import {AsciiMark, BoxLine, Cam, Digits, Fan, GlowWave, HLine, K, MONO, SANS, Sea, T, Type, VLine, Watermark} from './s2';
import vo from './vo.json';
import {clamp, eio, eo, ex, hash, lerp, prog} from './theme';

// HARCODE launch film — 15s, reference style.
export const H2 = {
  len: 450,
  s2: 44, // voice
  vo1: 64,
  s3: 152, // reads codebase (boxes)
  s4: 218, // editor
  vo2: 280,
  s5: 336, // tests
  s6: 392, // logo / end
};
const Q = H2;

const words = (key: 'l1' | 'l2', start: number, f: number) =>
  ((vo as any)[key].words as {w: string; at: number}[])
    .filter((w) => f >= start + w.at)
    .map((w) => w.w)
    .join(' ');

const Chapter: React.FC<{n: string; text: string; start: number; end: number; dark?: boolean}> = ({n, text, start, end, dark}) => {
  const f = useCurrentFrame();
  if (f < start || f >= end) return null;
  return <Type text={[{t: `${n}  `, c: K.orange}, {t: text, c: dark ? '#111' : K.w}]} start={start + 2} cps={1.6} x={64} y={972} size={28} cursor="end" />;
};

// ---------------- scenes ----------------
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const collapse = eio(prog(f, 32, 10));
  const dotT = eo(prog(f, 2, 8));
  const spread = lerp(150, 0, collapse) * dotT;
  const sy = lerp(80, 0, collapse) * dotT;
  return (
    <>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sy2) => (
          <div key={`${sx}${sy2}`} style={{position: 'absolute', left: 960 + sx * spread - 5, top: 540 + sy2 * sy - 5, width: 10, height: 10, background: K.w, opacity: dotT * (1 - collapse)}} />
        )),
      )}
      {collapse < 0.5 && <Type text="HARCODE" start={6} cps={0.7} x={960} y={520} size={36} align="center" cursor="end" />}
      {collapse > 0 && <div style={{position: 'absolute', left: 960 - lerp(10, 40, collapse), top: 536, width: lerp(20, 80, collapse), height: 8, background: K.w}} />}
    </>
  );
};

const S2: React.FC = () => {
  const f = useCurrentFrame();
  const level = (t: number) => voLevel('l1', t - Q.vo1) * 1.1 + 0.03;
  const lineT = prog(f, Q.s2, 14);
  const split = Q.vo1 + 50;
  const ox = 1080;
  const transcript = words('l1', Q.vo1, f);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 50%, #06122a 0%, #000 60%)', opacity: eo(prog(f, Q.s2, 20))}} />
      <GlowWave x0={0} x1={ox} y={540} level={level} amp={190} t={lineT} />
      <Fan
        ox={ox}
        oy={540}
        targets={[
          {x: 1500, y: 250, label: 'routes/auth.ts', sub: 'POST /login', at: split, hot: true},
          {x: 1560, y: 400, label: 'middleware/rateLimit.ts', sub: 'new file', at: split + 6, hot: true},
          {x: 1580, y: 560, label: 'lib/redis.ts', sub: 'store', at: split + 12, hot: true},
          {x: 1540, y: 720, label: 'tests/auth.spec.ts', sub: '14 tests', at: split + 18},
          {x: 1460, y: 860, label: 'package.json', at: split + 24},
        ]}
      />
      <div style={{position: 'absolute', left: 120, top: 760, width: 900, fontFamily: MONO, fontSize: 34, lineHeight: 1.35, color: K.w}}>
        {transcript && <span style={{color: K.blueSoft}}>“</span>}
        {transcript}
        {transcript && f > Q.vo1 + 96 && <span style={{color: K.blueSoft}}>”</span>}
      </div>
      <Type text="listening." start={Q.s2 + 8} cps={0.8} x={120} y={300} size={26} color={K.g1} cursor="end" />
    </>
  );
};

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const l = f - Q.s3;
  // camera pans from box A to box B
  const pan = eio(prog(f, Q.s3 + 34, 14));
  const camX = lerp(0, 520, pan);
  const camY = lerp(0, 330, pan);
  const files = Math.round(214 * eo(prog(f, Q.s3 + 6, 22)));
  return (
    <Cam x={camX} y={camY}>
      <HLine y={560} t={prog(f, Q.s3, 10)} from={1320} x0={-200} x1={2600} />
      <VLine x={1320} t={prog(f, Q.s3 + 2, 10)} from={560} y0={-200} y1={1800} />
      <VLine x={760} t={prog(f, Q.s3 + 4, 10)} from={560} y0={430} y1={1800} color={K.g2} />
      <BoxLine x={760} y={420} w={560} h={140} t={prog(f, Q.s3 + 4, 10)} />
      <T x={800} y={455} size={72}>
        {`${files} files`}
      </T>
      <T x={800} y={590} size={22} color={K.g1} style={{opacity: eo(prog(f, Q.s3 + 18, 8))}}>
        read in 0.8 s
      </T>
      {/* box B (revealed by pan) */}
      <HLine y={890} t={prog(f, Q.s3 + 30, 12)} from={1320} x0={-200} x1={2800} />
      <VLine x={1840} t={prog(f, Q.s3 + 34, 12)} from={890} y0={500} y1={1800} />
      <BoxLine x={1320} y={890} w={900} h={260} t={prog(f, Q.s3 + 36, 12)} />
      <Type text={'3 changes\nplanned'} start={Q.s3 + 44} cps={1.2} x={1370} y={950} size={64} cursor="end" lh={1.05} />
      <Digits x={1880} y={560} cols={6} rows={6} size={22} t={eo(prog(f, Q.s3 + 40, 20))} seed={l > 0 ? 5 : 5} boxed />
    </Cam>
  );
};

type CL = {t: string; at?: number; kind?: 'ok' | 'bad' | 'ctx'; ind?: number};
const CODE: CL[] = [
  {t: "import { Router } from 'express'", kind: 'ctx'},
  {t: "import { login } from '../controllers/auth'", kind: 'ctx'},
  {t: "import { rateLimit } from '../middleware/rateLimit'", at: Q.s4 + 10, kind: 'ok'},
  {t: '', kind: 'ctx'},
  {t: 'const router = Router()', kind: 'ctx'},
  {t: "const loginLimiter = rateLimit({ window: '1m', max: 5 })", at: Q.s4 + 22, kind: 'ok'},
  {t: '', kind: 'ctx'},
  {t: "router.post('/login', login)", at: Q.s4 + 34, kind: 'bad'},
  {t: "router.post('/login', loginLimiter, login)", at: Q.s4 + 48, kind: 'ok'},
  {t: '', kind: 'ctx'},
  {t: 'export default router', kind: 'ctx'},
];

const S4: React.FC = () => {
  const f = useCurrentFrame();
  const win = eo(prog(f, Q.s4, 14));
  const zoom = lerp(1.0, 1.06, eio(prog(f, Q.s4, 118)));
  const x = 300;
  const y = 170;
  const w = 1320;
  const h = 700;
  const transcript = words('l2', Q.vo2, f);
  const badGone = f >= Q.s4 + 62;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`}}>
        <Sea />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.55))'}} />
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y + (1 - win) * 60,
          width: w,
          height: h,
          opacity: win,
          background: 'rgba(14,16,18,0.92)',
          borderRadius: 14,
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          transform: `scale(${zoom})`,
          transformOrigin: '50% 50%',
        }}
      >
        <div style={{height: 46, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,0.07)'}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
          ))}
          <div style={{marginLeft: 24, fontFamily: SANS, fontSize: 16, color: K.g1, display: 'flex', gap: 22}}>
            {['File', 'Edit', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <div style={{marginLeft: 'auto', fontFamily: MONO, fontSize: 15, color: K.g2}}>routes/auth.ts — acme-api</div>
        </div>
        <div style={{padding: '22px 0'}}>
          {CODE.map((c, i) => {
            if (c.at !== undefined && f < c.at) return <div key={i} style={{height: 44}} />;
            if (c.kind === 'bad' && badGone) {
              const k = clamp((f - (Q.s4 + 62)) / 6);
              if (k >= 1) return null;
            }
            const tt = c.at !== undefined ? clamp((f - c.at) / Math.max(6, c.t.length * 0.35)) : 1;
            const n = Math.floor(c.t.length * tt);
            const hl = c.kind === 'ok' ? eo(clamp((f - (c.at ?? 0) - 4) / 8)) : c.kind === 'bad' ? 1 : 0;
            const bg = c.kind === 'ok' ? `rgba(40,200,64,${0.85 * hl})` : c.kind === 'bad' ? 'rgba(229,72,77,0.85)' : 'transparent';
            const lineNo = i + 1;
            return (
              <div key={i} style={{height: 44, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 25}}>
                <span style={{width: 70, textAlign: 'right', paddingRight: 26, color: K.g2, fontSize: 19}}>{lineNo}</span>
                <span style={{background: bg, padding: '2px 10px', color: c.kind === 'ctx' ? '#c8d0d8' : '#0b0b0b', whiteSpace: 'pre'}}>
                  {colorize(c.t.slice(0, n), c.kind !== 'ctx')}
                  {tt < 1 && <span style={{display: 'inline-block', width: 13, height: 26, background: '#fff', verticalAlign: 'middle'}} />}
                </span>
                {c.kind === 'ok' && tt >= 1 && <Check t={clamp((f - (c.at ?? 0) - 6) / 6)} />}
                {c.kind === 'bad' && (
                  <span style={{marginLeft: 16, color: K.red, fontFamily: SANS, fontSize: 30, fontWeight: 700}}>
                    ✕<span style={{fontFamily: MONO, fontSize: 16, color: K.g1, marginLeft: 16, fontWeight: 400}}>replacing…</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* dev voice reply */}
      {f >= Q.vo2 - 4 && (
        <div style={{position: 'absolute', left: 300, top: 900, width: 1320, display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{width: 300, height: 60, position: 'relative'}}>
            <svg width={300} height={60}>
              {Array.from({length: 30}).map((_, i) => {
                const lv = voLevel('l2', f - Q.vo2 - (30 - i) * 0.4) * (0.6 + 0.4 * hash(i + Math.floor(f / 2)));
                const hh = 3 + lv * 50;
                return <rect key={i} x={i * 10} y={30 - hh / 2} width={5} height={hh} rx={2.5} fill={K.blue} />;
              })}
            </svg>
          </div>
          <div style={{fontFamily: MONO, fontSize: 32, color: K.w}}>{transcript ? `“${transcript}${f > Q.vo2 + 42 ? '”' : ''}` : ''}</div>
        </div>
      )}
    </>
  );
};
const colorize = (s: string, onHL: boolean) => {
  if (onHL) return s;
  // light syntax tint for context lines
  return s.split(/('.*?'|\bimport\b|\bfrom\b|\bconst\b|\bexport\b|\bdefault\b)/).map((p, i) => (
    <span key={i} style={{color: /^'/.test(p) ? '#e6c07b' : /^(import|from|const|export|default)$/.test(p) ? '#c792ea' : undefined}}>
      {p}
    </span>
  ));
};
const Check: React.FC<{t: number}> = ({t}) => (
  <svg width={40} height={30} style={{marginLeft: 14}}>
    <path d="M4 15l9 9L36 3" fill="none" stroke="#28c840" strokeWidth={5} strokeDasharray={`${60 * eo(t)} 60`} strokeLinecap="round" />
  </svg>
);

const TESTS = [
  ['login: allows 5 attempts', 64],
  ['login: 6th attempt → 429', 66],
  ['login: resets after 60s', 175],
  ['login: per-IP buckets', 420],
  ['session: unaffected', 344],
  ['users: unaffected', 136],
  ['billing: unaffected', 53],
];
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const l = f - Q.s5;
  const scroll = lerp(0, 1, eio(prog(f, Q.s5 + 4, 26)));
  const focus = 3;
  const blocks = prog(f, Q.s5 + 34, 16);
  const blocksOut = prog(f, Q.s5 + 50, 6);
  return (
    <>
      <div style={{position: 'absolute', left: 260, top: 300 - scroll * 120 + 120, width: 1400}}>
        {TESTS.map(([name, v], i) => {
          const d = Math.abs(i - focus);
          const op = i === focus ? 1 : Math.max(0.18, 0.75 - d * 0.18);
          const fill = clamp((l - 6 - i * 2) / 18);
          const isF = i === focus;
          const segs = 40;
          const on = Math.floor(segs * fill * ((v as number) / 420) * 0.6 + segs * fill * 0.4);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 64,
                opacity: op * eo(clamp((l - i * 1.5) / 8)),
                border: isF && l > 20 ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
                paddingLeft: 16,
                transform: `translateX(${isF ? 0 : d * 18}px)`,
              }}
            >
              <span style={{fontFamily: MONO, fontSize: 26, color: K.g2, width: 70}}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{fontFamily: MONO, fontSize: 30, color: K.green, width: 40}}>✓</span>
              <span style={{fontFamily: MONO, fontSize: 30, color: K.w, width: 600}}>{name as string}</span>
              <span style={{fontFamily: MONO, fontSize: 16, color: K.g1, width: 60}}>{`${Math.round((v as number) * fill)}ms`}</span>
              <div style={{display: 'flex', gap: 4}}>
                {Array.from({length: segs}).map((_, k) => (
                  <div key={k} style={{width: 11, height: 20, background: k < on ? (isF && l > 24 ? K.orange : K.w) : 'rgba(255,255,255,0.12)'}} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* orange blocks sweep */}
      {blocks > 0 && blocksOut < 1 && (
        <>
          <HLine y={470} t={blocks} from={0} x0={0} x1={1920} />
          <HLine y={610} t={blocks} from={1920} x0={0} x1={1920} />
          <div style={{position: 'absolute', left: 0, top: 470, width: 1920, height: 140, background: '#000', opacity: clamp(blocks * 3)}} />
          {Array.from({length: 14}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 40 + i * 132, top: 500, width: 112, height: 80, background: K.orange, opacity: i < Math.floor(blocks * 15) ? 1 - blocksOut : 0}} />
          ))}
        </>
      )}
      {f >= Q.s5 + 50 && <Type text={[{t: '14 passed', c: K.w}, {t: '  ·  ', c: K.g2}, {t: '0 failed', c: K.green}]} start={Q.s5 + 52} cps={2} x={960} y={500} size={64} align="center" cursor="end" />}
    </>
  );
};

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const l = f - Q.s6;
  const asc = prog(f, Q.s6, 18);
  const solid = eo(prog(f, Q.s6 + 18, 8));
  const move = eio(prog(f, Q.s6 + 24, 12));
  const markX = lerp(960, 960, move);
  const markY = lerp(540, 300, move);
  const markS = lerp(420, 220, move);
  return (
    <>
      {solid < 1 && <AsciiMark cx={960} cy={540} size={420} t={asc} solid={solid} />}
      {solid > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: solid}}>
          <g transform={`translate(${markX - (markS / 900) * 497} ${markY - (markS / 900) * 450}) scale(${markS / 900})`}>
            <Lockup id="h2m" letters={[0, 0, 0, 0, 0, 0, 0]} industries={0} />
          </g>
        </svg>
      )}
      {l >= 30 && <Type text="HARCODE" start={Q.s6 + 30} cps={0.8} x={960} y={470} size={120} align="center" cursor="end" />}
      {l >= 38 && <Type text="Talk to your terminal." start={Q.s6 + 38} cps={1.6} x={960} y={630} size={34} color={K.g1} align="center" cursor="end" />}
      {l >= 44 && (
        <div style={{position: 'absolute', left: 960 - 160, top: 880, opacity: eo(prog(f, Q.s6 + 44, 8))}}>
          <svg width={320} height={70}>
            <g transform={`scale(${320 / 4160})`}>
              <Lockup id="h2l" />
            </g>
          </svg>
        </div>
      )}
    </>
  );
};

export const Harcode2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      {f < Q.s2 + 2 && <S1 />}
      {f >= Q.s2 && f < Q.s3 && <S2 />}
      {f >= Q.s3 && f < Q.s4 && <S3 />}
      {f >= Q.s4 && f < Q.s5 && <S4 />}
      {f >= Q.s5 && f < Q.s6 && <S5 />}
      {f >= Q.s6 && <S6 />}
      <Watermark />
      <Chapter n="01" text="Say what you want." start={Q.s2} end={Q.s3} />
      <Chapter n="02" text="It reads your codebase." start={Q.s3} end={Q.s4} />
      <Chapter n="03" text="It writes the code. You review." start={Q.s4} end={Q.s5} />
      <Chapter n="04" text="It runs the tests." start={Q.s5} end={Q.s6} />
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
};
export const _h2 = {ex};
