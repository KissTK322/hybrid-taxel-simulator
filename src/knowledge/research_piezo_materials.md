# Piezoelectric layer candidates — sourced material constants

Compiled by web research on 2026-10-12, for choosing one material from Table 1 of Tang et al., "Recent Progress in Flexible Piezoelectric Tactile Sensors", *Sensors* 2025, 25, 964.

**Rules used in this file**

- A number is listed only if it was read on a fetched page or in the text of a fetched PDF. The source tag in square brackets points to section 2.
- "snippet/abstract only" means the number was seen only in a search-result summary or a repository abstract, not in the full page. Treat those as leads, not as verified values.
- "not found" means no sourced value was obtained in this session. Nothing is filled in from memory.
- d33 signs follow each source. Polymer sources quote d33 as negative; magnitude is what a simulator normally needs.
- pC/N and pm/V are numerically the same unit for d coefficients.

---

## 1. Comparison table

| Property | (a) PVDF film, poled | (b) P(VDF-TrFE) copolymer film | (c) PZT ceramic (5H) and PZT/silicone composite | (d) BaTiO3 ceramic and BaTiO3/PDMS | (e) ZnO thin film / nanorods | (f) AlN thin film |
|---|---|---|---|---|---|---|
| d33 (pC/N) | -33 [S1 Table 1] | -38 [S1 Table 1, "Copolymer"]; -24 to -30 for FC20 (80/20), -18 to -22 for FC30 (70/30) [S2] | 650 for 5H, 390 for 5A [S4]; 593 for PZT-5H [S6]. Composite: 78.33 for 28 vol% PZT-PDMS, corona poled — snippet/abstract only [S12] | Ceramic 191; single crystal 85.6 [S6]. BaTiO3/PDMS d33: not found | Single crystal 12.3 [S6]. Sputtered film 8 pm/V — snippet/abstract only [S14] | 3–4 on polyimide, 8 on SiO2/Si [S9]; single crystal 5, epitaxial film 5.53 [S6]; d33,f 3.4 pm/V — snippet/abstract only [S10] |
| d31 (pC/N) | 23 [S1 Table 1] | 11 [S1 Table 1] | -320 for 5H, -190 for 5A [S4]; -274 [S6] | Ceramic -79 [S6]; 78 (magnitude) [S1 Table 2]. BaTiO3/PDMS 15 wt%: 24, unpoled cast film [S8] | -5.12 single crystal [S6] | -2 single crystal; -2.5 film [S6] |
| g33 (V·m/N) | -0.330 [S1 Table 1] | -0.542 [S1 Table 1] | 0.019 for 5H, 0.024 for 5A [S4] | not found (g31 = 0.005 [S1 Table 2]) | not found | not found |
| Relative permittivity | 12–13 [S1 Table 1]; "about 12" [S1 p.15] | 7–8 [S1 Table 1] | 3800 for 5H, 1800 for 5A at 1 kHz [S4]. Composite: about 10 — snippet/abstract only [S12] | Ceramic ε33 = 1680 [S6]; 1700 [S1 Table 2]. BaTiO3/PDMS: not found as a number (figure only) [S8] | ε33 = 11.26, ε11 = 8.67 single crystal [S6] | ε33 = 9.5 epitaxial film; 11.4 single crystal [S6] |
| Young's modulus (GPa) | 2–4 [S1 Table 1] | 3–5 [S1 Table 1] | 50 (Y3) and 62 (Y1) for 5H [S4]. Composite: about 0.010 (10 MPa) — snippet/abstract only [S12] | Bulk 50–80 [S8 Table 1]. BaTiO3/PDMS: 0.0009 (pure PDMS) to 0.0034 (30 wt%) [S8] | not found | 330 for bulk AlN ceramic, summary value [S11]; thin-film value not found |
| Pyroelectric coefficient (µC/m²K) | 30 [S1 Table 1 and Table 5]; -27 total [S7] | 40 [S1 Table 1]; 50 for "VF2VF3" [S1 Table 5] | 420 for PZT [S1 Table 5]; -268 total for PbZr0.95Ti0.05O3 [S7] | 400 [S1 Table 5]; -200 total [S7] | -9.4 total [S7] | 4.8 — snippet/abstract only [S10] |
| Max use / Curie / depoling temperature | Range -40 to 80…100 °C; "not recommended for use or storage above 100 °C" [S1]. Upper thermal stability 80 °C [S2] | Range -40 to 115…145 °C; "as high as 135 °C" [S1]. Curie 136 °C (FC20), 115 °C (FC25), 100 °C (FC30), 60 °C (FC45); FC20 thermal stability 130 °C [S2] | Curie 230 °C for 5H, 350 °C for 5A [S4] | Curie "between 120 and 130 °C" [S5] | not found | not found on a fetched page |
| Thickness and process | 9, 28, 52, 110 µm rolls. Melt extrusion, stretching to about one-fifth thickness, then poling in "very high electric fields" [S1] | <1 to 1200 µm; spin-cast down to 200 Å [S1]. Dissolve below 80 °C, print or coat, anneal 2–15 min between Curie and melting point (140–145 °C preferred for FC20), then pole [S3] | Ceramic: sintered at 1000–1300 °C [S13]. Poling field >1.5 MV/m for 5H [S4]. Composite: PZT particles in PDMS, corona poled — snippet/abstract only [S12] | Composite: BaTiO3 (<2 µm) stirred into PDMS at 70 °C, cured 90 °C for 1 h, 100 µm film [S8]. Ceramic sintering 1300–1400 °C — snippet only | Nanorods grown from solution at "about 90 °C" [S15]; films by CVD, sputtering, ALD [S15]. RF-sputtered films 285–1380 nm — snippet/abstract only [S14] | Sputtered on polyimide "at 160 °C or even at room temperature" [S9] |
| Poling required? | Yes (stretch, then pole) [S1] | Yes, but "polarizable without stretching" [S1]. Up to 100 V/µm, AC 0.1–10 Hz advised, contact or corona [S3] | Yes [S4 lists polarizing field] | Yes for ceramic (ferroelectric); the cited cast composite was not poled [S8] | not found on a fetched page | not found on a fetched page |
| Lead / toxicity / flexibility | Lead-free, flexible, "mechanically tough" [S1]. Sensitive to temperature changes [S13] | Lead-free; "easy polarization and high flexibility" [S13] | Contains lead oxide; "poor flexibility", "low mechanical strength" as bulk ceramic [S13]. PZT in silicone rubber up to 92 wt% keeps 30% tensile property [S13] | Lead-free [S8]. GHS "Warning", H302/H332 [S5]. Composite is soft (MPa range) [S8] | "Zinc oxide itself is non-toxic" [S15] | GHS "Warning" [S16]; flexibility on polyimide shown [S9] |

