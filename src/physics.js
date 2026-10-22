// ============================================================================
// Hybrid PzR + capacitive tactile taxel — physics core
// Lumped / semi-analytical models. Every constant that is not from a cited
// source is a DEFAULT to be replaced by measurement. Units: SI inside.
// ============================================================================
const EPS0 = 8.854e-12;

// ---------------------------------------------------------------- materials
const MATERIALS = {
  // E in MPa, nu, er (relative permittivity). "src" tells where the number comes from.
  "TPU resin (DLP)":   { E: 8,     nu: 0.45, er: 3.0, src: "ค่าเดา — Zaki ไม่ได้รายงาน modulus ต้องวัดเอง", src_en: "Guess — Zaki did not report the modulus; must be measured" },
  "PDMS Sylgard 184":  { E: 1.5,   nu: 0.49, er: 2.7, src: "ค่าทั่วไป (10:1) — ช่วง 1–3 MPa ขึ้นกับการบ่ม", src_en: "Typical value (10:1) — 1–3 MPa depending on cure" },
  "Ecoflex 00-30":     { E: 0.07,  nu: 0.49, er: 2.8, src: "ค่าทั่วไป (100% modulus ~69 kPa)", src_en: "Typical value (100% modulus ~69 kPa)" },
  "Dragon Skin 10":    { E: 0.15,  nu: 0.49, er: 2.9, src: "ค่าทั่วไป (100% modulus ~151 kPa)", src_en: "Typical value (100% modulus ~151 kPa)" },
  "Polyimide (PI)":    { E: 2500,  nu: 0.34, er: 3.4, src: "Kapton datasheet ~2.5 GPa" },
  "Polyacrylate resin":{ E: 1000,  nu: 0.35, er: 3.5, src: "ค่าเดา — resin แข็ง ต้องวัด", src_en: "Guess — rigid resin, must be measured" },
  "Copper (FPC)":      { E: 110000,nu: 0.34, er: 1,   src: "ค่าตำรา", src_en: "Textbook value" },
  "Gold (Au)":         { E: 79000, nu: 0.44, er: 1,   src: "Wikipedia/WebElements: 78–79 GPa, ν 0.44 (เนื้อทองทั่วไป) · ทองชุบไฟฟ้า 35–44 GPa (MIT 6.777 material database)", src_en: "Wikipedia/WebElements: 78–79 GPa, ν 0.44 (bulk gold) · electroplated gold 35–44 GPa (MIT 6.777 material database)" },
  "Silver ink":        { E: 10000, nu: 0.35, er: 1,   src: "ค่าเดา — ขึ้นกับ ink", src_en: "Guess — depends on the ink" },
};
// Piezoelectric layer options (channel C): every material family of Tang et al. 2025, Table 1, plus the
// photoresin composites that the s-gDLP process could print. d33 in pC/N, pyro in uC/m^2/K (null = no sourced value),
// t = typical layer thickness (um) used by the material ranking, print = made by filler-in-photoresin UV printing.
// Sources: knowledge/research_piezo_materials.md and research_printable_piezo.md. d33 = null means "cannot be simulated".
const PIEZO = {
  "PVDF film (piezo)":            { why: "โค้งงอได้ มีขายเป็นฟิล์มที่ poling แล้วหลายความหนา จึงไม่ต้องอบหรือ poling เอง · ใช้ได้ถึงราว 80 °C และเป็น pyroelectric", tang: "PVDF", d33: 33, er: 12, pyro: 30, Tmax: 80, t: 28, E: 3000, print: false, lead: false, route: "ฟิล์มสำเร็จรูปที่ poling แล้ว นำมาแปะ", src: "MSI/TE Piezo Film Sensors Technical Manual Table 1: d33 −33 pC/N, εr 12–13, 2–4 GPa, pyro 30 µC/m²K", why_en: "Flexible; sold as pre-poled film in several thicknesses, so no annealing or poling of our own · usable to about 80 °C and pyroelectric", route_en: "Pre-poled commercial film, laminated", src_en: "MSI/TE Piezo Film Sensors Technical Manual Table 1: d33 −33 pC/N, εr 12–13, 2–4 GPa, pyro 30 µC/m²K" },
  "P(VDF-TrFE) (piezo)":          { why: "เคลือบเป็นชั้นบางได้เอง (บางกว่าฟิล์ม PVDF จึงทำให้แผ่นแข็งขึ้นน้อย) แต่ต้องอบ 140–145 °C และ poling ถึง 100 V/µm ซึ่งต้องตรวจว่า TPU dome ทนได้", tang: "PVDF-TrFE", d33: 30, er: 7.5, pyro: 40, Tmax: 130, t: 10, E: 4000, print: false, lead: false, route: "spin coat + อบ 140–145 °C + poling ถึง 100 V/µm", src: "Piezotech FC20: d33 −24 ถึง −30, Curie 136 °C · MSI manual: εr 7–8, 3–5 GPa, pyro 40 · ความหนา 10 µm ⚠", why_en: "Can be coated as a thin layer ourselves (thinner than PVDF film, so the plate stiffens less) but needs a 140–145 °C anneal and poling up to 100 V/µm; check that the TPU domes survive", route_en: "Spin coat + anneal 140–145 °C + poling up to 100 V/µm", src_en: "Piezotech FC20: d33 −24 to −30, Curie 136 °C · MSI manual: εr 7–8, 3–5 GPa, pyro 40 · 10 µm thickness ⚠" },
  "Resin + BaTiO3 (print)":       { why: "ไม่มีตะกั่ว พิมพ์ด้วย UV ได้เหมือนชั้น resin-CNT ต้องเคลือบอนุภาคด้วย silane (ถ้าไม่เคลือบ d33 เหลือ 2–3 pC/N) และ poling ราว 110 °C", tang: "BaTiO₃", d33: 27.7, er: 28, pyro: null, Tmax: 120, t: 30, E: 1000, print: true, lead: false, route: "อนุภาค 50 nm เคลือบ silane 30 wt% ใน photoresin + corona poling 110 °C", src: "Liu et al., Research 2022: 27.7 pC/N · ผสมตรง ๆ ได้ 2–3 pC/N (Tiller 2020) · εr ≈ 28 คำนวณจาก d33/g33 ⚠ · modulus ⚠", why_en: "Lead-free and UV-printable like the resin-CNT layer; particles need a silane coating (uncoated: d33 only 2–3 pC/N) and poling at about 110 °C", route_en: "50 nm particles, silane-coated, 30 wt% in photoresin + corona poling 110 °C", src_en: "Liu et al., Research 2022: 27.7 pC/N · plain mixing gives 2–3 pC/N (Tiller 2020) · εr ≈ 28 computed from d33/g33 ⚠ · modulus ⚠" },
  "Resin + PVDF powder (print)":  { why: "พิมพ์ด้วย UV ได้และไม่ต้องเคลือบ silane แต่ d33 ต่ำ (7 pC/N) เพราะผง PVDF ในเนื้อ resin มี β-phase น้อย", tang: "PVDF", d33: 7.34, er: 8.47, pyro: null, Tmax: 80, t: 30, E: 1000, print: true, lead: false, route: "ผง PVDF 35 wt% ใน photoresin + corona poling", src: "Govindarajan et al., Sensors 2024 (อ่านผ่านตัวสรุปหน้าเว็บ) · modulus ⚠", why_en: "UV-printable without silane, but low d33 (7 pC/N) because PVDF powder in resin has little β-phase", route_en: "35 wt% PVDF powder in photoresin + corona poling", src_en: "Govindarajan et al., Sensors 2024 (read via a web summary) · modulus ⚠" },
  "Resin + PZT (print)":          { why: "d33 ของ composite พอ ๆ กับ BaTiO₃ จึงไม่มีเหตุผลให้ยอมรับตะกั่ว", tang: "PZT", d33: 22, er: null, pyro: null, Tmax: 230, t: 30, E: 1000, print: true, lead: true, route: "อนุภาค PZT ใน photoresin 405 nm (มีตะกั่ว)", src: "Wang (405 nm): 22 ± 4 pC/N · εr ไม่มีค่า จึงใช้ค่าของ composite BaTiO₃ (28) ⚠", why_en: "Composite d33 is about the same as BaTiO₃, so there is no reason to accept lead", route_en: "PZT particles in 405 nm photoresin (contains lead)", src_en: "Wang (405 nm): 22 ± 4 pC/N · no εr value, so the BaTiO₃ composite value (28) is used ⚠" },
  "PZT-5H ceramic":               { why: "d33 สูงที่สุดในตาราง แต่เป็นเซรามิกเปราะ ต้องเผา 1000–1300 °C ซึ่ง TPU และ PDMS ทนไม่ได้", tang: "PZT", d33: 650, er: 3800, pyro: null, Tmax: 230, t: 20, E: 56000, print: false, lead: true, route: "เซรามิกเผา 1000–1300 °C (Tang p.4) มีตะกั่ว", src: "piezo.com: 650 pC/N, εr 3800, 50–62 GPa, Curie 230 °C · ความหนา 20 µm ⚠", why_en: "Highest d33 in the table, but a brittle ceramic sintered at 1000–1300 °C, which TPU and PDMS cannot survive", route_en: "Ceramic sintered at 1000–1300 °C (Tang p.4), contains lead", src_en: "piezo.com: 650 pC/N, εr 3800, 50–62 GPa, Curie 230 °C · 20 µm thickness ⚠" },
  "Sm:PMN-PT film":               { why: "d33 สูง แต่ทำด้วย sol–gel บน mica ที่ต้องอบอุณหภูมิสูง และไม่มีค่า εr กับ modulus ให้ตรวจ", tang: "Sm: PMN-PT", d33: 380, er: null, pyro: null, Tmax: null, t: 1, E: 60000, print: false, lead: true, route: "sol–gel บน mica (Tang p.5) มีตะกั่ว", src: "Tang 2025 p.5: d33 380 pm/V · εr และ modulus ไม่มีค่า จึงใช้ของ PZT ⚠", why_en: "High d33, but made by sol–gel on mica with a high-temperature anneal, and no εr or modulus values to check", route_en: "Sol–gel on mica (Tang p.5), contains lead", src_en: "Tang 2025 p.5: d33 380 pm/V · no εr or modulus, PZT values used ⚠" },
  "BaTiO3 ceramic":               { why: "ไม่มีตะกั่ว แต่ในรูปเซรามิกต้องเผาและเปราะ · รูปที่ใช้ได้จริงกับ sensor นิ่มคือผสมใน polymer (ดูแถว Resin + BaTiO₃)", tang: "BaTiO₃", d33: 191, er: 1680, pyro: null, Tmax: 125, t: 20, E: 65000, print: false, lead: false, route: "เซรามิกเผา หรือ hydrothermal บน PDMS (Table 1)", src: "ค่าเนื้อเซรามิก: 191 pC/N, εr 1680, 50–80 GPa, Curie 120–130 °C · ความหนา 20 µm ⚠", why_en: "Lead-free, but as a ceramic it must be sintered and is brittle · the practical form for a soft sensor is a polymer composite (see Resin + BaTiO₃)", route_en: "Sintered ceramic, or hydrothermal on PDMS (Table 1)", src_en: "Bulk ceramic: 191 pC/N, εr 1680, 50–80 GPa, Curie 120–130 °C · 20 µm thickness ⚠" },
  "ZnO film":                     { why: "ทำได้ที่อุณหภูมิต่ำ (hydrothermal) และไม่ต้อง poling แต่ d33 ต่ำ และฟิล์มบางบนยางแตกง่ายเมื่อยุบมาก", tang: "ZnO, ZnO p-n, Al-ZnO", d33: 12.3, er: 11.26, pyro: null, Tmax: null, t: 1, E: 125000, print: false, lead: false, route: "hydrothermal หรือ spin coating (Table 1)", src: "ผลึกเดี่ยว 12.3 pC/N, εr 11.26 · modulus ไม่พบ ใช้ 125 GPa ⚠ · ฟิล์ม 1 µm ⚠", why_en: "Low-temperature process (hydrothermal) and no poling, but low d33, and a thin film on rubber cracks easily under large compression", route_en: "Hydrothermal or spin coating (Table 1)", src_en: "Single crystal 12.3 pC/N, εr 11.26 · modulus not found, 125 GPa used ⚠ · 1 µm film ⚠" },
  "AlN film":                     { why: "ไม่ต้อง poling และทนอุณหภูมิสูง แต่ d33 ต่ำที่สุดในตาราง และต้องใช้เครื่อง sputter", tang: "AlN", d33: 3.5, er: 9.5, pyro: 4.8, Tmax: null, t: 1, E: 330000, print: false, lead: false, route: "sputtering (Table 1)", src: "บน polyimide 3–4 pC/N, εr 9.5, 330 GPa (เนื้อเซรามิก), pyro 4.8 (abstract) · ฟิล์ม 1 µm ⚠", why_en: "No poling and tolerates high temperature, but the lowest d33 in the table and needs a sputter tool", route_en: "Sputtering (Table 1)", src_en: "On polyimide 3–4 pC/N, εr 9.5, 330 GPa (bulk ceramic), pyro 4.8 (abstract) · 1 µm film ⚠" },
  "PVDF/ZnO, MoS2-PVDF (ไม่มีค่าคงที่)": { why: "เป็น PVDF ที่เติม filler เพื่อเพิ่ม β-phase ต้องใช้ electrospinning หรือ milling · Table 1 ให้แต่สมรรถนะของ sensor จึงใส่ค่าใน model ไม่ได้", tang: "PVDF/ZnO, MoS2-PVDF", d33: null, print: false, lead: false, route: "electrospinning / milling (Table 1)", src: "Table 1 ให้แต่สมรรถนะของ sensor ไม่พบ d33 ของวัสดุ", why_en: "PVDF with fillers to raise the β-phase, made by electrospinning or milling · Table 1 gives only sensor performance, so it cannot be put in the model", route_en: "Electrospinning / milling (Table 1)", src_en: "Table 1 gives only sensor performance; no material d33 found" },
  "Hydrogel (ไม่มีค่าคงที่)":      { why: "มีน้ำเป็นองค์ประกอบ ค่าเปลี่ยนตามความชื้นและแห้งได้ ไม่เหมาะกับ sensor ที่ต้องเสถียรระยะยาว", tang: "PAN-PVDF, composite, silk hydrogel", d33: null, print: false, lead: false, route: "hydrogel มีน้ำ (Table 1)", src: "ไม่พบ d33 ที่มีแหล่งอ้างอิง และค่าเปลี่ยนตามความชื้น", why_en: "Contains water, so its properties change with humidity and it can dry out; unsuitable for a sensor that must stay stable", route_en: "Water-containing hydrogel (Table 1)", src_en: "No sourced d33, and properties change with humidity" },
};
Object.keys(PIEZO).forEach(k => { const z = PIEZO[k]; if (z.d33 != null) MATERIALS[k] = { E: z.E, nu: 0.35, er: z.er != null ? z.er : 28, src: z.src, src_en: z.src_en }; });
// TPU: guess (no sourced number). Silicones: +0.3 %/K is the rubber-elasticity estimate E ~ T (1/T at 300 K), not a measurement.
const TEMP_COEF = { "TPU resin (DLP)": -1.0, "PDMS Sylgard 184": 0.3, "Ecoflex 00-30": 0.3, "Dragon Skin 10": 0.3 };
const ELECTRODES = {
  "Copper (FPC)":     { mat: "Copper (FPC)",       t_um: 12, Rs: 0.0015 },  // ohm/sq
  "Silver ink":       { mat: "Silver ink",         t_um: 8,  Rs: 0.05 },
  "Resin-CNT (print)":{ mat: "Polyacrylate resin", t_um: 20, Rs: null },    // computed from wt%
  "Sputtered Cu (thin)":{ mat: "Copper (FPC)",     t_um: 0.2, Rs: 0.1 },
  "Sputtered Au (thin)":{ mat: "Gold (Au)",        t_um: 0.1, Rs: 0.23 },    // 100 nm film (⚠ thickness is our choice; 50 nm Au on 10 nm Cr is a reported flexible stack): >= 0.2214 ohm/sq, rounded up; = bulk 2.214e-8 ohm m / t (Wikipedia, 20 C)     // 200 nm film: >= 0.10 ohm/sq (bulk bound, research_mechanics_materials.md)
};

