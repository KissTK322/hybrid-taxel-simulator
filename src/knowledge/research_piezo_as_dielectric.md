# วัสดุ piezo เป็น dielectric ระหว่าง E1–E2: งานวิจัยที่เกี่ยวข้อง

ค้นเมื่อ 13 ต.ค. 2026 เพื่อประกอบโครงสร้างที่ยืนยันแล้ว: sensor piezoresistive ของ lab ไต้หวันอยู่ด้านล่าง เพิ่ม electrode สองชั้น (E1, E2) และใช้วัสดุ piezoelectric จาก Table 1 ของ Tang 2025 เป็น dielectric ระหว่างสองชั้นนั้น ไม่มี E3

ระดับการอ่านของแต่ละแหล่งระบุไว้ท้ายแถว: **อ่านเต็ม** = อ่านเนื้อหา paper, **อ่านผ่านตัวสรุปหน้าเว็บ** = ให้เครื่องมือสรุปจากหน้าเต็ม, **abstract** = เห็นเฉพาะบทคัดย่อหรือผลค้นหา ตัวเลขจากระดับ abstract ต้องตรวจกับ paper ก่อนอ้าง

## 1. ข้อสรุปที่ใช้กับงานนี้

| ข้อ | สิ่งที่งานวิจัยบอก | แหล่ง |
|---|---|---|
| ก | piezoresistive เหมาะกับแรงคงที่ piezoelectric เหมาะกับแรงที่เปลี่ยน จึงใช้คู่กัน | [P1] [P2] |
| ข | มีงานที่ซ้อนชั้น CNT-polymer (piezoresistive) กับฟิล์ม PVDF (piezoelectric) แล้ว และใช้ electrode ชั้นกลางร่วมกันสองช่อง | [P1] |
| ค | ฟิล์ม PVDF ระหว่าง electrode สองชั้นเป็นทั้ง piezo และ dielectric ของ capacitor ได้ แนวคิดนี้มีมาตั้งแต่ปี 1980 | [P3] |
| ง | งานที่ต้องการ ΔC จากโครงสร้างที่มีฟิล์ม PVDF ต้องเพิ่มชั้นนิ่มหรือชั้น ionic เข้าไป ΔC ไม่ได้มาจากตัวฟิล์ม PVDF | [P4] |
| จ | ถ้าต้องการให้วัสดุตระกูล PVDF เป็น dielectric ที่ C เปลี่ยนตามแรง ต้องอยู่ในรูปพรุน เช่น แผ่นเส้นใย electrospun | [P5] |
| ฉ | สัญญาณ PVDF อ่านด้วย charge amplifier | [P1] |

ข้อ ง และ จ ตรงกับผลของ simulator: วัสดุ piezo เนื้อตันแข็งระดับ GPa ความหนาแทบไม่เปลี่ยนเมื่อกด C ของคู่ E1–E2 จึงเปลี่ยนน้อยกว่า 0.01 % ที่ 100 kPa (test.js หมวด 3a)

## 2. รายละเอียดของแต่ละแหล่ง

### [P1] Liu et al. 2015 — double-layer piezoresistive + piezoelectric (อ่านเต็ม)

- Liu W., He D., Ruan Y., Ruan X., Fu X., Stefanini C., "Preliminary Study on Piezoresistive and Piezoelectric Properties of a Double-layer Soft Material for Tactile Sensing", Materials Science (Medžiagotyra) 21(2), 238, 2015. doi:10.5755/j01.mm.21.2.6454
- โครงสร้าง: ฟิล์ม MWNT/PU (piezoresistive) หนา 12 µm ขนาด 30 × 30 mm ซ้อนกับฟิล์ม PVDF หนา 75 µm บนฐาน PDMS หนาราว 1 mm
- เหตุผลที่จับคู่ (p.238): "piezoresistivity is suitable to steady measurement and piezoelectricity is essential for dynamic sensing"
- electrode (p.239): "The middle electrode layer can be used both for the piezoelectric and piezoresistive elements" และไม่ใช้กาวระหว่างชั้น
- การอ่าน PVDF: charge amplifier แล้วเก็บด้วย DAQ ทดสอบแรงสั่นที่ 1 kHz
- ใช้กับงานนี้: ยืนยันว่า E1 ใช้ร่วมได้ระหว่างช่อง R (E1–CNT) กับช่อง piezo (E1–E2)
- ข้อจำกัด: เป็นงานเบื้องต้น หน่วยเดียว ไม่ใช่ array และชั้น piezoresistive เป็นฟิล์มเรียบ ไม่ใช่ dome แบบ micro-gap

### [P2] Ayral, Aloui, Grossard 2026 — hybrid PzE + PzR สำหรับจับการลื่น (อ่านผ่านตัวสรุปหน้าเว็บ)

- "Reactive Slip Control in Multifingered Grasping: Hybrid Tactile Sensing and Internal-Force Optimization", arXiv:2602.16127 (รับตีพิมพ์ที่ IEEE ICRA 2026)
- ชั้น piezoelectric: "alternating stack of high-conductivity PEDOT polymer and electroactive PVDF polymer" อ่านที่ 10 kHz ช่วงใช้งาน 30 Hz – 2.5 kHz ใช้จับการลื่น
- ชั้น piezoresistive: matrix 8 × 8 สำหรับตำแหน่งสัมผัสและแรงความถี่ต่ำ
- ความหนารวมของ module 650 µm ตรวจพบการลื่นหลังเริ่มลื่น 20.4 ± 6 ms
- ใช้กับงานนี้: เป็นตัวอย่างล่าสุดของ sensor แบบ R + piezo ที่ใช้งานกับมือหุ่นยนต์จริง และแบ่งหน้าที่สองช่องแบบเดียวกับที่เสนอ

