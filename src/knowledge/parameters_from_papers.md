# parameters_from_papers.md — ที่มาของทุก parameter ใน simulator

กติกา: ทุกค่าต้องชี้ไปที่หน้า/รูป/ตารางของ paper ในโฟลเดอร์ หรือถูกทำเครื่องหมาย **⚠ not in papers — needs measurement**
"อ่านจากกราฟ" = ประมาณด้วยสายตา (±10–20 %) · "needs verification" = paper ไม่ชัดหรือขัดกันเอง

รายละเอียดของแต่ละ paper:
[zaki_afm_2025.md](zaki_afm_2025.md) · [zaki_mems_2026.md](zaki_mems_2026.md) · [zaki_mems_2025_sdlp.md](zaki_mems_2025_sdlp.md) · [yin_2024_three_axis_capacitive.md](yin_2024_three_axis_capacitive.md) · [wang_2022_gradient_pore.md](wang_2022_gradient_pore.md) · [wang_2023_gpphs.md](wang_2023_gpphs.md) · [zhan_2025_review.md](zhan_2025_review.md) · [li_review_tactile_information.md](li_review_tactile_information.md) · [su_2015_grip_control.md](su_2015_grip_control.md) · [speaker_notes_hybrid_reasoning.md](speaker_notes_hybrid_reasoning.md)

## 1. Geometry ของ dome (ช่อง A)

| parameter | default | ที่มา | สถานะ |
|---|---|---|---|
| `taxel_mm` | 4.05 mm | MEMS 2026 abstract + Fig. 2b (a = 4050 µm) | ✔ |
| `border_mm` | 0.65 mm | MEMS 2026 Fig. 2b (b = 650 µm) | ✔ (เดิม 0.6) |
| `dome_d_um` | 750 µm | MEMS 2026 Fig. 2b (d); AFM 2025 p.6 | ✔ |
| `pitch_um` | 900 µm | MEMS 2026 Fig. 2b: d + e = 750 + 150 | ✔ |
| `h_center_um` | 650 µm | AFM 2025 p.3–5, Fig. 2F; MEMS 2026 Fig. 2b (f) | ✔ |
| `h_edge_um` | 550 µm | AFM 2025 Fig. 2F; MEMS 2026 Fig. 2b (g) | ✔ ค่า · ตำแหน่งใน 3×3 needs verification |
| `h_corner_um` | 400 µm | AFM 2025 Fig. 2F | MEMS 2026 ไม่ระบุระดับที่สาม → needs verification |
| `gap_um` | 30 µm | MEMS 2026 p.2, Fig. 2b: border 680 − dome 650 | ✔ (เดิม 60) · 60 µm ของ AFM 2025 Fig. 3B เป็น gap ระหว่าง dome สองชั้น (2 × 30) |
| `cnt_t_um` | 20 µm | AFM 2025 p.5, Fig. 2F(ii); MEMS 2025 p.2 | ✔ |
| `pdms_um` (วาดอย่างเดียว) | 400 µm | AFM 2025 p.6, p.14 | ✔ |
| `tpu_floor_um` (วาดอย่างเดียว) | 100 µm | — | ⚠ not in papers — needs measurement (วัดจาก SEM) |

## 2. วัสดุ dome + resin-CNT

