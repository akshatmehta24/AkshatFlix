// ONE SENTENCE — seekable 3D world rendered to canvas from the root timeline time.
(function () {
  const T = window.T;
  const P = {};
  T.ph.forEach((p) => (P[p.id] = p));
  const MASK = window.MASK;
  const N = MASK.length;
  const CELL = 20;
  const W = 1080;
  const H = 1920;
  const CX = 540;
  const CY = 900;
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eo = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const prog = (t, s, d) => clamp((t - s) / d);

  // ---------------- city ----------------
  const B = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const logo = MASK[r][c] === 1;
      const rr = Math.hypot(c - 23.5, r - 23.5) / 24;
      const id = r * N + c;
      if (!logo && (rr > 1.05 || hash(id * 1.7) > 0.5)) continue;
      const h = logo ? 40 + Math.pow(hash(id), 1.6) * 130 : 14 + Math.pow(hash(id + 3), 2) * 80;
      B.push({x: (c - 23.5) * CELL, z: (r - 23.5) * CELL, h, logo, id, r, c, extra: 0, tgt: -1});
    }
  // four target files (logo cells), chosen near chosen points of the mark
  const TP = [[15, 17], [31, 15], [31, 26], [15, 33]]; // [col,row]: spread over the mark
  const TN = ['routes/auth.ts', 'middleware/rateLimit.ts', 'lib/redis.ts', 'tests/auth.spec.ts'];
  const targets = TP.map(([c, r], k) => {
    let best = null;
    let bd = 1e9;
    B.forEach((b) => {
      if (!b.logo || b.tgt >= 0) return;
      const d = (b.c - c) ** 2 + (b.r - r) ** 2;
      if (d < bd) {
        bd = d;
        best = b;
      }
    });
    best.tgt = k;
    best.h = 120 + k * 12;
    return best;
  });

  // ---------------- camera path ----------------
  const D0 = P.dive.start;
  const R0 = P.rebuild.start;
  const V0 = P.reveal.start;
  const E0 = P.end.start;
  const KEYS = [
    {t: D0, pos: [0, 1900, 1900], tgt: [0, 0, 150], k: 0},
    {t: D0 + 1.7, pos: [-300, 520, 820], tgt: [0, 40, 40], k: 0},
    {t: R0, pos: [380, 360, 560], tgt: [40, 50, -30], k: 0},
    {t: R0 + 2.0, pos: [-420, 430, 520], tgt: [0, 50, 0], k: 0},
    {t: V0, pos: [-160, 760, 760], tgt: [0, 0, 0], k: 0.15},
    {t: V0 + 1.9, pos: [0, 1390, 0.5], tgt: [0, 0, 0], k: 1},
    {t: E0 + 10, pos: [0, 1390, 0.5], tgt: [0, 0, 0], k: 1},
  ];
  const cam = (t) => {
    let i = 0;
    while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const u = eio(clamp((t - a.t) / (b.t - a.t)));
    const L = (p, q) => p.map((v, j) => lerp(v, q[j], u));
    return {pos: L(a.pos, b.pos), tgt: L(a.tgt, b.tgt), k: lerp(a.k, b.k, u)};
  };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const FOC = 1100;
  let C = null;
  const setCam = (t) => {
    const c = cam(t);
    const fwd = norm(sub(c.tgt, c.pos));
    const up0 = norm([0, lerp(1, 0, c.k), lerp(0, -1, c.k)]);
    let right = cross(fwd, up0);
    right = norm(right);
    const up = cross(right, fwd);
    C = {pos: c.pos, fwd, right, up};
  };
  const proj = (x, y, z) => {
    const d = [x - C.pos[0], y - C.pos[1], z - C.pos[2]];
    const zc = dot(d, C.fwd);
    if (zc < 5) return null;
    return [CX + (FOC * dot(d, C.right)) / zc, CY - (FOC * dot(d, C.up)) / zc, zc];
  };
  window.__proj = (x, y, z, t) => {
    setCam(t);
    return proj(x, y, z);
  };

  // ---------------- tokens (the sentence breaking into letters) ----------------
  const SENT = 'ADDRATELIMITINGTOTHELOGINROUTE';
  const tokens = SENT.split('').map((ch, i) => ({ch, b: targets[i % 4], t0: D0 + 0.15 + i * 0.045, dur: 0.75 + hash(i) * 0.25, ox: (hash(i + 5) - 0.5) * 60, oz: (hash(i + 9) - 0.5) * 60}));

  // ---------------- draw ----------------
  const cv = document.getElementById('world');
  const ctx = cv.getContext('2d');
  const env = (v, t) => {
    if (!v) return 0;
    const i = (t - v.at) * 30;
    if (i < 0 || i >= v.env.length - 1) return 0;
    const a = Math.floor(i);
    return v.env[a] + (v.env[a + 1] - v.env[a]) * (i - a);
  };

  const drawWave = (t) => {
    const vp = P.voice;
    const dev = vp.vo[0];
    const end = vp.start + vp.dur;
    const squeeze = eio(prog(t, end - 0.55, 0.45));
    const appear = eo(prog(t, vp.start, 0.35));
    const w = 900 * appear * (1 - squeeze) + 4;
    const y = 900;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const pass of [[18, 0.35, 10], [6, 0.8, 3], [0, 1, 1.4]]) {
      ctx.shadowBlur = pass[0];
      ctx.shadowColor = '#5DF2C6';
      ctx.strokeStyle = pass === 2 ? '#eafff8' : `rgba(93,242,198,${pass[1]})`;
      ctx.lineWidth = pass[2];
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) {
        const u = i / 240;
        const x = CX - w / 2 + u * w;
        const lv = env(dev, t - Math.abs(u - 0.5) * 0.3);
        const taper = Math.pow(Math.sin(Math.PI * u), 0.8);
        const a = (0.03 + lv) * 300 * taper * (1 - squeeze);
        const yy = y + Math.sin(u * 70 - t * 18) * a * (0.6 + 0.4 * Math.sin(u * 13 + t * 5));
        i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.stroke();
    }
    // beam shooting down into the dark at the end of the line
    const beam = prog(t, end - 0.15, 0.3);
    if (beam > 0) {
      const g = ctx.createLinearGradient(0, y, 0, H);
      g.addColorStop(0, 'rgba(234,255,248,1)');
      g.addColorStop(1, 'rgba(93,242,198,0)');
      ctx.fillStyle = g;
      ctx.shadowBlur = 30;
      ctx.fillRect(CX - 3 - 6 * (1 - beam), y, 6 + 12 * (1 - beam), (H - y) * eo(beam) * 1.2);
      ctx.beginPath();
      ctx.arc(CX, y, 14 * (1 - beam) + 6, 0, Math.PI * 2);
      ctx.fillStyle = '#eafff8';
      ctx.fill();
    }
    ctx.restore();
  };

  const drawCity = (t) => {
    setCam(t);
    const appear = eo(prog(t, D0, 0.9));
    const reveal = prog(t, V0, 1.9);
    const fillerFade = eio(prog(t, V0 + 0.4, 1.4));
    const glowLogo = eio(prog(t, V0 + 1.2, 0.9));
    const sweepR = 760 * eio(prog(t, R0 + 1.5, 1.5));
    const rebuild = prog(t, R0 + 0.1, 1.3);
    // painter's sort
    const items = [];
    for (const b of B) {
      const rise = clamp(appear * 1.6 - Math.hypot(b.x, b.z) / 900);
      let h = b.h * eo(rise);
      if (!b.logo) h *= 1 - 0.85 * fillerFade;
      if (b.tgt >= 0) h += 80 * eo(clamp(rebuild * 1.3 - b.tgt * 0.1));
      if (h < 1) continue;
      const c = proj(b.x, h / 2, b.z);
      if (!c) continue;
      items.push([c[2], b, h]);
    }
    items.sort((a, b) => b[0] - a[0]);
    const s = 8;
    for (const [, b, h] of items) {
      const P8 = [
        proj(b.x - s, 0, b.z - s), proj(b.x + s, 0, b.z - s), proj(b.x + s, 0, b.z + s), proj(b.x - s, 0, b.z + s),
        proj(b.x - s, h, b.z - s), proj(b.x + s, h, b.z - s), proj(b.x + s, h, b.z + s), proj(b.x - s, h, b.z + s),
      ];
      if (P8.some((p) => !p)) continue;
      // colour logic
      let col = 'rgba(228,236,231,0.55)';
      let fill = 'rgba(8,13,13,0.92)';
      let lw = 1;
      let glow = 0;
      const inSweep = sweepR > 0 && Math.hypot(b.x, b.z) < sweepR;
      if (inSweep) col = 'rgba(150,240,210,0.75)';
      if (!b.logo) col = `rgba(228,236,231,${0.55 * (1 - fillerFade)})`;
      if (b.logo && reveal > 0) {
        col = `rgba(${Math.round(lerp(228, 93, glowLogo))},${Math.round(lerp(236, 242, glowLogo))},${Math.round(lerp(231, 198, glowLogo))},${0.6 + 0.4 * glowLogo})`;
        lw = 1 + glowLogo;
      }
      if (b.tgt >= 0) {
        const hit = tokens.filter((k) => k.b === b && t >= k.t0 + k.dur).length;
        if (hit > 0) {
          col = '#5DF2C6';
          lw = 2.2;
          glow = 18;
          fill = 'rgba(20,60,50,0.92)';
        }
        // the one file that breaks then gets fixed
        if (b.tgt === 1 && t > R0 + 0.5 && t < R0 + 1.4) {
          col = '#FF3B3B';
          fill = 'rgba(70,10,10,0.92)';
          glow = 22;
        }
      }
      // faces (top + two visible sides)
      const faces = [[4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
      ctx.fillStyle = fill;
      for (const f of faces) {
        ctx.beginPath();
        f.forEach((q, j) => (j ? ctx.lineTo(P8[q][0], P8[q][1]) : ctx.moveTo(P8[q][0], P8[q][1])));
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      if (glow) {
        ctx.shadowBlur = glow;
        ctx.shadowColor = col;
      }
      ctx.beginPath();
      for (const [a, c] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) {
        ctx.moveTo(P8[a][0], P8[a][1]);
        ctx.lineTo(P8[c][0], P8[c][1]);
      }
      ctx.stroke();
      // floors stacking on rebuilt files
      if (b.tgt >= 0 && rebuild > 0) {
        const fl = Math.floor(h / 12);
        ctx.beginPath();
        for (let k = 1; k < fl; k++) {
          const yy = k * 12;
          const a1 = proj(b.x - s, yy, b.z + s);
          const a2 = proj(b.x + s, yy, b.z + s);
          const a3 = proj(b.x + s, yy, b.z - s);
          if (a1 && a2 && a3) {
            ctx.moveTo(a1[0], a1[1]);
            ctx.lineTo(a2[0], a2[1]);
            ctx.lineTo(a3[0], a3[1]);
          }
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
    // test sweep ring on the ground
    if (sweepR > 0 && sweepR < 755) {
      ctx.save();
      ctx.strokeStyle = 'rgba(93,242,198,0.9)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#5DF2C6';
      ctx.beginPath();
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        const p = proj(Math.cos(a) * sweepR, 1, Math.sin(a) * sweepR);
        if (!p) continue;
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();
      ctx.restore();
    }
    // falling letter tokens
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const k of tokens) {
      const u = (t - k.t0) / k.dur;
      if (u < 0 || u > 1.25) continue;
      const top = k.b.h;
      const y = lerp(900, top + 4, eio(clamp(u)));
      const p = proj(k.b.x + k.ox * (1 - clamp(u)), y, k.b.z + k.oz * (1 - clamp(u)));
      if (!p) continue;
      if (u <= 1) {
        const size = Math.max(10, (FOC * 34) / p[2]);
        ctx.font = `700 ${size}px JB, monospace`;
        ctx.fillStyle = '#eafff8';
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#5DF2C6';
        ctx.fillText(k.ch, p[0], p[1]);
        // trail
        const p2 = proj(k.b.x + k.ox * (1 - clamp(u)), y + 70, k.b.z + k.oz * (1 - clamp(u)));
        if (p2) {
          const g = ctx.createLinearGradient(p[0], p[1], p2[0], p2[1]);
          g.addColorStop(0, 'rgba(93,242,198,0.7)');
          g.addColorStop(1, 'rgba(93,242,198,0)');
          ctx.strokeStyle = g;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        }
      } else {
        // impact ring
        const q = (u - 1) / 0.25;
        ctx.strokeStyle = `rgba(93,242,198,${1 - q})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], 10 + q * 60, 4 + q * 22, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
    // reveal: glowing ring trace around the mark from above
    const ringT = eio(prog(t, V0 + 1.5, 0.8));
    if (ringT > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(93,242,198,0.9)';
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#5DF2C6';
      ctx.lineWidth = 6;
      ctx.beginPath();
      const R = 455;
      for (let i = 0; i <= 120 * ringT; i++) {
        const a = -Math.PI / 2 + (i / 120) * Math.PI * 2;
        const p = proj(Math.cos(a) * R, 0, Math.sin(a) * R);
        if (!p) continue;
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();
      ctx.restore();
    }
    // labels for target buildings (DOM), positioned from projection
    targets.forEach((b, k) => {
      const el = document.getElementById('lab' + k);
      const p = proj(b.x, b.h + 80 * eo(clamp(rebuild * 1.3 - k * 0.1)) + 30, b.z);
      const hit = tokens.some((q) => q.b === b && t >= q.t0 + q.dur);
      const vis = hit && t < V0 + 0.6 ? 1 : 0;
      if (p) {
        el.style.left = p[0] + 'px';
        el.style.top = p[1] - 70 + 'px';
      }
      el.style.opacity = p ? vis : 0;
      el.querySelector('i').textContent = b.tgt === 1 && t > R0 + 0.5 && t < R0 + 1.4 ? '✕ ' : '✓ ';
      el.classList.toggle('bad', b.tgt === 1 && t > R0 + 0.5 && t < R0 + 1.4);
    });
  };

  window.__drawWorld = (t) => {
    ctx.clearRect(0, 0, W, H);
    if (t >= P.voice.start && t < D0 + 0.4) drawWave(t);
    if (t >= D0 && t < E0 + 0.6) drawCity(t);
    else for (let k = 0; k < 4; k++) document.getElementById('lab' + k).style.opacity = 0;
  };
  window.__TN = TN;
})();
