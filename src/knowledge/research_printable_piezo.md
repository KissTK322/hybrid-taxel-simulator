# Printable piezoelectric composites for an s-gDLP process (filler-in-photoresin route)

Compiled by web research on 2026-10-13. Every number below was seen on a fetched page (full text, PDF text, patent, or repository record) unless it is labelled "snippet/abstract only", "derived" or "not found". Nothing is filled in from memory.

How to read the confidence column:

- **High** = I read the number directly in the extracted text of the paper's PDF.
- **Medium** = the number was returned by the page-reading tool from the full-text HTML page (PMC / patent); the tool summarises, so re-check the quote in the paper before citing it in a report.
- **Low** = abstract-only, snippet-only, or internally inconsistent in the source.

Context: target process is 405 nm DLP, photocurable resin + filler, low temperature, on TPU-like domes / PDMS, with a resin + 5 wt% MWCNT conductive layer (Zaki et al., Adv. Funct. Mater. 2025, e15914 - not fetched here, taken from the task brief). Candidate materials come from Table 1 of Tang et al., Sensors 2025, 25, 964.

---

## 1. Comparison table

| # | Material system | Printing method (wavelength) | Loading | d33 | εr | Poling | Source | Confidence |
|---|---|---|---|---|---|---|---|---|
| 1 | BaTiO3 NP (TMSPM-grafted) in PEGDA | Digital projection printing (365 nm LED) | 1-10 wt% (TMSPM films measured at 1 %) | 39 ± 3 pC/N (TMSPM, no CNT); 13 ± 2 pC/N (10 % BTO + CNT, no TMSPM); "no response" unmodified | not found | ~12 MV/m, 120 °C, 24 h, contact (ITO glass + ~1 µm PMMA) | Kim et al., ACS Nano 2014 - numbers seen in the related patent US11871672B2 only | Medium (patent, not the paper) |
| 2 | BaTiO3 50 nm (TMSPMA-grafted) in PEGDA 700 | µCLIP continuous DLP (385 nm) | 15-30 wt% | 12.59 (15 wt%), 17.60 (20), 22.41 (25), 28.20 (30) pC/N; text range 13.29-27.70 pC/N | not given in main text (Fig. S11 only); derived from d33/g33: ~18 to ~28 (derived, not sourced) | Corona, 20 kV needle, 25 mm gap, 110 °C, 1 h | Liu et al., Research 2022 | High |
| 3 | BaTiO3 500 nm, as received, in PEGDA 250 | DLP, Asiga Pico Plus 27 (412 nm) | 33-66 wt% (66 wt% used) | measured 2-3 pC/N (predicted 3-4) | not found | Contact, 10 MV/m, 100 °C, 2 h in silicone oil | Tiller et al., Materials & Design 2019/2020 | High |
| 4 | BaTiO3 200 nm in acrylate oligomers (EAA + AUD), stretchable | DLP, Asiga PICO2 (wavelength not stated) | 15 wt% | 0.78 pC/N | not found | 25 V/µm (temperature, time, method not stated) | Zhou et al., Sensors 2020 | Medium |
| 5 | BaTiO3 (100 / 200 / 500 nm) in NOA 65 photopolymer | UV-cured film (not printed) | 60 % w/w | 1.4 / 6.1 / 7.2 pm/V (full scan); 2.1 / 3.0 / 3.9 pm/V (single point) | not found | not found | Omoniyi et al., J. Mater. Sci.: Mater. Electron. 2021 | Low (abstract only) |
| 6 | PVDF powder (3-10 µm) in HDODA acrylate + DEF solvent | LCD vat printer, Phrozen Sonic Mini 8K (wavelength not stated) | 35 wt% PVDF | 7.34 ± 0.20 pC/N | 8.47 ± 0.01 (100 Hz) | Corona, 8 kV, 30 min | Srinivasaraghavan Govindarajan et al., Sensors 2024 | Medium |
| 7 | Same + 2 wt% boron nitride nanotubes | same | 35 wt% PVDF + 2 wt% BNNT | 12.20 ± 0.83 pC/N | 12.08 ± 0.02 (100 Hz) | Corona, 8 kV, 30 min | same | Medium |
| 8 | PVDF particles in photocurable resin ("V-Ink") | Projection stereolithography | 35 wt% | not found (g33 = 105.12 × 10^-3 V·m/N) | not found | not found | Chen et al., Procedia CIRP 2017 | Low (abstract only) |
| 9 | PVDF dissolved in DMF, blended in photopolymer resin | SLA | 2 wt% PVDF (PVDF:DMF 1:10) | not found (±0.121 nA at 80 N) | not found | not found | Kim et al., MRS Communications 2019 | Low (abstract only) |
| 10 | P(VDF-TrFE) in photoresin | Volumetric printing | 3 wt% | 20.3 pC/N, no poling | not found | none claimed | Frick et al., Adv. Mater. Technol. 2024 | snippet/abstract only (page blocked) |
| 11 | PZT (TMSPM-grafted) in PEGDA 700 | µCLIP (385 nm) | 20 wt% | 64.87 pC/N (g33 269.47 mV·m/N) | not found | Corona, 20 kV, 110 °C, 1 h | Liu et al., Research 2022 | High |
| 12 | PZT-5H 1.22 µm (plasma + TMSPM) in urethane acrylate | DLP, Prism M3 (405 nm, 55 mW/cm²) | 50-75 wt% | 22 ± 4 pC/N (functionalised); 15 ± 3 pC/N (other group) | not found for composite (filler ~3000, polymer ~5) | up to 220 kV/cm, room temperature, 1 h (corona-type "modified poling") | Wang et al., Research 2025 | Medium |
| 13 | PZT (TMSPM-grafted) in UV monomers | Projection stereolithography (near-UV LED) | 2.5-50 vol% (16-88 wt%) | bulk value not in main text (only specific |d33|/ρ plot) | not found | Corona, 32 kV, room temperature, 1 h | Cui et al., Nature Materials 2019 | High (for process), d33 not found |
| 14 | ZnO nanorods in Wanhao flexible resin | Vat printer, Phrozen Sonic Mini 8K (wavelength not stated) | 8-12 wt% (10 best; 15 fails) | not found | not found | no poling described | Maurya et al., Polymers 2024 | Medium |

