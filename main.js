import { CONFIG as C } from './config.js';
import { startButterflies } from './butterflies.js';
const $ = s => document.querySelector(s), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const low = (navigator.hardwareConcurrency || 4) <= 4 || innerWidth < 700;
const wait = ms => new Promise(r => setTimeout(r, ms));
// ---- fill content ----
$('#bride').textContent = C.bride; $('#groom').textContent = C.groom; $('#tagline').textContent = C.tagline;
$('#family').textContent = C.family; (() => { const d = new Date(C.weddingDate), f = o => d.toLocaleDateString('en-IN', o);
  $('#dateLabel').innerHTML = `<small>${f({ weekday: 'long' }).toUpperCase()}</small><b>${d.getDate()}</b><span>${f({ month: 'long' }).toUpperCase()} ${d.getFullYear()}</span>`; })(); $('#venue').textContent = C.venue; $('#mapLink').href = C.mapsUrl;
document.title = `${C.bride} & ${C.groom} | Wedding Invitation`;
$('#eventGrid').innerHTML = C.events.map(e => `<div class="card fx"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><h3>${e.name}</h3><div class="orn">❖</div><p class="when">${e.date}</p><p>${e.time}</p><p>${e.place}</p></div>`).join('');
$('#galGrid').innerHTML = C.gallery.map((g, i) => `<img class="fx" src="assets/images/${g}" alt="Wedding artwork ${i + 1}" loading="lazy">`).join('');
$('#galGrid').addEventListener('click', e => { if (e.target.tagName !== 'IMG') return;
  const lb = document.createElement('div'); lb.id = 'lb'; lb.innerHTML = `<img src="${e.target.src}" alt="">`; lb.onclick = () => lb.remove(); document.body.append(lb); });
// ---- countdown ----
const cd = $('#count'), target = new Date(C.weddingDate).getTime();
function tick() { let d = Math.max(0, target - Date.now()) / 1000;
  const v = [['Days', d / 86400], ['Hours', d % 86400 / 3600], ['Minutes', d % 3600 / 60], ['Seconds', d % 60]];
  cd.innerHTML = v.map(([l, n]) => `<div><b>${String(Math.floor(n)).padStart(2, '0')}</b><small>${l}</small></div>`).join(''); }
tick(); setInterval(tick, 1000);
// ---- reveal on scroll ----
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => { [...el.children].forEach((c, i) => c.style.setProperty('--d', i)); io.observe(el); });
document.querySelectorAll('#eventGrid,#galGrid').forEach(p => [...p.children].forEach((c, i) => c.style.setProperty('--i', i)));
const io2 = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io2.unobserve(e.target))), { threshold: .2 });
document.querySelectorAll('.fx').forEach(el => io2.observe(el));
// ---- intro: video + sparks ----
const vid = $('#introVideo'); vid.muted = false; vid.addEventListener('error', () => vid.remove());
const sc = $('#sparks'), g = sc.getContext('2d'); let sp = [], alive = true;
function rs() { sc.width = innerWidth; sc.height = innerHeight; } rs(); addEventListener('resize', rs);
sp = [...Array(low ? 25 : 50)].map(() => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.8 + .4, v: Math.random() * .4 + .1 }));
(function f() { if (!alive) return; g.clearRect(0, 0, sc.width, sc.height); g.fillStyle = 'rgba(243,223,166,.8)';
  sp.forEach(p => { p.y -= p.v; if (p.y < 0) p.y = sc.height; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); }); if (!reduced) requestAnimationFrame(f); })();
