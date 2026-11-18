import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Film, SceneProps, TL, voEnv, voWords} from './film';
import {Lockup} from './Logo';
import {AsciiMark, BoxLine, Cam, Digits, Fan, GlowWave, HLine, K, MONO, SANS, Sea, T, Type, VLine} from './s2';
import tlj from './tl_demo.json';
import {clamp, eio, eo, hash, lerp, prog} from './theme';

export const TL_DEMO = tlj as unknown as TL;

// ---------- 1. title ----------
const Title: React.FC<SceneProps> = ({S, D}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const dotT = eo(prog(l, 0, 10));
  const collapse = eio(prog(l, D - 16, 10));
  const spread = lerp(170, 0, collapse) * dotT;
  const sy = lerp(90, 0, collapse) * dotT;
  return (
    <>
      {[-1, 1].map((sx) =>
        [-1, 1].map((s2) => <div key={`${sx}${s2}`} style={{position: 'absolute', left: 960 + sx * spread - 5, top: 520 + s2 * sy - 5, width: 10, height: 10, background: K.w, opacity: dotT * (1 - collapse)}} />),
      )}
      {collapse < 0.6 && <Type text="HARCODE" start={S + 8} cps={0.55} x={960} y={496} size={44} align="center" cursor="end" />}
      {l > 30 && collapse < 0.6 && <Type text="voice-first coding assistant" start={S + 30} cps={1.4} x={960} y={566} size={22} color={K.g1} align="center" cursor="end" />}
      {collapse > 0 && <div style={{position: 'absolute', left: 960 - lerp(10, 40, collapse), top: 516, width: lerp(20, 80, collapse), height: 8, background: K.w}} />}
    </>
  );
};

// ---------- 2. voice ----------
const Voice: React.FC<SceneProps> = ({S, vo}) => {
  const f = useCurrentFrame();
  const dev = vo.find((v) => v.spk === 'D');
  const level = (t: number) => 0.04 + voEnv(dev, t) * 1.1;
  const transcript = voWords(dev, f);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #06122a 0%, #000 62%)', opacity: eo(prog(f, S, 20))}} />
      <GlowWave x0={120} x1={1800} y={470} level={level} amp={200} t={prog(f, S, 20)} />
      <Type text={dev && f >= dev.at ? 'listening.' : 'ready.'} start={S + 10} cps={0.8} x={120} y={250} size={28} color={dev && f >= dev.at ? K.blueSoft : K.g1} cursor="end" />
      <div style={{position: 'absolute', left: 120, top: 700, width: 1680, fontFamily: MONO, fontSize: 44, lineHeight: 1.3, color: K.w}}>
        {transcript && <span style={{color: K.blueSoft}}>“</span>}
        {transcript}
        {dev && f > dev.at + dev.dur && <span style={{color: K.blueSoft}}>”</span>}
      </div>
    </>
  );
};

// ---------- 3. files ----------
const Files: React.FC<SceneProps> = ({S}) => {
  const f = useCurrentFrame();
  const ox = 760;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, #06122a 0%, #000 55%)'}} />
      <GlowWave x0={0} x1={ox} y={540} level={() => 0.05} amp={40} t={1} />
      <Fan
        ox={ox}
        oy={540}
        targets={[
          {x: 1260, y: 230, label: 'routes/auth.ts', sub: 'POST /login', at: S + 4, hot: true},
          {x: 1340, y: 380, label: 'middleware/rateLimit.ts', sub: 'new file', at: S + 9, hot: true},
          {x: 1370, y: 540, label: 'lib/redis.ts', sub: 'stores the counts', at: S + 14, hot: true},
          {x: 1330, y: 700, label: 'tests/auth.spec.ts', sub: '14 tests', at: S + 19, hot: true},
          {x: 1250, y: 850, label: 'package.json', sub: 'unchanged', at: S + 24},
        ]}
      />
      <T x={120} y={250} size={28} color={K.g1} style={{opacity: eo(prog(f, S + 10, 8))}}>
        {`4 files touched`}
      </T>
    </>
  );
};

