// ============================================================================
// UI for the hybrid taxel simulator
// ============================================================================
const PH = Physics;
let P = JSON.parse(JSON.stringify(DEFAULTS));
try { const s = sessionStorage.getItem("taxel_P"); if (s) { Object.assign(P, JSON.parse(s)); sessionStorage.removeItem("taxel_P"); } } catch (e) {}   // carried over a language switch (i18n.js)
let MODEL = null, SWEEP = null, MEAS = null, TIME = null;
const COL = { pzr: "#C8742B", cap: "#0F7C7A", hyb: "#5B4B8A", ink: "#1B2430", red: "#B23A3A", grey: "#8A94A0", blue: "#2F6FB0" };

// ------------------------------------------------------------- parameter spec
// [key, label, unit, min, max, step, log?, source note]
const SPEC = [
  [Lg("โครงสร้าง dome (s-gDLP แบบ Zaki)", "Dome structure (s-gDLP, Zaki design)"), [
    ["taxel_mm", Lg("ขนาด taxel", "Taxel size"), "mm", 2, 8, 0.05, 0, "Zaki & Chen MEMS 2026 Fig. 2b: a = 4050 µm"],
    ["border_mm", Lg("ความกว้าง border", "Border width"), "mm", 0.2, 1.5, 0.05, 0, "MEMS 2026 Fig. 2b: b = 650 µm"],
    ["dome_d_um", Lg("เส้นผ่านศูนย์กลาง dome", "Dome diameter"), "µm", 300, 1200, 10, 0, "MEMS 2026 Fig. 2b: d = 750 µm · AFM 2025 p.6"],
    ["pitch_um", Lg("ระยะ dome ถึง dome (กลางถึงกลาง)", "Dome pitch (centre to centre)"), "µm", 400, 1500, 10, 0, "d + e = 750 + 150 µm (MEMS 2026 Fig. 2b)"],
    ["h_center_um", Lg("ความสูง dome กลาง", "Centre dome height"), "µm", 100, 900, 5, 0, "AFM 2025 Fig. 2F: 650 / 550 / 400 µm · MEMS 2026 Fig. 2b: f = 650 µm"],
    ["h_edge_um", Lg("ความสูง dome ขอบ (4 ลูก)", "Edge dome height (4 domes)"), "µm", 100, 900, 5, 0, Lg("MEMS 2026 Fig. 2b: g = 550 µm · ตำแหน่งของแต่ละระดับใน 3×3 ต้องยืนยัน", "MEMS 2026 Fig. 2b: g = 550 µm · position of each height level in the 3×3 needs confirming")],
    ["h_corner_um", Lg("ความสูง dome มุม (4 ลูก)", "Corner dome height (4 domes)"), "µm", 100, 900, 5, 0, Lg("AFM 2025 Fig. 2F: 400 µm · MEMS 2026 ไม่ได้ระบุระดับที่สาม — ต้องยืนยัน", "AFM 2025 Fig. 2F: 400 µm · MEMS 2026 does not state the third level — needs confirming")],
    ["gap_um", Lg("micro-gap เหนือ dome ที่สูงที่สุด", "Micro-gap above the tallest dome"), "µm", 5, 200, 1, 0, Lg("MEMS 2026 Fig. 2b: border 680 − dome 650 = 30 µm · (60 µm ใน AFM 2025 Fig. 3B คือ gap ระหว่าง dome สองชั้น)", "MEMS 2026 Fig. 2b: border 680 − dome 650 = 30 µm · (the 60 µm in AFM 2025 Fig. 3B is the gap between two dome layers)")],
    ["pdms_um", Lg("PDMS substrate (วาดรูปเท่านั้น)", "PDMS substrate (drawing only)"), "µm", 50, 1000, 10, 0, "AFM 2025 p.6, p.14: 400 µm"],
    ["tpu_floor_um", Lg("พื้น TPU ใต้ dome (วาดรูปเท่านั้น)", "TPU floor under the domes (drawing only)"), "µm", 30, 500, 10, 0, Lg("⚠ ไม่มีใน paper — ต้องวัดจาก SEM", "⚠ not in the papers — measure from SEM")],
  ]],
  [Lg("วัสดุ dome + resin-CNT (วงจร A)", "Dome material + resin-CNT (circuit A)"), [
    ["E_tpu_MPa", Lg("Young's modulus ของ TPU resin", "Young's modulus of TPU resin"), "MPa", 0.5, 60, 0.1, 1, Lg("⚠ ค่าเดา — Zaki ไม่ได้รายงาน ต้องวัด", "⚠ guess — not reported by Zaki, must be measured")],
    ["nu_tpu", "Poisson ratio TPU", "", 0.3, 0.495, 0.005, 0, Lg("⚠ ไม่มีใน paper — ยางทั่วไป 0.45–0.49", "⚠ not in the papers — typical rubber 0.45–0.49")],
    ["cnt_wt", Lg("ปริมาณ MWCNT", "MWCNT content"), "wt%", 0, 10, 0.1, 0, Lg("AFM 2025 p.6: เลือก 5 wt% (สมดุล conductivity กับ viscosity)", "AFM 2025 p.6: 5 wt% chosen (balance of conductivity and viscosity)")],
    ["cnt_t_um", Lg("ความหนาชั้น resin-CNT", "Resin-CNT layer thickness"), "µm", 5, 60, 1, 0, Lg("AFM 2025 p.5–6, Fig. 2F(ii): ~20 µm ที่ ≥ 350 s", "AFM 2025 p.5–6, Fig. 2F(ii): ~20 µm at ≥ 350 s")],
    ["phi_c", "percolation threshold", "vol%", 0.05, 2, 0.05, 0, Lg("AFM 2025 Fig. 2I: threshold อยู่ระหว่าง 0.5–1 wt% (≈0.3–0.6 vol% ถ้า density ตามที่สมมติ) — ต้องวัดซ้ำ", "AFM 2025 Fig. 2I: threshold between 0.5–1 wt% (≈0.3–0.6 vol% with the assumed densities) — needs re-measuring")],
    ["t_perc", Lg("exponent t ของ percolation", "Percolation exponent t"), "", 1.3, 3, 0.05, 0, Lg("ทฤษฎี percolation 3D ≈ 2 (ไม่ได้มาจาก paper)", "3-D percolation theory ≈ 2 (not from the papers)")],
    ["sigma0", Lg("σ₀ ของ percolation", "Percolation σ₀"), "S/m", 100, 1e4, 10, 1, Lg("fit ให้ 5 wt% ≈ 4×10⁻³ S/cm (อ่านจากกราฟ AFM 2025 Fig. 2I; ข้อความ p.6 เขียน ≈10⁻³)", "Fitted so 5 wt% ≈ 4×10⁻³ S/cm (read from AFM 2025 Fig. 2I graph; text p.6 says ≈10⁻³)")],
    ["r_model", Lg("model ของ R บน dome", "Dome R model"), "sel", ["film", "legacy"]],
    ["rho_t", Lg("ความต้านทานของผิวสัมผัส ρₜ (interface)", "Contact interface resistance ρₜ"), "Ω·m²", 1e-6, 1, 1e-6, 1, Lg("fit ให้กระแสตรงกับ MEMS 2026 (I = I₀(1+296.5P)) ช่วง 5–1500 kPa ด้วยชุดโลหะบาง: อยู่ในช่วง 0.4–2.4 เท่า · ต้อง fit ใหม่กับค่าวัดจริง", "Fitted to the MEMS 2026 current (I = I₀(1+296.5P)) over 5–1500 kPa with thin metal: within 0.4–2.4× · must be re-fitted to real measurements")],
    ["H_asp_MPa", Lg("hardness ของ asperity ผิว", "Surface asperity hardness"), "MPa", 0.2, 20, 0.1, 1, Lg("⚠ ไม่มีใน paper — ควบคุมพื้นที่สัมผัสจริง A = F/H ต้องวัด", "⚠ not in the papers — sets the real contact area A = F/H, must be measured")],
    ["film_sq", Lg("จำนวน square ของ film ถึง pad", "Film squares to the pad"), "□", 0.02, 3, 0.01, 0, Lg("fit กับกระแสของ MEMS 2026: ต้องเล็ก (≈0.02) · ค่า 0.16 ที่ให้ 20 kΩ ตาม AFM 2025 Fig. 6C ทำให้กระแสที่ 1000 kPa ต่ำเกิน 3 เท่า (เป็นการวัดคนละแบบ) ⚠ ตำแหน่งขั้วจริงต้องยืนยัน", "Fitted to the MEMS 2026 current: must be small (≈0.02) · 0.16, which gives 20 kΩ per AFM 2025 Fig. 6C, makes the current at 1000 kPa 3× too low (a different measurement) ⚠ real terminal positions need confirming")],
    ["R_leak", Lg("R รั่วตอนไม่แตะ", "Leak R when not touching"), "Ω", 1e7, 1e11, 1e7, 1, Lg("I₀ ≈ 10⁻⁹ A ที่ 5 V (AFM 2025 Fig. 3F; MEMS 2026 p.3)", "I₀ ≈ 10⁻⁹ A at 5 V (AFM 2025 Fig. 3F; MEMS 2026 p.3)")],
  ]],
  [Lg("Stack ด้านบน (วงจร B: E1–E2)", "Top stack (circuit B: E1–E2)"), [
    ["cover_mat", Lg("ชั้นบนสุด: PI cover · หรือ piezo เป็นชั้นที่สาม + E3 (ทางเลือกเดิม)", "Top layer: PI cover · or piezo as a third layer + E3 (earlier alternative)"), "sel", ["Polyimide (PI)", ...Object.keys(PH.PIEZO).filter(k => PH.PIEZO[k].d33 != null)]],
    ["cover_um", Lg("ความหนาชั้นบนสุด", "Top layer thickness"), "µm", 0, 100, 1, 0, Lg("⚠ PI ทั่วไป 12.5–50 µm · ฟิล์ม PVDF 28 µm (Tang 2025 Table 1 แถว [81])", "⚠ typical PI 12.5–50 µm · PVDF film 28 µm (Tang 2025 Table 1 row [81])")],
    ["e2_type", Lg("electrode บน (E2)", "Top electrode (E2)"), "sel", Object.keys(PH.ELECTRODES)],
    ["diel_mat", Lg("วัสดุ dielectric (ยาง หรือวัสดุ piezo จาก Table 1)", "Dielectric material (rubber, or a piezo material from Table 1)"), "sel", ["PDMS Sylgard 184", "Ecoflex 00-30", "Dragon Skin 10", "TPU resin (DLP)", ...Object.keys(PH.PIEZO).filter(k => PH.PIEZO[k].d33 != null)]],
    ["diel_um", Lg("ความหนา dielectric", "Dielectric thickness"), "µm", 1, 500, 1, 0, Lg("⚠ ตัวแปรออกแบบของเรา — ไม่มีใน paper (Yin 2024 ใช้ PDMS 300–1800 µm)", "⚠ our design variable — not in the papers (Yin 2024 used PDMS 300–1800 µm)")],
    ["porosity", Lg("ความพรุนของ dielectric", "Dielectric porosity"), "", 0, 0.85, 0.01, 0, Lg("⚠ ตัวแปรออกแบบ · 0 = ยางตัน; >0 = รูพรุน (แนวคิดจาก Wang 2022)", "⚠ design variable · 0 = solid rubber; >0 = porous (idea from Wang 2022)")],
    ["e1_type", Lg("electrode ล่าง (E1, ใช้ร่วมกับช่อง A)", "Bottom electrode (E1, shared with channel A)"), "sel", Object.keys(PH.ELECTRODES)],
    ["base_um", Lg("PI ที่รองรับ E1 (อยู่เหนือ E1)", "PI carrying E1 (above E1)"), "µm", 0, 100, 1, 0, Lg("MEMS 2026 p.2: PI-based electrode — ความหนาไม่ได้รายงาน ⚠ ต้องวัด · E1 อยู่ผิวล่างเพื่อแตะ dome", "MEMS 2026 p.2: PI-based electrode — thickness not reported ⚠ must be measured · E1 is on the underside so it can touch the domes")],
    ["stack_bond", Lg("การยึดชั้นใน stack (ความแข็งดัด)", "Stack bonding (bending stiffness)"), "sel", ["independent", "composite"]],
    ["elec_frac", Lg("สัดส่วนพื้นที่ electrode", "Electrode area fraction"), "", 0.2, 1, 0.01, 0, Lg("⚠ ตัวแปรออกแบบ", "⚠ design variable")],
    ["C_par_pF", Lg("parasitic C (สาย/PCB)", "Parasitic C (cable/PCB)"), "pF", 0, 20, 0.1, 0, Lg("⚠ ไม่มีใน paper — ต้องวัด baseline", "⚠ not in the papers — measure the baseline")],
  ]],
  [Lg("สัญญาณ piezo (เลือกวัสดุ piezo ที่ “วัสดุ dielectric”)", "Piezo signal (choose a piezo material under “Dielectric material”)"), [
    ["pz_Rin_MOhm", Lg("R ขาเข้าของวงจรขยาย", "Amplifier input R"), "MΩ", 1, 10000, 1, 1, Lg("กำหนดความถี่ตัดล่าง f = 1/(2πRC) · ดู research_piezo_materials", "Sets the low cut-off f = 1/(2πRC) · see research_piezo_materials")],
    ["pz_Ccable_pF", Lg("C ของสาย + ขาเข้า", "Cable + input C"), "pF", 0, 1000, 1, 0, Lg("⚠ ต้องวัด · ลด V ที่ได้เพราะประจุถูกแบ่ง", "⚠ must be measured · lowers the voltage because the charge is shared")],
  ]],
  [Lg("สิ่งแวดล้อม / creep / drift", "Environment / creep / drift"), [
    ["dT_K", Lg("อุณหภูมิเปลี่ยนจากตอน calibrate (ΔT)", "Temperature change since calibration (ΔT)"), "K", -20, 40, 1, 0, Lg("calibration ทำที่ ΔT = 0 · ดู research_temperature_stability", "Calibration is at ΔT = 0 · see research_temperature_stability")],
    ["kE_tpu", Lg("modulus ของ TPU เปลี่ยนตามอุณหภูมิ", "TPU modulus change with temperature"), "%/K", -3, 1, 0.05, 0, Lg("⚠ ไม่มีค่าที่มีแหล่งอ้างอิง (BASF/Covestro ให้แต่กราฟ) · ลบ = อุ่นแล้วนิ่ม", "⚠ no sourced value (BASF/Covestro give graphs only) · negative = softer when warm")],
    ["TCR", Lg("สัมประสิทธิ์อุณหภูมิของ R", "Temperature coefficient of R"), "%/K", -1, 1, 0.01, 0, Lg("MWCNT/PMMA −0.085 ถึง −0.14 %/K (Walczak 2014), MWCNT/SEBS −0.06 (Matzeu 2012) · ไม่มีค่าของ CNT บน resin นี้ ⚠ ต้องวัด", "MWCNT/PMMA −0.085 to −0.14 %/K (Walczak 2014), MWCNT/SEBS −0.06 (Matzeu 2012) · no value for CNT in this resin ⚠ must be measured")],
    ["TCC", Lg("สัมประสิทธิ์อุณหภูมิของ C", "Temperature coefficient of C"), "%/K", -0.2, 0.2, 0.005, 0, Lg("PDMS Sylgard 184: −0.18 %/K (King et al., arXiv:2409.03628, 20–110 °C; รวมการขยายตัวแล้ว) · วัสดุอื่น ⚠ ไม่มีค่า", "PDMS Sylgard 184: −0.18 %/K (King et al., arXiv:2409.03628, 20–110 °C; includes expansion) · other materials ⚠ no value")],
    ["drift_pct", Lg("drift ของ R ต่อ decade เวลา", "R drift per decade of time"), "%", 0, 10, 0.1, 0, Lg("Velostat 5.8 %/decade ที่ 8.1 N นาน 3 ชม. (Fonseca et al., arXiv:2304.06204) · resin-CNT ของเรา ⚠ ต้องวัด", "Velostat 5.8 %/decade at 8.1 N for 3 h (Fonseca et al., arXiv:2304.06204) · our resin-CNT ⚠ must be measured")],
    ["creep_tpu", Lg("creep ของ TPU (dome)", "TPU creep (domes)"), "%", 0, 40, 0.5, 0, Lg("⚠ ค่าเดา · ไม่พบค่าที่มีแหล่งอ้างอิง (มีแต่ compression set)", "⚠ guess · no sourced value found (only compression set)")],
    ["tau_tpu_min", "τ creep TPU", "min", 0.5, 60, 0.5, 0, Lg("⚠ ค่าเดา", "⚠ guess")],
    ["creep_diel", Lg("creep ของ dielectric", "Dielectric creep"), "%", 0, 40, 0.5, 0, Lg("⚠ ค่าเดา · ตั้ง 0 = จำลอง air-gap ที่ไม่ creep", "⚠ guess · 0 = an air gap that does not creep")],
    ["tau_diel_min", "τ creep dielectric", "min", 0.5, 60, 0.5, 0, Lg("⚠ ค่าเดา", "⚠ guess")],
  ]],
  [Lg("วงจรอ่านค่า", "Readout circuits"), [
    ["Vb", Lg("แรงดัน bias ช่อง R", "Channel R bias voltage"), "V", 0.01, 5, 0.01, 0, Lg("AFM 2025 p.8, Fig. 4: ทดสอบ 0.01–5 V", "AFM 2025 p.8, Fig. 4: tested 0.01–5 V")],
    ["R_ref", Lg("R อ้างอิง (voltage divider)", "Reference R (voltage divider)"), "Ω", 1e3, 1e7, 1e3, 1, Lg("ตัวแปรออกแบบวงจร", "Circuit design variable")],
    ["adc_bits", "ADC resolution", "bit", 8, 24, 1, 0, Lg("MCU ทั่วไป 10–12 bit", "Typical MCU 10–12 bit")],
    ["Vref", "ADC Vref", "V", 1, 5, 0.1, 0, ""],
    ["adc_noise_lsb", Lg("noise ของ ADC", "ADC noise"), "LSB rms", 0.3, 10, 0.1, 0, ""],
    ["c_method", Lg("วิธีอ่าน C", "C readout method"), "sel", ["AD7745", "FDC1004", "Charge-time", "Lock-in (AC)"]],
    ["cdc_noise_aF", Lg("noise ของ AD7745", "AD7745 noise"), "aF rms", 4, 200, 1, 0, Lg("datasheet AD7745: 4.2–40 aF rms ขึ้นกับ update rate", "AD7745 datasheet: 4.2–40 aF rms depending on update rate")],
    ["c_env_fF", Lg("noise ของระบบจริง (สาย/สิ่งแวดล้อม)", "Real system noise (cable/environment)"), "fF rms", 0, 50, 0.1, 0, Lg("⚠ ต้องวัด · บวกกับ noise ของชิปแบบ root-sum-square · 0 = ชิปอย่างเดียว (ideal)", "⚠ must be measured · added to the chip noise as root-sum-square · 0 = chip only (ideal)")],
    ["cdc_rate_Hz", "update rate AD7745", "Hz", 10, 90, 1, 0, Lg("Yin 2024 p.5: update 10–90 Hz, ช่วง ±4 pF, bias ≤ 17 pF", "Yin 2024 p.5: update 10–90 Hz, range ±4 pF, offset ≤ 17 pF")],
    ["mcu_clk_MHz", Lg("clock ของ timer (charge-time)", "Timer clock (charge-time)"), "MHz", 1, 240, 1, 0, ""],
    ["R_charge_k", Lg("R ชาร์จ (charge-time)", "Charging R (charge-time)"), "kΩ", 10, 1e4, 10, 1, Lg("⚠ ค่าเดา · วิธี charge-time (Fonseca 2023 ผ่าน speaker notes)", "⚠ guess · charge-time method (Fonseca 2023 via speaker notes)")],
    ["lockin_noise_fF", Lg("noise ของ lock-in", "Lock-in noise"), "fF rms", 0.1, 20, 0.1, 0, ""],
    ["f_exc_kHz", Lg("ความถี่ excitation", "Excitation frequency"), "kHz", 1, 1000, 1, 1, ""],
    ["lockin_periods", Lg("จำนวนคาบต่อการวัด", "Periods per measurement"), "", 1, 100, 1, 0, ""],
    ["rows", Lg("จำนวนแถวของ array", "Array rows"), "", 1, 32, 1, 0, "MEMS 2026 p.1, Fig. 4: 16 × 9 = 144 taxel"],
    ["cols", Lg("จำนวนคอลัมน์", "Array columns"), "", 1, 32, 1, 0, ""],
    ["array_gap_mm", Lg("ระยะห่างระหว่าง taxel (ขอบถึงขอบ)", "Taxel spacing (edge to edge)"), "mm", 0.2, 5, 0.025, 0, Lg("MEMS 2026 p.4: 1.925 mm (→ 5.98 mm/pixel) · Fig. 4a เขียน 1.5 mm — ต้องยืนยัน", "MEMS 2026 p.4: 1.925 mm (→ 5.98 mm/pixel) · Fig. 4a says 1.5 mm — needs confirming")],
    ["t_adc_us", Lg("เวลาอ่าน R ต่อ taxel", "R read time per taxel"), "µs", 1, 200, 1, 0, ""],
  ]],
  [Lg("การพิมพ์ (Jacobs curve)", "Printing (Jacobs curve)"), [
    ["Dp_tpu", Lg("Dp ของ TPU resin", "Dp of TPU resin"), "µm", 50, 500, 5, 0, Lg("fit ให้ G = 220 → 650 µm ที่ 6 s · กราฟ AFM Fig. 2G (ฟิล์มเรียบ) ให้ ~485 µm ที่ 4.5 s — ต้องยืนยัน", "Fitted so G = 220 → 650 µm at 6 s · AFM Fig. 2G graph (flat film) gives ~485 µm at 4.5 s — needs confirming")],
    ["T0_tpu", Lg("T₀ (เวลาเริ่มแข็งที่ G = 255)", "T₀ (onset time at G = 255)"), "s", 0.05, 2, 0.01, 0, Lg("⚠ fit คู่กับ Dp — ไม่ได้รายงานใน paper", "⚠ fitted together with Dp — not reported in the papers")],
    ["t_exp_tpu", Lg("เวลาฉายชั้น dome", "Dome layer exposure time"), "s", 1, 30, 0.5, 0, "AFM 2025 p.6: 4–6 s"],
    ["Dp_resin", Lg("Dp ของ resin ไม่ผสม CNT", "Dp of resin without CNT"), "µm", 50, 500, 5, 0, Lg("⚠ สมมติ", "⚠ assumed")],
    ["kD", Lg("การดูดกลืนแสงที่ CNT เพิ่ม", "Extra light absorption from CNT"), "µm⁻¹", 0.1, 2, 0.01, 0, Lg("⚠ fit ให้ 20 µm ที่ 350 s (AFM p.6) และ 50 µm ที่ 1000 s — จุดที่สองไม่พบใน paper ต้องยืนยัน", "⚠ fitted to 20 µm at 350 s (AFM p.6) and 50 µm at 1000 s — the second point was not found in the papers, needs confirming")],
    ["tc0", Lg("เวลา threshold (0 wt%)", "Threshold time (0 wt%)"), "s", 0.2, 20, 0.1, 0, Lg("⚠ สมมติ", "⚠ assumed")],
    ["beta_tc", Lg("อัตราเพิ่มของเวลา threshold ตาม CNT", "Threshold time increase with CNT"), "", 10, 150, 1, 0, Lg("fit ให้ 5 wt% → 20 µm ที่ 350 s (AFM 2025 p.6)", "Fitted so 5 wt% → 20 µm at 350 s (AFM 2025 p.6)")],
  ]],
  [Lg("การคำนวณ", "Computation"), [
    ["large_defl", Lg("แผ่นบนยืดตัวเมื่อยุบมาก (large deflection)", "Top plate stretches at large deflection"), "sel", ["on", "off"]],
    ["border_sink", Lg("border ยุบตัวเมื่อรับแรง", "Border compresses under load"), "sel", ["on", "off"]],
    ["beta_ld", Lg("สัมประสิทธิ์ β ของ large deflection", "Large-deflection coefficient β"), "", 0, 2, 0.01, 0, Lg("w_linear = w(1 + β(w/tₑ)²) · 0.52 = fit กับ Levy, NACA Report 740 Table 5 (แผ่นสี่เหลี่ยมขอบยึดแน่น, w/t ≤ 1.9) · แผ่นกลม 0.488 (Timoshenko) · เกิน w/t ≈ 2 เป็นการ extrapolate", "w_linear = w(1 + β(w/tₑ)²) · 0.52 = fit to Levy, NACA Report 740 Table 5 (clamped square plate, w/t ≤ 1.9) · circular plate 0.488 (Timoshenko) · beyond w/t ≈ 2 is an extrapolation")],
    ["p_max_kPa", Lg("แรงกดสูงสุดของกราฟ", "Maximum pressure of the graphs"), "kPa", 20, 2000, 10, 1, ""],
    ["fd_n", Lg("ความละเอียด FD ของแผ่นบน", "Top plate FD resolution"), Lg("จุด/ด้าน", "points/side"), 13, 33, 2, 0, Lg("มาก = แม่นขึ้นแต่ช้าลง", "higher = more accurate but slower")],
    ["ca_grid", Lg("ความละเอียดการคำนวณ C_A", "C_A computation resolution"), Lg("จุด/ด้าน", "points/side"), 40, 160, 10, 0, ""],
  ]],
];
const HEAVY = new Set(["taxel_mm", "border_mm", "dome_d_um", "pitch_um", "h_center_um", "h_edge_um", "h_corner_um", "gap_um", "cover_um", "e2_type", "diel_mat", "diel_um", "porosity", "e1_type", "base_um", "stack_bond", "fd_n", "cover_mat", "large_defl", "beta_ld", "border_sink", "E_tpu_MPa", "border_mm"]);

