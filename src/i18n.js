// ============================================================================
// Language switch (Thai / English). Strings in the scripts are written as Lg("ไทย", "English");
// the static text of template.html is translated once at load from STATIC_EN.
// The choice lives in the URL hash (#lang=en, works offline and in shared links) and in localStorage.
// Switching reloads the page and carries the current parameters across in sessionStorage.
// ============================================================================
const LANG = (() => {
  if (typeof location === "undefined") return "th";
  const m = /lang=(en|th)/.exec(location.hash || "");
  if (m) return m[1];
  try { return localStorage.getItem("taxel_lang") || "th"; } catch (e) { return "th"; }
})();
const Lg = (th, en) => (LANG === "en" ? en : th);
// data objects carry English in a parallel field: { why, why_en }
const Ld = (o, k) => (LANG === "en" && o && o[k + "_en"] != null ? o[k + "_en"] : o ? o[k] : "");
globalThis.Lg = Lg; globalThis.Ld = Ld;
const STATIC_EN = {
"CNT & การพิมพ์": "CNT & printing",
"ชุดค่า": "Preset",
"ค่าเริ่มต้น": "Defaults",
"บันทึกค่า (.json)": "Save values (.json)",
"โหลดค่า": "Load values",
"สว่าง/มืด": "Light/dark",
"ภาพตัดขวาง": "Cross-section",
"วงจร A/B": "Circuits A/B",
"แยกชั้น": "Explode",
"ตัดครึ่ง": "Cut in half",
"ป้ายชื่อ": "Labels",
"ขยายแนวดิ่ง": "Vertical scale",
"ซูมบริเวณ gap": "Zoom on the gap",
"เส้นสนามไฟฟ้า (approximate)": "Electric field lines (approximate)",
"ความถี่": "Frequency",
"ปลายนิ้ว (Hertz)": "Fingertip (Hertz)",
"วัตถุแข็งหน้าเรียบ": "Flat rigid object",
"รัศมี": "Radius",
"แรง": "Force",
"เลื่อนอัตโนมัติ": "Auto sweep",
"แสดงตาม frame rate จริง": "Show at the real frame rate",
"ลาก = หมุน · scroll = ซูม · Shift+ลาก = เลื่อน · ดับเบิลคลิก = มุมเริ่มต้น · จุดเหลือง = contact patch (รัศมี a จาก model)": "drag = rotate · scroll = zoom · Shift+drag = pan · double-click = reset view · yellow dots = contact patches (radius a from the model)",
"▶ กด–ค้าง–ปล่อย": "▶ Press–hold–release",
"สูงสุด": "Max",
"ช้า ×¼": "Slow ×¼",
"วนซ้ำ": "Loop",
"แบบ": "Shape",
"กด–ค้าง–ปล่อย": "Press–hold–release",
"เคาะ 3 ครั้ง": "Tap 3 times",
"ค้าง + สั่น 5 Hz": "Hold + 5 Hz vibration",
"เวลา hold จำลอง": "Simulated hold time",
"จริง": "Real",
"อุณหภูมิ ΔT": "Temperature ΔT",
"แรงกดที่ดู": "Pressure shown",
"สัญญาณ vs แรง": "Signal vs force",
"★ หาค่าที่ดีที่สุด": "★ Find best values",
"กลไก": "Mechanics",
"การพิมพ์": "Printing",
"วงจรอ่านค่า": "Readout circuits",
"drift / creep / รวมสัญญาณ": "drift / creep / fusion",
"ข้อมูลจริง": "Real data",
"สมมติฐานของ model": "Model assumptions",
"เรียนรู้กลไก": "Learn the mechanisms",
"เส้นประแดง = แรงที่ dome แรกแตะ · ซ้ายของเส้นนี้ช่อง R ไม่มีสัญญาณ (dead-zone) แต่ C_A และ C_B ยังเปลี่ยน · กราฟ resolution = noise ของวงจร ÷ ความชันของสัญญาณ (ตั้งค่า noise ในหมวด \"วงจรอ่านค่า\")": "Red dashed line = pressure at which the first dome touches · left of it channel R has no signal (dead zone) but C_A and C_B still change · resolution graph = circuit noise ÷ signal slope (set the noise under \"Readout circuits\")",
"ให้ simulator ลองทุกแบบ แล้วบอกว่าแบบไหนดีที่สุด": "Let the simulator try every design and tell you which is best",
"ข้อ 1–4 เลือกโครงสร้างของชั้น capacitive และ micro-gap · ข้อ 5 เทียบวัสดุ piezo จาก Table 1 เมื่อใช้เป็น dielectric ระหว่าง E1–E2 (คำนวณทันที ไม่ต้องกดปุ่ม)": "Items 1–4 choose the structure of the capacitive layer and micro-gap · item 5 compares Table 1 piezo materials used as the dielectric between E1–E2 (computed instantly, no button needed)",
"คำนวณทุกการผสมของ": "Computes every combination of",
"วัสดุ dielectric × ความพรุน × ความหนา × ชนิด electrode × ความหนา PI × micro-gap": "dielectric material × porosity × thickness × electrode type × PI thickness × micro-gap",
"ด้วย model เดียวกับด้านบน แล้วให้คะแนน 7 ด้าน ค่าเริ่มต้นแสดงเฉพาะแบบที่ผลิตได้ด้วยกระบวนการ s-gDLP ทุกชั้น (เอาเครื่องหมายออกเพื่อเทียบกับแบบที่ใช้ฟิล์มและโลหะ) ค่าอื่นทั้งหมด (dome, CNT, วงจรอ่าน, piezo) ใช้ตามที่ตั้งไว้ในแผงซ้าย": "with the same model as above and scores 7 aspects. By default only designs that can be made entirely by the s-gDLP process are shown (untick to compare with designs using films and metals). All other values (domes, CNT, readout, piezo) follow the left panel",
"คำนวณแบบเร็ว": "Fast run",
"คำนวณแบบละเอียด": "Full run",
"เฉพาะแบบที่พิมพ์ด้วย s-gDLP ได้ทุกชั้น": "Only designs printable entirely by s-gDLP",
"ยังไม่ได้คำนวณ": "Not computed yet",
"1 · เลือกสิ่งที่ต้องการ (1–3 ด้าน) แล้วดูแบบที่แนะนำ": "1 · Choose what you want (1–3 aspects) and see the recommended design",
"กด “คำนวณ” ก่อน": "Press “run” first",
"2 · ถ้าต้องการให้ดีที่สุดเพียงด้านเดียว": "2 · If you want only one aspect at its best",
"3 · ถ้าต้องการสองด้านพร้อมกัน (คลิกช่องเพื่อดูรายละเอียด)": "3 · If you want two aspects together (click a cell for details)",
"4 · ภาพรวมของทุกแบบ: ได้อย่างเสียอย่าง": "4 · Overview of all designs: every gain has a cost",
"แกน X": "X axis",
"แกน Y": "Y axis",
"5 · วัสดุ piezo ที่ใช้เป็น dielectric ระหว่าง E1–E2: ทุกกลุ่มใน Table 1 ของ Tang 2025": "5 · Piezo material used as the dielectric between E1–E2: every family in Table 1 of Tang 2025",
"วิธีเลือก: ปรับทุกด้านเป็นสเกล 0 (ดีที่สุดในชุด) ถึง 1 (แย่ที่สุด) แล้วเลือกแบบที่ด้านที่แย่ที่สุดในกลุ่มที่เลือกมีค่าน้อยที่สุด (min–max) · ผลขึ้นกับค่าที่ยัง ⚠ ต้องวัด (modulus ของ TPU, noise จริง, สัมประสิทธิ์อุณหภูมิ, β ของ large deflection) และ “ผลิตง่าย” เป็นคะแนนที่ประเมินเอง ใช้ผลนี้เพื่อเลือกว่าควรทดลองแบบไหนก่อน ไม่ใช่คำตอบสุดท้าย": "How the choice is made: every aspect is scaled from 0 (best in the set) to 1 (worst), and the design whose worst chosen aspect is smallest wins (min–max) · results depend on values still ⚠ to be measured (TPU modulus, real noise, temperature coefficients, large-deflection β), and “easy to make” is our own rating. Use this to decide what to try first, not as the final answer",
"แรงบน dome แต่ละลูก ที่แรงกดที่ดู": "Force on each dome at the pressure shown",
"การยุบของแผ่นบน (มองจากด้านบน)": "Top plate deflection (top view)",
"ชั้นของ stack capacitive": "Capacitive stack layers",
"แรงที่กดค้าง (kPa)": "Held pressure (kPa)",
"นานเท่าไร (นาที)": "Duration (min)",
"ทีละ (s)": "Step (s)",
"อุณหภูมิเพิ่ม ΔT (K)": "Temperature rise ΔT (K)",
"τ ของ complementary filter (s)": "Complementary filter τ (s)",
"รัน": "Run",
"เอาค่าวัดจริงมาซ้อนและ fit": "Overlay and fit real measurements",
"ไฟล์ CSV แถวแรกเป็นหัวคอลัมน์:": "CSV file, first row is the header:",
"(บังคับ) และอย่างน้อยหนึ่งใน": "(required) and at least one of",
"เลือกไฟล์ CSV": "Choose CSV file",
"ดาวน์โหลดไฟล์ตัวอย่าง": "Download example file",
"fit ช่อง R (ρₜ, film □)": "fit channel R (ρₜ, film □)",
"fit ช่อง C (parasitic, porosity)": "fit channel C (parasitic, porosity)",
"ส่งออกผล sweep (.csv)": "Export sweep results (.csv)",
"ไฟล์ตัวอย่างเป็นตัวเลขสมมติเพื่อดูรูปแบบเท่านั้น ไม่ใช่ค่าวัดจริง": "The example file contains made-up numbers to show the format only, not real measurements",
"สมมติฐานของ model (อ่านก่อนเชื่อตัวเลข)": "Model assumptions (read before trusting the numbers)",
"ลำดับชั้นของ stack": "Stack order",
"(ล่าง→บน): E1 → base PI → dielectric → E2 → cover PI · E1 อยู่ผิวล่างสุดจึงแตะชั้น CNT ของ dome ได้โดยตรง ตรงกับที่ model ช่อง A คิด · ⚠ base PI อยู่ระหว่าง E1 กับ E2 ด้วย แต่ C_B ของ model คิดเฉพาะ dielectric (ไม่รวม PI ที่ต่ออนุกรม) ค่า C_B จริงจึงต่ำกว่า model เล็กน้อย — ตั้ง \"PI ที่รองรับ E1\" = 0 ถ้า E1 พิมพ์ลงบน dielectric โดยตรง": "(bottom→top): E1 → base PI → dielectric → E2 → cover PI · E1 is the lowest surface so it can touch the CNT layer of the domes directly, as the channel A model assumes · ⚠ the base PI also lies between E1 and E2, but the model's C_B counts only the dielectric (not the PI in series), so the real C_B is slightly lower — set \"PI carrying E1\" = 0 if E1 is printed directly on the dielectric",
": เมื่อแผ่นบนยุบมากเทียบกับความหนา แผ่นจะยืดและแข็งขึ้น ใช้รูป w_linear = w(1 + β(w/tₑ)²) กับค่าเฉลี่ยของการยุบ โดย tₑ = √(12D/A) (A = ความแข็งแบบยืดรวมของทุกชั้น) · β เป็นค่าของแผ่นขอบยึดแน่นไม่เลื่อน ซึ่งเป็นขอบบนของความแข็ง (border ยางจริงยอมให้ขอบขยับได้บ้าง) · ปิดได้ในหมวด “การคำนวณ”": ": when the top plate deflects a lot compared with its thickness, it stretches and stiffens. The model uses w_linear = w(1 + β(w/tₑ)²) with the mean deflection, where tₑ = √(12D/A) (A = combined stretching stiffness of all layers) · β is for a clamped, non-sliding edge, an upper bound on stiffness (the real rubber border lets the edge move a little) · can be switched off under “Computation”",
"border ยุบตัว": "Border compression",
": border เป็นแถบยาง TPU ที่ยึดสองหน้า รับแรงส่วนที่ dome ไม่ได้รับ ยุบ = (p·a² − ΣF_dome)/k_b โดย k_b = E(1+2S²)A_b/H₀ (Gent–Lindley) ทั้ง stack จึงเลื่อนลงและ dome ที่เตี้ยกว่าแตะตามได้ที่แรงสูง · ปิดได้ในหมวด “การคำนวณ”": ": the border is a TPU rubber strip bonded on both faces that carries the load the domes do not; compression = (p·a² − ΣF_dome)/k_b with k_b = E(1+2S²)A_b/H₀ (Gent–Lindley). The whole stack moves down, so shorter domes can touch at high force · can be switched off under “Computation”",
"ความต้านทานช่อง A (สมการใหม่)": "Channel A resistance (new equations)",
": ต่อ dome = ผิวสัมผัส ρₜ/A_r + กระจายจากวงสัมผัส R_s/8π + ทางเดินบนฟิล์มตามผิว dome · ถ้า E1 เป็น resin-CNT คิดเป็นแผ่นต้านทานและแก้เป็นโครงข่ายด้วย superposition · ρₜ และ film □ fit กับกระแสของ MEMS 2026": ": per dome = interface ρₜ/A_r + spreading from the contact disc R_s/8π + path along the film over the dome · if E1 is resin-CNT it is treated as a resistive sheet and solved as a network by superposition · ρₜ and film □ are fitted to the MEMS 2026 current",
"วัสดุ piezo เป็น dielectric (แบบที่ยืนยันแล้ว)": "Piezo material as the dielectric (confirmed design)",
": เลือกวัสดุ piezo จาก Table 1 ที่ช่อง “วัสดุ dielectric” สัญญาณ piezo อ่านระหว่าง E1 กับ E2 ไม่มี E3 · C ของคู่เดียวกันคำนวณด้วย model dielectric เดิม ซึ่งให้ ΔC ≈ 0 สำหรับวัสดุเนื้อตัน (แข็งระดับ GPa) · รูปแบบพรุนใช้ d33 ของเนื้อตันและความแข็ง Gibson–Ashby ⚠ ไม่มีค่าที่วัดจริง · ทางเลือกเดิม (piezo เป็นชั้นที่สามบน E2 พร้อม E3) ยังเลือกได้ที่ช่อง “ชั้นบนสุด”": ": choose a Table 1 piezo material under “Dielectric material”; the piezo signal is read between E1 and E2, no E3 · the C of the same pair uses the existing dielectric model, which gives ΔC ≈ 0 for solid materials (GPa-stiff) · porous forms use the solid d33 and Gibson–Ashby stiffness ⚠ no measured values · the earlier alternative (piezo as a third layer on E2 with E3) is still available under “Top layer”",
"สัญญาณ piezo": "Piezo signal",
": โหมด d33 อย่างเดียว Q = d33·p·A บนพื้นที่ electrode, ไม่รวม d31 จากการดัด · ฟิล์มเป็นแหล่งประจุขนานกับ C ของฟิล์ม + สาย และรั่วผ่าน R ขาเข้า · pyroelectric: Q = p_pyro·A·ΔT · E3 เป็นโลหะบาง": ": d33 mode only, Q = d33·p·A over the electrode area, no d31 from bending · the film is a charge source in parallel with the film + cable C and leaks through the input R · pyroelectric: Q = p_pyro·A·ΔT · E3 is thin metal",
"อุณหภูมิ": "Temperature",
": ปรับ modulus ของ TPU และ dielectric, εr (TCC) และ R ของ CNT (TCR) แบบเส้นตรงตาม ΔT · calibration อยู่ที่ ΔT = 0 · ไม่รวมการขยายตัวตามความร้อน (gap 30 µm เปลี่ยนน้อยกว่า 0.1 µm ต่อ 10 K เพราะ border กับ dome เป็น TPU เดียวกัน)": ": TPU and dielectric modulus, εr (TCC) and CNT R (TCR) change linearly with ΔT · calibration at ΔT = 0 · thermal expansion is not included (the 30 µm gap changes by less than 0.1 µm per 10 K because border and domes are the same TPU)",
": noise ของชิปอ่าน C รวมกับ noise ของระบบจริง (ค่าเริ่มต้น 1 fF ⚠) แบบ root-sum-square": ": C readout chip noise combined with real system noise (default 1 fF ⚠) as root-sum-square",
"แผ่นบน (stack capacitive)": "Top plate (capacitive stack)",
"เป็นแผ่นสี่เหลี่ยมยึดแน่นที่ border รับแรงกดสม่ำเสมอ แก้ด้วย finite difference (biharmonic, 13-point) · ตรวจแล้วได้ w = 0.00128 qL⁴/D (ทฤษฎี 0.00126) · ไม่รวม large-deflection / membrane stretching": "is a square plate clamped at the border under uniform pressure, solved by finite differences (biharmonic, 13-point) · checked: w = 0.00128 qL⁴/D (theory 0.00126) · large deflection / membrane stretching not included here",
"เป็น paraboloid สัมผัสแบบ Hertz (รัศมีปลาย R = r²/2h) · ใช้ได้ดีเมื่อ dome ยุบไม่เกิน ~30% ของความสูง · แผ่นบนแข็งกว่า TPU มาก": "are Hertz paraboloids (tip radius R = r²/2h) · valid while a dome compresses less than ~30% of its height · the top plate is much stiffer than TPU",
"ความต้านทานช่อง A": "Channel A resistance",
"= constriction (Holm, ρ/4a) + film/tunneling (ρₜ/A_real) + ทางเดินบน film ของ dome + film ถึง pad · พื้นที่สัมผัสจริง A_real = F/H (asperity) ไม่เกินพื้นที่ Hertz": "= constriction (Holm, ρ/4a) + film/tunnelling (ρₜ/A_real) + path along the dome film + film to the pad · real contact area A_real = F/H (asperities), not larger than the Hertz area",
": percolation σ = σ₀(φ − φc)^t · fit ให้ 5 wt% ≈ 4×10⁻³ S/cm ตามกราฟ Zaki AFM 2025 Fig. 2I · wt% อื่นเป็นการ extrapolate": ": percolation σ = σ₀(φ − φc)^t · fitted so 5 wt% ≈ 4×10⁻³ S/cm per Zaki AFM 2025 Fig. 2I · other wt% are extrapolations",
": Jacobs working curve Cd = Dp·ln(t/tc) · fit ให้ 5 wt% ได้ 20 µm ที่ 350 s (AFM 2025 p.6) · จุดที่สอง (50 µm ที่ 1000 s) ไม่พบใน paper — ต้องยืนยัน · Grayscale ใช้สูตร z = Dp·ln(tG/(T₀·255)) ของ Zaki": ": Jacobs working curve Cd = Dp·ln(t/tc) · fitted so 5 wt% gives 20 µm at 350 s (AFM 2025 p.6) · the second point (50 µm at 1000 s) was not found in the papers — needs confirming · grayscale uses Zaki's z = Dp·ln(tG/(T₀·255))",
"(E1 กับชั้น CNT ก่อนแตะ) = ∫ε₀/gap dA แบบ parallel-plate ไม่รวม fringing": "(E1 and the CNT layer before contact) = ∫ε₀/gap dA, parallel plate, no fringing",
"(E1–E2): dielectric ตันใช้ shape factor (ยางตันโป่งข้าง ยุบยาก) · dielectric พรุนใช้ Gibson–Ashby E(1−φ)² ที่รูพรุนค่อย ๆ ยุบ · εr ผสมแบบ Lichtenecker": "(E1–E2): solid dielectric uses a shape factor (solid rubber bulges sideways and resists compression) · porous dielectric uses Gibson–Ashby E(1−φ)² as the pores collapse · εr mixed by Lichtenecker",
"= standard linear solid (ลด modulus ตามเวลา) ใช้กับ TPU และ dielectric ·": "= standard linear solid (modulus decreasing with time) for TPU and dielectric ·",
"ของ R ตาม log ของเวลา · ไม่ได้จำลอง hysteresis ของ loop ขึ้น-ลง": "of R with log time · up–down hysteresis loops are not modelled",
"ค่าที่มี ⚠": "Values marked ⚠",
"(modulus ของ TPU, TCR, creep) เป็นค่าเดา ต้องวัดจริงก่อนใช้ตัวเลขในงานวิจัย · ใช้แท็บ \"ข้อมูลจริง\" fit ค่าเหล่านี้": "(TPU modulus, TCR, creep) are guesses and must be measured before using the numbers in research · use the \"Real data\" tab to fit them",
"model นี้ใช้เพื่อดูแนวโน้มและ trade-off ไม่ใช่ FEM · ถ้าจะออกแบบจริงควรยืนยันด้วย COMSOL/Abaqus และการวัด": "This model shows trends and trade-offs; it is not FEM · confirm a real design with COMSOL/Abaqus and measurements",
"แหล่งที่มาหลัก": "Main sources",
"กลไกของ sensor — อธิบายสั้น ๆ พร้อมที่มา": "How the sensor works — short explanations with sources",
"ฐานความรู้จาก paper (knowledge/)": "Knowledge base from the papers (knowledge/) — pages are in Thai",
"คลิกเพื่ออ่านสรุปของแต่ละ paper (ตัวเลขทุกค่าระบุหน้า/รูป) ·": "Click to read the summary of each paper (every number cites a page/figure) ·",
"บอกที่มาของทุก parameter และค่าที่ยัง ⚠ ต้องวัด": "gives the source of every parameter and the values still ⚠ to be measured",
"ปิด": "Close",
"ชุดค่าที่ตั้งไว้ให้ลองเทียบกัน": "Presets for comparison",
"โมเดล 3 มิติของ taxel ที่ยุบตามแรงกดจริงจาก model": "3-D model of the taxel deforming under the real pressure from the model",
"ภาพตัดที่แนวกลาง: ความจุของ gap, เส้นสนามไฟฟ้า และเส้นทางกระแส": "Mid-plane cross-section: gap capacitance, electric field lines and current paths",
"วงจร A และ B ที่ใช้ E1 ร่วมกัน พร้อมค่าปัจจุบันของทุกชิ้น": "Circuits A and B sharing E1, with the present value of every part",
"array ทั้งแผ่น: ลากนิ้วจำลองเพื่อดูสองช่องสัญญาณ": "Whole array: drag a simulated finger to see both channels",
"แยกแต่ละชั้นออกจากกันในแนวดิ่ง": "Separate the layers vertically",
"ตัดครึ่งที่ y = 0 เพื่อดูหน้าตัด": "Cut at y = 0 to show the section",
"ชื่อและความหนาของแต่ละชั้น": "Name and thickness of each layer",
"ขยายเฉพาะแนวดิ่งของทุกชั้น ×1 = สัดส่วนจริง": "Exaggerate only the vertical scale of all layers ×1 = true scale",
"ขยายเฉพาะบริเวณปลาย dome ถึง stack": "Zoom on the region from the dome tips to the stack",
"เส้นสนามไฟฟ้าโดยประมาณ (ตรงแนวดิ่ง ไม่รวม fringing)": "Approximate electric field lines (vertical, no fringing)",
"อ่าน R ด้วย voltage divider": "R read by voltage divider",
"กระตุ้นด้วย AC แล้วแยก R กับ C ด้วย lock-in": "AC excitation, R and C separated by lock-in",
"ความถี่ excitation (ค่าเดียวกับหมวดวงจรอ่านค่า)": "Excitation frequency (same as in the readout section)",
"นิ้ว: การกระจายแรงแบบ Hertz บนวงสัมผัส · วัตถุแข็ง: แรงกดสม่ำเสมอ (สมมติฐาน)": "Finger: Hertz force distribution over the contact disc · rigid object: uniform pressure (assumption)",
"เลื่อนนิ้วไปกลับ 12 mm/s": "Move the finger back and forth at 12 mm/s",
"อัปเดตภาพตาม frame rate ของ readout ที่ตั้งไว้": "Update the picture at the readout frame rate set",
"ไล่แรงกดขึ้น ค้าง แล้วปล่อย — ทุกมุมมอง ตัวเลข และกราฟอัปเดตพร้อมกัน": "Ramp the pressure up, hold, then release — every view, number and graph updates together",
"timeline: ลากเพื่อดูทีละจังหวะ": "timeline: drag to step through",
"แรงกดสูงสุดของ animation": "Maximum pressure of the animation",
"เล่นช้าลง 4 เท่า": "Play 4× slower",
"รูปแบบการกด: ค้าง = ดู creep/drift · เคาะและสั่น = เห็นช่อง piezo ชัด": "Press shape: hold = see creep/drift · tap and vibration = see the piezo channel clearly",
"เร่งเวลาของช่วง hold ใน model creep/drift (SLS + log-time) · ไม่ได้จำลองการคืนตัวตอนปล่อย": "Speeds up the hold phase in the creep/drift model (SLS + log-time) · recovery after release is not modelled",
"อุณหภูมิที่ต่างจากตอน calibrate: ยางนิ่ม/แข็งขึ้น, εr และ R ของ CNT เปลี่ยน, piezo ให้ประจุ pyroelectric": "Temperature different from calibration: rubbers soften/stiffen, εr and CNT R change, piezo gives pyroelectric charge",
"oscilloscope: แรงที่ประมาณจากแต่ละช่อง (calibration ตอน t = 0), R(t), C_A(t), C_B(t)": "oscilloscope: force estimated by each channel (calibration at t = 0), R(t), C_A(t), C_B(t)",
"เหลือเฉพาะแบบที่ dielectric เป็น TPU resin, electrode เป็น resin-CNT และไม่มีฟิล์ม PI — ทุกชั้นทำด้วย s-gDLP": "Keep only designs with TPU resin dielectric, resin-CNT electrodes and no PI film — every layer made by s-gDLP"
};
function translateStatic() {
  document.documentElement.lang = LANG;
  if (LANG !== "en") return;
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
  nodes.forEach(n => { const t = n.nodeValue.trim(); if (t && STATIC_EN[t] != null) n.nodeValue = n.nodeValue.replace(t, STATIC_EN[t]); });
  document.querySelectorAll("[title],[placeholder]").forEach(el => ["title", "placeholder"].forEach(a => { const v = el.getAttribute(a); if (v && STATIC_EN[v] != null) el.setAttribute(a, STATIC_EN[v]); }));
}
function setLang(l) {
  try { localStorage.setItem("taxel_lang", l); } catch (e) {}
  try { if (typeof P !== "undefined") sessionStorage.setItem("taxel_P", JSON.stringify(P)); } catch (e) {}
  location.hash = "lang=" + l; location.reload();
}
if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => {
  translateStatic();
  const b = document.getElementById("lang-btn");
  if (b) { b.textContent = LANG === "en" ? "ไทย" : "EN"; b.title = LANG === "en" ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"; b.addEventListener("click", () => setLang(LANG === "en" ? "th" : "en")); }
});
