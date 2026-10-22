# Li, Kroemer, Su, Veiga, Kaboli, Ritter — "A Review of Tactile Information: Perception and Action Through Touch" (IEEE T-RO)

ไฟล์: `A review of tactile information perception and action through touch.pdf` (16 หน้า) · อ่านเฉพาะ p.1–8 จากข้อความ

- **taxel** = element หนึ่งตัวใน array ให้ค่าแรงเฉพาะจุด (p.2)
- ตำแหน่งสัมผัส = จุดศูนย์กลางถ่วงน้ำหนักด้วย pressure ของ taxel ที่ทำงาน (p.3) · แรงสัมผัสประมาณจากผลรวม pressure ของ taxel (p.4)
- **Pretouch / proximity**: ตรวจวัตถุก่อนแตะ ช่วยให้ robot รู้เวลาที่จะสัมผัสและไม่ชนด้วยความเร็วสูง · เทคโนโลยี: capacitive, magnetic, infrared, audio, optical (p.2)
- **Slip**: gross slip มักตามหลัง incipient slip (ขอบของ contact patch ลื่นก่อน ตรงกลางยังไม่ลื่น) · ตรวจ incipient slip ด้วยสัญญาณความถี่สูง ปกติ > 1 kHz (p.4)
- µ สถิตประมาณได้จาก F_n และ F_t ตอนเกิด incipient slip (p.4) · เมื่อพบ slip controller มักเพิ่ม normal force (p.6, p.8)
- ความหนาแน่นของ taxel: มือละเอียดกว่าส่วนอื่น เพราะการอ่านพื้นที่ใหญ่ยากทั้ง hardware และ communication (p.3)

ใช้ใน simulator: ข้อกำหนดของ robot ในแผง "เรียนรู้" และเหตุผลของ frame rate · ไม่มีค่า default