// ------------------------------------------------------------- helpers
const $ = s => document.querySelector(s);
const fmtSI = (v, u) => {
  if (!isFinite(v)) return "∞ " + u;
  const a = Math.abs(v), pre = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"], [1e-15, "f"], [1e-18, "a"]];
  for (const [f, s] of pre) if (a >= f * 0.9995) return (v / f).toPrecision(3) + " " + s + u;
  return v.toExponential(2) + " " + u;
};
const kPa = p => isFinite(p) ? (p / 1e3).toPrecision(3) + " kPa" : Lg("ไม่แตะในช่วงนี้", "no contact in this range");
// parameter panel: "main" keys shown by default, search box, presets
const BASIC = new Set(["gap_um", "h_center_um", "E_tpu_MPa", "cnt_wt", "cover_mat", "cover_um", "e2_type", "diel_mat", "diel_um", "porosity", "e1_type", "base_um", "stack_bond", "dT_K", "Vb", "c_method", "c_env_fF", "large_defl", "pz_Rin_MOhm", "rho_t"]);
let PMODE = "basic", PSEARCH = "";
const PRESETS = {
  [Lg("ค่าเริ่มต้น: electrode ทองแดง FPC", "Default: copper FPC electrodes")]: {},
  [Lg("electrode โลหะบางบน PI 12.5 µm", "Thin metal electrodes on 12.5 µm PI")]: { e1_type: "Sputtered Cu (thin)", e2_type: "Sputtered Cu (thin)", base_um: 12.5, cover_um: 12.5 },
  [Lg("โลหะบาง + dielectric TPU พิมพ์ DLP (พรุน 50 %)", "Thin metal + printed DLP TPU dielectric (50 % porous)")]: { e1_type: "Sputtered Cu (thin)", e2_type: "Sputtered Cu (thin)", base_um: 12.5, cover_um: 12.5, diel_mat: "TPU resin (DLP)", porosity: 0.5 },
  [Lg("dielectric = ฟิล์ม PVDF 28 µm (E1–E2) · electrode ทองแดง FPC", "Dielectric = PVDF film 28 µm (E1–E2) · copper FPC electrodes")]: { diel_mat: "PVDF film (piezo)", diel_um: 28, porosity: 0 },
  [Lg("dielectric = ฟิล์ม PVDF 9 µm (E1–E2) · electrode โลหะบาง", "Dielectric = PVDF film 9 µm (E1–E2) · thin metal electrodes")]: { e1_type: "Sputtered Cu (thin)", e2_type: "Sputtered Cu (thin)", base_um: 12.5, cover_um: 12.5, diel_mat: "PVDF film (piezo)", diel_um: 9, porosity: 0 },
  [Lg("dielectric = P(VDF-TrFE) เคลือบ 10 µm (E1–E2) · electrode โลหะบาง", "Dielectric = P(VDF-TrFE) coating 10 µm (E1–E2) · thin metal electrodes")]: { e1_type: "Sputtered Cu (thin)", e2_type: "Sputtered Cu (thin)", base_um: 12.5, cover_um: 12.5, diel_mat: "P(VDF-TrFE) (piezo)", diel_um: 10, porosity: 0 },
  [Lg("dielectric = resin + BaTiO₃ พิมพ์ 30 µm (E1–E2) · พิมพ์ทุกชั้น", "Dielectric = printed resin + BaTiO₃ 30 µm (E1–E2) · all layers printed")]: { e1_type: "Resin-CNT (print)", e2_type: "Resin-CNT (print)", base_um: 0, cover_um: 0, diel_mat: "Resin + BaTiO3 (print)", diel_um: 30, porosity: 0 },
  [Lg("dielectric = ฟิล์ม PVDF 9 µm (E1–E2) · electrode ทองบาง (Au 100 nm)", "Dielectric = PVDF film 9 µm (E1–E2) · thin gold electrodes (Au 100 nm)")]: { e1_type: "Sputtered Au (thin)", e2_type: "Sputtered Au (thin)", base_um: 12.5, cover_um: 12.5, diel_mat: "PVDF film (piezo)", diel_um: 9, porosity: 0 },
  [Lg("ทางเลือกเดิม: โลหะบาง + piezo PVDF 28 µm เป็นชั้นที่สาม (มี E3)", "Earlier alternative: thin metal + PVDF 28 µm as a third layer (with E3)")]: { e1_type: "Sputtered Cu (thin)", e2_type: "Sputtered Cu (thin)", base_um: 12.5, cover_mat: "PVDF film (piezo)", cover_um: 28 },
  [Lg("พิมพ์ทุกชั้นด้วย s-gDLP: electrode resin-CNT + dielectric TPU พรุน", "All layers printed by s-gDLP: resin-CNT electrodes + porous TPU dielectric")]: { e1_type: "Resin-CNT (print)", e2_type: "Resin-CNT (print)", base_um: 0, cover_um: 0, diel_mat: "TPU resin (DLP)", porosity: 0.5 },
  [Lg("ทางเลือกเดิม: พิมพ์ทุกชั้น + piezo resin-BaTiO₃ เป็นชั้นที่สาม (มี E3)", "Earlier alternative: all printed + resin-BaTiO₃ piezo as a third layer (with E3)")]: { e1_type: "Resin-CNT (print)", e2_type: "Resin-CNT (print)", base_um: 0, diel_mat: "TPU resin (DLP)", porosity: 0.5, cover_mat: "Resin + BaTiO3 (print)", cover_um: 30 },
  [Lg("ideal: model เดิม (แผ่นเส้นตรง, border แข็ง, noise ชิปอย่างเดียว, R แบบเก่า)", "Ideal: original model (linear plate, rigid border, chip noise only, legacy R)")]: { large_defl: "off", c_env_fF: 0, r_model: "legacy", rho_t: 1e-5, film_sq: 0.16, border_sink: "off" },
};
function applyFilter() {
  const q = PSEARCH.trim().toLowerCase();
  document.querySelectorAll("#params details").forEach(det => {
    let any = false;
    det.querySelectorAll(".prow").forEach(r => { const show = q ? r.textContent.toLowerCase().includes(q) || (r.dataset.k || "").toLowerCase().includes(q) : PMODE === "all" || BASIC.has(r.dataset.k); r.style.display = show ? "" : "none"; any = any || show; });
    det.style.display = any ? "" : "none"; if (q || PMODE === "basic") det.open = true;
  });
}

