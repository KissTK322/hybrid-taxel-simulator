// Independent checks of the equations used by the simulator. Run: node verify.js
// Each check compares the code against a published value, an exact formula, or a separate numerical integration.
const Ph = require('./physics.js'), D = require('./defaults.js');
const out = []; const add = (id, what, got, ref, unit, note) => { const err = ref ? (got / ref - 1) * 100 : null; out.push({ id, what, got, ref, unit, err, note }); };
const M = Ph.buildModel({ ...D, large_defl: 'off', border_sink: 'off' }), PF = M.PF, G = M.G;
// 1 plate, uniform load (Timoshenko & Woinowsky-Krieger, clamped square plate: 0.00126 q L^4 / D)
for (const n of [17, 25, 33]) { const m = Ph.buildModel({ ...D, fd_n: n }); add('plate-uniform-' + n, `แผ่นยึดขอบ แรงกระจาย, กริด ${n}×${n}`, m.PF.at(m.PF.wP, 0, 0) * m.PF.D / m.G.L ** 4, 0.00126, 'qL⁴/D'); }
// 2 plate, central point load (Timoshenko: 0.0056 P L^2 / D)
add('plate-point', 'แผ่นยึดขอบ แรงจุดกลาง', PF.at(PF.wPt[4], 0, 0) * PF.D / G.L ** 2, 0.0056, 'PL²/D');
// 3 large deflection: w_lin = w (1 + beta (w/t)^2) against Levy's exact series solution (NACA Report 740, Table 5, nu = 0.316)
{ const load = [17.79, 38.3, 63.4, 95.0, 134.9, 184.0, 245.0, 318.0, 402.0], wt = [0.237, 0.471, 0.695, 0.912, 1.121, 1.323, 1.521, 1.714, 1.902];
  const k1 = 1 / (12 * (1 - 0.316 ** 2) * 0.00126); let worst = 0; const rows = [];
  wt.forEach((w, i) => { const pred = k1 * w * (1 + D.beta_ld * w * w), e = (pred / load[i] - 1) * 100; worst = Math.max(worst, Math.abs(e)); rows.push([w, load[i], +pred.toFixed(1), +e.toFixed(1)]); });
  out.push({ id: 'large-defl', what: 'large deflection เทียบตาราง Levy (9 จุด, w/t 0.24–1.90)', got: worst, ref: null, unit: '% คลาดสูงสุด', rows }); }
// 4 Hertz: code vs direct formula, and the identity mean pressure = (4 E* / 3 pi) (a / R)
{ const Es = Ph.effectiveDomeModulus(D), R = G.domes[4].R, d = 5e-6, F = Ph.hertz(d, Es, R), a = Math.sqrt(R * d);
  add('hertz-F', 'Hertz: F ที่ δ = 5 µm', F, 4 / 3 * Es * Math.sqrt(R) * d ** 1.5, 'N'); add('hertz-p', 'Hertz: แรงดันเฉลี่ย F/πa²', F / (Math.PI * a * a), 4 * Es / (3 * Math.PI) * a / R, 'Pa'); }
// 5 C_B = parallel plate with Lichtenecker permittivity
{ const tab = Ph.dielectricTable(D), c = Ph.capB(0, tab, D), er = Math.pow(2.7, 1 - D.porosity);
  add('capB', 'C_B ตอนไม่กด', c.C, 8.854e-12 * er * (D.taxel_mm * 1e-3) ** 2 / (D.diel_um * 1e-6) + D.C_par_pF * 1e-12, 'F'); }