| parameter | default | ที่มา | สถานะ |
|---|---|---|---|
| `E_tpu_MPa` | 8 MPa | — | ⚠ not in papers — needs measurement |
| `nu_tpu` | 0.45 | — | ⚠ not in papers — needs measurement |
| `cnt_wt` | 5 wt% | AFM 2025 p.6 (เลือกจาก conductivity + viscosity) | ✔ |
| `rho_cnt` | 1.8 g/cm³ | — | ⚠ not in papers (ใช้แปลง wt% → vol% เท่านั้น) |
| `rho_resin` | 1.15 g/cm³ | — | ⚠ not in papers |
| `phi_c` | 0.3 vol% | AFM 2025 Fig. 2I: threshold อยู่ระหว่าง 0.5–1 wt% | ช่วงจาก paper · ค่าที่เลือกเป็น fit → needs verification |
| `t_perc` | 2.0 | ทฤษฎี percolation 3D | ⚠ not in papers |
| `sigma0` | 460 S/m | fit ให้ σ(5 wt%) ≈ 4×10⁻³ S/cm = AFM 2025 Fig. 2I (อ่านจากกราฟ) · ได้ 1 wt% → 5.4×10⁻⁵ (กราฟ ~5×10⁻⁵), 10 wt% → 1.8×10⁻² (กราฟ ~2×10⁻²) | ✔ fit กับ paper (เดิม 1150 → 10⁻² S/cm) · ข้อความ p.6 เขียน ≈10⁻³ → needs verification |
| `rho_t` | 1×10⁻⁵ Ω·m² | — | ⚠ not in papers — fit จากค่าวัด I–P |
| `H_asp_MPa` | 2 MPa | — | ⚠ not in papers — needs measurement |
| `film_sq` | 0.16 □ | ปรับให้ R ของ film ≈ 20 kΩ ≈ 20.53 kΩ (AFM 2025 p.11, Fig. 6C) | fit (เดิม 0.4 กับ σ เดิม) · 20.53 kΩ วัดบน taxel 4.25 mm ของ array 5 × 5 |
| `R_leak` | 5×10⁹ Ω | I₀ ≈ 10⁻⁹ A ที่ 5 V (AFM 2025 Fig. 3F; MEMS 2026 p.3) | ✔ |

## 3. Stack capacitive (ช่อง B) — เป็นข้อเสนอของทีม ยังไม่มีใน paper ของ lab

| parameter | default | ที่มา | สถานะ |
|---|---|---|---|
| `cover_um` | 25 µm | — | ⚠ not in papers |
| `e1_type`, `e2_type` | Copper (FPC) 12 µm | MEMS 2026 ระบุแค่ "PI-based electrode" | ⚠ ชนิด/ความหนาโลหะ not in papers |
| `diel_mat` | PDMS Sylgard 184 | Yin 2024 ใช้ PDMS 10:1 เป็น dielectric (p.3) | แนวคิดจาก paper · ค่า E, εr เป็นค่าทั่วไป ⚠ |
| `diel_um` | 100 µm | — (Yin 2024: 300–1800 µm, ดีที่สุด 1200 µm) | ⚠ ตัวแปรออกแบบ |
| `porosity` | 0.5 | แนวคิดจาก Wang 2022 (gradient pore) | ⚠ ตัวแปรออกแบบ |
| `base_um` | 25 µm | MEMS 2026 p.2 (มี PI แต่ไม่บอกความหนา) | ⚠ needs measurement |
| `stack_bond` | independent | — | ⚠ สมมติฐาน (lower bound) |
| `elec_frac` | 1.0 | — | ⚠ ตัวแปรออกแบบ |
| `C_par_pF` | 1.0 pF | — | ⚠ not in papers — วัด baseline |
| ค่าใน `MATERIALS` (E, ν, εr) | ดู physics.js | ค่าทั่วไป/datasheet | ⚠ not in papers |

## 4. สิ่งแวดล้อม / creep / drift

| parameter | default | ที่มา | สถานะ |
|---|---|---|---|
| `TCR` | −0.2 %/K | — | ⚠ not in papers |
| `TCC` | 0.02 %/K | — | ⚠ not in papers |
| `drift_pct` | 3 %/decade | Fonseca 2023 (Velostat 5.8 %/log min) อ้างใน speaker notes สไลด์ 16 — paper ไม่อยู่ในโฟลเดอร์ | ⚠ ค่าเดา |
| `creep_tpu`, `tau_tpu_min` | 10 %, 5 min | — | ⚠ not in papers |
| `creep_diel`, `tau_diel_min` | 10 %, 5 min | — | ⚠ not in papers |