### [P3] Krempl, Claassen, List 1980 — สิทธิบัตร PVDF ที่ใช้ได้ทั้ง piezo และ capacitive (อ่านผ่านตัวสรุปหน้าเว็บ)

- US 4,216,403, "Monoaxially oriented piezoelectric polymer transducer for measurement of mechanical values on bodies", ยื่น 1978 ออก 1980
- ฟิล์ม PVDF "forms the dielectric of a capacitor, the electrically leading surfaces being used as the capacitor electrodes"
- ใช้ "one and the same transducer alternatively for piezoelectric or capacitive measurements"
- เหตุผล: "static or quasi-static and low frequent processes which cannot be measured piezoelectrically"
- ข้อจำกัด: ไม่รายงานค่า ΔC หรือความไวแบบ capacitive ความหนาฟิล์มระบุเพียงว่า "a few μ thick" จึงยืนยันได้แค่แนวคิด ไม่ยืนยันว่า ΔC ใหญ่พอวัดแรงระดับ kPa

### [P4] Ouyang et al. 2025 — dual-mode piezo + ionic capacitance (อ่านผ่านตัวสรุปหน้าเว็บ)

- Ouyang Y. et al., "Dual-Mode Flexible Pressure Sensor Based on Ionic Electronic and Piezoelectric Coupling Mechanism Enables Dynamic and Static Full-Domain Stress Response", Micromachines 16(9), 1018, 2025. doi:10.3390/mi16091018
- โครงสร้าง: FPC สองแผ่น (เป็น electrode และแผ่นรองรับ) แต่ละแผ่นพิมพ์ชั้น ionic (TPU + MWCNT + ionic liquid) แล้วประกบกันโดยมีฟิล์ม PVDF อยู่กลาง
- ช่อง piezo: 0.49 mV/kPa ตอบสนอง 19 ms / คืนตัว 12 ms
- ช่อง capacitive (มาจากชั้น ionic): 0.13 kPa⁻¹ ช่วง 0–150 kPa, R² = 0.9981, 33.4 ms / 58.7 ms
- เหตุผลที่ต้องมีสองช่อง: "Piezoelectric sensors struggle to detect static signals"
- ใช้กับงานนี้: (1) electrode แบบ FPC จาก vendor ใช้กับฟิล์ม PVDF ได้ (2) ถ้าต้องการ ΔC ที่เป็นเส้นตรงจากโครงสร้างที่มี PVDF ต้องมีชั้นอื่นช่วย
- ไม่ได้รายงาน: ความหนาฟิล์ม PVDF, พื้นที่ sensor, ความถี่ที่วัด C และไม่ระบุชัดว่าสองช่องใช้ electrode คู่เดียวกันหรือไม่

### [P5] Sharma et al. 2020 — เส้นใย PVDF-TrFE เป็น dielectric แบบ capacitive (abstract)

- Sharma S. et al., "Wearable Capacitive Pressure Sensor Based on MXene Composite Nanofibrous Scaffolds for Reliable Human Physiological Signal Acquisition", ACS Appl. Mater. Interfaces 12(19), 22212–22224, 2020. doi:10.1021/acsami.0c05819
- dielectric: แผ่นเส้นใย electrospun ของ PVDF-TrFE ผสม MXene ระหว่าง electrode PEDOT:PSS/PDMS
- ความไว 0.51 kPa⁻¹, ตรวจจับต่ำสุด 1.5 Pa, "linear sensing over a broad pressure range (0−400 kPa)", 10,000 รอบ
- MXene เพิ่ม dielectric constant ถึงราว 40 และลด compression modulus เหลือ 58 % ของแผ่นเส้นใย PVDF-TrFE ล้วน (เป็นค่าสัมพัทธ์ ไม่มีค่า modulus เป็นตัวเลข)
- ใช้กับงานนี้: วัสดุใน Table 1 (PVDF-TrFE แบบ electrospinning) ทำเป็น dielectric ที่ C เปลี่ยนตามแรงได้ ถ้าอยู่ในรูปเส้นใยพรุน
- ข้อจำกัด: อ่านได้เฉพาะ abstract ไม่ได้รายงานสัญญาณ piezo จากอุปกรณ์เดียวกัน และไม่มีค่า modulus จึงยังใส่ใน simulator แบบมีแหล่งอ้างอิงไม่ได้

## 3. ที่หาไม่พบ

- ค่า compressive modulus เป็นตัวเลขของแผ่นเส้นใย electrospun PVDF หรือ PVDF-TrFE
- ค่า d33 ของรูปแบบพรุน (เส้นใย, โฟม) ที่วัดในโหมดกดตามความหนา
- งานที่วัด ΔC ของฟิล์ม PVDF เนื้อตันภายใต้แรงกดระดับ kPa
- งานที่ใช้คู่ electrode เดียวอ่านทั้ง C และประจุ piezo พร้อมกันบน sensor แบบ dome + micro-gap

## 4. ผลต่อ simulator

- เลือกวัสดุ piezo จาก Table 1 ได้ที่ช่อง “วัสดุ dielectric” สัญญาณ piezo อ่านระหว่าง E1 กับ E2 (`piezoWhere`, `piezoStatic` ใน physics.js)
- รูปแบบพรุนของวัสดุ piezo เลือกได้ด้วยตัวเลื่อนความพรุน แต่ใช้ d33 ของเนื้อตันและความแข็งแบบ Gibson–Ashby ซึ่งเป็นโฟมเซลล์ปิด ⚠ แผ่นเส้นใยจริงนิ่มกว่านี้ ผลจึงเป็นขอบล่างของ ΔC และต้องวัดจริง
- ตัวเลขจัดอันดับอยู่ใน `doc_assets/piezo_diel.json` (สร้างด้วย `doc_assets/piezo_diel.js`)
