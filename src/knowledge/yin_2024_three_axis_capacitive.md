# Yin et al. 2024 — Flexible wide-range three-axis capacitive pressure sensor array

ไฟล์: `Flexible wide-range sensitive three axis pressure sensors arrays for grasping feedback.pdf` (10 หน้า) · อ่านจากข้อความ (methods + results)

## โครงสร้าง (p.2–4, Fig. 1, 4a)
- array 4 × 2 หน่วย · แต่ละหน่วย = **capacitor 5 cell** ใต้ bump PDMS เดียว (cell 5 อยู่กลาง, cell 1–4 รอบ ๆ)
- ชั้น: shielding / PDMS bump / PI บน / electrode บน / PDMS intermediate (dielectric) / electrode ล่าง / PI ล่าง
- electrode ทอง 35 nm sputter บน PI 150 µm · ขนาด 2 × 2 mm · ระยะระหว่าง electrode ในหน่วย 0.5 mm · ระยะระหว่างหน่วย 2.5 mm (p.2)
- bump PDMS: สูง 2 mm, ฐาน 9 mm, ผนังเอียง 30° (p.2–3)
- cell คั่นด้วย micro-column ด้าน 500 µm (p.5)
- PDMS 10:1 (p.3) · dielectric ที่ดีที่สุดหนา 1200 µm (ทดสอบ 300–1800 µm ทีละ 300) (p.6–7)

## Shielding (p.3)
- copper foil 150 µm บน bump + tinplate paper 7 µm ใต้ electrode ล่าง

## หลักการ (p.4–5)
- C₀ = ε₀·εr·S/d₀ (Eq. 1) · ΔC/C₀ ≈ Δd/d₀ (Eq. 2)
- แรงตั้งฉาก: ทุก cell เพิ่ม · แรงเฉือน: ใช้ผลต่าง |C2 − C4| (แกน x), |C1 − C3| (แกน y) (p.8)

## Readout (p.5, Fig. 6)
- AD7745 + multiplexer ADG706 · I²C · ช่วงวัด ±4 pF, bias capacitance สูงสุด 17 pF, update 10–90 Hz
- ขยายช่วงด้วย excitation สองขา + resistor divider (R1, R2)
- 6 array = 240 ช่อง
- (noise/resolution ของ AD7745 เป็นค่า datasheet — paper นี้ไม่ได้ให้ตัวเลข)

## สมรรถนะ
| ปริมาณ | ค่า | ที่มา |
|---|---|---|
| แรงตั้งฉาก | 0–46 N (0–520 kPa) | p.1, p.7 |
| sensitivity ตั้งฉาก | 0.442 N⁻¹ (0.031 kPa⁻¹) ช่วง < 2 N · 0.036 N⁻¹ (2.53×10⁻³ kPa⁻¹) ช่วงสูง | p.6–7 |
| แรงเฉือน | 0–10 N · 0.08 N⁻¹ (x), 0.07 N⁻¹ (y) | p.8 |
| response | 11 ms (ทดสอบ 10 kPa) | p.8 |
| repeatability | 500 รอบ | Fig. 8d |
