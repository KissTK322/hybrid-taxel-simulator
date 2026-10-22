# Zhan et al., Materials Today Physics 54 (2025) 101740 — review

ไฟล์: `Recent advances and challenges of tactile sensing for robotics from fundamentals to applications.pdf` (18 หน้า) · อ่านเฉพาะส่วนกลไก (p.1–6) จากข้อความ

## สมการพื้นฐาน
- Resistive: R = ρL/S (Eq. 1) · ΔR/R = ε(1 + 2λ + ωE) (Eq. 2: ส่วนเรขาคณิต + ส่วน piezoresistivity) (p.2)
- Capacitive: C = ε₀εr·S/d (Eq. 3) · S ใช้วัด shear, d ใช้วัด normal (p.4)

## ตัวเลขเปรียบเทียบกลไก (ค่าทั่วไปที่ review ระบุ ไม่ใช่ค่าของ sensor เรา)
| กลไก | ตัวเลข | หน้า |
|---|---|---|
| Resistive | โครงสร้าง < 3 ชั้น, response 20–200 ms, 0.1–1 mW/mm² | p.4 |
| Capacitive | frequency response ถึง 1 kHz, spatial resolution < 0.5 mm, กินไฟมากกว่า resistive 3–5 เท่า | p.4 |
| Piezoelectric | เหมาะกับ vibration เช่น 500 Hz | p.5 |
| Vision-based | update 30 Hz, ใช้ computation มากกว่า 10–100 เท่า | p.6 |
| ตัวอย่าง capacitive 3 แกน | 0.218 kPa⁻¹, response 30 ms, hysteresis 6.8 % | p.4 |

ใช้ใน simulator: คำอธิบายในแผง "เรียนรู้" (contact-resistive vs piezoresistive, C = ε₀εrA/d) · ไม่มีค่า default มาจาก paper นี้