// ---------- 4. read ----------
const Read: React.FC<SceneProps> = ({S}) => {
  const f = useCurrentFrame();
  const pan = eio(prog(f, S + 40, 14));
  const files = Math.round(214 * eo(prog(f, S + 4, 26)));
  return (
    <Cam x={lerp(0, 480, pan)} y={lerp(0, 320, pan)}>
      <HLine y={560} t={prog(f, S, 10)} from={1320} x0={-200} x1={2600} />
      <VLine x={1320} t={prog(f, S + 2, 10)} from={560} y0={-200} y1={1800} />
      <BoxLine x={720} y={410} w={600} h={150} t={prog(f, S + 4, 10)} />
      <T x={760} y={445} size={76}>{`${files} files`}</T>
      <T x={760} y={592} size={24} color={K.g1} style={{opacity: eo(prog(f, S + 20, 8))}}>
        read in 0.8 s
      </T>
      <HLine y={880} t={prog(f, S + 36, 12)} from={1320} x0={-200} x1={2800} />
      <VLine x={1860} t={prog(f, S + 40, 12)} from={880} y0={500} y1={1800} />
      <BoxLine x={1320} y={880} w={900} h={250} t={prog(f, S + 42, 12)} />
      <Type text={'3 changes\nplanned'} start={S + 52} cps={1.4} x={1370} y={930} size={66} cursor="end" lh={1.05} />
      <Digits x={1900} y={560} cols={6} rows={6} size={22} t={eo(prog(f, S + 44, 20))} seed={5} />
    </Cam>
  );
};

