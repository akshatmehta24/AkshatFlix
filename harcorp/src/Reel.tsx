import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Alert, NodeMap, Progress, StateCore, VoiceToCode, VoiceWave, synthLevel} from './components';
import {Backdrop, MicroColumn, Scr, Txt} from './fui';
import {Lockup, LK} from './Logo';
import {C, F, eo, pad, prog} from './theme';

export const SEG = 150;
export const INTRO = 30;
export const REEL_LEN = INTRO + SEG * 6 + 45;
export const segStart = (i: number) => INTRO + i * SEG;
const IN = 4;
const OUT = 120;

const META = [
  ['VOICE WAVEFORM', 'HARCODE LISTENING TO A DEVELOPER SPEAK.', 'LIVE LEVEL HISTORY · VAD · DBFS METER'],
  ['LISTENING & THINKING', 'IDLE → LISTENING → PROCESSING.', 'ONE CORE, THREE STATES, NO MODE SCREENS'],
  ['VOICE → CODE', 'SPOKEN WORDS BECOME CODE IN THE TERMINAL.', 'TRANSCRIPT CONSUMED INTO A DIFF'],
  ['CODEBASE MAP', 'FILES AND DEPENDENCIES HARCODE READS.', 'FOCUS PATH LIGHTS WHAT THE CHANGE TOUCHES'],
  ['TASK PIPELINE', 'STATUS AND PROGRESS OF EVERY STEP.', 'SEGMENTED BARS · ACTIVE ROW IN ACCENT'],
  ['ALERT STATE', 'NORMAL → ALERT → RESOLVED.', 'RED IS RESERVED FOR ALERTS ONLY'],
];

const SegLabel: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const S = segStart(i);
  if (f < S || f >= S + SEG) return null;
  const l = f - S;
  const phase = l < 40 ? 0 : l < OUT ? 1 : 2;
  const out = S + OUT + 4;
  return (
    <>
      <Scr text={`C-0${i + 1}`} start={S + 2} dur={10} out={out} x={120} y={330} size={88} color={C.ink} track={0.06} seed={i} />
      <Scr text={META[i][0]} start={S + 6} dur={12} out={out} x={124} y={450} size={33} color={C.ink} track={0.14} seed={i + 4} />
      <Scr text={META[i][1]} start={S + 10} dur={14} out={out} x={124} y={506} size={14} color={C.dim} track={0.14} seed={i + 8} />
      <Scr text={META[i][2]} start={S + 12} dur={14} out={out} x={124} y={530} size={11} color={C.faint} track={0.18} seed={i + 9} />
      <div style={{position: 'absolute', left: 124, top: 620, display: 'flex', gap: 14, opacity: 1 - prog(f, out, 8)}}>
        {['BUILD-ON', 'IDLE', 'BUILD-OFF'].map((s, k) => (
          <div key={s} style={{fontFamily: F.label, fontSize: 11, letterSpacing: '0.2em', color: phase === k ? C.accent : C.faint, display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{width: 8, height: 8, background: phase === k ? C.accent : 'transparent', border: `1px solid ${phase === k ? C.accent : C.faint}`}} />
            {s}
          </div>
        ))}
      </div>
      <Txt x={124} y={660} size={11} color={C.faint} style={{opacity: 1 - prog(f, out, 8)}}>
        {`T ${pad(l / 30, 2, 2)} / ${pad(SEG / 30, 2, 2)}`}
      </Txt>
    </>
  );
};

