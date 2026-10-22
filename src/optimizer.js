// ============================================================================
// Design search: evaluates every combination of the design choices with the
// SAME physics as the rest of the page, scores each one on several goals, and
// picks the best design for one goal or the best compromise for several.
// The core (no DOM) also runs in Node for tests.
// ============================================================================
const Optimizer = (() => {
  const PH = typeof Physics !== "undefined" ? Physics : require("./physics.js");
  // language helpers from i18n.js in the browser; Thai text when the core runs in Node
  const Lg = globalThis.Lg || (th => th), Ld = globalThis.Ld || ((o, k) => (o ? o[k] : ""));

  // design choices that are searched (everything else stays as set in the parameter panel)
  const SPACE = {
    full: { diel_mat: ["TPU resin (DLP)", "PDMS Sylgard 184", "Dragon Skin 10", "Ecoflex 00-30"], porosity: [0, 0.3, 0.5, 0.7],
            diel_um: [50, 100, 200, 400], elec: ["Resin-CNT (print)", "Copper (FPC)", "Silver ink", "Sputtered Cu (thin)"], pi_um: [0, 12.5, 25], gap_um: [15, 30, 60] },
    fast: { diel_mat: ["TPU resin (DLP)", "PDMS Sylgard 184", "Dragon Skin 10", "Ecoflex 00-30"], porosity: [0, 0.5],
            diel_um: [50, 100, 400], elec: ["Resin-CNT (print)", "Copper (FPC)", "Silver ink", "Sputtered Cu (thin)"], pi_um: [0, 25], gap_um: [15, 30, 60] },
  };
  // ⚠ our own judgement of how well each choice fits the lab's s-gDLP process (5 = no new step)
  const FAB = {
    diel_mat: { "TPU resin (DLP)": 5, "PDMS Sylgard 184": 3, "Dragon Skin 10": 3, "Ecoflex 00-30": 3 },
    elec: { "Resin-CNT (print)": 5, "Copper (FPC)": 3, "Silver ink": 3, "Sputtered Cu (thin)": 1 },   // only resin-CNT is made by the s-gDLP process itself
    porous: { "TPU resin (DLP)": 0, other: -1 },       // printed lattice is free; a cast foam needs a template step
  };
  const GOALS = [
    { k: "dead", name: Lg("dead-zone เล็ก", "small dead zone"), long: Lg("แรงกดที่ dome แรกแตะ (ต่ำกว่านี้ช่อง R ไม่มีสัญญาณ)", "pressure at which the first dome touches (below this channel R has no signal)"), unit: "kPa", low: 1, log: 1 },
    { k: "resLow", name: Lg("ละเอียดที่แรงเบา", "fine at light force"), long: Lg("ความละเอียดของแรงที่ noise จำกัด เฉลี่ยช่วง 0.5–10 kPa (ช่องที่ดีที่สุด ณ แต่ละแรง)", "noise-limited force resolution, averaged over 0.5–10 kPa (best channel at each force)"), unit: "kPa", low: 1, log: 1 },
    { k: "resHigh", name: Lg("ละเอียดที่แรงสูง", "fine at high force"), long: Lg("ความละเอียดเฉลี่ยช่วง 10–300 kPa", "average resolution over 10–300 kPa"), unit: "kPa", low: 1, log: 1 },
    { k: "range", name: Lg("ช่วงแรงกว้าง", "wide range"), long: Lg("แรงกดสูงสุดก่อนที่ dome ยุบเกิน 30 %, รูพรุนปิดหมด หรือ C เกินช่วงของชิป", "maximum pressure before a dome compresses more than 30 %, the pores close, or C leaves the chip range"), unit: "kPa", low: 0, log: 1 },
    { k: "temp", name: Lg("ทนอุณหภูมิ", "temperature tolerant"), long: Lg("ความคลาดของแรงที่อ่านจาก C_B ที่ 50 kPa เมื่ออุ่นขึ้น 10 K (ใช้ calibration เดิม)", "force error read from C_B at 50 kPa after warming by 10 K (old calibration)"), unit: "%", low: 1, log: 0 },
    { k: "thick", name: Lg("บาง", "thin"), long: Lg("ความหนารวมของ stack ด้านบน", "total thickness of the top stack"), unit: "µm", low: 1, log: 0 },
    { k: "fab", name: Lg("ผลิตง่าย", "easy to make"), long: Lg("คะแนนความเข้ากับ process s-gDLP เดิม (⚠ ประเมินเอง)", "fit with the existing s-gDLP process (⚠ our own rating)"), unit: "/5", low: 0, log: 0 },
  ];

  // designs whose every layer is made by the s-gDLP process: printed TPU dielectric, printed resin-CNT electrodes, no laminated PI film
  const isPrinted = c => c.diel_mat === "TPU resin (DLP)" && c.elec === "Resin-CNT (print)" && c.pi_um === 0;
  function candidates(mode) {
    const S = SPACE[mode] || SPACE.fast, out = [];
    for (const diel_mat of S.diel_mat) for (const porosity of S.porosity) for (const diel_um of S.diel_um)
      for (const elec of S.elec) for (const pi_um of S.pi_um) for (const gap_um of S.gap_um) out.push({ diel_mat, porosity, diel_um, elec, pi_um, gap_um });
    return out;
  }
  function applyTo(P, c) {
    const Q = Object.assign({}, P, { diel_mat: c.diel_mat, porosity: c.porosity, diel_um: c.diel_um, e1_type: c.elec, e2_type: c.elec, base_um: c.pi_um, gap_um: c.gap_um });
    if (!PH.PIEZO[P.cover_mat]) Q.cover_um = c.pi_um;
    return Q;
  }
  function inv(tab, v, logx) {           // monotonic inverse by interpolation
    if (!tab.length || !isFinite(v)) return NaN;
    const X = tab.map(r => logx ? Math.log(r[0]) : r[0]), x = logx ? Math.log(v) : v;
    if (x <= X[0]) return tab[0][1]; if (x >= X[X.length - 1]) return tab[tab.length - 1][1];
    let k = 1; while (X[k] < x) k++;
    return tab[k - 1][1] + (x - X[k - 1]) / (X[k] - X[k - 1]) * (tab[k][1] - tab[k - 1][1]);
  }
  // noise-limited pressure resolution of the best channel at every sweep point (Pa)
  function resolutionCurve(S, P) {
    const sV = P.adc_noise_lsb * P.Vref / 2 ** P.adc_bits, sC = PH.cNoise(P), pts = S.pts, out = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], dp = b.p - a.p; if (!(dp > 0)) continue;
      const sl = (fa, fb) => Math.abs((fb - fa) / dp);
      const rB = sC / sl(a.CB, b.CB);
      const rA = a.nContact === 0 && b.nContact === 0 ? sC / sl(a.CA, b.CA) : Infinity;
      const rR = a.nContact > 0 && b.nContact > 0 ? sV / sl(PH.readoutA(a.R, P).Vout, PH.readoutA(b.R, P).Vout) : Infinity;
      out.push({ p: Math.sqrt(a.p * b.p), w: Math.log(b.p / a.p), res: Math.min(rA, rB, rR), rA, rB, rR });
    }
    return out;
  }
  function bandMean(curve, lo, hi) {       // geometric mean over a pressure band, weighted by log-pressure width
    let s = 0, w = 0;
    for (const q of curve) if (q.p >= lo && q.p <= hi) { if (!isFinite(q.res) || q.res <= 0) return Infinity; s += Math.log(q.res) * q.w; w += q.w; }
    return w > 0 ? Math.exp(s / w) : Infinity;
  }
  function evaluate(P, opt) {
    opt = opt || {};
    const Q = Object.assign({}, P, { fd_n: opt.fd_n || 15, ca_grid: opt.ca_grid || 40, p_max_kPa: 1500 });   // 1500 kPa = top of the linear range in MEMS 2026
    const M = PH.buildModel(Q), S = PH.sweep(M, { npts: opt.npts || 44 }), pts = S.pts;
    const curve = resolutionCurve(S, Q);
    // usable range
    let range = pts[pts.length - 1].p, why = Lg("ถึงขอบของ sweep", "reached the end of the sweep");
    for (const q of pts) {
      if (q.strain > 0.3) { range = q.p; why = Lg("dome ยุบเกิน 30 %", "dome compressed more than 30 %"); break; }
      if (Q.porosity > 0.11 && q.phiB < 0.11) { range = q.p; why = Lg("รูพรุนของ dielectric ปิด (C_B อิ่มตัว)", "dielectric pores closed (C_B saturates)"); break; }
      if ((Q.c_method === "AD7745" && q.CB > 21e-12) || (Q.c_method === "FDC1004" && q.CB > 115e-12)) { range = q.p; why = Lg("C_B เกินช่วงของชิป ", "C_B beyond the chip range ") + Q.c_method; break; }
    }
    // temperature: +10 K with the calibration taken at the reference temperature
    const pT = 50e3, dT = 10, kD = PH.TEMP_COEF[Q.diel_mat] || 0;
    const st = PH.stateAt(M, pT, { tpu: 1 / (1 + Q.kE_tpu * dT / 100), diel: 1 / (1 + kD * dT / 100), dT });
    const calB = pts.map(q => [q.CB, q.p]).sort((a, b) => a[0] - b[0]);
    const temp = Math.abs(inv(calB, st.CB.C, false) / pT - 1) * 100;
    const Ls = PH.stackLayers(Q), thick = Ls.reduce((s, l) => s + l.t, 0) * 1e6;
    return { dead: S.onset / 1e3, resLow: bandMean(curve, 0.5e3, 10e3) / 1e3, resHigh: bandMean(curve, 10e3, 300e3) / 1e3,
             range: range / 1e3, rangeWhy: why, temp, thick, C0: pts[0].CB * 1e12, te: M.PF.te * 1e6 };
  }
  function fabScore(c) {
    const por = c.porosity > 0 ? (FAB.porous[c.diel_mat] !== undefined ? FAB.porous[c.diel_mat] : FAB.porous.other) : 0;
    return (FAB.diel_mat[c.diel_mat] + por + FAB.elec[c.elec]) / 2;
  }
  // normalised regret of every candidate on every goal: 0 = best in the set, 1 = worst
  function normalise(rows) {
    GOALS.forEach(g => {
      const f = v => g.log ? Math.log(Math.max(v, 1e-12)) : v;
      const vals = rows.map(r => r.m[g.k]).filter(isFinite).map(f);
      const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
      rows.forEach(r => { const v = r.m[g.k]; r.n[g.k] = !isFinite(v) ? 1.2 : g.low ? (f(v) - lo) / span : (hi - f(v)) / span; });
    });
  }
  // best compromise for a set of goals: smallest worst-case regret, ties broken by the average of all goals
  function pick(rows, keys) {
    let best = null, bs = Infinity;
    for (const r of rows) {
      const worst = Math.max(...keys.map(k => r.n[k]));
      const s = worst + 0.02 * keys.reduce((a, k) => a + r.n[k], 0) / keys.length + 0.002 * GOALS.reduce((a, g) => a + r.n[g.k], 0) / GOALS.length;
      if (s < bs) { bs = s; best = r; }
    }
    return best;
  }
  function pickIn(rows, keys) {
    const copy = rows.map(r => ({ id: r.id, c: r.c, m: r.m, n: {} })); normalise(copy); return pick(copy, keys);
  }
  function pareto(rows, kx, ky) {          // candidates not beaten on both goals at once
    return rows.filter(a => !rows.some(b => b !== a && b.n[kx] <= a.n[kx] && b.n[ky] <= a.n[ky] && (b.n[kx] < a.n[kx] || b.n[ky] < a.n[ky])));
  }
  // ---- piezo material as the DIELECTRIC between E1 and E2 (confirmed design): every Table 1 family on the current structure.
  // The electrodes, PI and micro-gap stay as set; only the dielectric is swapped for the solid material at its typical thickness.
  // signal = voltage step for a 10 kPa press; pyro = charge of 1 K divided by the charge of 10 kPa (interference);
  // dead = first-contact pressure with this dielectric in the top plate (stiff or thick layers widen the dead zone);
  // dC100 = change of the E1–E2 capacitance at 100 kPa (solid piezo materials are GPa-stiff, so this is ~0).
  function piezoRank(P) {
    const cov = PH.PIEZO[P.cover_mat] ? { cover_mat: "Polyimide (PI)", cover_um: P.base_um } : {};   // no third piezo layer in this comparison
    return Object.keys(PH.PIEZO).map(k => {
      const z = PH.PIEZO[k]; if (z.d33 == null) return { k, z, sim: false };
      const Q = Object.assign({}, P, cov, { diel_mat: k, diel_um: z.t, porosity: 0, fd_n: 15, ca_grid: 40 }), S = PH.piezoStatic(Q), sw = PH.sweep(PH.buildModel(Q), { npts: 24 });
      const tab = PH.dielectricTable(Q), c0 = PH.capB(0, tab, Q).C, c1 = PH.capB(1e5, tab, Q).C;
      return { k, z, sim: true, Q10: S.QperPa * 1e4, V10: S.QperPa * 1e4 / S.Ctot, Cpz: S.Cpz, fc: S.fc, pyro: z.pyro != null ? S.QperK / (S.QperPa * 1e4) : null, dead: sw.onset / 1e3, dC100: 100 * (c1 - c0) / c0 };
    });
  }
  // recommended = largest voltage signal among the materials that pass the filters (printable by s-gDLP, lead-free)
  function piezoPick(rows, printedOnly) {
    const okr = rows.filter(r => r.sim && !r.z.lead && (!printedOnly || r.z.print)).sort((a, b) => b.V10 - a.V10);
    return okr[0] || null;
  }
  function runSync(P, mode, opt) {
    const rows = candidates(mode).map((c, i) => { const m = evaluate(applyTo(P, c), opt); m.fab = fabScore(c); return { id: i + 1, c, m, n: {} }; });
    normalise(rows); return rows;
  }

  // ------------------------------------------------------------------ page
  let ALL = null, onlyPrinted = true;
  function applyScope() { ROWS = ALL.filter(r => !onlyPrinted || isPrinted(r.c)); if (!ROWS.length) ROWS = ALL.slice(); ROWS.forEach(r => { r.n = {}; }); normalise(ROWS); }
  let ROWS = null, chosen = ["dead", "resLow"], shown = null, running = false, chart = null;
  const $q = s => document.querySelector(s);
  const fmtV = (v, g) => !isFinite(v) ? "—" : g.k === "fab" ? v.toFixed(1) : g.k === "thick" ? v.toFixed(0) : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toPrecision(2);
  const matShort = { "TPU resin (DLP)": Lg("TPU resin (พิมพ์ DLP)", "TPU resin (DLP printed)"), "PDMS Sylgard 184": "PDMS 184", "Dragon Skin 10": "Dragon Skin 10", "Ecoflex 00-30": "Ecoflex 00-30" };
  const elShort = { "Resin-CNT (print)": Lg("resin-CNT พิมพ์ 20 µm", "printed resin-CNT 20 µm"), "Copper (FPC)": Lg("ทองแดง FPC 12 µm", "copper FPC 12 µm"), "Silver ink": "silver ink 8 µm", "Sputtered Cu (thin)": Lg("โลหะ sputter 0.2 µm", "sputtered metal 0.2 µm") };
  const describe = c => `<b>${matShort[c.diel_mat]}</b> ${c.porosity ? Lg("พรุน ", "porous ") + (c.porosity * 100).toFixed(0) + " %" : Lg("ตัน", "solid")}${Lg(" หนา ", " thickness ")}${c.diel_um} µm · electrode ${elShort[c.elec]} ${c.pi_um ? Lg("บน PI ", "on PI ") + c.pi_um + " µm" : Lg("ไม่มีฟิล์ม PI", "no PI film")} · micro-gap ${c.gap_um} µm`;
  const rankOf = (r, k) => 1 + ROWS.filter(o => o.n[k] < r.n[k] - 1e-12).length;
  const goal = k => GOALS.find(g => g.k === k);

  function start(mode) {
    if (running) return; running = true;
    const list = candidates(mode), rows = [], t0 = performance.now(); let i = 0;
    const base = JSON.parse(JSON.stringify(P));
    $q("#opt-prog").style.display = "block";
    (function step() {
      const tEnd = performance.now() + 28;
      while (i < list.length && performance.now() < tEnd) { const c = list[i]; const m = evaluate(applyTo(base, c)); m.fab = fabScore(c); rows.push({ id: i + 1, c, m, n: {} }); i++; }
      $q("#opt-bar").style.width = (100 * i / list.length).toFixed(1) + "%";
      $q("#opt-status").textContent = `${Lg("คำนวณแล้ว ", "computed ")}${i} / ${list.length}${Lg(" แบบ", " designs")}`;
      if (i < list.length) { setTimeout(step, 0); return; }
      ALL = rows; running = false; shown = null; applyScope();
      $q("#opt-status").textContent = `${Lg("เสร็จ: ", "done: ")}${rows.length}${Lg(" แบบ ใน ", " designs in ")}${((performance.now() - t0) / 1000).toFixed(1)}${Lg(" s · ใช้ค่าอื่นทั้งหมดตามแผง parameter ตอนที่กดคำนวณ", " s · all other values follow the parameter panel at the time of the run")}`;
      render();
    })();
  }
  function card(r, keys) {
    const others = GOALS.filter(g => !keys.includes(g.k));
    const line = g => `<tr><td>${g.name}</td><td><b>${fmtV(r.m[g.k], g)}</b> ${g.unit}${Lg("</td><td>อันดับ ", "</td><td>rank ")}${rankOf(r, g.k)} / ${ROWS.length}</td><td class="note">${g.k === "range" ? r.m.rangeWhy : g.long}</td></tr>`;
    const weak = others.slice().sort((a, b) => r.n[b.k] - r.n[a.k])[0];
    return `${Lg("<div class=\"optcard\"><div class=\"k\">แบบ #", "<div class=\"optcard\"><div class=\"k\">Design #")}${r.id}</div><div class="d">${describe(r.c)}${Lg("</div>\n      <table><tr><th>เป้าหมายที่เลือก</th><th>ค่า</th><th>อันดับ</th><th></th></tr>", "</div>\n      <table><tr><th>Chosen goal</th><th>Value</th><th>Rank</th><th></th></tr>")}${keys.map(k => line(goal(k))).join("")}${Lg("\n      <tr><th colspan=\"4\">ด้านอื่นของแบบนี้</th></tr>", "\n      <tr><th colspan=\"4\">Other aspects of this design</th></tr>")}${others.map(line).join("")}${Lg("</table>\n      <p class=\"note\">ข้อแลกเปลี่ยน: ด้านที่เสียมากที่สุดคือ <b>", "</table>\n      <p class=\"note\">Trade-off: the weakest aspect is <b>")}${weak.name}${Lg("</b> (อันดับ ", "</b> (rank ")}${rankOf(r, weak.k)} / ${ROWS.length}${Lg(") · C_B ตอนไม่กด ", ") · C_B unpressed ")}${r.m.C0.toFixed(2)}${Lg(" pF · ความหนาเทียบเท่าของแผ่น ", " pF · plate equivalent thickness ")}${r.m.te.toFixed(1)} µm</p>
      <button class="primary" data-apply="${r.id}${Lg("\">ใช้ค่านี้ในระบบจำลอง</button></div>", "\">Use these values in the simulation</button></div>")}`;
  }
  // the same goals answered twice: every layer made by s-gDLP, and no process restriction
  function compare(keys) {
    const a = pickIn(ALL.filter(r => isPrinted(r.c)), keys), b = pickIn(ALL, keys);
    if (!a || !b) return "";
    const cell = (r, g) => { const other = r === a ? b : a, better = g.low ? r.m[g.k] < other.m[g.k] : r.m[g.k] > other.m[g.k]; return `<td class="${better && r.m[g.k] !== other.m[g.k] ? "hit" : ""}">${fmtV(r.m[g.k], g)} ${g.unit}</td>`; };
    return `${Lg("<div class=\"optcmp\"><h4>เทียบสองแนวทางสำหรับเป้าหมายเดียวกัน</h4><table><tr><th></th><th>ผลิตด้วย s-gDLP ทุกชั้น · #", "<div class=\"optcmp\"><h4>Two routes for the same goal</h4><table><tr><th></th><th>All layers by s-gDLP · #")}${a.id}${Lg("</th><th>ไม่จำกัดกระบวนการ · #", "</th><th>Any process · #")}${b.id}${Lg("</th></tr>\n      <tr><td>แบบ</td><td>", "</th></tr>\n      <tr><td>Design</td><td>")}${describe(a.c)}</td><td>${describe(b.c)}</td></tr>
      ${GOALS.map(g => `<tr><td>${keys.includes(g.k) ? "<b>" + g.name + "</b>" : g.name}</td>${cell(a, g)}${cell(b, g)}</tr>`).join("")}
      <tr><td></td><td><button data-apply="${a.id}${Lg("\">ใช้แบบนี้</button></td><td><button data-apply=\"", "\">Use this design</button></td><td><button data-apply=\"")}${b.id}${Lg("\">ใช้แบบนี้</button></td></tr></table>\n      <p class=\"note\">ช่องที่ระบายสีคือค่าที่ดีกว่าในแถวนั้น · “ไม่จำกัดกระบวนการ” รวม silicone ที่ต้องหล่อ, ฟิล์ม PI และ electrode โลหะ ซึ่งต้องมีขั้นตอนและเครื่องมือนอกเหนือจาก s-gDLP</p></div>", "\">Use this design</button></td></tr></table>\n      <p class=\"note\">Shaded cells are the better value in the row · “Any process” includes cast silicones, PI films and metal electrodes, which need steps and tools beyond s-gDLP</p></div>")}`;
  }
  function render() {
    if (!ROWS) { renderPiezo(); return; }
    // goal chips
    $q("#opt-goals").innerHTML = GOALS.map(g => `<button class="chip ${chosen.includes(g.k) ? "on" : ""}" data-goal="${g.k}" title="${g.long}">${g.name}</button>`).join("");
    const best = pick(ROWS, chosen.length ? chosen : ["dead"]); shown = best;
    $q("#opt-pick").innerHTML = `${Lg("<h4>ถ้าต้องการ ", "<h4>If you want ")}${chosen.map(k => "“" + goal(k).name + "”").join(" + ")} ${chosen.length > 1 ? Lg("พร้อมกัน", "together") : Lg("ดีที่สุด", "at its best")}${Lg(" → แนะนำ", " → recommended")}${onlyPrinted ? Lg(" (ในกลุ่มที่พิมพ์ด้วย s-gDLP ได้ทุกชั้น)", " (among designs printable entirely by s-gDLP)") : ""}</h4>` + card(best, chosen) + compare(chosen);
    // best for each single goal
    $q("#opt-single").innerHTML = `${Lg("<table><tr><th>ถ้าต้องการให้ด้านนี้ดีที่สุด</th><th>แบบที่ควรใช้</th><th>ค่าที่ได้</th>", "<table><tr><th>To make this aspect best</th><th>Design to use</th><th>Value</th>")}${GOALS.map(g => `<th title="${g.long}">${g.name}</th>`).join("")}<th></th></tr>` +
      GOALS.map(g => { const r = pick(ROWS, [g.k]); return `<tr><td><b>${g.name}</b></td><td>#${r.id} ${describe(r.c)}</td><td><b>${fmtV(r.m[g.k], g)}</b> ${g.unit}</td>${GOALS.map(h => `<td class="${h.k === g.k ? "hit" : ""}">${fmtV(r.m[h.k], h)}</td>`).join("")}<td><button data-apply="${r.id}${Lg("\">ใช้</button></td></tr>", "\">Use</button></td></tr>")}`; }).join("") + "</table>";
    // pair matrix
    let h = `<table class="optmx"><tr><th></th>${GOALS.map(g => `<th>${g.name}</th>`).join("")}</tr>`;
    GOALS.forEach((a, i) => { h += `<tr><th>${a.name}</th>`; GOALS.forEach((b, j) => {
      if (j < i) { h += "<td></td>"; return; }
      const r = pick(ROWS, i === j ? [a.k] : [a.k, b.k]);
      h += `<td class="${chosen.length === (i === j ? 1 : 2) && chosen.includes(a.k) && chosen.includes(b.k) ? "hit" : ""}"><a href="#" data-pair="${a.k},${b.k}" title="${describe(r.c).replace(/<[^>]+>/g, "")}">#${r.id}</a><div class="note">${fmtV(r.m[a.k], a)}${i === j ? "" : " · " + fmtV(r.m[b.k], b)}</div></td>`; });
      h += "</tr>"; });
    $q("#opt-matrix").innerHTML = h + "</table>";
    drawScatter(); renderPiezo();
  }
  let pzKey = null;
  // one sentence per material: why it is or is not the choice, from the model numbers plus the material facts
  function piezoReason(r, best, bestP) {
    const z = r.z;
    if (!r.sim) return `${Lg("<b class=\"bad\">ไม่เลือก</b> — คำนวณไม่ได้เพราะไม่มีค่า d33 ที่มีแหล่งอ้างอิง · ", "<b class=\"bad\">Not chosen</b> — cannot be computed: no sourced d33 · ")}${Ld(z, "why")}`;
    const pct = Math.round(100 * r.V10 / best.V10), parts = [];
    if (r === best) return `${Lg("<b class=\"good\">เลือก</b> — แรงดันสูงสุดในกลุ่มที่ไม่มีตะกั่ว · ", "<b class=\"good\">Chosen</b> — highest voltage among lead-free materials · ")}${Ld(z, "why")}`;
    if (z.lead) parts.push(Lg("มีตะกั่ว", "contains lead"));
    if (r.dead > 3 * best.dead) parts.push(`${Lg("แข็งมาก (E ", "very stiff (E ")}${(z.E / 1000).toFixed(0)}${Lg(" GPa) ทำให้ dead-zone ของช่อง R กว้างเป็น ", " GPa), widens the channel R dead zone to ")}${r.dead.toPrecision(2)} kPa`);
    if (pct < 20) parts.push(`${Lg("แรงดันเพียง ", "voltage only ")}${pct < 1 ? "<1" : pct}${Lg(" % ของตัวที่เลือก", " % of the chosen one")}${z.er > 100 ? Lg(" เพราะ εr สูงทำให้ความจุมาก", " because high εr gives a large capacitance") : ""}`);
    else parts.push(`${Lg("แรงดัน ", "voltage ")}${pct}${Lg(" % ของตัวที่เลือก", " % of the chosen one")}`);
    const head = z.lead || r.dead > 3 * best.dead || pct < 20 ? Lg("<b class=\"bad\">ไม่เลือก</b>", "<b class=\"bad\">Not chosen</b>") : Lg("<b>ทางเลือกรอง</b>", "<b>Second choice</b>");
    return `${head} — ${parts.join(" · ")} · ${Ld(z, "why")}`;
  }
  function renderPiezo() {
    // recompute only when the design changed (not on every animation frame or pressure change)
    const key = JSON.stringify(Object.assign({}, P, { p_view_kPa: 0, dT_K: 0 })); if (key === pzKey) return; pzKey = key;
    const rows = piezoRank(P), bestP = piezoPick(rows, true), best = piezoPick(rows, false), eng = (v, u) => typeof fmtSI === "function" ? fmtSI(v, u) : v.toExponential(2) + " " + u;
    const body = rows.slice().sort((a, b) => (b.sim ? b.V10 : -1) - (a.sim ? a.V10 : -1)).map(r => `<tr class="${r === best ? "hit" : ""}"><td><b>${r.k.replace(" (ไม่มีค่าคงที่)", "")}</b><div class="note">Table 1: ${r.z.tang}</div></td><td>${Ld(r.z, "route")}</td>` +
      (r.sim ? `<td>${r.z.d33}</td><td>${r.z.er != null ? r.z.er : "—"}</td><td>${r.z.t}</td><td><b>${eng(r.V10, "V")}</b></td><td>${eng(r.Q10, "C")}</td><td>${r.dC100.toFixed(2)} %</td><td>${isFinite(r.dead) ? r.dead.toPrecision(3) : Lg("ไม่แตะ", "no contact")}</td>` : '<td colspan="7" class="note">—</td>') +
      `<td class="pzwhy">${piezoReason(r, best, bestP)}</td><td>${r.sim ? `<button data-pz="${r.k}${Lg("\">ใช้</button>", "\">Use</button>")}` : ""}</td></tr>`).join("");
    const line = (r, label) => r ? `<li><b>${label}: ${r.k}${Lg("</b> หนา ", "</b> thickness ")}${r.z.t} µm — ${eng(r.V10, "V")} (${eng(r.Q10, "C")}${Lg(") ต่อการกด 10 kPa · dome เริ่มแตะที่ ", ") per 10 kPa press · first dome touches at ")}${r.dead.toPrecision(3)}${Lg(" kPa · C ของคู่ E1–E2 เปลี่ยน ", " kPa · E1–E2 capacitance changes ")}${r.dC100.toFixed(2)}${Lg(" % ที่ 100 kPa</li>", " % at 100 kPa</li>")}` : "";
    $q("#opt-piezo").innerHTML = `<ul class="pzrec">${line(best, Lg("วัสดุที่เลือก", "Chosen material"))}</ul>` +
      `${Lg("<table><tr><th>วัสดุ piezo ที่ใช้เป็น dielectric</th><th>วิธีทำ</th><th>d33 (pC/N)</th><th>εr</th><th>หนา (µm)</th><th>แรงดันที่ 10 kPa</th><th>ประจุที่ 10 kPa</th><th>ΔC ที่ 100 kPa</th><th>dome เริ่มแตะ (kPa)</th><th>เหตุผลที่เลือก / ไม่เลือก</th><th></th></tr>", "<table><tr><th>Piezo material used as dielectric</th><th>How it is made</th><th>d33 (pC/N)</th><th>εr</th><th>thickness (µm)</th><th>voltage at 10 kPa</th><th>charge at 10 kPa</th><th>ΔC at 100 kPa</th><th>first dome touch (kPa)</th><th>why chosen / not chosen</th><th></th></tr>")}${body}${Lg("</table>\n      <p class=\"note\">เกณฑ์เลือก: แรงดันสูงสุดในกลุ่มที่ไม่มีตะกั่ว และไม่ทำให้ dead-zone ของช่อง R กว้างเกิน 3 เท่า · ไม่ได้ใช้กระบวนการผลิตเป็นเกณฑ์ตัดวัสดุ (วิธีทำแสดงไว้เป็นข้อมูล) · คำนวณบนโครงสร้างที่ตั้งอยู่ในแผงซ้าย โดยเปลี่ยนเฉพาะ <b>dielectric ระหว่าง E1 กับ E2</b> เป็นวัสดุนั้น (เนื้อตัน) ที่ความหนาตามคอลัมน์ ไม่มี E3 · ΔC ≈ 0 แปลว่าคู่ E1–E2 ไม่ทำงานเป็น capacitive sensor แต่ให้สัญญาณ piezo (ตอบเฉพาะแรงที่เปลี่ยน) ส่วนแรงคงที่อ่านจากช่อง R · แรงดัน = d33·p·A ÷ (C ของชั้น + C ของสาย ", "</table>\n      <p class=\"note\">Selection rule: highest voltage among lead-free materials that do not widen the channel R dead zone by more than 3× · the manufacturing process is not used to exclude materials (shown for information) · computed on the structure set in the left panel, replacing only the <b>dielectric between E1 and E2</b> with the solid material at the listed thickness, no E3 · ΔC ≈ 0 means the E1–E2 pair does not work as a capacitive sensor but gives a piezo signal (only for changing force), while static force is read from channel R · voltage = d33·p·A ÷ (layer C + cable C ")}${P.pz_Ccable_pF}${Lg(" pF) · ค่า pyroelectric และ ⚠ ของแต่ละวัสดุดูได้เมื่อเลือกวัสดุนั้นในแผงซ้าย</p>", " pF) · each material's pyroelectric value and ⚠ notes show when it is selected in the left panel</p>")}`;
  }
  function drawScatter() {
    if (!ROWS) return;
    const kx = $q("#opt-x").value, ky = $q("#opt-y").value, gx = goal(kx), gy = goal(ky);
    const front = pareto(ROWS, kx, ky), pt = r => [r.m[kx], r.m[ky]];
    if (!chart) chart = new MiniChart($q("#opt-chart"), {});
    Object.assign(chart.opt, { xlog: !!gx.log, ylog: !!gy.log, xlabel: `${gx.name} (${gx.unit}) · ${gx.low ? Lg("ซ้าย", "left") : Lg("ขวา", "right")}${Lg(" = ดี", " = better")}`, ylabel: `${gy.name} (${gy.unit})`, title: `${Lg("จุดม่วง = Pareto front · แกนตั้ง: ", "purple dots = Pareto front · vertical axis: ")}${gy.low ? Lg("ล่าง", "lower") : Lg("บน", "upper")}${Lg(" = ดี", " = better")}` });
    chart.set([
      { name: onlyPrinted ? Lg("แบบที่พิมพ์ด้วย s-gDLP ได้ทั้งหมด", "all designs printable by s-gDLP") : Lg("ทุกแบบ", "all designs"), color: "#8A94A0", marker: 1, size: onlyPrinted ? 3.2 : 2.2, pts: ROWS.map(pt) },
      { name: "Pareto front", color: "#5B4B8A", marker: 1, size: 4, pts: front.map(pt) },
      ...(shown ? [{ name: `${Lg("แบบที่แนะนำ #", "recommended design #")}${shown.id}`, color: "#C8742B", marker: 1, size: 7, pts: [pt(shown)] }] : []),
    ]);
    $q("#opt-front").innerHTML = `${Lg("Pareto front มี ", "Pareto front has ")}${front.length}${Lg(" แบบ: ", " designs: ")}` + front.slice().sort((a, b) => a.n[kx] - b.n[kx]).slice(0, 12).map(r => `<a href="#" data-show="${r.id}" title="${describe(r.c).replace(/<[^>]+>/g, "")}">#${r.id}</a> (${fmtV(r.m[kx], gx)} · ${fmtV(r.m[ky], gy)})`).join(" · ") + (front.length > 12 ? " …" : "");
  }
  function apply(id) {
    const r = ALL.find(x => x.id === +id); if (!r) return;
    P = applyTo(P, r.c); needModel = true; buildControls(); recompute();
    $q("#opt-status").textContent = `${Lg("ใช้แบบ #", "applied design #")}${r.id}${Lg(" แล้ว — ดูผลที่ระบบจำลองด้านบน", " — see the simulation above")}`;
    document.getElementById("stage-card").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function init() {
    const pane = $q("#pane-opt");
    $q("#opt-x").innerHTML = $q("#opt-y").innerHTML = GOALS.map(g => `<option value="${g.k}">${g.name}</option>`).join("");
    $q("#opt-x").value = "dead"; $q("#opt-y").value = "resLow";
    $q("#opt-fast").addEventListener("click", () => start("fast"));
    $q("#opt-full").addEventListener("click", () => start("full"));
    $q("#opt-printed").addEventListener("change", e => { onlyPrinted = e.target.checked; if (ALL) { applyScope(); shown = null; render(); } else renderPiezo(); });
    $q("#opt-x").addEventListener("change", drawScatter); $q("#opt-y").addEventListener("change", drawScatter);
    renderPiezo();
    $q("#opt-fast").textContent += ` (${candidates("fast").length}${Lg(" แบบ)", " designs)")}`; $q("#opt-full").textContent += ` (${candidates("full").length}${Lg(" แบบ)", " designs)")}`;
    pane.addEventListener("click", e => {
      const t = e.target;
      if (t.dataset.goal) { const k = t.dataset.goal; chosen = chosen.includes(k) ? chosen.filter(x => x !== k) : chosen.concat(k).slice(-3); if (!chosen.length) chosen = [k]; render(); }
      else if (t.dataset.pair) { e.preventDefault(); const [a, b] = t.dataset.pair.split(","); chosen = a === b ? [a] : [a, b]; if (a !== b) { $q("#opt-x").value = a; $q("#opt-y").value = b; } render(); $q("#opt-pick").scrollIntoView({ behavior: "smooth", block: "nearest" }); }
      else if (t.dataset.show) { e.preventDefault(); shown = ROWS.find(x => x.id === +t.dataset.show); $q("#opt-pick").innerHTML = `${Lg("<h4>แบบ #", "<h4>Design #")}${shown.id}${Lg(" จาก Pareto front</h4>", " from the Pareto front</h4>")}` + card(shown, [$q("#opt-x").value, $q("#opt-y").value]); drawScatter(); }
      else if (t.dataset.apply) apply(t.dataset.apply);
      else if (t.dataset.pz) { if (PH.PIEZO[P.cover_mat]) { P.cover_mat = "Polyimide (PI)"; P.cover_um = P.base_um; } P.diel_mat = t.dataset.pz; P.diel_um = PH.PIEZO[t.dataset.pz].t; P.porosity = 0; needModel = true; buildControls(); recompute(); pzKey = null; renderPiezo(); $q("#opt-status").textContent = `${Lg("ตั้ง dielectric เป็น ", "dielectric set to ")}${t.dataset.pz}${Lg(" แล้ว", "")}`; }
    });
  }
  return { GOALS, SPACE, isPrinted, piezoRank, piezoPick, piezoReason, candidates, applyTo, evaluate, fabScore, normalise, pick, pareto, runSync, resolutionCurve, init, render };
})();
if (typeof module !== "undefined") module.exports = Optimizer;
