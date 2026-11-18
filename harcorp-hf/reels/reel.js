(function () {
  const R = window.R;
  const tl = gsap.timeline({paused: true});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
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
  const X = 'expo.out';
  const flash = (t, o = 0.55) => tl.fromTo('#flash', {opacity: o}, {opacity: 0, duration: 0.14, ease: 'power2.out'}, t);
  const shake = (sel, t, amp = 14, n = 5) => {
    for (let k = 0; k < n; k++) tl.set(sel, {x: (hash(t * 10 + k) - 0.5) * amp * 2, y: (hash(t * 10 + k + 9) - 0.5) * amp * 2}, t + k * 0.033);
    tl.set(sel, {x: 0, y: 0}, t + n * 0.033);
  };
  const pix = $$('#pix .px');
  const pixel = (at) => {
    pix.forEach((el, i) => {
      const cx = i % 12;
      const cy = Math.floor(i / 12);
      const d = Math.hypot(cx - 5.5, cy - 6.5) / 9 + hash(i) * 0.1;
      tl.set(el, {backgroundColor: hash(i + 3) > 0.75 ? '#E4ECE7' : '#5DF2C6'}, Math.max(0, at - 0.4));
      tl.to(el, {opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out'}, at - 0.26 + d * 0.2);
      tl.to(el, {opacity: 0, scale: 0.2, duration: 0.14, ease: 'power2.in'}, at + 0.03 + d * 0.2);
    });
  };

  // ---------- global ----------
  tl.fromTo('#grid', {y: 0}, {y: -90, duration: R.total, ease: 'none'}, 0);
  const prox = {v: 0};
  const waves = [];
  const counters = [];
  tl.to(prox, {
    v: 1,
    duration: R.total,
    ease: 'none',
    onUpdate: () => {
      const t = tl.time();
      const f = Math.floor(t * 30);
      $('#grect').setAttribute('x', -110 + (hash(f) - 0.5) * 140);
      $('#grect').setAttribute('y', -110 + (hash(f + 5) - 0.5) * 140);
      waves.forEach((w) => {
        if (t < w.s || t > w.e) return;
        w.bars.forEach((el, i) => {
          const x = i / (w.bars.length - 1);
          const taper = Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * x)), 0.8);
          const age = Math.abs(x - 0.5) * 0.25;
          const lv = Math.max(...w.vos.map((v) => envAt(v, t - age)));
          const k = Math.max(0.025 + 0.02 * Math.sin(i * 0.7 + t * 9), lv * (0.55 + 0.45 * hash(i * 7 + f)));
          const hh = 4 + 520 * k * taper;
          el.style.height = hh + 'px';
          el.style.marginTop = -hh / 2 + 'px';
          el.style.opacity = 0.4 + 0.6 * Math.min(1, k * 3);
        });
      });
      counters.forEach((c) => {
        if (t < c.s || t > c.e) return;
        const p = Math.min(1, Math.max(0, (t - c.s) / c.d));
        c.el.textContent = String(Math.round(c.to * (1 - Math.pow(1 - p, 3)))).padStart(3, '0');
      });
      if (R.timer && t < R.shots[R.shots.length - 1].start) {
        // fake "time to ship" clock: maps shot starts to split seconds
        const marks = [];
        R.shots.forEach((s) => s.params.split && marks.push([s.start, s.params.split[0], s.params.split[1]]));
        let val = 0;
        let lab = '';
        if (t >= marks[0][0]) {
          for (let k = 0; k < marks.length; k++) {
            const [ts, v, l] = marks[k];
            const nx = marks[k + 1];
            if (t >= ts) {
              lab = (k ? '✓ ' : '● ') + l + '  ' + v.toFixed(1) + 'S';
              val = nx ? v + ((t - ts) / (nx[0] - ts)) * (nx[1] - v) : v;
            }
          }
        }
        const d = $('#tdig');
        d.textContent = '00:' + val.toFixed(2).padStart(5, '0');
        d.style.color = t >= marks[marks.length - 1][0] ? '#5DF2C6' : '#E4ECE7';
        $('#tsplit').textContent = lab;
      }
    },
  }, 0);

  // ---------- shots ----------
  R.shots.forEach((s, si) => {
    const S = s.start;
    const D = s.dur;
    const el = $('#s' + s.i);
    const q = (sel) => $$(sel, el);
    const vo = s.vo;
    const words = vo.flatMap((v) => v.words);
    // punch-in on every cut
    tl.fromTo(el, {scale: 1.12, opacity: 0}, {scale: 1, opacity: 1, duration: 0.16, ease: X}, S);
    tl.to(el, {scale: 1.035, duration: Math.max(0.1, D - 0.2), ease: 'none'}, S + 0.16);
    if (si < R.shots.length - 1) tl.to(el, {opacity: 0, scale: 0.97, duration: 0.07, ease: 'power2.in'}, S + D - 0.07);

    if (s.kind === 'slam') {
      const sw = q('.sw');
      const n = sw.length;
      sw.forEach((w, j) => {
        const wi = Math.min(words.length - 1, Math.round((j * words.length) / n));
        const t = j === 0 ? S + 0.02 : Math.max(S + 0.05, words[wi].t);
        tl.fromTo(w, {opacity: 0, scale: 2.4, y: -20}, {opacity: 1, scale: 1, y: 0, duration: 0.2, ease: X}, t);
        flash(t + 0.05, j === s.params.accent ? 0.4 : 0.2);
        shake(el.querySelector('.slamwrap'), t + 0.08, j === s.params.accent ? 18 : 9);
      });
      q('.key').forEach((k, j) => {
        const a = hash(j * 3.1) * Math.PI * 2;
        const r = 380 + hash(j + 1) * 420;
        tl.fromTo(k, {opacity: 0, x: 0, y: 0, rotation: 0, scale: 0.6}, {opacity: 1, scale: 1, x: Math.cos(a) * r, y: Math.sin(a) * r * 0.9, rotation: (hash(j + 2) - 0.5) * 220, duration: Math.min(1.4, D), ease: 'power3.out'}, S + 0.03 + hash(j + 4) * 0.12);
        tl.to(k, {opacity: 0.25, duration: 0.4}, S + D * 0.6);
      });
      const sub = q('.sub')[0];
      if (sub) tl.fromTo(sub, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.25, ease: X}, S + 0.3);
    }

    if (s.kind === 'wave') {
      const bars = q('.bar');
      waves.push({s: S, e: S + D, bars, vos: vo});
      const tag = q('.wtag')[0];
      tl.fromTo(tag, {opacity: 0, y: -20}, {opacity: 1, y: 0, duration: 0.2, ease: X}, S + 0.05);
      for (let k = 0; k < Math.floor(D / 0.5); k++) tl.to(tag.querySelector('u'), {opacity: k % 2 ? 1 : 0.25, duration: 0.01}, S + 0.25 + k * 0.5);
      tl.fromTo(q('.wglow')[0], {opacity: 0}, {opacity: 1, duration: 0.3}, S);
      tl.fromTo(q('.wmeta')[0], {opacity: 0}, {opacity: 1, duration: 0.3}, S + 0.15);
    }

    if (s.kind === 'net') {
      q('.node').forEach((n, j) => tl.fromTo(n, {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)'}, S + 0.02 + hash(j) * 0.35));
      q('.edge').forEach((e, j) => tl.to(e, {attr: {'stroke-dashoffset': 0}, duration: 0.3, ease: 'power2.out'}, S + 0.08 + hash(j + 9) * 0.4));
      tl.fromTo(q('.sbar')[0], {y: -220}, {y: 1200, duration: 0.8, ease: 'power1.inOut'}, S + 0.1);
      counters.push({el: q('.cnt')[0], s: S + 0.05, d: Math.min(0.9, D * 0.45), e: S + D, to: 214});
      const lt = S + Math.min(0.75, D * 0.38);
      q('.lock').forEach((l, j) => {
        tl.fromTo(l, {opacity: 0, scale: 2.4}, {opacity: 1, scale: 1, duration: 0.22, ease: X}, lt + j * 0.14);
      });
      tl.to(q('.tpath')[0], {attr: {'stroke-dashoffset': 0}, duration: 0.45, ease: 'power2.inOut'}, lt);
      tl.fromTo(el.querySelector('.netsvg'), {scale: 1, transformOrigin: '540px 680px'}, {scale: 1.1, duration: D, ease: 'none'}, S);
    }

    if (s.kind === 'diff') {
      const term = q('.term')[0];
      tl.fromTo(term, {y: 80, opacity: 0}, {y: 0, opacity: 1, duration: 0.22, ease: X}, S);
      const lns = q('.ln');
      let k = 0;
      const step = Math.min(0.16, (D - 0.5) / lns.length);
      lns.forEach((ln) => {
        const tx = ln.querySelector('.tx');
        const w = (tx.textContent.length * 18.6) + 24;
        if (ln.classList.contains('add') || ln.classList.contains('del')) {
          const t = S + 0.2 + k * step;
          tl.fromTo(ln.querySelector('.hl'), {width: 0}, {width: w, duration: 0.14, ease: 'power3.out'}, t);
          const ck = ln.querySelector('.ck');
          if (ck) tl.fromTo(ck, {opacity: 0, scale: 0}, {opacity: 1, scale: 1, duration: 0.16, ease: 'back.out(3)'}, t + 0.12);
          const sk = ln.querySelector('.strike');
          if (sk) tl.fromTo(sk, {width: 0}, {width: w, duration: 0.12, ease: 'none'}, t + 0.14);
          k++;
        }
      });
    }

    if (s.kind === 'tests') {
      q('.trow').forEach((r, j) => {
        tl.fromTo(r, {opacity: 0, x: 60}, {opacity: 1, x: 0, duration: 0.16, ease: X}, S + 0.03 + j * 0.06);
        tl.to(r.querySelector('i'), {scaleX: 1, duration: 0.35, ease: 'power2.inOut'}, S + 0.18 + j * 0.08);
      });
      const bt = S + Math.min(0.75, D * 0.5);
      tl.fromTo(q('.badge')[0], {opacity: 0, scale: 1.6}, {opacity: 1, scale: 1, duration: 0.22, ease: X}, bt);
      tl.fromTo(q('.ringfx')[0], {opacity: 0.9, scale: 0.4}, {opacity: 0, scale: 1.6, duration: 0.5, ease: 'power2.out'}, bt);
      flash(bt, 0.18);
    }

    if (s.kind === 'boot') {
      const bl = q('.bl');
      bl.forEach((b, j) => tl.fromTo(b, {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.1}, S + 0.05 + j * 0.16));
      const g = q('.big span');
      const bt = S + Math.max(0.75, D * 0.42);
      g.forEach((sp, j) => {
        tl.fromTo(sp, {opacity: 0, scale: 1.8}, {opacity: 1, scale: 1, duration: 0.2, ease: X}, bt + j * 0.18);
        flash(bt + j * 0.18 + 0.04, 0.35);
      });
      // rgb glitch accent
      [0.0, 0.07, 0.14].forEach((d, k) => tl.set(q('.big')[0], {x: k === 2 ? 0 : (k ? -10 : 12)}, bt + 0.4 + d));
      const md = q('.micdot')[0];
      tl.fromTo(md, {opacity: 0, scale: 0}, {opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)'}, S + 0.7);
      for (let k = 0; k < 6; k++) tl.to(md, {scale: k % 2 ? 1 : 1.35, duration: 0.18, ease: 'sine.inOut'}, S + 0.9 + k * 0.18);
    }

    if (s.kind === 'mark') {
      tl.fromTo(q('.bloom')[0], {opacity: 0, scale: 0.5}, {opacity: 1, scale: 1.1, duration: 0.6, ease: X}, S);
      tl.fromTo(q('.ringdraw')[0], {attr: {'stroke-dashoffset': 2671}}, {attr: {'stroke-dashoffset': 0}, duration: 0.55, ease: 'power3.inOut'}, S + 0.02);
      [['.mp-stemLeft', {y: -200}], ['.mp-bar', {x: -260}], ['.mp-stemRight', {y: 220}], ['.mp-dotTop', {scale: 0, transformOrigin: '50% 50%'}], ['.mp-dotBottom', {scale: 0, transformOrigin: '50% 50%'}]].forEach(([sel, fr], j) =>
        tl.fromTo(q(sel)[0], {opacity: 0, ...fr}, {opacity: 1, x: 0, y: 0, scale: 1, duration: 0.25, ease: X}, S + 0.15 + j * 0.05),
      );
      q('.word span').forEach((sp, j) => tl.fromTo(sp, {opacity: 0, y: 60}, {opacity: 1, y: 0, duration: 0.22, ease: X}, S + 0.4 + j * 0.04));
      tl.fromTo(q('.sweep')[0], {x: 0}, {x: 1700, duration: 0.6, ease: 'power2.inOut'}, S + 0.7);
      flash(S + 0.4, 0.25);
    }

    if (s.kind === 'alert') {
      const fail = s.params.state === 'fail';
      const card = q('.card')[0];
      tl.fromTo(card, {opacity: 0, scale: 1.25, rotation: fail ? -3 : 0}, {opacity: 1, scale: 1, rotation: 0, duration: 0.2, ease: X}, S + 0.02);
      tl.fromTo(q('.redwash')[0], {opacity: 0}, {opacity: 1, duration: 0.15}, S);
      tl.fromTo(q('.asc')[0], {opacity: 0}, {opacity: 1, duration: 0.15}, S + 0.1);
      if (fail) {
        shake(card, S + 0.1, 22, 7);
        for (let k = 0; k < 4; k++) tl.to(q('.redwash')[0], {opacity: k % 2 ? 1 : 0.35, duration: 0.01}, S + 0.3 + k * 0.2);
        flash(S + 0.05, 0.4);
      } else {
        flash(S + 0.04, 0.45);
        tl.fromTo(card, {scale: 1.25}, {scale: 1, duration: 0.25, ease: X}, S + 0.02);
      }
    }

    if (s.kind === 'logo') {
      const pts = q('.pt');
      pts.forEach((p, j) => {
        const a = hash(j) * Math.PI * 2;
        const r = 300 + hash(j + 1) * 800;
        tl.fromTo(p, {x: Math.cos(a) * r, y: Math.sin(a) * r, opacity: 0}, {x: 0, y: 0, opacity: 1, duration: 0.7, ease: 'expo.inOut'}, S + hash(j + 2) * 0.15);
      });
      const hit = S + 0.85;
      tl.to(q('.pts')[0], {opacity: 0, duration: 0.2}, hit);
      tl.fromTo(q('.markwrap')[0], {opacity: 0}, {opacity: 1, duration: 0.15}, hit - 0.05);
      tl.set(q('.ringdraw')[0], {attr: {'stroke-dashoffset': 0}}, hit - 0.05);
      tl.fromTo(q('.bloom')[0], {opacity: 0, scale: 0.6}, {opacity: 0.8, scale: 1.1, duration: 0.6, ease: X}, hit);
      flash(hit, 0.5);
      q('.hcw span').forEach((sp, j) => tl.fromTo(sp, {opacity: 0, y: 60}, {opacity: 1, y: 0, duration: 0.25, ease: X}, hit + 0.1 + j * 0.045));
      tl.fromTo(q('.tag')[0], {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.3, ease: X}, hit + 0.45);
      tl.fromTo(q('.lkw')[0], {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.3, ease: X}, hit + 0.6);
      tl.fromTo(q('.sweep')[0], {x: 0}, {x: 1700, duration: 0.7, ease: 'power2.inOut'}, hit + 0.5);
    }
  });
  // pixel dissolve into the end card
  const last = R.shots[R.shots.length - 1];
  pixel(last.start);

  // ---------- captions: pop per chunk, active word highlight ----------
  $$('.cap').forEach((c) => {
    const st = parseFloat(c.dataset.start);
    const du = parseFloat(c.dataset.duration);
    const cl = c.querySelector('.cl');
    tl.fromTo(cl, {opacity: 0, scale: 0.82, y: 16}, {opacity: 1, scale: 1, y: 0, duration: 0.12, ease: 'back.out(2)'}, st);
    tl.to(cl, {opacity: 0, duration: 0.05}, st + du - 0.05);
    const ws = $$('.cw', c);
    ws.forEach((w, j) => {
      const t = parseFloat(w.dataset.t);
      tl.set(w, {color: '#5DF2C6', scale: 1.08}, t);
      if (j < ws.length - 1) tl.set(w, {color: '#FFFFFF', scale: 1}, parseFloat(ws[j + 1].dataset.t));
    });
  });

  window.__timelines = window.__timelines || {};
  window.__timelines['main'] = tl;
})();
