(function () {
  const T = window.T;
  const P = {};
  T.ph.forEach((p) => (P[p.id] = p));
  const tl = gsap.timeline({paused: true});
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const X = 'expo.out';
  const flash = (t, o = 0.5) => tl.fromTo('#flash', {opacity: o}, {opacity: 0, duration: 0.16, ease: 'power2.out'}, t);
  const shake = (sel, t, a = 14, n = 5) => {
    for (let k = 0; k < n; k++) tl.set(sel, {x: (hash(t * 9 + k) - 0.5) * a * 2, y: (hash(t * 9 + k + 4) - 0.5) * a * 2}, t + k * 0.033);
    tl.set(sel, {x: 0, y: 0}, t + n * 0.033);
  };

  // per-frame world + hud
  const px = {v: 0};
  const names = {hook: '01 · HOOK', voice: '02 · VOICE', dive: '03 · READ', rebuild: '04 · WRITE', reveal: '05 · REVEAL', end: '06 · HARCODE'};
  tl.to(px, {
    v: 1,
    duration: T.total,
    ease: 'none',
    onUpdate: () => {
      const t = tl.time();
      window.__drawWorld(t);
      const f = Math.floor(t * 30);
      $('#grect').setAttribute('x', -110 + (hash(f) - 0.5) * 140);
      $('#grect').setAttribute('y', -110 + (hash(f + 3) - 0.5) * 140);
      const cur = T.ph.find((p) => t >= p.start && t < p.start + p.dur) || T.ph[T.ph.length - 1];
      $('#ph').textContent = names[cur.id];
      const ts = P.rebuild.start + 1.5;
      const n = Math.round(14 * Math.min(1, Math.max(0, (t - ts) / 1.5)));
      $('#tn').textContent = String(n).padStart(2, '0');
      $('#tests').style.color = n === 14 ? '#5DF2C6' : '#E4ECE7';
    },
  }, 0);

  // ---- hook: three slams ----
  const hw = P.hook.vo[0].words; // Watch what one sentence can do.
  [['#h1', hw[0].t - 0.05, 8], ['#h2', hw[2].t, 16], ['#h3', hw[4].t, 22]].forEach(([s, t, a]) => {
    tl.fromTo(s, {opacity: 0, scale: 2.3}, {opacity: 1, scale: 1, duration: 0.2, ease: X}, t);
    flash(t + 0.04, a > 15 ? 0.45 : 0.2);
    shake(s, t + 0.08, a);
  });
  const he = P.hook.start + P.hook.dur;
  tl.to(['#h1', '#h2', '#h3'], {opacity: 0, scale: 0.6, y: 120, duration: 0.25, ease: 'power3.in'}, he - 0.25);

  // ---- voice ----
  const vs = P.voice.start;
  const ve = vs + P.voice.dur;
  tl.fromTo('#tag', {opacity: 0, y: -20}, {opacity: 1, y: 0, duration: 0.25, ease: X}, vs + 0.05);
  for (let k = 0; k < 6; k++) tl.to('#tag u', {opacity: k % 2 ? 1 : 0.2, duration: 0.01}, vs + 0.3 + k * 0.4);
  tl.to('#tag', {opacity: 0, duration: 0.2}, ve - 0.35);
  flash(ve - 0.05, 0.35);

  // ---- rebuild: tests counter ----
  const rs = P.rebuild.start;
  tl.fromTo('#tests', {opacity: 0, y: -30}, {opacity: 1, y: 0, duration: 0.3, ease: X}, rs + 1.4);
  tl.to('#tests', {opacity: 0, duration: 0.25}, P.reveal.start + 0.3);
  flash(rs + 3.0, 0.2);

  // ---- reveal ----
  const vr = P.reveal.start;
  const vw = P.reveal.vo[0].words; // One sentence in. Working code out.
  tl.fromTo('#rv1', {opacity: 0, scale: 1.8}, {opacity: 1, scale: 1, duration: 0.22, ease: X}, vw[0].t);
  tl.fromTo('#rv2', {opacity: 0, scale: 1.8}, {opacity: 1, scale: 1, duration: 0.22, ease: X}, vw[3].t);
  shake('#rv2', vw[3].t + 0.06, 12);
  const climax = vr + 1.9;
  flash(climax, 0.7);
  tl.fromTo('#mk', {opacity: 0}, {opacity: 1, duration: 0.5, ease: 'power2.out'}, climax + 0.4);
  tl.to(['#rv1', '#rv2'], {opacity: 0, duration: 0.3}, P.end.start - 0.1);

  // ---- end ----
  const es = P.end.start;
  tl.to('#mk', {scale: 0.55, y: -330, duration: 0.6, ease: 'expo.inOut'}, es);
  $$('#hc span').forEach((s, i) => tl.fromTo(s, {opacity: 0, y: 70}, {opacity: 1, y: 0, duration: 0.3, ease: X}, es + 0.35 + i * 0.05));
  tl.to('#hc', {y: -260, duration: 0.01}, es);
  tl.fromTo('#lk', {opacity: 0, y: 20}, {opacity: 1, y: -260, duration: 0.4, ease: X}, es + 0.8);
  flash(es + 0.4, 0.25);
  tl.fromTo('#tg', {opacity: 0, scale: 1.6}, {opacity: 1, scale: 1, duration: 0.25, ease: X}, es + 1.1);
  shake('#tg', es + 1.16, 10);

  // ---- captions ----
  $$('.cap').forEach((c) => {
    const st = parseFloat(c.dataset.start);
    const du = parseFloat(c.dataset.duration);
    const cl = c.querySelector('.cl');
    tl.fromTo(cl, {opacity: 0, scale: 0.8, y: 18}, {opacity: 1, scale: 1, y: 0, duration: 0.12, ease: 'back.out(2)'}, st);
    tl.to(cl, {opacity: 0, duration: 0.05}, st + du - 0.05);
    const ws = $$('.cw', c);
    ws.forEach((w, j) => {
      tl.set(w, {color: '#5DF2C6', scale: 1.08}, parseFloat(w.dataset.t));
      if (j < ws.length - 1) tl.set(w, {color: '#FFFFFF', scale: 1}, parseFloat(ws[j + 1].dataset.t));
    });
  });

  window.__timelines = window.__timelines || {};
  window.__timelines['main'] = tl;
})();