// ---------------------------------------------------------------- CNT composite
function wtToVol(w, rhoCnt, rhoResin) {           // w = mass fraction (0..1)
  const vc = w / rhoCnt, vr = (1 - w) / rhoResin;
  return vc / (vc + vr);
}
// percolation: sigma = sigma0 (phi - phic)^t  for phi > phic, else matrix floor
function cntConductivity(P) {
  const phi = wtToVol(P.cnt_wt / 100, P.rho_cnt, P.rho_resin);
  const phic = P.phi_c / 100;
  const floor = 1e-10;                              // S/m, insulating resin
  if (phi <= phic) return { sigma: floor, phi };
  return { sigma: Math.max(floor, P.sigma0 * Math.pow(phi - phic, P.t_perc)), phi };
}
// Jacobs working curve: Cd = Dp ln(t / tc). CNT raises absorption (lower Dp)
// and the threshold time. Calibrated to two points of Zaki AFM 2025 Fig. 2G
// (5 wt%: ~20 um at 350 s, ~50 um at 1000 s). Other wt% = extrapolation.
function cntPrinting(P) {
  const w = P.cnt_wt / 100;
  const Dp = 1 / (1 / P.Dp_resin + P.kD * w);       // um
  const tc = P.tc0 * Math.exp(P.beta_tc * w);        // s
  const tNeed = tc * Math.exp(P.cnt_t_um / Dp);      // s for target thickness
  return { Dp, tc, tNeed };
}
function cureDepth(Dp, tc, t) { return t > tc ? Dp * Math.log(t / tc) : 0; }
// grayscale needed to print a dome of height z in one exposure (Zaki: z = Dp ln(t G /(T0 255)))
function grayForHeight(z_um, P) {
  return 255 * P.T0_tpu / P.t_exp_tpu * Math.exp(z_um / P.Dp_tpu);
}

