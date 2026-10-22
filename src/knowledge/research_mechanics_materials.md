# Research notes: large-deflection plate mechanics, electrode stacks, materials, CDC chips

Compiled by web research on 2026-10-12. Every value below was read on a fetched page unless the Evidence column says **snippet-only** (seen only in a search-result summary, page not opened) or **derived** (my arithmetic from sourced numbers). Items marked **not found** were searched for and not located on a readable page.

Evidence labels: `fetched` = read on the page; `fetched-OCR` = read in OCR text of a scanned book/report (formula typography degraded, numbers cross-checked); `snippet-only`; `derived`.

Symbols: `q` pressure, `w` centre deflection, `t` (or `h`) plate thickness, `D = E t^3 / (12 (1 - nu^2))`, `L` full side of the square span, `a` as defined per row.

---

## 1. Large-deflection load-deflection relations (clamped, immovable edges, uniform pressure)

### 1a. Circular plate

| Quantity | Value / formula | Conditions / definitions | Source | URL | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Approximate large-deflection formula | `w0 = (q a^4 / (64 D)) * 1 / (1 + 0.488 (w0/h)^2)`, i.e. `w_lin = w0 (1 + 0.488 (w0/h)^2)` | `a` = plate **radius**; `h` = thickness; edge clamped, radial displacement `u` vanishes at the edge (immovable); energy method; "It is assumed that nu = 0.3 in this calculation" | Timoshenko & Woinowsky-Krieger, *Theory of Plates and Shells*, art. "Approximate Formulas for Uniformly Loaded Circular Plates with Large Deflections", Eq. (196) in the 1st-ed. scan (ANSYS cites the same result as 2nd ed. Art. 97, Eq. 232, p. 401) | https://archive.org/details/in.ernet.dli.2015.114717 | fetched-OCR: "Let a circular plate of radius a be clamped at the edge"; OCR of the equation reads "qa^4 / 64D ... 1 + 0 4S8..." ; "(196)" | High (0.488 digit string is OCR-degraded but confirmed by the two checks below) |
| Worked check in the same text | at `w0 = h/2`: `w0 = 0.89 * q a^4/(64 D)`; "the deflection in this case is 11 per cent less than that obtained by neglecting the stretching of the middle surface" | same | same book | https://archive.org/details/in.ernet.dli.2015.140098 | fetched-OCR; consistent with 1/(1 + 0.488*0.25) = 0.891 (derived) | High |
| Independent numeric check | Radius 0.25 m, t = 0.0025 m, E = 2e11 Pa, nu = 0.3, q = 6585.18 Pa -> target centre deflection 0.00125 m (= 0.5 t) | ANSYS VM-WB-MECH-011, reference "Timoshenko, Woinowsky-Krieger ... Article 97, Equation 232, p. 401" | ANSYS Workbench verification manual | https://ansyshelp.ansys.com/public/views/secured/corp/v251/en/wb_vm/wbvt_VM-WB-MECH-011.html | fetched (problem data); derived: q a^4/(64 D) = 1.4045e-3 m vs 0.00125*(1+0.488*0.25) = 1.4025e-3 m | High |
| Membrane (cubic) term, circular film | `P = (1 - 0.241 nu) (8/3) (E/(1 - nu)) (t / a^4) w0^3 + 4 (sigma0 t / a^2) w0` | `a` = membrane radius; bulge test, Vinci & Vlassak form | US 6,321,594 B1 (quoting Vinci & Vlassak) | https://patents.google.com/patent/US6321594B1/en | fetched | High |
| Roark circular-plate form `q a^4/(E t^4) = K1 (y/t) + K2 (y/t)^3` with K1, K2 for "fixed and held" | **not found** on a readable page (Roark PDF link 404, GlobalSpec 403, Fermilab memo 403) | - | - | - | snippet-only: a Fermilab memo is reported to say Roark 7th/8th ed. misprint K4 = 1.73 vs 6th ed. K4 = 0.476 for the fixed edge | Low |