Lead warning: rows 11-13 use PZT (lead zirconate titanate). Lead-containing powder in a liquid resin is a handling and disposal issue for a student lab; noted, not assessed further.

---

## 2. Per-source details and evidence

### 2.1 Tang et al., Sensors 2025, 25, 964 (the professor's Table 1)
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11821041
- Table 1 has **no d33 or permittivity column**. Its columns are material, method, substrate, electrode, size, performance, reference. So Table 1 cannot supply simulator defaults for d33/εr.
- Rows seen: ZnO p-n (spin coating, 82.6 nA/MPa), BaTiO3 (hydrothermal, PDMS, 14 V open circuit), Al-ZnO (PDMS, MWCNT electrode), ZnO (hydrothermal, 1.42 V/N), AlN (sputtering, silicon), PZT (mixing), Sm:PMN-PT (sol-gel, 5.86 V/N), PVDF (several: 35.6 mV/N, 5.17 mV/kPa, 12 mV/kPa), PVDF (3D printing, range 0.1-15 N, 80 ms), PVDF-TrFE (3D printing, 1.47 V/kPa), PVDF-TrFE (electrospinning, 51.5 mV/N), MoS2-PVDF (milling and coating), PVDF/ZnO (electrospinning, 3.12 mV/kPa; 0.33 V/kPa), three hydrogels.
- None of the Table 1 entries is made by DLP/SLA. The review mentions DLP once (a "DLP-based 3D printer" for PMN-PZT ceramic-polymer composites, its ref. [129]).
- Only the first 100 000 characters of the page were read; the remaining text was not.