// ---------------------------------------------------------------- geometry
function geometry(P) {
  const a = P.taxel_mm * 1e-3;
  const L = (P.taxel_mm - 2 * P.border_mm) * 1e-3;   // free span of top stack
  const rb = P.dome_d_um * 0.5e-6;
  const pit = P.pitch_um * 1e-6;
  const hs = { c: P.h_center_um * 1e-6, e: P.h_edge_um * 1e-6, k: P.h_corner_um * 1e-6 };
  const domes = [];
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    const type = (i === 0 && j === 0) ? "c" : (i === 0 || j === 0) ? "e" : "k";
    const h = hs[type];
    domes.push({ x: i * pit, y: j * pit, h, type, R: rb * rb / (2 * h) }); // paraboloid tip radius
  }
  const hmax = Math.max(hs.c, hs.e, hs.k);
  const H0 = hmax + P.gap_um * 1e-6;                // E1 underside height above floor at rest
  domes.forEach(d => d.g = H0 - d.h);               // initial gap of each dome tip
  // border frame as a bonded rubber strip in compression: k_b = E (1 + 2 S^2) A_b / H0, S = width / (2 height)
  const bw = P.border_mm * 1e-3, Ab = a * a - L * L, Sb = bw / (2 * H0);
  const kb = P.border_sink === "off" ? Infinity : P.E_tpu_MPa * 1e6 * (1 + 2 * Sb * Sb) * Ab / H0;
  return { a, L, rb, pit, domes, H0, hmax, Ab, kb, cb: P.border_sink === "off" ? 0 : a * a / kb };   // cb = sink per unit pressure if no dome carries load
}