### 1b. Square plate, all four edges clamped and held

| Quantity | Value / formula | Conditions / definitions | Source | URL | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Exact (series) solution, tabulated | `p a^4/(E h^4)` = 17.79, 38.3, 63.4, 95.0, 134.9, 184.0, 245.0, 318.0, 402.0 <-> `w_center/h` = 0.237, 0.471, 0.695, 0.912, 1.121, 1.323, 1.521, 1.714, 1.902 | `a` = **full side length** ("length of sides"; plate centre at x = a/2); `h` = thickness; Poisson's ratio 0.316; edges clamped rigidly and prevented from in-plane displacement; valid to w/h = 1.9; author estimates error < 2 % | S. Levy, "Square plate with clamped edges under normal pressure producing large deflections", NACA Report 740 (1942), Table 5 / Fig. 3 | https://ntrs.nasa.gov/citations/19930091819 (OCR text: https://ntrs.nasa.gov/api/citations/19930091819/downloads/19930091819.txt) | fetched-OCR (column order scrambled; the two number series are intact and monotonic; pairing in ascending order) | Medium-High |
| Cubic fit to Levy's table in the requested form | `w_lin = w (1 + beta (w/t)^2)` with **beta = 0.52** (point-by-point beta = 0.48, 0.50, 0.50, 0.51, 0.51, 0.52, 0.52, 0.52 for w/t = 0.47 ... 1.90; least-squares 0.516). Equivalent: `q L^4/(E t^4) = 73.5 (w/t) + 38 (w/t)^3` | `w_lin = 0.00126 q L^4 / D`; `L` = full side; `t` = total thickness of a homogeneous plate; nu = 0.316. K1 = 1/(12 (1 - nu^2) * 0.00126) = 73.5 | derived from Levy Table 5 | as above | derived | Medium-High |
| Linear coefficient used above | alpha = 1.26e-3 for b/a = 1 (2.54e-3 for b/a = 2, 2.6e-3 for infinite strip) | clamped rectangular plate, `w = alpha q L^4 / D`, `L` = full short side | Martins et al. 2008, Table I (citing Timoshenko) | https://arxiv.org/pdf/0805.0899 | fetched | High |
| Bulge-test (membrane) cubic term, square | `f(nu) E t w^3 / ((1 - nu) a^4)` with `f = 1/(0.8 + 0.062 nu)^3` (Vlassak & Nix), or `1.994 (1 - 0.271 nu)` (Maier-Schneider et al.), or `1.91 (1 - 0.207 nu)`; `f(0.3)` = 1.82, 1.83, 1.79, FE 1.80 | **2a = membrane width, so `a` = half side**; `t` thickness | Martins, Malhaire, Brida, Barbier, DTIP 2008, Eq. 1 and Table I | https://arxiv.org/pdf/0805.0899 | fetched (equation typography lost in text extraction; coefficients and "2a and 2b are the membrane width and length" read directly) | Medium-High |
| Residual-stress (pretension) linear term, square | `C1 sigma0 t w / a^2`, C1 = 3.39 (Vlassak), 3.45, 3.42, FE 3.39 | `a` = half side | same, Table I | https://arxiv.org/pdf/0805.0899 | fetched | High |
| Superposition estimate of beta (bending + membrane) | `beta = 192 * alpha * f(nu) * (1 + nu)` -> 0.573 (nu = 0.30), 0.586 (0.34), 0.604 (0.40), 0.618 (0.45) | from `q = D w/(alpha L^4) + 16 f E t w^3/((1 - nu) L^4)` | derived from the two rows above | - | derived. Same procedure on the circular case gives 0.5 (1 - 0.241 nu)(1 + nu) = 0.60 vs Timoshenko 0.488, so simple superposition overestimates beta by roughly 10-25 % | Medium (upper bound) |
| Timoshenko on clamped rectangular plates | energy solution with 11 parameters, b/a = 1, 2/3, 1/2, nu = 0.3; results given only as curves (Fig. 135/136), no closed-form coefficient | sides 2a and 2b | Timoshenko & Woinowsky-Krieger | https://archive.org/details/in.ernet.dli.2015.140098 | fetched-OCR | High |
| Roark large-deflection table for rectangular plates (a/b = 1, edges fixed and held) | **not found** on a readable page | - | - | - | - | - |
| "C2 = 1.98", "4.20 / 1.58" square-diaphragm coefficients | **not found** on a readable page (Photonic Sensors PDF and WCE2011 PDF failed TLS; MIT thesis 405) | - | - | - | snippet-only: a paper is reported to use 4.2 and 1.58 with the full side length and a (1 - nu^2) factor | Low |

