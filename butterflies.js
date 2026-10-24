// Procedural pearl-white butterflies – drawn from sprites, no video.
const PALETTES = [
  { a: '#ffffff', b: '#dfe5f1', edge: '#d8c7a6', glow: 'rgba(176,140,96,.55)' } // pearl white with a champagne halo so it reads on ivory
];
const FR = 12, S = 150; // flap frames, sprite size
function wing(x, up) { x.beginPath();
  if (up) { x.moveTo(0, -3); x.bezierCurveTo(8, -34, 46, -44, 56, -22); x.bezierCurveTo(60, -8, 28, 4, 0, 5); }
  else { x.moveTo(0, 3); x.bezierCurveTo(30, 2, 44, 26, 28, 40); x.bezierCurveTo(14, 48, 2, 26, 0, 16); }
  x.closePath(); }
function sprite(p, f) {
  const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.translate(S / 2, S / 2 + 4);
  for (const side of [-1, 1]) for (const up of [false, true]) {
    x.save(); x.scale(side * f, 1); wing(x, up);
    const g = x.createLinearGradient(0, up ? -40 : 0, 50, up ? 0 : 40); g.addColorStop(0, p.a); g.addColorStop(1, p.b);
    x.shadowColor = p.glow; x.shadowBlur = 16; x.globalAlpha = .92; x.fillStyle = g; x.fill();
    x.shadowBlur = 0; x.globalAlpha = .55; x.strokeStyle = p.edge; x.lineWidth = 1.4; x.stroke();
    x.globalAlpha = .3; x.strokeStyle = 'rgba(140,112,96,.9)'; x.lineWidth = .8; x.beginPath();
    for (let i = 1; i < 5; i++) { x.moveTo(0, up ? -1 : 6); x.lineTo(i * 11, up ? -26 + i * 3 : 8 + i * 8); } x.stroke(); x.restore(); }
  x.fillStyle = 'rgba(40,30,60,.85)'; x.beginPath(); x.ellipse(0, 4, 2.2, 17, 0, 0, 7); x.fill();
  x.strokeStyle = 'rgba(40,30,60,.8)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, -12); x.quadraticCurveTo(-5, -26, -9, -28); x.moveTo(0, -12); x.quadraticCurveTo(5, -26, 9, -28); x.stroke();
  return c;
}
export function startButterflies(cv, { low = false, reduced = false } = {}) {
  const g = cv.getContext('2d'), sets = PALETTES.map(p => Array.from({ length: FR }, (_, i) => sprite(p, Math.max(.16, Math.abs(Math.cos(i / FR * Math.PI))))));
  let W, H, run = false, last = 0;
  const N = low ? 9 : 15, bs = [];
  const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);
  for (let i = 0; i < N; i++) { const depth = .45 + Math.random() * .9;
    bs.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, h: Math.random() * 6.28, sp: 28 + Math.random() * 36, k: 0, s: depth * (innerWidth < 700 ? .55 : .8), ph: Math.random() * 9, fs: 7 + Math.random() * 5, w: Math.random() * 9, a: .55 + depth * .4 }); }
  function frame(t) { if (!run) return; requestAnimationFrame(frame); const dt = Math.min((t - last) / 1000, .05); last = t; g.clearRect(0, 0, W, H);
    for (const b of bs) { b.w += dt; b.h += (Math.sin(b.w * .7 + b.ph) * 1.2 + Math.sin(b.w * 1.9) * .6) * dt;
      const glide = Math.sin(b.w * .45 + b.ph) > .55; b.ph += dt * (glide ? b.fs * .25 : b.fs);
      const v = b.sp * (glide ? 1.2 : .8) * (.7 + .3 * Math.sin(b.w * 2));
      b.x += Math.cos(b.h) * v * dt; b.y += Math.sin(b.h) * v * dt - 6 * dt;
      if (b.x < -80) b.x = W + 60; if (b.x > W + 80) b.x = -60; if (b.y < -80) b.y = H + 60; if (b.y > H + 80) b.y = -60;
      const f = Math.floor(((Math.sin(b.ph) + 1) / 2) * (FR - 1));
      g.save(); g.globalAlpha = b.a; g.translate(b.x, b.y); g.rotate(b.h + Math.PI / 2); g.scale(b.s, b.s); g.drawImage(sets[b.k][f], -S / 2, -S / 2); g.restore(); } }
  if (reduced) { g.clearRect(0, 0, W, H); bs.forEach(b => { g.save(); g.globalAlpha = b.a; g.translate(b.x, b.y); g.rotate(b.h + 1.57); g.scale(b.s, b.s); g.drawImage(sets[b.k][0], -S / 2, -S / 2); g.restore(); }); return { play() {}, pause() {} }; }
  return { play() { if (!run) { run = true; last = performance.now(); requestAnimationFrame(frame); } }, pause() { run = false; } };
}