export const Reel: React.FC = () => {
  const f = useCurrentFrame();
  const s = segStart;
  const words1 = 'make the retry delay exponential and cap it at thirty seconds'.split(' ');
  return (
    <AbsoluteFill>
      <Backdrop gridOpacity={0.8}>
        {/* global chrome */}
        <Scr text="HARCODE // INTERFACE COMPONENTS" start={2} dur={14} x={80} y={60} size={14} color={C.ink} track={0.24} />
        <Scr text="HARCORP INDUSTRIES — FUI KIT V0.1" start={6} dur={14} x={1840} y={60} size={11} color={C.dim} align="right" track={0.24} />
        <Txt x={80} y={1010} size={11} color={C.faint}>{`FRM ${pad(f, 4)}   SEG ${pad(Math.max(0, Math.min(6, Math.floor((f - INTRO) / SEG) + 1)), 2)}/06`}</Txt>
        <div style={{position: 'absolute', left: 80, top: 1036, width: 1760, height: 2, background: C.faint}}>
          <div style={{width: `${(f / REEL_LEN) * 100}%`, height: 2, background: C.accent}} />
        </div>
        <Scr text="INTERFACE COMPONENTS" start={2} dur={14} out={26} x={960} y={500} size={66} color={C.ink} align="center" track={0.14} />
        <Scr text="06 COMPONENTS · BUILD-ON / IDLE / BUILD-OFF" start={8} dur={12} out={26} x={960} y={590} size={14} color={C.dim} align="center" track={0.3} />
        <MicroColumn x={1700} y={110} rows={10} seed={11} t={prog(f, 4, 30)} />

        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SegLabel key={i} i={i} />
        ))}

        {f >= s(0) && f < s(1) && <VoiceWave x={660} y={380} scale={1.15} inAt={s(0) + IN} outAt={s(0) + OUT} level={(t) => Math.min(1, 0.12 + synthLevel(t - s(0)))} />}
        {f >= s(1) && f < s(2) && (
          <StateCore
            x={980}
            y={190}
            scale={1.25}
            inAt={s(1) + IN}
            outAt={s(1) + OUT}
            level={(t) => Math.min(1, 0.3 + synthLevel(t))}
            states={[
              [s(1), 'idle'],
              [s(1) + 50, 'listen'],
              [s(1) + 86, 'think'],
            ]}
          />
        )}
        {f >= s(2) && f < s(3) && (
          <VoiceToCode
            x={660}
            y={300}
            scale={1.08}
            inAt={s(2) + IN}
            outAt={s(2) + OUT}
            words={words1.map((w, k) => ({at: s(2) + 22 + k * 3.2, w}))}
            code={[
              {at: s(2) + 62, text: 'const delay = Math.min(', kind: 'add', ln: 41, dur: 8},
              {at: s(2) + 70, text: '  BASE_MS * 2 ** attempt,', kind: 'add', ln: 42, dur: 9},
              {at: s(2) + 79, text: '  30_000,', kind: 'add', ln: 43, dur: 5},
              {at: s(2) + 84, text: ');', kind: 'add', ln: 44, dur: 3},
              {at: s(2) + 92, text: '✓ retry.ts updated · 4 lines', kind: 'ok', dur: 8},
            ]}
          />
        )}
        {f >= s(3) && f < s(4) && (
          <NodeMap
            x={720}
            y={230}
            scale={1.2}
            inAt={s(3) + IN}
            outAt={s(3) + OUT}
            focus={[
              [s(3) + 62, ['acme-api/', 'src/', 'routes/', 'auth.ts', 'login()']],
              [s(3) + 80, ['acme-api/', 'src/', 'routes/', 'auth.ts', 'login()', 'middleware/', 'rateLimit.ts', 'redis.ts', 'lib/']],
            ]}
          />
        )}
        {f >= s(4) && f < s(5) && (
          <Progress
            x={820}
            y={290}
            scale={1.4}
            inAt={s(4) + IN}
            outAt={s(4) + OUT}
            tasks={[
              {name: 'PARSE INTENT', start: s(4) + 30, dur: 14},
              {name: 'MAP CONTEXT', start: s(4) + 40, dur: 20},
              {name: 'WRITE PATCH', start: s(4) + 54, dur: 24},
              {name: 'RUN TESTS', start: s(4) + 74, dur: 26},
              {name: 'LINT + FORMAT', start: s(4) + 96, dur: 12},
            ]}
          />
        )}
        {f >= s(5) && f < s(6) && <Alert x={790} y={340} scale={1.35} inAt={s(5) + IN} outAt={s(5) + OUT} alertAt={s(5) + 48} resolveAt={s(5) + 80} doneAt={s(5) + 102} />}

        {/* outro */}
        {f >= s(6) && (
          <>
            <svg width={1920} height={1080} style={{position: 'absolute', opacity: eo(prog(f, s(6) + 2, 10))}}>
              <g transform={`translate(${960 - 300} ${500}) scale(${600 / 4160})`}>
                <Lockup id="RO" />
              </g>
            </svg>
            <Scr text="HARCODE UI KIT — 06 COMPONENTS" start={s(6) + 8} dur={12} x={960} y={620} size={14} color={C.dim} align="center" track={0.3} />
          </>
        )}
      </Backdrop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------
