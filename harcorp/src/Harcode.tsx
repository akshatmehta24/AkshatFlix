import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NodeMap, Progress, StateCore, Terminal, TLine, VoiceWave, voLevel} from './components';
import {Backdrop, Brackets, Panel, Scr, Txt} from './fui';
import {Lockup} from './Logo';
import vo from './vo.json';
import {C, eio, eo, prog} from './theme';

// HARCODE — 15s launch film. The one idea: you say the change, HARCODE writes it, in your terminal.
export const H = {
  len: 450,
  vo1: 64,
  vo2: 280,
  think: 166,
  code: 228,
  tests: 300,
  done: 334,
  out: 342,
  end: 362,
};

const wordsUpTo = (key: 'l1' | 'l2', start: number, f: number) =>
  ((vo as any)[key].words as {w: string; at: number}[])
    .filter((w) => f >= start + w.at)
    .map((w) => w.w)
    .join(' ');

const Caption: React.FC<{n: string; text: string; start: number; out: number}> = ({n, text, start, out}) => (
  <>
    <Scr text={n} start={start} dur={6} out={out} x={100} y={88} size={22} color={C.accent} track={0.2} seed={n.length + 3} />
    <Scr text={text} start={start + 2} dur={12} out={out} x={160} y={78} size={44} color={C.ink} track={0.1} seed={text.length} />
  </>
);