// 6 C_A: grid convergence of the gap integral, and a flat-plate limit (domes 1 um tall -> eps0 L^2 / H0)
{ const s0 = Ph.solveDomes(0, G, PF, 1, null), c90 = Ph.capA(0, G, PF, s0, { ...D, ca_grid: 90 }); delete PF._ca; const c200 = Ph.capA(0, G, PF, s0, { ...D, ca_grid: 200 }); delete PF._ca;
  add('capA-grid', 'C_A: กริด 90 เทียบ 200', c90, c200, 'F');
  const Pf = { ...D, h_center_um: 1, h_edge_um: 1, h_corner_um: 1, gap_um: 100, border_sink: 'off' }, Mf = Ph.buildModel(Pf); const sf = Ph.solveDomes(0, Mf.G, Mf.PF, 1, null);
  add('capA-flat', 'C_A: ขีดจำกัดแผ่นเรียบ (dome สูง 1 µm)', Ph.capA(0, Mf.G, Mf.PF, sf, Pf), 8.854e-12 * Mf.G.L ** 2 / Mf.G.H0, 'F', 'ต่างเล็กน้อยเพราะ dome 1 µm ยังกินพื้นที่'); }
// 7 film path on a dome: the code's constant estimate vs the exact thin-film integral along the paraboloid meridian
{ const rho = 1 / Ph.cntConductivity(D).sigma, t = D.cnt_t_um * 1e-6, d = G.domes[4], rb = G.rb, k = 2 * d.h / (rb * rb);
  const Fm = r => { const s = Math.sqrt(1 + k * k * r * r); return s - Math.log((1 + s) / (k * r)); };
  const exact = a => rho / (2 * Math.PI * t) * (Fm(rb) - Fm(a)), code = rho * (d.h + rb) / (Math.PI * rb * t);
  // numerical quadrature as a second opinion on the closed form
  const quad = a => { let s = 0; const n = 20000; for (let i = 0; i < n; i++) { const r = a + (rb - a) * (i + 0.5) / n; s += Math.sqrt(1 + k * k * r * r) / r * (rb - a) / n; } return rho / (2 * Math.PI * t) * s; };
  add('path-closed-form', 'R_path: สูตรปิดเทียบ integrate เชิงตัวเลข (a = 23 µm)', exact(23e-6), quad(23e-6), 'Ω');
  out.push({ id: 'path-vs-code', what: 'R_path ของ model (ค่าคงที่) เทียบ integral ตามผิว dome', unit: 'kΩ', rows: [10, 23, 50, 80, 150].map(a => [a, +(code / 1e3).toFixed(1), +(exact(a * 1e-6) / 1e3).toFixed(1), +((code / exact(a * 1e-6) - 1) * 100).toFixed(0)]) }); }
// 8 R || C: |Z| at the corner frequency = R / sqrt(2), phase -45 deg
{ const R = 1.4e5, C = 1.5e-12, f = 1 / (2 * Math.PI * R * C), Z = Ph.impedanceA(R, C, f); add('rc-corner', '|Z| ที่ f = 1/(2πRC)', Math.hypot(Z.re, Z.im), R / Math.SQRT2, 'Ω'); }
// 9 piezo: exponential decay and steady ramp
{ const P = { ...D, cover_mat: 'PVDF film (piezo)', cover_um: 28 }, Z = Ph.piezoStatic(P); let V = Ph.piezoStep(Z, 0, 1e4, 0, 1e-9); const V0 = V; for (let i = 0; i < 300; i++) V = Ph.piezoRamp(Z, V, 0, 0, Z.tau / 100);
  add('piezo-decay', 'piezo: V หลัง 3τ', V / V0, Math.exp(-3), ''); add('piezo-Q', 'piezo: Q ที่ 10 kPa', Z.QperPa * 1e4, 33e-12 * 1e4 * (4.05e-3) ** 2, 'C'); }
// 10 dielectric: small-strain stiffness = E (1 - phi)^2 (Gibson-Ashby), solid limit = E (1 + 2 S^2)
{ const tab = Ph.dielectricTable(D), r = tab.rows, Eeff = (r[1].s - r[0].s) / ((r[0].t - r[1].t) / r[0].t); add('gibson', 'dielectric พรุน: modulus เริ่มต้น', Eeff, 1.5e6 * (1 - D.porosity) ** 2, 'Pa');
  const Ps = { ...D, porosity: 0 }, ts = Ph.dielectricTable(Ps).rows, S = D.taxel_mm * 1e-3 / (4 * D.diel_um * 1e-6); add('gent', 'dielectric ตัน: modulus เริ่มต้น', (ts[1].s - ts[0].s) / ((ts[0].t - ts[1].t) / ts[0].t), 1.5e6 * (1 + 2 * S * S), 'Pa'); }