// ---------------------------------------------------------------- top stack
function stackLayers(P) {
  const e1 = ELECTRODES[P.e1_type], e2 = ELECTRODES[P.e2_type];
  const diel = MATERIALS[P.diel_mat];
  const pz = piezoWhere(P) === "cover" ? PIEZO[P.cover_mat] : null;   // piezo as a third layer instead of the cover PI -> needs a top electrode E3 (not when the dielectric itself is piezo)
  const e3 = ELECTRODES[P.e2_type === "Resin-CNT (print)" ? "Resin-CNT (print)" : "Sputtered Cu (thin)"];   // printed designs get a printed top electrode
  const top = pz ? [{ name: "E3", mat: MATERIALS[e3.mat], t: e3.t_um * 1e-6 },
                    { name: "Piezo film", mat: MATERIALS[P.cover_mat], t: P.cover_um * 1e-6 }]
                 : [{ name: "Cover PI", mat: MATERIALS["Polyimide (PI)"], t: (PIEZO[P.cover_mat] ? 0 : P.cover_um) * 1e-6 }];
  return [
    ...top,
    { name: "E2", mat: MATERIALS[e2.mat], t: e2.t_um * 1e-6 },
    { name: "Dielectric", mat: { ...diel, E: diel.E * Math.pow(1 - P.porosity, 2) }, t: P.diel_um * 1e-6 },
    // E1 is the lowest layer (patterned on the underside of its carrier PI) so that it can touch the
    // CNT domes, as resistanceA() and capA() already assume. Order only matters for "composite" bending.
    { name: "Base PI", mat: MATERIALS["Polyimide (PI)"], t: P.base_um * 1e-6 },
    { name: "E1", mat: MATERIALS[e1.mat], t: e1.t_um * 1e-6 },
  ];
}
// bending rigidity: "independent" (lower bound, soft core decouples faces)
// or "composite" (perfect bond, neutral axis)
function bendingRigidity(P) {
  const Ls = stackLayers(P);
  const Ei = l => l.mat.E * 1e6 / (1 - l.mat.nu * l.mat.nu);
  if (P.stack_bond === "composite") {
    let z = 0, sEz = 0, sE = 0;
    Ls.forEach(l => { const zc = z + l.t / 2; sEz += Ei(l) * l.t * zc; sE += Ei(l) * l.t; l.zc = zc; z += l.t; });
    const zn = sEz / sE;
    let D = 0;
    Ls.forEach(l => { D += Ei(l) * (l.t ** 3 / 12 + l.t * (l.zc - zn) ** 2); });
    return D;
  }
  return Ls.reduce((s, l) => s + Ei(l) * l.t ** 3 / 12, 0);
}
// in-plane (membrane) stiffness of the stack, N/m. Every layer stretches with the plate even when
// the layers bend independently, so this is the plain sum.
function membraneStiffness(P) {
  return stackLayers(P).reduce((s, l) => s + l.mat.E * 1e6 / (1 - l.mat.nu * l.mat.nu) * l.t, 0);
}

// ---------------------------------------------------------------- plate FD
// Clamped square plate, D lap^2 w = q, 13-point stencil, ghost w(-1)=w(1).
// Returns unit-pressure field and unit-point-load fields at each dome.
function choleskySolve(Lc, n, b) {
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) { let s = b[i]; const row = i * n; for (let k = 0; k < i; k++) s -= Lc[row + k] * y[k]; y[i] = s / Lc[row + i]; }
  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let k = i + 1; k < n; k++) s -= Lc[k * n + i] * x[k]; x[i] = s / Lc[i * n + i]; }
  return x;
}
function plateFields(P, G) {
  const n = P.fd_n;                  // interior nodes per side
  const N = n * n, h = G.L / (n + 1);
  const A = new Float64Array(N * N);
  const idx = (i, j) => (i - 1) * n + (j - 1);
  const add = (r, i, j, v) => {
    // map (i,j) possibly ghost/boundary to interior with clamped mirror
    if (i === 0 || j === 0 || i === n + 1 || j === n + 1) return;   // boundary: w=0
    if (i === -1) i = 1; if (j === -1) j = 1; if (i === n + 2) i = n; if (j === n + 2) j = n;
    A[r * N + idx(i, j)] += v;
  };
  for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) {
    const r = idx(i, j);
    add(r, i, j, 20);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([di,dj]) => add(r, i+di, j+dj, -8));
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([di,dj]) => add(r, i+di, j+dj, 2));
    [[2,0],[-2,0],[0,2],[0,-2]].forEach(([di,dj]) => add(r, i+di, j+dj, 1));
  }
  // Cholesky in place (A is SPD)
  for (let j = 0; j < N; j++) {
    let s = A[j * N + j];
    for (let k = 0; k < j; k++) s -= A[j * N + k] ** 2;
    const d = Math.sqrt(s); A[j * N + j] = d;
    for (let i = j + 1; i < N; i++) {
      let t = A[i * N + j];
      for (let k = 0; k < j; k++) t -= A[i * N + k] * A[j * N + k];
      A[i * N + j] = t / d;
    }
  }
  const D = bendingRigidity(P), s4 = h ** 4 / D;
  const coord = k => -G.L / 2 + k * h;            // k = 0..n+1
  // bilinear weights of a point on the node grid
  const weights = (x, y) => {
    const fx = (x + G.L / 2) / h, fy = (y + G.L / 2) / h;
    const i0 = Math.floor(fx), j0 = Math.floor(fy), tx = fx - i0, ty = fy - j0;
    return [[i0, j0, (1 - tx) * (1 - ty)], [i0 + 1, j0, tx * (1 - ty)], [i0, j0 + 1, (1 - tx) * ty], [i0 + 1, j0 + 1, tx * ty]];
  };
  const solveQ = q => choleskySolve(A, N, q.map(v => v * s4));
  const qP = new Float64Array(N).fill(1);
  const wP = solveQ(Array.from(qP));
  const wPt = G.domes.map(d => {
    const q = new Array(N).fill(0);
    weights(d.x, d.y).forEach(([i, j, w]) => { if (i >= 1 && j >= 1 && i <= n && j <= n) q[idx(i, j)] += w / (h * h); });
    return solveQ(q);
  });
  const at = (field, x, y) => {
    let s = 0;
    weights(x, y).forEach(([i, j, w]) => { if (i >= 1 && j >= 1 && i <= n && j <= n) s += w * field[idx(i, j)]; });
    return s;
  };
  const wp = G.domes.map(d => at(wP, d.x, d.y));
  const Gm = G.domes.map(d => wPt.map(f => at(f, d.x, d.y)));
  // --- data for the large-deflection (membrane stiffening) correction
  const mean = f => { let s = 0; for (let k = 0; k < N; k++) s += f[k]; return s * h * h / (G.L * G.L); };
  const mP = mean(wP), mPt = wPt.map(mean), r0 = mP / at(wP, 0, 0);   // r0 = mean / centre of the uniform-load shape
  const Amem = membraneStiffness(P), te = Math.sqrt(12 * D / Amem);    // equivalent thickness: A / D = 12 / te^2
  return { n, h, D, wP, wPt, wp, Gm, at, coord, mP, mPt, r0, Amem, te };
}