## 5. วงจรอ่านค่า

| parameter | default | ที่มา | สถานะ |
|---|---|---|---|
| `Vb` | 1.0 V | AFM 2025 p.8: ทดสอบ 0.01–5 V | ✔ อยู่ในช่วง |
| `R_ref`, `adc_bits`, `Vref`, `adc_noise_lsb`, `t_adc_us` | 100 kΩ, 12, 3.3 V, 1 LSB, 20 µs | — | ⚠ ตัวแปรออกแบบวงจร |
| `c_method` | AD7745 | Yin 2024 p.5 | ✔ |
| `cdc_rate_Hz` | 90 Hz | Yin 2024 p.5: 10–90 Hz | ✔ |
| `cdc_noise_aF` | 20 aF | datasheet AD7745 (ไม่อยู่ในโฟลเดอร์) | ⚠ needs verification |
| ช่วง AD7745 ใน `cRangeOK` | ±4 pF + bias 17 pF | Yin 2024 p.5 | ✔ |
| `mcu_clk_MHz`, `R_charge_k` | 16 MHz, 1 MΩ | — | ⚠ ตัวแปรออกแบบ |
| `lockin_noise_fF`, `f_exc_kHz`, `lockin_periods` | 1 fF, 100 kHz, 10 | — | ⚠ ตัวแปรออกแบบ |
| `rows`, `cols` | 16, 9 | MEMS 2026 p.1, Fig. 4 | ✔ |
| `array_gap_mm` | 1.925 mm | MEMS 2026 p.4 (→ 5.98 mm/pixel) | Fig. 4a/p.3 เขียน 1.5 mm → needs verification |
| เป้า frame rate 50–100 Hz | — | speaker notes สไลด์ 4 ("ค่าทั่วไป") · Su 2015 p.4: controller 300 Hz | ไม่ใช่ข้อกำหนดตายตัว |

## 6. การพิมพ์ (Jacobs)

| parameter | default | ที่มา | สถานะ |
|---|---|---|---|
| `t_exp_tpu` | 6 s | AFM 2025 p.6: 4–6 s | ✔ |
| `Dp_tpu`, `T0_tpu` | 200 µm, 0.2 s | fit ให้ G = 220 → 650 µm ที่ 6 s · กราฟ Fig. 2G (ฟิล์มเรียบ) ให้ Dp ≈ 180 µm, T₀ ≈ 0.28 s ซึ่งให้ dome 650 µm ไม่ได้ที่ 6 s → paper ขัดกันเอง | needs verification (ไม่เปลี่ยน) |
| `Dp_resin`, `tc0` | 200 µm, 2 s | — | ⚠ สมมติ |
| `kD`, `beta_tc` | 0.6 µm⁻¹, 89.3 | fit ให้ 20 µm ที่ 350 s (AFM p.6) และ 50 µm ที่ 1000 s | จุดที่สอง **ไม่พบใน paper** · กราฟ Fig. 2G: ~20 µm ที่ 100 s, ~47 µm ที่ 600 s · p.14: 60 µm ที่ 500 s → needs verification (ไม่เปลี่ยน) |
| grayscale 220 / 160 / 55 | (แสดงผล) | AFM 2025 p.3 · Fig. 2B เขียน 240 / 160 / 50 | needs verification |

## 7. การคำนวณ
`p_max_kPa`, `fd_n`, `ca_grid`, `p_view_kPa` — ค่าตั้งของ numerical model ไม่เกี่ยวกับ paper

## 8. ค่า default ที่เปลี่ยนในรอบนี้

