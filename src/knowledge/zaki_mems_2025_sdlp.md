# Zaki, Chen, Saravanan, Huang — IEEE MEMS 2025 (SDLP)

ไฟล์: `SEQUENTIAL EXPOSURE DIGITAL LIGHT PROCESSING (SDLP) 3D-IEEE-MEMS2025.pdf` (4 หน้า) · อ่านครบ

- โครงสร้าง: พิมพ์ชั้น tactile สองครั้งแล้ว**ซ้อนสองชั้นด้วย adhesive** (dome หันเข้าหากัน) เหมือน AFM 2025 (p.2, Fig. 3a)
- DMD 25 µm/pixel, 405 nm, mask 1920 × 1080 (p.1)
- grayscale สูงสุดของ dome: 50, 160, 220 (p.2) · mask ชั้น CNT = 255
- TPU ฉาย 1–10 s · resin-CNT ต้อง > 100 s (p.2, Fig. 2b–c)
- ชั้น resin-CNT ≈ 20 µm บน dome (p.2, Fig. 3b) · มี gap ระหว่างสองชั้น (Fig. 3b มีตัวเลขในรูป SEM อ่านไม่ชัดจาก PDF → ใช้ 60 µm จาก AFM 2025 Fig. 3B)
- border สูงกว่า dome สูงสุดเล็กน้อย → สองชั้นไม่แตะกันตอนเริ่ม (p.2)
- สมการ: z_c = h_a·ln(t_c/T₀) (Eq. 1) · I = V·A/(ρ·L) (Eq. 2)
- sensitivity: 10,700 kPa⁻¹ (ช่วงต่ำ S1), 1,800 kPa⁻¹ (ช่วงสูง S2) · ช่วงวัดถึง 100 kPa (p.3)
- durability 2,500 รอบ · 0.64–2 Hz ที่ 70 kPa · response ~0.09 s ที่ 0.6 kPa (p.3)
- bending: resolution ~15° ในช่วง 0–90°, 580 degree⁻¹, 1,500 รอบ (p.3)
- array 3 × 3 ที่ต่อด้วย electrode CNT · กด 70 kPa · crosstalk < 0.01 % ในจุดที่ไม่ถูกกด (ข้อความ p.4) / < 0.1 % (abstract) — ตารางใน Fig. 5c มีค่า 34–70 % ที่จุดที่ถูกกดร่วม