// 11 CNT percolation fit vs points read from AFM 2025 Fig. 2I (S/cm)
out.push({ id: 'cnt', what: 'σ ของ CNT: model เทียบจุดที่อ่านจาก AFM 2025 Fig. 2I', unit: 'S/cm', rows: [[1, 5e-5], [3, 3.5e-3], [5, 4e-3], [7, 5e-2], [10, 2e-2]].map(([w, ref]) => { const s = Ph.cntConductivity({ ...D, cnt_wt: w }).sigma / 100; return [w, ref, +s.toExponential(2), +(s / ref).toFixed(2)]; }) });
// 12 current after contact vs the linear law reported in MEMS 2026 (dI/I0 = 296.5 P, I0 = 1 nA at 5 V): old and new R model
{ const thin = { e1_type: 'Sputtered Cu (thin)', e2_type: 'Sputtered Cu (thin)', base_um: 12.5, cover_um: 12.5 }, pr = { e1_type: 'Resin-CNT (print)', e2_type: 'Resin-CNT (print)', base_um: 0, cover_um: 0, diel_mat: 'TPU resin (DLP)', porosity: 0.5 };
  const Mo = Ph.buildModel({ ...D, ...thin, r_model: 'legacy', rho_t: 1e-5, film_sq: 0.16, border_sink: 'off' }), Mn = Ph.buildModel({ ...D, ...thin }), Mp = Ph.buildModel({ ...D, ...pr });
  out.push({ id: 'IP', what: 'กระแสหลังแตะที่ 5 V เทียบกฎเส้นตรงของ MEMS 2026', unit: 'A', rows: [5, 10, 20, 50, 100, 200, 500, 1000, 1500].map(p => { const ref = 1e-9 * (1 + 296.5 * p), f = M => 5 / Ph.stateAt(M, p * 1e3).RA.R;
    return [p, ref.toExponential(2), (f(Mo) / ref).toFixed(2), (f(Mn) / ref).toFixed(2), (f(Mp) / ref).toFixed(2), Ph.stateAt(Mp, p * 1e3).sol.nContact]; }) }); }
// 13 multi-asperity contact (Greenwood-Williamson, exponential heights): real area / load does not depend on the separation
{ const sig = 1, beta = 50, Es = 1, N = 1, I = (m, d) => { let s = 0; const n = 200000, zmax = d + 40 * sig; for (let i = 0; i < n; i++) { const z = d + (zmax - d) * (i + 0.5) / n; s += Math.pow(z - d, m) * Math.exp(-z / sig) / sig * (zmax - d) / n; } return s; };
  const ratio = d => (Math.PI * beta * N * I(1, d)) / (4 / 3 * Es * Math.sqrt(beta) * N * I(1.5, d));
  out.push({ id: 'gw', what: 'A_real / F ที่ระยะห่างต่างกัน (ควรคงที่ = √π·√(β/σ)/E*)', unit: '', rows: [0, 1, 2, 4].map(d => [d, ratio(d).toFixed(4), (Math.sqrt(Math.PI) * Math.sqrt(beta / sig) / Es).toFixed(4)]) }); }
require('fs').mkdirSync(__dirname + '/doc_assets', { recursive: true });
require('fs').writeFileSync(__dirname + '/doc_assets/verify.json', JSON.stringify(out));
for (const o of out) { if (o.rows) { console.log(o.id.padEnd(16), o.what, o.got != null ? o.got.toFixed(2) + ' ' + o.unit : ''); o.rows.forEach(r => console.log('   ', r.join('  '))); } else console.log(o.id.padEnd(16), o.what.padEnd(48), Number(o.got).toPrecision(5), 'ref', Number(o.ref).toPrecision(5), (o.err >= 0 ? '+' : '') + o.err.toFixed(2) + ' %'); }