| parameter | เดิม | ใหม่ | เหตุผล |
|---|---|---|---|
| `gap_um` | 60 | **30** | MEMS 2026 Fig. 2b: border 680 µm − dome 650 µm · 60 µm ของ AFM 2025 Fig. 3B วัดระหว่าง dome สองชั้นที่หันเข้าหากัน แต่ simulator เป็น dome ชั้นเดียวกับ electrode แบน |
| `border_mm` | 0.6 | **0.65** | MEMS 2026 Fig. 2b ระบุ b = 650 µm |
| `sigma0` | 1150 | **460** | เดิมให้ 10⁻² S/cm ที่ 5 wt% · กราฟ AFM 2025 Fig. 2I อ่านได้ ~4×10⁻³ S/cm |
| `film_sq` | 0.4 | **0.16** | คง R ของ film ≈ 20 kΩ (AFM Fig. 6C: 20.53 kΩ) หลังเปลี่ยน σ |
| `array_gap_mm` (ใหม่) | — | 1.925 | MEMS 2026 p.4 · ใช้ในมุมมอง array |
| `pdms_um`, `tpu_floor_um` (ใหม่) | — | 400, 100 | ใช้วาดรูปเท่านั้น · 400 µm จาก AFM p.6 · 100 µm ⚠ |
| จุดข้อมูลในกราฟ working curve | (350 s, 20 µm), (1000 s, 50 µm) | จุดที่อ่านจาก Fig. 2G + (350 s, 20 µm) | จุด 1000 s ไม่มีใน paper |

## 9. ข้อสังเกต: model เทียบกับ paper (ยังไม่ตรง)
- model (default ใหม่) ให้ dome แรกแตะที่ ~17.7 kPa · MEMS 2026 รายงานช่วง linear เริ่มที่ 1 kPa → ความแข็งของแผ่นบน (PI + electrode จริงบางกว่า stack hybrid) และ `E_tpu_MPa` ต้องวัด
- model ให้ I ≈ 1.2×10⁻⁴ A ที่ 1000 kPa, 5 V · MEMS 2026 Fig. 3d อ่านได้ ~2.5×10⁻⁴ A → อันดับเดียวกัน
- sensitivity (ΔI/I₀)/P ของ AFM 2025 (10,692 kPa⁻¹) วัดบน sensor สองชั้น 11 × 11 mm ไม่ใช่ taxel 4.05 mm เดี่ยว เทียบกับ model ตรง ๆ ไม่ได้

## 10. เพิ่มในรอบ v2 (2026-10-12): large deflection, piezo, อุณหภูมิ, ตัวหาค่าที่ดีที่สุด

ที่มาอยู่ในไฟล์ที่ค้นจากเว็บ: [research_mechanics_materials.md](research_mechanics_materials.md) · [research_piezo_materials.md](research_piezo_materials.md) · [research_temperature_stability.md](research_temperature_stability.md)
(ไฟล์ทั้งสามรวบรวมโดย sub-agent; แต่ละแถวระบุว่าอ่านจากหน้าเต็ม, จาก abstract/snippet หรือคำนวณต่อเอง — ค่าที่เป็น snippet ควรเปิดต้นฉบับยืนยันก่อนอ้างในงานวิจัย)