// ---------- 5. editor ----------
type CL = {t: string; at?: number; kind?: 'ok' | 'bad' | 'ctx'};
const Editor: React.FC<SceneProps> = ({S, vo}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const dev = vo.find((v) => v.spk === 'D');
  const CODE: CL[] = [
    {t: "import { Router } from 'express'", kind: 'ctx'},
    {t: "import { login } from '../controllers/auth'", kind: 'ctx'},
    {t: "import { rateLimit } from '../middleware/rateLimit'", at: S + 14, kind: 'ok'},
    {t: '', kind: 'ctx'},
    {t: 'const router = Router()', kind: 'ctx'},
    {t: "const loginLimiter = rateLimit({ window: '1m', max: 5 })", at: S + 30, kind: 'ok'},
    {t: '', kind: 'ctx'},
    {t: "router.post('/login', login)", at: S + 46, kind: 'bad'},
    {t: "router.post('/login', loginLimiter, login)", at: S + 62, kind: 'ok'},
    {t: '', kind: 'ctx'},
    {t: 'export default router', kind: 'ctx'},
  ];
  const win = eo(prog(l, 0, 12));
  const zoom = lerp(1.0, 1.05, eio(prog(l, 0, 180)));
  const removeAt = S + 84;
  const transcript = voWords(dev, f);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`}}>
        <Sea />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.6))'}} />
      <div style={{position: 'absolute', left: 300, top: 120 + (1 - win) * 50, width: 1320, height: 690, opacity: win, background: 'rgba(14,16,18,0.94)', borderRadius: 14, boxShadow: '0 40px 120px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', transform: `scale(${zoom})`}}>
        <div style={{height: 46, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,0.07)'}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
          ))}
          <div style={{marginLeft: 'auto', fontFamily: MONO, fontSize: 16, color: K.g2}}>routes/auth.ts — acme-api</div>
        </div>
        <div style={{padding: '20px 0'}}>
          {CODE.map((c, i) => {
            if (c.at !== undefined && f < c.at) return <div key={i} style={{height: 46}} />;
            if (c.kind === 'bad' && f >= removeAt + 6) return null;
            const tt = c.at !== undefined ? clamp((f - c.at) / Math.max(8, c.t.length * 0.4)) : 1;
            const n = Math.floor(c.t.length * tt);
            const hl = c.kind === 'ok' ? eo(clamp((f - (c.at ?? 0) - 6) / 8)) : c.kind === 'bad' ? 1 - clamp((f - removeAt) / 6) : 0;
            const bg = c.kind === 'ok' ? `rgba(40,200,64,${0.85 * hl})` : c.kind === 'bad' ? `rgba(229,72,77,${0.85 * hl})` : 'transparent';
            return (
              <div key={i} style={{height: 46, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 26}}>
                <span style={{width: 70, textAlign: 'right', paddingRight: 26, color: K.g2, fontSize: 19}}>{i + 1}</span>
                <span style={{background: bg, padding: '2px 10px', color: c.kind === 'ctx' ? '#c8d0d8' : '#0b0b0b', whiteSpace: 'pre'}}>
                  {c.t.slice(0, n)}
                  {tt < 1 && <span style={{display: 'inline-block', width: 13, height: 26, background: '#fff', verticalAlign: 'middle'}} />}
                </span>
                {c.kind === 'ok' && tt >= 1 && (
                  <svg width={40} height={30} style={{marginLeft: 14}}>
                    <path d="M4 15l9 9L36 3" fill="none" stroke="#28c840" strokeWidth={5} strokeDasharray={`${60 * eo(clamp((f - (c.at ?? 0) - 10) / 6))} 60`} strokeLinecap="round" />
                  </svg>
                )}
                {c.kind === 'bad' && <span style={{marginLeft: 16, color: K.red, fontFamily: SANS, fontSize: 30, fontWeight: 700}}>✕</span>}
              </div>
            );
          })}
        </div>
      </div>
      {dev && f >= dev.at - 6 && (
        <div style={{position: 'absolute', left: 300, top: 850, display: 'flex', alignItems: 'center', gap: 24}}>
          <svg width={300} height={60}>
            {Array.from({length: 30}).map((_, i) => {
              const lv = voEnv(dev, f - (30 - i) * 0.4) * (0.6 + 0.4 * hash(i + Math.floor(f / 2)));
              const hh = 3 + lv * 50;
              return <rect key={i} x={i * 10} y={30 - hh / 2} width={5} height={hh} rx={2.5} fill={K.blue} />;
            })}
          </svg>
          <div style={{fontFamily: MONO, fontSize: 34, color: K.w}}>{transcript ? `“${transcript}${f > dev.at + dev.dur ? '”' : ''}` : ''}</div>
        </div>
      )}
    </>
  );
};

// ---------- 6. tests ----------
const TESTS: [string, number][] = [
  ['login: allows 5 attempts', 64],
  ['login: 6th attempt → 429', 66],
  ['login: resets after 60 s', 175],
  ['login: per-IP buckets', 420],
  ['session: unaffected', 344],
];
const Tests: React.FC<SceneProps> = ({S}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const blocks = prog(l, 44, 16);
  return (
    <>
      <div style={{position: 'absolute', left: 260, top: 250, width: 1400}}>
        {TESTS.map(([name, v], i) => {
          const fill = clamp((l - 4 - i * 3) / 22);
          const segs = 40;
          const done = fill >= 1;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', height: 74, opacity: eo(clamp((l - i * 2) / 8)), borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
              <span style={{fontFamily: MONO, fontSize: 26, color: K.g2, width: 70}}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{fontFamily: MONO, fontSize: 32, color: done ? K.green : K.g2, width: 50}}>{done ? '✓' : '·'}</span>
              <span style={{fontFamily: MONO, fontSize: 32, color: K.w, width: 620}}>{name}</span>
              <span style={{fontFamily: MONO, fontSize: 18, color: K.g1, width: 80}}>{`${Math.round(v * fill)}ms`}</span>
              <div style={{display: 'flex', gap: 4}}>
                {Array.from({length: segs}).map((_, k) => (
                  <div key={k} style={{width: 11, height: 20, background: k < Math.floor(segs * eio(fill)) ? (done ? K.w : K.orange) : 'rgba(255,255,255,0.12)'}} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {blocks > 0 && (
        <>
          <HLine y={700} t={blocks} from={0} x0={0} x1={1920} />
          {Array.from({length: 14}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 40 + i * 132, top: 730, width: 112, height: 70, background: K.orange, opacity: i < Math.floor(blocks * 15) ? 1 : 0}} />
          ))}
          <HLine y={830} t={blocks} from={1920} x0={0} x1={1920} />
        </>
      )}
      {l >= 62 && <Type text={[{t: '14 passed', c: K.w}, {t: '  ·  ', c: K.g2}, {t: '0 failed', c: K.green}]} start={S + 62} cps={2} x={960} y={140} size={56} align="center" cursor="end" />}
    </>
  );
};

// ---------- 7. end ----------
export const EndCard: React.FC<SceneProps & {tag?: string}> = ({S, tag = 'Talk to your terminal.'}) => {
  const f = useCurrentFrame();
  const l = f - S;
  const asc = prog(l, 0, 18);
  const solid = eo(prog(l, 16, 8));
  const move = eio(prog(l, 24, 12));
  const markY = lerp(540, 300, move);
  const markS = lerp(420, 220, move);
  return (
    <>
      {solid < 1 && <AsciiMark cx={960} cy={540} size={420} t={asc} solid={solid} />}
      {solid > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: solid}}>
          <g transform={`translate(${960 - (markS / 900) * 497} ${markY - (markS / 900) * 450}) scale(${markS / 900})`}>
            <Lockup id={`end${S}`} letters={[0, 0, 0, 0, 0, 0, 0]} industries={0} />
          </g>
        </svg>
      )}
      {l >= 30 && <Type text="HARCODE" start={S + 30} cps={0.8} x={960} y={470} size={120} align="center" cursor="end" />}
      {l >= 40 && <Type text={tag} start={S + 40} cps={1.6} x={960} y={630} size={34} color={K.g1} align="center" cursor="end" />}
      {l >= 48 && (
        <div style={{position: 'absolute', left: 960 - 160, top: 840, opacity: eo(prog(l, 48, 8))}}>
          <svg width={320} height={70}>
            <g transform={`scale(${320 / 4160})`}>
              <Lockup id={`endl${S}`} />
            </g>
          </svg>
        </div>
      )}
    </>
  );
};

export const Demo3: React.FC = () => <Film tl={TL_DEMO} scenes={{title: Title, voice: Voice, files: Files, read: Read, editor: Editor, tests: Tests, end: EndCard}} />;