Notes on reading the table:

- The copolymer column in [S1] is MSI's own copolymer film; the manual does not state its VDF/TrFE ratio. The Piezotech values [S2] are per grade.
- [S1] Table 1 gives a pyroelectric coefficient of 40 for copolymer, while [S1] Table 5 gives 50 for "VF2VF3". Both are from the same manual; the difference is not explained there.
- For ceramics, [S1] Table 5 and [S7] disagree by a factor of about 1.5–2 on the pyroelectric coefficient. Composition and measurement method differ.
- Bulk ZnO and AlN constants are single-crystal or bulk-ceramic values. Thin-film values on a flexible substrate are lower and process dependent (AlN on polyimide reached 3–4 pC/N in [S9] against 8 pC/N on rigid silicon).

---

## 2. Per-source details

### S1 — Measurement Specialties (now TE Connectivity), "Piezo Film Sensors Technical Manual"

- URL: https://courses.media.mit.edu/2022spring/mas836/readings/MSI-techman.pdf (89-page PDF, text extracted and read)
- Table 1, "Typical properties of piezo film" (page 3), PVDF / Copolymer:
  - Thickness: 9, 28, 52, 110 µm / <1 to 1200 µm
  - d31: 23 / 11 (10⁻¹² C/N); d33: -33 / -38
  - g31: 216 / 162 (10⁻³ V·m/N); g33: -330 / -542
  - k31: 12% / 20%; kt: 14% / 25–29%
  - Capacitance: 380 pF/cm² for 28 µm / 68 pF/cm² for 100 µm, at 1 kHz
  - Young's modulus: 2–4 / 3–5 (10⁹ N/m²)
  - Pyroelectric coefficient: 30 / 40 (10⁻⁶ C/m²·K)
  - Permittivity: 106–113 / 65–75 (10⁻¹² F/m); relative permittivity: 12–13 / 7–8
  - Density: 1.78 / 1.82 (10³ kg/m³)
  - Loss tangent: 0.02 / 0.015 at 1 kHz
  - Temperature range: -40 to 80…100 / -40 to 115…145 °C
  - Maximum operating voltage 750 V/mil (30 V/µm); breakdown 2000 V/mil (80 V/µm), DC at 25 °C
