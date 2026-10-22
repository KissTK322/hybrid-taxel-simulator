// ============================================================================
// Stage views around the physics core: animation, 2-D cross-section with
// fields and current, circuit schematic, oscilloscope strip, 16 x 9 array,
// and the "learn" panel. Every number drawn here comes from Physics.* or from
// the knowledge base (papers); nothing is decorative.
// ============================================================================
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function fitCanvas(cv) {
  const W = cv.clientWidth, H = cv.clientHeight, dpr = window.devicePixelRatio || 1;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  return { c, W, H };
}
// monotonic inverse by interpolation: tab = [[x, y], ...]
function invTab(tab, v, logx) {
  if (!tab.length || !isFinite(v)) return NaN;
  const X = tab.map(r => logx ? Math.log(r[0]) : r[0]), x = logx ? Math.log(v) : v;
  if (x <= X[0]) return tab[0][1]; if (x >= X[X.length - 1]) return tab[tab.length - 1][1];
  let k = 1; while (X[k] < x) k++;
  return tab[k - 1][1] + (x - X[k - 1]) / (X[k] - X[k - 1]) * (tab[k][1] - tab[k - 1][1]);
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;
const RGB = { pzr: [200, 116, 43], cap: [15, 124, 122], hyb: [91, 75, 138], pale: [244, 246, 247], dielLo: [158, 217, 214] };
const fmtPF = C => (C * 1e12).toFixed(3) + " pF";

const Stage = (() => {
  let view = "3d", rafOn = false, lastT = 0, lastTab = 0, dotPhase = 0, CAL = null;
  const anim = { playing: false, u: 0, peak: 450, tr: 2.5, th: 2, slow: false, loop: false, accel: 1, shape: "hold" };
  const pz = { V: 0, p: 0, dT: 0, t: 0, S: null };
  const scope = { buf: [], win: 14, activeUntil: 0, lastPush: 0 };
  const sec = { zoom: false, field: true };
  const cir = { mode: "dc" };
  const arr = { x: 0, y: 0, r: 6, F: 5, shape: "finger", auto: false, real: false, dir: 1, shown: null, lastSample: 0, hover: null, drag: false, geo: null };

  // ------------------------------------------------------------ calibration (t = 0 sweep)
  function buildCal() {
    const pts = SWEEP.pts, on = pts.filter(q => q.nContact > 0 && isFinite(q.R)), off = pts.filter(q => q.nContact === 0);
    const asc = t => t.sort((a, b) => a[0] - b[0]);
    CAL = { R: asc(on.map(q => [q.R, q.p])), CA: asc(off.map(q => [q.CA, q.p])), CB: asc(pts.map(q => [q.CB, q.p])),
      Rmin: Math.min(...pts.map(q => q.R)), CB0: pts[0].CB, CBmax: pts[pts.length - 1].CB, CA0: pts[0].CA };
  }
  function estimates(st) {
    const hit = st.sol.nContact > 0;
    return { FR: hit ? invTab(CAL.R, st.Rlive, true) : NaN, FA: hit ? NaN : invTab(CAL.CA, st.CA, false), FB: invTab(CAL.CB, st.CB.C, false) };
  }

  // ------------------------------------------------------------ press–hold–release animation
  const P_LO = 0.03;                                    // kPa, start / end of the ramp
  const animT = () => anim.shape === "tap" ? 3 : anim.shape === "vib" ? 6 : 2 * anim.tr + anim.th;
  const ease = x => x * x * (3 - 2 * x);                 // a real press does not start or stop abruptly
  function animState(u) {
    const T = animT(), t = u * T;
    let f, phase, hold = 0;
    if (anim.shape === "tap") {                          // three quick taps, 0.3 s each
      const k = t % 1; f = k < 0.3 ? Math.sin(Math.PI * k / 0.3) ** 2 : 0; phase = k < 0.3 ? `${Lg("เคาะครั้งที่ ", "tap ")}${Math.floor(t) + 1}` : Lg("ยกนิ้ว", "finger lifted");
    } else if (anim.shape === "vib") {                   // press, then a 5 Hz ripple (±10 %) on the held force, then release
      if (t < 1.5) { f = 0.8 * ease(t / 1.5); phase = Lg("กด", "press"); }
      else if (t < 4.5) { f = 0.8 + 0.08 * Math.sin(2 * Math.PI * 5 * (t - 1.5)); phase = Lg("ค้าง + สั่น 5 Hz (เช่น ของกำลังลื่น)", "hold + 5 Hz vibration (e.g. an object slipping)"); hold = t - 1.5; }
      else { f = 0.8 * ease(Math.max(0, 1 - (t - 4.5) / 1.5)); phase = Lg("ปล่อย", "release"); }
    } else if (t < anim.tr) { f = ease(t / anim.tr); phase = Lg("กด (ramp ขึ้น)", "press (ramp up)"); }
    else if (t < anim.tr + anim.th) { f = 1; phase = Lg("ค้าง (hold)", "hold"); hold = t - anim.tr; }
    else { f = ease(Math.max(0, 1 - (t - anim.tr - anim.th) / anim.tr)); phase = Lg("ปล่อย (ramp ลง)", "release (ramp down)"); hold = anim.th; }
    return { p: P_LO + (anim.peak - P_LO) * f, hold, phase, t, T };
  }
  function applyAnim(force) {
    const s = animState(anim.u), ts = s.hold * anim.accel;      // simulated hold time (s)
    P.p_view_kPa = +s.p.toPrecision(4);
    LIVE_ENV.tpu = 1 + P.creep_tpu / 100 * (1 - Math.exp(-ts / (P.tau_tpu_min * 60)));
    LIVE_ENV.diel = 1 + P.creep_diel / 100 * (1 - Math.exp(-ts / (P.tau_diel_min * 60)));
    LIVE_ENV.drift = 1 + P.drift_pct / 100 * Math.log10(1 + ts / 60);
    LIVE_ENV.warm = true;
    syncView(); renderView();
    $("#an-scrub").value = Math.round(anim.u * 1000);
    $("#an-phase").textContent = `${s.phase} · t = ${s.t.toFixed(1)} / ${s.T.toFixed(1)} s` + (anim.accel > 1 && s.hold > 0 ? `${Lg(" · hold จำลอง ", " · simulated hold ")}${(ts / 60).toFixed(1)}${Lg(" นาที", " min")}` : "");
    const now = performance.now();
    if (force || now - lastTab > 220) { renderTab(currentTab); lastTab = now; }
  }
  function stopAnim(reset) {
    anim.playing = false; $("#an-play").textContent = Lg("▶ กด–ค้าง–ปล่อย", "▶ Press–hold–release");
    if (reset) { LIVE_ENV.tpu = LIVE_ENV.diel = LIVE_ENV.drift = 1; LIVE_ENV.warm = false; $("#an-phase").textContent = ""; }
  }
  function play() {
    if (anim.playing) { stopAnim(false); return; }
    if (anim.u >= 1) anim.u = 0;
    if (anim.u === 0) { pz.V = 0; pz.p = P_LO * 1e3; pz.dT = P.dT_K || 0; pz.t = performance.now(); scope.buf = []; }   // start clean: the jump back to zero force is not a real event
    anim.playing = true; $("#an-play").textContent = Lg("❚❚ หยุด", "❚❚ Stop"); kick();
  }

  // ------------------------------------------------------------ RAF loop (runs only while something moves)
  function kick() { if (!rafOn) { rafOn = true; lastT = performance.now(); requestAnimationFrame(tick); } }
  function tick(now) {
    const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
    if (anim.playing) {
      anim.u += dt * (anim.slow ? 0.25 : 1) / animT();
      if (anim.u >= 1) { if (anim.loop) anim.u -= 1; else { anim.u = 1; applyAnim(true); stopAnim(false); } }
      if (anim.playing) applyAnim(false);
    }
    const moving = LIVE && LIVE.sol.nContact > 0 && view === "sec";
    if (moving) { dotPhase += dt; drawSection(); }
    if (view === "arr" && (arr.auto || arr.real)) { stepArray(dt, now); drawArray(now); }
    const scoping = now < scope.activeUntil || anim.playing;
    if (scoping) { stepPiezo(now); pushScope(now); drawScope(now); }
    if (anim.playing || moving || scoping || (view === "arr" && (arr.auto || arr.real))) requestAnimationFrame(tick); else rafOn = false;
  }

  // ------------------------------------------------------------ channel C: piezo film voltage
  function stepPiezo(now) {
    const S = PH.piezoStatic(P); pz.S = S;
    if (!S || !LIVE) { pz.V = 0; pz.t = now; if (LIVE) { pz.p = LIVE.p; pz.dT = P.dT_K || 0; } return; }
    const dtw = (now - pz.t) / 1000; if (dtw < 0.002) return;
    const dt = Math.min(0.25, dtw) * (anim.playing && anim.slow ? 0.25 : 1);       // slow motion stretches the display, not the physics
    pz.V = PH.piezoRamp(S, pz.V, LIVE.p - pz.p, (P.dT_K || 0) - pz.dT, dt);
    pz.p = LIVE.p; pz.dT = P.dT_K || 0; pz.t = now;
  }
  // ------------------------------------------------------------ story strip + contact marks on the pressure slider
  function drawStory() {
    const st = LIVE, G = MODEL.G, n = st.sol.nContact, hmax = Math.max(...G.domes.map(d => d.h));
    const tier1 = G.domes.filter(d => d.h === hmax).length, strain = Math.max(...st.sol.delta.map((d, j) => d / G.domes[j].h));
    const gapC = Math.max(0, G.H0 - (st.sol.sink || 0) - PH.deflectionAt(0, 0, st.p, MODEL.PF, st.sol) - hmax) * 1e6;
    const step = strain > 0.3 ? 4 : n > tier1 ? 3 : n > 0 ? 2 : st.p > 300 ? 1 : 0;
    const names = [Lg("ยังไม่กด", "not pressed"), Lg("① ก่อนแตะ: dead-zone ของ R", "① before contact: R dead zone"), Lg("② dome แรกแตะ: สวิตช์ปิด", "② first dome touches: switch closes"), Lg("③ dome ระดับถัดไปแตะ", "③ next dome level touches"), Lg("④ เกินช่วงที่ model เชื่อได้", "④ beyond the model's reliable range")];
    const j0 = st.sol.force.indexOf(Math.max(...st.sol.force));
    const txt = [
      Lg("micro-gap เปิดอยู่ ไม่มีกระแสผ่านช่อง R (เหลือกระแสรั่ว) — กด ▶ หรือเลื่อนแรงกดเพื่อเริ่ม", "micro-gap open, no current through channel R (leak current only) — press ▶ or move the pressure slider to start"),
      `${Lg("แผ่นบนกำลังยุบ gap เหนือ dome กลางเหลือ <b>", "top plate is deflecting, the gap above the centre dome is down to <b>")}${gapC.toFixed(1)}${Lg(" µm</b> · ช่อง R ยังเงียบ แต่ <b>C_A</b> (gap) และ <b>C_B</b> (dielectric) เปลี่ยนแล้ว จึงใช้บอกแรงช่วงนี้", " µm</b> · channel R is still silent, but <b>C_A</b> (gap) and <b>C_B</b> (dielectric) have changed, so they report force here")}`,
      `${Lg("dome ที่สูงที่สุดแตะ E1 แล้ว (รัศมีสัมผัส <b>", "the tallest dome has touched E1 (contact radius <b>")}${(st.sol.a[j0] * 1e6).toFixed(0)}${Lg(" µm</b>) กระแสไหลผ่าน contact → R ตกจาก GΩ เหลือ <b>", " µm</b>), current flows through the contact → R falls from GΩ to <b>")}${fmtSI(st.Rlive, "Ω")}${Lg("</b> · C_A ถูก R short · C_B ยังอ่านได้", "</b> · C_A is shorted by R · C_B is still readable")}`,
      `${Lg("dome แตะ <b>", "domes touching <b>")}${n}${Lg("/9</b> ลูก ทางเดินกระแสขนานกันมากขึ้น R ลดช้าลง (เริ่มอิ่มตัว) ช่วงนี้ C_B เป็นช่องที่ยังไว", "/9</b>: more parallel current paths, R falls more slowly (saturating); C_B is the channel that stays sensitive here")}`,
      `${Lg("dome ยุบ ", "dome compressed ")}${(strain * 100).toFixed(0)}${Lg(" % ของความสูง เกินช่วงที่ Hertz ใช้ได้ — ตัวเลขช่วงนี้ใช้ดูแนวโน้มเท่านั้น", " % of its height, beyond the range where Hertz holds — numbers here show trends only")}`,
    ][step];
    const extra = [];
    if (st.sol.kappa > 1.15) extra.push(`${Lg("แผ่นบนแข็งขึ้น ×", "top plate stiffer ×")}${st.sol.kappa.toFixed(1)}${Lg(" เพราะยืดตัว", " from stretching")}`);
    if (st.sol.sink > 2e-6) extra.push(`${Lg("border ยุบ ", "border compressed ")}${(st.sol.sink * 1e6).toFixed(0)} µm`);
    if (st.RA.Re1 > 100) extra.push(`${Lg("ความต้านทานของ E1 เพิ่ม ", "E1 resistance adds ")}${fmtSI(st.RA.Re1, "Ω")}`);
    if (pz.S) extra.push(`${Lg("piezo ตอบเฉพาะตอนแรงเปลี่ยน: ", "piezo responds only while force changes: ")}${fmtSI(pz.V, "V")}`);
    if (P.dT_K) extra.push(`ΔT ${P.dT_K > 0 ? "+" : ""}${P.dT_K}${Lg(" K: ค่าที่อ่านคลาดจาก calibration", " K: reading is off from calibration")}`);
    $("#story").innerHTML = `<div class="steps">${names.map((s, i) => `<span class="${i === step ? "on" : i < step ? "done" : ""}${i === 4 ? " warnstep" : ""}">${s}</span>`).join("")}</div><div class="say">${txt}${extra.length ? ' <span class="note">· ' + extra.join(" · ") + "</span>" : ""}</div>`;
  }
  function drawMarks() {                               // where each group of domes makes contact, on the log pressure slider
    const pts = SWEEP.pts, marks = []; let last = 0;
    pts.forEach(q => { if (q.nContact > last) { marks.push({ p: q.p / 1e3, n: q.nContact }); last = q.nContact; } });
    const sl = $("#pview"), lo = +sl.min, hi = +sl.max;
    $("#pmarks").innerHTML = marks.map(m => { const f = (Math.log10(m.p) - lo) / (hi - lo); return f < 0 || f > 1 ? "" : `<span style="left:calc(8px + (100% - 16px) * ${f.toFixed(4)}${Lg(")\" title=\"dome แตะ ", ")\" title=\"dome touch ")}${m.n}${Lg(" ลูกที่ ", " dome no. ")}${m.p.toPrecision(3)}${Lg(" kPa\"><i></i>แตะ ", " kPa\"><i></i>touch ")}${m.n}</span>`; }).join("") ||
      `${Lg("<span style=\"left:50%\" class=\"none\">ไม่มี dome แตะในช่วง ", "<span style=\"left:50%\" class=\"none\">no dome touches within ")}${P.p_max_kPa} kPa</span>`;
  }
  // ------------------------------------------------------------ oscilloscope strip
  function pushScope(now) {
    if (!LIVE || !CAL || now - scope.lastPush < 30) return;
    const prev = scope.buf[scope.buf.length - 1];
    if (prev && now - scope.lastPush > 150) scope.buf.push(Object.assign({}, prev, { t: now / 1000 - 0.001 }));   // hold the old value across an idle gap
    scope.lastPush = now;
    const e = estimates(LIVE);
    scope.buf.push({ t: now / 1000, p: LIVE.p, R: LIVE.Rlive, CA: LIVE.CA, CB: LIVE.CB.C, n: LIVE.sol.nContact, FR: e.FR, FA: e.FA, FB: e.FB, pz: pz.S ? pz.V : NaN });
    const t0 = now / 1000 - scope.win - 1; while (scope.buf.length && scope.buf[0].t < t0) scope.buf.shift();
  }
  function drawScope(now) {
    $("#scope-wrap").classList.toggle("tall", !!pz.S);
    const cv = $("#scope"); if (!cv.clientWidth) return;
    const { c, W, H } = fitCanvas(cv), ink = cssv("--ink"), mut = cssv("--muted"), grid = cssv("--grid");
    const gl = 118, gr = 8, tNow = (now || performance.now()) / 1000, t0 = tNow - scope.win;
    const X = t => gl + (t - t0) / scope.win * (W - gl - gr);
    const hh = H - 18, fr = pz.S ? [0.33, 0.18, 0.26, 0.23] : [0.4, 0.24, 0.36, 0]; let y0 = 3;
    const lanes = fr.map(f => { const l = { y: y0, h: Math.max(0, hh * f - 4) }; y0 += hh * f; return l; });
    c.font = "11px -apple-system, 'Sarabun', sans-serif"; c.textBaseline = "middle";
    c.strokeStyle = grid; c.lineWidth = 1;
    for (let s = 0; s <= scope.win; s += 2) { const x = X(tNow - s); c.beginPath(); c.moveTo(x, 2); c.lineTo(x, H - 16); c.stroke(); c.fillStyle = mut; c.textAlign = "center"; c.fillText(s === 0 ? Lg("ตอนนี้", "now") : `−${s} s`, Math.min(x, W - 18), H - 6); }
    const b = scope.buf, last = b[b.length - 1];
    const line = (lane, f, color, dash, ymap, width) => {
      c.save(); c.beginPath(); c.rect(gl, lane.y, W - gl - gr, lane.h); c.clip();
      c.strokeStyle = color; c.lineWidth = width || 1.8; c.setLineDash(dash || []); c.beginPath(); let pen = false;
      for (const s of b) { const v = f(s); if (!isFinite(v) || s.t < t0) { pen = false; continue; } const x = X(s.t), y = lane.y + lane.h - ymap(v) * lane.h; pen ? c.lineTo(x, y) : c.moveTo(x, y); pen = true; }
      c.stroke(); c.restore();
    };
    const tag = (lane, row, text, color) => { c.fillStyle = color; c.textAlign = "left"; c.fillText(text, 6, lane.y + 8 + row * 13); };
    lanes.forEach(l => { if (l.h > 0) { c.strokeStyle = grid; c.strokeRect(gl, l.y, W - gl - gr, l.h); } });
    if (!last) { c.fillStyle = mut; c.textAlign = "left"; c.fillText(Lg("กด ▶ หรือเลื่อนแรงกด เพื่อเริ่มบันทึกสัญญาณ", "press ▶ or move the pressure slider to start recording"), gl + 10, lanes[0].y + 14); return; }
    // lane 1: true pressure and the pressure estimated from each channel (calibration at t = 0)
    const pm = Math.max(1e3, ...b.map(s => s.p)) * 1.12, yp = v => v / pm;
    line(lanes[0], s => s.p, ink, [4, 3], yp, 1.2); line(lanes[0], s => s.FB, COL.cap, null, yp);
    line(lanes[0], s => s.FA, COL.pzr, [2, 3], yp); line(lanes[0], s => s.FR, COL.pzr, null, yp);
    const k = v => isFinite(v) ? (v / 1e3).toPrecision(3) + " kPa" : "—";
    const tp = cssv("--pzr-t"), tc = cssv("--cap-t");
    tag(lanes[0], 0, `${Lg("แรงจริง ", "true force ")}${k(last.p)}`, ink); tag(lanes[0], 1, `${Lg("จาก R: ", "from R: ")}${k(last.FR)}`, tp);
    tag(lanes[0], 2, `${Lg("จาก C_A: ", "from C_A: ")}${k(last.FA)}`, tp); tag(lanes[0], 3, `${Lg("จาก C_B: ", "from C_B: ")}${k(last.FB)}`, tc);
    // lane 2: R (log)
    const lo = Math.log10(CAL.Rmin * 0.7), hi = Math.log10(P.R_leak * 1.5);
    line(lanes[1], s => s.R, COL.pzr, null, v => (Math.log10(v) - lo) / (hi - lo));
    tag(lanes[1], 0, "R(t) · log", mut); tag(lanes[1], 1, fmtSI(last.R, "Ω"), tp);
    // lane 3: C_A and C_B
    const cs = b.flatMap(s => [s.CA, s.CB]), c0 = Math.min(...cs), c1 = Math.max(...cs), pad = Math.max(0.02e-12, (c1 - c0) * 0.1), yc = v => (v - c0 + pad) / (c1 - c0 + 2 * pad);
    line(lanes[2], s => s.CA, COL.pzr, [5, 3], yc); line(lanes[2], s => s.CB, COL.cap, null, yc);
    tag(lanes[2], 0, `C_A ${fmtPF(last.CA)}`, tp); tag(lanes[2], 1, `C_B ${fmtPF(last.CB)}`, tc);
    tag(lanes[2], 2, last.n > 0 ? Lg("(C_A ถูก R short)", "(C_A shorted by R)") : "", mut);
    if (pz.S) {                                          // lane 4: piezo voltage, symmetric about zero
      const vm = Math.max(1e-6, ...b.map(s => Math.abs(s.pz) || 0)) * 1.15, tb = cssv("--pzo-t");
      c.strokeStyle = grid; c.beginPath(); c.moveTo(gl, lanes[3].y + lanes[3].h / 2); c.lineTo(W - gr, lanes[3].y + lanes[3].h / 2); c.stroke();
      line(lanes[3], s => s.pz, "#2F6FB0", null, v => 0.5 + 0.5 * v / vm);
      tag(lanes[3], 0, `piezo ${fmtSI(last.pz, "V")}`, tb); tag(lanes[3], 1, Lg("ตอบเฉพาะแรงที่เปลี่ยน", "responds only to changing force"), mut);
    }
  }

  // ------------------------------------------------------------ 2-D cross-section with fields and current
  function drawSection() {
    const cv = $("#sec-cv"); if (!cv.clientWidth || !LIVE) return;
    const { c, W, H } = fitCanvas(cv), st = LIVE, G = MODEL.G, PF = MODEL.PF;
    const ink = cssv("--ink"), mut = cssv("--muted"), card = cssv("--card");
    const fl = P.tpu_floor_um * 1e-6, pd = P.pdms_um * 1e-6, ct = P.cnt_t_um * 1e-6, half = G.L / 2;
    const Ls = PH.stackLayers(P).slice().reverse();               // bottom → top
    const tOf = l => l.name === "Dielectric" ? st.CB.t : l.t, tStack = Ls.reduce((s, l) => s + tOf(l), 0);
    const narrow = W < 700, ml = narrow ? 8 : 150, mr = narrow ? 8 : 196, mt = 26, mb = 40;
    const zTop = G.H0 + Ls.reduce((s, l) => s + l.t, 0) + 40e-6, zBot = sec.zoom ? G.hmax - 260e-6 : -(fl + pd);
    const sx = (W - ml - mr) / G.a, sz = (H - mt - mb) / (zTop - zBot);
    const X = x => ml + (x + G.a / 2) * sx, Y = z => mt + (zTop - z) * sz;
    const sink = st.sol.sink || 0, Hs = G.H0 - sink;                // border compressed: stack sits lower
    const wAt = x => Math.abs(x) >= half ? 0 : PH.deflectionAt(x, 0, st.p, PF, st.sol);
    const N = Math.max(120, Math.round((W - ml - mr) / 2)), xs = [], wv = [], pr = [];
    for (let i = 0; i <= N; i++) { const x = -G.a / 2 + G.a * i / N, w = wAt(x); xs.push(x); wv.push(w); pr.push(Math.abs(x) >= half ? 0 : Math.min(PH.domeSurface(x, 0, G), Hs - w)); }
    const under = i => Hs - wv[i];                              // underside of the stack
    c.save(); c.beginPath(); c.rect(ml, mt, W - ml - mr, H - mt - mb); c.clip();
    // PDMS, TPU floor, border, dome bodies
    c.fillStyle = "#9FB4C0"; c.fillRect(X(-G.a / 2), Y(-fl), G.a * sx, pd * sz);
    c.fillStyle = "#EFD9A0"; c.fillRect(X(-G.a / 2), Y(0), G.a * sx, fl * sz);
    const bw = (G.a - G.L) / 2 * sx;
    c.fillRect(X(-G.a / 2), Y(Hs), bw, Hs * sz); c.fillRect(X(half), Y(Hs), bw, Hs * sz);
    c.beginPath(); c.moveTo(X(-half), Y(0)); for (let i = 0; i <= N; i++) if (Math.abs(xs[i]) <= half) c.lineTo(X(xs[i]), Y(pr[i])); c.lineTo(X(half), Y(0)); c.closePath(); c.fill();
    // air gap: local capacitance density eps0 / gap (channel A)
    const gmin = 0.5e-6, dLo = PH.EPS0 / G.H0, dHi = PH.EPS0 / 2e-6;
    const cmap = d => { const t = Math.min(1, Math.max(0, Math.log(d / dLo) / Math.log(dHi / dLo))); return rgb(mix([253, 240, 224], RGB.pzr, Math.pow(t, 0.8))); };
    const step = G.a / N * sx + 0.6;
    for (let i = 0; i <= N; i++) { if (Math.abs(xs[i]) >= half) continue; const g = under(i) - pr[i]; if (g <= gmin) continue; c.fillStyle = cmap(PH.EPS0 / g); c.fillRect(X(xs[i]) - step / 2, Y(under(i)), step, g * sz); }
    // field lines of circuit A: equal charge per line, straight vertical approximation
    if (sec.field) {
      const cum = [0]; for (let i = 1; i <= N; i++) { const g = Math.max(gmin * 4, under(i) - pr[i]); cum.push(cum[i - 1] + (Math.abs(xs[i]) < half ? 1 / g : 0)); }
      const nl = 34, tot = cum[N]; c.strokeStyle = COL.pzr; c.globalAlpha = st.sol.nContact ? 0.28 : 0.85; c.lineWidth = 1;
      for (let q = 0; q < nl; q++) { const tq = (q + 0.5) / nl * tot; let i = 1; while (i < N && cum[i] < tq) i++; const g = under(i) - pr[i]; if (g <= gmin * 4) continue;
        const x = X(xs[i]), y0 = Y(under(i)), y1 = Y(pr[i]); c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke();
        if (y1 - y0 > 9) { const ym = (y0 + y1) / 2; c.beginPath(); c.moveTo(x - 2.5, ym - 3); c.lineTo(x, ym + 1); c.lineTo(x + 2.5, ym - 3); c.stroke(); } }
      c.globalAlpha = 1;
    }
    // resin-CNT film along the profile
    c.strokeStyle = COL.red; c.lineWidth = Math.max(2.2, ct * sz); c.lineJoin = "round";
    c.beginPath(); for (let i = 0; i <= N; i++) { if (Math.abs(xs[i]) > half) continue; const y = Y(pr[i]) + c.lineWidth / 2; i && Math.abs(xs[i - 1]) <= half ? c.lineTo(X(xs[i]), y) : c.moveTo(X(xs[i]), y); } c.stroke();
    // stack layers
    const strain = 1 - st.CB.t / (P.diel_um * 1e-6);
    const lcol = { "Base PI": "#E9B44C", "E1": COL.hyb, "Dielectric": PH.piezoWhere(P) === "diel" ? "#8DB6E0" : rgb(mix(RGB.dielLo, [70, 165, 160], Math.min(1, strain / 0.5))), "E2": COL.cap, "Cover PI": "#E9B44C", "Piezo film": "#8DB6E0", "E3": "#2F6FB0" };
    let zb = 0; const zOf = {};
    Ls.forEach(l => {
      const t = tOf(l), minPx = l.name.startsWith("E") ? 2.4 : 1;
      c.fillStyle = lcol[l.name]; c.globalAlpha = l.name.endsWith("PI") ? 0.8 : 1; c.beginPath();
      for (let i = 0; i <= N; i++) c.lineTo(X(xs[i]), Y(under(i) + zb));
      for (let i = N; i >= 0; i--) c.lineTo(X(xs[i]), Math.min(Y(under(i) + zb + t), Y(under(i) + zb) - minPx));
      c.closePath(); c.fill(); c.globalAlpha = 1; zOf[l.name] = [zb, zb + t]; zb += t;
    });
    // field lines of circuit B inside the dielectric (uniform)
    if (sec.field) { c.strokeStyle = card; c.globalAlpha = 0.75; c.lineWidth = 1; const [d0, d1] = zOf.Dielectric;
      for (let q = 0; q < 46; q++) { const i = Math.round((q + 0.5) / 46 * N); c.beginPath(); c.moveTo(X(xs[i]), Y(under(i) + d1) + 1); c.lineTo(X(xs[i]), Y(under(i) + d0) - 1); c.stroke(); } c.globalAlpha = 1; }
    // current path of circuit A: E1 → contact patch → dome film → floor film → pad (right side)
    const e1z = (zOf.E1[0] + zOf.E1[1]) / 2, I0 = P.Vb / P.R_leak, Imax = P.Vb / CAL.Rmin, Itot = P.Vb / st.Rlive;
    const gsum = st.RA.perDome.reduce((s, r) => s + (isFinite(r) ? 1 / r : 0), 0), marks = [];
    G.domes.forEach((d, j) => {
      if (Math.abs(d.y) > 1e-9 || !(st.sol.force[j] > 0)) return;
      const Ij = Itot * (1 / st.RA.perDome[j]) / gsum, norm = Math.min(1, Math.max(0.05, Math.log10(Ij / I0) / Math.log10(Imax / I0)));
      const path = []; const iAt = x => Math.round((x + G.a / 2) / G.a * N);
      for (let i = N; i >= iAt(d.x); i--) path.push([X(xs[i]), Y(under(i) + e1z)]);
      const i0 = iAt(d.x), a = st.sol.a[j], i1 = iAt(d.x + G.rb);
      path.push([X(d.x), Y(pr[i0])]);
      for (let i = i0; i <= i1; i++) path.push([X(xs[i]), Y(pr[i]) + 2]);
      path.push([X(half), Y(0) + 2]);
      let len = 0; const seg = path.map((q, k) => { if (!k) return 0; len += Math.hypot(q[0] - path[k - 1][0], q[1] - path[k - 1][1]); return len; });
      c.strokeStyle = COL.pzr; c.globalAlpha = 0.35; c.lineWidth = 1.5; c.beginPath(); path.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); c.globalAlpha = 1;
      const spacing = 46 - 30 * norm, speed = 30 + 130 * norm, off = (dotPhase * speed) % spacing;
      c.fillStyle = COL.pzr; c.strokeStyle = card; c.lineWidth = 1;
      for (let s = off; s < len; s += spacing) { let k = 1; while (k < seg.length - 1 && seg[k] < s) k++; const f = (s - seg[k - 1]) / Math.max(1e-9, seg[k] - seg[k - 1]);
        const x = path[k - 1][0] + f * (path[k][0] - path[k - 1][0]), y = path[k - 1][1] + f * (path[k][1] - path[k - 1][1]); c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); c.stroke(); }
      // contact patch (width 2a)
      c.strokeStyle = "#FFD166"; c.lineWidth = 3; c.beginPath(); c.moveTo(X(d.x - a), Y(pr[i0]) - 1); c.lineTo(X(d.x + a), Y(pr[i0]) - 1); c.stroke();
      marks.push({ j, d, Ij, x1: X(d.x), y1: Y(pr[i0]), x2: X(d.x + G.rb * 0.7), y2: Y(pr[iAt(d.x + G.rb * 0.7)]) });
    });
    c.restore();
    const badge = (n, x, y) => { c.fillStyle = COL.pzr; c.beginPath(); c.arc(x, y, 7.5, 0, 7); c.fill(); c.fillStyle = "#fff"; c.font = "700 10px -apple-system, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(n, x, y + 0.5); };
    marks.forEach(m => { badge("1", m.x1, m.y1 - 12 - tStack * sz); badge("2", m.x2 + 9, Math.min(H - mb - 10, m.y2 + 4)); });
    if (marks.length) badge("3", X(half) - 10, Y(0) - 10);
    // side panels
    c.textBaseline = "alphabetic"; c.textAlign = "left";
    const text = (s, x, y, color, bold) => { c.font = `${bold ? "700 " : ""}12px -apple-system, 'Sarabun', sans-serif`; c.fillStyle = color; c.fillText(s, x, y); };
    text(`${Lg("ภาพตัดที่ y = 0 · แนวดิ่ง ×", "cross-section at y = 0 · vertical ×")}${(sz / sx).toFixed(1)}${sec.zoom ? Lg(" (ซูมบริเวณ gap)", " (zoomed on the gap)") : ""}${Lg(" · แรงกด ", " · pressure ")}${kPa(st.p)}`, ml, 16, mut);
    if (!narrow) {
      const yE1 = Y(Hs + e1z), yE2 = Y(Hs + (zOf.E2[0] + zOf.E2[1]) / 2);
      c.strokeStyle = COL.cap; c.lineWidth = 1.2; c.beginPath(); c.moveTo(X(-G.a / 2), yE2); c.lineTo(ml - 14, yE2); c.moveTo(X(-G.a / 2), yE1); c.lineTo(ml - 14, yE1); c.stroke();
      c.textAlign = "right"; text("E2", ml - 18, yE2 + 4, cssv("--cap-t"), 1); text("E1", ml - 18, yE1 + 12, cssv("--hyb-t"), 1); c.textAlign = "left";
      let y = Math.max(48, yE1 + 34);
      text(Lg("วงจร B (E1–E2)", "Circuit B (E1–E2)"), 8, y, cssv("--cap-t"), 1); text(`C_B = ${fmtPF(st.CB.C)}`, 8, y += 16, ink);
      text(`dielectric ${(st.CB.t * 1e6).toFixed(1)} µm`, 8, y += 16, ink); text(`strain ${(strain * 100).toFixed(1)} %`, 8, y += 16, ink);
      text(`εr,eff = ${st.CB.er.toFixed(2)}`, 8, y += 16, mut);
      if (pz.S) { text(`piezo (${pz.S.pair})`, 8, 34, cssv("--pzo-t"), 1); }
      y += 26; text(Lg("gap ของวงจร A", "Circuit A gap"), 8, y, cssv("--pzr-t"), 1);
      const gc = Hs - wAt(0) - PH.domeSurface(0, 0, G);
      text(`${Lg("เหนือ dome กลาง ", "above the centre dome ")}${(Math.max(0, gc) * 1e6).toFixed(1)} µm`, 8, y += 16, ink);
      text(`C_A = ${fmtPF(st.CA)}`, 8, y += 16, ink); text(st.sol.nContact ? Lg("(ถูก R short แล้ว)", "(shorted by R)") : Lg("(ใช้งานได้ — ยังไม่แตะ)", "(active — not touching yet)"), 8, y += 16, mut);
      const xr = W - mr + 12; y = 48;
      c.strokeStyle = COL.pzr; c.beginPath(); c.moveTo(X(G.a / 2), yE1); c.lineTo(xr - 6, yE1); c.moveTo(X(half), Y(0) + 2); c.lineTo(xr - 6, Y(0) + 2); c.stroke();
      text(Lg("วงจร A (E1–CNT)", "Circuit A (E1–CNT)"), xr, y, cssv("--pzr-t"), 1); text(`R_A = ${fmtSI(st.Rlive, "Ω")}`, xr, y += 16, ink); text(`I = ${fmtSI(Itot, "A")}${Lg(" ที่ ", " at ")}${P.Vb} V`, xr, y += 16, ink);
      if (marks.length) {
        y += 8; marks.forEach(m => { const pt = st.RA.parts[m.j], nm = m.d.x < -1e-9 ? Lg("ซ้าย", "left") : m.d.x > 1e-9 ? Lg("ขวา", "right") : Lg("กลาง", "centre");
          text(`dome ${nm} · I = ${fmtSI(m.Ij, "A")}`, xr, y += 17, cssv("--pzr-t"), 1); text(`① R_contact ${fmtSI(pt.Rc, "Ω")}`, xr, y += 15, ink); text(`② R_path ${fmtSI(pt.Rpath, "Ω")}`, xr, y += 15, ink); });
        text(`③ R_pad ${fmtSI(st.RA.Rpad, "Ω")}`, xr, y += 19, ink);
        if (st.RA.Re1 > 100) text(`${Lg("+ แผ่น E1 ", "+ E1 sheet ")}${fmtSI(st.RA.Re1, "Ω")}`, xr, y += 15, ink);
        const others = st.sol.nContact - marks.length; if (others > 0) text(`${Lg("+ dome นอกภาพตัด ", "+ domes outside the section ")}${others}${Lg(" ลูก", " domes")}`, xr, y += 15, mut);
        text(Lg("จุดวิ่ง: ความเร็ว/ความถี่ ∝ log I", "moving dots: speed/frequency ∝ log I"), xr, y += 17, mut);
      } else { text(Lg("ยังไม่มี dome แตะ", "no dome touching yet"), xr, y += 22, mut); text(`${Lg("เหลือ R รั่ว ", "leak R only ")}${fmtSI(P.R_leak, "Ω")}`, xr, y += 15, mut); }
    }
    // colour bar and notes
    const bx = ml, by = H - 24, bwid = Math.min(220, W - ml - mr - 200);
    for (let i = 0; i < bwid; i++) { c.fillStyle = cmap(dLo * Math.pow(dHi / dLo, i / bwid)); c.fillRect(bx + i, by, 1.5, 9); }
    c.font = "11px -apple-system, 'Sarabun', sans-serif"; c.fillStyle = mut; c.textAlign = "left";
    c.fillText(`ε₀/gap: ${(dLo * 1e6).toFixed(3)} → ${(dHi * 1e6).toFixed(1)} pF/mm² (log)`, bx, by - 5);
    if (sec.field) c.fillText(Lg("เส้นสนามไฟฟ้า = approximate (ตรงแนวดิ่ง ไม่รวม fringing) · 1 เส้น = ประจุเท่ากัน", "field lines = approximate (vertical, no fringing) · 1 line = equal charge"), bx + bwid + 14, by + 8);
  }

  // ------------------------------------------------------------ circuit schematic
  function drawCircuit() {
    const svg = $("#cir-svg"); if (!svg.clientWidth || !LIVE) return;
    const st = LIVE, R = st.Rlive, CA = st.CA, CB = st.CB.C, f = P.f_exc_kHz * 1e3, ac = cir.mode === "ac";
    const ro = PH.readoutA(R, P), w = 2 * Math.PI * f, ZC = 1 / (w * CA), Z = PH.impedanceA(R, CA, f), fc = 1 / (2 * Math.PI * R * CA);
    const hit = st.sol.nContact > 0, domR = ac ? R < ZC : true, ink = cssv("--ink"), mut = cssv("--muted"), card = cssv("--card");
    const A = COL.pzr, B = COL.cap, Hc = COL.hyb; const At = cssv("--pzr-t"), Bt = cssv("--cap-t"), Ht = cssv("--hyb-t");
    const res = (x, y, len, vert) => { let d = `M ${x} ${y}`; const n = 6, s = len / (n * 2); for (let i = 0; i < n * 2; i++) { const o = (i % 2 ? 6 : -6); d += vert ? ` L ${x + (i === 0 ? 0 : o)} ${y + s * (i + 0.5)}` : ` L ${x + s * (i + 0.5)} ${y + (i === 0 ? 0 : o)}`; } return d + (vert ? ` L ${x} ${y + len}` : ` L ${x + len} ${y}`); };
    const capH = (x, y) => `M ${x - 4} ${y - 13} V ${y + 13} M ${x + 4} ${y - 13} V ${y + 13}`;
    const capV = (x, y) => `M ${x - 13} ${y - 4} H ${x + 13} M ${x - 13} ${y + 4} H ${x + 13}`;
    const gnd = (x, y) => `M ${x - 11} ${y} H ${x + 11} M ${x - 7} ${y + 5} H ${x + 7} M ${x - 3} ${y + 10} H ${x + 3}`;
    const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" font-size="${o.s || 12.5}" font-weight="${o.b ? 700 : 400}" fill="${o.c || ink}">${s}</text>`;
    const sw = on => on ? 3.6 : 1.4, op = on => on ? 1 : 0.45;
    const rOn = ac ? domR : true, cOn = ac ? !domR : false;
    let s = "";
    // shared node E1
    s += `<path d="M 440 62 V 286" stroke="${Hc}" stroke-width="5" stroke-linecap="round"/>` + t(440, 50, Lg("E1 — electrode ที่ใช้ร่วม", "E1 — shared electrode"), { b: 1, c: Ht });
    s += `<circle cx="440" cy="304" r="16" fill="${card}" stroke="${Hc}" stroke-width="2"/>` + (ac ? `<path d="M 430 304 q 5 -10 10 0 t 10 0" fill="none" stroke="${Hc}" stroke-width="2"/>` : `<path d="M 433 299 H 447 M 440 292 V 306 M 434 312 H 446" stroke="${Hc}" stroke-width="2"/>`);
    s += `<path d="M 440 286 V 288 M 440 320 V 336 ${gnd(440, 336)}" stroke="${ink}" stroke-width="1.5" fill="none"/>`;
    s += t(452, 226, ac ? `V_exc = ${P.Vb} V (AC)` : `V_b = ${P.Vb} V (DC)`, { a: "start", b: 1, c: Ht }) + t(452, 242, ac ? `f = ${fmtSI(f, "Hz")}` : Lg("อ่าน R ด้วย voltage divider", "R read by voltage divider"), { a: "start", c: mut, s: 11.5 });
    // circuit A
    s += t(660, 24, Lg("วงจร A — E1 ↔ ชั้น CNT ของ dome", "Circuit A — E1 ↔ CNT layer of the domes"), { b: 1, c: At });
    s += `<path d="M 440 120 H 520 M 520 84 V 156 M 740 84 V 156 M 740 120 H 790" stroke="${A}" stroke-width="1.6" fill="none"/>`;
    s += `<g opacity="${op(rOn)}"><path d="M 520 84 H 580 ${res(580, 84, 100)} H 740" stroke="${A}" stroke-width="${sw(rOn)}" fill="none" stroke-linejoin="round"/></g>`;
    s += `<g opacity="${op(cOn)}"><path d="M 520 156 H 626 M 634 156 H 740 ${capH(630, 156)}" stroke="${A}" stroke-width="${sw(cOn)}" fill="none" ${!ac ? 'stroke-dasharray="5 4"' : ""}/></g>`;
    s += t(630, 62, `R_A = ${fmtSI(R, "Ω")}`, { b: 1, c: At }) + t(630, 190, `C_A = ${fmtPF(CA)}`, { b: 1, c: At });
    s += t(630, 110, hit ? `${st.sol.nContact}${Lg(" dome ขนานกัน + R_pad", " domes in parallel + R_pad")}` : Lg("ยังไม่มี dome แตะ: เหลือ R รั่ว", "no dome touching: leak R only"), { c: mut, s: 11 });
    s += t(630, 205, hit ? Lg("ถูก R short (อ่านได้เฉพาะก่อนแตะ)", "shorted by R (readable only before contact)") : Lg("air gap ระหว่าง E1 กับ CNT", "air gap between E1 and CNT"), { c: mut, s: 11 });
    s += `<circle cx="790" cy="120" r="3.5" fill="${A}"/>` + t(790, 106, "CNT / pad", { c: mut, s: 11 });
    s += `<path d="M 790 120 V 150 ${res(790, 150, 70, 1)} V 244 ${gnd(790, 244)}" stroke="${ink}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>` + t(806, 188, `R_ref ${fmtSI(P.R_ref, "Ω")}`, { a: "start", s: 11.5 });
    s += `<path d="M 790 120 H 836" stroke="${A}" stroke-width="1.6"/><rect x="836" y="100" width="58" height="40" rx="6" fill="${card}" stroke="${A}" stroke-width="1.5"/>` + t(865, 117, "ADC", { b: 1, c: At, s: 11.5 }) + t(865, 132, `${P.adc_bits} bit`, { c: mut, s: 10.5 });
    s += ac ? t(865, 158, "lock-in", { c: At, s: 11.5 }) + t(865, 173, "Re → R, Im → C", { c: mut, s: 10.5 })
            : t(865, 158, `V_out ${ro.Vout.toFixed(4)} V`, { c: At, s: 11.5, b: 1 }) + t(865, 173, `${ro.counts.toFixed(1)} counts`, { c: ink, s: 11.5 });
    // dominance box
    const dom = !ac ? (hit ? Lg("DC: กระแสผ่าน R ทั้งหมด (C เปิดวงจร)", "DC: all current through R (C is open circuit)") : Lg("DC: ไม่มี dome แตะ → เหลือกระแสรั่ว", "DC: no dome touching → leak current only")) : (domR ? Lg("สาขา R เด่น (|Z_R| < |Z_C|)", "R branch dominates (|Z_R| < |Z_C|)") : Lg("สาขา C เด่น (|Z_C| < |Z_R|)", "C branch dominates (|Z_C| < |Z_R|)"));
    s += `<rect x="520" y="262" width="374" height="96" rx="8" fill="${card}" stroke="${A}" stroke-opacity="0.5"/>`;
    s += t(532, 281, dom, { a: "start", b: 1, c: At });
    s += t(532, 299, ac ? `|Z_R| = ${fmtSI(R, "Ω")} · |Z_C| = 1/(2πf·C_A) = ${fmtSI(ZC, "Ω")}` : `I = V_b/R_A = ${fmtSI(ro.I, "A")}`, { a: "start", s: 11.5 });
    s += t(532, 316, ac ? `I_R = ${fmtSI(P.Vb / R, "A")} · I_C = ${fmtSI(P.Vb / ZC, "A")}` : `V_out = V_b·R_ref/(R_ref + R_A)`, { a: "start", s: 11.5 });
    s += t(532, 333, `|Z| = ${fmtSI(Math.hypot(Z.re, Z.im), "Ω")} · phase ${(Math.atan2(Z.im, Z.re) * 180 / Math.PI).toFixed(1)}°` + (ac ? "" : `${Lg(" ที่ ", " at ")}${fmtSI(f, "Hz")}`), { a: "start", s: 11.5, c: mut });
    s += t(532, 350, `corner 1/(2π·R_A·C_A) = ${fmtSI(fc, "Hz")}`, { a: "start", s: 11.5, c: mut });
    // circuit B
    const sC = PH.cNoise(P), tC = PH.cTimePerTaxel(P, CB);
    s += t(pz.S ? 330 : 220, pz.S ? 20 : 24, Lg("วงจร B — E1 ↔ E2 (dielectric)", "Circuit B — E1 ↔ E2 (dielectric)"), { b: 1, c: Bt });
    s += `<g><path d="M 440 150 H 324 M 316 150 H 180 ${capH(320, 150)}" stroke="${B}" stroke-width="${ac ? 3.6 : 2.2}" fill="none"/></g>`;
    s += t(320, 124, `C_B = ${fmtPF(CB)}`, { b: 1, c: Bt }) + t(320, 182, `dielectric ${(st.CB.t * 1e6).toFixed(1)} µm · εr ${st.CB.er.toFixed(2)}`, { c: mut, s: 11 });
    s += `<circle cx="230" cy="150" r="3.5" fill="${B}"/>` + t(230, 136, "E2", { c: Bt, b: 1 });
    s += `<path d="M 230 150 V 214 M 230 222 V 250 ${capV(230, 218)} ${gnd(230, 250)}" stroke="${ink}" stroke-width="1.4" fill="none"/>` + t(250, 222, `C_par ${P.C_par_pF}${Lg(" pF (รวมอยู่ใน C_B แล้ว)", " pF (already included in C_B)")}`, { a: "start", s: 11, c: mut });
    s += `<rect x="60" y="122" width="120" height="56" rx="7" fill="${card}" stroke="${B}" stroke-width="1.6"/>` + t(120, 146, P.c_method, { b: 1, c: Bt }) + t(120, 164, Lg("อ่านค่า C", "C readout"), { c: mut, s: 11 });
    s += `<rect x="20" y="262" width="390" height="96" rx="8" fill="${card}" stroke="${B}" stroke-opacity="0.5"/>`;
    s += t(32, 281, `${Lg("ค่าที่อ่านได้: ", "reading: ")}${fmtPF(CB)} · ΔC = ${((CB - CAL.CB0) * 1e15).toFixed(1)} fF`, { a: "start", b: 1, c: Bt });
    s += t(32, 299, `noise 1σ = ${fmtSI(sC, "F")} → ΔC/σ = ${((CB - CAL.CB0) / sC).toFixed(0)}`, { a: "start", s: 11.5 });
    s += t(32, 316, `${Lg("เวลาต่อ taxel ", "time per taxel ")}${fmtSI(tC, "s")}` + (P.c_method === "AD7745" || P.c_method === "FDC1004" ? ` · ${PH.cRangeOK(P, CB)}` : ""), { a: "start", s: 11.5 });
    s += t(32, 333, Lg("C_B อ่านได้ตลอด ทั้งก่อนและหลัง dome แตะ", "C_B is readable all the time, before and after the domes touch"), { a: "start", s: 11.5, c: mut });
    s += t(32, 350, ac ? Lg("AC: ใช้ excitation เดียวกับวงจร A ได้ (E1 ร่วม)", "AC: can share the excitation with circuit A (shared E1)") : Lg("DC: C เปิดวงจร — ต้องใช้ excitation แยกเพื่ออ่าน C", "DC: C is open circuit — needs its own excitation to read C"), { a: "start", s: 11.5, c: mut });
    if (pz.S) {                                          // channel C: piezo film between E2 and E3 into a high-impedance / charge amplifier
      const Cc = "#2F6FB0", Ct = cssv("--pzo-t");
      s += `<path d="M 230 150 V 90 M 230 82 V 58 H 180 ${capV(230, 86)}" stroke="${Cc}" stroke-width="2" fill="none"/>`;
      s += `<rect x="60" y="40" width="120" height="38" rx="7" fill="${card}" stroke="${Cc}" stroke-width="1.6"/>` + t(120, 56, Lg("ขยาย piezo", "piezo amp"), { b: 1, c: Ct, s: 12 }) + t(120, 71, `R_in ${fmtSI(P.pz_Rin_MOhm * 1e6, "Ω")}`, { c: mut, s: 10.5 });
      s += t(250, 62, `piezo ${pz.S.pair} · ${fmtSI(pz.V, "V")}`, { a: "start", b: 1, c: Ct, s: 12 }) + t(250, 77, `C_pz ${fmtPF(pz.S.Cpz)}${Lg(" · ตัดล่าง ", " · low cut-off ")}${pz.S.fc.toPrecision(2)} Hz`, { a: "start", c: mut, s: 11 });
      s += t(250, 91, `Q = d33·p·A = ${fmtSI(pz.S.QperPa * st.p, "C")}`, { a: "start", c: mut, s: 11 });
    }
    svg.setAttribute("viewBox", "0 0 910 368"); svg.innerHTML = s;
  }

  // ------------------------------------------------------------ 16 x 9 array
  function lutAt(p) {                               // p in Pa → signals of one taxel (lookup in sweep)
    const pts = SWEEP.pts;
    if (!(p > pts[0].p)) return { p: 0, R: pts[0].R, CB: pts[0].CB, n: 0 };
    if (p >= pts[pts.length - 1].p) { const q = pts[pts.length - 1]; return { p, R: q.R, CB: q.CB, n: q.nContact, sat: true }; }
    let k = 1; while (k < pts.length - 1 && pts[k].p < p) k++;
    return { p, R: interpLog(pts, p, q => q.R, true), CB: interpLog(pts, p, q => q.CB), n: pts[k - 1].nContact };
  }
  function arrayLayout() {
    const nx = Math.max(P.rows, P.cols), ny = Math.min(P.rows, P.cols), tx = P.taxel_mm, pit = tx + P.array_gap_mm;
    return { nx, ny, tx, pit, Wmm: nx * pit - P.array_gap_mm, Hmm: ny * pit - P.array_gap_mm };
  }
  function indenterP(dx, dy) {                      // contact pressure (Pa) at offset from the indenter centre (mm)
    const r2 = (dx * dx + dy * dy) / (arr.r * arr.r); if (r2 >= 1) return 0;
    const pm = arr.F / (Math.PI * arr.r * arr.r * 1e-6);       // mean pressure, Pa
    return arr.shape === "finger" ? 1.5 * pm * Math.sqrt(1 - r2) : pm;
  }
  function sampleArray() {
    const L = arrayLayout(), out = [];
    for (let j = 0; j < L.ny; j++) for (let i = 0; i < L.nx; i++) {
      const x0 = i * L.pit, y0 = j * L.pit; let s = 0;
      for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) s += indenterP(x0 + (a + 0.5) / 5 * L.tx - arr.x, y0 + (b + 0.5) / 5 * L.tx - arr.y);
      out.push(lutAt(s / 25));
    }
    return out;
  }
  function stepArray(dt, now) {
    const L = arrayLayout();
    if (arr.auto && !arr.drag) { arr.x += arr.dir * 12 * dt; if (arr.x > L.Wmm) { arr.x = L.Wmm; arr.dir = -1; } if (arr.x < 0) { arr.x = 0; arr.dir = 1; } }
  }
  function drawArray(now) {
    const cv = $("#arr-cv"); if (!cv.clientWidth || !SWEEP) return;
    const { c, W, H } = fitCanvas(cv), L = arrayLayout(), ink = cssv("--ink"), mut = cssv("--muted"), line = cssv("--line");
    const fr = frameRates(CAL.CB0), tNow = now || performance.now();
    if (!arr.shown || !arr.real || tNow - arr.lastSample >= 1000 / fr.both) { arr.shown = sampleArray(); arr.lastSample = tNow; }
    const padX = 14, gapX = 22, top = 30, mw = (W - 2 * padX - gapX) / 2, sc = Math.min(mw / L.Wmm, (H - top - 42) / L.Hmm);
    const ox = [padX + (mw - L.Wmm * sc) / 2, padX + mw + gapX + (mw - L.Wmm * sc) / 2];
    arr.geo = { ox, top, sc, L };
    const I0 = P.Vb / P.R_leak, Imax = P.Vb / CAL.Rmin, dCmax = CAL.CBmax - CAL.CB0;
    const colA = v => rgb(mix([250, 238, 225], RGB.pzr, Math.min(1, Math.max(0, Math.log10((P.Vb / v.R) / I0) / Math.log10(Imax / I0)))));
    const colB = v => rgb(mix([226, 242, 241], RGB.cap, Math.min(1, Math.max(0, (v.CB - CAL.CB0) / dCmax))));
    c.font = "600 12.5px -apple-system, 'Sarabun', sans-serif"; c.textBaseline = "alphabetic";
    [[Lg("ช่อง A — กระแส I = V_b/R (log)", "Channel A — current I = V_b/R (log)"), cssv("--pzr-t"), colA], [Lg("ช่อง B — ΔC_B (linear)", "Channel B — ΔC_B (linear)"), cssv("--cap-t"), colB]].forEach(([title, col, cf], m) => {
      c.fillStyle = col; c.textAlign = "left"; c.fillText(title, ox[m], 18);
      arr.shown.forEach((v, k) => { const i = k % L.nx, j = Math.floor(k / L.nx); c.fillStyle = cf(v); c.fillRect(ox[m] + i * L.pit * sc, top + j * L.pit * sc, L.tx * sc, L.tx * sc); c.strokeStyle = line; c.lineWidth = 0.6; c.strokeRect(ox[m] + i * L.pit * sc, top + j * L.pit * sc, L.tx * sc, L.tx * sc); });
      c.strokeStyle = ink; c.lineWidth = 1.5; c.setLineDash(arr.shape === "finger" ? [] : [5, 3]); c.beginPath(); c.arc(ox[m] + arr.x * sc, top + arr.y * sc, arr.r * sc, 0, 7); c.stroke(); c.setLineDash([]);
      // colour bar
      const by = top + L.Hmm * sc + 12, bw = Math.min(180, L.Wmm * sc * 0.5);
      for (let q = 0; q < bw; q++) { c.fillStyle = rgb(mix(m ? [226, 242, 241] : [250, 238, 225], m ? RGB.cap : RGB.pzr, q / bw)); c.fillRect(ox[m] + q, by, 1.5, 8); }
      c.font = "11px -apple-system, 'Sarabun', sans-serif"; c.fillStyle = mut;
      c.fillText(m ? `0 → ${(dCmax * 1e12).toFixed(2)}${Lg(" pF (ที่ ", " pF (at ")}${P.p_max_kPa} kPa)` : `${fmtSI(I0, "A")} → ${fmtSI(Imax, "A")}`, ox[m] + bw + 8, by + 8);
      c.font = "600 12.5px -apple-system, 'Sarabun', sans-serif";
    });
    const act = arr.shown.filter(v => v.n > 0).length, pmx = Math.max(...arr.shown.map(v => v.p)), sat = arr.shown.some(v => v.sat);
    const okf = f => `<b class="${f >= 50 ? "good" : "bad"}">${f < 10 ? f.toFixed(2) : f.toFixed(0)} Hz</b>`;
    let h = `array ${L.nx} × ${L.ny} = ${fr.nT} taxel · pitch ${(L.pit).toFixed(3)}${Lg(" mm · ขนาด ", " mm · size ")}${L.Wmm.toFixed(1)} × ${L.Hmm.toFixed(1)}${Lg(" mm · taxel ที่ dome แตะ <b>", " mm · taxels with a dome touching <b>")}${act}${Lg("</b> · p สูงสุดบน taxel <b>", "</b> · max p on a taxel <b>")}${(pmx / 1e3).toFixed(1)} kPa</b>${sat ? Lg(" <span class=\"bad\">(เกินช่วง sweep — ค่าถูกตัดที่ p_max)</span>", " <span class=\"bad\">(beyond the sweep — clipped at p_max)</span>") : ""}<br>`;
    h += `${Lg("array นี้ refresh ที่ ", "this array refreshes at ")}${okf(fr.both)}${Lg(" เมื่ออ่าน R + C สลับกัน · R อย่างเดียว ", " when reading R + C alternately · R only ")}${okf(fr.R)}${Lg(" · C อย่างเดียว (", " · C only (")}${P.c_method}) ${okf(fr.C)}`;
    if (arr.hover != null && arr.shown[arr.hover]) { const v = arr.shown[arr.hover]; h += `<br>taxel (${arr.hover % L.nx + 1}, ${Math.floor(arr.hover / L.nx) + 1}): p = ${(v.p / 1e3).toFixed(2)} kPa · R = ${fmtSI(v.R, "Ω")} · C_B = ${fmtPF(v.CB)}${Lg(" · dome แตะ ", " · domes touching ")}${v.n}/9`; }
    $("#arr-info").innerHTML = h;
  }
  function wireArray() {
    const cv = $("#arr-cv");
    const pos = e => { const g = arr.geo; if (!g) return null; const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, m = x > g.ox[1] - 10 ? 1 : 0; return { mx: (x - g.ox[m]) / g.sc, my: (y - g.top) / g.sc }; };
    cv.addEventListener("pointerdown", e => { const q = pos(e); if (!q) return; arr.drag = true; cv.setPointerCapture(e.pointerId); arr.x = q.mx; arr.y = q.my; drawArray(); });
    cv.addEventListener("pointermove", e => {
      const q = pos(e); if (!q) return; const L = arr.geo.L;
      if (arr.drag) { arr.x = Math.min(L.Wmm, Math.max(0, q.mx)); arr.y = Math.min(L.Hmm, Math.max(0, q.my)); }
      const i = Math.floor(q.mx / L.pit), j = Math.floor(q.my / L.pit);
      arr.hover = (i >= 0 && j >= 0 && i < L.nx && j < L.ny && q.mx - i * L.pit <= L.tx && q.my - j * L.pit <= L.tx) ? j * L.nx + i : null;
      drawArray();
    });
    const end = () => { arr.drag = false; }; cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    cv.addEventListener("pointerleave", () => { arr.hover = null; });
  }

  // ------------------------------------------------------------ view switching and wiring
  function draw() {
    if (!LIVE) return;
    if (view === "3d") Viz3D.update(LIVE); else if (view === "sec") drawSection(); else if (view === "cir") drawCircuit(); else drawArray();
  }
  function setView(v) {
    view = v;
    document.querySelectorAll("#view-seg button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
    document.querySelectorAll("#stage .view").forEach(el => el.style.display = el.id === "v-" + v ? "block" : "none");
    document.querySelectorAll(".vopts").forEach(el => el.style.display = el.id === "opts-" + v ? "flex" : "none");
    draw(); if (v === "3d") Viz3D.requestRender(); kick();
  }
  function update() {                                  // live state changed
    const now = performance.now(); stepPiezo(now);
    if (!CAL) return;
    draw(); drawStory(); scope.activeUntil = now + 2500; kick();
  }
  function modelChanged() {                            // parameters changed → new sweep / geometry
    buildCal(); arr.shown = null;
    const L = arrayLayout(); if (!arr.init) { arr.x = L.Wmm * 0.32; arr.y = L.Hmm * 0.5; arr.init = true; }
    Viz3D.rebuild(MODEL, P);
    scope.buf = []; pz.V = 0; pz.t = performance.now(); drawMarks();
  }
  function init() {
    Viz3D.init($("#three-host"), $("#three-ov"));
    document.querySelectorAll("#view-seg button").forEach(b => b.addEventListener("click", () => setView(b.dataset.v)));
    const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
    on("#o-explode", "change", e => Viz3D.setOptions({ explode: e.target.checked }));
    on("#o-section", "change", e => Viz3D.setOptions({ section: e.target.checked }));
    on("#o-labels", "change", e => Viz3D.setOptions({ labels: e.target.checked }));
    on("#o-exag", "input", e => { $("#o-exag-v").textContent = "×" + e.target.value; Viz3D.setOptions({ exag: +e.target.value }); });
    on("#o-zoom", "change", e => { sec.zoom = e.target.checked; drawSection(); });
    on("#o-field", "change", e => { sec.field = e.target.checked; drawSection(); });
    document.querySelectorAll("#cir-mode button").forEach(b => b.addEventListener("click", () => { cir.mode = b.dataset.m; document.querySelectorAll("#cir-mode button").forEach(x => x.classList.toggle("on", x === b)); drawCircuit(); }));
    on("#o-freq", "input", e => { P.f_exc_kHz = +Math.pow(10, +e.target.value).toPrecision(3); $("#o-freq-v").textContent = fmtSI(P.f_exc_kHz * 1e3, "Hz"); const row = document.querySelector('.prow[data-k="f_exc_kHz"]'); if (row) { const [rg, nb] = row.querySelectorAll("input"); rg.value = e.target.value; nb.value = P.f_exc_kHz; } drawCircuit(); if (currentTab === "rd") renderTab("rd"); });
    on("#a-shape", "change", e => { arr.shape = e.target.value; arr.shown = null; drawArray(); });
    on("#a-r", "input", e => { arr.r = +e.target.value; $("#a-r-v").textContent = arr.r + " mm"; arr.shown = null; drawArray(); });
    on("#a-f", "input", e => { arr.F = +e.target.value; $("#a-f-v").textContent = arr.F + " N"; arr.shown = null; drawArray(); });
    on("#a-auto", "change", e => { arr.auto = e.target.checked; kick(); });
    on("#a-real", "change", e => { arr.real = e.target.checked; arr.shown = null; drawArray(); kick(); });
    wireArray();
    on("#an-play", "click", play);
    on("#an-scrub", "input", e => { stopAnim(false); anim.u = +e.target.value / 1000; applyAnim(true); });
    on("#an-peak", "change", e => { anim.peak = Math.max(1, +e.target.value || 1); });
    on("#an-slow", "change", e => { anim.slow = e.target.checked; });
    on("#an-loop", "change", e => { anim.loop = e.target.checked; });
    on("#an-accel", "change", e => { anim.accel = +e.target.value; });
    on("#an-shape", "change", e => { anim.shape = e.target.value; anim.u = 0; });
    new ResizeObserver(() => { if (LIVE && CAL) { if (view !== "3d") draw(); drawScope(); } }).observe($("#stage"));
    setView("3d");
  }
  return { init, update, modelChanged, stopAnim, drawScope, setView, anim, arr, sec, cir, piezo: () => (pz.S ? pz : null), get view() { return view; } };
})();