// ------------------------------------------------------------- controls
function buildControls() {
  const host = $("#params");
  host.innerHTML = `${Lg("<div class=\"pfilter\"><input id=\"p-search\" type=\"search\" placeholder=\"ค้นหา parameter…\" value=\"", "<div class=\"pfilter\"><input id=\"p-search\" type=\"search\" placeholder=\"Search parameters…\" value=\"")}${PSEARCH}">
    <div class="seg"><button data-pm="basic" class="${PMODE === "basic" ? "on" : ""}${Lg("\" title=\"เฉพาะค่าที่มีผลมากและควรลองปรับก่อน\">ค่าหลัก</button><button data-pm=\"all\" class=\"", "\" title=\"Only the parameters with the largest effect, worth trying first\">Main</button><button data-pm=\"all\" class=\"")}${PMODE === "all" ? "on" : ""}${Lg("\">ทั้งหมด</button></div></div>", "\">All</button></div></div>")}`;
  host.querySelector("#p-search").addEventListener("input", e => { PSEARCH = e.target.value; applyFilter(); });
  host.querySelectorAll("[data-pm]").forEach(b => b.addEventListener("click", () => { PMODE = b.dataset.pm; host.querySelectorAll("[data-pm]").forEach(x => x.classList.toggle("on", x === b)); applyFilter(); }));
  SPEC.forEach(([gname, items], gi) => {
    const det = document.createElement("details"); if (gi < 3) det.open = true;
    det.innerHTML = `<summary>${gname}</summary>`;
    items.forEach(it => {
      const [key, label, unit] = it;
      const row = document.createElement("div"); row.className = "prow"; row.dataset.k = key;
      if (unit === "sel") {
        row.innerHTML = `<label>${label}</label><select data-k="${key}">${it[3].map(o => `<option ${o === P[key] ? "selected" : ""}>${o}</option>`).join("")}</select>`;
      } else {
        const [, , , mn, mx, st, lg, src] = it;
        const toS = v => lg ? Math.log10(v) : v, fromS = s => lg ? Math.pow(10, +s) : +s;
        row.innerHTML = `<label title="${src || ""}">${label} ${src ? `<span class="src" title="${src}">ⓘ</span>` : ""}</label>
          <div class="pin"><input type="range" min="${toS(mn)}" max="${toS(mx)}" step="${lg ? 0.01 : st}" value="${toS(P[key])}">
          <input type="number" value="${+(+P[key]).toPrecision(4)}" step="any"><span class="u">${unit}</span></div>
          ${src ? `<div class="note">${src}</div>` : ""}`;
        const [rg, nb] = row.querySelectorAll("input");
        rg.addEventListener("input", () => { P[key] = +fromS(rg.value).toPrecision(4); nb.value = P[key]; changed(key); });
        nb.addEventListener("change", () => { P[key] = +nb.value; rg.value = toS(P[key]); changed(key); });
        row.dataset.k = key;
      }
      det.appendChild(row);
    });
    host.appendChild(det);
  });
  host.querySelectorAll("select").forEach(s => s.addEventListener("change", () => { P[s.dataset.k] = s.value; changed(s.dataset.k); }));
  applyFilter();
}
let tmr = null, needModel = true, tabT = null;
function changed(key) {
  if (HEAVY.has(key)) needModel = true;
  clearTimeout(tmr); tmr = setTimeout(recompute, 120);
}