// ---------------------------------------------------------------- domes
function hertz(delta, Es, R) { return delta > 0 ? (4 / 3) * Es * Math.sqrt(R) * Math.pow(delta, 1.5) : 0; }
function dHertz(delta, Es, R) { return delta > 0 ? 2 * Es * Math.sqrt(R) * Math.sqrt(delta) : 0; }
function solve9(J, b) {               // small dense Gaussian elimination
  const n = b.length, M = J.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
  return x;
}
// Contact problem at pressure p (Pa). Es = effective modulus of dome contact.
function solveDomes(p, G, PF, Es, warm, kappa) {
  const m = G.domes.length, kp = kappa || 1, ib = G.kb && isFinite(G.kb) ? 1 / G.kb : 0;
  // The border carries the load the domes do not: sink = (p a^2 - sum F) / k_b. It moves the whole stack down
  // rigidly, so it adds a^2 / k_b to every pressure compliance and 1 / k_b to every dome-to-dome compliance.
  if (kp !== 1 || ib) PF = { wp: PF.wp.map(v => v / kp + G.a * G.a * ib), Gm: PF.Gm.map(r => r.map(v => v / kp + ib)) };
  let d = warm ? warm.slice() : G.domes.map((dm, j) => p * PF.wp[j] - dm.g);
  for (let it = 0; it < 80; it++) {
    const f = d.map((x, j) => hertz(x, Es, G.domes[j].R));
    const fp = d.map((x, j) => dHertz(x, Es, G.domes[j].R));
    const F = d.map((x, j) => x - (p * PF.wp[j] - G.domes[j].g - PF.Gm[j].reduce((s, gk, k) => s + gk * f[k], 0)));
    const err = Math.max(...F.map(Math.abs));
    if (err < 1e-12) break;
    const J = PF.Gm.map((row, j) => row.map((g, k) => (j === k ? 1 : 0) + g * fp[k]));
    let step = solve9(J, F.map(v => -v));
    // keep it stable: limit step size and avoid oscillation around delta=0
    const smax = 20e-6;
    const sc = Math.min(1, smax / Math.max(1e-30, ...step.map(Math.abs)));
    d = d.map((x, j) => x + sc * step[j]);
  }
  const force = d.map((x, j) => hertz(x, Es, G.domes[j].R));
  const a = d.map((x, j) => x > 0 ? Math.sqrt(G.domes[j].R * x) : 0);
  const sink = ib ? Math.max(0, (p * G.a * G.a - force.reduce((s, f) => s + f, 0)) * ib) : 0;
  return { delta: d, force, a, nContact: d.filter(x => x > 0).length, kappa: kp, sink };
}
// Contact solve with the large-deflection correction. Linear plate theory holds only while the
// deflection is small against the thickness; beyond that the plate also stretches. We use the classic
// one-term form  w_linear = w (1 + beta (w / te)^2)  as a secant stiffening factor
// kappa = 1 + beta (w_eq / te)^2 on every plate compliance, where w_eq is the mean deflection
// expressed as an equivalent centre deflection, and solve kappa by bisection (the residual is monotonic).
function solveContact(p, G, PF, Es, warm, P) {
  const beta = P && P.large_defl !== "off" ? P.beta_ld : 0;
  if (!(beta > 0) || !(p > 0)) return solveDomes(p, G, PF, Es, warm, 1);
  const weq = sol => Math.abs(p * PF.mP - sol.force.reduce((s, F, k) => s + F * PF.mPt[k], 0)) / (PF.r0 * sol.kappa);
  const kOf = w => 1 + beta * (w / PF.te) ** 2;
  let lo = 1, hi = kOf(p * PF.mP / PF.r0), sol = solveDomes(p, G, PF, Es, warm, 1);
  if (hi - 1 < 1e-9) return sol;
  let w0 = warm;
  for (let it = 0; it < 40 && hi - lo > 1e-6 * hi; it++) {
    const mid = 0.5 * (lo + hi); sol = solveDomes(p, G, PF, Es, w0, mid); w0 = sol.delta;
    if (kOf(weq(sol)) > mid) lo = mid; else hi = mid;
  }
  return solveDomes(p, G, PF, Es, w0, 0.5 * (lo + hi));
}

// deflection at any point
function deflectionAt(x, y, p, PF, sol) {
  let w = p * PF.at(PF.wP, x, y);
  sol.force.forEach((F, k) => { if (F > 0) w -= F * PF.at(PF.wPt[k], x, y); });
  return w / (sol.kappa || 1);
}