// ---- Tap to open: play the video (with sound, allowed by the tap), then reveal ----
$('#openBtn').addEventListener('click', async () => {
  const btn = $('#openBtn'); btn.disabled = true; btn.style.opacity = 0; btn.style.pointerEvents = 'none';
  const music = $('#music'); initMusic(music); $('#sparks').style.display = 'none'; document.querySelector('.grade').style.opacity = 0; // Ishq Sufiyana starts on the tap; video stays pure
  let played = false;
  try { await vid.play(); played = true; }
  catch { try { vid.muted = true; await vid.play(); played = true; } catch {} } // fallback: muted, then poster only
  if (played) await Promise.race([new Promise(r => vid.addEventListener('ended', r, { once: true })), wait(((vid.duration || 4) + 1) * 1000)]);
  else await wait(800);
  // video finished: simple fade straight into the invitation (no extra animation)
  $('#site').hidden = false; $('#couple3d').hidden = false; document.body.classList.remove('locked'); scrollTo(0, 0);
  $('#intro').classList.add('out'); await wait(reduced ? 50 : 450);
  $('#intro').remove(); alive = false; vid.pause();
  initScratch();
  initButterflies();
});
// ---- scratch card: gold foil, smooth brush, strong haptic + shake + sparks on reveal ----
function initScratch() {
  const cv = $('#scratchCv'), box = $('#scratch'), x = cv.getContext('2d'); let done = false, down = false, lx = 0, ly = 0, lastCheck = 0, dpr = 1, W = 0, H = 0;
  function paint() { dpr = Math.min(devicePixelRatio || 1, 2); const pad = 12; W = box.clientWidth - pad * 2; H = box.clientHeight - pad * 2;
    cv.style.cssText = `inset:${pad}px;width:${W}px;height:${H}px`; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.globalCompositeOperation = 'source-over';
    const g = x.createLinearGradient(0, 0, W, H); [[0, '#8b6320'], [.2, '#e8c56f'], [.38, '#fff0b8'], [.55, '#c79a43'], [.78, '#f1d88f'], [1, '#7d5718']].forEach(([o, c]) => g.addColorStop(o, c));
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 14; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.16)' : 'rgba(90,55,10,.14)'; x.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5); }
    x.strokeStyle = 'rgba(255,246,205,.8)'; x.lineWidth = 2; x.strokeRect(10, 10, W - 20, H - 20); x.setLineDash([2, 5]); x.strokeStyle = 'rgba(90,55,10,.5)'; x.strokeRect(18, 18, W - 36, H - 36); x.setLineDash([]);
    const cx = W / 2, cy = H / 2; x.lineWidth = 3.5; x.strokeStyle = 'rgba(92,52,12,.8)'; x.beginPath(); x.arc(cx - 11, cy - 54, 15, 0, 7); x.stroke(); x.beginPath(); x.arc(cx + 11, cy - 54, 15, 0, 7); x.stroke();
    x.textAlign = 'center'; x.font = '600 ' + Math.min(19, W / 15) + 'px Cinzel, serif'; x.letterSpacing = '4px';
    x.fillStyle = 'rgba(255,248,215,.85)'; x.fillText('SCRATCH TO REVEAL', cx + 1, cy + 5); x.fillStyle = 'rgba(80,40,8,.85)'; x.fillText('SCRATCH TO REVEAL', cx, cy + 4);
    x.letterSpacing = '1px'; x.font = 'italic ' + Math.min(22, W / 13) + 'px "Cormorant Garamond", serif'; x.fillStyle = 'rgba(80,40,8,.8)'; x.fillText('the day our forever begins', cx, cy + 36); }
  function stroke(e, first) { const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    x.globalCompositeOperation = 'destination-out'; x.lineCap = x.lineJoin = 'round'; x.lineWidth = 56; x.beginPath(); x.moveTo(first ? px : lx, first ? py : ly); x.lineTo(px + .01, py); x.stroke(); lx = px; ly = py; }
  function check() { const t = performance.now(); if (t - lastCheck < 140) return; lastCheck = t; const d = x.getImageData(0, 0, cv.width, cv.height).data; let c = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 41) { n++; if (d[i] < 30) c++; } if (c / n > .42) finish(); }
  function finish() { if (done) return; done = true; cv.classList.add('done');
    navigator.vibrate && navigator.vibrate([350, 90, 350, 90, 700]); // strong haptic (Android/Chrome; iOS Safari has no vibration API)
    box.classList.add('boom'); setTimeout(() => box.classList.remove('boom'), 1000);
    for (let i = 0; i < 34; i++) { const s = document.createElement('i'), a = Math.random() * 6.28, d = 90 + Math.random() * 190; s.className = 'spark';
      s.style.cssText = `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;animation-delay:${Math.random() * .12}s`; box.append(s); setTimeout(() => s.remove(), 1400); } }
  cv.addEventListener('pointerdown', e => { if (done) return; down = true; box.classList.add('touched'); cv.setPointerCapture(e.pointerId); stroke(e, true); });
  cv.addEventListener('pointermove', e => { if (down && !done) { stroke(e, false); check(); } });
  ['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => { down = false; if (!done) { lastCheck = 0; check(); } }));
  paint(); document.fonts && document.fonts.ready.then(() => { if (!done && !box.classList.contains('touched')) paint(); });
  addEventListener('resize', () => { if (!done && !box.classList.contains('touched')) paint(); });
  if (reduced) { done = true; cv.classList.add('done'); }
}
// ---- background music: Ishq Sufiyana (assets/audio/music.mp3), starts on 'Tap to Open', fades in ----
const bgm = new Audio('assets/audio/music.mp3'); bgm.loop = true; bgm.preload = 'auto'; let wantMusic = false;
function initMusic(btn) { btn.hidden = false; const set = on => { wantMusic = on; btn.setAttribute('aria-pressed', on); };
  bgm.volume = 0; bgm.play().then(() => { set(true); let v = 0; const f = setInterval(() => { v = Math.min(.6, v + .03); bgm.volume = v; if (v >= .6) clearInterval(f); }, 100); }).catch(() => set(false));
  btn.onclick = () => { if (bgm.paused) { bgm.volume = .6; bgm.play().then(() => set(true)).catch(() => {}); } else { bgm.pause(); set(false); } };
  document.addEventListener('visibilitychange', () => { if (document.hidden) bgm.pause(); else if (wantMusic) bgm.play().catch(() => {}); }); }