// ------------------------------------------------------------- compute
function recompute() {
  const t0 = performance.now();
  if (needModel || !MODEL) { MODEL = PH.buildModel(P); needModel = false; }
  else MODEL.P = P;
  SWEEP = PH.sweep(MODEL);
  LIVE = null;
  Stage.modelChanged();
  $("#o-freq").value = Math.log10(P.f_exc_kHz); $("#o-freq-v").textContent = fmtSI(P.f_exc_kHz * 1e3, "Hz");
  $("#env-dT").value = P.dT_K; $("#env-dT-v").textContent = (P.dT_K > 0 ? "+" : "") + P.dT_K + " K";
  $("#status").textContent = `${Lg("คำนวณ ", "computed in ")}${(performance.now() - t0).toFixed(0)}${Lg(" ms · D แผ่นบน = ", " ms · top plate D = ")}${MODEL.PF.D.toExponential(2)} N·m`;
  renderAll();
}
function renderAll() { renderView(); renderTab(currentTab); }

// ------------------------------------------------------------- live state at the viewed pressure
// LIVE is the single solved state every view reads. LIVE_ENV carries the creep / drift factors
// of the press–hold–release animation (same expressions as Physics.timeSim).
let LIVE = null;
const LIVE_ENV = { tpu: 1, diel: 1, drift: 1, warm: false };
function computeLive() {
  const p = P.p_view_kPa * 1e3;
  const warm = LIVE_ENV.warm && LIVE && LIVE.model === MODEL ? LIVE.sol.delta : null;
  // temperature: softer/stiffer TPU and dielectric, permittivity and CNT resistance change; the calibration (sweep) stays at dT = 0
  const dT = P.dT_K || 0, fT = k => Math.max(0.2, 1 + k * dT / 100);
  const st = PH.stateAt(MODEL, p, { tpu: LIVE_ENV.tpu / fT(P.kE_tpu), diel: LIVE_ENV.diel / fT(PH.TEMP_COEF[P.diel_mat] || 0), dT }, warm);
  st.model = MODEL; st.Rlive = st.RA.R * LIVE_ENV.drift * fT(P.TCR);
  LIVE = st; return st;
}
function frameRates(C) {                 // array refresh rates from the readout settings
  const nT = P.rows * P.cols, tC = PH.cTimePerTaxel(P, C), tR = P.t_adc_us * 1e-6;
  return { nT, tC, tR, R: 1 / (nT * tR), C: 1 / (nT * tC), both: 1 / (nT * (tR + tC)) };
}
function renderView() {
  const st = computeLive(), p = st.p;
  const ra = PH.readoutA(st.Rlive, P);
  const warn = [];
  const maxStrain = Math.max(...st.sol.delta.map((d, j) => d / MODEL.G.domes[j].h));
  if (maxStrain > 0.3) warn.push(`${Lg("dome ยุบ ", "dome compressed ")}${(maxStrain * 100).toFixed(0)}${Lg("% ของความสูง — เกินช่วงที่ Hertz ใช้ได้", "% of its height — beyond the range where Hertz holds")}`);
  if (P.porosity > 0.11 && st.CB.phi < 0.11) warn.push(Lg("รูพรุนใน dielectric ปิดแล้ว — C_B อิ่มตัว", "pores in the dielectric are closed — C_B saturates"));
  if (st.sol.kappa > 1.5) warn.push(`${Lg("แผ่นบนยุบ ", "top plate deflects ")}${(PH.deflectionAt(0, 0, p, MODEL.PF, st.sol) * 1e6).toFixed(0)}${Lg(" µm เทียบกับความหนาเทียบเท่า ", " µm against an equivalent thickness of ")}${(MODEL.PF.te * 1e6).toFixed(0)}${Lg(" µm → แข็งขึ้น ×", " µm → stiffer ×")}${st.sol.kappa.toFixed(1)}${Lg(" จากการยืด (ลองใช้ electrode โลหะบาง)", " from stretching (try thin metal electrodes)")}`);
  const pzS = PH.piezoStatic(P);
  if (pzS && pzS.pz.Tmax && 25 + (P.dT_K || 0) > pzS.pz.Tmax) warn.push(Lg("อุณหภูมิเกินช่วงใช้งานของวัสดุ piezo", "temperature beyond the working range of the piezo material"));
  if (pzS && pzS.where === "diel" && P.porosity === 0) warn.push(Lg("dielectric เป็นวัสดุ piezo เนื้อตัน: แข็งระดับ GPa จึงแทบไม่บางลงเมื่อกด → C_B ไม่เปลี่ยนตามแรง คู่ E1–E2 ให้สัญญาณ piezo เท่านั้น", "dielectric is a solid piezo material: GPa-stiff, so it barely thins when pressed → C_B does not change with force; the E1–E2 pair gives only a piezo signal"));
  if (pzS && pzS.where === "diel" && P.porosity > 0) warn.push(Lg("dielectric piezo แบบพรุน: ใช้ d33 ของเนื้อตัน และความแข็งจาก Gibson–Ashby ⚠ ยังไม่มีค่าที่วัดจริงของรูปแบบพรุน", "porous piezo dielectric: uses the solid d33 and Gibson–Ashby stiffness ⚠ no measured values for porous forms yet"));
  const pr = PH.cntPrinting(P); if (pr.tNeed > 1200) warn.push(`${Lg("ต้องฉาย resin-CNT ~", "resin-CNT needs ~")}${(pr.tNeed / 60).toFixed(0)}${Lg(" นาที — ช้าเกินจริง", " min of exposure — unrealistically slow")}`);
  if (P.cnt_wt > 7) warn.push(Lg("wt% > 7: นอกช่วงที่ Zaki พิมพ์ได้จริง (ความหนืด) — model extrapolate", "wt% > 7: outside what Zaki could print (viscosity) — model extrapolates"));
  Stage.update();
  $("#kpis").innerHTML = `${Lg("\n    <div class=\"kpi\"><div class=\"k\">แรงกดที่ดู</div><div class=\"v\">", "\n    <div class=\"kpi\"><div class=\"k\">Pressure shown</div><div class=\"v\">")}${kPa(p)}${Lg("</div></div>\n    <div class=\"kpi\"><div class=\"k\">dome ที่แตะ</div><div class=\"v\">", "</div></div>\n    <div class=\"kpi\"><div class=\"k\">Domes touching</div><div class=\"v\">")}${st.sol.nContact}${Lg(" / 9</div></div>\n    <div class=\"kpi pzr\"><div class=\"k\">ช่อง A: R</div><div class=\"v\">", " / 9</div></div>\n    <div class=\"kpi pzr\"><div class=\"k\">Channel A: R</div><div class=\"v\">")}${fmtSI(st.Rlive, "Ω")}</div><div class="s">I = ${fmtSI(ra.I, "A")}${Lg(" ที่ ", " at ")}${P.Vb}${Lg(" V</div></div>\n    <div class=\"kpi pzr\"><div class=\"k\">ช่อง A: C (gap)</div><div class=\"v\">", " V</div></div>\n    <div class=\"kpi pzr\"><div class=\"k\">Channel A: C (gap)</div><div class=\"v\">")}${(st.CA * 1e12).toFixed(3)} pF</div><div class="s">${st.sol.nContact ? Lg("ถูก R short แล้ว", "shorted by R") : Lg("ใช้งานได้ (ยังไม่แตะ)", "active (not touching yet)")}${Lg("</div></div>\n    <div class=\"kpi cap\"><div class=\"k\">ช่อง B: C (stack)</div><div class=\"v\">", "</div></div>\n    <div class=\"kpi cap\"><div class=\"k\">Channel B: C (stack)</div><div class=\"v\">")}${(st.CB.C * 1e12).toFixed(3)} pF</div><div class="s">dielectric ${(st.CB.t * 1e6).toFixed(1)}${Lg(" µm</div></div>\n    <div class=\"kpi hyb\"><div class=\"k\">dome แรกแตะที่</div><div class=\"v\">", " µm</div></div>\n    <div class=\"kpi hyb\"><div class=\"k\">First dome touches at</div><div class=\"v\">")}${kPa(SWEEP.onset)}${Lg("</div><div class=\"s\">ต่ำกว่านี้ = dead-zone ของช่อง R</div></div>", "</div><div class=\"s\">below this = channel R dead zone</div></div>")}`;
  $("#warns").innerHTML = warn.map(w => `<div class="warn">⚠ ${w}</div>`).join("");
  const pz = Stage.piezo();
  if (pz) $("#kpis").insertAdjacentHTML("beforeend", `<div class="kpi pzo"><div class="k">piezo (${pz.S.pair})</div><div class="v">${fmtSI(pz.V, "V")}</div><div class="s">Q = ${fmtSI(pz.S.QperPa * p, "C")}${Lg(" · ตัดล่าง ", " · low cut-off ")}${pz.S.fc.toPrecision(2)} Hz</div></div>`);
}