// Component sheet (render as still at scale 2 -> 3840x2160)
// ---------------------------------------------------------------
export const Sheet: React.FC = () => {
  const words = 'add rate limiting to the login route five attempts a minute'.split(' ');
  const sw = [
    ['BG', C.bg, '#050607'],
    ['PHOSPHOR', C.ink, '#E4ECE7'],
    ['DIM', 'rgba(228,236,231,0.45)', 'INK 45%'],
    ['HAIRLINE', 'rgba(228,236,231,0.28)', 'INK 28%'],
    ['ACCENT / ACTIVE', C.accent, '#5DF2C6'],
    ['ALERT ONLY', C.red, '#FF3B3B'],
  ];
  return (
    <AbsoluteFill>
      <Backdrop gridOpacity={0.7} grain={false}>
        <Txt x={60} y={44} size={22} color={C.ink} track={0.24}>
          HARCODE INTERFACE SYSTEM — COMPONENT SHEET
        </Txt>
        <Txt x={1860} y={44} size={11} color={C.dim} align="right" track={0.24}>
          HARCORP INDUSTRIES · FUI KIT V0.1 · IDLE STATES
        </Txt>
        <div style={{position: 'absolute', left: 60, top: 80, width: 1800, height: 1, background: C.faint}} />
        <VoiceWave x={60} y={120} scale={0.86} inAt={-200} level={(t) => synthLevel(t + 37)} />
        <VoiceToCode
          x={60}
          y={420}
          scale={0.8}
          h={330}
          inAt={-200}
          words={words.map((w, k) => ({at: -150 + k, w}))}
          code={[
            {at: -100, text: "import { rateLimit } from './middleware'", kind: 'add', ln: 3},
            {at: -100, text: 'const loginLimiter = rateLimit({', kind: 'add', ln: 8},
            {at: -100, text: "  window: '1m', max: 5,", kind: 'add', ln: 9},
            {at: -100, text: '});', kind: 'add', ln: 10},
            {at: -100, text: "router.post('/login', loginLimiter, login)", kind: 'hl', ln: 12},
          ]}
        />
        <StateCore x={1000} y={120} scale={0.64} inAt={-200} level={(t) => 0.6 + 0.4 * Math.sin(t)} states={[[-200, 'listen']]} />
        <Progress
          x={1390}
          y={120}
          scale={0.67}
          inAt={-200}
          tasks={[
            {name: 'PARSE INTENT', start: -100, dur: 10},
            {name: 'MAP CONTEXT', start: -90, dur: 10},
            {name: 'WRITE PATCH', start: -20, dur: 40},
            {name: 'RUN TESTS', start: 40, dur: 20},
            {name: 'LINT + FORMAT', start: 60, dur: 20},
          ]}
        />
        <NodeMap x={1000} y={510} scale={0.5} inAt={-200} focus={[[-100, ['acme-api/', 'src/', 'routes/', 'auth.ts', 'login()', 'middleware/', 'rateLimit.ts']]]} />
        <Alert x={1480} y={510} scale={0.5} inAt={-200} alertAt={-10} resolveAt={200} doneAt={300} />
        <Txt x={1480} y={680} size={11} color={C.faint}>C-06 SHOWN IN ALERT STATE</Txt>
        {/* palette & type */}
        <div style={{position: 'absolute', left: 60, top: 860, width: 1800, height: 1, background: C.faint}} />
        <Txt x={60} y={880} size={11} color={C.dim} track={0.24}>PALETTE</Txt>
        {sw.map(([n, c, hex], i) => (
          <div key={n} style={{position: 'absolute', left: 60 + i * 150, top: 904}}>
            <div style={{width: 132, height: 56, background: c, border: `1px solid ${C.faint}`}} />
            <div style={{fontFamily: F.label, fontSize: 11, color: C.dim, marginTop: 10, letterSpacing: '0.14em'}}>{n}</div>
            <div style={{fontFamily: F.label, fontSize: 11, color: C.faint, marginTop: 6, letterSpacing: '0.14em'}}>{hex}</div>
          </div>
        ))}
        <Txt x={1000} y={880} size={11} color={C.dim} track={0.24}>TYPE</Txt>
        <Txt x={1000} y={904} size={44} color={C.ink} track={0.14}>DEPARTURE MONO</Txt>
        <Txt x={1000} y={960} size={11} color={C.dim} track={0.24}>LABELS · HEADLINES · MICROTEXT — UPPERCASE, WIDE TRACKING</Txt>
        <Txt x={1000} y={990} size={22} color={C.ink} font={F.code} track={0}>JetBrains Mono — const code = data;</Txt>
        <Txt x={1000} y={1026} size={11} color={C.dim} track={0.24}>CODE · TERMINAL · NUMERIC DATA</Txt>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <g transform={`translate(${1860 - 330} ${760}) scale(${330 / 4160})`} opacity={0.95}>
            <Lockup id="SH" />
          </g>
        </svg>
      </Backdrop>
    </AbsoluteFill>
  );
};
export const _k = {LK};