| parameter | default | ที่มา | สถานะ |
|---|---|---|---|
| `large_defl` | on | แผ่นบนยุบ 30 µm ขึ้นไปเทียบกับความหนาเทียบเท่าสิบกว่า µm → ทฤษฎีเส้นตรงผิดเกิน ~11 % ตั้งแต่ w = 0.5t | ✔ หลักการ |
| `beta_ld` | 0.52 | fit กับ Levy, NACA Report 740, Table 5 (แผ่นสี่เหลี่ยมขอบยึดแน่นไม่เลื่อน, ν = 0.316, w/t ≤ 1.9); แผ่นกลม 0.488 (Timoshenko) | ค่า fit ของ agent ไม่ใช่สัมประสิทธิ์ที่ตีพิมพ์ · ใช้เกิน w/t ≈ 2 = extrapolate · ขอบ border ยางจริงทำให้ค่าจริงต่ำกว่านี้ → needs measurement |
| tₑ = √(12D/A) | (คำนวณ) | การนิยามของเราเอง: พจน์เส้นตรงขึ้นกับ D, พจน์กำลังสามขึ้นกับ E·t | ⚠ ไม่มีสูตร laminate จากแหล่งอ้างอิงโดยตรง |
| electrode "Sputtered Cu (thin)" | 0.2 µm, 0.1 Ω/□ | ฟิล์ม 200 nm: ≥ 0.10 Ω/□ (ขอบล่างจาก resistivity ของโลหะก้อน, snippet) | ⚠ needs measurement |
| electrode "Copper (FPC)" | 12 µm | Pyralux AP: Cu 9/12/18 µm บน PI 25 µm | ✔ |
| `cover_mat` = PVDF film | d33 33 pC/N, εr 12, E 3 GPa, pyro 30 µC/m²K, ≤ 80 °C | MSI/TE Piezo Film Sensors Technical Manual, Table 1 | ✔ datasheet |
| `cover_mat` = P(VDF-TrFE) | d33 30 pC/N, εr 7.5, E 4 GPa, pyro 40 µC/m²K, ≤ 130 °C | Piezotech FC20 (d33 24–30, Curie 136 °C); MSI manual (εr 7–8, E 3–5 GPa, pyro 40) | ✔ · ต้อง anneal 140–145 °C และ poling ถึง 100 V/µm → ต้องตรวจว่า TPU dome ทนได้ |
| `pz_Rin_MOhm`, `pz_Ccable_pF` | 100 MΩ, 50 pF | f = 1/(2πRC) (MSI manual) | ⚠ ตัวแปรออกแบบวงจร |
| `dT_K` | 0 | ตัวแปรที่ผู้ใช้ตั้ง | — |
| `TCR` | −0.1 %/K | MWCNT/PMMA −0.085 ถึง −0.14 (Walczak 2014); MWCNT/SEBS −0.06 (Matzeu 2012) | ✔ วัสดุใกล้เคียง · resin-CNT ของ lab needs measurement (เดิม −0.2 ⚠) |
| `TCC` | −0.18 %/K | PDMS Sylgard 184, 20–110 °C (King et al., arXiv:2409.03628) | ✔ เฉพาะ PDMS · วัสดุอื่น ⚠ (เดิม +0.02 ⚠) |
| `drift_pct` | 5.8 %/decade | Velostat, 8.1 N, 3 ชม. (Fonseca et al., arXiv:2304.06204) | ✔ วัสดุอื่น · resin-CNT needs measurement (เดิม 3 ⚠) |
| `kE_tpu` | −1.0 %/K | — | ⚠ not found — needs measurement |
| modulus ของ silicone ตามอุณหภูมิ (`TEMP_COEF`) | +0.3 %/K | ทฤษฎี rubber elasticity (E ∝ T) ไม่ใช่ค่าวัด | ⚠ |
| `creep_*` | 10 % | — | ⚠ not found |
| `c_env_fF` | 1 fF | — | ⚠ needs measurement (noise ของสายและสิ่งแวดล้อม) |
| `c_method` = FDC1004 | 0.5 fF, 100 S/s, ±15 pF + offset 100 pF | datasheet TI FDC1004 | ✔ |
| `cdc_noise_aF` (AD7745) | 20 aF | datasheet: 4.2–40 aF rms | ✔ อยู่ในช่วง |

### ผลของการเปิด large deflection ต่อค่าเริ่มต้น
- stack ทองแดง FPC (ค่าเริ่มต้น): dome แรกแตะที่ราว 65 kPa (เดิม 17.7 kPa ด้วยทฤษฎีเส้นตรง)
- electrode โลหะบาง: ราว 6 kPa → ชนิด electrode มีผลมากกว่าที่ model เดิมบอก
- MEMS 2026 รายงานการตอบสนองตั้งแต่ 1 kPa → electrode จริงของ lab น่าจะบางมาก หรือขอบไม่ได้ยึดแน่นเต็มที่; ต้องวัดความหนา PI/โลหะและทดสอบ I–P