- Table 2, "Comparison of piezoelectric materials" (page 4), PVDF film / PZT / BaTiO3:
  - Relative permittivity 12 / 1,200 / 1,700
  - d31 23 / 110 / 78 (10⁻¹² C/N); g31 216 / 10 / 5 (10⁻³ V·m/N)
  - k31 12 / 30 / 21 (% at 1 kHz); density 1.78 / 7.5 / 5.7
- Table 5, "Comparison of pyroelectric materials" (page 35): pyroelectric charge coefficient in µC/(m²·K): BaTiO3 400, PZT 420, PVDF 30, VF2VF3 50. Dielectric constant: BaTiO3 1000, PZT 1600, PVDF 10.7, VF2VF3 8.0.
- Temperature limit: "The copolymer film has maximum operating/storage temperatures as high as 135°C, while PVDF is not recommended for use or storage above 100 °C."
- Process: "melt extrusion of PVDF resin pellets into sheet form, followed by a stretching step that reduces the sheet to about one-fifth its extruded thickness"; then the film "is then exposed to very high electric fields". "Copolymers of PVDF are polarizable without stretching."
- Copolymer thickness: "ultrathin (200 Å) spin-cast coatings".
- Pyroelectric warning: "care must be taken when designing low (<0.01 to 1Hz) frequency mechanical sensors to avoid ambient temperature changes swamping the output with pyro-generated signal." DT1 element pyro conversion: "8V/°K (@ 25 °C)".
- Pyro example 5: 9 µm film, ε = 106×10⁻¹² C/Vm, p = 30×10⁻⁶ C/(m²·K), ΔT = 1 K gives V = 2.55 V, using V = p·t·ΔT/ε.
- Readout quotes are in section 3.

### S2 — Arkema Piezotech, "Piezotech FC" copolymer product page

- URL: https://piezotech.arkema.com/en/Products/piezoelectric-copolymers/
- Values are stated by Arkema as indicative, not specifications.
- FC20 (20 mol% TrFE): Curie 136 °C, remnant polarization 85 mC/m² at 150 V/µm, d33 -24 to -30 pC/N.
- FC25: Curie 115 °C, 70 mC/m². d33 not listed.
- FC30: Curie 100 °C, 65 mC/m², d33 -18 to -22 pC/N.
- FC45: Curie 60 °C, 45 mC/m². d33 not listed.
- "Upper thermal stability (80 °C for PVDF versus 130°C for Piezotech® FC20)".
- "Improved coupling factor (0.15 for PVDF versus 0.3 for P(VDF-TrFE))".
- Not on this page: d31, permittivity, Young's modulus, pyroelectric coefficient.

### S3 — Arkema Piezotech technical FAQ

- URL: https://piezotech.arkema.com/en/Technical-center/FAQ/
- Dissolution: "very good mechanical stirring under moderate heating (below 80 °C)".
- Annealing: "between the Curie temperature and the melting point, in the paraelectric phase, for 2-15 min." "For Piezotech® FC20, 80/20 P(VDF-TrFE), the 140-145 °C range is preferred."
- Poling: "Contact poling with top and bottom electrode, or non-contact Corona poling with only the bottom electrode". Field "up to twice the coercive field: 100 V.µm-1". "AC is advised with frequencies in the 0.1-10 Hz range."
- Worked example on the page uses (d31, d32, d33) = (11, 10, -30) pC/N. This is an example, not a specification.
- No recommended film thickness is given; examples use 9 µm and 100 µm.

### S4 — Piezo.com (Mide/Piezo Systems), "Piezo Materials and Properties"

