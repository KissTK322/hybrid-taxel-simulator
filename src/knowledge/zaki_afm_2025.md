# Zaki et al., Adv. Funct. Mater. 2025, e15914 — s-gDLP tactile sensor

ไฟล์: `Adv_Funct_Materials_-_2025_-_Zaki_(5).pdf` (15 หน้า) · DOI 10.1002/adfm.202515914
วิธีอ่าน: อ่านข้อความทั้ง paper + ดูรูป Fig. 2, 3, 6 · ค่าที่ "อ่านจากกราฟ" เป็นค่าประมาณด้วยสายตา (±10–20%)

## โครงสร้างของ sensor ใน paper นี้ (สำคัญ — ต่างจาก MEMS 2026)
- sensor เดี่ยว = **dome สองชั้นหันหน้าเข้าหากัน** (layer 1 + layer 2 เหมือนกัน) แต่ละชั้น = PDMS 400 µm + TPU + resin-CNT (p.6, Fig. 3A)
- ความหนารวมหลังประกอบ ≈ 2 mm · พื้นที่รับแรง 11 × 11 mm (p.6) · Fig. 6A ระบุ single sensor 10.5 mm
- ยึดสองชั้นด้วย transparent adhesive film (3M) ที่ border · ต่อสายทองแดงด้วย copper tape · PI เป็น cover (p.14 Tactile Sensor Assembly)

## Geometry
| ปริมาณ | ค่า | ที่มา |
|---|---|---|
| ความสูง dome 3 ระดับ | 650 / 550 / 400 µm | p.3–5, Fig. 2F |
| grayscale ของ 3 ระดับ | 220 / 160 / 55 (ข้อความ p.3) · รูป Fig. 2B เขียน i_max = 240 / 160 / 50 → **needs verification** | p.3, Fig. 2B |
| grayscale ขอบ dome | max/2 (เช่น 220 → 110) | p.3, Fig. 2B |
| grayscale ของ border | 250 | p.3 (Fig. S2) |
| เส้นผ่านศูนย์กลาง dome | 750 µm (ได้เมื่อฉาย 4–6 s) | p.6 |
| ความสูง border | 680 µm (dome สูงสุด 650 µm) | p.6 (Fig. S13) |
| micro-gap | ≈ 60 µm **ระหว่าง dome ชั้นบนกับชั้นล่าง** (SEM) = 2 × (680 − 650) | p.1, p.3, p.6, Fig. 3B |
| ชั้น resin-CNT | ≈ 20 µm | p.5, Fig. 2F(ii) |
| PDMS substrate | 400 µm (spin 250 rpm 25 s, บ่ม 80 °C 4 h, 10:1) | p.6, p.14 |
| ความหนาพื้น TPU ใต้ dome | ไม่ได้รายงานเป็นตัวเลข (เห็นใน SEM Fig. 2F) → **needs verification** | Fig. 2F |
| DMD | 25 µm/pixel, 1920 × 1080 (2K), 405 nm | p.11, p.14 |

## การพิมพ์ (Jacobs / Beer–Lambert)
- สมการ: z_c = h_a·ln(t_c·G / (T₀·255)) (Eq. 4–5, p.5)
- TPU: ฉาย 4–6 s (p.6) · โครงสร้างทั้งหมดเสร็จใน 6 s (abstract)
- resin-CNT: "อย่างน้อย 350 s" เพื่อให้ได้ชั้นสม่ำเสมอ ≈ 20 µm (p.6, Fig. S10B,C)
- ตัวอย่างวัด conductivity: ฉาย 500 s ได้หนา 60 µm (p.14 Electrical Properties) ← ไม่ตรงกับ Fig. 2G
- Fig. 2G (อ่านจากกราฟ, โดยประมาณ): TPU 0.5 s→~115 µm, 1 s→~230, 2 s→~325, 3 s→~425, 4 s→~480, 4.5 s→~485 µm · resin-CNT 5 wt% 10 s→~10 µm, 50 s→~17, 100 s→~20, 600 s→~47 µm
- ⚠ จุด "50 µm ที่ 1000 s" ที่ simulator เดิมใช้ fit **ไม่พบใน paper** (กราฟจบที่ ~600 s) → needs verification
- Fig. 2H: current density เพิ่มชัดหลัง 100 s (0.05 mA/cm² ที่ 10 s → ~0.47 mA/cm² ที่ ~600 s, อ่านจากกราฟ)

