import {staticFile, continueRender, delayRender} from 'remotion';

export const C = {
  bg: '#050607',
  panel: 'rgba(8,11,12,0.92)',
  ink: '#E4ECE7', // pale phosphor
  dim: 'rgba(228,236,231,0.45)',
  faint: 'rgba(228,236,231,0.16)',
  hair: 'rgba(228,236,231,0.28)',
  ghost: 'rgba(228,236,231,0.06)',
  accent: '#5DF2C6', // ion mint: active states only
  accentDim: 'rgba(93,242,198,0.35)',
  red: '#FF3B3B', // alerts only
};

export const F = {
  label: 'Departure, monospace',
  code: 'JBMono, monospace',
  brand: '"Liberation Sans", Arial, sans-serif',
};

export const FPS = 30;

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('Departure', `url(${staticFile('fonts/DepartureMono-Regular.woff2')})`),
    new FontFace('JBMono', `url(${staticFile('fonts/jetbrains-mono-latin-400-normal.woff2')})`, {weight: '400'}),
    new FontFace('JBMono', `url(${staticFile('fonts/jetbrains-mono-latin-700-normal.woff2')})`, {weight: '700'}),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((fs) => {
      fs.forEach((f) => document.fonts.add(f));
      return document.fonts.ready;
    })
    .then(() => continueRender(h));
};

// ---- math helpers ----
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const prog = (f: number, start: number, dur: number) => clamp((f - start) / dur);
// precise, mechanical easing (no overshoot)
export const eo = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const eio = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const ex = (t: number) => (clamp(t) === 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const step = (t: number, n: number) => Math.floor(clamp(t) * n) / n;

// deterministic hash noise
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const fr = x - i;
  const u = fr * fr * (3 - 2 * fr);
  return lerp(hash(i + seed * 101), hash(i + 1 + seed * 101), u);
};

export const pad = (n: number, w: number, d = 0) => {
  const s = Math.abs(n).toFixed(d);
  const [i, dec] = s.split('.');
  return (n < 0 ? '-' : '') + i.padStart(w, '0') + (dec !== undefined ? '.' + dec : '');
};

export const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/\\|:;-_';
export const scramble = (text: string, t: number, seed: number, f: number) => {
  // reveals text left->right; unrevealed chars cycle glyphs
  const n = text.length;
  const revealed = Math.floor(clamp(t) * (n + 4));
  let out = '';
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    if (ch === ' ') {
      out += ' ';
      continue;
    }
    if (i < revealed - 4) out += ch;
    else if (i < revealed) out += GLYPHS[Math.floor(hash(seed + i * 13 + Math.floor(f / 2) * 7) * GLYPHS.length)];
    else out += ' ';
  }
  return out;
};
