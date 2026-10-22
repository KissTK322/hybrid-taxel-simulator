# S. Wang et al., Chem. Eng. J. 457 (2023) 141136 — gradient pore + pyramid hybrid structure (GPPHS)

ไฟล์: `High sensitivity tactile sensors with ultrabroad linear range ... -S Wang.pdf` (9 หน้า) · อ่านจากข้อความ

- โครงสร้าง: PDMS/CNT film หนา 436 ± 5 µm · ด้านหนึ่งเป็น pyramid 200 × 200 µm บนชั้นตัน อีกด้านเป็นรูพรุน gradient (60 µm → 0) · ประกบด้วย ITO 50 nm / PET 50 µm (p.3–4)
- สัดส่วนชั้นพรุน 52 / 73 / 87 % (10 / 15 / 20 min ที่ 200 °C) (p.4) · pyramid ที่ทดสอบ 65, 110, 200 µm (p.4)
- CNT: carboxylic MWCNT ยาว 2–10 µm, Ø 9–16 nm (p.2)

## กลไกการนำไฟฟ้า (p.6, Fig. 4)
- R = ρL/A · ความต้านทานรวมเป็นอนุกรม/ขนานของ **contact resistance ด้านบน (R_tc), ความต้านทานช่องทางในเนื้อ (R_pp), contact resistance ด้านล่าง (R_bc)**
  - เริ่มต้น: R_total = (R_tc11 ∥ R_tc12 ∥ R_tc13) + R_pp1 + R_bc1
  - เมื่อกด: มีเส้นทางขนานเพิ่ม → R_total = (R_tc11 ∥ … ∥ R_tc22) + (R_pp1 ∥ R_pp2) + R_bc2
- FEM (ABAQUS, 0–1 MPa; รู 58, 47, 38, 27, 18, 8, 4, 0 µm): รูใหญ่ยุบก่อน รูเล็กยุบทีหลัง, pyramid ยุบจากยอดลงฐาน → พื้นที่สัมผัสรวม **เป็นเส้นตรง** กับแรงกดในช่วง 0–1 MPa เฉพาะ pyramid 200 µm (p.6–7)

## สมรรถนะ
| ปริมาณ | ค่า | ที่มา |
|---|---|---|
| sensitivity | 40.12 kPa⁻¹ linear ถึง 1000 kPa | p.1, p.5, Fig. 3b |
| pressure resolution | 0.38 % | p.2 |
| detection limit | 1 Pa | p.2 |
| stability | 5,000 รอบ ที่ 550 kPa | p.5 |

ใช้ใน simulator: โครง R_A = R_contact + R_path + R_pad (อนุกรม) และ dome หลายลูกขนานกัน เป็นแนวเดียวกับ R_tc / R_pp / R_bc ของ paper นี้