// ---- RSVP ----
const form = $('#rsvpForm');
function data() { const f = new FormData(form), o = Object.fromEntries(f); const err = [];
  if ((o.name || '').trim().length < 2) err.push('Please enter your name.');
  if (!(+o.guests >= 1 && +o.guests <= 10)) err.push('Guests must be 1–10.');
  if (!o.attend) err.push('Please choose whether you will attend.');
  $('#err').textContent = err.join(' '); return err.length ? null : o; }
form.addEventListener('submit', e => { e.preventDefault(); const o = data(); if (!o) return;
  const t = `Hello! RSVP for ${C.bride} & ${C.groom}'s wedding%0AName: ${o.name}%0AGuests: ${o.guests}%0AResponse: ${o.attend}%0AMessage: ${o.msg || '-'}`;
  open(`https://wa.me/${C.whatsapp}?text=${t}`, '_blank', 'noopener'); });
$('#saveLocal').onclick = () => { const o = data(); if (!o) return; const l = JSON.parse(localStorage.getItem('rsvps') || '[]'); l.push({ ...o, at: new Date().toISOString() });
  localStorage.setItem('rsvps', JSON.stringify(l)); $('#err').style.color = '#2e6b3a'; $('#err').textContent = 'Saved on this device. Use the WhatsApp button to notify the family.'; };
// ---- scroll progress bar + hero parallax ----
let tk = false; const prog = $('#prog'), ht = document.querySelector('.hero-text');
const cp = $('#couple3d'), sd = document.querySelector('.scroll');
addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { const y = scrollY, mx = document.documentElement.scrollHeight - innerHeight;
  sd.classList.toggle('gone', y > 40);
  if (!reduced) { const p = Math.min(1, y / (innerHeight * 1.05)); cp.style.transform = `translate3d(-50%,${y * .7}px,0) scale(${1 - .12 * p})`; cp.style.opacity = 1 - p * p; cp.style.visibility = p >= 1 ? 'hidden' : 'visible'; }
  prog.style.transform = `scaleX(${mx > 0 ? y / mx : 0})`; if (!reduced && y < innerHeight) { ht.style.transform = `translateY(${y * .3}px) scale(${1 - y / 3500})`; ht.style.opacity = Math.max(0, 1 - y / (innerHeight * .8)); } tk = false; }); }, { passive: true });
// ---- generated butterflies overlay (hero, date and events sections only) ----
function initButterflies() {
  const fx = $('#butterflyFx'), bf = startButterflies(fx, { low, reduced }); if (reduced) fx.classList.add('on');
  const vis = new Set();
  const ob = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? vis.add(e.target.id) : vis.delete(e.target.id));
    const on = vis.size > 0; if (reduced) return; fx.classList.toggle('on', on); on ? bf.play() : setTimeout(() => !fx.classList.contains('on') && bf.pause(), 1300); }, { threshold: .15 });
  ['hero', 'couple', 'events'].forEach(id => ob.observe(document.getElementById(id)));
}
