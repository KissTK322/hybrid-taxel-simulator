# Su et al., IEEE-RAS Humanoids 2015 — force estimation and slip detection for grip control (BioTac)

ไฟล์: `Force estimation and slip detection for grip control using a biomimetic tactile sensor.pdf` (8 หน้า) · อ่านจากข้อความ

## Grip controller (p.5, Fig. 4)
- **F_z = F_t / µ + safety margin**
- µ เริ่มต้น = 2 (ผิว silicone ของ BioTac) · เมื่อพบ slip ประมาณใหม่ด้วย Coulomb: µ = F_t / F_z
- safety margin 10–40 % (เผื่อความเร่งของวัตถุและความไม่แน่นอนของ µ)
- ถือว่าแตะแล้วเมื่อ F_z > 0.2 N

## Slip detection (p.4, p.7)
- force-derivative: threshold ของ dF_z/dt ที่เป็นลบ = 1 N/s
- vibration: band-pass 60–700 Hz, pressure sensor sample 2.2 kHz, controller 300 Hz, หน้าต่าง 10 ms (22 samples; slip เมื่อ ≥ 11 เกิน threshold)
- ตรวจ slip ได้ก่อน IMU 5.7 ± 4.5 ms / 7.8 ± 3.6 ms (force-derivative) และ 32.8 ± 4.2 ms / 35.7 ± 6.0 ms (pressure)
- จำแนกชนิด slip ได้ ~80 %

## Sensor
- BioTac: แกนแข็ง + electrode 19 ตัว + ผิวยาง · แรง 3 แกนจาก impedance ของ electrode (p.3)

ใช้ใน simulator: ข้อกำหนด frame rate (controller 300 Hz; เป้า array 50–100 Hz มาจาก speaker notes ไม่ใช่ paper นี้) และแผง "เรียนรู้"