### 1c. Validity limit of linear theory

| Quantity | Value | Conditions | Source | URL | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Error of linear theory at w = 0.5 t, circular clamped | deflection 11 % lower than linear prediction | nu = 0.3 | Timoshenko & Woinowsky-Krieger | https://archive.org/details/in.ernet.dli.2015.140098 | fetched-OCR | High |
| Same, square clamped | pressure needed is 2 % above linear at w = 0.24 t, 11 % at 0.47 t, 24 % at 0.70 t, 42 % at 0.91 t, 2.9x at 1.9 t | nu = 0.316 | derived from Levy Table 5 | https://ntrs.nasa.gov/citations/19930091819 | derived | Medium-High |
| Qualitative statement | "this correction is small and can be neglected if the deflection w0 at the center of the plate is small in comparison with the thickness h" | - | Timoshenko & Woinowsky-Krieger | same | fetched-OCR | High |
| Roark assumption "maximum deflection not more than about one-half the thickness" | - | Roark 7th ed., sec. 11.1 | GlobalSpec excerpt (403 on fetch) | https://www.globalspec.com/reference/75951/203279/chapter-11-flat-plates | snippet-only | Medium |
| RoyMech | "The equations are only valid if the deflection is small compared to the plate thickness." | - | RoyMech plates page | https://roymech.org/Useful_Tables/Mechanics/Plates.html | fetched | High |

Practical reading: linear theory is within about 3 % for w < 0.25 t and about 10-12 % off at w = 0.5 t; the simulator's 30-200 um deflections on 15-200 um stacks are far outside it (w/t up to about 10, beyond Levy's tabulated range of 1.9).

---

## 2. Laminate: which stiffness goes in which term

| Quantity | Value / formula | Conditions | Source | URL | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Load split principle | load resolved into `q1` "balanced by the bending and shearing stresses calculated by the theory of small deflections" and `q2` "balanced by the membrane stresses"; "a combination of the known solutions given by the theory of small deflections and the membrane theory" | shown for a simply supported square plate, sides 2a, nu = 0.25 | Timoshenko & Woinowsky-Krieger | https://archive.org/details/in.ernet.dli.2015.140098 | fetched-OCR | High |
| Membrane term scales with E*t, bending with E*t^3 | cubic term `(8/3)(1 - 0.241 nu) (E/(1 - nu)) (t/a^4) w0^3`; bending term in Martins Eq. 1 proportional to `E t^3 / (12 alpha (1 - nu^2))`; "In the case of large deflections (h/t >> 1), the second term (depending on alpha) can be neglected" | - | US 6,321,594 B1; Martins et al. | https://patents.google.com/patent/US6321594B1/en ; https://arxiv.org/pdf/0805.0899 | fetched (patent equation); Martins sentence is snippet-only (equation glyphs lost in my extraction) | Medium-High |
| Composite (multilayer) membranes | "its biaxial modulus can be calculated from the biaxial modulus of the composite film"; residual stress "as the weighted average of the stresses in the membrane and the metal film overlayer" | bulge test of film on SiN membrane, after Vlassak 1994 thesis ch. 3 | US 6,321,594 B1 | https://patents.google.com/patent/US6321594B1/en | fetched | Medium |
| Composite result example | Si3N4/SiO2 bilayer treated as one membrane with composite E = 147 +/- 8 GPa vs 212 +/- 14 GPa for Si3N4 alone | square/rectangular bulge test | Martins et al. 2008 | https://arxiv.org/pdf/0805.0899 | fetched | High |
| Explicit formula `A = sum E_i t_i / (1 - nu_i^2)` (or thickness-weighted `sum (t_i/t_tot) E_i/(1 - nu_i)`) written out | **not found** on a fetched page | - | - | - | snippet-only: a search summary reported a thickness-weighted sum rule for n layers | Low |

