// =========================================================
// RAPID REACH LLC — GLASS EDITION · interactions
// Each numbered block is independent. Delete one to remove
// that effect without breaking the rest of the site.
// =========================================================
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

// 1. Header: frosted when scrolled, hides on scroll-down, mobile drawer, active link, progress bar
const header = $('#header'), bar = $('#bar'), burger = $('#burger'), drawer = $('#drawer');
let lastY = 0;
// Scroll work is batched into one rAF per frame: read layout first, then write.
const progressEl = $('#progress'), totop = $('#totop'), mbar = $('#mbar');
let scrollQueued = false;
function onScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight || 1; // reads
    bar.classList.toggle('scrolled', y > 24); // header stays pinned so "See If You Qualify" is always one click away
    if (mbar) mbar.classList.toggle('show', y > 600);
    progressEl.style.transform = `scaleX(${y / max})`;
    totop.classList.toggle('show', y > 900);
  });
}
function setDrawer(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.textContent = open ? 'Close' : 'Menu';
  drawer.hidden = !open;
  bar.classList.toggle('open', open);
}
burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
$$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

const navLinks = $$('#nav a');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['firm', 'system', 'guarantee', 'faq'].forEach((id) => sectionObs.observe($('#' + id)));

// 2. Cursor light that trails the mouse
const glow = $('#cursor-glow');
if (finePointer && !reduce) {
  let gx = 0, gy = 0, tx = 0, ty = 0, running = false;
  // the loop stops once the glow catches up with the cursor and restarts on the next move
  function loop() {
    gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) requestAnimationFrame(loop); else running = false;
  }
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!running) { running = true; requestAnimationFrame(loop); }
  });
}

// 3. Glass surfaces: light + glowing border follow the cursor (one update per frame)
let glassEvt = null;
document.addEventListener('pointermove', (e) => {
  const first = !glassEvt; glassEvt = e;
  if (!first) return;
  requestAnimationFrame(() => {
    const ev = glassEvt; glassEvt = null;
    const g = ev.target.closest && ev.target.closest('.glass');
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', ev.clientX - r.left + 'px');
    g.style.setProperty('--my', ev.clientY - r.top + 'px');
  });
});

// 4. 3D tilt on cards
if (finePointer && !reduce) {
  $$('.tilt, #tcard').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-6px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// 5. Magnetic buttons + click ripple
$$('.btn').forEach((btn) => {
  if (finePointer && !reduce && btn.classList.contains('magnetic')) {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  }
  btn.addEventListener('click', (e) => {
    const r = btn.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const d = document.createElement('span');
    d.className = 'ripple';
    d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    btn.appendChild(d);
    setTimeout(() => d.remove(), 700);
  });
});

// 6. Marquee text (edit the phrases here)
const phrases = ['6-Point Qualification', 'Live Transfers Only', 'Your Ad Account', '100% Data Ownership', 'Every Call Recorded', 'Replaced Free If It Misses', 'Real US In-House Team'];
$('#track').innerHTML = [...phrases, ...phrases, ...phrases, ...phrases].map((p) => `<span>${p}</span>`).join('');

// 7. Hero: live transfer card plays the 6-point check in a loop, with a ticking call timer
const crit = $$('#crit li'), foot = $('#t-foot'), tTime = $('#t-time');
if (crit.length) {
  let seconds = 0, timer;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  function play() {
    crit.forEach((li) => li.classList.remove('ok'));
    foot.classList.remove('on');
    clearInterval(timer); seconds = 0; tTime.textContent = 'Now';
    if (reduce) { crit.forEach((li) => li.classList.add('ok')); foot.classList.add('on'); return; }
    timer = setInterval(() => { seconds++; tTime.textContent = fmt(seconds); }, 1000);
    crit.forEach((li, i) => setTimeout(() => li.classList.add('ok'), 1500 + i * 750));
    setTimeout(() => { foot.classList.add('on'); clearInterval(timer); }, 1500 + crit.length * 750 + 300);
    setTimeout(play, 1500 + crit.length * 750 + 5500);
  }
  setTimeout(play, 900);
}

// 8. Hero: glowing gold particle network that reacts to the cursor
const cv = $('#net');
if (cv && !reduce) {
  const ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 }, visible = true;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  function size() {
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(80, Math.floor((W * H) / 15000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.6 }));
  }
  size(); addEventListener('resize', size);
  cv.parentElement.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, md = Math.hypot(dx, dy);
      if (md < 140) { p.x += (dx / md) * 1.4; p.y += (dy / md) * 1.4; }
    }
    for (let a = 0; a < pts.length; a++) {
      const p = pts[a];
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = 'rgba(243,223,174,.85)'; ctx.fill();
      for (let b = a + 1; b < pts.length; b++) {
        const q = pts[b], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 125) { ctx.strokeStyle = `rgba(212,176,122,${(1 - d / 125) * 0.26})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < 170) { ctx.strokeStyle = `rgba(255,236,190,${(1 - md / 170) * 0.7})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
  })();
}