// ------------------------------------------------------------- tabs
const charts = {};
function chart(id, opt) { if (!charts[id]) charts[id] = new MiniChart(document.getElementById(id), opt); return charts[id]; }
let currentTab = "sig";
function renderTab(t) {
  currentTab = t;
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("on", b.dataset.t === t));
  document.querySelectorAll(".pane").forEach(p => p.style.display = p.id === "pane-" + t ? "block" : "none");
  ({ sig: tabSignals, mech: tabMech, cnt: tabCNT, rd: tabReadout, time: tabTime, data: tabData, about: () => {}, learn: tabLearn, opt: () => Optimizer.render() })[t]();
}
const vview = () => [{ x: P.p_view_kPa, color: COL.grey, label: Lg("p ที่ดู", "p shown") }, { x: SWEEP.onset / 1e3, color: COL.red, label: Lg("แตะครั้งแรก", "first contact") }];

function tabSignals() {
  const pts = SWEEP.pts;
  const meas = MEAS || [];
  chart("c-R", { xlog: 1, ylog: 1, xlabel: Lg("แรงกด (kPa)", "Pressure (kPa)"), ylabel: "R (Ω)", title: Lg("ช่อง A — ความต้านทาน (หลังแตะ)", "Channel A — resistance (after contact)") }).set([
    { name: Lg("R ช่อง A (model)", "Channel A R (model)"), color: COL.pzr, pts: pts.map(q => [q.p / 1e3, q.R]) },
    ...(meas.some(m => m.R) ? [{ name: Lg("ค่าวัดจริง", "measured"), color: COL.ink, marker: 1, pts: meas.filter(m => m.R).map(m => [m.p, m.R]) }] : []),
  ], vview());
  chart("c-C", { xlog: 1, xlabel: Lg("แรงกด (kPa)", "Pressure (kPa)"), ylabel: "C (pF)", title: Lg("ความจุของสองช่อง", "Capacitance of both channels") }).set([
    { name: Lg("C_B stack (ช่อง B)", "C_B stack (channel B)"), color: COL.cap, pts: pts.map(q => [q.p / 1e3, q.CB * 1e12]) },
    { name: Lg("C_A gap (ช่อง A ก่อนแตะ)", "C_A gap (channel A before contact)"), color: COL.pzr, dash: [5, 4], pts: pts.map(q => [q.p / 1e3, q.nContact ? NaN : q.CA * 1e12]) },
    ...(meas.some(m => m.C) ? [{ name: Lg("ค่าวัดจริง C", "measured C"), color: COL.ink, marker: 1, pts: meas.filter(m => m.C).map(m => [m.p, m.C]) }] : []),
  ], vview());
  // noise-limited pressure resolution
  const sV = P.adc_noise_lsb * P.Vref / 2 ** P.adc_bits, sC = PH.cNoise(P);
  const res = (arr, f, sig) => arr.map((q, i) => { if (i === 0) return [q.p / 1e3, NaN]; const a = arr[i - 1]; const d = Math.abs((f(q) - f(a)) / (q.p - a.p)); return [q.p / 1e3, d > 0 ? sig / d / 1e3 : NaN]; });
  chart("c-res", { xlog: 1, ylog: 1, xlabel: Lg("แรงกด (kPa)", "Pressure (kPa)"), ylabel: "resolution (kPa)", title: Lg("ความละเอียดของแรงที่ noise จำกัด (ยิ่งต่ำยิ่งดี)", "Noise-limited force resolution (lower is better)") }).set([
    { name: Lg("ช่อง A (R, ADC)", "Channel A (R, ADC)"), color: COL.pzr, pts: res(pts, q => PH.readoutA(q.R, P).Vout, sV).filter((r, i) => pts[i].nContact > 0) },
    { name: Lg("ช่อง A (C_A ก่อนแตะ)", "Channel A (C_A before contact)"), color: COL.pzr, dash: [5, 4], pts: res(pts, q => q.CA, sC).filter((r, i) => pts[i].nContact === 0) },
    { name: Lg("ช่อง B (C_B)", "Channel B (C_B)"), color: COL.cap, pts: res(pts, q => q.CB, sC) },
  ], vview());
  chart("c-I", { xlog: 1, ylog: 1, xlabel: Lg("แรงกด (kPa)", "Pressure (kPa)"), ylabel: "I (A)", title: `${Lg("กระแสช่อง A ที่ bias ", "Channel A current at bias ")}${P.Vb}${Lg(" V (เทียบ Zaki Fig. 3F)", " V (compare Zaki Fig. 3F)")}` }).set([
    { name: "I = V/R", color: COL.pzr, pts: pts.map(q => [q.p / 1e3, P.Vb / q.R]) },
    ...(meas.some(m => m.I) ? [{ name: Lg("ค่าวัดจริง I", "measured I"), color: COL.ink, marker: 1, pts: meas.filter(m => m.I).map(m => [m.p, m.I]) }] : []),
  ], vview());
}

