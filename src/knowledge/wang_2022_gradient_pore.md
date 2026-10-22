# S. Wang et al., Chem. Eng. J. 443 (2022) 136446 — gradient pore structure (GPS)

ไฟล์: `Skin-inspired tactile sensor based on gradient pore structure ... -S Wang.pdf` (8 หน้า) · อ่านจากข้อความ

- วัสดุ: PDMS/CNT film ที่มีรูพรุนแบบ gradient (ใหญ่ด้านบน → ตันด้านล่าง) หนา 216 ± 5 µm ประกบระหว่าง PET 100 µm + ITO 50 nm (p.2)
- รูพรุนเกิดจากไอน้ำใน autoclave 200 °C 15–30 min · สัดส่วนชั้นพรุน 10 / 40 / 70 / 85 % (15 / 20 / 25 / 30 min) · รูด้านบนใหญ่สุด ~41 ± 6 µm ลดลงเกือบเป็นเส้นตรงถึง 0 (p.3–4)
- CNT: MWCNT ยาว 3–12 µm, Ø 8–15 nm, suspension 3 wt% ใน DMF, แช่ 120 min (p.2, p.4)
- modulus ของ film 85 %: ต่ำสุด 0.04 MPa, สูงสุด 4.78 MPa (ต่างกัน > 2 decade) (p.4)
- strain อัดของ film 85 % ≈ 6 เท่าของ PDMS ตัน ที่ 800 kPa (p.4, Fig. 2c)

## กลไก
- รูใหญ่ด้านบนยุบก่อน ตอบสนองช่วง 0–50 kPa · รูเล็กและแน่นด้านล่างตอบสนองถึง 800 kPa (p.2, Fig. 1c) → พื้นที่สัมผัส/เส้นทางนำไฟฟ้าเพิ่มต่อเนื่อง

## สมรรถนะ
| ปริมาณ | ค่า | ที่มา |
|---|---|---|
| sensitivity (ΔI/I₀)/ΔP | 3.74 kPa⁻¹ (0–10 kPa), 0.31 kPa⁻¹ (10–800 kPa) | p.5–6, Fig. 3c |
| ช่วง | 0–800 kPa | p.1 |
| pressure resolution | 50 Pa ที่ 0 kPa, 0.2 kPa ที่ 150 kPa, 0.4 kPa ที่ 580 kPa → 0.06 % | p.6, Fig. 4 |
| response / recovery | 15 ms / 14 ms ที่ 0.1 kPa | p.6, Fig. 3e |
| detection limit | 1.65 Pa | p.1 |
| stability | 5,000 รอบ ที่ 0.5 และ 300 kPa (abstract/p.2 ระบุ 10,000 รอบ) | p.2, p.6 |
| I–V | −1 ถึง 1 V | p.5 |
| array | 8 × 8, taxel 12 × 12 mm | p.7 |

ใช้ใน simulator: เป็นเหตุผลของ dielectric แบบพรุน (porosity) และแนวคิด gradient ของความสูง dome · ไม่ได้ใช้ตัวเลขใดเป็นค่า default โดยตรง