export const Harcode: React.FC = () => {
  const f = useCurrentFrame();
  const level = (t: number) => Math.max(voLevel('l1', t - H.vo1), voLevel('l2', t - H.vo2));

  const v1 = wordsUpTo('l1', H.vo1, f);
  const v2 = wordsUpTo('l2', H.vo2, f);

  const lines: TLine[] = [
    {at: 10, text: 'harcode', kind: 'prompt', dur: 12},
    {at: 28, text: 'HARCODE 0.1 · voice on · repo indexed (214 files)', kind: 'out', dur: 8},
    {at: 36, text: 'just talk — or type', kind: 'dim', dur: 6},
    ...(f >= H.vo1 ? [{at: H.vo1, text: `● "${v1}${f < H.vo1 + 96 ? '' : '"'}`, kind: 'voice' as const, dur: 1}] : []),
    {at: H.think + 4, text: '› reading routes/auth.ts, middleware/, lib/redis.ts', kind: 'dim', dur: 10},
    {at: H.think + 22, text: '› plan: rate-limit POST /login — 5 req / min / IP', kind: 'out', dur: 10},
    {at: H.code, text: '~ src/routes/auth.ts', kind: 'dim', dur: 5},
    {at: H.code + 6, text: "import { rateLimit } from '../middleware/rateLimit'", kind: 'add', dur: 10},
    {at: H.code + 18, text: "const loginLimiter = rateLimit({ window: '1m', max: 5 })", kind: 'add', dur: 12},
    {at: H.code + 32, text: "router.post('/login', login)", kind: 'del', dur: 6},
    {at: H.code + 39, text: "router.post('/login', loginLimiter, login)", kind: 'add', dur: 10},
    ...(f >= H.vo2 ? [{at: H.vo2, text: `● "${v2}${f < H.vo2 + 42 ? '' : '"'}`, kind: 'voice' as const, dur: 1}] : []),
    {at: H.done - 2, text: '✓ 14 passed · 0 failed · 1.8s', kind: 'ok', dur: 6},
  ];

  const tOut = H.out;
  const endT = eo(prog(f, H.end + 18, 14));

  return (
    <AbsoluteFill>
      <Backdrop gridOpacity={0.9 * (1 - eio(prog(f, H.out + 6, 16))) + 0.3}>
        {/* kicker before first caption */}
        <Scr text="HARCODE — VOICE-FIRST CODING ASSISTANT" start={4} dur={14} out={52} x={100} y={92} size={22} color={C.dim} track={0.2} />
        <Caption n="01" text="SAY WHAT YOU WANT." start={58} out={H.think - 4} />
        <Caption n="02" text="IT READS YOUR CODEBASE." start={H.think} out={H.code - 4} />
        <Caption n="03" text="IT WRITES THE CODE. YOU REVIEW." start={H.code} out={H.out - 4} />

        {/* terminal */}
        <Panel x={100} y={170} w={1140} h={640} f={f} inAt={2} outAt={tOut + 4} title="TTY-1 // ~/ACME-API (MAIN)" id="HARCODE" active={f >= H.vo1 && f < H.out} />
        <Terminal lines={lines} x={124} y={222} w={1100} size={24} lh={42} f={f} out={tOut} />

        <VoiceWave x={100} y={840} w={1140} h={170} inAt={50} outAt={tOut} level={level} label="MIC-01 // DEV VOICE" />
        <StateCore
          x={1290}
          y={170}
          w={530}
          h={300}
          compact
          inAt={6}
          outAt={tOut + 6}
          level={level}
          states={[
            [0, 'idle'],
            [H.vo1 - 2, 'listen'],
            [H.think, 'think'],
            [H.vo2 - 2, 'listen'],
            [H.vo2 + 44, 'think'],
            [H.done, 'done'],
          ]}
        />
        {f < H.vo2 + 10 && (
          <NodeMap
            x={1290}
            y={500}
            scale={530 / 900}
            inAt={H.think - 8}
            outAt={H.vo2 - 4}
            focus={[
              [H.think + 10, ['acme-api/', 'src/', 'routes/', 'auth.ts', 'login()']],
              [H.think + 28, ['acme-api/', 'src/', 'routes/', 'auth.ts', 'login()', 'middleware/', 'rateLimit.ts', 'redis.ts', 'lib/']],
            ]}
          />
        )}
        {f >= H.vo2 - 4 && (
          <Progress
            x={1290}
            y={500}
            scale={530 / 700}
            h={420}
            inAt={H.vo2 + 2}
            outAt={tOut + 8}
            tasks={[
              {name: 'PARSE INTENT', start: H.think, dur: 10},
              {name: 'MAP CONTEXT', start: H.think + 8, dur: 40},
              {name: 'WRITE PATCH', start: H.code, dur: 50},
              {name: 'RUN TESTS', start: H.tests + 2, dur: 26},
              {name: 'LINT + FORMAT', start: H.tests + 22, dur: 10},
            ]}
          />
        )}

        {/* end card */}
        {f >= H.end - 4 && (
          <>
            <svg width={1920} height={1080} style={{position: 'absolute'}}>
              <Brackets x={560} y={300} w={800} h={330} len={24} color={C.accent} t={eo(prog(f, H.end - 2, 10))} sw={2} />
            </svg>
            <Scr text="HARCODE" start={H.end} dur={14} x={966} y={360} size={132} color={C.ink} align="center" track={0.2} seed={11} />
            <Scr text="TALK TO YOUR TERMINAL." start={H.end + 10} dur={14} x={960} y={540} size={22} color={C.accent} align="center" track={0.3} />
            <svg width={1920} height={1080} style={{position: 'absolute', opacity: endT}}>
              <g transform={`translate(${960 - 210} ${760}) scale(${420 / 4160})`}>
                <Lockup
                  id="HE"
                  mark={{
                    ring: eio(prog(f, H.end + 16, 16)),
                    stemLeft: eo(prog(f, H.end + 20, 6)),
                    bar: eo(prog(f, H.end + 23, 6)),
                    stemRight: eo(prog(f, H.end + 26, 6)),
                    dotTop: prog(f, H.end + 30, 3),
                    dotBottom: prog(f, H.end + 32, 3),
                  }}
                  letters={[0, 1, 2, 3, 4, 5, 6].map((i) => eo(prog(f, H.end + 22 + i * 1.5, 6)))}
                  industries={prog(f, H.end + 32, 8)}
                />
              </g>
            </svg>
            <Txt x={960} y={1000} size={11} color={C.faint} align="center" track={0.3} style={{opacity: endT}}>
              {'A VOICE-FIRST CODING ASSISTANT BY HARCORP INDUSTRIES'}
            </Txt>
          </>
        )}
      </Backdrop>
    </AbsoluteFill>
  );
};
