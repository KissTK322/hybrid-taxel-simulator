// ============================================================================
// 3-D taxel view (Three.js). Geometry comes from Physics.geometry(P) and the
// deformation from the same plate fields that deflectionAt() uses.
// Local frame: x, y in the taxel plane, z up, units = mm. The root group is
// rotated so local z maps to screen-up, and scaled in z by the exaggeration.
// ============================================================================
const Viz3D = (() => {
  const MM = 1e3;
  const COLS = { pdms: 0x9FB4C0, tpu: 0xEFD9A0, cnt: 0xB23A3A, pi: 0xE9B44C, e1: 0x5B4B8A, diel: 0x9ED9D6, dielHi: 0x0F7C7A, e2: 0x0F7C7A, glow: 0xC8742B, patch: 0xFFD166, piezo: 0x8DB6E0, e3: 0x2F6FB0, load: 0x5B6470 };
  // visual separation of each layer in exploded view (mm on screen, independent of exaggeration)
  const EXPL = { pdms: -0.7, tpu: 0, cnt: 0.6, e1: 1.3, base: 1.75, diel: 2.2, e2: 2.65, cover: 3.1, piezo: 3.1, e3: 3.55, load: 4.2 };
  const NG = 49, MS = 161, NR = 14, NS = 40;
  let host, ov, renderer, scene, camera, root, clipPlane;
  let M = null, P = null, G = null, st = null;
  let groups = {}, clipMats = [], stack = [], caps = {}, domes = [], patches = [], labels = [];
  let gridF = null, secF = null, wg = null, ws = null, secX = null, arrows = [], borders = [], borderH = 1;
  const opt = { exag: 3, explode: false, e: 0, section: true, labels: true };
  const cam = { th: -0.6, ph: 0.98, r: 10.5, tx: 0, ty: 0.45, tz: 0 };
  let dirty = true, running = false;

  // ---- unit deflection fields at arbitrary points (same data deflectionAt() interpolates)
  function unitFields(xy) {
    const n = xy.length / 2, PF = M.PF, half = G.L / 2;
    const Wp = new Float32Array(n), Wk = G.domes.map(() => new Float32Array(n));
    for (let i = 0; i < n; i++) {
      const x = xy[2 * i], y = xy[2 * i + 1];
      if (Math.abs(x) >= half || Math.abs(y) >= half) continue;      // over the border: clamped, w = 0
      Wp[i] = PF.at(PF.wP, x, y);
      for (let k = 0; k < Wk.length; k++) Wk[k][i] = PF.at(PF.wPt[k], x, y);
    }
    return { n, Wp, Wk };
  }
  function evalW(F, p, force, out) {
    const n = F.n;
    for (let i = 0; i < n; i++) out[i] = p * F.Wp[i];
    for (let k = 0; k < force.length; k++) { const f = force[k]; if (f > 0) { const w = F.Wk[k]; for (let i = 0; i < n; i++) out[i] -= f * w[i]; } }
    return out;
  }

  // ---- geometry builders
  function makeSlab(a) {                     // deformable plate: top grid + bottom grid + 4 side walls
    const n = NG, nn = n * n, pos = new Float32Array((2 * nn + 8 * n) * 3), idx = [];
    const c = i => -a / 2 + a * i / (n - 1);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const k = j * n + i;
      pos[3 * k] = c(i); pos[3 * k + 1] = c(j);
      pos[3 * (nn + k)] = c(i); pos[3 * (nn + k) + 1] = c(j);
    }
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
      const k = j * n + i;
      idx.push(k, k + 1, k + n + 1, k, k + n + 1, k + n);
      idx.push(nn + k, nn + k + n + 1, nn + k + 1, nn + k, nn + k + n, nn + k + n + 1);
    }
    const edges = [[0, 1, 0], [n - 1, n, 1], [(n - 1) * n, 1, 1], [0, n, 0]];   // [start, step, flip]
    const sideOf = [];
    edges.forEach(([s0, step, flip], e) => {
      for (let m = 0; m < n; m++) {
        const node = s0 + m * step, b = 2 * nn + (e * n + m) * 2;
        sideOf.push(node);
        pos[3 * b] = pos[3 * node]; pos[3 * b + 1] = pos[3 * node + 1];
        pos[3 * (b + 1)] = pos[3 * node]; pos[3 * (b + 1) + 1] = pos[3 * node + 1];
        if (m < n - 1) { const b2 = b + 2; flip ? idx.push(b, b2, b + 1, b + 1, b2, b2 + 1) : idx.push(b, b + 1, b2, b + 1, b2 + 1, b2); }
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
    const set = (zb, t, w) => {              // zb, t in mm; w in metres (grid nodes)
      for (let k = 0; k < nn; k++) { const d = w[k] * MM; pos[3 * k + 2] = zb + t - d; pos[3 * (nn + k) + 2] = zb - d; }
      for (let q = 0; q < sideOf.length; q++) { const d = w[sideOf[q]] * MM, b = 2 * nn + q * 2; pos[3 * b + 2] = zb + t - d; pos[3 * (b + 1) + 2] = zb - d; }
      geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
    };
    return { geo, set };
  }
  function makeStrip() {                     // cut face at y = 0: quad strip between lo(x) and hi(x)
    const pos = new Float32Array(MS * 2 * 3), idx = [];
    for (let i = 0; i < MS; i++) { pos[6 * i] = pos[6 * i + 3] = secX[i] * MM; pos[6 * i + 1] = pos[6 * i + 4] = 0.0008; }
    for (let i = 0; i < MS - 1; i++) idx.push(2 * i, 2 * i + 2, 2 * i + 1, 2 * i + 1, 2 * i + 2, 2 * i + 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
    const set = (lo, hi) => { for (let i = 0; i < MS; i++) { pos[6 * i + 2] = lo(i); pos[6 * i + 5] = hi(i); } geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere(); };
    return { geo, set };
  }
  function makeDome(d) {                     // paraboloid cap, centre vertex + NR rings
    const nv = 1 + NR * NS, pos = new Float32Array(nv * 3), xy = new Float32Array(nv * 2), r2 = new Float32Array(nv), idx = [];
    xy[0] = d.x; xy[1] = d.y;
    for (let i = 1; i <= NR; i++) for (let j = 0; j < NS; j++) {
      const k = 1 + (i - 1) * NS + j, r = G.rb * i / NR, th = 2 * Math.PI * j / NS;
      xy[2 * k] = d.x + r * Math.cos(th); xy[2 * k + 1] = d.y + r * Math.sin(th); r2[k] = (i / NR) ** 2;
    }
    for (let k = 0; k < nv; k++) { pos[3 * k] = xy[2 * k] * MM; pos[3 * k + 1] = xy[2 * k + 1] * MM; }
    for (let j = 0; j < NS; j++) idx.push(0, 1 + j, 1 + (j + 1) % NS);
    for (let i = 1; i < NR; i++) for (let j = 0; j < NS; j++) {
      const a = 1 + (i - 1) * NS + j, b = 1 + (i - 1) * NS + (j + 1) % NS, c = a + NS, e = b + NS;
      idx.push(a, c, b, b, c, e);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
    return { geo, pos, r2, F: unitFields(xy), w: new Float32Array(nv), nv };
  }
  const mat = (color, opacity, extra) => {
    const m = new THREE.MeshPhongMaterial(Object.assign({ color, shininess: 28, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, side: THREE.DoubleSide }, extra || {}));
    clipMats.push(m); return m;
  };
  const capMat = color => new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
  function box(w, d, h, cx, cy, cz, material) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), material); m.position.set(cx, cy, cz); return m;
  }

  // ---- (re)build the whole scene for a model
  function rebuild(model, params) {
    M = model; P = params; G = model.G;
    if (!renderer) return;
    while (root.children.length) { const c = root.children[0]; root.remove(c); c.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
    groups = {}; clipMats = []; stack = []; caps = {}; domes = []; patches = []; labels = [];
    const a = G.a * MM, L = G.L * MM, b = (a - L) / 2, H0 = G.H0 * MM;
    const fl = P.tpu_floor_um * 1e-3, pd = P.pdms_um * 1e-3, ct = P.cnt_t_um * 1e-3;
    const grp = k => { const g = new THREE.Group(); groups[k] = g; root.add(g); return g; };

    // sample points: plate grid and the y = 0 section line
    const gxy = new Float32Array(NG * NG * 2);
    for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) { gxy[2 * (j * NG + i)] = -G.a / 2 + G.a * i / (NG - 1); gxy[2 * (j * NG + i) + 1] = -G.a / 2 + G.a * j / (NG - 1); }
    gridF = unitFields(gxy); wg = new Float32Array(NG * NG);
    secX = new Float32Array(MS); const sxy = new Float32Array(MS * 2);
    for (let i = 0; i < MS; i++) { secX[i] = -G.a / 2 + G.a * i / (MS - 1); sxy[2 * i] = secX[i]; }
    secF = unitFields(sxy); ws = new Float32Array(MS);

    // PDMS substrate
    grp("pdms").add(box(a, a, pd, 0, 0, -fl - pd / 2, mat(COLS.pdms, 0.55)));
    caps.pdms = makeStrip(); groups.pdms.add(new THREE.Mesh(caps.pdms.geo, capMat(COLS.pdms)));
    caps.pdms.set(() => -fl - pd, () => -fl);
    labels.push({ key: "pdms", name: "PDMS substrate", t: P.pdms_um, z: -fl - pd / 2, color: COLS.pdms });

    // TPU floor, border frame, dome bodies
    const tpuM = mat(COLS.tpu, 1);
    const gt = grp("tpu");
    gt.add(box(a, a, fl - ct, 0, 0, -ct - (fl - ct) / 2, tpuM));
    const hb = H0 + ct, zc = -ct + hb / 2;
    borders = [box(a, b, hb, 0, a / 2 - b / 2, zc, tpuM), box(a, b, hb, 0, -a / 2 + b / 2, zc, tpuM),
               box(b, L, hb, a / 2 - b / 2, 0, zc, tpuM), box(b, L, hb, -a / 2 + b / 2, 0, zc, tpuM)];
    borders.forEach(m => gt.add(m)); borderH = hb;
    caps.tpu = makeStrip(); gt.add(new THREE.Mesh(caps.tpu.geo, capMat(COLS.tpu)));
    labels.push({ key: "tpu", name: Lg("TPU: พื้น + dome + border", "TPU: floor + domes + border"), t: null, z: H0 / 2, color: COLS.tpu, note: `border ${(G.H0 * 1e6).toFixed(0)} µm` });

    // resin-CNT film on the floor and on every dome
    const gc = grp("cnt");
    gc.add(box(L, L, ct, 0, 0, -ct / 2, mat(COLS.cnt, 1)));
    G.domes.forEach((d, j) => {
      const D = makeDome(d);
      D.cntMat = mat(COLS.cnt, 1, { emissive: COLS.glow, emissiveIntensity: 0 });
      const cm = new THREE.Mesh(D.geo, D.cntMat); gc.add(cm);
      const tm = new THREE.Mesh(D.geo, tpuM); tm.position.z = -ct; gt.add(tm);
      domes.push(D);
      const pm = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: COLS.patch, transparent: true, opacity: 0.95, depthTest: false }));
      pm.renderOrder = 10; pm.visible = false; pm.position.set(d.x * MM, d.y * MM, 0); gc.add(pm); patches.push(pm);
    });
    caps.cnt = makeStrip(); gc.add(new THREE.Mesh(caps.cnt.geo, capMat(COLS.cnt)));
    labels.push({ key: "cnt", name: "resin-CNT", t: P.cnt_t_um, z: 0.02, color: COLS.cnt });

    // top capacitive stack, bottom → top
    const Ls = Physics.stackLayers(P).slice().reverse();
    const defs = { "Base PI": ["base", COLS.pi, 0.14], "E1": ["e1", COLS.e1, 0.26], "Dielectric": ["diel", COLS.diel, 0.16], "E2": ["e2", COLS.e2, 0.26], "Cover PI": ["cover", COLS.pi, 0.12], "Piezo film": ["piezo", COLS.piezo, 0.3], "E3": ["e3", COLS.e3, 0.26] };
    Ls.forEach(l => {
      const pzDiel = l.name === "Dielectric" && Physics.piezoWhere(P) === "diel";   // piezo material used as the dielectric: drawn in the piezo colour
      const [key, color0, op] = defs[l.name], color = pzDiel ? COLS.piezo : color0, s = makeSlab(a), m = mat(color, op);
      const g = grp(key); const mesh = new THREE.Mesh(s.geo, m); g.add(mesh);
      const cap = makeStrip(); g.add(new THREE.Mesh(cap.geo, capMat(color)));
      const rec = { key, name: l.name, t0: l.t * MM, slab: s, cap, mat: m, capMat: g.children[1].material };
      stack.push(rec);
      labels.push({ key, name: l.name === "E1" ? Lg("E1 (ใช้ร่วม A+B)", "E1 (shared A+B)") : l.name === "Piezo film" ? "Piezo film (E2–E3)" : pzDiel ? "Dielectric = piezo (E1–E2)" : l.name, t: l.t * 1e6, z: 0, color, rec });
    });
    // applied pressure: 9 arrows that ride on the top surface; shaft length grows with log(pressure)
    const gl = grp("load"), am = new THREE.MeshBasicMaterial({ color: COLS.load, transparent: true, opacity: 0.6 });
    arrows = [];
    const cone = new THREE.ConeGeometry(0.065, 0.18, 14); cone.rotateX(-Math.PI / 2); cone.translate(0, 0, 0.09);
    const shaft = new THREE.CylinderGeometry(0.02, 0.02, 1, 8); shaft.rotateX(-Math.PI / 2);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const g = new THREE.Group(), sm = new THREE.Mesh(shaft, am); g.add(new THREE.Mesh(cone, am), sm); g.position.set(i * a * 0.3, j * a * 0.3, 0); gl.add(g);
      const gi = Math.round((i * 0.3 + 0.5) * (NG - 1)), gj = Math.round((j * 0.3 + 0.5) * (NG - 1));
      arrows.push({ g, sm, node: gj * NG + gi });
    }
    applyOptions();
    if (st) update(st); else requestRender();
  }

  // ---- per-frame update from a solved state
  function update(state) {
    st = state;
    if (!renderer || !M) return;
    const sinkM = st.sol.sink || 0, Hs = G.H0 - sinkM;            // border compressed: the whole stack sits lower
    const p = st.p, F = st.sol.force, H0 = Hs * MM, ct = P.cnt_t_um * 1e-3, fl = P.tpu_floor_um * 1e-3, half = G.L / 2;
    const kp = st.sol.kappa || 1, Fk = kp === 1 ? F : F.map(f => f / kp), pk = p / kp;   // large-deflection stiffening
    evalW(gridF, pk, Fk, wg); evalW(secF, pk, Fk, ws);
    borders.forEach(m => { const s = (H0 + ct) / borderH; m.scale.z = s; m.position.z = -ct + borderH * s / 2; });
    // stack
    let zb = H0;
    stack.forEach(l => {
      const t = l.key === "diel" ? st.CB.t * MM : l.t0;
      l.slab.set(zb, t, wg);
      const z0 = zb; l.cap.set(i => z0 - ws[i] * MM, i => z0 + t - ws[i] * MM);
      l.zmid = zb + t / 2; l.t = t; zb += t;
      if (l.key === "diel") {
        const s = Math.min(1, Math.max(0, 1 - t / l.t0) / 0.5);
        const c = new THREE.Color(Physics.piezoWhere(P) === "diel" ? COLS.piezo : COLS.diel).lerp(new THREE.Color(0x46A5A0), s);
        l.mat.color.copy(c); l.capMat.color.copy(c);
      }
    });
    const len = p > 30 ? 0.08 + 0.17 * Math.log10(1 + p / 1e3) : 0;
    arrows.forEach(ar => { ar.g.visible = len > 0; ar.g.position.z = zb - wg[ar.node] * MM; ar.g.scale.z = 1 / opt.exag; ar.sm.scale.z = Math.max(len, 1e-3); ar.sm.position.z = 0.18 + len / 2; });
    // domes flattened against the underside of the stack
    const fmax = Math.max(1e-12, ...F);
    domes.forEach((D, j) => {
      const d = G.domes[j]; evalW(D.F, pk, Fk, D.w);
      for (let k = 0; k < D.nv; k++) D.pos[3 * k + 2] = Math.min(d.h * (1 - D.r2[k]), Hs - D.w[k]) * MM;
      D.geo.attributes.position.needsUpdate = true; D.geo.computeVertexNormals();
      const on = F[j] > 0;
      D.cntMat.emissiveIntensity = on ? 0.45 + 0.55 * F[j] / fmax : 0;
      const pm = patches[j]; pm.visible = on && st.sol.a[j] > 0;
      if (pm.visible) { const r = st.sol.a[j] * MM; pm.scale.set(r, r, 1); pm.position.z = (Hs - D.w[0]) * MM + 0.004; }
    });
    // cut faces of the printed layer
    const prof = i => { const x = secX[i]; return Math.abs(x) >= half ? 0 : Math.min(Physics.domeSurface(x, 0, G), Hs - ws[i]) * MM; };
    caps.tpu.set(() => -fl, i => Math.abs(secX[i]) >= half ? H0 : prof(i) - ct);
    caps.cnt.set(i => Math.abs(secX[i]) >= half ? 0 : prof(i) - ct, i => Math.abs(secX[i]) >= half ? 0 : prof(i));
    requestRender();
  }

  function applyOptions() {
    if (!renderer) return;
    root.scale.set(1, 1, opt.exag);
    const planes = opt.section ? [clipPlane] : [];
    clipMats.forEach(m => { m.clippingPlanes = planes; m.needsUpdate = true; });
    Object.values(groups).forEach(g => g.children.forEach(c => { if (c.material && c.material.isMeshBasicMaterial && !c.material.transparent) c.visible = opt.section; }));
    arrows.forEach(ar => { ar.g.scale.z = 1 / opt.exag; });
    requestRender();
  }
  function setOptions(o) {
    Object.assign(opt, o); applyOptions();
  }

  // ---- labels (drawn on a 2-D overlay so they stay crisp and never overlap)
  function drawOverlay() {
    const W = host.clientWidth, H = host.clientHeight, dpr = window.devicePixelRatio || 1;
    if (ov.width !== Math.round(W * dpr) || ov.height !== Math.round(H * dpr)) { ov.width = Math.round(W * dpr); ov.height = Math.round(H * dpr); }
    const c = ov.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const cs = getComputedStyle(document.documentElement), ink = cs.getPropertyValue("--ink").trim(), mut = cs.getPropertyValue("--muted").trim(), card = cs.getPropertyValue("--card").trim();
    c.font = "600 12.5px -apple-system, 'Sarabun', sans-serif"; c.textBaseline = "middle";
    const badge = opt.exag === 1 ? Lg("แนวดิ่ง ×1 (สัดส่วนจริง)", "vertical ×1 (true scale)") : `${Lg("แนวดิ่งขยาย ×", "vertical exaggeration ×")}${opt.exag}${Lg(" · แนวราบ ×1", " · horizontal ×1")}`;
    const bw = c.measureText(badge).width + 16;
    c.fillStyle = card; c.globalAlpha = 0.9; c.fillRect(W - bw - 8, H - 30, bw, 22); c.globalAlpha = 1;
    c.strokeStyle = "#5B4B8A"; c.strokeRect(W - bw - 8, H - 30, bw, 22); c.fillStyle = ink; c.fillText(badge, W - bw, H - 19);
    if (!opt.labels || !M) return;
    const a = G.a * MM, y = opt.section ? 0 : -a / 2, v = new THREE.Vector3();
    const items = labels.map(l => {
      const z = l.rec ? l.rec.zmid : l.z, g = groups[l.key];
      v.set(-a / 2, y, z + (g ? g.position.z : 0)).applyMatrix4(root.matrixWorld).project(camera);
      const t = l.rec ? (l.rec.t * 1e3) : l.t;
      const txt = l.name + (t != null ? ` · ${t >= 100 ? t.toFixed(0) : t.toFixed(1)} µm` : "") + (l.note ? ` · ${l.note}` : "");
      return { ax: (v.x + 1) / 2 * W, ay: (1 - v.y) / 2 * H, txt, color: "#" + new THREE.Color(l.color).getHexString() };
    }).sort((p, q) => p.ay - q.ay);
    const gap = 18; let yy = Math.max(16, Math.min(items[0].ay, H - 40 - gap * (items.length - 1)));
    items.forEach(it => { it.ly = Math.max(yy, it.ay); yy = it.ly + gap; });
    const over = yy - gap - (H - 40); if (over > 0) items.forEach(it => it.ly -= over);
    c.font = "12px -apple-system, 'Sarabun', sans-serif";
    items.forEach(it => {
      const tw = c.measureText(it.txt).width;
      c.fillStyle = card; c.globalAlpha = 0.82; c.fillRect(8, it.ly - 8, tw + 22, 16); c.globalAlpha = 1;
      c.fillStyle = it.color; c.fillRect(11, it.ly - 4, 8, 8); c.strokeStyle = mut; c.lineWidth = 0.5; c.strokeRect(11, it.ly - 4, 8, 8);
      c.fillStyle = ink; c.fillText(it.txt, 24, it.ly);
      c.strokeStyle = mut; c.lineWidth = 0.8; c.beginPath(); c.moveTo(tw + 32, it.ly); c.lineTo(Math.max(tw + 44, it.ax - 3), it.ay); c.stroke();
      c.fillStyle = mut; c.beginPath(); c.arc(Math.max(tw + 44, it.ax - 3), it.ay, 1.8, 0, 7); c.fill();
    });
  }

  // ---- camera / render loop
  function placeCamera() {
    const s = Math.sin(cam.ph), r = cam.r * (1 + 0.5 * opt.e), ty = cam.ty + 1.1 * opt.e;   // step back while exploded
    camera.position.set(cam.tx + r * s * Math.sin(cam.th), ty + r * Math.cos(cam.ph), cam.tz + r * s * Math.cos(cam.th));
    camera.lookAt(cam.tx, ty, cam.tz);
  }
  function resize() {
    const W = host.clientWidth, H = host.clientHeight; if (!W || !H) return;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix(); requestRender();
  }
  function requestRender() { if (!renderer) return; dirty = true; if (!running) { running = true; requestAnimationFrame(frame); } }
  function frame() {
    const target = opt.explode ? 1 : 0;
    if (Math.abs(target - opt.e) > 1e-3) { opt.e += (target - opt.e) * 0.16; dirty = true; } else opt.e = target;
    if (!dirty || !host.clientWidth) { running = false; return; }
    dirty = false;
    Object.keys(groups).forEach(k => groups[k].position.z = opt.e * EXPL[k] / opt.exag);
    placeCamera(); root.updateMatrixWorld(true);
    renderer.render(scene, camera); drawOverlay();
    if (Math.abs(target - opt.e) > 1e-3) dirty = true;
    requestAnimationFrame(frame);
  }

  function init(hostEl, overlayEl) {
    host = hostEl; ov = overlayEl;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { host.innerHTML = Lg("<div class=\"note\" style=\"padding:20px\">เปิด WebGL ไม่ได้ในเบราว์เซอร์นี้ — ใช้มุมมอง \"ภาพตัดขวาง\" แทน</div>", "<div class=\"note\" style=\"padding:20px\">WebGL is not available in this browser — use the \"Cross-section\" view instead</div>"); renderer = null; return false; }
    renderer.localClippingEnabled = true; renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement); renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none;cursor:grab";
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 2, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.5));
    const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(-4, 9, 6); scene.add(dl);
    root = new THREE.Group(); root.rotation.x = -Math.PI / 2; scene.add(root);
    clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);   // keeps local y >= 0, removes the half facing the camera
    const el = renderer.domElement; let drag = null;
    el.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, pan: e.shiftKey || e.button === 2 }; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; });
    el.addEventListener("pointermove", e => {
      if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      if (drag.pan) { const k = cam.r * 0.0014; cam.tx -= dx * k * Math.cos(cam.th); cam.tz += dx * k * Math.sin(cam.th); cam.ty += dy * k; }
      else { cam.th -= dx * 0.008; cam.ph = Math.min(Math.PI - 0.08, Math.max(0.08, cam.ph - dy * 0.008)); }
      requestRender();
    });
    const end = () => { drag = null; el.style.cursor = "grab"; };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("contextmenu", e => e.preventDefault());
    el.addEventListener("wheel", e => { e.preventDefault(); cam.r = Math.min(40, Math.max(2.5, cam.r * Math.exp(e.deltaY * 0.0012))); requestRender(); }, { passive: false });
    el.addEventListener("dblclick", () => { Object.assign(cam, { th: -0.6, ph: 0.98, r: 10.5, tx: 0, ty: 0.45, tz: 0 }); requestRender(); });
    el.addEventListener("webglcontextlost", e => e.preventDefault());
    el.addEventListener("webglcontextrestored", () => { if (M) rebuild(M, P); });
    new ResizeObserver(resize).observe(host); resize();
    return true;
  }
  return { init, rebuild, update, setOptions, requestRender, opt, cam, ok: () => !!renderer };
})();