// ---------------------------------------------------------------- channel A
function domeSurface(x, y, G) {
  let z = 0;
  for (const d of G.domes) {
    const r2 = (x - d.x) ** 2 + (y - d.y) ** 2;
    if (r2 < G.rb * G.rb) z = Math.max(z, d.h * (1 - r2 / (G.rb * G.rb)));
  }
  return z;
}
// gap capacitance between E1 and the CNT-coated dome layer (before contact
// this is all channel A sees). Parallel-plate integration, no fringing.
function capA(p, G, PF, sol, P) {
  const m = P.ca_grid, L = G.L, dA = (L / m) ** 2, gmin = 0.5e-6;
  // Same integral as before; the unit deflection fields and the dome surface at the grid points are
  // cached on PF (they only depend on the model), so each call is a plain weighted sum.
  let c = PF._ca;
  if (!c || c.m !== m) {
    const n = m * m; c = PF._ca = { m, Wp: new Float64Array(n), Wk: G.domes.map(() => new Float64Array(n)), ds: new Float64Array(n) };
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
      const x = -L / 2 + (i + 0.5) * L / m, y = -L / 2 + (j + 0.5) * L / m, q = i * m + j;
      c.Wp[q] = PF.at(PF.wP, x, y); c.ds[q] = domeSurface(x, y, G);
      for (let k = 0; k < c.Wk.length; k++) c.Wk[k][q] = PF.at(PF.wPt[k], x, y);
    }
  }
  const n = m * m, F = sol.force, kp = sol.kappa || 1, sink = sol.sink || 0; let s = 0;
  for (let q = 0; q < n; q++) {
    let w = p * c.Wp[q];
    for (let k = 0; k < F.length; k++) if (F[k] > 0) w -= F[k] * c.Wk[k][q];
    s += dA / Math.max(gmin, G.H0 - sink - w / kp - c.ds[q]);
  }
  return EPS0 * s;
}
function resistanceA(sol, G, P, rho) {
  const tf = P.cnt_t_um * 1e-6;
  let gsum = 0; const parts = sol.a.map(() => null);
  // real (conducting) area: asperities -> A_real = F/H, capped by Hertz area (Greenwood-Williamson-like)
  const perDome = sol.a.map((a, j) => {
    if (a <= 0 || sol.force[j] <= 0) return Infinity;
    const Ar = Math.min(Math.PI * a * a, sol.force[j] / (P.H_asp_MPa * 1e6));
    const ar = Math.sqrt(Ar / Math.PI);
    let Rc, Rpath;
    if (P.r_model === "legacy") {           // first version: half-space constriction + constant path estimate
      Rc = rho / (4 * ar) + P.rho_t / Ar;
      Rpath = rho * (G.domes[j].h + G.rb) / (Math.PI * G.rb * tf);
    } else {
      // thin-film model (derivations in the briefing, section 17):
      //  interface   rho_t / A_r                 conductance proportional to load (multi-asperity contact)
      //  disc        Rs / (8 pi)                 current injected uniformly over the contact disc into a sheet
      //  meridian    Rs / (2 pi) [Fm(rb) - Fm(a)]  radial sheet flow down the paraboloid from r = a to r = rb
      const Rs = rho / tf, k = 2 * G.domes[j].h / (G.rb * G.rb);
      const Fm = r => { const s = Math.sqrt(1 + k * k * r * r); return s - Math.log((1 + s) / (k * r)); };
      Rc = P.rho_t / Ar + Rs / (8 * Math.PI);
      Rpath = Rs / (2 * Math.PI) * (Fm(G.rb) - Fm(Math.min(a, 0.999 * G.rb)));
    }
    const R = Rc + Rpath; gsum += 1 / R; parts[j] = { Rc, Rpath }; return R;
  });
  const Rpad = (rho / tf) * P.film_sq;
  // E1 as a resistive sheet (printed resin-CNT electrode): current injected at dome j raises the sheet potential at
  // dome k by (Rs1 / 2 pi) ln(re / d_jk) (ring collector at radius re = L/2), and at itself by
  // Rs1 / (8 pi) + (Rs1 / 2 pi) ln(re / a_j). All contacting domes sit at the same terminal voltage: solve M I = 1.
  const e1 = ELECTRODES[P.e1_type], Rs1 = P.r_model === "legacy" ? 0 : (e1.Rs != null ? e1.Rs : rho / (e1.t_um * 1e-6));
  let Rnet = gsum > 0 ? 1 / gsum : Infinity, Re1 = 0;
  const on = perDome.map((r, j) => isFinite(r) ? j : -1).filter(j => j >= 0);
  if (on.length && Rs1 > 1) {
    const re = G.L / 2, k2 = Rs1 / (2 * Math.PI);
    const Mx = on.map(j => on.map(k => j === k ? perDome[j] + Rs1 / (8 * Math.PI) + k2 * Math.log(re / Math.min(sol.a[j], 0.9 * re))
      : k2 * Math.max(0, Math.log(re / Math.hypot(G.domes[j].x - G.domes[k].x, G.domes[j].y - G.domes[k].y)))));
    const I = solve9(Mx, on.map(() => 1)), It = I.reduce((s, v) => s + v, 0);
    Re1 = 1 / It - Rnet; Rnet = 1 / It;
  }
  const Ron = gsum > 0 ? Rnet + Rpad : Infinity;
  const R = 1 / ((isFinite(Ron) ? 1 / Ron : 0) + 1 / P.R_leak);
  return { R, Ron, perDome, Rpad, parts, Re1 };   // parts = per-dome breakdown for display only; Re1 = extra resistance from the E1 sheet
}