Derived implementation (my algebra, consistent with the sourced scalings; not quoted from a source):

- Homogeneous plate: `q = K_b w + K_m w^3`, `K_b = D / (alpha L^4)`, `K_m = beta D / (alpha L^4 t^2) = beta A / (12 alpha L^4)` with `A = E t / (1 - nu^2)`.
- Laminate: use `D_eff` (about the neutral axis) in `K_b` and `A_eff = sum E_i t_i / (1 - nu_i^2)` in `K_m`. Equivalently keep `w_lin = w (1 + beta (w / t_eq)^2)` with `t_eq^2 = 12 D_eff / A_eff` (reduces to `t` for a single layer).
- Pretension, if any: add `C1 sigma0 t w / (L/2)^2` with C1 = 3.4 (sourced, section 1b).

---

## 3. Flexible electrode constructions

| Quantity | Value | Conditions | Source | URL | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Adhesiveless FCCL, DuPont Pyralux AP | AP 7163E: 1.0 mil PI + 9 um (0.25 oz) Cu; AP 7164E: 1.0 mil + 12 um (0.33 oz); AP 8515R: 1.0 mil + 18 um (0.5 oz); AP 9111R: 1.0 mil + 35 um (1 oz); AP 7156E / 7125E / 8525R / 9121R: 2.0 mil + 9 / 12 / 18 / 35 um | double-sided clad; E = electro-deposited, R = rolled-annealed; 9 and 12 um in ED only | DuPont Pyralux AP data sheet, Table 1 | https://www.epectec.com/downloads/DuPont-Pyralux-AP-Data-Sheet.pdf | fetched | High |
| Pyralux AP polyimide modulus | 700 kpsi (= 4.8 GPa, conversion derived); Tg 220 C; in-plane CTE 25 ppm/C | - | same | same | fetched | High |
| Panasonic FELIOS R-F775 | tensile modulus 7.5 GPa (ASTM D882); RA 1/2 oz = 18 um copper; sample "film 50 um, copper foil 18 um" | - | Panasonic FELIOS product page | https://industrial.panasonic.com/ww/products/pt/felios/feliosbase | fetched | High |
| FELIOS availability of 0.5 mil (0.013 mm) film with RA 1/3 oz (12 um) and 1/2 oz (18 um) | reported available | R-F775 datasheet 2024 | https://industrial.panasonic.com/content/data/EM/PDF/DataS_FELIOS_R-F775_en_202408.pdf | snippet-only | Medium |
| Pyralux AP 12 um dielectric option | listed as a construction option in a 2025 sheet, no standard product code | - | https://insulectro.com/wp-content/uploads/2025/04/Pyralux-AP-Laminate-Data-Sheet-2-25.pdf | snippet-only | Low-Medium |
| Sheet resistance of 12 / 18 um copper foil | **not found** (no datasheet value read) | - | - | - | - | - |
| Sputtered / evaporated metal on PET or PI: typical thickness and measured sheet resistance | **not found** on a fetched page (MDPI Coatings 15/9/1089 returned 403; OAM-RC page gave abstract only: Au, Ag, Pd, Pt sputtered on PET, sheet resistance studied, no numbers) | - | https://oam-rc.inoe.ro/articles/characterization-of-metal-nanolayers-sputtered-on-polyethyleneterephtalate/ | fetched (abstract only) | Low |
| Sputtered Au on PET, studied range | 5-100 nm; films under 10 nm not continuous | Applied Surface Science 2025 abstract | https://research.knu.ac.kr/en/publications/nanoscale-youngs-modulus-and-resistivity-of-flexible-au-films-on-/ | snippet-only | Low-Medium |
| Ideal lower bound, gold film | R_sq = rho/t with bulk rho = 2.05 uOhm*cm -> 0.41 / 0.21 / 0.10 Ohm/sq at 50 / 100 / 200 nm; real sputtered films are higher | bulk value quoted from a patent citing Lange's Handbook | search summary | snippet-only + derived | Low |
| Screen-printed silver ink, Henkel LOCTITE ECI 1010 | sheet resistance 0.0057 Ohm/sq at 25 um (15 min at 120 C); "typically around 6 mOhm/sq/25 um"; +14 % resistance after double-crease test; substrates PET, PI, PEN, paper; max 100 C operating | TDS April 2025 | https://www.mouser.com/datasheet/3/1398/1/LOCTITE_ECI_1010_EC_en_GL.pdf | snippet-only (PDF blocked on fetch) | Medium |
| DuPont 5064H silver conductor | <= 6 mOhm/sq/mil; PET, PEN, Kapton | press release | https://pcdandf.com/pcdesign/index.php/editorial/menu-new-indust-prod/7311-dupont-mcm-introduces-dupont-5064h-silver-conductor | snippet-only | Low-Medium |
| Printed silver dried thickness (5-15 um) and modulus | **not found** | - | - | - | - | - |

