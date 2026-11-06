(() => {
  const d = document;
  const root = d.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Kite entrance. Decorative only: nothing on the page waits for it. Wide screens: it starts in the
  // left margin level with the Google line of the headline and rises up that margin with two and a
  // half slow sways, a string trailing below, then shrinks to header size and clicks into place.
  // Narrow screens: a short rise from just below the header. Any scroll, click or key ends it.
  const kiteIntro = () => {
    if (!root.classList.contains('kite-intro') || still) return;
    const box = d.querySelector('.top .kite-x');
    if (!box || !box.animate) return;
    const kite = box.querySelector('.kite-y');
    const glow = box.querySelector('.kite-glow');
    const string = box.querySelector('.kite-string');
    const wide = innerWidth >= 768;
    const anims = [];
    const run = (el, frames, opts) => { if (el) anims.push(el.animate(frames, { fill: 'backwards', ...opts })); };
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const start = () => {
      const home = box.getBoundingClientRect();
      const anchor = d.querySelector('.n-g');
      const dy = wide
        ? (anchor ? anchor.getBoundingClientRect().top + anchor.getBoundingClientRect().height / 2 : innerHeight * 0.45) - (home.top + home.height / 2)
        : 56;
      const D = wide ? 3200 : 1200;
      const shrink = wide ? 600 : 400;
      const snap = 180;
      const land = D - snap;
      // It flies at 44 px tall on wide screens and 32 px on phones, then settles at the wordmark's size.
      const big = Math.max(1, (wide ? 44 : 32) / (home.height || 17));
      const frames = [];
      const N = wide ? 90 : 30;
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * land;
        const p = t / land;
        const rise = easeOut(p);
        const fade = 1 - p;
        const x = wide ? 10 * fade * Math.sin(p * Math.PI * 5) : 0;
        const rot = wide ? 8 * fade * Math.cos(p * Math.PI * 5) : 0;
        const k = Math.min(1, Math.max(0, (t - (land - shrink)) / shrink));
        const sc = big + (1.08 - big) * (k * k * (3 - 2 * k));
        frames.push({
          offset: t / D,
          opacity: Math.min(1, t / 160),
          transform: `translate(${x.toFixed(2)}px, ${(dy * (1 - rise)).toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`,
        });
      }
      frames[frames.length - 1].easing = 'cubic-bezier(0.3, 0, 0.2, 1)';
      frames.push({ offset: 1, opacity: 1, transform: 'none' });
      box.style.animation = 'none';
      box.style.opacity = '1';
      run(box, frames, { duration: D, easing: 'linear' });

      // The string trails below while it flies and is gone before the landing.
      if (wide) {
        run(string, [
          { opacity: 0, transform: 'rotate(10deg) scaleY(0.6)' },
          { opacity: 0.9, transform: 'rotate(-6deg) scaleY(1)', offset: 0.15 },
          { opacity: 0.8, transform: 'rotate(8deg) scaleY(1)', offset: 0.45 },
          { opacity: 0, transform: 'rotate(0deg) scaleY(0.8)', offset: 0.74 },
          { opacity: 0, transform: 'none' },
        ], { duration: D, easing: 'ease-in-out' });
      }

      // The facets fly a little loose and lock in, in family order, as it lands.
      ['k-o', 'k-a', 'k-g', 'k-l'].forEach((cls, i) => {
        const f = kite.querySelector(`.${cls}`);
        if (!f) return;
        f.style.transformBox = 'fill-box';
        f.style.transformOrigin = 'center';
        run(f, [{ opacity: 0.55, transform: 'scale(0.8)' }, { opacity: 1, transform: 'none' }], {
          duration: 160,
          delay: land - 240 + i * 60,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
        });
      });

      // A brief soft glow on the click.
      run(glow, [
        { opacity: 0, transform: 'scale(0.6)' },
        { opacity: 0.9, transform: 'scale(1)', offset: 0.25 },
        { opacity: 0, transform: 'scale(1.25)' },
      ], { duration: 520, delay: land, easing: 'ease-out' });

      const stop = () => {
        anims.forEach((a) => { try { a.finish(); } catch (e) {} });
        removeEventListener('scroll', stop);
        removeEventListener('pointerdown', stop, true);
        removeEventListener('keydown', stop, true);
      };
      addEventListener('scroll', stop, { passive: true, once: true });
      addEventListener('pointerdown', stop, { capture: true, once: true });
      addEventListener('keydown', stop, { capture: true, once: true });
      Promise.all(anims.map((a) => a.finished)).then(stop, () => {});
    };

    // About 300 ms after first paint, measured from the browser's paint timing when it has one.
    requestAnimationFrame(() => {
      const fp = performance.getEntriesByType?.('paint').find((e) => e.name === 'first-paint');
      const t0 = fp ? fp.startTime : performance.now();
      setTimeout(start, Math.max(0, t0 + 300 - performance.now()));
    });
  };
  kiteIntro();

  // Theme toggle. Dark on a first visit whatever the system setting; the inline head script applies a
  // saved choice before first paint. The button is a toggle for the light theme, so a screen reader
  // hears "Light theme, toggle button, pressed" or "not pressed".
  const toggle = d.querySelector('.theme');
  const sync = () => {
    const light = root.dataset.theme === 'light';
    toggle?.setAttribute('aria-pressed', String(light));
    toggle?.setAttribute('title', light ? 'Switch to dark theme' : 'Switch to light theme');
    d.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f7f8f5' : '#151718');
  };
  sync();
  toggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });

  // Download count. The Worker renders it on the page only at or above its threshold, so a hidden
  // slot stays hidden and nothing here can make the row reflow. A visible count counts up from 0 over
  // about 600 ms (shown as is with reduced motion), then checks /api/downloads every five minutes
  // while the tab is visible and only ever ticks up. Screen readers hear the first render once.
  const counts = [...d.querySelectorAll('[data-downloads]:not([hidden])')];
  if (counts.length) {
    const nf = (() => { try { return new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 1 }); } catch (e) { return new Intl.NumberFormat('en'); } })();
    const fmt = (n) => (n >= 10000 ? `${nf.format(Math.floor(n / 100) / 10)}k` : nf.format(Math.round(n)));
    let total = Math.max(...counts.map((c) => +c.querySelector('[data-total]')?.dataset.total || 0));
    const paint = (n) => counts.forEach((c) => {
      const el = c.querySelector('[data-total]');
      if (!el) return;
      el.textContent = fmt(n);
      el.style.minWidth = `${Math.max(fmt(total).length, parseFloat(el.style.minWidth) || 0)}ch`;
    });
    const announce = () => counts.forEach((c, i) => {
      const sr = c.querySelector('[data-downloads-sr]');
      if (!sr) return;
      const text = `${fmt(total)} downloads`;
      if (i === 0) {
        sr.setAttribute('aria-live', 'polite');
        sr.textContent = '';
        requestAnimationFrame(() => { sr.textContent = text; setTimeout(() => sr.removeAttribute('aria-live'), 1000); });
      } else sr.textContent = text;
    });
    const countUp = (from, to, ms, done) => {
      if (still || !window.requestAnimationFrame) { paint(to); done?.(); return; }
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        paint(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step); else done?.();
      };
      requestAnimationFrame(step);
    };
    countUp(0, total, 600, announce);
    const poll = async () => {
      if (d.hidden) return;
      try {
        const r = await fetch('/api/downloads', { headers: { accept: 'application/json' } });
        const j = await r.json();
        if (j.visible && j.total > total) {
          const from = total;
          total = j.total;
          counts.forEach((c) => c.querySelector('[data-downloads-sr]') && (c.querySelector('[data-downloads-sr]').textContent = `${fmt(total)} downloads`));
          countUp(from, total, 600);
        }
      } catch (e) {}
    };
    let timer = null;
    const arm = () => { clearInterval(timer); timer = d.hidden ? null : setInterval(poll, 300000); };
    d.addEventListener('visibilitychange', arm);
    arm();
  }

  // Release clips. Each plays muted and looped while it is on screen and pauses when it leaves;
  // only the video for the current theme plays. With reduced motion nothing starts on its own.
  const clips = [...d.querySelectorAll('[data-clip] video')];
  if (clips.length && 'IntersectionObserver' in window && !still) {
    const shown = (v) => v.getClientRects().length > 0;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && shown(v)) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    }), { threshold: 0.5 });
    // The markup carries controls for no-script and reduced motion; a clip that plays itself drops them.
    clips.forEach((v) => { v.controls = false; io.observe(v); });
    new MutationObserver(() => clips.forEach((v) => { if (!shown(v)) v.pause(); }))
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  const top = d.getElementById('top');
  const onScroll = () => top?.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Copy buttons stay hidden without JavaScript, so nothing on the page is a dead control.
  const copy = async (btn, text) => {
    try {
      await navigator.clipboard.writeText(text);
      btn.dataset.done = '';
      const label = btn.querySelector('[data-label]');
      const was = label?.textContent;
      if (label) label.textContent = 'Copied';
      btn.setAttribute('aria-label', 'Copied');
      setTimeout(() => {
        delete btn.dataset.done;
        if (label) label.textContent = was;
        btn.removeAttribute('aria-label');
      }, 1600);
    } catch (e) {}
  };
  d.querySelectorAll('[data-copy]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => copy(b, b.dataset.copy));
  });
  d.querySelectorAll('[data-copy-email]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => copy(b, 'ray@rootsnolimits.com'));
  });

  d.querySelectorAll('[data-copy-sha]').forEach((b) => {
    const code = d.querySelector(`[data-sha="${b.dataset.copySha}"]`);
    if (!code || !code.textContent.trim()) return;
    b.hidden = false;
    b.addEventListener('click', () => copy(b, code.textContent.trim()));
  });

  // A link to a FAQ answer opens it.
  const openTarget = () => {
    const t = location.hash && d.getElementById(location.hash.slice(1));
    if (t && t.tagName === 'DETAILS') t.open = true;
  };
  addEventListener('hashchange', openTarget);
  openTarget();

  // Reveal once. With reduced motion everything is shown at once.
  const reveals = d.querySelectorAll('.reveal');
  if (still || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Stream a paragraph in word by word. Every word is laid out from the start and only its opacity
  // changes, so the text never reflows while it types.
  const prep = (el) => {
    if (el.dataset.prepped) return [...el.querySelectorAll('.w')];
    el.dataset.prepped = '1';
    const parts = el.textContent.split(/(\s+)/);
    el.textContent = '';
    for (const part of parts) {
      if (/^\s+$/.test(part)) el.append(part);
      else if (part) {
        const w = d.createElement('span');
        w.className = 'w off';
        w.textContent = part;
        el.append(w);
      }
    }
    return [...el.querySelectorAll('.w')];
  };
  const type = async (el, speed, live) => {
    const words = prep(el);
    words.forEach((w) => w.classList.add('off'));
    for (const w of words) {
      if (!live()) break;
      w.classList.remove('off');
      await sleep(speed * Math.max(1, w.textContent.length / 4));
    }
    words.forEach((w) => w.classList.remove('off'));
  };

  // Hero replay.
  const rp = d.querySelector('[data-replay]');
  if (rp && !still) {
    const items = [...rp.querySelectorAll('[data-at]')];
    const subs = [...rp.querySelectorAll('[data-sub]')];
    const subCount = rp.querySelector('[data-sub-count]');
    const cap = rp.querySelector('[data-caption]');
    const cur = rp.querySelector('[data-cur]');
    const toggle = rp.querySelector('[data-replay-toggle]');
    const thread = rp.querySelector('.thread');
    const inner = rp.querySelector('.thread-inner');
    let run = 0;
    let paused = false;
    let visible = true;

    const setCap = async (t) => {
      if (!cap || cap.textContent === t) return;
      cap.classList.add('swap');
      await sleep(220);
      cap.textContent = t;
      cap.classList.remove('swap');
    };
    // One gauge value can appear in the rail and in the narrow-screen strip.
    const setG = (key, v) => {
      rp.querySelectorAll(`[data-g="${key}"]`).forEach((el) => el.style.setProperty('--v', v));
      rp.querySelectorAll(`[data-gt="${key}"]`).forEach((el) => { el.textContent = v; });
    };
    const live = (fam) => {
      rp.querySelectorAll('[data-row]').forEach((el) => el.classList.toggle('on', el.dataset.row === fam));
      if (cur && fam) {
        cur.textContent = fam.toUpperCase();
        cur.className = `fam fam-${fam}`;
      }
    };
    const follow = (el) => {
      if (!thread || !inner || !el) return;
      const bottom = el.offsetTop + el.offsetHeight + 24;
      inner.style.transform = `translateY(${Math.min(0, thread.clientHeight - bottom)}px)`;
    };
    const show = (n) => {
      const els = items.filter((i) => +i.dataset.at === n);
      els.forEach((i) => i.classList.add('on'));
      const last = els[els.length - 1];
      follow(last?.classList.contains('acc-done') ? last.closest('.it') : last);
    };
    const wait = async (ms, id) => {
      const end = Date.now() + ms;
      while (Date.now() < end || paused || !visible) {
        if (id !== run) return false;
        await sleep(80);
      }
      return id === run;
    };
    const count = async (key, from, to, ms, id) => {
      const steps = Math.max(1, Math.abs(from - to));
      for (let k = 0; k <= steps; k++) {
        if (id !== run) return;
        setG(key, Math.round(from + ((to - from) * k) / steps));
        await sleep(ms / steps);
      }
    };
    const press = async (n, id) => {
      const b = rp.querySelector(`[data-press="${n}"]`);
      if (!b || id !== run) return;
      b.classList.add('pressed');
      await sleep(260);
      b.classList.remove('pressed');
    };
    const typeIn = (n, id) => {
      const el = items.find((i) => +i.dataset.at === n)?.querySelector('[data-type]');
      return el ? type(el, 26, () => id === run) : Promise.resolve();
    };
    const spawn = async (id) => {
      for (const [i, sub] of subs.entries()) {
        if (id !== run) return;
        if (subCount) subCount.textContent = i + 1;
        sub.classList.add('on', 'running');
        await sleep(520);
      }
      for (const sub of subs) {
        if (id !== run) return;
        sub.classList.remove('running');
        await sleep(340);
      }
    };

    const play = async () => {
      const id = ++run;
      items.forEach((i) => i.classList.remove('on'));
      subs.forEach((s) => s.classList.remove('on', 'running'));
      if (subCount) subCount.textContent = '0';
      if (inner) inner.style.transform = 'translateY(0)';
      rp.querySelectorAll('[data-type]').forEach((el) => prep(el).forEach((w) => w.classList.add('off')));
      setG('g5', 88); setG('gw', 66); setG('ow', 81); setG('a5', 12);
      live(null);
      if (cur) { cur.textContent = 'A'; cur.className = 'fam fam-a'; }
      const steps = [
        async () => { await setCap('You ask once.'); show(0); return 1300; },
        async () => { await setCap('The Anthropic orchestrator plans the change.'); rp.classList.add('running'); live('a'); show(1); await typeIn(1, id); return 400; },
        async () => { await setCap('Anthropic starts subagents. Each one shows under its step.'); show(2); count('a5', 12, 6, 1400, id); await spawn(id); return 500; },
        async () => { await setCap('Anthropic reaches its limit.'); await count('a5', 6, 0, 1100, id); return 400; },
        async () => { await setCap('The thread moves to the OpenAI builder with its messages and files.'); live('o'); show(3); return 1500; },
        async () => { await setCap('OpenAI edits a scratch copy of the repository.'); show(4); await typeIn(4, id); return 300; },
        async () => { show(6); count('ow', 81, 80, 900, id); return 1500; },
        async () => { await setCap('Commands wait for your approval.'); show(7); return 1400; },
        async () => { await press(8, id); return 600; },
        async () => { await setCap('A side question runs on the local model beside the builder.'); live('l'); show(9); await typeIn(9, id); return 700; },
        async () => { await setCap('The OpenAI reviewer finds a gap.'); live('o'); show(10); await typeIn(10, id); return 600; },
        async () => { await setCap('The Google fixer closes it.'); live('g'); show(13); count('g5', 88, 85, 1400, id); count('gw', 66, 65, 1400, id); await typeIn(13, id); return 800; },
        async () => { await setCap('Accept makes a new local branch.'); live(null); show(11); return 1300; },
        async () => { await press(12, id); show(12); rp.classList.remove('running'); return 4200; },
      ];
      for (const s of steps) {
        if (!(await wait(0, id))) return;
        const pause = await s();
        if (!(await wait(pause, id))) return;
      }
      if (id === run) play();
    };

    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', () => {
        paused = !paused;
        rp.classList.toggle('paused', paused);
        toggle.setAttribute('aria-label', paused ? 'Play replay' : 'Pause replay');
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(rp);
    }
    d.addEventListener('visibilitychange', () => { visible = !d.hidden; });
    play();
  }

  // Terminal replay, once, when it scrolls into view.
  const term = d.querySelector('[data-term]');
  if (term && !still && 'IntersectionObserver' in window) {
    const lines = [...term.querySelectorAll('[data-t]')];
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const groups = [...new Set(lines.map((l) => +l.dataset.t))];
      for (const g of groups) {
        const ls = lines.filter((l) => +l.dataset.t === g);
        ls.forEach((l) => l.classList.add('on'));
        const t = ls.map((l) => l.querySelector('[data-type]')).find(Boolean);
        if (t) await type(t, 55, () => true);
        await sleep(g === 1 ? 700 : 900);
      }
    }, { threshold: 0.35 });
    io.observe(term);
  }
})();