### 2.2 Kim, Zhu, Qu, Aaronson, Chen, Sirbuly, "3D Optical Printing of Piezoelectric Nanoparticle-Polymer Composite Materials", ACS Nano 2014 (DOI 10.1021/nn503268f)
- The ACS page returned HTTP 403. Citation confirmed on the UC tech-transfer page: https://techtransfer.universityofcalifornia.edu/NCD/24418.html (no numbers there).
- Numbers below were seen in the related patent, US11871672B2 "3D piezoelectric polymer materials and devices": https://patents.google.com/patent/US11871672B2/en
  - Loading: "BTO mass loadings of 1-10%"; above that "the transparency of the polymer goes below 5%".
  - d33: "39±3 pC/N" (TMSPM-grafted, no CNT); "13±2 pC/N" (10 % BTO with CNT, no TMSPM); unmodified BTO gave "no response".
  - Poling: "a field of approximately 12 MV/m at 120° C. for 24 hours"; BTO coercive field stated as "approximately 10 V/μm".
  - Thickness: set by a "25 μm" Kapton spacer. Light: 365 nm LED; microstructures "in less than 2 seconds".
  - Electrodes: ITO glass ("100 nm of ITO") with about 1 µm PMMA to prevent shorting.
  - Functionalisation: 3-trimethoxysilylpropyl methacrylate (TMSPM), ~6 g BTO sonicated 24 h in TMSPM/ethanol/acetic acid.
  - εr: not found.
- A UCSD newsletter figure of "on the order of 40 pC/N" at 10 % mass loading was seen in a search snippet only (the PDF returned 404). Note the patent text ties 39 pC/N to the TMSPM films; which loading that corresponds to should be checked in the ACS Nano paper itself.

