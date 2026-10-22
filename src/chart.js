// Minimal canvas line chart with linear/log axes, legend and hover readout.
class MiniChart {
  constructor(el, opt) {
    this.el = el; this.opt = Object.assign({ xlog: false, ylog: false, xlabel: "", ylabel: "", title: "" }, opt);
    this.series = []; this.vlines = [];
    this.canvas = document.createElement("canvas"); el.appendChild(this.canvas);
    this.tip = document.createElement("div"); this.tip.className = "chart-tip"; el.appendChild(this.tip);
    this.canvas.addEventListener("mousemove", e => this.hover(e));
    this.canvas.addEventListener("mouseleave", () => { this.hx = null; this.draw(); this.tip.style.display = "none"; });
    new ResizeObserver(() => this.draw()).observe(el);
  }
  set(series, vlines = []) { this.series = series; this.vlines = vlines; this.draw(); }
  tx(v, lo, hi, log) { return log ? (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) : (v - lo) / (hi - lo); }
  range(axis, log) {
    let lo = Infinity, hi = -Infinity;
    this.series.forEach(s => s.pts.forEach(p => { const v = p[axis]; if (!isFinite(v) || (log && v <= 0)) return; lo = Math.min(lo, v); hi = Math.max(hi, v); }));
    const fixed = axis === 0 ? this.opt.xrange : this.opt.yrange;
    if (fixed) { lo = fixed[0] ?? lo; hi = fixed[1] ?? hi; }
    if (!isFinite(lo)) { lo = log ? 1 : 0; hi = log ? 10 : 1; }
    if (lo === hi) { if (log) { lo /= 2; hi *= 2; } else { lo -= 1; hi += 1; } }
    if (log) { lo = Math.pow(10, Math.floor(Math.log10(lo) * 4) / 4); hi = Math.pow(10, Math.ceil(Math.log10(hi) * 4) / 4); }
    else { const pad = (hi - lo) * 0.06; if (!(fixed && fixed[0] !== undefined)) lo -= (lo === 0 ? 0 : pad); hi += pad; if (this.opt.yzero && axis === 1 && lo > 0) lo = 0; }
    return [lo, hi];
  }
  ticks(lo, hi, log) {
    if (log) { const t = []; for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) { const v = Math.pow(10, e); if (v >= lo * 0.999 && v <= hi * 1.001) t.push(v); } return t; }
    const span = hi - lo, step0 = Math.pow(10, Math.floor(Math.log10(span / 5))); let step = step0;
    [1, 2, 5, 10].some(m => { step = step0 * m; return span / step <= 6; });
    const t = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-12; v += step) t.push(+v.toPrecision(12)); return t;
  }
  fmt(v) {
    const a = Math.abs(v);
    if (a === 0) return "0";
    if (a >= 1e4 || a < 1e-2) { const e = Math.floor(Math.log10(a)); const m = v / Math.pow(10, e); return (Math.abs(m - 1) < 1e-9 ? "" : m.toFixed(1) + "×") + "10" + sup(e); }
    return +v.toPrecision(3) + "";
  }
  draw() {
    const W = this.el.clientWidth, H = this.el.clientHeight; if (!W || !H) return;
    const dpr = window.devicePixelRatio || 1; this.canvas.width = W * dpr; this.canvas.height = H * dpr;
    this.canvas.style.width = W + "px"; this.canvas.style.height = H + "px";
    const c = this.canvas.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const cs = getComputedStyle(document.documentElement);
    const ink = cs.getPropertyValue("--ink").trim(), mut = cs.getPropertyValue("--muted").trim(), grid = cs.getPropertyValue("--grid").trim();
    const m = { l: 62, r: 14, t: this.opt.title ? 26 : 12, b: 40 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const [x0, x1] = this.range(0, this.opt.xlog), [y0, y1] = this.range(1, this.opt.ylog);
    this.geo = { m, pw, ph, x0, x1, y0, y1 };
    const X = v => m.l + this.tx(v, x0, x1, this.opt.xlog) * pw, Y = v => m.t + ph - this.tx(v, y0, y1, this.opt.ylog) * ph;
    c.font = "12px -apple-system, 'Sarabun', sans-serif"; c.fillStyle = mut; c.strokeStyle = grid; c.lineWidth = 1;
    this.ticks(x0, x1, this.opt.xlog).forEach(v => { const x = X(v); c.beginPath(); c.moveTo(x, m.t); c.lineTo(x, m.t + ph); c.stroke(); c.textAlign = "center"; c.fillText(this.fmt(v), x, m.t + ph + 15); });
    this.ticks(y0, y1, this.opt.ylog).forEach(v => { const y = Y(v); c.beginPath(); c.moveTo(m.l, y); c.lineTo(m.l + pw, y); c.stroke(); c.textAlign = "right"; c.fillText(this.fmt(v), m.l - 6, y + 4); });
    c.fillStyle = ink; c.textAlign = "center"; c.fillText(this.opt.xlabel, m.l + pw / 2, H - 6);
    c.save(); c.translate(13, m.t + ph / 2); c.rotate(-Math.PI / 2); c.fillText(this.opt.ylabel, 0, 0); c.restore();
    if (this.opt.title) { c.textAlign = "left"; c.font = "600 13px -apple-system, 'Sarabun', sans-serif"; c.fillText(this.opt.title, m.l, 16); }
    c.save(); c.beginPath(); c.rect(m.l, m.t, pw, ph); c.clip();
    this.vlines.forEach((v, vi) => { if (!isFinite(v.x)) return; const x = X(v.x); c.strokeStyle = v.color; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(x, m.t); c.lineTo(x, m.t + ph); c.stroke(); c.setLineDash([]); c.fillStyle = v.color; c.textAlign = "left"; c.font = "11px -apple-system, sans-serif"; c.fillText(v.label || "", x + 4, m.t + ph - 6 - vi * 14); });
    this.series.forEach(s => {
      c.strokeStyle = s.color; c.fillStyle = s.color; c.lineWidth = s.width || 2; c.setLineDash(s.dash || []);
      const ok = p => isFinite(p[0]) && isFinite(p[1]) && (!this.opt.xlog || p[0] > 0) && (!this.opt.ylog || p[1] > 0);
      if (s.marker) { s.pts.filter(ok).forEach(p => { c.beginPath(); c.arc(X(p[0]), Y(p[1]), s.size || 3.5, 0, 7); c.fill(); }); }
      else { c.beginPath(); let pen = false; s.pts.forEach(p => { if (!ok(p)) { pen = false; return; } const x = X(p[0]), y = Y(p[1]); pen ? c.lineTo(x, y) : c.moveTo(x, y); pen = true; }); c.stroke(); }
      c.setLineDash([]);
    });
    if (this.hx != null) { c.strokeStyle = mut; c.beginPath(); c.moveTo(this.hx, m.t); c.lineTo(this.hx, m.t + ph); c.stroke(); }
    c.restore();
    // legend
    let lx = m.l + 8, ly = m.t + 8; c.font = "12px -apple-system, 'Sarabun', sans-serif"; c.textAlign = "left";
    this.series.filter(s => s.name).forEach(s => {
      const w = c.measureText(s.name).width + 28;
      if (lx + w > m.l + pw) { lx = m.l + 8; ly += 17; }
      c.fillStyle = cs.getPropertyValue("--card").trim(); c.globalAlpha = 0.85; c.fillRect(lx - 3, ly - 6, w, 15); c.globalAlpha = 1;
      c.strokeStyle = s.color; c.fillStyle = s.color; c.lineWidth = 2; c.setLineDash(s.dash || []);
      if (s.marker) { c.beginPath(); c.arc(lx + 8, ly + 1, 3.5, 0, 7); c.fill(); } else { c.beginPath(); c.moveTo(lx, ly + 1); c.lineTo(lx + 16, ly + 1); c.stroke(); }
      c.setLineDash([]); c.fillStyle = ink; c.fillText(s.name, lx + 21, ly + 5); lx += w + 6;
    });
  }
  hover(e) {
    if (!this.geo) return; const r = this.canvas.getBoundingClientRect(), x = e.clientX - r.left;
    const { m, pw, x0, x1 } = this.geo; if (x < m.l || x > m.l + pw) return;
    this.hx = x; this.draw();
    const f = (x - m.l) / pw, xv = this.opt.xlog ? Math.pow(10, Math.log10(x0) + f * (Math.log10(x1) - Math.log10(x0))) : x0 + f * (x1 - x0);
    const rows = this.series.filter(s => s.name && !s.marker).map(s => {
      let best = null, bd = Infinity; s.pts.forEach(p => { const d = Math.abs((this.opt.xlog ? Math.log10(p[0]) : p[0]) - (this.opt.xlog ? Math.log10(xv) : xv)); if (d < bd && isFinite(p[1])) { bd = d; best = p; } });
      return best ? `<span style="color:${s.color}">●</span> ${s.name}: <b>${this.fmt(best[1])}</b>` : "";
    });
    this.tip.innerHTML = `<div>${this.opt.xlabel}: <b>${this.fmt(xv)}</b></div>` + rows.join("<br>");
    this.tip.style.display = "block"; this.tip.style.left = Math.min(x + 12, this.el.clientWidth - 200) + "px"; this.tip.style.top = "8px";
  }
}
function sup(e) { const m = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" }; return String(e).split("").map(ch => m[ch]).join(""); }
