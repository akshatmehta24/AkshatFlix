import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Grain} from './fui';
import {K, SANS, Watermark} from './s2';
import {clamp, eo, lerp, prog} from './theme';

export type VO = {spk: 'N' | 'D'; text: string; file: string; at: number; dur: number; env: number[]};
export type Scene = {id: string; start: number; dur: number; vo: VO[]};
export type TL = {fps: number; total: number; scenes: Scene[]};
export type SceneProps = {S: number; D: number; vo: VO[]};

// absolute frame -> level of a VO line (0..1)
export const voEnv = (v: VO | undefined, f: number) => {
  if (!v) return 0;
  const i = f - v.at;
  if (i < 0 || i >= v.env.length) return 0;
  const a = Math.floor(i);
  return lerp(v.env[a], v.env[Math.min(v.env.length - 1, a + 1)], i - a);
};
// words of a VO line revealed in time (proportional to characters)
export const voWords = (v: VO | undefined, f: number) => {
  if (!v || f < v.at) return '';
  const words = v.text.split(' ');
  const total = v.text.length;
  const p = clamp((f - v.at) / (v.dur * 0.92));
  let acc = 0;
  const out: string[] = [];
  for (const w of words) {
    if (acc / total <= p) out.push(w);
    acc += w.length + 1;
  }
  return out.join(' ');
};

export const Subtitles: React.FC<{tl: TL; dark?: (id: string) => boolean}> = ({tl, dark}) => {
  const f = useCurrentFrame();
  for (const s of tl.scenes)
    for (const v of s.vo) {
      if (f >= v.at - 2 && f < v.at + v.dur + 8) {
        const o = eo(prog(f, v.at - 2, 5)) * (1 - prog(f, v.at + v.dur + 2, 6));
        const onWhite = dark?.(s.id);
        return (
          <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', opacity: o}}>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 32,
                color: onWhite ? '#111' : '#fff',
                textShadow: onWhite ? 'none' : '0 1px 3px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)',
                fontStyle: v.spk === 'D' ? 'italic' : 'normal',
              }}
            >
              {v.spk === 'D' ? `Developer: “${v.text}”` : v.text}
            </span>
          </div>
        );
      }
    }
  return null;
};

// Renders each scene only inside its window, with a short fade in/out so every cut lands after the hold.
export const Film: React.FC<{tl: TL; scenes: Record<string, React.FC<SceneProps>>; dark?: (id: string) => boolean; watermark?: boolean}> = ({tl, scenes, dark, watermark = true}) => {
  const f = useCurrentFrame();
  const cur = tl.scenes.find((s) => f >= s.start && f < s.start + s.dur) ?? tl.scenes[tl.scenes.length - 1];
  const C = scenes[cur.id];
  const l = f - cur.start;
  const isLast = cur === tl.scenes[tl.scenes.length - 1];
  const op = eo(clamp(l / 6)) * (isLast ? 1 : 1 - prog(l, cur.dur - 6, 6));
  return (
    <AbsoluteFill style={{background: dark?.(cur.id) ? '#f4f4f2' : K.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: op}}>{C && <C S={cur.start} D={cur.dur} vo={cur.vo} />}</AbsoluteFill>
      {watermark && <Watermark dark={dark?.(cur.id)} />}
      <Subtitles tl={tl} dark={dark} />
      <Grain opacity={0.03} />
    </AbsoluteFill>
  );
};