- URL: https://piezo.com/pages/piezo-material
- PSI-5A4E (5A) / PSI-5H4E (5H):
  - Relative dielectric constant at 1 kHz: 1800 / 3800
  - d33: 390 / 650 (10⁻¹² m/V); d31: -190 / -320
  - g33: 24.0 / 19.0 (10⁻³ V·m/N); g31: -11.6 / -9.5
  - k33: 0.72 / 0.75; k31: 0.35 / 0.44
  - Polarizing field: >2×10⁶ / >1.5×10⁶ V/m; coercive field about 1.2×10⁶ / 8×10⁵ V/m
  - Elastic modulus Y3: 5.2×10¹⁰ / 5.0×10¹⁰ N/m²; Y1: 6.6×10¹⁰ / 6.2×10¹⁰ N/m²
  - Density 7800 kg/m³; mechanical Q 80 / 32
  - Curie temperature: 350 / 230 °C
- The page says the 5H type's "upper temperature range is limited".

### S5 — Wikipedia, "Barium titanate"

- URL: https://en.wikipedia.org/wiki/Barium_titanate
- Curie temperature "is between 120 and 130 °C".
- Dielectric constant "values as high as 7,000".
- GHS signal word "Warning", hazard statements H302, H332.
- No d coefficients, Young's modulus, pyroelectric coefficient or sintering temperature on the page.

### S6 — Wikipedia, "List of piezoelectric materials" (table with primary references)

- URL: https://en.wikipedia.org/wiki/List_of_piezoelectric_materials
- BaTiO3 ceramic (Berlincourt and Jaffe 1958): d33 191, d31 -79, d15 270 pC/N; ε11 1440, ε33 1680.
- BaTiO3 single crystal (Cook et al. 1963): d33 85.6, d31 -34.5; ε33 168, ε11 2920.
- ZnO single crystal (Kobiakov 1980): d33 12.3, d31 -5.12, d15 -8.3; ε11 8.67, ε33 11.26. ZnO nanobelt by PFM (Zhao et al. 2004): 14.3–26.7 pm/V.
- AlN single crystal (Hutson 1963): d33 5, d31 -2; ε33 11.4. Epitaxial AlN/Al2O3 (Tsubouchi et al. 1981): d33 5.53, ε33 9.5. Thin film by AFM (Stoppel et al. 2011): d33 5. Film d31 -2.5 (Defaÿ 2011).
- PZT-5H (CTS): d33 593, d31 -274, d15 741; ε33 3400, ε11 3130; k33 0.75. PZT-5A: d33 374, d31 -171; ε33 1700.
- PVDF (Sessler 1981): d33 -27.1, d31 17.9, d32 0.9.
- P(VDF-TrFE) is not in the table.

### S7 — Ballas and Koev, "Pyroelectricity: A Brief History of its Discovery and Physical Principles – an Overview", arXiv:2609.23736

- URL: https://arxiv.org/pdf/2609.23736 (PDF text extracted and read)
- Table 1, primary / secondary / total pyroelectric coefficient in µC·m⁻²·K⁻¹:
  - BaTiO3 ceramic: -260 / +60 / -200
  - PbZr0.95Ti0.05O3 ceramic: -305.7 / +37.7 / -268 (a Zr-rich composition, not PZT-5H)
  - Polyvinylidene fluoride: -14 / -13 / -27
  - ZnO: -6.9 / -2.5 / -9.4
- AlN and P(VDF-TrFE) are not in this table.

### S8 — "Electromechanical Performance and Figure of Merit Optimization for Flexible Lead-Free PDMS–BaTiO3 Piezocomposites"

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11223227/
- "d31 = 24 pC N–1" for the 15 wt% BaTiO3 composite. No d33 is reported.
- g31 = 0.55 V·m/N.
- Young's modulus from tensile tests: pure PDMS 0.9 MPa; 10 wt% 1.04; 15 wt% 1.2; 20 wt% 2.24; 25 wt% 3.05; 30 wt% 3.4 MPa (maximum).
- Process: stir at 70 °C for 1 h, PDMS 10:1, cure in a 90 °C oven for 1 h; film thickness 100 µm; BaTiO3 particle size below 2 µm (SEM average 1.66 µm).
- No poling step is reported; polarized composites are named as future work.
- Table 1 of the paper lists bulk BaTiO3: density 6.08 g/cm³, Young's modulus 50 to 80 GPa, dielectric constant 100 to 200 (this permittivity range is far below the ceramic values in S1 and S6).
- Composite permittivity appears only in a figure, so no number was recorded.