### ตัวหาค่าที่ดีที่สุด (optimizer.js)
- ค้นหา: dielectric 4 ชนิด × ความพรุน × ความหนา × electrode 3 ชนิด × PI × micro-gap (216 หรือ 1,152 แบบ)
- เป้าหมาย 7 ด้าน: dead-zone, ความละเอียดช่วงแรงเบา/แรงสูง (noise ÷ ความชัน, ช่องที่ดีที่สุด), ช่วงแรง, ความคลาดที่ +10 K, ความหนา, ความง่ายในการผลิต (⚠ คะแนนประเมินเอง)
- ผลขึ้นกับค่าที่ยัง ⚠ ด้านบน จึงใช้เพื่อเลือกลำดับการทดลอง ไม่ใช่ข้อสรุป

## 11. รอบ v3 (2026-10-13): เงื่อนไข s-gDLP, สมการ R ใหม่, วัสดุ piezo ที่พิมพ์ได้

| parameter | default | ที่มา | สถานะ |
|---|---|---|---|
| `r_model` | film | สมการ R ของ dome แบบฟิล์มบาง: ρ_t/A_r + R_s/(8π) + (R_s/2π)[Φ(r_b) − Φ(a)] พิสูจน์ในเอกสารสรุป หัวข้อ 17 | ✔ พิสูจน์ + ตรวจเชิงตัวเลข (test.js, verify.js) · `legacy` = สมการชุดเดิม |
| `rho_t` | 3×10⁻³ Ω·m² | fit ให้กระแสตรงกับ MEMS 2026 (I = I₀(1 + 296.5·P), 5 V) ช่วง 5–100 kPa ด้วยชุดโลหะบาง: rms 0.12 decade | fit · เกิน 100 kPa model ต่ำกว่า paper 4–7 เท่า (dome แตะลูกเดียว) → needs measurement (เดิม 1×10⁻⁵ ⚠) |
| electrode `Resin-CNT (print)` | 20 µm, E 1 GPa | ชั้น conductive ของ s-gDLP (AFM 2025) · modulus ⚠ ค่าเดา | ใช้ในชุด “พิมพ์ทุกชั้น” |
| `cover_mat` = Resin + BaTiO3 (print) | d33 27.7 pC/N, εr ≈ 28 | Liu et al., Research 2022 (BaTiO₃ 50 nm เคลือบ silane 30 wt%) · εr คำนวณจาก d33/g33 | ✔ d33 · ⚠ εr, modulus, pyro |
| `cover_mat` = Resin + PVDF powder (print) | d33 7.34 pC/N, εr 8.47 | Govindarajan et al., Sensors 2024 (อ่านผ่านตัวสรุปหน้าเว็บ) | needs verification |

รายละเอียดวัสดุ piezo ที่พิมพ์ได้: [research_printable_piezo.md](research_printable_piezo.md)
ตัวหาค่าที่ดีที่สุด: 2,304 แบบ (เพิ่ม electrode resin-CNT และกรณีไม่มีฟิล์ม PI) · 48 แบบพิมพ์ด้วย s-gDLP ได้ทุกชั้น

## 12. โครงสร้างที่ยืนยันแล้ว (13 ต.ค. 2026): วัสดุ piezo เป็น dielectric ระหว่าง E1–E2