function tabMech() {
  const pts = SWEEP.pts;
  chart("c-w", { xlog: 1, xlabel: Lg("แรงกด (kPa)", "Pressure (kPa)"), ylabel: "µm", title: Lg("การยุบตัว: แผ่นบนตรงกลาง และ dielectric", "Deflection: top plate centre and dielectric") }).set([
    { name: Lg("แผ่นบนยุบ (กลาง)", "Top plate deflection (centre)"), color: COL.hyb, pts: pts.map(q => [q.p / 1e3, q.wc * 1e6]) },
    { name: Lg("ความหนา dielectric", "Dielectric thickness"), color: COL.cap, pts: pts.map(q => [q.p / 1e3, q.tB * 1e6]) },
    { name: Lg("gap เริ่มต้น", "initial gap"), color: COL.grey, dash: [3, 3], pts: [[pts[0].p / 1e3, P.gap_um], [pts[pts.length - 1].p / 1e3, P.gap_um]] },
  ], vview());
  chart("c-n", { xlog: 1, xlabel: Lg("แรงกด (kPa)", "Pressure (kPa)"), ylabel: Lg("จำนวน dome", "number of domes"), title: Lg("จำนวน dome ที่แตะ (hierarchical)", "Number of domes touching (hierarchical)"), yrange: [0, 9.5] }).set([
    { name: Lg("dome ที่แตะ", "domes touching"), color: COL.pzr, pts: pts.map(q => [q.p / 1e3, q.nContact]) },
  ], vview());
  const st = LIVE || computeLive();
  const names = { c: Lg("กลาง", "centre"), e: Lg("ขอบ", "edge"), k: Lg("มุม", "corner") };
  $("#dome-table").innerHTML = `${Lg("<table><tr><th>dome</th><th>สูง (µm)</th><th>gap เริ่ม (µm)</th><th>ยุบ δ (µm)</th><th>แรง (mN)</th><th>รัศมีสัมผัส (µm)</th></tr>", "<table><tr><th>dome</th><th>height (µm)</th><th>initial gap (µm)</th><th>compression δ (µm)</th><th>force (mN)</th><th>contact radius (µm)</th></tr>")}` +
    MODEL.G.domes.map((d, j) => `<tr class="${st.sol.delta[j] > 0 ? "hit" : ""}"><td>${names[d.type]} (${(d.x * 1e3).toFixed(2)}, ${(d.y * 1e3).toFixed(2)}) mm</td><td>${(d.h * 1e6).toFixed(0)}</td><td>${(d.g * 1e6).toFixed(0)}</td><td>${(Math.max(0, st.sol.delta[j]) * 1e6).toFixed(1)}</td><td>${(st.sol.force[j] * 1e3).toFixed(2)}</td><td>${(st.sol.a[j] * 1e6).toFixed(1)}</td></tr>`).join("") + "</table>";
  // heat map of deflection
  const cv = $("#heat"), n = 120, ctx = cv.getContext("2d"); cv.width = n; cv.height = n;
  const img = ctx.createImageData(n, n); const G = MODEL.G; let wmax = 1e-12; const ws = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = -G.L / 2 + G.L * (i + 0.5) / n, y = -G.L / 2 + G.L * (j + 0.5) / n; const w = PH.deflectionAt(x, y, st.p, MODEL.PF, st.sol); ws.push(w); wmax = Math.max(wmax, w); }
  ws.forEach((w, k) => { const f = Math.max(0, w / wmax); img.data[k * 4] = 240 - 150 * f; img.data[k * 4 + 1] = 245 - 120 * f; img.data[k * 4 + 2] = 250 - 40 * f; img.data[k * 4 + 3] = 255; });
  ctx.putImageData(img, 0, 0);
  ctx.strokeStyle = COL.red; G.domes.forEach((d, j) => { ctx.beginPath(); ctx.arc((d.x / G.L + 0.5) * n, (d.y / G.L + 0.5) * n, G.rb / G.L * n, 0, 7); ctx.lineWidth = st.sol.delta[j] > 0 ? 2.5 : 0.8; ctx.stroke(); });
  $("#heat-cap").textContent = `${Lg("แผ่นบนยุบสูงสุด ", "Maximum top plate deflection ")}${(wmax * 1e6).toFixed(1)}${Lg(" µm ที่ ", " µm at ")}${kPa(st.p)}${Lg(" (สีเข้ม = ยุบมาก, วงแดงหนา = dome ที่แตะ)", " (darker = more deflection, thick red ring = dome in contact)")}`;
  // stack table
  const L = PH.stackLayers(P);
  $("#stack-table").innerHTML = `${Lg("<table><tr><th>ชั้น (บน→ล่าง)</th><th>วัสดุ</th><th>หนา (µm)</th><th>E (MPa)</th><th>εr</th><th>ที่มาของค่า</th></tr>", "<table><tr><th>layer (top→bottom)</th><th>material</th><th>thickness (µm)</th><th>E (MPa)</th><th>εr</th><th>source of value</th></tr>")}` +
    L.map(l => `<tr><td>${l.name}</td><td>${l.name === "Dielectric" ? P.diel_mat + (P.porosity ? `${Lg(" (พรุน ", " (porous ")}${(P.porosity * 100).toFixed(0)}%)` : "") : (l.name === "E3" ? (P.e2_type === "Resin-CNT (print)" ? "Resin-CNT (print)" : "Sputtered Cu (thin)") : l.name.startsWith("E") ? P[l.name === "E1" ? "e1_type" : "e2_type"] : l.name === "Piezo film" ? P.cover_mat : "Polyimide")}</td><td>${(l.t * 1e6).toFixed(1)}</td><td>${(+l.mat.E).toPrecision(3)}</td><td>${l.mat.er}</td><td class="note">${Ld(l.mat, "src") || ""}</td></tr>`).join("") +
    `${Lg("</table><p class=\"note\">ความแข็งดัด D = ", "</table><p class=\"note\">Bending stiffness D = ")}${MODEL.PF.D.toExponential(2)} N·m (${P.stack_bond === "composite" ? Lg("ชั้นยึดกันสนิท — upper bound", "layers fully bonded — upper bound") : Lg("แต่ละชั้นดัดอิสระ — lower bound", "each layer bends independently — lower bound")}${Lg("). stack ยิ่งแข็ง dome ยิ่งแตะช้า → dead-zone ของช่อง R กว้างขึ้น</p>", "). The stiffer the stack, the later the domes touch → wider channel R dead zone</p>")}`;
}

function tabCNT() {
  const ws = []; for (let w = 0; w <= 10.001; w += 0.1) ws.push(w);
  const sig = ws.map(w => [w, PH.cntConductivity({ ...P, cnt_wt: w }).sigma / 100]);
  chart("c-sig", { ylog: 1, xlabel: "MWCNT (wt%)", ylabel: "σ (S/cm)", title: Lg("การนำไฟฟ้าของ resin-CNT (percolation)", "Resin-CNT conductivity (percolation)") }).set([
    { name: "model", color: COL.pzr, pts: sig },
    { name: Lg("ค่าที่เลือก", "chosen value"), color: COL.ink, marker: 1, size: 5, pts: [[P.cnt_wt, PH.cntConductivity(P).sigma / 100]] },
  ], [{ x: 5, color: COL.grey, label: "Zaki 5 wt%" }]);
  const exp = ws.filter(w => w >= 0.5).map(w => [w, PH.cntPrinting({ ...P, cnt_wt: w }).tNeed]);
  chart("c-exp", { ylog: 1, xlabel: "MWCNT (wt%)", ylabel: Lg("เวลาฉาย (s)", "Exposure time (s)"), title: `${Lg("เวลาฉายที่ต้องใช้เพื่อให้ได้ชั้น ", "Exposure time needed for a layer of ")}${P.cnt_t_um} µm` }).set([
    { name: "model (Jacobs)", color: COL.hyb, pts: exp },
    { name: Lg("Zaki: 350 s ที่ 5 wt%", "Zaki: 350 s at 5 wt%"), color: COL.ink, marker: 1, size: 5, pts: [[5, 350]] },
  ]);
  const ts = []; for (let k = 0; k <= 80; k++) ts.push(0.1 * Math.pow(10000, k / 80));
  const pr = PH.cntPrinting(P);
  chart("c-cure", { xlog: 1, xlabel: Lg("เวลาฉาย (s)", "Exposure time (s)"), ylabel: Lg("ความลึกที่แข็ง (µm)", "Cured depth (µm)"), title: "Working curve: TPU vs resin-CNT" }).set([
    { name: "TPU resin", color: "#B8962E", pts: ts.map(t => [t, PH.cureDepth(P.Dp_tpu, P.T0_tpu, t)]) },
    { name: `resin-CNT ${P.cnt_wt} wt%`, color: COL.pzr, pts: ts.map(t => [t, PH.cureDepth(pr.Dp, pr.tc, t)]) },
    { name: Lg("AFM Fig. 2G resin-CNT (อ่านจากกราฟ ≈)", "AFM Fig. 2G resin-CNT (read from graph ≈)"), color: COL.ink, marker: 1, pts: [[10, 10], [50, 17], [100, 20], [600, 47]] },
    { name: Lg("AFM Fig. 2G TPU (อ่านจากกราฟ ≈)", "AFM Fig. 2G TPU (read from graph ≈)"), color: COL.grey, marker: 1, pts: [[0.5, 115], [1, 230], [2, 325], [3, 425], [4, 480], [4.5, 485]] },
    { name: Lg("AFM p.6: 20 µm ที่ 350 s", "AFM p.6: 20 µm at 350 s"), color: COL.red, marker: 1, size: 5, pts: [[350, 20]] },
  ]);
  const c = PH.cntConductivity(P), rho = 1 / c.sigma, Rs = rho / (P.cnt_t_um * 1e-6);
  const gs = [[Lg("กลาง", "centre"), P.h_center_um], [Lg("ขอบ", "edge"), P.h_edge_um], [Lg("มุม", "corner"), P.h_corner_um]].map(([n, h]) => { const g = PH.grayForHeight(h, P); return `<tr><td>dome ${n}</td><td>${h} µm</td><td class="${g > 255 ? "bad" : ""}">${g > 255 ? Lg("เกิน 255 — ต้องฉายนานขึ้น", "above 255 — needs a longer exposure") : g.toFixed(0)}</td></tr>`; }).join("");
  $("#cnt-info").innerHTML = `${Lg("\n    <table><tr><th>ปริมาณ</th><th>ค่า</th></tr>\n    <tr><td>สัดส่วนปริมาตร CNT</td><td>", "\n    <table><tr><th>Quantity</th><th>Value</th></tr>\n    <tr><td>CNT volume fraction</td><td>")}${(c.phi * 100).toFixed(2)} vol%</td></tr>
    <tr><td>conductivity σ</td><td>${(c.sigma / 100).toExponential(2)}${Lg(" S/cm</td></tr>\n    <tr><td>sheet resistance (หนา ", " S/cm</td></tr>\n    <tr><td>sheet resistance (thickness ")}${P.cnt_t_um} µm)</td><td>${fmtSI(Rs, "Ω/□")}${Lg("</td></tr>\n    <tr><td>R ของ film ถึง pad (", "</td></tr>\n    <tr><td>Film R to the pad (")}${P.film_sq} □)</td><td>${fmtSI(Rs * P.film_sq, "Ω")}${Lg(" <span class=\"note\">(ค่า fit กับกระแสของ MEMS 2026 · AFM 2025 Fig. 6C วัด two-point ได้ 20.53 kΩ ซึ่งเป็นการวัดคนละแบบ)</span></td></tr>\n    <tr><td>Dp ของ resin-CNT</td><td>", " <span class=\"note\">(fitted to the MEMS 2026 current · AFM 2025 Fig. 6C measured 20.53 kΩ two-point, a different measurement)</span></td></tr>\n    <tr><td>Dp of resin-CNT</td><td>")}${pr.Dp.toFixed(1)}${Lg(" µm</td></tr>\n    <tr><td>เวลาฉายเพื่อให้ได้ ", " µm</td></tr>\n    <tr><td>Exposure time for ")}${P.cnt_t_um} µm</td><td>${pr.tNeed.toFixed(0)}${Lg(" s</td></tr></table>\n    <h4>Grayscale ที่ต้องใช้สำหรับ dome แต่ละความสูง (ฉาย ", " s</td></tr></table>\n    <h4>Grayscale needed for each dome height (single exposure of ")}${P.t_exp_tpu}${Lg(" s ครั้งเดียว)</h4>\n    <table><tr><th>dome</th><th>ความสูง</th><th>ค่า G (0–255)</th></tr>", " s)</h4>\n    <table><tr><th>dome</th><th>height</th><th>G value (0–255)</th></tr>")}${gs}${Lg("</table>\n    <p class=\"note\">สูตร z = Dp·ln(t·G/(T₀·255)) จาก Zaki AFM 2025 · AFM 2025 p.3 ใช้ G = 220 / 160 / 55 สำหรับ 650 / 550 / 400 µm (รูป Fig. 2B เขียน 240 / 160 / 50)</p>", "</table>\n    <p class=\"note\">Formula z = Dp·ln(t·G/(T₀·255)) from Zaki AFM 2025 · AFM 2025 p.3 uses G = 220 / 160 / 55 for 650 / 550 / 400 µm (Fig. 2B shows 240 / 160 / 50)</p>")}`;
}