// ============================================================================
// "เรียนรู้" panel: one short explanation per mechanism, linked to the
// knowledge-base page and the paper figure it comes from.
// ============================================================================
const LEARN = [
  { t: Lg("Contact resistance (ช่อง R)", "Contact resistance (channel R)"), c: "pzr",
    b: Lg("เมื่อ dome ที่เคลือบ resin-CNT แตะ electrode กระแสต้องบีบผ่านจุดสัมผัสเล็ก ๆ จึงเกิด constriction resistance (Holm) ยิ่งกดแรง พื้นที่สัมผัส (Hertz) ยิ่งโต ความต้านทานจึงลด ช่อง R ของเราจึงเป็น contact-resistive มากกว่า piezoresistive แท้ — สัญญาณตามพื้นที่สัมผัส ไม่ใช่ ρ ของวัสดุ", "When a resin-CNT-coated dome touches the electrode, current must squeeze through small contact spots, giving constriction resistance (Holm). The harder the press, the larger the contact area (Hertz) and the lower the resistance. Our channel R is therefore contact-resistive rather than truly piezoresistive — the signal follows contact area, not the material's ρ"),
    sim: Lg("ดูมุมมอง “ภาพตัดขวาง” หลัง dome แตะ: ① R_contact ② R_path ③ R_pad และแท็บ “กลไก” สำหรับรัศมีสัมผัสของแต่ละ dome", "Look at the “Cross-section” view after a dome touches: ① R_contact ② R_path ③ R_pad, and the “Mechanics” tab for each dome's contact radius"),
    src: [["zaki_afm_2025", "AFM 2025 Eq. 6, Fig. 3C–D"], ["zaki_mems_2026", "MEMS 2026 Eq. 2, Fig. 2c"], ["wang_2023_gpphs", "Wang 2023 Fig. 4 (R_tc, R_pp, R_bc)"], ["speaker_notes_hybrid_reasoning", Lg("speaker notes สไลด์ 12–13", "speaker notes slides 12–13")]] },
  { t: Lg("Percolation ของ CNT", "CNT percolation"), c: "pzr",
    b: Lg("CNT ใน resin จะนำไฟฟ้าได้เมื่อปริมาณเกิน threshold จนต่อกันเป็นเครือข่าย เหนือ threshold conductivity เพิ่มตาม (φ − φc)^t กราฟของ Zaki กระโดดราว 4 decade ระหว่าง 0.5 และ 1 wt% และเลือกใช้ 5 wt% เพราะนำไฟฟ้าดีและยังพิมพ์ได้", "CNT in resin conducts once its content passes a threshold and the tubes connect into a network. Above the threshold, conductivity grows as (φ − φc)^t. Zaki's graph jumps about 4 decades between 0.5 and 1 wt%, and 5 wt% was chosen because it conducts well and is still printable"),
    sim: Lg("แท็บ “CNT & การพิมพ์”: กราฟ σ กับ wt% (fit ให้ผ่าน ~4×10⁻³ S/cm ที่ 5 wt%)", "“CNT & printing” tab: σ vs wt% (fitted through ~4×10⁻³ S/cm at 5 wt%)"),
    src: [["zaki_afm_2025", "AFM 2025 Fig. 2I, p.6"], ["wang_2022_gradient_pore", "Wang 2022 (PDMS/CNT)"]] },
  { t: Lg("Gap capacitance (C_A ก่อนแตะ)", "Gap capacitance (C_A before contact)"), c: "pzr",
    b: Lg("ก่อน dome แตะ electrode E1 กับชั้น CNT มีอากาศคั่น จึงเป็น capacitor อยู่แล้ว เมื่อกด แผ่นบนยุบ gap แคบลง C_A = ∫ε₀/gap dA จึงเพิ่ม ช่วงนี้ช่อง R ยังไม่มีสัญญาณ (dead-zone ของ tactile switch) แต่ C_A ใช้บอกแรงได้ หลังแตะ C_A ถูก R short", "Before a dome touches, E1 and the CNT layer are separated by air, so they already form a capacitor. When pressed, the top plate deflects, the gap narrows and C_A = ∫ε₀/gap dA rises. Channel R has no signal yet (tactile-switch dead zone), but C_A reports force. After contact, C_A is shorted by R"),
    sim: Lg("มุมมอง “ภาพตัดขวาง”: สีส้มใน gap = ε₀/gap และเส้นสนามไฟฟ้า (approximate) · scope: เส้น “จาก C_A”", "“Cross-section” view: orange in the gap = ε₀/gap, plus electric field lines (approximate) · scope: the “from C_A” trace"),
    src: [["zaki_mems_2026", "MEMS 2026 Fig. 2b–c (micro-gap 30 µm)"], ["zaki_afm_2025", Lg("AFM 2025 Fig. 3B (gap 60 µm สองชั้น)", "AFM 2025 Fig. 3B (60 µm gap, two layers)")], ["speaker_notes_hybrid_reasoning", Lg("speaker notes สไลด์ 14, 25", "speaker notes slides 14, 25")]] },
  { t: "Dielectric compression (C_B)", c: "cap",
    b: Lg("วงจร B วัดความจุระหว่าง E1 กับ E2 ผ่าน dielectric: C = ε₀εr·A/d แรงกดทำให้ d ลด ถ้า dielectric มีรูพรุน อากาศถูกแทนด้วยยาง εr จึงเพิ่มด้วย ยางตันเกือบ incompressible จึงยุบยาก — ต้องมีรูพรุนหรือ microstructure C_B อ่านได้ตลอดทั้งก่อนและหลัง dome แตะ", "Circuit B measures the capacitance between E1 and E2 through the dielectric: C = ε₀εr·A/d. Pressure reduces d; if the dielectric is porous, air is replaced by rubber so εr rises too. Solid rubber is nearly incompressible and hard to compress — it needs pores or microstructure. C_B is readable before and after the domes touch"),
    sim: Lg("มุมมอง “ภาพตัดขวาง”: สีของ dielectric = strain และตัวเลขความหนา · ลองตั้ง porosity = 0 เทียบกับ 0.5", "“Cross-section” view: dielectric colour = strain, with its thickness · try porosity = 0 against 0.5"),
    src: [["yin_2024_three_axis_capacitive", "Yin 2024 Eq. 1–2, Fig. 4, 8a"], ["wang_2022_gradient_pore", "Wang 2022 Fig. 1c, 2c"], ["zhan_2025_review", "Zhan 2025 Eq. 3"]] },
  { t: Lg("Creep และ drift", "Creep and drift"), c: "hyb",
    b: Lg("ยาง (TPU, dielectric) เป็น viscoelastic: กดค้างแล้วยังยุบต่อช้า ๆ (creep) ทั้งสองช่องจึงคลาดไปทางเดียวกัน (common-mode) ส่วนเครือข่าย CNT จัดเรียงตัวใหม่ทำให้ R drift ตาม log ของเวลา ซึ่งมีเฉพาะช่อง R paper ของ Zaki และ Wang ไม่ได้รายงานค่าเหล่านี้ — ค่าใน simulator เป็นค่าเดาที่ต้องวัด", "Rubber (TPU, dielectric) is viscoelastic: under a held load it keeps compressing slowly (creep), so both channels drift the same way (common mode). The CNT network also rearranges, so R drifts with log time, which affects only channel R. The Zaki and Wang papers do not report these values — the simulator's values are guesses to be measured"),
    sim: Lg("ปุ่ม ▶ พร้อม “เวลา hold จำลอง ×600” แล้วดู scope: ค่าที่ประมาณจาก R กับ C_B แยกออกจากแรงจริง · แท็บ “drift / creep / รวมสัญญาณ”", "Press ▶ with “simulated hold time ×600” and watch the scope: the forces estimated from R and C_B separate from the true force · “drift / creep / fusion” tab"),
    src: [["speaker_notes_hybrid_reasoning", Lg("speaker notes สไลด์ 16, 23", "speaker notes slides 16, 23")], ["parameters_from_papers", Lg("ตารางที่มาของค่า (หมวด 4: ⚠ ทั้งหมด)", "source table (section 4: all ⚠)")]] },
  { t: "Hybrid fusion (R + C)", c: "hyb",
    b: Lg("สองช่องผิดพลาดจากคนละแหล่ง จึงใช้ตรวจกันได้: (1) R บอกว่าแตะหรือยัง ถ้ายังใช้ C (2) ถ่วงน้ำหนักตาม noise (3) complementary filter เอาส่วนเร็วจาก R ส่วนช้าจาก C (4) ถ้าสองช่องต่างกันมากแสดงว่า taxel อาจเสีย เงื่อนไขคือ C ต้อง creep น้อยจริง จากนั้น robot ใช้แรงที่ได้ใน grip controller F_z = F_t/µ + margin", "The two channels err for different reasons, so they can check each other: (1) R says whether contact has happened; if not, use C (2) weight by noise (3) complementary filter: fast part from R, slow part from C (4) if the two disagree a lot, the taxel may be faulty. This requires C to creep little. The robot then uses the force in the grip controller F_z = F_t/µ + margin"),
    sim: Lg("มุมมอง “วงจร A/B”: E1 ใช้ร่วม, DC เห็น R, AC ความถี่สูงเห็น C · แท็บ “drift / creep / รวมสัญญาณ”: เส้นสีม่วง", "“Circuits A/B” view: shared E1, DC sees R, high-frequency AC sees C · “drift / creep / fusion” tab: purple line"),
    src: [["speaker_notes_hybrid_reasoning", Lg("speaker notes สไลด์ 23–34", "speaker notes slides 23–34")], ["su_2015_grip_control", "Su 2015 Fig. 4"], ["li_review_tactile_information", "Li review (pretouch, slip)"], ["yin_2024_three_axis_capacitive", "Yin 2024 Fig. 6 (AD7745)"]] },
  { t: Lg("Large deflection (แผ่นบนยืดตัว)", "Large deflection (top plate stretching)"), c: "hyb",
    b: Lg("ทฤษฎีแผ่นแบบเส้นตรงใช้ได้เมื่อแผ่นยุบน้อยกว่าความหนาของมันมาก แต่ที่นี่แผ่นหนาไม่กี่สิบ µm ต้องยุบ 30 µm ขึ้นไป แผ่นจึงต้องยืดตัวในระนาบด้วย และแข็งขึ้นตามกำลังสามของการยุบ ผลคือ dome แตะช้าลง (dead-zone กว้างขึ้น) โดยเฉพาะเมื่อ electrode เป็นทองแดงหนา เพราะความแข็งแบบยืดขึ้นกับ E·t ของโลหะ", "Linear plate theory holds when the deflection is much smaller than the plate thickness, but here a plate a few tens of µm thick must deflect 30 µm or more, so it also stretches in plane and stiffens with the cube of the deflection. The domes touch later (wider dead zone), especially with thick copper electrodes, because the stretching stiffness depends on the metal's E·t"),
    sim: Lg("ดูค่า “แผ่นบนแข็งขึ้น ×κ” ในแถบอธิบาย · เทียบชุดค่า “ทองแดง FPC” กับ “โลหะบาง” · ปิดได้ที่หมวด “การคำนวณ”", "See “top plate stiffer ×κ” in the description strip · compare the “copper FPC” and “thin metal” presets · can be switched off under “Computation”"),
    src: [["research_mechanics_materials", Lg("สูตร large deflection + ชนิด electrode", "large-deflection formula + electrode types")], ["zaki_mems_2026", Lg("MEMS 2026 (ตอบสนองตั้งแต่ 1 kPa)", "MEMS 2026 (responds from 1 kPa)")]] },
  { t: Lg("วัสดุ piezo เป็น dielectric (E1–E2)", "Piezo material as the dielectric (E1–E2)"), c: "pzo",
    b: Lg("ฟิล์ม piezo เช่น PVDF หรือ P(VDF-TrFE) ให้ประจุ Q = d33·F เมื่อถูกกด แต่ประจุรั่วผ่านความต้านทานของวงจร จึงให้สัญญาณเฉพาะตอนแรงเปลี่ยน (เคาะ สั่น ลื่น) และกลับเป็นศูนย์เมื่อกดค้าง มันจึงเสริม R และ C ที่วัดแรงนิ่งได้ ไม่ได้มาแทน ข้อควรระวังคือฟิล์มเป็น pyroelectric ด้วย อุณหภูมิที่เปลี่ยนให้ประจุเหมือนกัน", "A piezo film such as PVDF or P(VDF-TrFE) gives charge Q = d33·F when pressed, but the charge leaks through the circuit resistance, so it only signals while the force changes (tap, vibration, slip) and returns to zero under a held press. It complements R and C, which measure static force; it does not replace them. Note that the film is also pyroelectric: a temperature change gives charge too"),
    sim: Lg("แบบที่ยืนยันกับอาจารย์: วัสดุ piezo จาก Table 1 อยู่ระหว่าง E1 กับ E2 แทน dielectric ยาง (ไม่มี E3) · วัสดุเนื้อตันแข็งเกินกว่าจะบางลงเมื่อกด C จึงไม่เปลี่ยน คู่ E1–E2 ให้สัญญาณ piezo ส่วนแรงคงที่อ่านจากช่อง R · เลือกชุดค่า “dielectric = ฟิล์ม PVDF” แล้วเล่น animation แบบ “เคาะ” หรือ “ค้าง + สั่น”: ดูเลนล่างสุดของ scope · ลองเลื่อน ΔT เพื่อดูสัญญาณ pyroelectric", "Design confirmed with the professor: the Table 1 piezo material sits between E1 and E2 instead of a rubber dielectric (no E3) · solid materials are too stiff to thin when pressed, so C does not change; the E1–E2 pair gives the piezo signal and static force is read from channel R · choose the “Dielectric = PVDF film” preset and play the “tap” or “hold + vibration” animation: watch the bottom lane of the scope · move ΔT to see the pyroelectric signal"),
    src: [["research_piezo_as_dielectric", Lg("งานวิจัยที่ใช้ piezo เป็น dielectric / R + piezo", "research using piezo as the dielectric / R + piezo")], ["research_piezo_materials", Lg("ค่าคงที่ของวัสดุ piezo + วงจรอ่าน", "piezo material constants + readout circuit")], ["zaki_afm_2025", Lg("AFM 2025 (เทียบกับช่อง R)", "AFM 2025 (compared with channel R)")]] },
  { t: Lg("อุณหภูมิ", "Temperature"), c: "hyb",
    b: Lg("อุณหภูมิเปลี่ยนสามอย่างพร้อมกัน: ยาง (TPU, dielectric) นิ่มหรือแข็งขึ้น, ค่า εr ของ dielectric เปลี่ยน และความต้านทานของชั้น CNT เปลี่ยน (TCR) ถ้าใช้ calibration เดิม แรงที่อ่านได้จะคลาด โดยสองช่องคลาดไม่เท่ากัน จึงใช้ R กับ C แยกผลของอุณหภูมิออกจากแรงได้ในหลักการ", "Temperature changes three things at once: the rubbers (TPU, dielectric) soften or stiffen, the dielectric εr changes, and the CNT layer resistance changes (TCR). With the old calibration the force reading drifts, and the two channels drift by different amounts, so in principle R and C can separate temperature from force"),
    sim: Lg("เลื่อน “อุณหภูมิ ΔT” ใต้ปุ่ม ▶ แล้วดู scope: เส้น “จาก R” และ “จาก C_B” แยกจากแรงจริง · แท็บ “หาค่าที่ดีที่สุด” มีเป้าหมาย “ทนอุณหภูมิ”", "Move “Temperature ΔT” under the ▶ button and watch the scope: the “from R” and “from C_B” traces separate from the true force · the “Find best values” tab has a “temperature tolerant” goal"),
    src: [["research_temperature_stability", Lg("ค่าสัมประสิทธิ์อุณหภูมิจากงานวิจัย", "temperature coefficients from the literature")], ["speaker_notes_hybrid_reasoning", Lg("speaker notes สไลด์ 16, 23", "speaker notes slides 16, 23")]] },
];
function mdToHtml(md) {
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\(([\w-]+)\.md\)/g, '<a href="knowledge/$2.md" data-kb="$2">$1</a>');
  const out = []; let list = false, table = false;
  const close = () => { if (list) { out.push("</ul>"); list = false; } if (table) { out.push("</table>"); table = false; } };
  md.split(/\r?\n/).forEach(line => {
    if (/^\|/.test(line)) {
      if (/^\|[\s:|-]+\|$/.test(line)) return;
      const cells = line.replace(/^\||\|$/g, "").split("|").map(s => s.trim());
      if (!table) { close(); out.push("<table>"); table = true; out.push("<tr>" + cells.map(x => `<th>${inl(x)}</th>`).join("") + "</tr>"); }
      else out.push("<tr>" + cells.map(x => `<td>${inl(x)}</td>`).join("") + "</tr>");
      return;
    }
    if (/^\s*- /.test(line)) { if (!list) { close(); out.push("<ul>"); list = true; } out.push("<li>" + inl(line.replace(/^\s*- /, "")) + "</li>"); return; }
    close();
    const h = /^(#{1,3}) (.*)/.exec(line);
    if (h) out.push(`<h${h[1].length + 2}>${inl(h[2])}</h${h[1].length + 2}>`); else if (line.trim()) out.push("<p>" + inl(line) + "</p>");
  });
  close(); return out.join("");
}
function openKB(name) {
  const md = (typeof KNOWLEDGE !== "undefined" && KNOWLEDGE[name]) || null;
  $("#kb-title").textContent = "knowledge/" + name + ".md";
  $("#kb-body").innerHTML = md ? mdToHtml(md) : `${Lg("<p>หน้านี้ไม่ได้รวมอยู่ใน build นี้ (<code>knowledge/", "<p>This page is not included in this build (<code>knowledge/")}${name}.md</code>)</p>`;
  $("#kb-modal").style.display = "flex"; $("#kb-body").scrollTop = 0;
}
function tabLearn() {
  const host = $("#learn-cards"); if (host.dataset.done) return; host.dataset.done = 1;
  const KB = typeof KNOWLEDGE !== "undefined" ? KNOWLEDGE : {};
  host.innerHTML = LEARN.map(m => `<div class="lcard ${m.c}"><h4>${m.t}</h4><p>${m.b}${Lg("</p><p class=\"note\"><b>ดูใน simulator:</b> ", "</p><p class=\"note\"><b>See in the simulator:</b> ")}${m.sim}</p>
    <div class="lsrc">${m.src.map(([f, fig]) => KB[f] ? `<a href="knowledge/${f}.md" data-kb="${f}${Lg("\" title=\"เปิดหน้าความรู้ ", "\" title=\"open knowledge page ")}${f}.md">${fig}</a>` : `<span>${fig}</span>`).join("")}</div></div>`).join("");
  $("#kb-list").innerHTML = Object.keys(typeof KNOWLEDGE !== "undefined" ? KNOWLEDGE : {}).sort().map(k => `<a href="knowledge/${k}.md" data-kb="${k}">${k}.md</a>`).join("");
}
document.addEventListener("click", e => {
  const a = e.target.closest && e.target.closest("a[data-kb]");
  if (a && typeof KNOWLEDGE !== "undefined") { e.preventDefault(); openKB(a.dataset.kb); }   // inlined copy; a missing page shows a note instead of a dead link
  if (e.target.id === "kb-modal" || e.target.id === "kb-close") $("#kb-modal").style.display = "none";
});
