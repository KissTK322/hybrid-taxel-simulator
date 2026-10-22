# Zaki & Chen, IEEE MEMS 2026 — large-scale 16 × 9 array

ไฟล์: `MEMS2026_Zaki_1118.pdf` (4 หน้า) · อ่านครบทุกหน้ารวมรูป

## โครงสร้าง (ตรงกับ simulator: dome ชั้นเดียว + electrode แบน)
- ชั้น tactile ที่พิมพ์ (TPU dome + border + resin-CNT) **bond ด้วย UV curing ลงบน PI-based electrode** (p.2, Fig. 2a)
- Fig. 2a ระบุชั้น: Flexible TPU, Conductive layer, Transparent PDMS, Electrode, PI layer

## ขนาด — Fig. 2b (p.2)
| สัญลักษณ์ | ค่า | ความหมาย |
|---|---|---|
| a | 4050 µm | ขนาด taxel (ยืนยันใน abstract: 4.05 × 4.05 mm) |
| b | 650 µm | ความกว้าง border |
| c | 150 µm | ระยะในรูป — ไม่ชัดว่าเป็น dome–border หรืออย่างอื่น → **needs verification** |
| d | 750 µm | เส้นผ่านศูนย์กลาง dome |
| e | 150 µm | ช่องว่างระหว่าง dome → pitch = 750 + 150 = 900 µm |
| f | 650 µm | ความสูง dome สูงสุด |
| g | 550 µm | ความสูง dome ระดับสอง |
| h | 680 µm | ความสูง border |

- **micro-gap ตามแบบ = h − f = 680 − 650 = 30 µm** (p.2: "border height (680 µm) slightly exceeds that of the tallest microdome (650 µm)")
- รูปนี้ระบุความสูงแค่ 2 ระดับ (650, 550) · ระดับ 400 µm มาจาก AFM 2025 · dome ลูกไหนสูงเท่าไรใน 3 × 3 → **needs verification**
- ตรวจผลรวม: 3×750 + 2×150 = 2550 µm; 4050 − 2×650 = 2750 µm → เหลือข้างละ 100 µm (ถ้า c = 150 คือระยะ dome–border ผลรวมจะเป็น 4150 ≠ 4050) → ความหมายของ c ต้องถามผู้เขียน

## เครื่องพิมพ์
- 405 nm, DMD 4K, 25 µm/pixel, พื้นที่พิมพ์ 96 × 54 mm (p.1) · mask 3840 × 2160 pixel (Fig. 4a)

## สมรรถนะ sensor เดี่ยว (4.05 mm, 5 V, Keithley 2450, JSV H-1000)
| ปริมาณ | ค่า | ที่มา |
|---|---|---|
| ช่วงทดสอบ | 1–3500 kPa (abstract) · calibration ถึง 5000 kPa (Fig. 3b) | p.1, p.3 |
| ช่วง linear | 1–1500 kPa, R² = 0.99 | p.1, p.3 |
| sensitivity | 296.5 kPa⁻¹ | p.1, p.3 |
| I₀ | ~10⁻⁹ A | p.3 |
| response ที่ 1000 kPa | 0.07 s กด · ปล่อย 0.01 s (abstract, Fig. 3d) แต่ข้อความ p.3 เขียน 0.1 s → **needs verification** | p.1, p.3 |
| กระแสที่ 1000 kPa | ~2.5×10⁻⁴ A (อ่านจาก Fig. 3d) → R ≈ 20 kΩ ที่ 5 V | Fig. 3d |
| durability | 3000 รอบ | p.3, Fig. 3e |

## Array
- 16 × 9 = 144 taxel พิมพ์พร้อมกัน (p.1, p.3)
- ระยะห่าง: Fig. 4a และข้อความ p.3 เขียน "spacing 1.5 mm" แต่ p.4 เขียน "edge-to-edge pitch 1.925 mm → spatial resolution ~5.98 mm/pixel" (4.05 + 1.925 = 5.975 ✓ และ 16 × 5.975 = 95.6 mm พอดีพื้นที่พิมพ์ 96 mm ✓) → simulator ใช้ 1.925 mm, **needs verification**
- crosstalk (3 × 3, กด 1000 kPa): SNR 99.95 / 114.27 / 108.47 dB (Table 1) · array ใหญ่ 100.98 dB (p.4)
- SNR(dB) = 20·log₁₀(ΔI_P/ΔI_n) (Eq. 3)
- UV bonding: peel force ~3 N เทียบกับ tape < 1 N (ASTM D1876) (p.3, Fig. 4f)

## ไม่ได้รายงาน
ความหนา PI และชนิด/ความหนาโลหะของ electrode · modulus ของ TPU · readout ของ array 16 × 9 · frame rate