### 2.3 Liu, Wang, Xu, Liu, Zhang, Song, Chen, "Continuous Three-Dimensional Printing of Architected Piezoelectric Sensors in Minutes", Research 2022, 9790307
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC9318352 (PDF text also read: https://par.nsf.gov/servlets/purl/10345488)
- Filler: ~50 nm BTO, grafted with 3-(trimethoxysilyl)propyl methacrylate; matrix PEGDA 700 + Irgacure 819 (2 wt%) + Tinuvin 171 (0.2 wt%).
- Printing: µCLIP, 385 nm, 7.6 mW/cm², 5 µm layers, ~10 µm/s at 30 wt%.
- d33 (Fig. 3 labels): "30 wt%, d33 = 28.20 pC/N", "25 wt%, d33 = 22.41 pC/N", "20 wt%, d33 = 17.60 pC/N", "15 wt%, d33 = 12.59 pC/N". Text: "13.29 pC N-1 to 27.70 pC N-1 (g33 from 85.19 mV m N-1 to 110.71 mV m N-1)". Abstract: "d33 of 27.70 pC N-1 with the 30wt% f-BTO".
- εr: only in Supplementary Fig. S11 (not fetched). **Derived, not sourced:** εr = d33 / (g33 · ε0) gives about 17.6 at the low end and about 28.3 at 30 wt%. The same formula reproduces the reported εr of source 2.6 exactly (12.20 pC/N, 114.06 mV·m/N -> 12.08), so the method is sound, but treat the BTO values as an estimate.
- Poling: corona; "poling voltage Vpoling was set to be 20 kV", tip-to-ground 25 mm, copper plate "110 °C", "1 h". Electrodes applied **after** poling: silver paste + copper tape.
- Particle size: 100 nm BTO gave about 44 % lower d33 than 50 nm.
- Scattering: unfunctionalised BTO agglomerates and sediments on the window, "causing devastating scattering of the input UV light".
- Other fillers printed the same way: 20 wt% f-PZT d33 = 64.87 pC/N; f-AlN 15 wt% printed, d33 not seen.
- Sensor output: BCC lattice 44.00 mV poled vs 3.74 mV unpoled at 0.85 N; PDMS-sealed octet truss ~385 mV at ~40 N impact. No frequency band given.

### 2.4 Tiller, Reid, Zhu, Guerreiro, Domingo-Roca, Jackson, Windmill, "Piezoelectric microphone via a digital light processing 3D printing process", Materials and Design 165 (2020) 107593
- URL: https://strathprints.strath.ac.uk/66529/8/Tiller_etal_MD_2019_Piezoelectric_microphone_via_a_digital_light_processing_3D.pdf
- **Closest published analogue to the s-gDLP stack:** one DLP printer, PEGDA base, a BaTiO3-PEGDA piezo layer between two MWCNT-PEGDA conductive layers, resin vats swapped by pausing the print.
- Materials: PEGDA MW 250, Irgacure 819 1 % w/w, Sudan I 0.1 %; BaTiO3 "average particle diameter of 500 nm in concentrations ranging from 33% to 66% (w/w)"; MWCNT (9.5 nm diameter) "from 0.1% to 1.25% (w/w)"; "All materials were used as received" (no silane).
- Light: "412nm UV LED".
- Cure / scattering (Table 1): attenuation 0.0863 µm^-1 (33 % BaTiO3), 0.136 µm^-1 (66 % BaTiO3), 0.0530 µm^-1 (1 % CNT), versus 0.00839 µm^-1 for PEGDA + 0.2 % Sudan I. Critical dose 2.92, 1.13, 32.40 mJ/cm² respectively. Derived penetration depth 1/α: about 12 µm (33 %), 7 µm (66 %), 19 µm (1 % CNT).
- Resolution: BTO composite minimum X-Y feature 0.35 mm vs 0.2 mm for neat PEGDA; 50 % and 66 % w/w could not resolve a 1 mm array.
- Poling: "Samples were poled for 2h in silicone oil at 100° at 10MV/m" (150 µm test samples cured between glass slides).
- d33: "Measured values of d33 in the range of 2-3pC/N"; authors call this "considerably poorer than that of PVDF at 20-30pC/N, with a resulting poor signal to noise ratio".
- Device: 4 mm diaphragm, 35 µm thick, electrodes on the outer 200 µm; resonance 22 kHz; output "-87dB (V/Pa)" at 1 kHz with signal-to-noise below 0 dB before averaging.
- MWCNT layer: "little benefit from increasing concentration beyond 0.5% by weight"; resistivity values are only in Fig. 6 (not readable as text) - numeric value not found.
- Composite modulus ~1 GPa, density 1832 kg/m³ (66 wt%).

### 2.5 Zhou, Parida, Halevi, Magdassi, Lee, "All 3D Printed Stretchable Piezoelectric Nanogenerator for Self-Powered Sensor Application", Sensors 2020, 20, 6748
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC7728330/
- Ink: "15 wt % barium titanate nanoparticles" (200 nm) in epoxy aliphatic acrylate + aliphatic urethane diacrylate (41.65 wt% each), TPO photoinitiator. DLP (Asiga PICO2). Film "about 100 µm".
- d33 "measured to be 0.78 pC/N". Poled "under 25 V/μm electric field".
- Electrodes: silver flake / EVA, direct-write printed (not DLP).
- Output: 0.29 V at 60 N, 5 Hz, 1 cm² area; "sensitivity of 59.8 mV/N" over 30-60 N (the two statements do not obviously agree; check the paper before using). Strain to failure 434 %, modulus 0.83 MPa.

### 2.6 Srinivasaraghavan Govindarajan, Ren, Melendez, Boetcher, Madiyar, Kim, "Polymer Nanocomposite Sensors with Improved Piezoelectric Properties through Additive Manufacturing", Sensors 2024, 24, 2694
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11086213/
- Resin: PVDF powder (3-10 µm) 20-40 wt% (35 wt% chosen), HDODA diacrylate, diethyl fumarate solvent 23 wt%, BAPO 1.9 wt%, Sudan I 0.1 wt%. LCD printer, 50 µm layers, 30 s exposure.
- d33 7.34 ± 0.20 pC/N (PVDF 35); 12.20 ± 0.83 pC/N with 2 wt% BNNT. g33 97.85 and 114.06 mV·m/N.
- εr at 100 Hz: 8.47 ± 0.01 and 12.08 ± 0.02.
- Poling: corona, 8 kV, 30 min. β-phase 60.01 % and 64.89 %.
- Output: 33-42 mV (PVDF 35) and 49-63 mV (with BNNT) at 0.4-0.6 N, 20-50 Hz.

### 2.7 Chen, Ware, Baker, Chu, Hu, Sun, "The Development of an All-polymer-based Piezoelectric Photocurable Resin for Additive Manufacturing", Procedia CIRP 65 (2017) 157-162
- URL: https://asu.elsevierpure.com/en/publications/the-development-of-an-all-polymer-based-piezoelectric-photocurabl (abstract only; ScienceDirect returned 403)
- "35 wt.% of polyvinylidene fluoride (PVDF) particles being suspended in the photocurable resin"; g33 = 105.12 × 10^-3 V·m/N. d33, poling: not found.

### 2.8 Kim, Manriquez, Islam, Chavez, Regis, Ahsan, Noveron, Tseng, Lin, MRS Communications 9 (2019) 1115-1123
- URL: https://www.cambridge.org/core/journals/mrs-communications/article/3d-printing-of-polyvinylidene-fluoridephotopolymer-resin-blends-for-piezoelectric-pressure-sensing-application-using-the-stereolithography-technique/958C3CF7FACF4A054514D5479204894C (abstract only)
- "2 wt%-PVDF/PR was optimal"; output "±0.121 nA under 80 N". d33, poling, wavelength: not found.

### 2.9 Frick et al., "Volumetric 3D-Printed Piezoelectric Polymer Films", Adv. Mater. Technol. 9 (2024) 2301469
- **Snippet only** (Fraunhofer and TU Dresden pages blocked). Snippet states 3 wt% PVDF-TrFE, d33 20.3 pC/N, ~2 s print, no poling. This is volumetric printing with simultaneous initiation and inhibition, not standard layer DLP. Do not use as a default without reading the paper.

### 2.10 Wang, Lai, Zhang, Li, Hu, Yuan, "A Systematic Study on Digital Light Processing 3D Printing of 0-3 Ceramic Composites for Piezoelectric Metastructures", Research 2025, 8, 0595
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11842675/
- The only source found that prints a piezo-ceramic composite at exactly **405 nm** (Prism M3, 55 mW/cm², 15-30 µm layers).
- PZT-5H, mean 1.22 µm, 50 / 60 / 66.7 / 71.4 / 75 wt% in urethane acrylate + diluent acrylate, 1 wt% photoinitiator.
- Scattering: refractive index PZT 2.66, BTO 2.4, polymers below 1.6; mismatch gives "significant light scattering at their interfaces". Photoabsorber Sudan IV 0.1 wt% cut cure depth from 60 to 38 µm at 50 wt%. Cure depth per loading was returned as roughly 20-60 µm across the series, but the ordering returned by the reader looked inconsistent; check Fig./Table in the paper.
- d33: 22 ± 4 pC/N for the plasma + TMSPM functionalised composite; 15 ± 3 pC/N for a comparison group. Per-loading d33: not found.
- Poling: up to 220 kV/cm, 1 h, room temperature (its ref. 61 is a corona-discharge-based method). Copper tape electrodes.
- Functionalisation lowered slurry viscosity from ~40 to ~8 Pa·s.

### 2.11 Cui, Hensleigh, Yao, Maurya, Kumar, Kang, Priya, Zheng, Nature Materials 18 (2019) 234-241
- URL: https://par.nsf.gov/servlets/purl/10107985 (PDF text read)
- "controlled volume loading from 2.5 vol% to 50 vol% (equivalent to 16 wt% to 88 wt%)"; TMSPM grafting; "does not require post-heat treatment".
- Poling: "corona poling method"; "poled under 32 kV at room temperature for 1 h".
- Bulk d33 number: not in the main text (supplementary not fetched).

### 2.12 Maurya et al., "Energy Harvesting Using Optimized ZnO Polymer Nanocomposite-Based 3D-Printed Lattice Structure", Polymers 2024, 16, 2967
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11548469/
- ZnO nanorods 8 / 10 / 12 wt% in Wanhao flexible resin; at 15 wt% "the structure was printed up to a few layers only". 50 µm layers, 8 s per layer. 12 wt% settled in the vat.
- No d33, no εr, **no poling step** described. Output 0.26 V peak-to-peak (lattice) vs 0.14 V (solid) at 3 N, 1 Hz; 0.06 V/N; 0.065 µW/cm².
- The paper's force values for the power figure differ between Results and Conclusions.

### 2.13 Poling method sources
- Corona vs contact, 0-3 PZT-epoxy thick film: W. Du, M.S. thesis, Rutgers 2016, https://rucore.libraries.rutgers.edu/rutgers-lib/49956/record/ - "Corona poled allowed for higher poling voltages (45 kV/mm compared to 2.5kv/mm in contact poling)"; d33 11.1 pC/N and effective permittivity 28.7 at PZT volume fraction 0.7 (abstract only).
- Yi et al., Applied Energy 353 (2024) 122005, https://ideas.repec.org/a/eee/appene/v353y2024ipas0306261923013697.html - "Traditional contact poling is always interrupted by abrupt dielectric breakdown"; no failure with corona "even under poling voltage of 26 kV" (abstract only; PVDF/Y-ZnO, 15 wt% filler).
- Ikei et al., Sensors 2021, 21, 5032, https://pmc.ncbi.nlm.nih.gov/articles/PMC8348853/ - FDM-printed PVDF-TrFE, in-situ poled during printing: d33 1 / 2 / 15 / 18 pC/N at 2 / 4 / 6 / 8 kV; ex-situ corona 4 pC/N (unheated), 8 (80 °C), 19 (145 °C, 30 min). Shows poling temperature matters strongly. Not a photoresin route.
- Fields actually used on printed photoresin composites (from the sources above): contact 10 MV/m (Tiller), ~12 MV/m (Kim patent), 25 V/µm (Zhou); corona 8 kV (Govindarajan), 20 kV at 25 mm (Liu), 32 kV (Cui), up to 220 kV/cm (Wang).
- **Poling through printed carbon/CNT electrodes after printing: no source found.** In every DLP source the composite was poled either by corona with no top electrode (Liu, Cui, Govindarajan) or by contact between external/metal electrodes (Kim patent, Tiller test samples), and electrodes were added afterwards. Tiller does not state how the finished microphone with printed MWCNT layers was poled.

### 2.14 Carbon / CNT electrodes for piezo or capacitive readout
- Tiller et al. (2.4): DLP-printed MWCNT-PEGDA layers used as the two electrodes of a printed piezo diaphragm; resistivity only in a figure - numeric value not found.
- Yun, Jeong, Nam, Cho, Paik, J. Sensor Sci. Technol. 22 (2013) 400-403, https://koreascience.or.kr/article/JAKO201336447759039.pdf (PDF text read): PZT (70 wt%)/PDMS film bar-coated between CNT electrode films (~40 µm thick), then "poled at 100 [°C] by applying an electric field of 5 V/mm for 1 hr" (unit as printed in the extracted text; probably a typographical or extraction issue, verify). Output 0.82-0.91 V when stretched by hand. "resistance of the CNT electrode was little bit higher than that of metal electrodes"; no sheet resistance number. This is the only source found where a composite was poled **through CNT electrodes**.
- Sheet resistance acceptable for piezo/capacitive readout: **no fetched value.** Snippet only: a Kureha patent application (US 2023/0345839) targets CNT electrode sheet resistance below 300 ohm/sq on piezo film; Julin's Tampere thesis reports CNT/PEDOT sheet resistance up to four orders of magnitude above metal with comparable sensitivity. Both pages failed to load (403 / connection refused).

---

## 3. Recommendation for an s-gDLP process

Ranking of the Tang Table 1 families by fit to "filler particles in photoresin, 405 nm, low temperature":

1. **BaTiO3 nanoparticles in photoresin - best fit.** Lead-free, and the only family with several independent DLP demonstrations (rows 1-4), including a complete DLP device with MWCNT-resin electrodes (Tiller). The catch is large: plain mixing gives 0.78-3 pC/N (Zhou 15 wt%, Tiller 66 wt%), while silane-grafted (TMSPM) small particles give 13-39 pC/N (Liu, Kim patent). Functionalisation and particle size (50 nm better than 100 nm in Liu) decide the outcome more than loading. Above ~10 wt% in PEGDA the resin transmits under 5 % (Kim patent, 365 nm), and Tiller's attenuation coefficients imply penetration depths of roughly 7-12 µm at 33-66 wt% near 405 nm, so a thin single layer (tens of µm) is realistic but thick or fine-featured parts are not.
2. **PVDF powder in photoresin - second.** Lead-free, no silane chemistry, flexible, demonstrated on a cheap LCD vat printer at 35 wt% with d33 7.34 pC/N and εr 8.47 (Govindarajan). Lower d33 and needs corona poling; the PVDF is only ~60 % β-phase.
3. **PZT in photoresin - works best technically, but lead.** d33 64.87 pC/N at 20 wt% (Liu) and 22 ± 4 pC/N at 405 nm DLP (Wang). Include only if the lab accepts lead-containing powder.
4. **P(VDF-TrFE)** - one volumetric-printing report (snippet only, 20.3 pC/N at 3 wt% without poling). Promising but not verified and not standard DLP.
5. **ZnO** - prints at 8-12 wt% in flexible resin and gives a voltage, but no d33, no εr and no poling were reported (Maurya), so there is nothing to put in a simulator.
6. **AlN** - printed at 15 wt% by µCLIP (Liu) but no d33 seen. **Sm:PMN-PT** - no photoresin composite found (Tang mentions DLP PMN-PZT only). **MoS2-PVDF, PVDF/ZnO, hydrogels** - no filler-in-photoresin source found.

### Simulator defaults (sourced)

| Choice | d33 | εr | Loading | Poling | Source |
|---|---|---|---|---|---|
| BaTiO3, functionalised (optimistic) | 27.7 pC/N | no sourced value (derived ≈ 28) | 30 wt%, 50 nm, TMSPMA-grafted, PEGDA | corona 20 kV / 25 mm, 110 °C, 1 h | Liu et al. 2022 |
| BaTiO3, as-received (conservative, closest to "just mix it in like the CNT layer") | 2-3 pC/N | no sourced value | 66 wt%, 500 nm, PEGDA | contact 10 MV/m, 100 °C, 2 h | Tiller et al. 2020 |
| PVDF in photoresin | 7.34 pC/N | 8.47 (100 Hz) | 35 wt% | corona 8 kV, 30 min | Govindarajan et al. 2024 |

Suggested use: run the simulator with the conservative and optimistic BaTiO3 values as a range rather than a single number.

### Open risks for this specific process (flagged, not resolved by any source)
- Reported poling temperatures for BaTiO3 composites are 100-120 °C for 1-24 h. Whether the TPU-like resin and PDMS tolerate this was not checked. Room-temperature corona poling was used for PZT (Cui, Wang) but no room-temperature BaTiO3 photoresin value was found.
- No source shows poling a DLP-printed layer through printed CNT-resin electrodes. Corona poling before printing the top electrode is the route the literature supports.
- No source measures cure depth of a BaTiO3 resin at exactly 405 nm (closest: 412 nm, Tiller; 405 nm data is for PZT, Wang).

## 4. Not found
- εr of any BaTiO3-photoresin printed composite as a directly reported number.
- The ACS Nano 2014 paper itself (403); numbers come from the related patent.
- d33 for ZnO-photoresin, AlN-photoresin, PVDF-resin (Chen 2017, Kim 2019).
- A DLP-printed piezoelectric tactile sensor with a stated frequency band; the only band-type data is the Tiller microphone (22 kHz resonance, -87 dB V/Pa at 1 kHz).
- Sheet resistance of CNT electrodes in a piezo or capacitive sensor from a fetched page.
- Pages that failed: mdpi.com (403), pubs.acs.org (403), sciencedirect.com (403), pubs.kist.re.kr (firewall; DLP BaTiO3/MWCNT capacitive sensor, Composites Part B 2024), trepo.tuni.fi (connection refused), publica.fraunhofer.de and fis.tu-dresden.de (blocked), patents.justia.com (403).