### S9 — Smecca et al., "AlN texturing and piezoelectricity on flexible substrates for sensor applications", Appl. Phys. Lett. 106(23), 2015

- URL: https://www.imm.cnr.it/publications/aln-texturing-and-piezoelectricity-flexible-substrates-sensor-applications (publication record with abstract)
- "relatively high piezoelectric coefficient (d33) values (3–4 pC/N)" on polyimide; 8 pC/N on rigid SiO2/Si.
- Devices "can be fabricated on polyimide (PI) substrates at 160 °C or even at room temperature by sputtering processes."
- Performance is reduced on PEN compared with polyimide.

### S10 — Dubois and Muralt, Appl. Phys. Lett. 74(20), 3032–3034 (1999) — snippet/abstract only

- Record: https://infoscience.epfl.ch/handle/20.500.14299/233369 (fetch returned HTTP 429; values seen only in the search summary)
- Reactively sputtered AlN on platinized silicon: effective d33 3.4 pm/V, effective e31 1.0 C/m², pyroelectric coefficient +4.8 µC·m⁻²·K⁻¹.

### S11 — MakeItFrom, "Aluminum Nitride (AlN)"

- URL: https://www.makeitfrom.com/material-properties/Aluminum-Nitride-AlN
- Elastic modulus "330 GPa"; dielectric constant at 1 MHz "6.9 to 28" (summary across five bulk variants, including a lossy composite grade). Bulk ceramic, not sputtered film.

### S12 — Sappati and Bhadra, flexible 0-3 PZT-PDMS thin film for tactile sensing (2019) — snippet/abstract only

- Record: https://escholarship.mcgill.ca/downloads/bn999c00n (redirected to the repository home page; full text not read)
- 28 vol% PZT poled film: d33 78.33 pC/N, Young's modulus about 10 MPa, relative permittivity about 10. Corona poled. Poling field not found.

