(function () {
  const T = window.T;
  const B = {};
  T.beats.forEach((b) => (B[b.id] = b));
  const tl = gsap.timeline({paused: true});
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const envAt = (v, t) => {
    if (!v) return 0;
    const i = (t - v.at) * 30;
    if (i < 0 || i >= v.env.length - 1) return 0;
    const a = Math.floor(i);
    return v.env[a] + (v.env[a + 1] - v.env[a]) * (i - a);
  };
  // word reveal time inside a VO line (proportional to characters)
  const wordTimes = (v) => {
    const ws = v.text.split(' ');
    let acc = 0;
    return ws.map((w) => {
      const t = v.at + (acc / v.text.length) * v.dur * 0.93;
      acc += w.length + 1;
      return {w, t};
    });
  };
  const E = 'power3.out';
  const EI = 'power2.inOut';

  // ---------- global: grid drift, grain jitter, timecode ----------
  tl.fromTo('#grid', {y: 0}, {y: -80, duration: T.total, ease: 'none'}, 0);
  const proxy = {v: 0};
  tl.to(
    proxy,
    {
      v: 1,
      duration: T.total,
      ease: 'none',
      onUpdate: () => {
        const t = tl.time();
        const f = Math.floor(t * 30);
        $('#grect').setAttribute('x', -90 + (hash(f) - 0.5) * 120);
        $('#grect').setAttribute('y', -90 + (hash(f + 7) - 0.5) * 120);
        $('#tc').textContent = 'T+' + t.toFixed(2).padStart(5, '0');
        // voice bars
        const vb = B.voice;
        if (t >= vb.start && t < vb.start + vb.dur) {
          const dev = vb.vo[1];
          const bars = $$('#wave .bar');
          bars.forEach((el, i) => {
            const age = (bars.length - 1 - i) * 0.018;
            const lv = envAt(dev, t - age);
            const idle = 0.03 + 0.02 * Math.sin(i * 0.5 + t * 6);
            const k = Math.max(idle, lv * (0.55 + 0.45 * hash(i * 13 + Math.floor(t * 30))));
            const x = i / bars.length;
            const taper = Math.pow(Math.sin(Math.PI * x), 0.7);
            el.style.height = 2 + 260 * k * taper + 'px';
            el.style.top = 150 - (1 + 130 * k * taper) + 'px';
            el.style.opacity = 0.35 + 0.65 * Math.min(1, k * 3);
          });
        }
        // file counter
        const rb = B.reads;
        if (t >= rb.start && t < rb.start + rb.dur) {
          const p = Math.min(1, Math.max(0, (t - rb.start - 0.2) / 1.6));
          const e = 1 - Math.pow(1 - p, 3);
          $('#cnt').textContent = String(Math.round(214 * e)).padStart(3, '0');
        }
      },
    },
    0,
  );

  // ---------- pixel-block transition ----------
  const pix = $$('#pix .px');
  const pixel = (at, ox = 0, oy = 0) => {
    pix.forEach((el, i) => {
      const cx = i % 32;
      const cy = Math.floor(i / 32);
      const d = Math.hypot(cx - ox * 31, cy - oy * 17) / 36 + hash(i) * 0.12;
      const col = hash(i + 3) > 0.7 ? '#E4ECE7' : '#5DF2C6';
      tl.set(el, {backgroundColor: col}, at - 0.5);
      tl.to(el, {opacity: 1, scale: 1, duration: 0.16, ease: 'power2.out'}, at - 0.36 + d * 0.3);
      tl.to(el, {opacity: 0, scale: 0.2, duration: 0.2, ease: 'power2.in'}, at + 0.04 + d * 0.3);
    });
  };

  // ======================= 1. CHAOS =======================
  {
    const b = B.chaos;
    const s = b.start;
    const v = b.vo[0];
    const tabs = $$('.tab');
    tabs.forEach((el, i) => {
      tl.fromTo(el, {opacity: 0, scale: 0.7, y: 60}, {opacity: 1, scale: 1, y: 0, duration: 0.45, ease: E}, s + 0.1 + i * 0.045);
    });
    tl.fromTo('#tabs', {scale: 1.0}, {scale: 1.12, duration: b.dur, ease: 'none'}, s);
    tabs.forEach((el, i) => tl.to(el, {opacity: 0.35, duration: 0.6}, s + 2.0 + hash(i) * 0.4));
    const wt = wordTimes(v);
    tl.fromTo('#k1', {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.35, ease: E}, wt[0].t);
    tl.fromTo('#k2', {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.35, ease: E}, wt[2].t);
    tl.fromTo('#k3', {opacity: 0, y: 40, scale: 0.9}, {opacity: 1, y: 0, scale: 1, duration: 0.4, ease: E}, wt[4].t);
    // "stuck" — everything slows and jitters, cursor blinks
    for (let k = 0; k < 6; k++) tl.set('#cur', {opacity: k % 2 ? 0 : 1}, wt[6].t + k * 0.22);
    tl.to(['#k1', '#k2'], {opacity: 0.25, duration: 0.4}, wt[6].t);
    pixel(s + b.dur, 0.5, 0.5);
  }

  // ======================= 2. MEET =======================
  {
    const b = B.meet;
    const s = b.start;
    tl.fromTo('#bloom', {opacity: 0, scale: 0.6}, {opacity: 1, scale: 1.1, duration: 1.2, ease: E}, s + 0.05);
    tl.fromTo('.ringdraw', {attr: {'stroke-dashoffset': 2671}}, {attr: {'stroke-dashoffset': 0}, duration: 0.9, ease: EI}, s + 0.05);
    const pieces = [
      ['.mp-stemLeft', {y: -160}],
      ['.mp-bar', {x: -220}],
      ['.mp-stemRight', {y: 200}],
      ['.mp-dotTop', {scale: 0, transformOrigin: '50% 50%'}],
      ['.mp-dotBottom', {scale: 0, transformOrigin: '50% 50%'}],
    ];
    pieces.forEach(([sel, from], i) => tl.fromTo(sel, {opacity: 0, ...from}, {opacity: 1, x: 0, y: 0, scale: 1, duration: 0.42, ease: 'expo.out'}, s + 0.35 + i * 0.09));
    tl.to('.mark', {y: -70, scale: 0.78, duration: 0.6, ease: EI}, s + 1.05);
    $$('#word span').forEach((el, i) => tl.fromTo(el, {opacity: 0, y: 50}, {opacity: 1, y: 0, duration: 0.4, ease: 'expo.out'}, s + 1.2 + i * 0.06));
    tl.fromTo('#by', {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.6, ease: E}, s + 1.55);
    tl.fromTo('#sweep', {x: 0}, {x: 2400, duration: 0.9, ease: 'power2.inOut'}, s + 1.75);
    tl.to('#s-meet', {scale: 1.06, opacity: 0, duration: 0.3, ease: 'power2.in'}, s + b.dur - 0.3);
  }

  // ======================= 3. VOICE =======================
  {
    const b = B.voice;
    const s = b.start;
    const dev = b.vo[1];
    tl.fromTo('#s-voice', {opacity: 0, scale: 0.96}, {opacity: 1, scale: 1, duration: 0.35, ease: E}, s);
    tl.fromTo('.ring', {opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.5, ease: E}, s + 0.1);
    tl.fromTo('#st', {opacity: 0, x: -30}, {opacity: 1, x: 0, duration: 0.4, ease: E}, s + 0.15);
    tl.set('#stv', {textContent: 'LISTENING'}, dev.at - 0.15);
    tl.set('#stv', {textContent: 'THINKING'}, dev.at + dev.dur + 0.05);
    tl.fromTo('#ringarc', {rotation: 0}, {rotation: 1080, duration: b.dur, ease: 'none', svgOrigin: '90 90'}, s);
    tl.fromTo('#ringdot', {scale: 0.6, transformOrigin: '50% 50%'}, {scale: 1.4, duration: 0.3, yoyo: true, repeat: Math.floor(dev.dur / 0.3), ease: 'sine.inOut'}, dev.at);
    // transcript word by word
    const ws = wordTimes(dev);
    ws.forEach((w, i) => {
      tl.set('#ts', {textContent: '“' + ws.slice(0, i + 1).map((x) => x.w).join(' ') + (i === ws.length - 1 ? '”' : '')}, w.t);
    });
    tl.to('#wave', {scale: 1.04, duration: b.dur, ease: 'none'}, s);
    tl.to('#s-voice', {opacity: 0, y: -40, duration: 0.3, ease: 'power2.in'}, s + b.dur - 0.3);
  }

  // ======================= 4. READS =======================
  {
    const b = B.reads;
    const s = b.start;
    tl.fromTo('#s-reads', {opacity: 0}, {opacity: 1, duration: 0.25}, s);
    $$('.node').forEach((el, i) => tl.fromTo(el, {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)'}, s + 0.05 + hash(i) * 0.6));
    $$('.edge').forEach((el, i) => tl.to(el, {attr: {'stroke-dashoffset': 0}, duration: 0.5, ease: 'power2.out'}, s + 0.2 + hash(i + 40) * 0.8));
    tl.fromTo('#sbar', {x: 0}, {x: 2400, duration: 1.3, ease: 'power1.inOut'}, s + 0.3);
    tl.fromTo('#net', {scale: 1}, {scale: 1.12, x: -60, duration: b.dur, ease: 'power1.inOut'}, s);
    tl.to('#tpath', {attr: {'stroke-dashoffset': 0}, duration: 0.9, ease: EI}, s + 1.6);
    $$('.lock').forEach((el, i) => tl.fromTo(el, {opacity: 0, scale: 2.2}, {opacity: 1, scale: 1, duration: 0.35, ease: 'expo.out'}, s + 1.6 + i * 0.22));
    tl.to('.edge', {opacity: 0.35, duration: 0.5}, s + 1.6);
    tl.to('#s-reads', {opacity: 0, scale: 1.04, duration: 0.3, ease: 'power2.in'}, s + b.dur - 0.3);
  }

  // ======================= 5. WRITES =======================
  {
    const b = B.writes;
    const s = b.start;
    tl.fromTo('#term', {opacity: 0, y: 60, scale: 0.97}, {opacity: 1, y: 0, scale: 1, duration: 0.45, ease: E}, s);
    const adds = ['#l1', '#l2', '#l4'];
    const addAt = [s + 0.35, s + 0.75, s + 1.7];
    adds.forEach((sel, i) => {
      const tx = $(sel + ' .tx');
      const w = tx.getBoundingClientRect().width || 700;
      tl.fromTo(sel + ' .hl', {width: 0}, {width: w + 20, duration: 0.35, ease: 'power3.out'}, addAt[i]);
      tl.fromTo(sel + ' .tx', {clipPath: 'inset(0 100% 0 0)'}, {clipPath: 'inset(0 0% 0 0)', duration: 0.35, ease: 'none'}, addAt[i]);
      tl.fromTo(sel + ' .ck', {opacity: 0, scale: 0}, {opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)'}, addAt[i] + 0.35);
    });
    tl.set('#l4', {display: 'none'}, s);
    const dw = ($('#l3 .tx').getBoundingClientRect().width || 520) + 20;
    tl.fromTo('#l3 .hl', {width: 0}, {width: dw, duration: 0.3, ease: E}, s + 1.1);
    tl.fromTo('#l3 .strike', {width: 0}, {width: dw, duration: 0.25, ease: 'none'}, s + 1.4);
    tl.to('#l3', {height: 0, opacity: 0, duration: 0.25, ease: 'power2.in'}, s + 1.62);
    tl.set('#l4', {display: 'flex'}, s + 1.62);
    $$('.trow').forEach((el, i) => {
      tl.fromTo(el, {opacity: 0, x: 30}, {opacity: 1, x: 0, duration: 0.3, ease: E}, s + 0.4 + i * 0.08);
      tl.to(el.querySelector('i'), {scaleX: 1, duration: 0.6, ease: 'power2.inOut'}, s + 2.0 + i * 0.16);
    });
    tl.fromTo('#badge', {opacity: 0, scale: 1.4}, {opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out'}, s + 2.9);
    tl.to('#s-writes', {opacity: 0, x: -60, duration: 0.3, ease: 'power2.in'}, s + b.dur - 0.3);
  }

  // ======================= 6. PLATFORM =======================
  {
    const b = B.platform;
    const s = b.start;
    const ax = 220;
    const ay = 56;
    const W = 1500 - ax;
    const H = 760 - ay;
    const pad = 24;
    const L = [
      // code: big editor + 3 side panels
      [[pad, pad, W * 0.62, H - 2 * pad], [W * 0.62 + 2 * pad, pad, W * 0.38 - 3 * pad, (H - 4 * pad) / 3], [W * 0.62 + 2 * pad, pad * 2 + (H - 4 * pad) / 3, W * 0.38 - 3 * pad, (H - 4 * pad) / 3], [W * 0.62 + 2 * pad, pad * 3 + (2 * (H - 4 * pad)) / 3, W * 0.38 - 3 * pad, (H - 4 * pad) / 3]],
      // docs: two reading columns + outline strip
      [[pad, pad, W * 0.2, H - 2 * pad], [W * 0.2 + 2 * pad, pad, W * 0.4 - 1.5 * pad, H - 2 * pad], [W * 0.6 + 1.5 * pad, pad, W * 0.4 - 2.5 * pad, (H - 3 * pad) / 2], [W * 0.6 + 1.5 * pad, 2 * pad + (H - 3 * pad) / 2, W * 0.4 - 2.5 * pad, (H - 3 * pad) / 2]],
      // data: dashboard grid
      [[pad, pad, (W - 3 * pad) / 2, (H - 3 * pad) / 2], [2 * pad + (W - 3 * pad) / 2, pad, (W - 3 * pad) / 2, (H - 3 * pad) / 2], [pad, 2 * pad + (H - 3 * pad) / 2, (W - 3 * pad) / 2, (H - 3 * pad) / 2], [2 * pad + (W - 3 * pad) / 2, 2 * pad + (H - 3 * pad) / 2, (W - 3 * pad) / 2, (H - 3 * pad) / 2]],
    ];
    const set = (k, at, dur) => {
      L[k].forEach(([x, y, w, hh], i) => {
        const p = {left: ax + x, top: ay + y, width: w, height: hh};
        if (dur === 0) tl.set('#p' + i, p, at);
        else tl.to('#p' + i, {...p, duration: dur, ease: 'expo.inOut'}, at + i * 0.04);
      });
      const names = ['code', 'docs', 'data'];
      names.forEach((n, j) => tl.to('#s-platform .c-' + n, {opacity: j === k ? 1 : 0, duration: 0.25}, at + (dur ? dur * 0.4 : 0)));
      tl.set('#mode', {textContent: names[k].toUpperCase()}, at + (dur ? dur * 0.4 : 0));
    };
    tl.fromTo('#app', {opacity: 0, scale: 0.92, y: 40}, {opacity: 1, scale: 1, y: 0, duration: 0.5, ease: E}, s);
    tl.fromTo('#ptitle', {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.4, ease: E}, s + 0.15);
    set(0, s, 0);
    const t1 = s + Math.max(1.4, b.dur * 0.34);
    const t2 = s + Math.max(2.8, b.dur * 0.62);
    set(1, t1, 0.7);
    set(2, t2, 0.7);
    $$('.bars3 b').forEach((el, i) => tl.fromTo(el, {scaleY: 0}, {scaleY: 1, duration: 0.5, ease: E}, t2 + 0.4 + hash(i) * 0.3));
    tl.fromTo('#spot', {opacity: 0}, {opacity: 1, duration: 0.4}, t2 + 0.9);
    tl.fromTo('#spot', {'--sx': '30%', '--sy': '35%'}, {'--sx': '72%', '--sy': '70%', duration: 1.4, ease: EI}, t2 + 0.9);
    tl.fromTo('#app', {scale: 1}, {scale: 1.04, duration: b.dur - 0.5, ease: 'none'}, s + 0.5);
    pixel(s + b.dur, 1, 1);
  }

  // ======================= 7. END =======================
  {
    const b = B.end;
    const s = b.start;
    const pts = $$('.pt');
    pts.forEach((el, i) => {
      const a = hash(i) * Math.PI * 2;
      const r = 300 + hash(i + 1) * 900;
      tl.fromTo(el, {x: Math.cos(a) * r, y: Math.sin(a) * r, opacity: 0}, {x: 0, y: 0, opacity: 1, duration: 1.0, ease: 'expo.inOut'}, s + 0.02 + hash(i + 2) * 0.25);
    });
    tl.to('#pts', {opacity: 0, duration: 0.35}, s + 1.35);
    tl.fromTo('.lockup', {opacity: 0}, {opacity: 1, duration: 0.3}, s + 1.2);
    $$('.lockup .lt').forEach((el, i) => tl.fromTo(el, {opacity: 0, y: 60}, {opacity: 1, y: 0, duration: 0.45, ease: 'expo.out'}, s + 1.3 + i * 0.05));
    tl.fromTo('.lockup .inds', {opacity: 0}, {opacity: 1, duration: 0.5}, s + 1.7);
    tl.fromTo('#esweep', {x: 0}, {x: 2600, duration: 1.0, ease: 'power2.inOut'}, s + 1.75);
    $$('#hc span').forEach((el, i) => tl.fromTo(el, {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.45, ease: 'expo.out'}, s + 0.95 + i * 0.06));
    tl.fromTo('#tag', {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5, ease: E}, s + 1.85);
    tl.fromTo('#bloom', {opacity: 0}, {opacity: 0}, s);
  }

  // ======================= captions =======================
  $$('.cap').forEach((el) => {
    const st = parseFloat(el.dataset.start);
    const du = parseFloat(el.dataset.duration);
    const p = el.querySelector('.pill');
    tl.fromTo(p, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.25, ease: E}, st);
    tl.to(p, {opacity: 0, y: -10, duration: 0.2, ease: 'power2.in'}, st + du - 0.22);
  });

  window.__timelines = window.__timelines || {};
  window.__timelines['main'] = tl;
})();
