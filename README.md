# Hybrid Taxel Simulator

Interactive simulator of a hybrid tactile taxel: the piezoresistive dome sensor of the Taiwan lab (Zaki et al., Adv. Funct. Mater. 2025; Zaki & Chen, IEEE MEMS 2026) with two added electrodes E1 and E2 and a dielectric between them (a rubber, or a piezoelectric material from Tang et al., Sensors 2025, Table 1).

- **Open the simulator:** https://kisstk322.github.io/hybrid-taxel-simulator/ (English: [#lang=en](https://kisstk322.github.io/hybrid-taxel-simulator/#lang=en))
- **Source code:** [`src/`](src/) — the same files the page is built from

This is a semi-analytical model for exploring trends and trade-offs, not a validated design tool. Values marked ⚠ in the page and in `src/knowledge/parameters_from_papers.md` are guesses or our own choices that still need measurement.

## Run it yourself

Needs Node.js (any recent version) and Python 3. No packages to install.

```bash
cd src
node test.js          # pass/fail checks of the equations
node verify.js        # independent checks against textbook values
python3 build.py      # builds hybrid_taxel_simulator.html (opens offline by double-click)
```

## Where each calculation is

All physics is in [`src/physics.js`](src/physics.js): pure functions, no page code, runs in Node and in the browser. The design search is in [`src/optimizer.js`](src/optimizer.js).

| What | Code | Equation / method |
|---|---|---|
| Geometry: domes, border, gap, border stiffness | [`geometry`](src/physics.js#L80-L99) | MEMS 2026 Fig. 2b dimensions; border k_b = E(1+2S²)A_b/H₀ (Gent–Lindley) |
| Bending and stretching stiffness of the top stack | [`bendingRigidity`](src/physics.js#L122-L134), [`membraneStiffness`](src/physics.js#L137-L139) | D = Σ E_i t_i³/12(1−ν²) (independent) or composite with neutral axis |
| Top plate deflection | [`plateFields`](src/physics.js#L151-L208) | clamped square plate, 13-point biharmonic finite differences, Cholesky; check w = 0.00126 qL⁴/D |
| Dome contact | [`solveDomes`](src/physics.js#L225-L248) | Hertz F = (4/3)E*√R δ^{3/2}; Newton on the 9 coupled domes; border sink (p·a² − ΣF)/k_b |
| Large deflection | [`solveContact`](src/physics.js#L254-L267) | κ = 1 + β(w/tₑ)², β = 0.52 fitted to Levy (NACA Report 740); bisection on κ |
| Channel A resistance (after contact) | [`resistanceA`](src/physics.js#L308-L349) | per dome ρₜ/A_r + R_s/8π + (R_s/2π)[Φ(r_b) − Φ(a)]; resin-CNT E1 as a sheet network (M·I = 1) |
| Channel A gap capacitance (before contact) | [`capA`](src/physics.js#L287-L307) | C_A = ε₀∫dA/gap, parallel plate |
| Channel B dielectric | [`dielectricTable`](src/physics.js#L354-L371), [`capB`](src/physics.js#L372-L381) | solid: shape factor; porous: Gibson–Ashby E(1−φ)²; εr by Lichtenecker |
| CNT conductivity | [`cntConductivity`](src/physics.js#L56-L62) | percolation σ = σ₀(φ − φc)^t |
| Piezo signal (E1–E2 when the dielectric is a Table 1 material) | [`piezoStatic`](src/physics.js#L521-L530), [`piezoRamp`](src/physics.js#L535-L538) | Q = d33·p·A on C_pz + C_cable, leaking through R_in (τ = R·C) |
| Readout noise | [`cNoise`](src/physics.js#L448-L455) | chip noise ⊕ system noise (root-sum-square) |
| Force sweep (everything above vs pressure) | [`sweep`](src/physics.js#L394-L429) | exact first-contact pressure by bisection |
| Design search: scoring | [`evaluate`](src/optimizer.js#L73-L93) | dead zone, resolution, range, temperature, thickness |
| Design search: best compromise and Pareto front | [`normalise`](src/optimizer.js#L99-L106), [`pick`](src/optimizer.js#L108-L116), [`pareto`](src/optimizer.js#L120-L122) | min–max of normalised regret |
| Piezo material ranking (Tang 2025 Table 1) | [`piezoRank`](src/optimizer.js#L128-L136) | each material as the E1–E2 dielectric: voltage, charge, ΔC, first-contact pressure |

Order of a calculation: parameters `P` ([`src/defaults.js`](src/defaults.js)) → `buildModel` (geometry + plate fields, once per design) → for each pressure: `solveContact` → `resistanceA`, `capA`, `capB` → `sweep` collects the curves → the page reads one solved state (`stateAt`) for every view.

Every parameter, its value and its source (paper, page, figure, or ⚠) is listed in [`src/knowledge/parameters_from_papers.md`](src/knowledge/parameters_from_papers.md). The other files in `src/knowledge/` summarise each paper and the extra literature searches.

## Other files

| File | Role |
|---|---|
| `src/ui.js`, `src/views.js`, `src/viz3d.js`, `src/chart.js` | page: parameter panel, animation, cross-section, circuits, 3-D view (three.js), charts |
| `src/i18n.js` | Thai / English switch |
| `src/template.html`, `src/build.py` | page shell and the build that inlines everything into one offline HTML file |
| `src/test.js`, `src/verify.js` | tests |
| `src/vendor/` | three.js r160 (MIT License, see `THREE_LICENSE`) |

Authors: Natthawat Phummarin and Dachanon Vongwanthawi (student research project). No licence has been chosen for our own code yet; three.js is MIT.