function tabReadout() {
  const st = LIVE || computeLive();
  const R = st.Rlive, C = st.CA, fs = []; for (let k = 0; k <= 120; k++) fs.push(10 * Math.pow(1e8, k / 120));
  const Z = fs.map(f => PH.impedanceA(R, C, f));
  chart("c-bode", { xlog: 1, ylog: 1, xlabel: Lg("ความถี่ (Hz)", "Frequency (Hz)"), ylabel: "|Z| (Ω)", title: `${Lg("ช่อง A ที่ ", "Channel A at ")}${kPa(st.p)}${Lg(": |Z| ของ R ∥ C_A", ": |Z| of R ∥ C_A")}` }).set([
    { name: "|Z|", color: COL.pzr, pts: fs.map((f, i) => [f, Math.hypot(Z[i].re, Z[i].im)]) },
  ], [{ x: 1 / (2 * Math.PI * R * C), color: COL.red, label: "corner 1/2πRC" }, { x: 1e6, color: COL.grey, label: Lg("LCR ทั่วไป ~1 MHz", "typical LCR ~1 MHz") }]);
  chart("c-phase", { xlog: 1, xlabel: Lg("ความถี่ (Hz)", "Frequency (Hz)"), ylabel: "phase (°)", title: "phase", yrange: [-95, 5] }).set([
    { name: "phase", color: COL.hyb, pts: fs.map((f, i) => [f, Math.atan2(Z[i].im, Z[i].re) * 180 / Math.PI]) },
  ]);
  const ra = PH.readoutA(R, P), sC = PH.cNoise(P), fr = frameRates(st.CB.C), nT = fr.nT, tC = fr.tC;
  const frameR = fr.R, frameC = fr.C, frameBoth = fr.both;
  const ok = f => f >= 50 ? `<span class="good">${f.toFixed(f < 10 ? 2 : 0)} Hz ✓</span>` : `<span class="bad">${f.toFixed(f < 10 ? 2 : 1)} Hz ✗</span>`;
  $("#rd-info").innerHTML = `${Lg("\n  <div class=\"two\">\n  <div><h4>ช่อง A — voltage divider → ADC</h4><table>\n    <tr><td>R ที่ ", "\n  <div class=\"two\">\n  <div><h4>Channel A — voltage divider → ADC</h4><table>\n    <tr><td>R at ")}${kPa(st.p)}</td><td>${fmtSI(R, "Ω")}</td></tr>
    <tr><td>V_out = V_b·R_ref/(R_ref+R)</td><td>${ra.Vout.toFixed(4)} V</td></tr>
    <tr><td>ADC counts</td><td>${ra.counts.toFixed(1)} / ${2 ** P.adc_bits}${Lg("</td></tr>\n    <tr><td>กระแส (tactile switch)</td><td>", "</td></tr>\n    <tr><td>Current (tactile switch)</td><td>")}${fmtSI(ra.I, "A")}${Lg("</td></tr>\n    <tr><td>ช่วงกระแสทั้งหมด</td><td>", "</td></tr>\n    <tr><td>Total current range</td><td>")}${fmtSI(P.Vb / P.R_leak, "A")} → ${fmtSI(P.Vb / SWEEP.pts[SWEEP.pts.length - 1].R, "A")} (${Math.log10(P.R_leak / SWEEP.pts[SWEEP.pts.length - 1].R).toFixed(1)}${Lg(" decade) — ADC เชิงเส้นตัวเดียวเก็บไม่หมด ใช้ log-amp หรือสลับ R_ref</td></tr></table></div>\n  <div><h4>ช่อง B — ", " decades) — one linear ADC cannot cover it; use a log-amp or switch R_ref</td></tr></table></div>\n  <div><h4>Channel B — ")}${P.c_method}${Lg("</h4><table>\n    <tr><td>C_B ที่ ", "</h4><table>\n    <tr><td>C_B at ")}${kPa(st.p)}</td><td>${(st.CB.C * 1e12).toFixed(3)}${Lg(" pF</td></tr>\n    <tr><td>noise ของ C (1σ)</td><td>", " pF</td></tr>\n    <tr><td>C noise (1σ)</td><td>")}${fmtSI(sC, "F")}${Lg("</td></tr>\n    <tr><td>ช่วงวัด</td><td>", "</td></tr>\n    <tr><td>Range</td><td>")}${PH.cRangeOK(P, st.CB.C)}${Lg("</td></tr>\n    <tr><td>เวลาต่อ taxel</td><td>", "</td></tr>\n    <tr><td>Time per taxel</td><td>")}${fmtSI(tC, "s")}${Lg("</td></tr>\n    <tr><td>RC ช่อง A (E1–CNT)</td><td>", "</td></tr>\n    <tr><td>Channel A RC (E1–CNT)</td><td>")}${fmtSI(R * C, "s")} → corner ${fmtSI(1 / (2 * Math.PI * R * C), "Hz")}${Lg("</td></tr></table></div></div>\n  <h4>อ่านทั้ง array ", "</td></tr></table></div></div>\n  <h4>Reading the whole array of ")}${P.rows} × ${P.cols} = ${nT}${Lg(" taxel (เป้าหมายของ robot: 50–100 Hz)</h4>\n  <table><tr><th>อ่านอะไร</th><th>frame rate</th></tr>\n    <tr><td>R อย่างเดียว</td><td>", " taxels (robot target: 50–100 Hz)</h4>\n  <table><tr><th>What is read</th><th>frame rate</th></tr>\n    <tr><td>R only</td><td>")}${ok(frameR)}${Lg("</td></tr><tr><td>C อย่างเดียว (", "</td></tr><tr><td>C only (")}${P.c_method})</td><td>${ok(frameC)}${Lg("</td></tr>\n    <tr><td>R + C สลับกัน (MCU ตัวเดียว)</td><td>", "</td></tr>\n    <tr><td>R + C alternating (one MCU)</td><td>")}${ok(frameBoth)}${Lg("</td></tr></table>\n  <p class=\"note\">AD7745 มี 1 ช่อง อ่านได้ ~90 Hz ต่อ taxel → ใช้กับ array ใหญ่ไม่ไหว ถ้าจะได้ 50 Hz กับ ", "</td></tr></table>\n  <p class=\"note\">The AD7745 has 1 channel at ~90 Hz per taxel → too slow for a large array. For 50 Hz with ")}${nT}${Lg(" taxel ต้องใช้เวลา ≤ ", " taxels each read must take ≤ ")}${fmtSI(1 / (50 * nT), "s")}${Lg(" ต่อ taxel → ใช้ charge-time หลายช่องขนานกัน, touch-controller IC หรือ lock-in ที่ความถี่สูง</p>", " → use parallel charge-time channels, a touch-controller IC, or high-frequency lock-in</p>")}`;
}