---

## 4. Elastomer / dielectric material properties

### Modulus

| Material | Value | Conditions | Source | URL | Evidence | Confidence |
|---|---|---|---|---|---|---|
| PDMS Sylgard 184 (10:1) | E = 1.32 +/- 0.07 MPa (25 C cure), 2.05 +/- 0.12 (100 C), 2.46 +/- 0.16 (125 C), 2.59 +/- 0.08 (150 C), 2.97 +/- 0.04 (200 C); hardness 43.8 -> 54.0 Shore A | tensile, < 40 % strain; modulus "linearly dependent on their curing temperature" | Johnston et al., J. Micromech. Microeng. 24 (2014) 035017, Table 5 | https://iopscience.iop.org/article/10.1088/0960-1317/24/3/035017 | fetched | High |
| Sylgard 184 (alternative data set) | E = 1.32 MPa (25 C), 3.09 (100 C), 4.42 (150 C) | tensile, < 10 % strain, 254 mm/min | "Mechanical properties of bulk Sylgard 184 and its extension with silicone oil", Table 4 | https://pmc.ncbi.nlm.nih.gov/articles/PMC8476525/ | fetched (via Europe PMC full text) | Medium (differs from Johnston above 25 C) |
| Sylgard 184 datasheet | tensile strength 6.7 MPa (980 psi); durometer Shore A 43 | Dow TDS 2017 | https://www.farnell.com/datasheets/3154500.pdf | fetched | High |
| Formlabs Flexible 80A (V1) | stress at 50 % elongation 1.5 MPa green / 3.1 MPa post-cured; at 100 %: 3.5 / 6.3 MPa; UTS 3.7 / 8.9 MPa; elongation at break 100 % / 120 %; Shore 70A / 80A | ASTM D412-06 (A); Form 3, 100 um | Formlabs Flexible 80A material data sheet (rev 01, 05.29.2020) | https://formlabs-media.formlabs.com/datasheets/2001418-TDS-ENUS-0.pdf | fetched | High |
| Formlabs Flexible 80A V2 | UTS 10 MPa; elongation at break 230 %; Shore 83A | Form 4 | Formlabs store page | https://formlabs.com/store/materials/flexible-80a-resin | fetched | High |
| Formlabs Elastic 50A V2 (renamed Flexible 50A) | stress at 50 % elongation 0.9 MPa; at 100 %: 1.7 MPa; UTS 3.4 MPa; elongation at break 160 %; Shore 55A | retailer listing, cure state not stated | GoEngineer product page | https://store.goengineer.com/products/formlabs-elastic-50a-resin-v2 | fetched (retailer, not the official TDS) | Medium |
| Small-strain Young's modulus for the Formlabs resins | **not found** (datasheets give stress at 50 / 100 % only). Secant estimates (derived): 80A V1 post-cured about 6.2 MPa, Elastic 50A V2 about 1.8 MPa at 50 % strain | - | - | - | derived | Low-Medium |
| TPU 85A filament | tensile modulus 12 MPa; tensile strength at break 4 MPa; elongation 660 %; Shore A 85; density 1.19 g/cc | ASTM D638, printed XY flat, 100 % infill | 3DXTech 3DXFLEX TPU 85A TDS v1.0 | https://cdn.shopify.com/s/files/1/0625/4185/6821/files/3DXFLEX_TPU_85A_TDS_v1.0.pdf | fetched | High |
| TPU 85A, other brands | NinjaFlex 12 MPa (ASTM D638); BigRep/Extrudr semisoft 85A 42 MPa (ISO 527) | - | search summary | snippet-only | Low-Medium |
| Ecoflex 00-30 | 100 % modulus 10 psi (= 0.069 MPa, derived conversion); tensile strength 200 psi; elongation at break 900 %; Shore 00-30; specific gravity 1.07 | Smooth-On data as reproduced in Polymers 2020, 12, 1031, Table 1 | https://pmc.ncbi.nlm.nih.gov/articles/PMC7285157/ | fetched (via Europe PMC; Smooth-On's own page is behind a bot wall) | High |

