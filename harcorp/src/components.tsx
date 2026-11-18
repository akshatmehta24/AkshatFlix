import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Brackets, DrawRect, Panel, Ruler, Scr, Txt} from './fui';
import vo from './vo.json';
import {C, F, clamp, eio, eo, ex, hash, lerp, noise1, pad, prog} from './theme';

// Every component: placed at (x,y) in a native-size box, with
//   inAt  = build-on start frame, outAt = build-off start frame.
// Build-on ~16-24f, idle loop between, build-off ~12-16f.

type Base = {x: number; y: number; inAt: number; outAt?: number; scale?: number; f?: number};

const Box: React.FC<{x: number; y: number; scale?: number; w: number; h: number; children: React.ReactNode}> = ({x, y, scale = 1, w, h, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>{children}</div>
  </div>
);

// ---------- voice level sources ----------
export const voLevel = (key: 'l1' | 'l2', localFrame: number) => {
  const e = (vo as any)[key].env as number[];
  const i = Math.floor(localFrame);
  if (i < 0 || i >= e.length) return 0;
  const fr = localFrame - i;
  return lerp(e[i], e[Math.min(e.length - 1, i + 1)], fr);
};
export type LevelFn = (f: number) => number;
export const synthLevel: LevelFn = (f) => {
  // speech-like syllables with pauses (for the component reel)
  const word = noise1(f / 7, 3);
  const syll = 0.5 + 0.5 * Math.sin(f * 1.3 + noise1(f / 3, 9) * 4);
  const gate = noise1(f / 22, 5) > 0.32 ? 1 : 0.08;
  return clamp(gate * (0.25 + 0.75 * word) * (0.4 + 0.6 * syll));
};

// =====================================================================
// C-01 VOICE WAVEFORM
// =====================================================================
export const VoiceWave: React.FC<Base & {level: LevelFn; w?: number; h?: number; label?: string}> = ({
  x,
  y,
  inAt,
  outAt = 1e9,
  scale = 1,
  level,
  w = 1000,
  h = 300,
  label = 'VOICE INPUT // MIC-01',
}) => {
  const f = useCurrentFrame();
  const tin = eo(prog(f, inAt + 6, 18));
  const tout = eio(prog(f, outAt, 14));
  const N = 100;
  const gx = 150;
  const gw = w - gx - 30;
  const mid = h / 2 + 10;
  const barW = gw / N;
  const now = level(f);
  const speaking = now > 0.12 && tin > 0.9 && tout === 0;
  const bars: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const age = N - 1 - i; // 0 = newest (right)
    const lv = level(f - age * 0.55) * (0.75 + 0.5 * hash(i + Math.floor((f - age * 0.55) * 2) * 0.13));
    const vis = clamp(tin * N * 1.2 - (N - i) * 0.2 >= 0 ? 1 : 0) * (1 - clamp(tout * 1.6 - (i / N) * 0.6));
    const hh = Math.max(1, lv * (h * 0.36)) * vis;
    if (vis <= 0) continue;
    const recent = age < 14 && lv > 0.12;
    bars.push(
      <rect
        key={i}
        x={gx + i * barW + 1}
        y={mid - hh}
        width={Math.max(1, barW - 3)}
        height={hh * 2}
        fill={recent && speaking ? C.accent : C.ink}
        opacity={recent ? 1 : 0.35 + 0.65 * (i / N)}
      />,
    );
  }
  const db = now > 0.01 ? -60 + 48 * Math.sqrt(now) : -60;
  return (
    <Box x={x} y={y} scale={scale} w={w} h={h}>
      <Panel x={0} y={0} w={w} h={h} f={f} inAt={inAt} outAt={outAt} title={label} id="C-01" active={speaking} />
      <svg width={w} height={h} style={{position: 'absolute', opacity: 1 - tout}}>
        <line x1={gx} x2={gx + gw * tin} y1={mid} y2={mid} stroke={C.hair} shapeRendering="crispEdges" />
        <line x1={gx} x2={gx + gw * tin} y1={mid - h * 0.36} y2={mid - h * 0.36} stroke={C.ghost} strokeDasharray="2 4" />
        <line x1={gx} x2={gx + gw * tin} y1={mid + h * 0.36} y2={mid + h * 0.36} stroke={C.ghost} strokeDasharray="2 4" />
        {bars}
        {/* playhead */}
        <line x1={gx + gw - 1} x2={gx + gw - 1} y1={44} y2={h - 30} stroke={speaking ? C.accent : C.faint} opacity={tin} />
        <Ruler x={gx} y={h - 18} w={gw * tin} step={barW * 2} major={5} offset={(f * barW * 2) / 1.1} down color={C.faint} />
        {/* vertical level meter */}
        <rect x={24} y={56} width={10} height={h - 100} fill="none" stroke={C.faint} opacity={tin} />
        <rect x={26} y={56 + (h - 100) * (1 - now)} width={6} height={(h - 100) * now * tin} fill={speaking ? C.accent : C.ink} />
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - tout}}>
        <Scr text="LEVEL" start={inAt + 8} dur={8} x={48} y={58} size={11} color={C.dim} />
        <Txt x={48} y={76} size={22} color={C.ink} style={{opacity: tin}}>
          {`${db.toFixed(1)}`}
        </Txt>
        <Scr text="DBFS" start={inAt + 10} dur={8} x={48} y={104} size={11} color={C.faint} />
        <Scr text="48KHZ/24B" start={inAt + 12} dur={8} x={48} y={h - 92} size={11} color={C.faint} />
        <Txt x={48} y={h - 70} size={11} color={speaking ? C.accent : C.dim} style={{opacity: tin}}>
          {speaking ? 'VAD ■ SPEECH' : 'VAD □ ——'}
        </Txt>
        <Txt x={48} y={h - 50} size={11} color={C.faint} style={{opacity: tin}}>
          {`T ${pad(Math.max(0, f - inAt) / 30, 2, 2)}`}
        </Txt>
      </div>
    </Box>
  );
};

