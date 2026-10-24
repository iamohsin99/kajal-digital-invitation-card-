// Lightweight 2D canvas: roses/petals/small flowers falling inside a section (runs only while visible).
const COLORS = ['#a81c33', '#c2334a', '#e58a9b', '#f4c9d0', '#8c1228'];
function sprite(kind, color) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.translate(32, 32);
  if (kind === 'petal') { x.fillStyle = color; x.beginPath(); x.moveTo(0, -26); x.bezierCurveTo(26, -14, 22, 16, 0, 26); x.bezierCurveTo(-22, 16, -26, -14, 0, -26); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.moveTo(0, -20); x.lineTo(0, 18); x.stroke(); }
  else { for (let i = 0; i < 5; i++) { x.rotate(Math.PI * 2 / 5); x.fillStyle = color; x.beginPath(); x.ellipse(0, -14, 9, 15, 0, 0, 7); x.fill(); }
    x.fillStyle = '#f3dfa6'; x.beginPath(); x.arc(0, 0, 6, 0, 7); x.fill(); }
  return c;
}
export function attachPetals(section, { low = false, reduced = false } = {}) {
  const cv = document.createElement('canvas'); cv.className = 'petal-cv'; section.prepend(cv);
  const g = cv.getContext('2d'), sprites = [];
  COLORS.forEach(c => { sprites.push(sprite('petal', c), sprite('petal', c)); sprites.push(sprite('flower', c)); });
  let W, H, ps = [], run = false, last = 0;
  const N = () => Math.round((low ? 26 : 52) * Math.min(1.6, Math.max(1, section.clientHeight / 700)));
  const mk = (top) => ({ x: Math.random() * W, y: top ? -40 : Math.random() * H, s: 14 + Math.random() * 22, v: 28 + Math.random() * 50, a: Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * 1.6, sw: 20 + Math.random() * 30, img: sprites[Math.floor(Math.random() * sprites.length)], o: .55 + Math.random() * .4 });
  function size() { W = cv.width = section.clientWidth > 0 ? innerWidth : 0; H = cv.height = section.clientHeight; ps = Array.from({ length: N() }, () => mk(false)); }
  function frame(t) { if (!run) return; requestAnimationFrame(frame); const dt = Math.min((t - last) / 1000, .05); last = t; g.clearRect(0, 0, W, H);
    for (const p of ps) { p.y += p.v * dt; p.a += dt; p.r += p.vr * dt; if (p.y > H + 40) Object.assign(p, mk(true));
      g.save(); g.globalAlpha = p.o; g.translate(p.x + Math.sin(p.a) * p.sw, p.y); g.rotate(p.r); g.scale(1, .55 + .45 * Math.abs(Math.cos(p.a * .8))); g.drawImage(p.img, -p.s / 2, -p.s / 2, p.s, p.s); g.restore(); } }
  size(); addEventListener('resize', size);
  if (reduced) return;
  new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !run) { run = true; last = performance.now(); requestAnimationFrame(frame); } else if (!v) run = false; }).observe(section);
}