function tabTime() {
  const T = { dt_s: +$("#t-dt").value, hold_min: +$("#t-hold").value, p_kPa: +$("#t-p").value, dT: +$("#t-dT").value, tau_f: +$("#t-tau").value };
  if (!TIME || TIME.key !== JSON.stringify([T, P])) { TIME = { key: JSON.stringify([T, P]), d: PH.timeSim(MODEL, SWEEP, T), T }; }
  const d = TIME.d;
  chart("c-est", { xlabel: Lg("เวลา (นาที)", "Time (min)"), ylabel: Lg("แรงที่ประมาณได้ (kPa)", "Estimated force (kPa)"), title: Lg("กดค้างด้วยแรงคงที่: แต่ละช่องประมาณแรงได้เท่าไร (ใช้ calibration ตอน t = 0)", "Constant held force: what each channel estimates (calibration at t = 0)") }).set([
    { name: Lg("แรงจริง", "true force"), color: COL.ink, dash: [4, 4], pts: d.map(r => [r.t / 60, r.ptrue / 1e3]) },
    { name: Lg("จาก R (ช่อง A)", "from R (channel A)"), color: COL.pzr, pts: d.map(r => [r.t / 60, r.FR / 1e3]) },
    { name: Lg("จาก C_B (ช่อง B)", "from C_B (channel B)"), color: COL.cap, pts: d.map(r => [r.t / 60, r.FC / 1e3]) },
    { name: Lg("รวมแบบ complementary (กฎข้อ 3)", "complementary fusion (rule 3)"), color: COL.hyb, width: 3, pts: d.map(r => [r.t / 60, r.FF / 1e3]) },
  ]);
  const last = d[d.length - 1], e = v => ((v / last.ptrue - 1) * 100).toFixed(1) + "%";
  $("#time-info").innerHTML = `${Lg("<table><tr><th>ช่อง</th><th>error ตอนท้าย (", "<table><tr><th>Channel</th><th>final error (")}${T.hold_min}${Lg(" นาที)</th></tr>\n    <tr><td>R อย่างเดียว</td><td>", " min)</th></tr>\n    <tr><td>R only</td><td>")}${e(last.FR)}${Lg("</td></tr><tr><td>C_B อย่างเดียว</td><td>", "</td></tr><tr><td>C_B only</td><td>")}${e(last.FC)}${Lg("</td></tr><tr><td>รวม (complementary)</td><td>", "</td></tr><tr><td>fused (complementary)</td><td>")}${e(last.FF)}${Lg("</td></tr></table>\n    <p class=\"note\">ลองตั้ง creep ของ dielectric = 0 (จำลอง C ที่วัดผ่าน air gap) แล้วดูว่าการรวมช่วยลด error ได้จริงไหม · ถ้า creep ของ TPU และ dielectric เท่ากัน สองช่องจะคลาดไปทางเดียวกัน (common-mode) การรวมจึงช่วยไม่ได้</p>", "</td></tr></table>\n    <p class=\"note\">Try dielectric creep = 0 (a C measured across an air gap) and see whether fusion really reduces the error · if TPU and dielectric creep equally, both channels drift the same way (common mode) and fusion cannot help</p>")}`;
}

// ------------------------------------------------------------- data I/O
function tabData() {}
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/); const head = lines[0].toLowerCase().split(/[,;\t]/).map(s => s.trim());
  const ix = k => head.findIndex(h => h.startsWith(k));
  const ip = ix("p"), iR = ix("r"), iC = ix("c"), iI = ix("i");
  if (ip < 0) throw new Error(Lg("ต้องมีคอลัมน์ p_kPa", "a p_kPa column is required"));
  return lines.slice(1).map(l => { const v = l.split(/[,;\t]/).map(Number); return { p: v[ip], R: iR >= 0 ? v[iR] : null, C: iC >= 0 ? v[iC] : null, I: iI >= 0 ? v[iI] : null }; }).filter(r => isFinite(r.p));
}
function fitParam(key, lo, hi, errFn) {        // 1-D log grid + golden refine
  const keep = P[key]; let best = keep, be = Infinity;
  for (let k = 0; k <= 40; k++) { const v = lo * Math.pow(hi / lo, k / 40); P[key] = v; if (HEAVY.has(key)) MODEL = PH.buildModel(P); const s = PH.sweep(MODEL, { npts: 40 }); const e = errFn(s); if (e < be) { be = e; best = v; } }
  P[key] = +best.toPrecision(3); needModel = true; return { best: P[key], err: be };
}
function interpLog(pts, p, f, logy) { const s = pts; let k = 1; while (k < s.length - 1 && s[k].p < p) k++; const a = s[k - 1], b = s[k]; const t = (Math.log(p) - Math.log(a.p)) / (Math.log(b.p) - Math.log(a.p)); const ya = f(a), yb = f(b); return logy ? Math.exp(Math.log(ya) + t * (Math.log(yb) - Math.log(ya))) : ya + t * (yb - ya); }
function download(name, text, type = "text/plain") { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); }

function wireData() {
  $("#csv-file").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    try { MEAS = parseCSV(await f.text()); $("#data-msg").textContent = `${Lg("โหลด ", "loaded ")}${MEAS.length}${Lg(" จุดแล้ว — ดูในแท็บ \"สัญญาณ vs แรง\"", " points — see the \"Signal vs force\" tab")}`; renderTab("sig"); }
    catch (err) { $("#data-msg").textContent = Lg("อ่านไฟล์ไม่ได้: ", "cannot read the file: ") + err.message; }
  });
  $("#fit-R").addEventListener("click", () => {
    if (!MEAS || !MEAS.some(m => m.R || m.I)) { $("#data-msg").textContent = Lg("ต้องมีคอลัมน์ R_ohm หรือ I_A", "an R_ohm or I_A column is required"); return; }
    const pairs = MEAS.map(m => ({ p: m.p * 1e3, R: m.R || (m.I ? P.Vb / m.I : null) })).filter(m => m.R);
    const err = s => pairs.reduce((a, m) => a + (Math.log(interpLog(s.pts, m.p, q => q.R, true)) - Math.log(m.R)) ** 2, 0);
    const r1 = fitParam("rho_t", 1e-8, 1e-2, err), r2 = fitParam("film_sq", 0.02, 5, err);
    $("#data-msg").textContent = `${Lg("fit แล้ว: ρₜ = ", "fitted: ρₜ = ")}${r1.best} Ω·m², film = ${r2.best} □ (log-RMS error ${Math.sqrt(r2.err / pairs.length).toFixed(2)})`;
    buildControls(); recompute();
  });
  $("#fit-C").addEventListener("click", () => {
    if (!MEAS || !MEAS.some(m => m.C)) { $("#data-msg").textContent = Lg("ต้องมีคอลัมน์ C_pF", "a C_pF column is required"); return; }
    const pairs = MEAS.filter(m => m.C).map(m => ({ p: m.p * 1e3, C: m.C * 1e-12 }));
    const err = s => pairs.reduce((a, m) => a + ((interpLog(s.pts, m.p, q => q.CB) - m.C) / m.C) ** 2, 0);
    const r1 = fitParam("C_par_pF", 0.01, 30, err), r2 = fitParam("porosity", 0.01, 0.85, err);
    $("#data-msg").textContent = `${Lg("fit แล้ว: parasitic = ", "fitted: parasitic = ")}${r1.best} pF, porosity = ${r2.best} (RMS error ${(Math.sqrt(r2.err / pairs.length) * 100).toFixed(1)}%)`;
    buildControls(); recompute();
  });
  $("#exp-csv").addEventListener("click", () => {
    const rows = ["p_kPa,R_ohm,I_A,CA_pF,CB_pF,dielectric_um,plate_center_um,domes_in_contact"];
    SWEEP.pts.forEach(q => rows.push([q.p / 1e3, q.R, P.Vb / q.R, q.CA * 1e12, q.CB * 1e12, q.tB * 1e6, q.wc * 1e6, q.nContact].map(v => +(+v).toPrecision(6)).join(",")));
    download("taxel_sweep.csv", rows.join("\n"), "text/csv");
  });
  $("#exp-json").addEventListener("click", () => download("taxel_params.json", JSON.stringify(P, null, 2), "application/json"));
  $("#imp-json").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; P = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), JSON.parse(await f.text())); needModel = true; buildControls(); syncView(); recompute(); });
  $("#reset").addEventListener("click", () => { P = JSON.parse(JSON.stringify(DEFAULTS)); needModel = true; buildControls(); syncView(); recompute(); });
  $("#sample").addEventListener("click", () => download("example_measurement.csv", "p_kPa,R_ohm,C_pF\n35,4.2e8,\n50,1.1e6,3.95\n100,6.0e4,4.4\n200,3.6e4,5.3\n300,3.0e4,6.2\n", "text/csv"));
}

// ------------------------------------------------------------- boot
function syncView() { $("#pview").value = Math.log10(Math.max(1e-3, P.p_view_kPa)); $("#pview-n").value = P.p_view_kPa; }
window.addEventListener("DOMContentLoaded", () => {
  buildControls(); wireData();
  $("#o-freq").value = Math.log10(P.f_exc_kHz); $("#o-freq-v").textContent = fmtSI(P.f_exc_kHz * 1e3, "Hz");
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => renderTab(b.dataset.t)));
  const pv = $("#pview"), pn = $("#pview-n");
  pv.addEventListener("input", () => { Stage.stopAnim(true); P.p_view_kPa = +Math.pow(10, +pv.value).toPrecision(3); pn.value = P.p_view_kPa; renderView(); clearTimeout(tabT); tabT = setTimeout(() => renderTab(currentTab), 60); });
  pn.addEventListener("change", () => { Stage.stopAnim(true); P.p_view_kPa = Math.max(0.001, +pn.value || 0.001); pv.value = Math.log10(P.p_view_kPa); renderAll(); });
  $("#t-run").addEventListener("click", () => { TIME = null; tabTime(); });
  Stage.init(); Optimizer.init();
  const ps = $("#preset"); ps.innerHTML = Object.keys(PRESETS).map(k => `<option>${k}</option>`).join("");
  ps.addEventListener("change", () => { P = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), PRESETS[ps.value], { p_view_kPa: P.p_view_kPa }); needModel = true; buildControls(); syncView(); recompute(); });
  const dts = $("#env-dT"); dts.addEventListener("input", () => { P.dT_K = +dts.value; $("#env-dT-v").textContent = (P.dT_K > 0 ? "+" : "") + P.dT_K + " K"; const row = document.querySelector('.prow[data-k="dT_K"]'); if (row) row.querySelectorAll("input").forEach(i => i.value = P.dT_K); renderView(); clearTimeout(tabT); tabT = setTimeout(() => renderTab(currentTab), 60); });
  syncView(); recompute();
});