### Relative permittivity

| Material | Value | Conditions | Source | URL | Evidence | Confidence |
|---|---|---|---|---|---|---|
| PDMS Sylgard 184 | 2.72 at 100 Hz; 2.68 at 100 kHz; dissipation factor 0.00257 / 0.00133; volume resistivity 2.9e14 Ohm*cm | Dow TDS, form 11-3184-01 C (2017) | https://www.farnell.com/datasheets/3154500.pdf | fetched | High |
| Sylgard 184 (older sheet) | 2.7 at 100 Hz and 100 kHz | Dow Corning sheet | https://www.cnfusers.cornell.edu/sites/default/files/Equipment-Resources/Sylgard_184_data_sheet.pdf | fetched | High |
| TPU (Covestro Desmopan) | "Dielectric constant values measured for Desmopan range from 8.0 to 4.0"; "decrease in direct relation to the material's hardness"; IEC 60250; temperature- and frequency-dependent | generic TPU grades, not a specific 85A filament | Covestro | https://solutions.covestro.com/en/highlights/articles/theme/product-technology/electrical-properties-tpu | fetched | Medium |
| Ecoflex 00-30 | 2.8 (Soft Robotics Toolkit table); 3.0-3.2 measured, 3.1 used (US patent on liquid-metal phase shifter); 3.2-3.5 (journal article) | methods/frequency not given | https://softroboticstoolkit.com/tshs-fabrication/step5 | snippet-only (page 403 on fetch) | Low-Medium |
| Formlabs resins permittivity | **not found** | - | - | - | - | - |

---

## 5. Capacitance-to-digital converters

