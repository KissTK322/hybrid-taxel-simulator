// Default parameters. "src" notes are shown in the UI next to each value.
const DEFAULTS = {
  // geometry (Zaki & Chen MEMS 2026 Fig. 2b unless noted; see knowledge/parameters_from_papers.md)
  taxel_mm: 4.05, border_mm: 0.65, dome_d_um: 750, pitch_um: 900,
  h_center_um: 650, h_edge_um: 550, h_corner_um: 400, gap_um: 30,   // gap = border 680 - dome 650 (MEMS 2026 Fig. 2b)
  cnt_t_um: 20,
  // drawing only (no effect on physics): PDMS 400 um = AFM 2025 p.6/p.14; TPU floor is a guess
  pdms_um: 400, tpu_floor_um: 100, array_gap_mm: 1.925,
  // materials
  E_tpu_MPa: 8, nu_tpu: 0.45,
  cnt_wt: 5, rho_cnt: 1.8, rho_resin: 1.15, phi_c: 0.3, t_perc: 2.0, sigma0: 460,   // 5 wt% -> ~4e-3 S/cm (AFM 2025 Fig. 2I)
  // printing (Jacobs fit to Zaki AFM 2025 Fig. 2G)
  Dp_resin: 200, kD: 0.6, tc0: 2, beta_tc: 89.3,
  Dp_tpu: 200, T0_tpu: 0.2, t_exp_tpu: 6,
  // top capacitive stack
  cover_um: 25, e2_type: "Copper (FPC)", diel_mat: "PDMS Sylgard 184", diel_um: 100, porosity: 0.5,
  e1_type: "Copper (FPC)", base_um: 25, stack_bond: "independent", elec_frac: 1.0,
  // electrical (rho_t and film_sq fitted to the MEMS 2026 current law over 5-1500 kPa, see briefing section 17)
  rho_t: 2e-3, H_asp_MPa: 2, film_sq: 0.02, r_model: "film", R_leak: 5e9, C_par_pF: 1.0,
  TCR: -0.1, TCC: -0.18, drift_pct: 5.8,   // sourced in knowledge/research_temperature_stability.md
  creep_tpu: 10, tau_tpu_min: 5, creep_diel: 10, tau_diel_min: 5,
  // readout
  Vb: 1.0, R_ref: 1e5, adc_bits: 12, Vref: 3.3, adc_noise_lsb: 1,
  c_method: "AD7745", cdc_noise_aF: 20, cdc_rate_Hz: 90,
  mcu_clk_MHz: 16, R_charge_k: 1000, lockin_noise_fF: 1, f_exc_kHz: 100, lockin_periods: 10,
  rows: 16, cols: 9, t_adc_us: 20,
  // large-deflection correction (membrane stiffening); beta from knowledge/research_mechanics_materials.md
  large_defl: "on", beta_ld: 0.52, border_sink: "on",
  // piezo film option (channel C) and temperature
  cover_mat: "Polyimide (PI)", pz_Rin_MOhm: 100, pz_Ccable_pF: 50,
  dT_K: 0, kE_tpu: -1.0, c_env_fF: 1,
  // numerics / sweep
  p_max_kPa: 500, fd_n: 25, ca_grid: 90, p_view_kPa: 20,
};
if (typeof module !== "undefined") module.exports = DEFAULTS;