- ยืนยันโดยผู้ใช้จากบทสนทนากับอาจารย์: ส่วนล่างใช้ sensor ของ lab ไต้หวันทั้งชุด เพิ่มแค่ E1 กับ E2 และวัสดุ piezoelectric จาก Table 1 ของ Tang 2025 ใช้เป็น dielectric ไม่มี E3
- ใน simulator เลือกวัสดุ piezo ที่ `diel_mat` · ค่าคงที่ของวัสดุใช้ชุดเดียวกับหัวข้อ piezo เดิม (d33, εr, E, pyro, Tmax) · ความหนาตั้งที่ `diel_um`
- ผล: dielectric piezo เนื้อตันให้ ΔC_B < 0.01 % ที่ 100 kPa (TPU พรุน 50 % หนา 100 µm ได้ 5.5 %) คู่ E1–E2 จึงเป็นช่อง piezo (แรงที่เปลี่ยน) ส่วนช่อง R อ่านแรงคงที่
- รูปแบบพรุนของวัสดุ piezo: ⚠ ใช้ d33 ของเนื้อตัน และความแข็ง Gibson–Ashby ไม่มีค่าที่วัดจริง
- งานวิจัยที่สนับสนุนและระดับการอ่านของแต่ละแหล่ง: `research_piezo_as_dielectric.md`
- ยังไม่ยืนยัน: ช่อง E1–E2 ต้องการ ΔC หรือสัญญาณ piezo, ความหมายของ "compatible กับ process", ช่องที่ต้อง linear, ช่วงแรงของ force gauge, ความหนา electrode ที่ vendor ทำได้

## 13. electrode ทอง (Au) — เพิ่ม 22 ต.ค. 2026

| ค่า | ที่ใช้ | แหล่ง | สถานะ |
|---|---|---|---|
| Young's modulus ทอง | 79 GPa, ν 0.44 | Wikipedia (Gold infobox) 79 GPa; WebElements 78 GPa, ν 0.44; MIT 6.777 material database ν 0.44 | ✔ ค่าเนื้อทองทั่วไป · ทองชุบไฟฟ้า 35–44 GPa (MIT 6.777) |
| resistivity ทอง | 2.214×10⁻⁸ Ω·m ที่ 20 °C | Wikipedia (Gold infobox); WebElements 2.2×10⁻⁸ | ✔ |
| ความหนา electrode | 100 nm | ⚠ ค่าที่เลือกเอง · งานที่พบใช้ Au 50 nm บน Cr 10 nm บน Kapton (joam.inoe.ro) · ชั้นยึด Cr/Ti ทั่วไป 20–50 nm | ⚠ |
| sheet resistance | 0.23 Ω/□ | ขอบล่างจากเนื้อทอง ρ/t = 0.2214 Ω/□ ปัดขึ้น · ฟิล์ม sputter จริงสูงกว่านี้ | ⚠ ต้องวัด 4-point probe |

- ใน simulator: `"Sputtered Au (thin)"` เลือกได้ทั้ง E1 และ E2 · ทางกลแทบเหมือนโลหะบางแบบทองแดง (dome เริ่มแตะ 1.80 kPa เทียบกับ 2.27 kPa เมื่อแผ่นรอง PI 12.5 µm ทั้งสองด้าน) · ไม่ได้ใส่ในตัวหาค่าที่ดีที่สุด (2,304 แบบเท่าเดิม) เพราะผลทางกลเท่ากับตัวเลือก "Sputtered Cu (thin)"
- ข้อดีที่ model ยังไม่ได้คิด (ความรู้ทั่วไป ไม่ใช่ผลจาก paper ของ lab): ทองไม่เกิดออกไซด์ ผิวสัมผัสระหว่าง E1 กับ dome CNT จึงน่าจะเสถียรกว่าทองแดง ค่า ρₜ ใน model เป็นค่า fit ค่าเดียวไม่แยกตามโลหะ
- ถ้า vendor ทำ "electrode ทอง" บน FPC แบบ ENIG จะเป็นทองแดง + nickel 3–6 µm + ทอง 0.05–0.1 µm (ตาม IPC-4552 จากบทความของผู้ผลิต PCB) ซึ่งแข็งกว่าทองแดงล้วน ไม่ใช่ทองบาง ⚠ ยังไม่ได้ใส่ใน model เพราะไม่มีค่า modulus ของ nickel แบบ electroless ที่มีแหล่งอ้างอิง