// ---------------------------------------------------------------- channel B
// dielectric between E1 and E2 under uniform pressure: solid (shape-factor
// bulge constraint) blending into porous (Gibson–Ashby, pores collapse).
function dielectricTable(P, creepFactor = 1) {
  const mat = MATERIALS[P.diel_mat];
  const Em = mat.E * 1e6 / creepFactor;
  const t0 = P.diel_um * 1e-6, phi0 = P.porosity, side = P.taxel_mm * 1e-3 * Math.sqrt(P.elec_frac);
  const rows = [{ t: t0, s: 0, phi: phi0 }];
  let t = t0, s = 0;
  const pmax = P.p_max_kPa * 1e3 * 1.5;
  for (let k = 0; k < 20000 && s < pmax && t > 0.02 * t0; k++) {
    const phi = Math.max(0, 1 - (1 - phi0) * t0 / t);
    const S = side / (4 * t);
    const bulge = 1 + 2 * S * S * Math.max(0, 1 - phi / 0.1);
    const Eeff = Em * Math.pow(1 - phi, 2) * bulge;
    const dt = t * 1e-3;
    s += Eeff * dt / t; t -= dt;
    rows.push({ t, s, phi: Math.max(0, 1 - (1 - phi0) * t0 / t) });
  }
  return { rows, er: mat.er, side };
}
function capB(p, tab, P, dT = 0) {
  const r = tab.rows;
  let k = 1; while (k < r.length - 1 && r[k].s < p) k++;
  const f = r[k].s === r[k - 1].s ? 0 : (p - r[k - 1].s) / (r[k].s - r[k - 1].s);
  const t = r[k - 1].t + f * (r[k].t - r[k - 1].t);
  const phi = Math.max(0, 1 - (1 - P.porosity) * (P.diel_um * 1e-6) / t);
  const er = Math.pow(tab.er, 1 - phi) * (1 + P.TCC / 100 * dT);   // Lichtenecker mixing
  const A = tab.side * tab.side;
  return { C: EPS0 * er * A / t + P.C_par_pF * 1e-12, t, phi, er };
}

// ---------------------------------------------------------------- full sweep
function buildModel(P) {
  const G = geometry(P);
  const PF = plateFields(P, G);
  return { P, G, PF };
}
function effectiveDomeModulus(P, creepFactor = 1) {
  const m = MATERIALS["TPU resin (DLP)"];
  const E = P.E_tpu_MPa * 1e6 / creepFactor;
  return E / (1 - P.nu_tpu * P.nu_tpu);
}
function sweep(model, opts = {}) {
  const { P, G, PF } = model;
  const npts = opts.npts || 90;
  const pmin = 0.02e3, pmax = P.p_max_kPa * 1e3;
  const { sigma } = cntConductivity(P); const rho = 1 / sigma;
  const Es = effectiveDomeModulus(P);
  const tab = dielectricTable(P);
  const out = [];
  let warm = null, firstContact = null;
  let onset0 = Math.min(...G.domes.map((d, j) => d.g / (PF.wp[j] + G.cb)));     // linear-plate estimate (plate + border sink)
  if (P.large_defl !== "off" && P.beta_ld > 0 && isFinite(onset0)) {
    // with stiffening the first contact comes later: bracket it upward from the linear estimate, then bisect
    const hit = q => solveContact(q, G, PF, Es, null, P).nContact > 0;
    let lo = onset0 * 0.999, hi = onset0;
    while (hi < 50 * pmax && !hit(hi)) { lo = hi; hi *= 1.6; }
    if (hit(hi)) { for (let i = 0; i < 40; i++) { const mid = 0.5 * (lo + hi); if (hit(mid)) hi = mid; else lo = mid; } onset0 = hi; }
    else onset0 = Infinity;
  }
  const plist = [];
  for (let k = 0; k < npts; k++) plist.push(pmin * Math.pow(pmax / pmin, k / (npts - 1)));
  // refine just after first contact, where R falls over decades in a narrow band
  if (isFinite(onset0)) for (let k = 1; k <= 12; k++) { const p = onset0 * (1 + 0.3 * Math.pow(10, -4 + k * 0.3)); if (p < pmax) plist.push(p); }
  plist.sort((x, y) => x - y);
  for (const p of plist) {
    const sol = solveContact(p, G, PF, Es, warm, P); warm = sol.delta;
    const RA = resistanceA(sol, G, P, rho);
    const CA = capA(p, G, PF, sol, P) + P.C_par_pF * 1e-12;
    const CB = capB(p, tab, P);
    if (firstContact === null && sol.nContact > 0) firstContact = p;
    const Gd = G.domes; const strain = Math.max(...sol.delta.map((x, j) => x / Gd[j].h));
    out.push({ p, sol, R: RA.R, Ron: RA.Ron, CA, CB: CB.C, tB: CB.t, phiB: CB.phi,
               wc: deflectionAt(0, 0, p, PF, sol), nContact: sol.nContact, strain, kappa: sol.kappa });
  }
  const onset = onset0;
  return { pts: out, rho, sigma, firstContact, onset, Es, tab };
}
// single state at pressure p (for diagram / readout)
function stateAt(model, p, creep = { tpu: 1, diel: 1 }, warm) {
  const { P, G, PF } = model;
  const { sigma } = cntConductivity(P); const rho = 1 / sigma;
  const sol = solveContact(p, G, PF, effectiveDomeModulus(P, creep.tpu), warm, P);
  const RA = resistanceA(sol, G, P, rho);
  const CA = capA(p, G, PF, sol, P) + P.C_par_pF * 1e-12;
  const tab = dielectricTable(P, creep.diel);
  const CB = capB(p, tab, P, creep.dT || 0);
  return { p, sol, RA, CA, CB, rho };
}

// ---------------------------------------------------------------- readout
function readoutA(R, P) {
  const Vout = P.Vb * P.R_ref / (P.R_ref + R);
  const counts = Vout / P.Vref * (2 ** P.adc_bits);
  return { Vout, counts, I: P.Vb / R };
}
function cNoise(P) {                 // 1-sigma capacitance noise of the chosen C front-end (F)
  const chip = P.c_method === "AD7745" ? P.cdc_noise_aF * 1e-18
    : P.c_method === "FDC1004" ? 0.5e-15                                               // datasheet resolution 0.5 fF

    : P.c_method === "Charge-time" ? 1 / (P.mcu_clk_MHz * 1e6 * P.R_charge_k * 1e3)   // 1 count
    : P.lockin_noise_fF * 1e-15;
  return Math.hypot(chip, (P.c_env_fF || 0) * 1e-15);   // plus the noise floor of the real system (cables, environment)
}
function cTimePerTaxel(P, C) {       // seconds per capacitance reading
  if (P.c_method === "AD7745") return 1 / P.cdc_rate_Hz;
  if (P.c_method === "FDC1004") return 1 / 100;                                        // 100 S/s (noise is specified at this rate)
  if (P.c_method === "Charge-time") return 5 * P.R_charge_k * 1e3 * C + 20e-6;
  return P.lockin_periods / (P.f_exc_kHz * 1e3);
}
function cRangeOK(P, C) {
  const en = typeof LANG !== "undefined" && LANG === "en";
  if (P.c_method === "AD7745") return C <= 21e-12 ? (en ? "in range (CAPDAC ≤17 pF + ±4 pF)" : "อยู่ในช่วง (CAPDAC ≤17 pF + ±4 pF)") : (en ? "out of AD7745 range (>21 pF)" : "เกินช่วง AD7745 (>21 pF)");
  if (P.c_method === "FDC1004") return C <= 115e-12 ? (en ? "in range (offset ≤100 pF + ±15 pF)" : "อยู่ในช่วง (offset ≤100 pF + ±15 pF)") : (en ? "out of FDC1004 range (>115 pF)" : "เกินช่วง FDC1004 (>115 pF)");
  return "—";
}
function impedanceA(R, C, f) {
  const w = 2 * Math.PI * f;
  // Z = R / (1 + j w R C)
  const den = 1 + (w * R * C) ** 2;
  return { re: R / den, im: -w * R * R * C / den };
}