## resin-CNT
- MWCNT ยาว 10–30 µm, เส้นผ่านศูนย์กลาง 40–60 nm (p.11–13) · resin = polyacrylate photoresin
- อัตราส่วนที่เตรียม: 0.3, 0.5, 1, 3, 5, 7, 10 wt% (p.14) · เลือก 5 wt% เพราะสมดุล conductivity กับ viscosity (p.6, Fig. S11)
- Fig. 2I conductivity (S/cm, อ่านจากกราฟ): 0 %→~3×10⁻⁹, 0.5 %→~4×10⁻⁹, 1 %→~5×10⁻⁵, 3 %→~3.5×10⁻³, **5 %→~4×10⁻³**, 7 %→~5×10⁻², 10 %→~2×10⁻²
- ข้อความ p.6 เขียนว่า "≈10⁻³ S cm⁻² ที่ > 5 wt%" (หน่วยพิมพ์ผิด น่าจะเป็น S/cm) → ใช้ค่ากราฟ ~4×10⁻³ S/cm, needs verification
- percolation threshold อยู่ระหว่าง 0.5 และ 1 wt% (conductivity กระโดด ~4 decade) — จาก Fig. 2I
- วัดด้วย four-probe บนตัวอย่าง 10 × 10 mm หนา 60 µm (p.14)
- density ของ CNT และ resin: ไม่ได้รายงาน

## สมรรถนะ (sensor สองชั้น 11 × 11 mm)
| ปริมาณ | ค่า | ที่มา |
|---|---|---|
| sensitivity (ΔI/I₀)/P | 10,692 kPa⁻¹ (0–30 kPa), 1,827 kPa⁻¹ (30–100 kPa), R² = 0.99 | p.6, Fig. 3D (ข้อความพิมพ์ 10.692/1.827 = จุดคั่นหลักพัน) |
| I₀ (ไม่กด) | ~10⁻⁹ A ที่ 5 V | p.7, Fig. 3F |
| I ที่ 300 kPa | ~10⁻⁴ A ที่ 5 V | p.7, Fig. 3F |
| I ที่ 75 kPa | 8×10⁻⁵ A | p.7, Fig. 3G |
| response | 0.22 s กด / 0.17 s ปล่อย ที่ 75 kPa · 0.09 s ที่ 0.6 kPa (ชนเพดานเครื่องมือ, อ่านที่ 6 Hz) | p.7, p.14 |
| pressure resolution (3σ) | 1.35 kPa (0–25 kPa), 4.74 kPa (30–100 kPa) | p.7–8, Eq. 8 |
| durability | 12,000 รอบที่ 75 kPa · 1,500 รอบต่อแรงดัน (5, 0.5, 0.05 V) | p.8 |
| bias voltage | ทดสอบ 5, 1, 0.5, 0.1, 0.01 V | p.8, Fig. 4 |
| ความถี่ทดสอบ | 0.64–2 Hz ที่ 75 kPa | p.8 |

## Array 5 × 5
- taxel 4.25 × 4.25 mm, ระยะห่าง 1.375 mm (p.11, Fig. 6A)
- ความต้านทานชั้น conductive (two-point probe): เฉลี่ย **20.53 kΩ**, CV 13.26 % (p.11, Fig. 6C)
- crosstalk เฉลี่ย 1.6 %, สูงสุด ~5 % ที่ 270 kPa (p.11, Fig. 6E)
- readout: Arduino MEGA + comparator LM393 + multiplexer (p.14, Fig. S21)

## สิ่งที่ paper ไม่ได้รายงาน (ต้องวัดเอง)
Young's modulus / Poisson ratio ของ TPU resin · hysteresis · drift ระยะยาว · TCR · ความหนาพื้น TPU · density ของวัสดุ · C ของ gap
