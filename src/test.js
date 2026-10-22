// Node checks for the physics core. Run: node test.js   (exits non-zero on failure)
const Ph = require('./physics.js'); const D = require('./defaults.js');
let fails = 0;
const ok = (name, cond, info) => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + info : '')); if (!cond) fails++; };
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-300);

// ---- 1) linear model (large_defl off) must reproduce the values recorded before the correction was added
{ const P = { ...D, large_defl: 'off', r_model: 'legacy', rho_t: 1e-5, film_sq: 0.16, border_sink: 'off' }; let t0 = Date.now(); const M = Ph.buildModel(P);
  const wc = M.PF.at(M.PF.wP, 0, 0) * M.PF.D / M.G.L ** 4;
  ok('FD plate: w_centre = 0.00126 qL^4/D', Math.abs(wc - 0.00126) < 4e-5, wc.toFixed(5));
  const c = Ph.cntConductivity(P); ok('CNT 5 wt% ~ 4e-3 S/cm (AFM 2025 Fig. 2I)', near(c.sigma / 100, 4.01e-3, 0.01), (c.sigma / 100).toExponential(2));
  const S = Ph.sweep(M); ok('linear onset 17.69 kPa (regression)', near(S.onset, 17693.65, 1e-4), (S.onset / 1e3).toFixed(3));
  const s = Ph.stateAt(M, 100e3);
  ok('linear state @100 kPa (regression)', near(s.RA.R, 1.36e5, 0.01) && near(s.CA, 2.029e-12, 0.002) && near(s.CB.C, 4.328e-12, 0.002) && s.sol.kappa === 1,
     `R ${s.RA.R.toExponential(3)} CA ${(s.CA * 1e12).toFixed(3)} CB ${(s.CB.C * 1e12).toFixed(3)}`);
  ok('grayscale 650 um -> G = 219', Math.round(Ph.grayForHeight(650, P)) === 219);
  const T = Ph.timeSim(M, S, { dt_s: 10, hold_min: 30, p_kPa: 50, dT: 0, tau_f: 120 });
  ok('time sim runs and starts on the true pressure', near(T[0].FC, 50e3, 0.01), `FC0 ${(T[0].FC / 1e3).toFixed(2)} kPa`);
  console.log('     build+sweep+time ms', Date.now() - t0);
}
// ---- 2) large-deflection correction
{ const P = { ...D }; const M = Ph.buildModel(P), PF = M.PF, Es = Ph.effectiveDomeModulus(P);
  ok('equivalent thickness te = sqrt(12 D / A)', near(PF.te, Math.sqrt(12 * PF.D / Ph.membraneStiffness(P)), 1e-12), (PF.te * 1e6).toFixed(2) + ' um');
  const tiny = Ph.solveContact(1, M.G, PF, Es, null, P); ok('kappa -> 1 at tiny pressure', Math.abs(tiny.kappa - 1) < 1e-6);
  // before contact the corrected centre deflection must satisfy  w (1 + beta (w/te)^2) = w_linear
  const p = 20e3, sol = Ph.solveContact(p, M.G, PF, Es, null, P), w = Ph.deflectionAt(0, 0, p, PF, sol), wl = p * PF.at(PF.wP, 0, 0);
  ok('no contact: w (1 + beta (w/te)^2) = w_linear', sol.nContact === 0 && near(w * (1 + P.beta_ld * (w / PF.te) ** 2), wl, 1e-4), `w ${(w * 1e6).toFixed(2)} um, linear ${(wl * 1e6).toFixed(2)} um`);
  const S = Ph.sweep(M); const just = q => Ph.solveContact(q, M.G, PF, Es, null, P).nContact;
  ok('onset is the first-contact pressure', isFinite(S.onset) && just(S.onset * 0.999) === 0 && just(S.onset * 1.001) > 0, (S.onset / 1e3).toFixed(2) + ' kPa');
  const Soff = Ph.sweep(Ph.buildModel({ ...D, large_defl: 'off' })); ok('stiffening delays contact', S.onset > Soff.onset);
  const thin = Ph.sweep(Ph.buildModel({ ...D, e1_type: 'Sputtered Cu (thin)', e2_type: 'Sputtered Cu (thin)' }));
  ok('thin metal electrodes shrink the dead zone', thin.onset < S.onset, `${(thin.onset / 1e3).toFixed(2)} vs ${(S.onset / 1e3).toFixed(2)} kPa`);
  ok('R and C stay monotonic after contact', S.pts.every((q, i) => i === 0 || q.CB >= S.pts[i - 1].CB - 1e-18));
}
// ---- 2b) thin-film resistance model (derivations: briefing section 17)
{ const P = { ...D, e1_type: 'Sputtered Cu (thin)', e2_type: 'Sputtered Cu (thin)', base_um: 12.5, cover_um: 12.5 }, M = Ph.buildModel(P), G = M.G;
  const rho = 1 / Ph.cntConductivity(P).sigma, Rs = rho / (P.cnt_t_um * 1e-6), s = Ph.stateAt(M, 50e3), j = 4, a = s.sol.a[j], d = G.domes[j];
  // meridian term against straight numerical quadrature of Rs/(2 pi) * sqrt(1 + z'^2) / r
  let q = 0; const n = 40000, k = 2 * d.h / (G.rb * G.rb); for (let i = 0; i < n; i++) { const r = a + (G.rb - a) * (i + 0.5) / n; q += Math.sqrt(1 + k * k * r * r) / r * (G.rb - a) / n; }
  ok('film path = Rs/(2 pi) * integral along the dome', near(s.RA.parts[j].Rpath, Rs / (2 * Math.PI) * q, 1e-6), (s.RA.parts[j].Rpath / 1e3).toFixed(2) + ' kOhm');
  // disc term: power of a uniform injection over a disc, P = integral Rs K^2 dA with K = I r / (2 pi a^2)
  let pw = 0; for (let i = 0; i < n; i++) { const r = a * (i + 0.5) / n, K = r / (2 * Math.PI * a * a); pw += Rs * K * K * 2 * Math.PI * r * a / n; }
  ok('disc term = Rs / (8 pi)', near(pw, Rs / (8 * Math.PI), 1e-6));
  const Ar = Math.min(Math.PI * a * a, s.sol.force[j] / (P.H_asp_MPa * 1e6));
  ok('contact = rho_t / A_r + Rs / (8 pi)', near(s.RA.parts[j].Rc, P.rho_t / Ar + Rs / (8 * Math.PI), 1e-12));
  const S = Ph.sweep(M); let mono = true; for (let i = 1; i < S.pts.length; i++) if (S.pts[i].R > S.pts[i - 1].R * (1 + 1e-9)) mono = false;
  ok('R never rises with pressure (parallel domes, induction argument)', mono);
  const paper = p => 1e-9 * (1 + 296.5 * p), r = [5, 10, 20, 50, 100].map(p => 5 / Ph.stateAt(M, p * 1e3).RA.R / paper(p));
  ok('current within x3 of MEMS 2026 over 5-100 kPa (fitted rho_t, film_sq)', r.every(x => x > 1 / 3 && x < 3), r.map(x => x.toFixed(2)).join(' '));
}
// ---- 2c) border compression and the E1 sheet network (briefing sections 17.8, 17.9)
{ const P = { ...D, e1_type: 'Resin-CNT (print)', e2_type: 'Resin-CNT (print)', base_um: 0, cover_um: 0, diel_mat: 'TPU resin (DLP)', porosity: 0.5 }, M = Ph.buildModel(P), G = M.G;
  const Sb = P.border_mm * 1e-3 / (2 * G.H0);
  ok('border stiffness k_b = E (1 + 2 S^2) A_b / H0', near(G.kb, P.E_tpu_MPa * 1e6 * (1 + 2 * Sb * Sb) * (G.a ** 2 - G.L ** 2) / G.H0, 1e-12), (G.kb / 1e6).toFixed(4) + ' N/um');
  const s = Ph.stateAt(M, 800e3), Fd = s.sol.force.reduce((a, b) => a + b, 0);
  ok('force balance: p a^2 = sum F_dome + k_b sink', near(800e3 * G.a ** 2, Fd + G.kb * s.sol.sink, 1e-9), `sink ${(s.sol.sink * 1e6).toFixed(1)} um, domes carry ${(Fd / (800e3 * G.a ** 2) * 100).toFixed(1)} %`);
  const Moff = Ph.buildModel({ ...P, border_sink: 'off' }), s0 = Ph.stateAt(Moff, 800e3);
  ok('border sink brings more domes into contact', s.sol.nContact > s0.sol.nContact && s0.sol.sink === 0, `${s0.sol.nContact} -> ${s.sol.nContact} domes at 800 kPa`);
  // E1 network: with one dome in contact it reduces to the closed form; a metal E1 changes nothing
  const s1 = Ph.stateAt(M, 20e3), j = 4, rho = 1 / Ph.cntConductivity(P).sigma, Rs1 = rho / 20e-6, re = G.L / 2;
  ok('E1 sheet, single dome: Rs/(8 pi) + Rs/(2 pi) ln(re/a)', s1.sol.nContact === 1 && near(s1.RA.Re1, Rs1 / (8 * Math.PI) + Rs1 / (2 * Math.PI) * Math.log(re / s1.sol.a[j]), 1e-9), (s1.RA.Re1 / 1e3).toFixed(1) + ' kOhm');
  const sm = Ph.stateAt(Ph.buildModel({ ...P, e1_type: 'Copper (FPC)' }), 20e3); ok('metal E1 adds no sheet resistance', sm.RA.Re1 === 0);
  ok('several domes: E1 network resistance is positive and below the single-dome value', s.RA.Re1 > 0 && s.RA.Re1 < s1.RA.Re1 * 1.5, (s.RA.Re1 / 1e3).toFixed(1) + ' kOhm with ' + s.sol.nContact + ' domes');
}
// ---- 3) piezo channel
{ const P = { ...D, cover_mat: 'PVDF film (piezo)' }; const Z = Ph.piezoStatic(P), pz = Ph.PIEZO[P.cover_mat];
  const A = (P.taxel_mm * 1e-3) ** 2 * P.elec_frac;
  ok('piezo: Q = d33 p A', near(Z.QperPa * 10e3, pz.d33 * 1e-12 * 10e3 * A, 1e-12), (Z.QperPa * 10e3 * 1e12).toFixed(2) + ' pC at 10 kPa');
  let V = Ph.piezoStep(Z, 0, 10e3, 0, 1e-6); const V0 = V; for (let k = 0; k < 1000; k++) V = Ph.piezoStep(Z, V, 0, 0, Z.tau / 200);
  ok('piezo: step response decays with tau = R C', near(V / V0, Math.exp(-5), 1e-6), `tau ${(Z.tau * 1e3).toFixed(2)} ms, fc ${Z.fc.toFixed(1)} Hz`);
  const r1 = Ph.piezoRamp(Z, 0, 1e3, 0, Z.tau * 1e-4), s1 = Ph.piezoStep(Z, 0, 1e3, 0, Z.tau * 1e-4);
  ok('piezo: ramp form = step form for dt << tau', near(r1, s1, 1e-3));
  let Vr = 0; for (let k = 0; k < 400; k++) Vr = Ph.piezoRamp(Z, Vr, 100, 0, Z.tau / 20);      // constant dp/dt
  ok('piezo: steady ramp gives V = R_in dQ/dt', near(Vr, P.pz_Rin_MOhm * 1e6 * Z.QperPa * 100 / (Z.tau / 20), 1e-6), (Vr * 1e3).toFixed(3) + ' mV');
  ok('piezo film adds E3 + film to the stack', Ph.stackLayers(P).map(l => l.name).join() === 'E3,Piezo film,E2,Dielectric,Base PI,E1');
  const Pp = { ...D, e1_type: 'Resin-CNT (print)', e2_type: 'Resin-CNT (print)', base_um: 0, cover_mat: 'Resin + BaTiO3 (print)', cover_um: 30 }, Zp = Ph.piezoStatic(Pp);
  ok('printed BaTiO3 composite: Q = d33 p A with d33 = 27.7 pC/N', near(Zp.QperPa, 27.7e-12 * A, 1e-12) && near(Ph.stackLayers(Pp)[0].t, 20e-6, 1e-9), (Zp.QperPa * 1e4 * 1e12).toFixed(2) + ' pC at 10 kPa, E3 printed 20 um');
  ok('no piezo without a piezo cover', Ph.piezoStatic(D) === null);
}
// ---- 3a) confirmed design: the Table 1 piezo material IS the dielectric between E1 and E2 (no E3)
{ const P = { ...D, diel_mat: 'PVDF film (piezo)', diel_um: 28, porosity: 0 }, Z = Ph.piezoStatic(P), A = (P.taxel_mm * 1e-3) ** 2 * P.elec_frac;
  ok('piezo dielectric: no E3, signal taken between E1 and E2', Ph.piezoWhere(P) === 'diel' && Z.pair === 'E1–E2' && Ph.stackLayers(P).map(l => l.name).join() === 'Cover PI,E2,Dielectric,Base PI,E1');
  ok('piezo dielectric: Q = d33 p A and C_pz = eps0 er A / t', near(Z.QperPa, 33e-12 * A, 1e-12) && near(Z.Cpz, Ph.EPS0 * 12 * A / 28e-6, 1e-12), `Q ${(Z.QperPa * 1e16).toFixed(2)} pC at 10 kPa, C_pz ${(Z.Cpz * 1e12).toFixed(1)} pF`);
  const tab = Ph.dielectricTable(P), c0 = Ph.capB(0, tab, P).C, c1 = Ph.capB(100e3, tab, P).C;
  const Pt = { ...D, diel_mat: 'TPU resin (DLP)', porosity: 0.5 }, tt = Ph.dielectricTable(Pt), dT = Ph.capB(100e3, tt, Pt).C / Ph.capB(0, tt, Pt).C - 1;
  ok('solid piezo dielectric does not work as a capacitive sensor (dC < 0.01 % at 100 kPa; porous TPU > 1 %)', (c1 - c0) / c0 < 1e-4 && dT > 0.01, `PVDF ${(100 * (c1 - c0) / c0).toExponential(1)} % vs porous TPU ${(100 * dT).toFixed(2)} %`);
  const on = q => Ph.sweep(Ph.buildModel({ ...D, e1_type: 'Sputtered Cu (thin)', e2_type: 'Sputtered Cu (thin)', base_um: 12.5, cover_um: 12.5, porosity: 0, ...q }), { npts: 12 }).onset;
  const o9 = on({ diel_mat: 'PVDF film (piezo)', diel_um: 9 }), o28 = on({ diel_mat: 'PVDF film (piezo)', diel_um: 28 });
  ok('a thicker piezo dielectric stiffens the top plate: first contact comes later', o28 > o9, `9 um: ${(o9 / 1e3).toFixed(2)} kPa, 28 um: ${(o28 / 1e3).toFixed(2)} kPa`);
  ok('dielectric piezo takes precedence over a piezo cover (one piezo layer only)', Ph.piezoWhere({ ...P, cover_mat: 'PVDF film (piezo)' }) === 'diel' && Ph.stackLayers({ ...P, cover_mat: 'PVDF film (piezo)' })[0].name === 'Cover PI');
}
// ---- 3c) thin gold electrode: present, metallic (no sheet network), and as thin as the thin-copper option mechanically
{ const E = Ph.ELECTRODES['Sputtered Au (thin)'], q = { ...D, base_um: 12.5, cover_um: 12.5 };
  const on = t => Ph.sweep(Ph.buildModel({ ...q, e1_type: t, e2_type: t }), { npts: 12 }).onset, au = on('Sputtered Au (thin)'), cu = on('Sputtered Cu (thin)'), fpc = on('Copper (FPC)');
  ok('gold electrode: 100 nm Au, E 79 GPa, Rs >= bulk bound 2.214e-8/1e-7', E && near(E.t_um, 0.1, 1e-9) && Ph.MATERIALS[E.mat].E === 79000 && E.Rs >= 2.214e-8 / 1e-7 * 0.999, `Rs ${E.Rs} ohm/sq`);
  ok('gold electrode behaves like thin metal, far below copper FPC', au <= cu * 1.001 && au < fpc / 5, `onset Au ${(au / 1e3).toFixed(2)} kPa, thin Cu ${(cu / 1e3).toFixed(2)} kPa, Cu FPC ${(fpc / 1e3).toFixed(2)} kPa`);
}
// ---- 3b) every Table 1 family is present; those with constants can be simulated and ranked
{ const O = require('./optimizer.js'), keys = Object.keys(Ph.PIEZO), sim = keys.filter(k => Ph.PIEZO[k].d33 != null);
  const fam = ['ZnO', 'BaTiO', 'AlN', 'PZT', 'PMN-PT', 'PVDF', 'PVDF-TrFE', 'MoS2-PVDF', 'PVDF/ZnO', 'hydrogel'];
  ok('all Tang Table 1 material families are listed', fam.every(f => keys.some(k => (Ph.PIEZO[k].tang + ' ' + k).toLowerCase().includes(f.toLowerCase()))), keys.length + ' entries, ' + sim.length + ' with constants');
  const Pp = { ...D, e1_type: 'Resin-CNT (print)', e2_type: 'Resin-CNT (print)', base_um: 0, diel_mat: 'TPU resin (DLP)', porosity: 0.5 }, rows = O.piezoRank(Pp);
  ok('ranking covers every entry and computes V = Q / C_total', rows.length === keys.length && rows.filter(r => r.sim).every(r => r.V10 > 0 && isFinite(r.dead) && Math.abs(r.dC100) < 0.05));
  const bp = O.piezoPick(rows, true), ba = O.piezoPick(rows, false);
  ok('recommended piezo: printable + lead-free when the s-gDLP filter is on', bp && bp.z.print && !bp.z.lead && ba && !ba.z.lead, `printed: ${bp.k} (${(bp.V10 * 1e3).toFixed(1)} mV) | any: ${ba.k} (${(ba.V10 * 1e3).toFixed(1)} mV)`);
}
// ---- 4) temperature hook: warmer TPU (softer) and dielectric change the state but not the calibration
{ const M = Ph.buildModel(D); const a = Ph.stateAt(M, 150e3), b = Ph.stateAt(M, 150e3, { tpu: 1.1, diel: 1.1, dT: 10 });
  ok('softer materials -> larger C_B', b.CB.C > a.CB.C, `${(a.CB.C * 1e12).toFixed(3)} -> ${(b.CB.C * 1e12).toFixed(3)} pF`);
}
console.log(fails ? `\n${fails} FAILED` : '\nall passed'); process.exit(fails ? 1 : 0);