// 9. Scroll reveal (staggered via --d) + number count-up
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    setTimeout(() => e.target.classList.add('done'), 1500);
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.rv').forEach((el) => io.observe(el));

function countUp(el) {
  const end = +el.dataset.count;
  if (reduce || end === 0) { el.textContent = end; return; }
  const t0 = performance.now(), dur = 1800;
  (function step(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

// 10. FAQ accordion (one open at a time)
const faqItems = $$('#faq-list .q');
faqItems.forEach((item, i) => {
  const btn = $('button', item);
  const panel = $('.ans', item);
  panel.id = 'faq-a' + (i + 1); btn.setAttribute('aria-controls', panel.id);
  btn.addEventListener('click', () => {
    const willOpen = !item.classList.contains('open');
    faqItems.forEach((o) => { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); });
    if (willOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
});

// 11. Qualify modal: opens from any link to #qualify, emails the request through Web3Forms
// (free service; this access key is meant to be public. Leads go to the email it was created with.)
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const WEB3FORMS_KEY = '22e97922-61ee-44c7-8564-caa7c1903db2';
const overlay = $('#overlay'), qForm = $('#q-form'), qErr = $('#q-err'), qSubmit = $('#q-submit');
const formWrap = $('#q-form-wrap'), okBox = $('#q-ok');
const FALLBACK_EMAIL = 'michaelt@rapidreachllc.biz';
let lastFocus = null;

// two steps: 1 = market + volume, 2 = contact details
const step1 = $('#q-step1'), step2 = $('#q-step2'), stepLbl = $('#q-step-lbl'), stepBar = $('#q-bar');
function showStep(n, focus) {
  for (const [el, on] of [[step1, n === 1], [step2, n === 2]]) {
    el.classList.toggle('off', !on); el.inert = !on; el.setAttribute('aria-hidden', String(!on));
  }
  stepLbl.textContent = `Step ${n} of 2`; stepBar.style.width = n * 50 + '%';
  qErr.hidden = true;
  if (focus && !matchMedia('(pointer: coarse)').matches) $(n === 1 ? '#q-city' : '#q-name').focus();
}
function nextStep() {
  for (const f of $$('input[required]', step1)) if (!f.checkValidity()) { f.reportValidity(); return; }
  showStep(2, true);
}
$('#q-next').addEventListener('click', nextStep);
$('#q-back').addEventListener('click', () => showStep(1, true));

function openModal() {
  lastFocus = document.activeElement;
  showStep(1, false);
  formWrap.hidden = false; okBox.hidden = true; qErr.hidden = true;
  qSubmit.disabled = false; qSubmit.textContent = 'Schedule My Qualification Call →';
  overlay.inert = false; overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => $('#q-city').focus(), 250);
}
function closeModal() {
  overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); overlay.inert = true;
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href="#qualify"]');
  if (!link) return;
  e.preventDefault(); setDrawer(false); openModal();
});
$('#q-close').addEventListener('click', closeModal);
$('#q-done').addEventListener('click', closeModal);
overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeModal(); });
addEventListener('keydown', (e) => {
  if (!overlay.classList.contains('open')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key !== 'Tab') return;
  // keep Tab / Shift+Tab inside the dialog
  const f = $$('button, input, select, a[href]', overlay).filter((el) => !el.disabled && !el.closest('[hidden], fieldset[inert]') && el.tabIndex >= 0 && !el.closest('.hp'));
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// phone auto-format (555) 123-4567, email tidy
$('#q-phone').addEventListener('input', (e) => {
  const v = e.target.value;
  if (v.trim().startsWith('+')) { e.target.value = v.replace(/[^\d+\s()-]/g, '').slice(0, 20); return; }
  let d = v.replace(/\D/g, '');
  if (d.length > 10 && d.startsWith('1')) d = d.slice(1);
  d = d.slice(0, 10);
  e.target.value = d.length < 4 ? d : d.length < 7 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
});
$('#q-email').addEventListener('blur', (e) => { e.target.value = e.target.value.trim().toLowerCase(); });

qForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  qErr.hidden = true;
  if (!step1.inert) { nextStep(); return; } // Enter on step 1 just moves on
  if (!qForm.checkValidity()) { qForm.reportValidity(); return; }
  qSubmit.disabled = true; qSubmit.textContent = 'Sending…';
  try {
    const data = Object.fromEntries(new FormData(qForm));
    // Hidden trap field: real visitors never fill it in. Pretend success so bots move on.
    if (!data.company) {
      const res = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New qualification request: ${data.name} (${data.city}, ${data.state})`,
          from_name: 'Rapid Reach Website',
          name: data.name, email: data.email, phone: data.phone,
          city: data.city, state: data.state, monthly_lead_volume: data.volume,
          consent_to_be_contacted: data.consent ? 'Yes' : 'No',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error('We could not send your request.');
    }
    formWrap.hidden = true; okBox.hidden = false; qForm.reset();
  } catch (err) {
    qErr.innerHTML = '';
    qErr.append(`${err.message} You can also email us directly at `);
    const a = document.createElement('a'); a.href = 'mailto:' + FALLBACK_EMAIL; a.textContent = FALLBACK_EMAIL;
    qErr.append(a, '.'); qErr.hidden = false;
    qSubmit.disabled = false; qSubmit.textContent = 'Schedule My Qualification Call →';
  }
});

// 12. Footer year
$('#year').textContent = new Date().getFullYear();

// 13. ROI calculator
(() => {
  const comm = document.getElementById('c-comm'), rng = document.getElementById('c-xfer');
  if (!comm || !rng) return;
  const out = document.getElementById('c-xfer-out'), m = document.getElementById('c-month');
  const quick = document.querySelectorAll('.quick button');
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const update = () => {
    const c = Number(comm.value.replace(/\D/g, '')) || 0, n = Number(rng.value);
    out.textContent = n;
    rng.style.setProperty('--p', ((n - 5) / 10 * 100) + '%');
    m.textContent = usd(c * n);
    quick.forEach((b) => { const on = Number(b.dataset.v) === n; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  };
  comm.addEventListener('input', () => {
    // keep the caret after the same digit while commas are re-inserted
    const digitsBefore = comm.value.slice(0, comm.selectionStart).replace(/\D/g, '').length;
    const d = comm.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 8);
    comm.value = d ? Number(d).toLocaleString('en-US') : '';
    let pos = 0, seen = 0;
    while (pos < comm.value.length && seen < digitsBefore) { if (/\d/.test(comm.value[pos])) seen++; pos++; }
    comm.setSelectionRange(pos, pos);
    update();
  });
  rng.addEventListener('input', update);
  quick.forEach((b) => b.addEventListener('click', () => { rng.value = b.dataset.v; update(); }));
  update();
})();

// 14. FAQ categories: one group visible at a time, keyboard-navigable tabs
(() => {
  const tabs = $$('.faq-tabs [role="tab"]'), panel = $('#faq-list');
  if (!tabs.length) return;
  function show(cat, focus) {
    tabs.forEach((t) => { const on = t.dataset.cat === cat; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on) { panel.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); } });
    let n = 0;
    faqItems.forEach((item) => {
      const match = item.dataset.cat === cat;
      item.hidden = !match;
      item.classList.remove('open'); $('button', item).setAttribute('aria-expanded', 'false');
      if (match) { n++; $('.num', item).textContent = String(n).padStart(2, '0'); item.classList.add('in', 'done'); }
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t.dataset.cat));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); show(tabs[(i + k + tabs.length) % tabs.length].dataset.cat, true); }
      if (e.key === 'Home') { e.preventDefault(); show(tabs[0].dataset.cat, true); }
      if (e.key === 'End') { e.preventDefault(); show(tabs[tabs.length - 1].dataset.cat, true); }
    });
  });
  show('pricing');
})();
