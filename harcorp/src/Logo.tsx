import React from 'react';
import logo from './logo.json';
import {C, F, clamp} from './theme';

export const VB = {w: 4160, h: 875};
export const MARK_C = {x: 497, y: 450}; // centre of mark in lockup units
export const RING_R = 425;
export const LETTER_W = 366;
const IND = 'INDUSTRIES';
export const indX = (i: number) => 1012 + (i * (3922 - 1012)) / 9;

export type MarkT = {stemLeft: number; bar: number; stemRight: number; dotTop: number; dotBottom: number; ring: number};
export const FULL_MARK: MarkT = {stemLeft: 1, bar: 1, stemRight: 1, dotTop: 1, dotBottom: 1, ring: 1};

const P = logo.mark as Record<string, string>;

let uid = 0;

// Renders the lockup inside a 4160x875 coordinate system.
// - markTransform applies to the mark group (to centre/scale it on its own)
// - letters[i] 0..1 left->right reveal; industries 0..1 count of letters
export const Lockup: React.FC<{
  mark?: MarkT;
  letters?: number[];
  industries?: number;
  markTransform?: string;
  color?: string;
  ringStart?: number; // degrees for ring reveal start
  id?: string;
}> = ({mark = FULL_MARK, letters = [1, 1, 1, 1, 1, 1, 1], industries = 1, markTransform = '', color = C.ink, ringStart = 40, id}) => {
  const k = id ?? `lk${uid++}`;
  const circ = 2 * Math.PI * RING_R;
  const r = clamp(mark.ring);
  const dotS = (t: number) => clamp(t);
  return (
    <g>
      <defs>
        <clipPath id={`${k}-sl`}>
          <rect x={300} y={220} width={110} height={265 * clamp(mark.stemLeft)} />
        </clipPath>
        <clipPath id={`${k}-bar`}>
          <rect x={305} y={385} width={380 * clamp(mark.bar)} height={100} />
        </clipPath>
        <clipPath id={`${k}-sr`}>
          <rect x={585} y={385} width={100} height={270 * clamp(mark.stemRight)} />
        </clipPath>
        <mask id={`${k}-ring`} maskUnits="userSpaceOnUse" x={0} y={0} width={1000} height={900}>
          <circle
            cx={MARK_C.x}
            cy={MARK_C.y}
            r={RING_R}
            fill="none"
            stroke="#fff"
            strokeWidth={140}
            strokeDasharray={`${circ * r} ${circ}`}
            transform={`rotate(${ringStart} ${MARK_C.x} ${MARK_C.y})`}
          />
        </mask>
        {letters.map((t, i) => (
          <clipPath id={`${k}-L${i}`} key={i}>
            <rect x={logo.letterX[i] - 2} y={130} width={(LETTER_W + 4) * clamp(t)} height={450} />
          </clipPath>
        ))}
      </defs>
      <g transform={markTransform} fill={color}>
        {mark.stemLeft > 0 && <path d={P.stemLeft} clipPath={`url(#${k}-sl)`} />}
        {mark.bar > 0 && <path d={P.bar} clipPath={`url(#${k}-bar)`} />}
        {mark.stemRight > 0 && <path d={P.stemRight} clipPath={`url(#${k}-sr)`} />}
        {mark.dotTop > 0 && (
          <path d={P.dotTop} transform={`translate(${637} ${270}) scale(${dotS(mark.dotTop)}) translate(${-637} ${-270})`} />
        )}
        {mark.dotBottom > 0 && (
          <path d={P.dotBottom} transform={`translate(${357} ${603}) scale(${dotS(mark.dotBottom)}) translate(${-357} ${-603})`} />
        )}
        {r > 0 && <path d={logo.ring} mask={`url(#${k}-ring)`} />}
      </g>
      <g fill={color}>
        {logo.letters.map((ds, i) =>
          letters[i] > 0 ? (
            <g key={i} clipPath={`url(#${k}-L${i})`}>
              {ds.map((d, j) => (
                <path key={j} d={d} />
              ))}
            </g>
          ) : null,
        )}
        {IND.split('').map((ch, i) =>
          i < Math.floor(industries * IND.length + 0.001) ? (
            <text
              key={i}
              x={indX(i) / 0.94}
              y={735.8}
              transform="scale(.94 1)"
              style={{fontFamily: F.brand, fontWeight: 700, fontSize: 111}}
            >
              {ch}
            </text>
          ) : null,
        )}
      </g>
    </g>
  );
};

// Place the lockup on a 1920x1080 canvas: returns px helpers
export const LK = {w: 1300, get s() {
  return this.w / VB.w;
}, get x() {
  return 960 - (2041 * this.w) / VB.w;
}, get y() {
  return 540 - (450 * this.w) / VB.w;
}};
// convert lockup units to screen px
export const lk2px = (ux: number, uy: number) => ({x: LK.x + ux * LK.s, y: LK.y + uy * LK.s});