// ---------------------------------------------------------------- time domain
// hold at constant pressure: SLS creep on TPU and dielectric (common-mode),
// log-time electrical drift of CNT network (R only), temperature ramp.
function timeSim(model, swp, T) {
  const { P } = model;
  const dt = T.dt_s, N = Math.round(T.hold_min * 60 / dt) + 1, p = T.p_kPa * 1e3;
  const calR = swp.pts.filter(q => isFinite(q.R) && q.nContact > 0).map(q => [q.R, q.p]);
  const calC = swp.pts.map(q => [q.CB, q.p]);
  const inv = (tab, v, logx) => {      // monotonic inverse by interpolation
    const s = tab.slice().sort((a, b) => a[0] - b[0]);
    const X = s.map(r => logx ? Math.log(r[0]) : r[0]), Y = s.map(r => r[1]);
    const x = logx ? Math.log(v) : v;
    if (x <= X[0]) return Y[0]; if (x >= X[X.length - 1]) return Y[Y.length - 1];
    let k = 1; while (X[k] < x) k++;
    return Y[k - 1] + (x - X[k - 1]) / (X[k] - X[k - 1]) * (Y[k] - Y[k - 1]);
  };
  const res = []; let warm = null, y = null, prevFR = null;
  const a = T.tau_f / (T.tau_f + dt);
  for (let k = 0; k < N; k++) {
    const t = k * dt;
    const cT = 1 + P.creep_tpu / 100 * (1 - Math.exp(-t / (P.tau_tpu_min * 60)));
    const cD = 1 + P.creep_diel / 100 * (1 - Math.exp(-t / (P.tau_diel_min * 60)));
    const dTemp = T.dT * Math.min(1, t / Math.max(1, T.hold_min * 60));
    const st = stateAt(model, p, { tpu: cT, diel: cD }, warm); warm = st.sol.delta;
    let R = st.RA.R * (1 + P.drift_pct / 100 * Math.log10(1 + t / 60)) * (1 + P.TCR / 100 * dTemp);
    const tab = dielectricTable(P, cD);
    const C = capB(p, tab, P, dTemp).C;
    const FR = inv(calR, R, true), FC = inv(calC, C, false);
    y = y === null ? FC : a * (y + (FR - prevFR)) + (1 - a) * FC;   // complementary filter
    prevFR = FR;
    res.push({ t, R, C, FR, FC, FF: y, ptrue: p });
  }
  return res;
}

// ---------------------------------------------------------------- channel C (piezo film)
// Where the piezoelectric material sits. "diel": it IS the dielectric between E1 and E2 (the design confirmed with the
// professor: two added electrodes only). "cover": the earlier alternative, a third layer on top that needs its own electrode E3.
function piezoWhere(P) {
  const has = k => PIEZO[k] && PIEZO[k].d33 != null;
  return has(P.diel_mat) ? "diel" : has(P.cover_mat) ? "cover" : null;
}
// The piezo layer lies in the load path and sees the applied pressure (d33 mode): Q = d33 p A.
// It is a charge source on its own capacitance C_pz plus cable C, leaking through the
// amplifier input resistance R_in, so it answers only to CHANGES of force (and of temperature: pyroelectric).
// As a porous dielectric its capacitance uses the same Lichtenecker mixing as capB(); d33 is kept at the solid value (not sourced for porous forms).
function piezoStatic(P) {
  const where = piezoWhere(P); if (!where) return null;
  const key = where === "diel" ? P.diel_mat : P.cover_mat, pz = PIEZO[key];
  const A = (P.taxel_mm * 1e-3) ** 2 * P.elec_frac, t = (where === "diel" ? P.diel_um : P.cover_um) * 1e-6;
  let er = pz.er != null ? pz.er : MATERIALS[key].er;
  if (where === "diel") er = Math.pow(er, 1 - P.porosity);
  const Cpz = EPS0 * er * A / t, Ctot = Cpz + P.pz_Ccable_pF * 1e-12;
  return { pz, key, where, pair: where === "diel" ? "E1–E2" : "E2–E3", A, Cpz, Ctot, tau: P.pz_Rin_MOhm * 1e6 * Ctot, fc: 1 / (2 * Math.PI * P.pz_Rin_MOhm * 1e6 * Ctot),
           QperPa: pz.d33 * 1e-12 * A, QperK: (pz.pyro || 0) * 1e-6 * A };
}
function piezoStep(S, V, dp, dTemp, dt) {     // one time step of the voltage across R_in || C_tot
  return (V + (S.QperPa * dp + S.QperK * dTemp) / S.Ctot) * Math.exp(-dt / S.tau);
}
// same, but exact when the pressure (and temperature) change linearly during dt: settles to V = R_in dQ/dt
function piezoRamp(S, V, dp, dTemp, dt) {
  const e = Math.exp(-dt / S.tau);
  return V * e + (S.QperPa * dp + S.QperK * dTemp) / S.Ctot * (S.tau / dt) * (1 - e);
}

const Physics = { EPS0, PIEZO, TEMP_COEF, membraneStiffness, solveContact, piezoWhere, piezoStatic, piezoStep, piezoRamp, MATERIALS, ELECTRODES, wtToVol, cntConductivity, cntPrinting, cureDepth, grayForHeight,
  geometry, stackLayers, bendingRigidity, plateFields, solveDomes, deflectionAt, domeSurface, capA, resistanceA,
  dielectricTable, capB, buildModel, sweep, stateAt, effectiveDomeModulus, readoutA, cNoise, cTimePerTaxel, cRangeOK,
  impedanceA, timeSim, hertz };
if (typeof module !== "undefined") module.exports = Physics;