| Chip | Quantity | Value | Source | URL | Evidence | Confidence |
|---|---|---|---|---|---|---|
| TI FDC1004 | Input conversion range | +/-15 pF | Datasheet SNOSCY5C (rev. Oct 2024), Electrical Characteristics | https://www.ti.com/document-viewer/lit/html/SNOSCY5C/GUID-24F2909B-65D8-40EC-B40C-11A6A0ED8BCB | fetched | High |
| | Max input offset capacitance per channel | 100 pF | same | same | fetched | High |
| | CAPDAC full-scale range | 96.9 pF (search summary: 5-bit, 3.125 pF steps - snippet-only) | same | same | fetched | High |
| | Excitation | 25 kHz, 2.4 Vpp across the capacitance, 1.2 V average DC | same | same | fetched | High |
| | Effective resolution / noise | 16 bit at 100 S/s; output noise 33.2 aF/sqrt(Hz) at 100 S/s; "Measurement resolution: 0.5 fF" | datasheet + product page | https://www.ti.com/product/FDC1004 | fetched | High |
| | Output rates | 100 / 200 / 400 S/s (programmable) | product page | https://www.ti.com/product/FDC1004 | fetched | High |
| | Accuracy | absolute error +/-6 fF after offset calibration; gain error 0.2 %; offset deviation over temperature 46 fF | datasheet | as above | fetched | High |
| | Other | 4 channels; 3.3 V; 750 uA active, 29 uA standby; shield drive up to 400 pF; I2C | product page / datasheet | as above | fetched | High |
| | Noise at 200 / 400 S/s | **not found** | - | - | - | - |
| ADI AD7745 / AD7746 | Conversion input range | +/-4.096 pF (features: "Full-scale (changing) capacitance range: +/-4 pF") | Datasheet Rev. 0 (2005), Table 1 | https://docs.rs-online.com/37bd/0900766b80e38fa6.pdf (official: https://www.analog.com/media/en/technical-documentation/data-sheets/AD7745_7746.pdf, timed out) | fetched (RS-hosted copy of Rev. 0) | High |
| | Common-mode capacitance / CAPDAC | "up to 17 pF"; CAPDAC full range 17 pF min, 21 pF typ; resolution 164 fF (7-bit) | same | same | fetched | High |
| | Resolution | "down to 4 aF (that is, up to 21 ENOB)"; 24-bit no missing codes; effective 19 bit at 62 ms (spec table) | same | same | fetched | High |
| | Noise vs rate (Table 5) | 90.9 Hz: 40.0 aF rms (17.6 bit eff.); 50.0 Hz: 12.2 aF (19.4 bit); 16.1 Hz: 5.4 aF (20.5 bit); 9.1 Hz: 4.2 aF (20.9 bit); density 1.5-4.3 aF/sqrt(Hz) | same | same | fetched | High |
| | Update rate | 10 Hz to 90 Hz | same | same | fetched | High |
| | Accuracy / linearity | +/-4 fF (factory calibrated); +/-0.01 % | same | same | fetched | High |
| | Excitation | 32 kHz; +/-VDD/8, /4, x3/8, /2 selectable | same | same | fetched | High |
| | Other | AD7745 1 channel, AD7746 2 channels; floating sensors only (grounded sensor -> AD7747); parasitic to ground up to 60 pF; 2.7-5.25 V, 0.7 mA | same | same | fetched | High |

---

## Recommended simulator inputs

### Large-deflection correction

Use, for a clamped square plate with immovable edges under uniform pressure:

```
w_lin = w * (1 + beta * (w / t)^2),      w_lin = 0.00126 * q * L^4 / D
beta  = 0.52
```

- Source: cubic fit (derived here) to Levy, NACA Report 740, Table 5 (exact series solution, nu = 0.316, 0 < w/t <= 1.9).
- Definitions: `L` = full free side of the square span; `w` = centre deflection; `t` = thickness of a homogeneous plate.
- For a laminate replace `t` by `t_eq = sqrt(12 * D_eff / A_eff)`, `A_eff = sum E_i t_i / (1 - nu_i^2)`, and use `D_eff` in `w_lin` (derived generalisation; not quoted from a source).
- Bracket for sensitivity studies: 0.488 (Timoshenko circular, radius-based, nu = 0.3, sourced) to 0.57-0.60 (bending + bulge-membrane superposition, nu = 0.30-0.40, derived).
- Caveats: the fit is validated only to w/t = 1.9; at w/t of 5-10 the cubic term dominates and the answer tends to the pure-membrane result, so the uncertainty is essentially that of beta (about +/-10 %). Any film pretension adds a linear term `3.4 * sigma0 * t * w / (L/2)^2`.