// =====================================================================
// C-02 LISTENING / THINKING STATES
// =====================================================================
export type St = 'idle' | 'listen' | 'think' | 'done';
export const StateCore: React.FC<Base & {states: [number, St][]; level: LevelFn; w?: number; h?: number; compact?: boolean}> = ({
  x,
  y,
  inAt,
  outAt = 1e9,
  scale = 1,
  states,
  level,
  w = 560,
  h = 560,
  compact = false,
}) => {
  const f = useCurrentFrame();
  const tin = eo(prog(f, inAt + 4, 20));
  const tout = eio(prog(f, outAt, 14));
  const t = tin * (1 - tout);
  // current & previous state with crossfade
  let cur: St = 'idle';
  let since = 0;
  let prev: St = 'idle';
  for (const [fr, s] of states) {
    if (f >= fr) {
      prev = cur;
      cur = s;
      since = fr;
    }
  }
  const mixT = eo(prog(f, since, 8));
  const wOf = (s: St) => (cur === s ? mixT : prev === s ? 1 - mixT : 0);
  const wi = wOf('idle');
  const wl = wOf('listen');
  const wt = wOf('think');
  const wd = wOf('done');
  const cx = w / 2;
  const cy = compact ? h / 2 + 6 : h / 2 - 10;
  const R = Math.min(w, h) * (compact ? 0.3 : 0.27);
  const lv = level(f);
  const pct = Math.round(100 * clamp((f - (states.find((s) => s[1] === 'think')?.[0] ?? 0)) / 60));
  const els: React.ReactNode[] = [];
  // build-on: base ring
  const circ = 2 * Math.PI * R;
  els.push(<circle key="base" cx={cx} cy={cy} r={R} fill="none" stroke={C.faint} strokeWidth={1} strokeDasharray={`${circ * t} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />);
  // idle: dotted slow ring + breathing
  if (wi > 0) {
    const br = 0.55 + 0.45 * Math.sin(f / 14);
    els.push(
      <circle key="idle" cx={cx} cy={cy} r={R + 18} fill="none" stroke={C.ink} strokeWidth={2} strokeDasharray="2 10" opacity={wi * t * (0.35 + 0.4 * br)} transform={`rotate(${f * 0.4} ${cx} ${cy})`} />,
      <rect key="idlec" x={cx - 5} y={cy - 5} width={10} height={10} fill={C.ink} opacity={wi * t * br} />,
    );
  }
  // listen: radial level bars
  if (wl > 0) {
    const n = 72;
    const d: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const local = lv * (0.4 + 0.6 * noise1(i * 0.7 + f * 0.35, 2));
      const r1 = R + 10;
      const r2 = r1 + 6 + local * R * 0.55;
      d.push(`M${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}L${cx + Math.cos(a) * r2} ${cy + Math.sin(a) * r2}`);
    }
    els.push(
      <path key="lbars" d={d.join('')} stroke={C.accent} strokeWidth={3} opacity={wl * t} />,
      <circle key="lring" cx={cx} cy={cy} r={R} fill="none" stroke={C.accent} strokeWidth={2} opacity={wl * t} />,
      <circle key="lcore" cx={cx} cy={cy} r={8 + lv * 22} fill={C.accent} opacity={wl * t * 0.9} />,
      <circle key="lcore2" cx={cx} cy={cy} r={28 + lv * 30} fill="none" stroke={C.accent} strokeWidth={1} opacity={wl * t * 0.5} />,
    );
  }
  // think: counter-rotating segmented arcs
  if (wt > 0) {
    const arc = (r: number, segs: number, fill: number, rot: number, sw: number, col: string, key: string) => {
      const c2 = 2 * Math.PI * r;
      const seg = c2 / segs;
      return (
        <circle
          key={key}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={sw}
          strokeDasharray={`${seg * fill} ${seg * (1 - fill)}`}
          transform={`rotate(${rot} ${cx} ${cy})`}
          opacity={wt * t}
        />
      );
    };
    els.push(
      arc(R - 26, 3, 0.62, f * 6, 3, C.accent, 'a1'),
      arc(R, 24, 0.5, -f * 2.2, 2, C.ink, 'a2'),
      arc(R + 22, 1, 0.22, f * 3.4 + 40, 3, C.accent, 'a3'),
      arc(R + 34, 90, 0.18, -f * 0.8, 6, C.dim, 'a4'),
    );
  }
  if (wd > 0) {
    els.push(
      <circle key="dring" cx={cx} cy={cy} r={R} fill="none" stroke={C.accent} strokeWidth={2} opacity={wd * t} />,
      <path key="dchk" d={`M${cx - 26} ${cy}L${cx - 6} ${cy + 20}L${cx + 30} ${cy - 22}`} fill="none" stroke={C.accent} strokeWidth={4} opacity={wd * t} strokeDasharray={`${110 * eo(prog(f, since, 10))} 200`} />,
    );
  }
  // crosshair ticks
  const tk = [0, 90, 180, 270].map((a) => {
    const r = (a * Math.PI) / 180;
    const r1 = R + 50;
    const r2 = R + 62;
    return `M${cx + Math.cos(r) * r1} ${cy + Math.sin(r) * r1}L${cx + Math.cos(r) * r2} ${cy + Math.sin(r) * r2}`;
  });
  const labels: Record<St, string> = {idle: 'IDLE', listen: 'LISTENING', think: 'PROCESSING', done: 'COMPLETE'};
  const ladder: St[] = ['idle', 'listen', 'think'];
  return (
    <Box x={x} y={y} scale={scale} w={w} h={h}>
      <Panel x={0} y={0} w={w} h={h} f={f} inAt={inAt} outAt={outAt} title="HARCODE CORE // STATE" id="C-02" active={cur === 'listen' || cur === 'think' || cur === 'done'} />
      <svg width={w} height={h} style={{position: 'absolute'}}>
        <path d={tk.join('')} stroke={C.dim} strokeWidth={1} opacity={t} />
        {els}
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - tout}}>
        {cur === 'think' && !compact && (
          <Txt x={cx} y={cy - 11} size={22} color={C.ink} align="center" style={{opacity: wt}}>
            {`${pad(Math.min(99, pct), 2)}%`}
          </Txt>
        )}
        <Scr
          key={cur}
          text={cur === 'think' ? `${labels[cur]}` : labels[cur]}
          start={Math.max(since, inAt + 10)}
          dur={8}
          x={cx}
          y={h - (compact ? 40 : 86)}
          size={compact ? 14 : 22}
          color={cur === 'idle' ? C.ink : C.accent}
          align="center"
          track={0.3}
          seed={cur.length}
        />
        {!compact && (
          <div style={{position: 'absolute', left: 0, top: h - 46, width: w, display: 'flex', justifyContent: 'center', gap: 18, opacity: tin}}>
            {ladder.map((s, i) => (
              <div key={s} style={{fontFamily: F.label, fontSize: 11, letterSpacing: '0.2em', color: cur === s ? C.accent : C.faint, display: 'flex', alignItems: 'center', gap: 8}}>
                <span style={{display: 'inline-block', width: 8, height: 8, background: cur === s ? C.accent : 'transparent', border: `1px solid ${cur === s ? C.accent : C.faint}`}} />
                {labels[s]}
                {i < 2 && <span style={{color: C.faint, marginLeft: 10}}>—</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Box>
  );
};

// =====================================================================
// Terminal (used by C-03 and the HARCODE demo)
// =====================================================================
export type TLine = {at: number; text: string; kind?: 'prompt' | 'out' | 'add' | 'del' | 'ok' | 'voice' | 'dim' | 'hl'; dur?: number; ln?: number};
export const Terminal: React.FC<{lines: TLine[]; x: number; y: number; w: number; size?: number; lh?: number; f: number; out?: number; cursorAfter?: number}> = ({
  lines,
  x,
  y,
  w,
  size = 22,
  lh = 34,
  f,
  out = 1e9,
}) => {
  const tout = prog(f, out, 12);
  const shown = lines.filter((l) => f >= l.at);
  const last = shown[shown.length - 1];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w}}>
      {shown.map((l, i) => {
        const dur = l.dur ?? Math.max(4, l.text.length * 0.5);
        const tt = clamp((f - l.at) / dur);
        // build-off: lines wipe bottom->top
        const lineOut = clamp(tout * (shown.length + 4) - (shown.length - i));
        if (lineOut >= 1) return null;
        const n = Math.floor(l.text.length * tt);
        let txt = l.text.slice(0, n);
        if (l.kind === 'add' || l.kind === 'voice' || l.kind === 'hl') {
          // scramble the leading edge
          const edge = l.text.slice(n, n + 3);
          txt += edge
            .split('')
            .map((c, k) => (c === ' ' ? ' ' : '#%&*+=<>/'[Math.floor(hash(i * 7 + k + f) * 9)]))
            .join('');
        }
        const col =
          l.kind === 'add' ? C.accent : l.kind === 'del' ? C.red : l.kind === 'ok' ? C.accent : l.kind === 'dim' ? C.dim : l.kind === 'voice' ? C.ink : l.kind === 'out' ? C.dim : C.ink;
        const bg = l.kind === 'add' ? 'rgba(93,242,198,0.08)' : l.kind === 'hl' ? 'rgba(228,236,231,0.06)' : 'transparent';
        return (
          <div
            key={i}
            style={{
              height: lh,
              display: 'flex',
              alignItems: 'center',
              fontFamily: F.code,
              fontSize: size,
              color: col,
              whiteSpace: 'pre',
              background: bg,
              opacity: 1 - lineOut,
              fontStyle: l.kind === 'voice' ? 'normal' : undefined,
            }}
          >
            {l.ln !== undefined && (
              <span style={{width: 56, color: C.faint, fontSize: size * 0.75, textAlign: 'right', paddingRight: 16}}>{l.ln}</span>
            )}
            {l.kind === 'add' && <span style={{color: C.accent, width: 24}}>+</span>}
            {l.kind === 'del' && <span style={{color: C.red, width: 24}}>-</span>}
            {l.kind === 'prompt' && <span style={{color: C.accent}}>❯ </span>}
            {txt}
            {l === last && tt < 1 && <span style={{display: 'inline-block', width: size * 0.6, height: size * 1.1, background: C.ink, marginLeft: 2}} />}
            {l === last && tt >= 1 && l.kind === 'prompt' && Math.floor(f / 15) % 2 === 0 && (
              <span style={{display: 'inline-block', width: size * 0.6, height: size * 1.1, background: C.ink, marginLeft: 2}} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// =====================================================================
// C-03 VOICE-TO-CODE
// =====================================================================
export const VoiceToCode: React.FC<Base & {words: {at: number; w: string}[]; code: TLine[]; w?: number; h?: number}> = ({
  x,
  y,
  inAt,
  outAt = 1e9,
  scale = 1,
  words,
  code,
  w = 1100,
  h = 440,
}) => {
  const f = useCurrentFrame();
  const tin = eo(prog(f, inAt + 6, 16));
  const tout = eio(prog(f, outAt, 12));
  const lw = 380;
  const shownWords = words.filter((wd) => f >= wd.at);
  // which words are being "consumed" into code: once the code starts, words dim progressively
  const codeStart = code[0]?.at ?? 1e9;
  return (
    <Box x={x} y={y} scale={scale} w={w} h={h}>
      <Panel x={0} y={0} w={w} h={h} f={f} inAt={inAt} outAt={outAt} title="VOICE → CODE // TTY-2" id="C-03" active={shownWords.length > 0 && f < codeStart + 40} />
      <svg width={w} height={h} style={{position: 'absolute', opacity: 1 - tout}}>
        <line x1={lw} x2={lw} y1={34} y2={34 + (h - 34) * tin} stroke={C.faint} shapeRendering="crispEdges" />
        {/* transfer arrow */}
        <g opacity={f >= codeStart - 6 && f < codeStart + 60 ? 1 : 0.25}>
          <path d={`M${lw - 14} ${h / 2}h28m-8 -6l8 6l-8 6`} fill="none" stroke={C.accent} strokeWidth={2} />
        </g>
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - tout}}>
        <Scr text="HEARD" start={inAt + 10} dur={8} x={24} y={52} size={11} color={C.dim} />
        <Scr text="WROTE" start={inAt + 12} dur={8} x={lw + 24} y={52} size={11} color={C.dim} />
        <div style={{position: 'absolute', left: 24, top: 84, width: lw - 52, fontFamily: F.label, fontSize: 22, lineHeight: '34px', color: C.ink, letterSpacing: '0.04em', textTransform: 'uppercase'}}>
          {shownWords.map((wd, i) => {
            const age = f - wd.at;
            const consumed = f >= codeStart ? clamp((f - codeStart - i * 1.2) / 10) : 0;
            return (
              <span key={i} style={{color: age < 4 ? C.accent : C.ink, opacity: 1 - 0.65 * consumed, marginRight: 12, display: 'inline-block'}}>
                {age < 3 ? wd.w.replace(/[A-Za-z]/g, (c, k) => (hash(i + k + f) > 0.5 ? c : '_')) : wd.w}
              </span>
            );
          })}
        </div>
        <Terminal lines={code} x={lw + 10} y={84} w={w - lw - 30} size={19} lh={32} f={f} />
      </div>
    </Box>
  );
};

// =====================================================================
// C-04 CODEBASE NODE MAP
// =====================================================================
const NODES: {id: string; x: number; y: number; p?: string}[] = [
  {id: 'acme-api/', x: 90, y: 250},
  {id: 'src/', x: 250, y: 250, p: 'acme-api/'},
  {id: 'routes/', x: 410, y: 150, p: 'src/'},
  {id: 'middleware/', x: 410, y: 300, p: 'src/'},
  {id: 'lib/', x: 410, y: 420, p: 'src/'},
  {id: 'auth.ts', x: 600, y: 100, p: 'routes/'},
  {id: 'users.ts', x: 600, y: 160, p: 'routes/'},
  {id: 'billing.ts', x: 600, y: 215, p: 'routes/'},
  {id: 'rateLimit.ts', x: 600, y: 290, p: 'middleware/'},
  {id: 'session.ts', x: 600, y: 345, p: 'middleware/'},
  {id: 'db.ts', x: 600, y: 405, p: 'lib/'},
  {id: 'redis.ts', x: 600, y: 455, p: 'lib/'},
  {id: 'auth.spec.ts', x: 790, y: 100, p: 'auth.ts'},
  {id: 'login()', x: 790, y: 160, p: 'auth.ts'},
  {id: 'tests/', x: 250, y: 420, p: 'acme-api/'},
];
const EXTRA_EDGES: [string, string][] = [
  ['rateLimit.ts', 'redis.ts'],
  ['login()', 'session.ts'],
  ['login()', 'rateLimit.ts'],
  ['users.ts', 'db.ts'],
];
export const NodeMap: React.FC<Base & {focus?: [number, string[]][]; w?: number; h?: number; added?: [number, string]}> = ({
  x,
  y,
  inAt,
  outAt = 1e9,
  scale = 1,
  focus = [],
  w = 900,
  h = 520,
}) => {
  const f = useCurrentFrame();
  const tout = eio(prog(f, outAt, 14));
  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const nodeIn = (i: number) => eo(prog(f, inAt + 8 + i * 1.6, 8));
  let foc: string[] = [];
  for (const [fr, ids] of focus) if (f >= fr) foc = ids;
  const edges: {a: string; b: string; extra?: boolean}[] = [
    ...NODES.filter((n) => n.p).map((n) => ({a: n.p!, b: n.id})),
    ...EXTRA_EDGES.map(([a, b]) => ({a, b, extra: true})),
  ];
  const scanned = Math.round(214 * eio(prog(f, inAt + 10, 50)));
  return (
    <Box x={x} y={y} scale={scale} w={w} h={h}>
      <Panel x={0} y={0} w={w} h={h} f={f} inAt={inAt} outAt={outAt} title="CODEBASE MAP // ACME-API" id="C-04" active={foc.length > 0} />
      <svg width={w} height={h} style={{position: 'absolute', opacity: 1 - tout}}>
        {edges.map((e, i) => {
          const A = pos[e.a];
          const B = pos[e.b];
          const t = eo(prog(f, inAt + 14 + i * 1.5, 10)) * (1 - clamp(tout * 2 - (1 - i / edges.length)));
          if (t <= 0) return null;
          const mx = (A.x + B.x) / 2;
          const d = e.extra ? `M${A.x} ${A.y}C${A.x + 40} ${A.y},${B.x + 40} ${B.y},${B.x} ${B.y}` : `M${A.x} ${A.y}H${mx}V${B.y}H${B.x}`;
          const hot = foc.includes(e.a) && foc.includes(e.b);
          const len = 900;
          // travelling pulse on hot edges
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={hot ? C.accent : e.extra ? C.faint : C.hair} strokeWidth={hot ? 1.5 : 1} strokeDasharray={e.extra ? '3 5' : `${len * t} ${len}`} />
              {hot && <path d={d} fill="none" stroke={C.accent} strokeWidth={3} strokeDasharray={`10 ${len}`} strokeDashoffset={-((f * 9) % 300)} />}
            </g>
          );
        })}
        {NODES.map((n, i) => {
          const t = nodeIn(i) * (1 - clamp(tout * 2 - i / NODES.length));
          if (t <= 0) return null;
          const hot = foc.includes(n.id);
          const s = n.id.endsWith('/') ? 9 : 6;
          return (
            <g key={n.id} opacity={t}>
              <rect x={n.x - s / 2} y={n.y - s / 2} width={s} height={s} fill={hot ? C.accent : n.id.endsWith('/') ? C.ink : C.bg} stroke={hot ? C.accent : C.ink} />
              {hot && <Brackets x={n.x - 14} y={n.y - 14} w={28} h={28} len={6} color={C.accent} sw={1.5} />}
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - tout}}>
        {NODES.map((n, i) => {
          const hot = foc.includes(n.id);
          return (
            <Scr key={n.id} text={n.id} start={inAt + 12 + i * 1.6} dur={8} x={n.x + 14} y={n.y - 22} size={11} color={hot ? C.accent : C.dim} track={0.06} seed={i} />
          );
        })}
        <Txt x={24} y={h - 34} size={11} color={C.dim} style={{opacity: eo(prog(f, inAt + 10, 8))}}>
          {`FILES ${pad(scanned, 3)}/214   DEPS 38   DEPTH 4`}
        </Txt>
        <Txt x={w - 24} y={h - 34} size={11} color={foc.length ? C.accent : C.faint} align="right" style={{opacity: eo(prog(f, inAt + 12, 8))}}>
          {foc.length ? `FOCUS ${foc.length} NODES` : 'INDEXING'}
        </Txt>
      </div>
    </Box>
  );
};

// =====================================================================
// C-05 STATUS & PROGRESS BARS
// =====================================================================
export type Task = {name: string; start: number; dur: number};
export const Progress: React.FC<Base & {tasks: Task[]; w?: number; h?: number}> = ({x, y, inAt, outAt = 1e9, scale = 1, tasks, w = 700, h = 360}) => {
  const f = useCurrentFrame();
  const tout = eio(prog(f, outAt, 12));
  const SEG = 32;
  const total = tasks.reduce((a, t) => a + clamp((f - t.start) / t.dur), 0) / tasks.length;
  const rowH = (h - 120) / tasks.length;
  return (
    <Box x={x} y={y} scale={scale} w={w} h={h}>
      <Panel x={0} y={0} w={w} h={h} f={f} inAt={inAt} outAt={outAt} title="TASK PIPELINE" id="C-05" active={total > 0 && total < 1} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - tout}}>
        {tasks.map((t, i) => {
          const rin = eo(prog(f, inAt + 8 + i * 3, 10));
          const rout = clamp(tout * 2 - (tasks.length - i) / tasks.length);
          const p = clamp((f - t.start) / t.dur);
          const running = p > 0 && p < 1;
          const done = p >= 1;
          const yy = 60 + i * rowH;
          const filled = Math.floor(eio(p) * SEG);
          return (
            <div key={i} style={{position: 'absolute', left: 24, top: yy, width: w - 48, opacity: rin * (1 - rout)}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.label, fontSize: 14, letterSpacing: '0.16em', color: running ? C.accent : done ? C.ink : C.dim}}>
                <span>
                  {`${pad(i + 1, 2)}  `}
                  {scrambleOnce(t.name, rin, i, f)}
                </span>
                <span>{done ? 'DONE' : running ? `${pad(Math.round(p * 100), 3)}%` : 'QUEUED'}</span>
              </div>
              <div style={{display: 'flex', gap: 3, marginTop: 10}}>
                {Array.from({length: SEG}).map((_, k) => (
                  <div
                    key={k}
                    style={{
                      flex: 1,
                      height: 10,
                      background: k < filled ? (running ? C.accent : C.ink) : 'transparent',
                      border: `1px solid ${k < filled ? 'transparent' : C.faint}`,
                      opacity: k < Math.floor(rin * SEG) ? 1 : 0,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
        <Txt x={24} y={h - 40} size={11} color={C.dim} style={{opacity: eo(prog(f, inAt + 12, 8))}}>
          {`OVERALL ${pad(Math.round(total * 100), 3)}%`}
        </Txt>
        <div style={{position: 'absolute', left: 180, top: h - 38, width: w - 204, height: 4, background: C.faint, opacity: eo(prog(f, inAt + 12, 8))}}>
          <div style={{width: `${total * 100}%`, height: 4, background: total >= 1 ? C.ink : C.accent}} />
        </div>
      </div>
    </Box>
  );
};
const scrambleOnce = (s: string, t: number, seed: number, f: number) => {
  if (t >= 1) return s;
  const n = Math.floor(s.length * t);
  return s.slice(0, n) + s.slice(n).replace(/[A-Z]/g, (c, k) => (hash(seed + k + f) > 0.5 ? '#' : ' '));
};

// =====================================================================
// C-06 ALERT STATE (normal -> alert -> resolved)
// =====================================================================
export const Alert: React.FC<Base & {alertAt: number; resolveAt: number; doneAt: number; w?: number; h?: number}> = ({
  x,
  y,
  inAt,
  outAt = 1e9,
  scale = 1,
  alertAt,
  resolveAt,
  doneAt,
  w = 760,
  h = 300,
}) => {
  const f = useCurrentFrame();
  const tout = eio(prog(f, outAt, 12));
  const tin = eo(prog(f, inAt + 6, 14));
  const phase = f < alertAt ? 'normal' : f < resolveAt ? 'alert' : f < doneAt ? 'fix' : 'done';
  const isAlert = phase === 'alert';
  const blink = isAlert && Math.floor((f - alertAt) / 5) % 2 === 0;
  const glitch = f === alertAt || f === alertAt + 2;
  const col = isAlert ? C.red : phase === 'normal' ? C.ink : C.accent;
  // heartbeat line
  const pts: string[] = [];
  const gx = 24;
  const gw = w - 48;
  const gy = h - 70;
  for (let i = 0; i <= 120; i++) {
    const px = gx + (i / 120) * gw * tin;
    const ph = (i + f * 2) % 60;
    let v = 0;
    if (ph > 30 && ph < 36) v = [0, -0.5, 1, -1, 0.4, 0][Math.floor(ph - 30)];
    if (isAlert) v = (hash(i + f * 3) - 0.5) * 1.6;
    pts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)} ${(gy + v * 24).toFixed(1)}`);
  }
  const fixP = clamp((f - resolveAt) / (doneAt - resolveAt));
  return (
    <Box x={x} y={y} scale={scale} w={w} h={h}>
      <div style={{position: 'absolute', inset: 0, transform: glitch ? 'translateX(8px)' : undefined}}>
        <Panel x={0} y={0} w={w} h={h} f={f} inAt={inAt} outAt={outAt} title="SYSTEM MONITOR // TESTS" id="C-06" alert={isAlert} active={phase !== 'normal' && !isAlert} />
        <svg width={w} height={h} style={{position: 'absolute', opacity: 1 - tout}}>
          {isAlert && (
            <>
              <defs>
                <pattern id="haz" width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width={8} height={16} fill={C.red} />
                </pattern>
              </defs>
              <rect x={1} y={35} width={w - 2} height={10} fill="url(#haz)" opacity={blink ? 0.9 : 0.4} />
              <rect x={0.5} y={0.5} width={w - 1} height={h - 1} fill="none" stroke={C.red} strokeWidth={2} opacity={blink ? 1 : 0.5} />
            </>
          )}
          <path d={pts.join('')} fill="none" stroke={col} strokeWidth={1.5} opacity={0.9} />
          <line x1={gx} x2={gx + gw * tin} y1={gy + 30} y2={gy + 30} stroke={C.faint} />
        </svg>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - tout}}>
          {phase === 'normal' && (
            <>
              <Scr text="ALL SYSTEMS NOMINAL" start={inAt + 10} dur={10} x={24} y={70} size={33} color={C.ink} track={0.12} />
              <Scr text="14/14 TESTS PASSING   UPTIME 99.98%" start={inAt + 14} dur={10} x={24} y={118} size={11} color={C.dim} track={0.2} />
            </>
          )}
          {isAlert && (
            <>
              <Txt x={24} y={70} size={33} color={C.red} track={0.12} style={{opacity: blink ? 1 : 0.75}}>
                {'▲ TEST FAILED'}
              </Txt>
              <Scr text="AUTH.SPEC.TS:42  EXPECTED 429, GOT 200" start={alertAt + 2} dur={10} x={24} y={118} size={11} color={C.red} track={0.2} />
              <Txt x={w - 24} y={70} size={14} color={C.red} align="right" track={0.2}>
                {`ERR ${pad(f - alertAt, 4)}`}
              </Txt>
            </>
          )}
          {phase === 'fix' && (
            <>
              <Scr text="HARCODE PATCHING…" start={resolveAt} dur={8} x={24} y={70} size={33} color={C.accent} track={0.12} />
              <Txt x={24} y={118} size={11} color={C.dim} track={0.2}>
                {`APPLYING FIX TO MIDDLEWARE/RATELIMIT.TS   ${pad(Math.round(fixP * 100), 3)}%`}
              </Txt>
              <div style={{position: 'absolute', left: 24, top: 146, width: (w - 48) * fixP, height: 4, background: C.accent}} />
            </>
          )}
          {phase === 'done' && (
            <>
              <Scr text="✓ RESOLVED" start={doneAt} dur={8} x={24} y={70} size={33} color={C.accent} track={0.12} />
              <Scr text={`14/14 TESTS PASSING   FIXED IN ${((doneAt - alertAt) / 30).toFixed(1)}S`} start={doneAt + 3} dur={10} x={24} y={118} size={11} color={C.dim} track={0.2} />
            </>
          )}
        </div>
      </div>
    </Box>
  );
};
export const _keep = {DrawRect, ex};
