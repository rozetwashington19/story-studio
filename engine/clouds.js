// Sky clouds (owner request 2026-11-18: "get some clouds in the sky" — every outdoor sky gets clouds from now on).
// clouds(S, opts) builds puffy low-poly (Roblox-ish) clouds in a band far behind the set and makes them drift slowly.
// It is called automatically by dayLight(), the themed worlds' rig() (day + night variants), hill(), ocean(), stoop() and cityNight().
// For a custom sky call it yourself:  clouds(S)  (day)  ·  clouds(S, { night: true })  (dim moonlit)  ·  clouds(S, { tint: 0xffc8a0 })  (sunset).
// Drift needs no code in the shot: it registers itself in S.userData.tickers, which engine/main.html runs every frame.
// opts: n (count), y [min,max] height, z [near,far] distance behind the origin (negative), x half-width, size, speed (units/s),
//       tint (colour), night (dark blue-grey, dimmer), opacity, seed, front (also put a few clouds behind the camera side, for reverse shots)
import * as THREE from 'three';

function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const geo = new THREE.IcosahedronGeometry(1, 1);

export function clouds(S, { n = 14, y = [20, 42], z = [-55, -140], x = 130, size = 1, speed = 0.6, tint = 0xffffff, night = false, opacity = 1, seed = 7, front = true } = {}) {
  const R = rng(seed);
  const col = new THREE.Color(night ? 0x3a4466 : tint), shade = col.clone().multiplyScalar(night ? 0.7 : 0.82);
  const top = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: night ? 0.25 : 0.55, roughness: 1, flatShading: true, fog: false,
    transparent: opacity < 1 || night, opacity: night ? 0.75 * opacity : opacity, depthWrite: !(opacity < 1 || night) });
  const under = top.clone(); under.color = shade; under.emissive = shade; under.emissiveIntensity = night ? 0.18 : 0.4;
  const all = [];
  const make = (cx, cy, cz, s) => {
    const g = new THREE.Group(); g.position.set(cx, cy, cz); g.scale.setScalar(s); S.add(g);
    const puffs = 4 + Math.floor(R() * 4), w = 3 + R() * 3;
    for (let i = 0; i < puffs; i++) {
      const u = puffs === 1 ? 0 : i / (puffs - 1) - 0.5, r = 1.6 + R() * 1.4 * (1 - Math.abs(u));
      const p = new THREE.Mesh(geo, i % 2 ? under : top); p.position.set(u * w * 2, r * 0.45 + R() * 0.6, (R() - 0.5) * 1.6);
      p.scale.set(r * 1.25, r, r); p.rotation.set(R() * 3, R() * 3, R() * 3); g.add(p);
    }
    const base = new THREE.Mesh(geo, under); base.scale.set(w * 1.35, 0.9, 2.0); base.position.y = 0.2; g.add(base);   // flat-ish bottom
    all.push({ g, x0: cx, sp: speed * (0.6 + R() * 0.8) });
  };
  for (let i = 0; i < n; i++) make(-x + (2 * x) * (i + R() * 0.8) / n, y[0] + R() * (y[1] - y[0]), z[0] + R() * (z[1] - z[0]), (1.6 + R() * 1.8) * size);
  if (front) for (let i = 0; i < Math.ceil(n / 3); i++) make(-x + R() * 2 * x, y[0] + R() * (y[1] - y[0]), 70 + R() * 60, (1.6 + R() * 1.6) * size);
  const tick = (t) => { for (const c of all) c.g.position.x = c.x0 + c.sp * t; };
  (S.userData.tickers = S.userData.tickers || []).push(tick); tick(0);
  return { group: all.map(c => c.g), update: tick };
}