### Electrode options

| Name | Metal thickness | PI thickness | Sheet resistance | Basis |
|---|---|---|---|---|
| Flex PCB, 1/3 oz ED Cu (Pyralux AP 7164E) | 12 um | 25 um (1.0 mil) | not found | fetched datasheet |
| Flex PCB, 1/2 oz RA Cu (Pyralux AP 8515R) | 18 um | 25 um (1.0 mil) | not found | fetched datasheet |
| Flex PCB, 1/4 oz ED Cu (Pyralux AP 7163E) | 9 um | 25 um (1.0 mil) | not found | fetched datasheet |
| Thin flex, 1/3 oz RA Cu (FELIOS R-F775) | 12 um | 13 um (0.5 mil) | not found | snippet-only |
| Sputtered Au on PI/PET | 50-200 nm (study range 5-100 nm) | 12.5-25 um (assumed, not sourced) | >= 0.41 / 0.21 / 0.10 Ohm/sq at 50 / 100 / 200 nm (ideal bulk lower bound) | snippet-only + derived |
| Screen-printed Ag (LOCTITE ECI 1010) | printed thickness not found | PI / PET | about 6 mOhm/sq at 25 um | snippet-only |

Polyimide modulus: 4.8 GPa (Pyralux AP, 700 kpsi) to 7.5 GPa (FELIOS R-F775). Copper and silver-ink moduli: not found.

### Material defaults

| Material | Young's modulus | Relative permittivity |
|---|---|---|
| PDMS Sylgard 184 | 1.32 MPa (25 C cure) ... 2.05 MPa (100 C) ... 2.97 MPa (200 C) | 2.72 (100 Hz), 2.68 (100 kHz) |
| Ecoflex 00-30 | 0.069 MPa (100 % modulus, 10 psi) | 2.8 (snippet-only; reported range 2.8-3.5) |
| TPU 85A | 12 MPa (ASTM D638, printed) | 4-8 for TPU generally (Covestro); grade-specific value not found |
| Formlabs Flexible 80A | stress at 50 % = 3.1 MPa post-cured (secant about 6 MPa, derived) | not found |
| Formlabs Elastic 50A V2 | stress at 50 % = 0.9 MPa (secant about 1.8 MPa, derived; retailer source) | not found |

### CDC chips

| Chip | Range | Offset handling | Excitation | Rate | Noise / resolution |
|---|---|---|---|---|---|
| FDC1004 | +/-15 pF | up to 100 pF (CAPDAC 96.9 pF) | 25 kHz, 2.4 Vpp | 100 / 200 / 400 S/s | 0.5 fF resolution; 16-bit effective and 33.2 aF/sqrt(Hz) at 100 S/s; +/-6 fF absolute |
| AD7745 | +/-4.096 pF | up to 17 pF (CAPDAC 17-21 pF, 7-bit) | 32 kHz | 9.1-90.9 Hz | 4.2 aF rms at 9.1 Hz ... 40 aF rms at 90.9 Hz; +/-4 fF accuracy |

### Not found (summary)

- Roark's large-deflection K1/K2 tables (circular and rectangular) and a published closed-form beta for the clamped square plate; the "1.98" / "4.20, 1.58" square-diaphragm coefficients.
- An explicit laminate formula for the cubic term on a fetched page.
- Sheet resistance of copper foil, measured sheet resistance of sputtered metal on PI/PET, printed-silver dried thickness and modulus (silver ink sheet resistance is snippet-only).
- Small-strain modulus and permittivity of the Formlabs resins; permittivity of a specific 85A TPU; Ecoflex permittivity on a fetched page; FDC1004 noise at 200/400 S/s.
