// Three.js scene: 3D invitation card emerging from golden light, then petals + gold dust.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
export function initScene(canvas, { low = false, reduced = false } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !low });
  r.setPixelRatio(Math.min(devicePixelRatio, low ? 1.25 : 2));
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, .1, 50); cam.position.z = 6;
  const resize = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);
  scene.add(new THREE.AmbientLight(0xfff0d0, .7));
  const key = new THREE.PointLight(0xffd98a, 40, 20); key.position.set(2, 3, 4); scene.add(key);
  // card
  const tex = new THREE.TextureLoader().load('assets/images/backdrop.jpg'); tex.colorSpace = THREE.SRGBColorSpace;
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9b46a, metalness: .9, roughness: .3 });
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: .6, transparent: true });
  const card = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.67, .05), [gold, gold, gold, gold, face, face]);
  card.visible = false; scene.add(card);
  // petals
  const N = low ? 18 : 40, pg = new THREE.PlaneGeometry(.12, .16);
  const petals = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ color: 0xa81c33, side: THREE.DoubleSide, roughness: .5 }), N);
  const pd = [...Array(N)].map(() => ({ x: (Math.random() - .5) * 9, y: Math.random() * 8 - 4, z: Math.random() * 3 - 2, s: .3 + Math.random() * .6, p: Math.random() * 6 }));
  scene.add(petals);
  // dust
  const M = low ? 80 : 220, pos = new Float32Array(M * 3);
  for (let i = 0; i < M; i++) pos.set([(Math.random() - .5) * 10, (Math.random() - .5) * 8, Math.random() * 4 - 2], i * 3);
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xf3dfa6, size: .03, transparent: true, opacity: .8 })); scene.add(dust);
  const m = new THREE.Object3D(); let t0 = performance.now(), reveal = null, mx = 0, running = true;
  addEventListener('pointermove', e => mx = e.clientX / innerWidth - .5);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });
  const ease = x => 1 - Math.pow(1 - x, 3);
  function loop() {
    if (!running) return; requestAnimationFrame(loop);
    const t = (performance.now() - t0) / 1000;
    if (reveal) { // 0-2.6s: rise & turn from light; 2.6-3.6s: fly through camera and fade
      const e = t - reveal.start;
      if (e < 2.6) { const k = ease(e / 2.6); card.position.set(0, -2 + 2 * k, -2 + 2.2 * k); card.rotation.set(0, (1 - k) * Math.PI * 1.2 + mx * .3, 0); card.scale.setScalar(.6 + .4 * k); }
      else { const k = Math.min((e - 2.6) / 1, 1); card.position.z = .2 + k * 4.5; card.scale.setScalar(1 + k * .5); face.opacity = 1 - k; if (k >= 1) { card.visible = false; reveal.done(); reveal = null; } }
    }
    for (let i = 0; i < N; i++) { const d = pd[i]; d.y -= .004 * d.s * (reduced ? .3 : 1); if (d.y < -4.5) d.y = 4.5;
      m.position.set(d.x + Math.sin(t * .6 + d.p) * .3, d.y, d.z); m.rotation.set(t * d.s + d.p, t * .5 * d.s, d.p); m.updateMatrix(); petals.setMatrixAt(i, m.matrix); }
    petals.instanceMatrix.needsUpdate = true; dust.rotation.y = t * .02; dust.position.y = Math.sin(t * .3) * .1;
    cam.position.x += (mx * .6 - cam.position.x) * .03; cam.lookAt(0, 0, 0); r.render(scene, cam);
  }
  loop();
  return { reveal: () => new Promise(res => { card.visible = true; face.opacity = 1; reveal = { start: (performance.now() - t0) / 1000, done: res }; }) };
}
