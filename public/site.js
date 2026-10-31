(() => {
  const d = document;
  const root = d.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle. The inline head script applies a saved choice before first paint.
  const sysDark = () => matchMedia('(prefers-color-scheme: dark)').matches;
  d.querySelector('.theme')?.addEventListener('click', () => {
    const now = root.dataset.theme || (sysDark() ? 'dark' : 'light');
    const next = now === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

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
      setG('o5', 9); setG('ow', 82); setG('a5', 33); setG('g5', 88); setG('gw', 66);
      live(null);
      if (cur) { cur.textContent = 'O'; cur.className = 'fam fam-o'; }
      const steps = [
        async () => { await setCap('You ask once.'); show(0); return 1300; },
        async () => { await setCap('OpenAI plans the change.'); rp.classList.add('running'); live('o'); show(1); await typeIn(1, id); return 500; },
        async () => { await setCap('OpenAI reaches its five-hour limit.'); await Promise.all([count('o5', 9, 0, 1300, id), count('ow', 82, 80, 1300, id)]); return 400; },
        async () => { await setCap('The thread moves to Anthropic with its messages and files.'); live('a'); show(3); return 1500; },
        async () => { await setCap('Anthropic starts subagents. Each one shows under its step.'); show(4); count('a5', 33, 32, 900, id); await spawn(id); return 600; },
        async () => { await setCap('Anthropic edits a scratch copy of the repository.'); show(5); await typeIn(5, id); return 300; },
        async () => { show(6); count('a5', 32, 30, 900, id); return 1500; },
        async () => { await setCap('Commands wait for your approval.'); show(7); return 1400; },
        async () => { await press(8, id); return 600; },
        async () => { await setCap('Google answers a side question.'); live('g'); show(9); count('g5', 88, 85, 1400, id); count('gw', 66, 65, 1400, id); await typeIn(9, id); return 700; },
        async () => { await setCap('A local model reviews the work.'); live('l'); show(10); await typeIn(10, id); return 800; },
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