### S13 — Tang et al., Sensors 2025, 25, 964 (the assigned review)

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11821041 (the PMC and MDPI pages were blocked for automated fetching; the quotes below are from text of the article PDF already extracted in this project's session files)
- Table 1 of the review lists device performance (sensitivity, voltage, size) per material, not material constants. It gives no d33, permittivity or modulus column.
- Ceramics "are sintered at high temperatures of 1000 °C to 1300 °C"; drawbacks are "poor temperature stability, low mechanical strength, poor flexibility".
- PZT in silicone rubber: "could be raised to 92 wt% while maintaining an acceptable tensile property of 30%".
- "Although ZnO's piezoelectric coefficient (d33) is low, its outstanding semiconductor and photovoltaic qualities make it a popular material".
- "PVDF-TrFE has the advantages of easy polarization and high flexibility."
- Sm:PMN-PT film on mica: d33 of 380 pm/V.
- Comparison table of sensing principles lists piezoelectric sensors as "Sensitive to temperature changes".

### S14 — Laurenti et al., sputtered ZnO on rigid and flexible substrates, Nanotechnology 2015 — snippet/abstract only

- Record: https://iris.polito.it/handle/11583/2604755 (fetch returned HTTP 403)
- RF magnetron sputtered ZnO, thicknesses 285, 710 and 1380 nm; highest d33 8 pm/V on the hard substrate; flexible substrate was Cu-coated polyimide. Deposition temperature not found.

### S15 — Wikipedia, "Zinc oxide"

- URL: https://en.wikipedia.org/wiki/Zinc_oxide (first 100,000 characters read)
- Nanorod synthesis is "typically carried out at temperatures of about 90 °C" in aqueous zinc nitrate and hexamine.
- Thin-film methods listed: chemical vapor deposition, sputtering, atomic layer deposition. No temperatures given.
- "Zinc oxide itself is non-toxic".
- Young's modulus, permittivity and d33 are not given on the page.

### S16 — Wikipedia, "Aluminium nitride"

- URL: https://en.wikipedia.org/wiki/Aluminium_nitride
- e31 = -0.60 C/m², e33 = 1.46 C/m². GHS signal word "Warning".
- Young's modulus and permittivity are not given on the page.

### Slip and vibration papers

**S17 — Yamada, Maeno, Fujimoto, Morizono, Umetani, "Identification of Incipient Slip Phenomena Based on The Circuit Output Signals of PVDF Film Strips Embedded in Artificial Finger Ridges", SICE 2002, Osaka**

- URL: https://resenv.media.mit.edu/classarchive/MAS965/readings/RidgeDesign.pdf (PDF text extracted and read)
- Pairs of PVDF film strips (30 mm long) embedded in silicone-rubber ridges of an artificial finger skin 20 mm wide.
- Readout: PVDF transducer followed by a differential amplifier built on a high input impedance op amp, for common-mode noise rejection.
- Circuit characterised from 2 to 20000 Hz: "First order (20 dB/dec) frequency characteristic appears in the range from 2 to 2000 Hz" (the "stress rate" behaviour); gain saturates above 2000 Hz.
- Slip experiment sampled at "1000 Hz sampling rate".
- A minimum-phase low-pass FIR filter with "cut off frequency 28 Hz" extracts the low-frequency pattern; incipient slip shows as a high-frequency component superposed on it.
- Film thickness: not stated in the text read.

**S18 — Nikafrooz, Fuge, Leonessa, "Grasp Control of a Cable-Driven Robotic Hand Using a PVDF Slip Detection Sensor", arXiv:2202.06140 (2022)**

- URL: https://arxiv.org/pdf/2202.06140v1 (PDF text extracted and read)
- PVDF strip 10 × 25 mm on the index fingertip; "active film thickness of the strip is 45 µm, while the total thickness is 80-90 µm".
- Piezoelectric charge constant "in the range of 22-28 pC/N for this PVDF strip".
- Filter: integrator plus lead compensator, G(s) = (100s + 0.1)/(s² + 20s); the squared filtered signal is thresholded with a dead zone.
- The paper gives no pass band in Hz. It states that slip and unwanted excitations "share similar frequency content".

**S19 — "PVDF-based flexible piezoelectric tactile sensor for slip estimation using robotic gripper", Frontiers in Robotics and AI, 2025**

- URL: https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2025.1691688/full
- Sensor: "PVDF sensor (LDT0-028K, TE Connectivity Co. Ltd.)", "a 28 µm thick piezoelectric PVDF polymer film laminated to a 0.125 mm polyester substrate".
- Readout is voltage mode: connected to an Arduino analog input "with a 1 MΩ resistor placed in parallel", 10-bit ADC.
- Silicone cover layers of 0.4, 0.6 and 0.8 cm (Shore A30); thinner layers gave higher slip sensitivity.
- No filter band or sampling rate is reported.

---

## 3. Readout

All quotes in this section are from [S1].

**Equivalent circuit.** Piezo film behaves as "a strain-dependent voltage source in series with a capacitance", so "any resistive load will form a divider network with a simple RC high-pass filter characteristic."

**Low-frequency cutoff.**

- f_c = 1 / (2πRC), with time constant τ = RC.
- With an interface that has input resistance Ri and input capacitance Ci, the time constant is Ri·(Cf + Ci), where Cf is the film capacitance.
- Below the cutoff the output is "proportional to the rate of change of the input parameter (differentiator)". A constant stress gives an initial level followed by an exponential decay.

**Datasheet examples.**

| Sensor capacitance | Load resistance | Time constant | Cutoff | Where in [S1] |
|---|---|---|---|---|
| 1 nF | 10 MΩ (oscilloscope input) | — | "roll off below 16 Hz" | page 6 |
| 2.4 nF (SDT1 shielded sensor) | 10 MΩ + FET | 24 ms | 6.6 Hz | page 38 |
| 2.4 nF (SDT1) | 100 MΩ | — | 0.66 Hz | page 38 |
| 9.5 nF (BL traffic sensor with cable) | 10 MΩ | — | 1.6 Hz | page 39 |

**Voltage mode against charge mode.**

- Voltage mode (high-impedance buffer): "simple voltage amplifiers are sufficient for most applications". Time constant is set by R·C of the film plus input. Up to 50 GΩ input resistance is used when a very low frequency response is needed. Low-leakage parts named: JFET 4117; op amps LMC660, LF353, OP80.
- Charge mode: output is Q/Cf, where Cf is the feedback capacitor. "the output voltage of a charge amplifier is independent of the cable capacitance". Time constant is set by the feedback pair R·Cf.
- Temperature: "voltage amplifiers with piezo film exhibit less temperature dependence", because g varies less with temperature than d.
- Noise: "a high input resistance can also produce higher noise".
- Pyroelectric and other unwanted signals are handled by filtering, averaging, and common-mode rejection ("wiring two equal areas of a piezo film electrode out-of-phase").
- Minimum practical frequency quoted for dynamic use: 0.001 Hz.

**Derived example for this project (calculated here, not a sourced number).** Assuming a 4 mm × 4 mm electrode on 28 µm PVDF with εr = 12 [S1]:

- C = ε0·εr·A/t = 8.854×10⁻¹² × 12 × 16×10⁻⁶ / 28×10⁻⁶ ≈ 61 pF. The [S1] figure of 380 pF/cm² gives the same result (0.16 cm² × 380 ≈ 61 pF).
- With 10 MΩ: f_c ≈ 260 Hz. With 100 MΩ: about 26 Hz. With 1 GΩ: about 2.6 Hz.
- A taxel this small therefore needs a very high input resistance, added parallel capacitance, or a charge amplifier to reach the tens-of-Hz band used in [S17].
- Pyroelectric voltage for the same film: V/ΔT = p·t/ε = 30×10⁻⁶ × 28×10⁻⁶ / 106×10⁻¹² ≈ 7.9 V/K, which matches the "8V/°K" the manual quotes for its 28 µm DT1 element.

---

## 4. Recommended simulator defaults

| Parameter | PVDF (poled film) | Source | P(VDF-TrFE) | Source |
|---|---|---|---|---|
| d33 | -33 pC/N | [S1] Table 1 | -38 pC/N for generic copolymer film; use -24 to -30 pC/N if the grade is Piezotech FC20 (80/20), -18 to -22 pC/N for FC30 (70/30) | [S1] Table 1; [S2] |
| d31 | 23 pC/N | [S1] Table 1 | 11 pC/N | [S1] Table 1 |
| g33 | -0.330 V·m/N | [S1] Table 1 | -0.542 V·m/N | [S1] Table 1 |
| Relative permittivity (1 kHz) | 12 (range 12–13) | [S1] Table 1 | 7.5 (range 7–8) | [S1] Table 1 |
| Young's modulus | 3 GPa (range 2–4) | [S1] Table 1 | 4 GPa (range 3–5) | [S1] Table 1 |
| Pyroelectric coefficient | 30 µC/m²K | [S1] Tables 1 and 5; -27 total in [S7] | 40 µC/m²K (50 in [S1] Table 5) | [S1] |
| Maximum temperature | 80 °C (upper limit 100 °C for use or storage) | [S1]; [S2] | 130 °C for FC20 (Curie 136 °C); 100 °C Curie for FC30; MSI copolymer up to 135 °C | [S2]; [S1] |
| Typical thickness | 28 µm (stock: 9, 28, 52, 110 µm) | [S1] Table 1 | Coated or printed film; range <1 to 1200 µm. No single sourced "typical" spin-coat thickness | [S1] Table 1 |
| Processing temperature | Supplied already stretched and poled; laminate only | [S1] | Dissolve below 80 °C; anneal 140–145 °C for 2–15 min (FC20); pole at up to 100 V/µm | [S3] |

Midpoints (3 GPa, 4 GPa, 7.5) are the centre of a sourced range, chosen here for convenience.

**Process note for this project.** The P(VDF-TrFE) anneal at 140–145 °C [S3] should be checked against the heat tolerance of the printed TPU microdomes before choosing the copolymer route. Pre-poled PVDF film needs no anneal but must stay below 80–100 °C [S1].

### Not found in this session

- P(VDF-TrFE): Young's modulus, permittivity and pyroelectric coefficient specific to Piezotech FC grades (only MSI's copolymer values were found); d31 per grade.
- PZT/silicone composite: any value from a fully read page (only abstract-level numbers in [S12]); poling field.
- BaTiO3/PDMS composite: d33 and a numeric permittivity; ceramic sintering temperature and poling field from a fetched page; g33.
- ZnO: Young's modulus; thin-film permittivity; film deposition temperature; an explicit statement on poling; g33.
- AlN: thin-film Young's modulus; maximum use temperature; an explicit statement on poling; pyroelectric coefficient from a fully read page; g33.
- Slip detection with P(VDF-TrFE) specifically (both frequency-band papers found use PVDF).
