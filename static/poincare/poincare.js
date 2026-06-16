/*
 * Poincaré Sphere Lab — interactive Jones-calculus polarization simulator.
 * Companion tool for "Optik und Wellen" Übungsserien 8 & 9 (SoSe 2026).
 *
 * Conventions (chosen to match the exercise sheets / Musterlösungen):
 *   |H> = (1,0), |V> = (0,1), |D> = (1,1)/√2, |A> = (1,-1)/√2,
 *   |L> = (1,i)/√2 (left circular, NORTH pole), |R> = (1,-i)/√2.
 *   S0 = |EH|²+|EV|², S1 = |EH|²-|EV|², S2 = 2Re{EH EV*}, S3 = -2Im{EH EV*},
 *   i.e. S3 = |EL|² - |ER|²  (Aufgabe 8.2).
 *   Retarder at lab angle θ with retardance δ:  M = R(θ)·diag(1, e^{iδ})·R(-θ)
 *   so QWP(0°) = diag(1,i), HWP(0°) = diag(1,-1)   (Aufgaben 8.3 / 9.1).
 *   On the sphere this is a right-handed rotation by δ about the equatorial
 *   axis (cos2θ, sin2θ, 0) — the eigenstate of the element.
 *   Polarizer at θ: projector R(θ)·diag(1,0)·R(-θ); output renormalized,
 *   transmitted fraction tracked separately.
 */
'use strict';

/* ============================== complex math ============================= */

function cx(re, im) { return { re: re, im: im || 0 }; }
function cadd(a, b) { return cx(a.re + b.re, a.im + b.im); }
function cmul(a, b) { return cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
function cconj(a) { return cx(a.re, -a.im); }
function cabs2(a) { return a.re * a.re + a.im * a.im; }
function cscale(a, s) { return cx(a.re * s, a.im * s); }
function cexp(phi) { return cx(Math.cos(phi), Math.sin(phi)); }

/* 2x2 complex matrices as [[a,b],[c,d]], Jones vectors as [e0,e1]. */
function matMul(M, N) {
  return [
    [cadd(cmul(M[0][0], N[0][0]), cmul(M[0][1], N[1][0])),
     cadd(cmul(M[0][0], N[0][1]), cmul(M[0][1], N[1][1]))],
    [cadd(cmul(M[1][0], N[0][0]), cmul(M[1][1], N[1][0])),
     cadd(cmul(M[1][0], N[0][1]), cmul(M[1][1], N[1][1]))]
  ];
}
function matVec(M, v) {
  return [
    cadd(cmul(M[0][0], v[0]), cmul(M[0][1], v[1])),
    cadd(cmul(M[1][0], v[0]), cmul(M[1][1], v[1]))
  ];
}

const DEG = Math.PI / 180;

function rotMat(thetaDeg) {
  const c = Math.cos(thetaDeg * DEG), s = Math.sin(thetaDeg * DEG);
  return [[cx(c), cx(-s)], [cx(s), cx(c)]];
}

function retarderMatrix(thetaDeg, deltaDeg) {
  const M0 = [[cx(1), cx(0)], [cx(0), cexp(deltaDeg * DEG)]];
  return matMul(rotMat(thetaDeg), matMul(M0, rotMat(-thetaDeg)));
}

function polarizerMatrix(thetaDeg) {
  const P0 = [[cx(1), cx(0)], [cx(0), cx(0)]];
  return matMul(rotMat(thetaDeg), matMul(P0, rotMat(-thetaDeg)));
}

/* ============================ Stokes <-> Jones =========================== */

function stokesOf(v) {
  const S0 = cabs2(v[0]) + cabs2(v[1]);
  if (S0 < 1e-15) return null;
  const w = cmul(v[0], cconj(v[1])); // EH·EV*
  return [
    (cabs2(v[0]) - cabs2(v[1])) / S0,
    2 * w.re / S0,
    -2 * w.im / S0                  // S3 = -2 Im{EH EV*}  (L at +S3)
  ];
}

/* ψ azimuth, χ ellipticity (both rad): j = R(ψ)·(cosχ, i·sinχ). */
function jonesFromPsiChi(psi, chi) {
  const cP = Math.cos(psi), sP = Math.sin(psi);
  const cC = Math.cos(chi), sC = Math.sin(chi);
  return [cx(cP * cC, -sP * sC), cx(sP * cC, cP * sC)];
}

function jonesFromStokes(s) {
  const psi = 0.5 * Math.atan2(s[1], s[0]);
  const chi = 0.5 * Math.asin(Math.max(-1, Math.min(1, s[2])));
  return jonesFromPsiChi(psi, chi);
}

function randomJones() {
  // uniform on the sphere => uniform fully polarized state
  const u = 2 * Math.random() - 1;
  const phi = 2 * Math.PI * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - u * u));
  return jonesFromStokes([r * Math.cos(phi), r * Math.sin(phi), u]);
}

function normalizeJones(v) {
  const n = Math.sqrt(cabs2(v[0]) + cabs2(v[1]));
  if (n < 1e-12) return null;
  return [cscale(v[0], 1 / n), cscale(v[1], 1 / n)];
}

/* Fix the global phase so the larger component is real and positive. */
function canonicalJones(v) {
  const ref = cabs2(v[0]) >= cabs2(v[1]) ? v[0] : v[1];
  const ph = Math.atan2(ref.im, ref.re);
  const e = cexp(-ph);
  return [cmul(v[0], e), cmul(v[1], e)];
}

const BASIS = {
  H: { jones: [cx(1), cx(0)], stokes: [1, 0, 0], name: 'H — horizontal' },
  V: { jones: [cx(0), cx(1)], stokes: [-1, 0, 0], name: 'V — vertical' },
  D: { jones: [cx(Math.SQRT1_2), cx(Math.SQRT1_2)], stokes: [0, 1, 0], name: 'D — diagonal (+45°)' },
  A: { jones: [cx(Math.SQRT1_2), cx(-Math.SQRT1_2)], stokes: [0, -1, 0], name: 'A — anti-diagonal (−45°)' },
  L: { jones: [cx(Math.SQRT1_2), cx(0, Math.SQRT1_2)], stokes: [0, 0, 1], name: 'L — left circular' },
  R: { jones: [cx(Math.SQRT1_2), cx(0, -Math.SQRT1_2)], stokes: [0, 0, -1], name: 'R — right circular' }
};

/* ============================== components =============================== */

const COMPONENT_DEFS = {
  HWP: { short: 'λ/2', name: 'Half-wave plate', kind: 'retarder', delta: 180, color: '#6d5ce8' },
  QWP: { short: 'λ/4', name: 'Quarter-wave plate', kind: 'retarder', delta: 90, color: '#0d9488' },
  PS:  { short: 'δ',   name: 'Phase shifter', kind: 'retarder', variableDelta: true, defaultDelta: 90, color: '#d97706' },
  POL: { short: 'P',   name: 'Polarizer', kind: 'polarizer', color: '#64748b' }
};

function componentMatrix(comp, override) {
  const def = COMPONENT_DEFS[comp.type];
  let angle = comp.angle, phase = comp.phase, retardScale = 1;
  if (override && override.id === comp.id) {
    if (override.param === 'angle') angle = override.value;
    else if (override.param === 'phase') phase = override.value;
    else if (override.param === 'retardScale') retardScale = override.value;
  }
  if (def.kind === 'polarizer') return polarizerMatrix(angle);
  const delta = (def.variableDelta ? phase : def.delta) * retardScale;
  return retarderMatrix(angle, delta);
}

/* Eigenstate axis of an element with axis angle θ: equatorial, at 2θ. */
function elementAxis(angleDeg) {
  return [Math.cos(2 * angleDeg * DEG), Math.sin(2 * angleDeg * DEG), 0];
}

/*
 * Propagate a normalized input Jones vector through the component chain.
 * Returns { jones (unnormalized), intensity (=|j|², transmission since the
 * input is normalized and retarders are unitary), stokes (normalized) or
 * null when the beam is extinguished }.
 */
function propagate(inputJones, components, override) {
  let v = inputJones;
  for (let i = 0; i < components.length; i++) {
    v = matVec(componentMatrix(components[i], override), v);
  }
  const I = cabs2(v[0]) + cabs2(v[1]);
  return { jones: v, intensity: I, stokes: I > 1e-12 ? stokesOf(v) : null };
}

/* =============================== colormap ================================ */

function jet(t) {
  const v = Math.max(0, Math.min(1, t));
  const c = function (x) { return Math.max(0, Math.min(1, 1.5 - Math.abs(x))); };
  return [Math.round(255 * c(4 * v - 3)), Math.round(255 * c(4 * v - 2)), Math.round(255 * c(4 * v - 1))];
}
function jetCss(t, alpha) {
  const c = jet(t);
  return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha == null ? 1 : alpha) + ')';
}

/* ===================== sphere-vector interpolation ====================== */

function easeInOut(p) { p = Math.max(0, Math.min(1, p)); return p * p * (3 - 2 * p); }

function stokesClose(a, b) {
  if (!a || !b) return false;
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz < 1e-6;
}

/* Great-circle (slerp) interpolation between two unit Stokes vectors. */
function slerpStokes(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  d = Math.max(-1, Math.min(1, d));
  if (d > 0.999999) return [b[0], b[1], b[2]];
  if (d < -0.999999) {
    // antipodal: geodesic is not unique — sweep through an arbitrary perpendicular
    let p = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
    const pa = p[0] * a[0] + p[1] * a[1] + p[2] * a[2];
    p = [p[0] - pa * a[0], p[1] - pa * a[1], p[2] - pa * a[2]];
    const pn = Math.hypot(p[0], p[1], p[2]) || 1;
    p = [p[0] / pn, p[1] / pn, p[2] / pn];
    const ang = Math.PI * t, ca = Math.cos(ang), sa = Math.sin(ang);
    return [a[0] * ca + p[0] * sa, a[1] * ca + p[1] * sa, a[2] * ca + p[2] * sa];
  }
  const om = Math.acos(d), so = Math.sin(om);
  const k0 = Math.sin((1 - t) * om) / so, k1 = Math.sin(t * om) / so;
  return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
}

/* Interpolated bench result for the "component added" fly-in (slerp variant,
   used when the new element collapses the state, e.g. a polarizer). */
function slerpResult(fromRes, toRes, t) {
  const s = slerpStokes(fromRes.stokes, toRes.stokes, t);
  const I = fromRes.intensity + (toRes.intensity - fromRes.intensity) * t;
  const root = Math.sqrt(Math.max(0, I));
  const nv = jonesFromStokes(s);
  return { stokes: s, intensity: I, jones: [cscale(nv[0], root), cscale(nv[1], root)] };
}

/* Export the pure physics for node-based self tests; the rest is DOM-only. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cx, cadd, cmul, cabs2, matMul, matVec, rotMat, retarderMatrix,
    polarizerMatrix, stokesOf, jonesFromStokes, jonesFromPsiChi,
    normalizeJones, canonicalJones, randomJones, propagate,
    componentMatrix, elementAxis, BASIS, COMPONENT_DEFS, jet,
    slerpStokes, slerpResult, easeInOut, stokesClose
  };
}

/* ======================= application (browser only) ====================== */

if (typeof document !== 'undefined') (function () {

  const SCAN_MS = 6000;            // full scan duration (angle: 0…180°, phase: 0…360°)
  const SCAN_STEPS = 720;          // sample resolution across the scan range
  const TRANSITION_MS = 2308;      // fly-in when a component is dropped in (≈30% faster than 3 s)

  /* ------------------------------ app state ----------------------------- */

  let nextId = 1;
  const state = {
    inputKey: 'H',
    inputJones: BASIS.H.jones,
    components: [],                // {id, type, angle, phase?}
    scanAnim: null,                // running scan animation
    scanView: null,                // frozen scan result (survives until any edit)
    transition: null               // running "component added" fly-in
  };

  function currentInputJones() { return state.inputJones; }

  /* The beam only "sees" components that are not hidden; a hidden element keeps
     its settings but is bypassed (left out of the Jones product entirely). */
  function activeComponents() {
    return state.components.filter(function (c) { return !c.hidden; });
  }

  function liveResult() {
    return propagate(currentInputJones(), activeComponents(), null);
  }

  /* True when the transmitted intensity actually moves across the scan. Used to
     decide whether a scan earns the I/I₀ (Malus) plot instead of the colour
     key: everything from the scanned element onward is unitary unless a
     polarizer downstream clips the scan-dependent beam, so this stays false for
     a polarizer placed *before* the scanned element. (Scanning a polarizer
     itself always gets the plot — see startScan — even when I/I₀ is flat.) */
  function intensityVaries(samples) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < samples.length; i++) {
      const I = samples[i].intensity || 0;
      if (I < lo) lo = I;
      if (I > hi) hi = I;
    }
    return hi - lo > 1e-3;
  }

  /* ------------------------------ DOM refs ------------------------------ */

  const $ = function (id) { return document.getElementById(id); };
  const canvas = $('sphere');
  const ctx = canvas.getContext('2d');
  const chainEl = $('chain');
  const paletteEl = $('palette');
  const legendEl = $('scanLegend');
  const legendBar = $('legendBar');
  const legendColormap = $('legendColormap');
  const legendGraph = $('legendGraph');
  const legendPlot = $('legendPlot');
  const legendTicks = $('legendTicks');
  const legendLabel = $('legendLabel');
  const legendClose = $('legendClose');
  const legendStatus = $('legendStatus');
  const markerAxisRow = $('mlAxisRow');
  const inputSel = $('inputSel');
  const diceBtn = $('dice');
  const presetSel = $('presetSel');
  const presetDesc = $('presetDesc');
  const detPct = $('detPct');

  /* ------------------------------ formatting ---------------------------- */

  function fmt(x, digits) {
    const d = digits == null ? 3 : digits;
    let s = x.toFixed(d);
    if (s === '-' + (0).toFixed(d)) s = (0).toFixed(d);
    return s;
  }

  function fmtComplex(c) {
    const re = Math.abs(c.re) < 5e-4 ? 0 : c.re;
    const im = Math.abs(c.im) < 5e-4 ? 0 : c.im;
    if (im === 0) return fmt(re);
    if (re === 0) return fmt(im) + 'i';
    return fmt(re) + (im > 0 ? ' + ' : ' − ') + fmt(Math.abs(im)) + 'i';
  }

  function jonesHtml(v) {
    const c = canonicalJones(v);
    return '(' + fmtComplex(c[0]) + ',&nbsp; ' + fmtComplex(c[1]) + ')';
  }

  function nearestBasisLabel(s) {
    for (const k in BASIS) {
      const b = BASIS[k].stokes;
      const d2 = (s[0] - b[0]) ** 2 + (s[1] - b[1]) ** 2 + (s[2] - b[2]) ** 2;
      if (d2 < 1e-5) return k;
    }
    return null;
  }

  /* ------------------------------ readouts ------------------------------ */

  function updateReadouts(result) {
    $('roInput').innerHTML = jonesHtml(currentInputJones());
    const I = result.intensity;
    detPct.textContent = (100 * I).toFixed(1) + '%';
    $('roIntensity').textContent = (100 * I).toFixed(1) + ' %';
    $('roIntensityBar').style.width = Math.max(0, Math.min(100, 100 * I)) + '%';
    if (result.stokes) {
      const s = result.stokes;
      const nv = normalizeJones(result.jones);
      const basis = nearestBasisLabel(s);
      $('roOutput').innerHTML = jonesHtml(nv) + (basis ? ' <span class="chip">≈ ' + basis + '</span>' : '');
      $('roStokes').textContent = '(' + fmt(s[0]) + ', ' + fmt(s[1]) + ', ' + fmt(s[2]) + ')';
      const psi = 0.5 * Math.atan2(s[1], s[0]) / DEG;
      const chi = 0.5 * Math.asin(Math.max(-1, Math.min(1, s[2]))) / DEG;
      $('roEllipse').textContent = 'ψ = ' + fmt(psi, 1) + '°,  χ = ' + fmt(chi, 1) + '°';
    } else {
      $('roOutput').innerHTML = '<span class="chip warn">beam extinguished</span>';
      $('roStokes').textContent = '—';
      $('roEllipse').textContent = '—';
    }
  }

  /* ============================ sphere renderer ========================== */

  const view = { azim: -35, elev: 20, scale: 1 };

  function viewFn() {
    const sa = Math.sin(view.azim * DEG), ca = Math.cos(view.azim * DEG);
    const se = Math.sin(view.elev * DEG), ce = Math.cos(view.elev * DEG);
    return function (p) {
      return [
        -sa * p[0] + ca * p[1],                       // screen right
        -se * (ca * p[0] + sa * p[1]) + ce * p[2],    // screen up
        ce * (ca * p[0] + sa * p[1]) + se * p[2]      // toward viewer
      ];
    };
  }

  /* Pre-computed grid circles (world coords). */
  const GRID = (function () {
    const circles = [];
    const N = 120;
    for (let lat = -60; lat <= 60; lat += 30) {
      const r = Math.cos(lat * DEG), z = Math.sin(lat * DEG);
      const pts = [];
      for (let k = 0; k <= N; k++) {
        const t = 2 * Math.PI * k / N;
        pts.push([r * Math.cos(t), r * Math.sin(t), z]);
      }
      circles.push({ pts: pts, equator: lat === 0 });
    }
    for (let m = 0; m < 180; m += 30) {
      const c = Math.cos(m * DEG), s = Math.sin(m * DEG);
      const pts = [];
      for (let k = 0; k <= N; k++) {
        const t = 2 * Math.PI * k / N;
        pts.push([Math.sin(t) * c, Math.sin(t) * s, Math.cos(t)]);
      }
      circles.push({ pts: pts, equator: false });
    }
    return circles;
  })();

  const AXIS_LABELS = [
    ['H', [1, 0, 0]], ['V', [-1, 0, 0]],
    ['D', [0, 1, 0]], ['A', [0, -1, 0]],
    ['L', [0, 0, 1]], ['R', [0, 0, -1]]
  ];

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(280, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    draw();
  }

  /*
   * Painter's algorithm in three passes: everything on the far hemisphere is
   * drawn first, then the translucent sphere body "frosts" it, then the near
   * hemisphere is drawn on top. A point is "near" iff its view z > 0.
   */
  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const cxs = W / 2, cys = H / 2;
    const Rs = 0.40 * Math.min(W, H) * view.scale;
    const proj = viewFn();
    const P = function (p) {
      const q = proj(p);
      return [cxs + Rs * q[0], cys - Rs * q[1], q[2]];
    };

    const scan = state.scanAnim || state.scanView;
    const upTo = state.scanAnim
      ? Math.max(0, Math.min(SCAN_STEPS, state.scanAnim.idx))
      : (state.scanView ? SCAN_STEPS : -1);
    let result;
    if (state.transition) result = state.transition.current;
    else if (scan) result = scan.samples[Math.max(0, upTo)];
    else result = liveResult();
    const inputS = stokesOf(currentInputJones());

    function drawPolyline(pts, near, style) {
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = style.width;
      ctx.beginPath();
      let open = false;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = P(pts[i]), b = P(pts[i + 1]);
        const front = (a[2] + b[2]) / 2 > 0;
        if (front === near) {
          if (!open) { ctx.moveTo(a[0], a[1]); open = true; }
          ctx.lineTo(b[0], b[1]);
        } else if (open) { open = false; }
      }
      ctx.stroke();
    }

    function drawGrid(near) {
      for (const c of GRID) {
        drawPolyline(c.pts, near, {
          stroke: c.equator
            ? (near ? 'rgba(70,82,105,0.55)' : 'rgba(70,82,105,0.30)')
            : (near ? 'rgba(105,116,138,0.32)' : 'rgba(105,116,138,0.18)'),
          width: c.equator ? 1.6 : 1
        });
      }
      // principal axes as thin diameters
      for (const al of AXIS_LABELS) {
        const a = P([0, 0, 0]), b = P(al[1]);
        if ((b[2] > 0) !== near) continue;
        ctx.strokeStyle = near ? 'rgba(60,70,92,0.45)' : 'rgba(60,70,92,0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    function drawTrace(near) {
      if (!scan || upTo < 1) return;
      const samples = scan.samples;
      const end = Math.min(upTo, SCAN_STEPS);
      for (let i = 0; i < end; i++) {
        const sA = samples[i], sB = samples[i + 1];
        if (!sA || !sB || !sA.stokes || !sB.stokes) continue;
        const a = P(sA.stokes), b = P(sB.stokes);
        const front = (a[2] + b[2]) / 2 > 0;
        if (front !== near) continue;
        // the scan covers exactly one period, so colour runs once across it
        const colorT = (i + 0.5) / SCAN_STEPS;
        ctx.strokeStyle = jetCss(colorT, near ? 0.95 : 0.5);
        ctx.lineWidth = near ? 4 : 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
    }

    function drawRotationAxis(near) {
      if (!scan) return;
      const ax = scan.axisAt(Math.max(0, upTo));
      for (const sgn of [1, -1]) {
        const tip = [ax[0] * 1.18 * sgn, ax[1] * 1.18 * sgn, ax[2] * 1.18 * sgn];
        const a = P([0, 0, 0]), b = P(tip);
        if ((b[2] > 0) !== near) continue;
        ctx.strokeStyle = near ? 'rgba(15,18,24,0.9)' : 'rgba(15,18,24,0.4)';
        ctx.lineWidth = 2.4;
        ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.setLineDash([]);
        if (sgn === 1) {
          ctx.fillStyle = near ? 'rgba(15,18,24,0.92)' : 'rgba(15,18,24,0.45)';
          ctx.beginPath(); ctx.arc(b[0], b[1], 4.2, 0, 2 * Math.PI); ctx.fill();
        }
      }
    }

    /*
     * The input ○ and output ● markers are drawn in a single pass *on top* of
     * the whole sphere. On the far hemisphere they keep a strong colour and a
     * bright halo (instead of fading into the frosted body and the grid), so
     * the state vector stays legible whichever way the sphere is turned.
     */
    function drawStateMarkersTop() {
      // input: open circle ○
      if (inputS) {
        const p = P(inputS), near = p[2] >= 0;
        ctx.strokeStyle = near ? 'rgba(71,85,105,0.95)' : 'rgba(71,85,105,0.62)';
        ctx.lineWidth = near ? 2.2 : 2;
        ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 2 * Math.PI); ctx.stroke();
      }
      // output: vector from the origin + filled dot ●
      if (result.stokes) {
        const p = P(result.stokes), o = P([0, 0, 0]), near = p[2] >= 0;
        ctx.strokeStyle = near ? 'rgba(10,12,16,0.95)' : 'rgba(10,12,16,0.6)';
        ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
        ctx.fillStyle = near ? '#0a0c10' : 'rgba(10,12,16,0.62)';
        ctx.beginPath(); ctx.arc(p[0], p[1], 6.5, 0, 2 * Math.PI); ctx.fill();
        ctx.strokeStyle = near ? '#ffffff' : 'rgba(255,255,255,0.9)';
        ctx.lineWidth = near ? 1.6 : 2.2;
        ctx.beginPath(); ctx.arc(p[0], p[1], 6.5, 0, 2 * Math.PI); ctx.stroke();
      }
    }

    function drawLabels() {
      ctx.font = '600 15px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const al of AXIS_LABELS) {
        const surf = P(al[1]);
        const lab = P([al[1][0] * 1.14, al[1][1] * 1.14, al[1][2] * 1.14]);
        const front = surf[2] > 0;
        ctx.fillStyle = front ? 'rgba(40,48,64,0.95)' : 'rgba(40,48,64,0.38)';
        ctx.beginPath(); ctx.arc(surf[0], surf[1], 2.8, 0, 2 * Math.PI); ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.strokeText(al[0], lab[0], lab[1]);
        ctx.fillStyle = front ? 'rgba(25,32,46,1)' : 'rgba(25,32,46,0.42)';
        ctx.fillText(al[0], lab[0], lab[1]);
      }
    }

    /*
     * Geometric ψ / χ read-out, drawn only for a stationary state. The output
     * point sits at azimuth 2ψ and elevation 2χ, so we draw the little angle
     * arcs at the sphere's centre: ψ in the equator plane (from the H axis to
     * the state's meridian) and χ in that meridian (from the equator up to the
     * state vector). Just the arc + the Greek letter — the numbers live in the
     * sidebar. The shared "foot" ray is ψ's second side and χ's first side.
     */
    function drawAngleGuides() {
      const s = result.stokes;
      const ARC_R = 0.42, LBL_R = 0.56, GUIDE = '79,70,229';
      const phi2 = Math.atan2(s[1], s[0]);                       // 2ψ (azimuth)
      const chi2 = Math.asin(Math.max(-1, Math.min(1, s[2])));   // 2χ (elevation)
      const eqLen = Math.hypot(s[0], s[1]);
      const fx = eqLen > 1e-6 ? s[0] / eqLen : 1;
      const fy = eqLen > 1e-6 ? s[1] / eqLen : 0;
      const drawPsi = eqLen > 1e-3 && Math.abs(phi2) > 3 * DEG;
      const drawChi = Math.abs(chi2) > 3 * DEG;
      if (!drawPsi && !drawChi) return;

      function guideLine(pts, width) {
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        for (let i = 0; i < pts.length - 1; i++) {
          const a = P(pts[i]), b = P(pts[i + 1]);
          ctx.strokeStyle = 'rgba(' + GUIDE + ',' + ((a[2] + b[2]) / 2 >= 0 ? 0.95 : 0.4) + ')';
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
      }
      function arc(fn, ang) {
        const n = Math.max(2, Math.round(Math.abs(ang) / (2 * DEG)));
        const out = [];
        for (let k = 0; k <= n; k++) out.push(fn(ang * k / n));
        return out;
      }
      function guideLabel(text, p3) {
        const p = P(p3), near = p[2] >= 0;
        ctx.font = '700 15px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.strokeText(text, p[0], p[1]);
        ctx.fillStyle = 'rgba(' + GUIDE + ',' + (near ? 1 : 0.5) + ')';
        ctx.fillText(text, p[0], p[1]);
      }

      guideLine([[0, 0, 0], [ARC_R * fx, ARC_R * fy, 0]], 1.5);   // shared foot ray
      if (drawPsi) {
        guideLine(arc(function (a) { return [ARC_R * Math.cos(a), ARC_R * Math.sin(a), 0]; }, phi2), 2);
        const am = phi2 / 2;
        guideLabel('ψ', [LBL_R * Math.cos(am), LBL_R * Math.sin(am), 0]);
      }
      if (drawChi) {
        guideLine(arc(function (e) {
          return [ARC_R * Math.cos(e) * fx, ARC_R * Math.cos(e) * fy, ARC_R * Math.sin(e)];
        }, chi2), 2);
        const em = chi2 / 2;
        guideLabel('χ', [LBL_R * Math.cos(em) * fx, LBL_R * Math.cos(em) * fy, LBL_R * Math.sin(em)]);
      }
    }

    /* --- far hemisphere --- */
    drawGrid(false);
    drawTrace(false);
    drawRotationAxis(false);

    /* --- translucent body --- */
    const g = ctx.createRadialGradient(cxs - 0.35 * Rs, cys - 0.38 * Rs, 0.12 * Rs, cxs, cys, Rs);
    g.addColorStop(0, 'rgba(255,255,255,0.92)');
    g.addColorStop(0.55, 'rgba(238,242,248,0.78)');
    g.addColorStop(1, 'rgba(196,205,221,0.82)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cxs, cys, Rs, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = 'rgba(116,128,150,0.75)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    /* --- near hemisphere --- */
    drawGrid(true);
    drawTrace(true);
    drawRotationAxis(true);
    drawLabels();

    /* ψ / χ arcs only while the state is at rest (hidden during any motion) */
    if (!state.scanAnim && !state.scanView && !state.transition && result.stokes) {
      drawAngleGuides();
    }

    /* --- markers always on top, so the far side stays visible --- */
    drawStateMarkersTop();
  }

  /* drag to orbit */
  (function () {
    let dragging = false, lastX = 0, lastY = 0;
    canvas.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add('grabbing');
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      view.azim -= (e.clientX - lastX) * 0.4;
      view.elev += (e.clientY - lastY) * 0.4;
      view.elev = Math.max(-89, Math.min(89, view.elev));
      lastX = e.clientX; lastY = e.clientY;
      draw();
    });
    const stop = function (e) { dragging = false; canvas.classList.remove('grabbing'); };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
  })();

  /* =============================== scanning ============================== */

  function paramLabel(comp, param) {
    return param === 'phase' ? 'phase shift δ' : 'angle θ';
  }

  function compTitle(comp) {
    const def = COMPONENT_DEFS[comp.type];
    const idx = state.components.indexOf(comp) + 1;
    return def.name + ' (element ' + idx + ')';
  }

  function computeScanSamples(comp, param, span) {
    const samples = [];
    for (let k = 0; k <= SCAN_STEPS; k++) {
      const value = span * k / SCAN_STEPS;
      samples.push(propagate(currentInputJones(), activeComponents(),
        { id: comp.id, param: param, value: value }));
    }
    return samples;
  }

  function scanAxisFn(comp, param, span) {
    if (param === 'phase') {
      const fixed = elementAxis(comp.angle);
      return function () { return fixed; };
    }
    return function (idx) { return elementAxis(span * idx / SCAN_STEPS); };
  }

  function cancelScan(restoreInput) {
    if (state.scanAnim) {
      cancelAnimationFrame(state.scanAnim.raf);
      if (restoreInput !== false) restoreScannedInput(state.scanAnim);
      state.scanAnim = null;
    }
  }

  function restoreScannedInput(anim) {
    const card = cardById(anim.comp.id);
    if (!card) return;
    const inp = card.querySelector('input[data-param="' + anim.param + '"]');
    if (inp) { inp.value = anim.originalValue; inp.classList.remove('scanning'); }
    card.classList.remove('scanning');
  }

  function startScan(comp, param) {
    clearScanState();
    // wave-plate / polarizer angles are 180°-periodic, so an angle scan only
    // needs a half-turn; a phase shift δ needs the full 0…360°.
    const span = param === 'phase' ? 360 : 180;
    const samples = computeScanSamples(comp, param, span);
    const card = cardById(comp.id);
    const inp = card ? card.querySelector('input[data-param="' + param + '"]') : null;
    const anim = {
      comp: comp, param: param,
      samples: samples,
      span: span,
      // a polarizer scan always earns the Malus plot — even a flat ½ on
      // circular light is the expected, instructive result; for anything else
      // show it only when the scan actually moves the transmitted intensity.
      showIntensity: COMPONENT_DEFS[comp.type].kind === 'polarizer' || intensityVaries(samples),
      axisAt: scanAxisFn(comp, param, span),
      idx: 0,
      t0: null,                         // stamped on the first animation frame
      originalValue: inp ? inp.value : '',
      raf: 0,
      label: compTitle(comp) + ' — ' + paramLabel(comp, param)
    };
    state.scanAnim = anim;
    if (card) card.classList.add('scanning');
    if (inp) inp.classList.add('scanning');
    markerAxisRow.hidden = false;       // the dashed rotation axis is now on screen
    showLegend(anim, true);

    const tick = function (now) {
      if (anim.t0 == null) anim.t0 = now;
      const progress = Math.min(1, Math.max(0, (now - anim.t0) / SCAN_MS));
      anim.idx = Math.max(0, Math.min(SCAN_STEPS, Math.round(progress * SCAN_STEPS)));
      const value = span * anim.idx / SCAN_STEPS;
      if (inp) inp.value = value.toFixed(1);
      updateReadouts(anim.samples[anim.idx]);
      draw();
      if (progress < 1) {
        anim.raf = requestAnimationFrame(tick);
      } else {
        restoreScannedInput(anim);
        state.scanAnim = null;
        state.scanView = anim;          // freeze result at the end of the scan
        showLegend(anim, false);
        draw();
      }
    };
    anim.raf = requestAnimationFrame(tick);
  }

  function showLegend(anim, running) {
    legendEl.hidden = false;
    const endTxt = anim.span + '°';
    legendStatus.textContent = running
      ? 'scanning 0° → ' + endTxt + ' …'
      : 'scan finished — shown at ' + endTxt + '. Change anything (or close) to return to the live view.';
    if (anim.showIntensity) {
      // with a polarizer in the beam the interesting quantity is the
      // transmitted intensity, so the colour key gives way to a Malus plot.
      const sym = anim.param === 'phase' ? 'δ' : 'θ';
      legendLabel.textContent = compTitle(anim.comp) + ' — output I / I₀ vs ' + sym;
      drawIntensityPlot(anim.samples, anim.span);
    } else {
      legendLabel.textContent = anim.label + ' [°]';
      drawColorbar(anim.span);
    }
  }

  function setLegendTicks(span) {
    legendTicks.innerHTML = '';
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      const s = document.createElement('span');
      s.textContent = Math.round(span * f) + '°';
      legendTicks.append(s);
    }
  }

  function drawColorbar(span) {
    legendColormap.hidden = false;
    legendGraph.hidden = true;
    legendTicks.hidden = false;
    setLegendTicks(span);
    const g = legendBar.getContext('2d');
    const w = legendBar.width, h = legendBar.height;
    for (let x = 0; x < w; x++) {
      g.fillStyle = jetCss(x / (w - 1));
      g.fillRect(x, 0, 1, h);
    }
  }

  /* Transmitted intensity I/I₀ versus the scanned polarizer angle. The curve is
     coloured with the same jet map as the sphere trace, so it doubles as the
     colour key the colorbar would otherwise provide. */
  function drawIntensityPlot(samples, span) {
    legendColormap.hidden = true;
    legendGraph.hidden = false;
    legendTicks.hidden = true;            // this plot carries its own angle axis
    const g = legendPlot.getContext('2d');
    const w = legendPlot.width, h = legendPlot.height;
    g.clearRect(0, 0, w, h);
    // the box title ("output I / I₀ vs θ") already names both axes, so the
    // plot only needs numeric ticks.
    const padL = 34, padR = 14, padT = 12, padB = 30;
    const x0 = padL, x1 = w - padR, y0 = padT, y1 = h - padB;
    const pw = x1 - x0, ph = y1 - y0;

    // horizontal gridlines + intensity labels (0, 0.5, 1)
    g.lineWidth = 1.5;
    g.font = '500 16px ui-sans-serif, system-ui, sans-serif';
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (const v of [0, 0.5, 1]) {
      const y = y1 - v * ph;
      g.strokeStyle = v === 0 ? 'rgba(120,130,150,0.5)' : 'rgba(120,130,150,0.2)';
      g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
      g.fillStyle = 'rgba(91,102,119,0.95)';
      g.fillText(v.toFixed(1), x0 - 6, y);
    }
    // x-axis with angle ticks (end labels aligned inward so they never clip)
    g.strokeStyle = 'rgba(120,130,150,0.5)';
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x0, y1); g.lineTo(x1, y1); g.stroke();
    g.fillStyle = 'rgba(91,102,119,0.95)';
    g.font = '500 15px ui-sans-serif, system-ui, sans-serif';
    g.textBaseline = 'top';
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      g.textAlign = f === 0 ? 'left' : f === 1 ? 'right' : 'center';
      g.fillText(Math.round(span * f) + '°', x0 + f * pw, y1 + 7);
    }
    // the intensity curve
    g.lineWidth = 3;
    g.lineJoin = 'round'; g.lineCap = 'round';
    const n = samples.length;
    for (let i = 0; i < n - 1; i++) {
      const iA = Math.max(0, Math.min(1, samples[i].intensity || 0));
      const iB = Math.max(0, Math.min(1, samples[i + 1].intensity || 0));
      const xA = x0 + pw * i / (n - 1), yA = y1 - iA * ph;
      const xB = x0 + pw * (i + 1) / (n - 1), yB = y1 - iB * ph;
      g.strokeStyle = jetCss((i + 0.5) / (n - 1), 0.95);
      g.beginPath(); g.moveTo(xA, yA); g.lineTo(xB, yB); g.stroke();
    }
  }

  function clearScanState() {
    cancelScan();
    cancelTransition();
    state.scanView = null;
    legendEl.hidden = true;
    markerAxisRow.hidden = true;
  }

  /* ===================== component fly-in transitions ==================== */

  function cancelTransition() {
    if (state.transition) {
      cancelAnimationFrame(state.transition.raf);
      state.transition = null;
    }
  }

  /*
   * Animate the displayed output state through a sequence of intermediate
   * results so the marker visibly glides to its new home instead of jumping.
   * `sampleAt(f)` maps f∈[0,1] (already eased) to a propagation result.
   */
  function runTransition(sampleAt) {
    cancelTransition();
    const anim = { t0: null, raf: 0, current: sampleAt(0) };
    state.transition = anim;
    updateReadouts(anim.current);
    draw();
    const tick = function (now) {
      if (anim.t0 == null) anim.t0 = now;
      const p = Math.min(1, Math.max(0, (now - anim.t0) / TRANSITION_MS));
      anim.current = sampleAt(easeInOut(p));
      updateReadouts(anim.current);
      draw();
      if (p < 1) {
        anim.raf = requestAnimationFrame(tick);
      } else {
        state.transition = null;
        updateReadouts(liveResult());
        draw();
      }
    };
    anim.raf = requestAnimationFrame(tick);
  }

  /* Every user edit funnels through here: snap back to the live view. */
  function mutated() {
    clearScanState();
    updateIcons();
    updateReadouts(liveResult());
    draw();
  }

  legendClose.addEventListener('click', function () { mutated(); });

  /* ============================ bench / chain UI ========================= */

  function cardById(id) {
    return chainEl.querySelector('.comp-card[data-id="' + id + '"]');
  }

  function iconSvg(type) {
    const def = COMPONENT_DEFS[type];
    if (type === 'POL') {
      return '<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" stroke-width="2"/>' +
        '<g class="axis-rot"><line x1="18" y1="5.5" x2="18" y2="30.5" stroke="currentColor" stroke-width="2.4"/>' +
        '<line x1="11" y1="9" x2="11" y2="27" stroke="currentColor" stroke-width="1.2" opacity="0.55"/>' +
        '<line x1="25" y1="9" x2="25" y2="27" stroke="currentColor" stroke-width="1.2" opacity="0.55"/></g></svg>';
    }
    const tag = type === 'HWP' ? 'λ/2' : type === 'QWP' ? 'λ/4' : 'δ';
    return '<svg viewBox="0 0 36 36"><rect x="5" y="5" width="26" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<g class="axis-rot"><line x1="18" y1="6.5" x2="18" y2="29.5" stroke="currentColor" stroke-width="2.4"/>' +
      '<polygon points="18,4.5 15.6,9 20.4,9" fill="currentColor"/></g>' +
      '<text x="18" y="21" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" ' +
      'style="paint-order:stroke" stroke="#fff" stroke-width="3">' + tag + '</text></svg>';
  }

  /* Rotate the fast-axis glyph with the set angle (positive = CCW from +x in
     the lab; the icon's reference line points along +y, i.e. 90°). */
  function updateIcons() {
    for (const comp of state.components) {
      const card = cardById(comp.id);
      if (!card) continue;
      const g = card.querySelector('.axis-rot');
      if (g) g.setAttribute('transform', 'rotate(' + (90 - comp.angle) + ' 18 18)');
    }
  }

  function addComponent(type, index) {
    const def = COMPONENT_DEFS[type];
    const fromResult = liveResult();            // bench output before the drop
    const comp = { id: nextId++, type: type, angle: 0 };
    if (def.variableDelta) comp.phase = def.defaultDelta;
    if (index == null || index < 0 || index > state.components.length) {
      state.components.push(comp);
    } else {
      state.components.splice(index, 0, comp);
    }
    renderChain();
    clearScanState();                           // a new element leaves any scan view
    const toResult = liveResult();              // bench output after the drop
    const moved = fromResult.stokes && toResult.stokes &&
      !stokesClose(fromResult.stokes, toResult.stokes);
    if (moved && def.kind === 'retarder') {
      // ramp the new plate's retardance 0 → full: the marker follows the true
      // rotation about the element's eigen-axis (identity at scale 0).
      runTransition(function (f) {
        return propagate(currentInputJones(), activeComponents(),
          { id: comp.id, param: 'retardScale', value: f });
      });
    } else if (moved) {
      // a polarizer projects rather than rotates — glide along the great circle.
      runTransition(function (f) { return slerpResult(fromResult, toResult, f); });
    } else {
      updateReadouts(toResult);
      draw();
    }
  }

  function removeComponent(id) {
    state.components = state.components.filter(function (c) { return c.id !== id; });
    renderChain();
    mutated();
  }

  function moveComponent(id, index) {
    const from = state.components.findIndex(function (c) { return c.id === id; });
    if (from < 0) return;
    const comp = state.components.splice(from, 1)[0];
    if (index > from) index--;
    state.components.splice(index, 0, comp);
    renderChain();
    mutated();
  }

  /* The chain as the beam would see it with `comp` forced into the beam — used
     while animating a hide/show so the toggled element is present throughout. */
  function chainWithToggled(comp) {
    return state.components.filter(function (c) { return !c.hidden || c.id === comp.id; });
  }

  /*
   * Hide (bypass) or show a component without touching its settings. The marker
   * glides to its new home with the same short fly-in used when a component is
   * dropped in: a retarder ramps its retardance between identity and full (so
   * the marker follows the true rotation about its eigen-axis), anything else
   * slides along the great circle between the two bench outputs.
   */
  function toggleHidden(comp) {
    const def = COMPONENT_DEFS[comp.type];
    const becomingHidden = !comp.hidden;
    const fromResult = liveResult();            // bench output before the toggle
    comp.hidden = becomingHidden;
    renderChain();
    clearScanState();                           // a beam change leaves any scan view
    const toResult = liveResult();              // bench output after the toggle
    const moved = fromResult.stokes && toResult.stokes &&
      !stokesClose(fromResult.stokes, toResult.stokes);
    if (moved && def.kind === 'retarder') {
      const chain = chainWithToggled(comp);
      const a = becomingHidden ? 1 : 0, b = becomingHidden ? 0 : 1;
      runTransition(function (f) {
        return propagate(currentInputJones(), chain,
          { id: comp.id, param: 'retardScale', value: a + (b - a) * f });
      });
    } else if (moved) {
      runTransition(function (f) { return slerpResult(fromResult, toResult, f); });
    } else {
      updateReadouts(toResult);
      draw();
    }
  }

  function paramRow(comp, param, symbol, value) {
    const row = document.createElement('div');
    row.className = 'param-row';
    const lab = document.createElement('label');
    lab.textContent = symbol;
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.step = 'any';
    inp.value = value;
    inp.dataset.param = param;
    inp.setAttribute('aria-label', symbol + ' of ' + COMPONENT_DEFS[comp.type].name);
    inp.addEventListener('input', function () {
      const v = parseFloat(inp.value);
      comp[param === 'phase' ? 'phase' : 'angle'] = isFinite(v) ? v : 0;
      mutated();
    });
    const unit = document.createElement('span');
    unit.className = 'unit';
    unit.textContent = '°';
    const scanBtn = document.createElement('button');
    scanBtn.type = 'button';
    scanBtn.className = 'scan-btn';
    scanBtn.textContent = 'Scan';
    scanBtn.disabled = !!comp.hidden;
    scanBtn.title = comp.hidden
      ? 'Show this element to scan it'
      : 'Animate ' + (param === 'phase' ? 'δ from 0° to 360°' : 'θ from 0° to 180°') + ' (6 s)';
    scanBtn.addEventListener('click', function () { startScan(comp, param); });
    row.append(lab, inp, unit, scanBtn);
    return row;
  }

  function buildCard(comp) {
    const def = COMPONENT_DEFS[comp.type];
    const card = document.createElement('div');
    card.className = 'comp-card';
    card.dataset.id = comp.id;
    card.style.setProperty('--accent', def.color);

    const head = document.createElement('div');
    head.className = 'comp-head';
    head.draggable = true;
    head.title = 'Drag to reorder';
    const title = document.createElement('span');
    title.textContent = def.name;
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'rm-btn';
    rm.innerHTML = '&times;';
    rm.title = 'Remove element';
    rm.addEventListener('click', function () { removeComponent(comp.id); });
    head.append(title, rm);

    head.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', 'move:' + comp.id);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    });
    head.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      clearCaret();
    });

    const icon = document.createElement('div');
    icon.className = 'comp-icon';
    icon.innerHTML = iconSvg(comp.type);

    if (comp.hidden) card.classList.add('bypassed');

    card.append(head, icon);
    card.append(paramRow(comp, 'angle', 'θ', comp.angle));
    if (def.variableDelta) card.append(paramRow(comp, 'phase', 'δ', comp.phase));

    const foot = document.createElement('div');
    foot.className = 'comp-foot';
    const hideBtn = document.createElement('button');
    hideBtn.type = 'button';
    hideBtn.className = 'hide-btn';
    hideBtn.textContent = comp.hidden ? 'Show' : 'Hide';
    hideBtn.title = comp.hidden
      ? 'Put this element back into the beam'
      : 'Bypass this element — its settings are kept for when you show it again';
    hideBtn.addEventListener('click', function () { toggleHidden(comp); });
    foot.append(hideBtn);
    card.append(foot);
    return card;
  }

  function renderChain() {
    chainEl.innerHTML = '';
    for (const comp of state.components) chainEl.append(buildCard(comp));
    chainEl.classList.toggle('empty', state.components.length === 0);
    updateIcons();
  }

  /* ------------------------------- palette ------------------------------ */

  for (const type in COMPONENT_DEFS) {
    const def = COMPONENT_DEFS[type];
    const item = document.createElement('div');
    item.className = 'pal-item';
    item.draggable = true;
    item.style.setProperty('--accent', def.color);
    item.innerHTML = '<div class="comp-icon">' + iconSvg(type) + '</div>' +
      '<div class="pal-name">' + def.name + '</div><div class="pal-hint">drag in or click to add</div>';
    item.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', 'new:' + type);
      e.dataTransfer.effectAllowed = 'copy';
    });
    item.addEventListener('click', function () { addComponent(type); });
    paletteEl.append(item);
  }

  /* ----------------------------- drop handling --------------------------- */

  let caret = null;
  function clearCaret() {
    if (caret && caret.parentElement) caret.parentElement.removeChild(caret);
    caret = null;
  }

  function dropIndex(e) {
    const cards = Array.from(chainEl.querySelectorAll('.comp-card'));
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (e.clientX < r.left + r.width / 2) return i;
    }
    return cards.length;
  }

  chainEl.addEventListener('dragover', function (e) {
    e.preventDefault();
    const idx = dropIndex(e);
    if (!caret) { caret = document.createElement('div'); caret.className = 'drop-caret'; }
    const cards = chainEl.querySelectorAll('.comp-card');
    if (idx >= cards.length) chainEl.append(caret);
    else chainEl.insertBefore(caret, cards[idx]);
  });
  chainEl.addEventListener('dragleave', function (e) {
    if (!chainEl.contains(e.relatedTarget)) clearCaret();
  });
  chainEl.addEventListener('drop', function (e) {
    e.preventDefault();
    const idx = dropIndex(e);
    clearCaret();
    const data = e.dataTransfer.getData('text/plain') || '';
    if (data.indexOf('new:') === 0) addComponent(data.slice(4), idx);
    else if (data.indexOf('move:') === 0) moveComponent(parseInt(data.slice(5), 10), idx);
  });

  /* ----------------------------- input state ---------------------------- */

  function setInput(key, jones) {
    state.inputKey = key;
    state.inputJones = jones;
    inputSel.value = key;
    mutated();
  }

  inputSel.addEventListener('change', function () {
    const k = inputSel.value;
    if (k === 'RND') setInput('RND', randomJones());
    else setInput(k, BASIS[k].jones);
  });
  diceBtn.addEventListener('click', function () { setInput('RND', randomJones()); });

  /* ------------------------------- presets ------------------------------ */

  const PRESETS = [
    {
      id: 'blank', group: null, label: '— sandbox (empty bench) —',
      input: 'H', comps: [], desc: ''
    },
    {
      id: 's8-1', group: 'Übungsserie 8', label: '8.1 — Three polarizers A · B · C',
      input: 'D',
      comps: [{ type: 'POL', angle: 0 }, { type: 'POL', angle: 45 }, { type: 'POL', angle: 90 }],
      scan: { index: 1, param: 'angle' },
      desc: 'Crossed polarizers A (0°) and C (90°) with B in between (D input loses half its ' +
        'intensity at A, like unpolarized light). While B is scanned, watch the transmitted ' +
        'intensity: I ∝ sin²(2θ) after C — zero whenever B is parallel to A or C, maximal at 45°. ' +
        'The output state itself is pinned to V (or extinguished).'
    },
    {
      id: 's8-3c', group: 'Übungsserie 8', label: '8.3 c — Birefringent crystal on D (phase scan)',
      input: 'D',
      comps: [{ type: 'PS', angle: 0, phase: 90 }],
      scan: { index: 0, param: 'phase' },
      desc: 'The crystal with optical axis along x acts as diag(1, e^{iδ}) with δ = 2π(nₑ−n₀)d/λ. ' +
        'Growing thickness d carries the diagonal input around the H–V axis: D → L → A → R → D. ' +
        'At δ = 90° (d = 7.5 µm) the crystal is a quarter-wave plate.'
    },
    {
      id: 's8-3e', group: 'Übungsserie 8', label: '8.3 e–g — Rotating-QWP polarimeter',
      input: 'RND',
      comps: [{ type: 'QWP', angle: 0 }, { type: 'POL', angle: 0 }],
      scan: { index: 0, param: 'angle' },
      desc: 'Classic polarimetry: an unknown (random) input passes a rotating λ/4 plate and a fixed ' +
        'horizontal polarizer. The output is always H — but the intensity I(θ) read at a few angles ' +
        '(e.g. 0°, 22.5°, 45°, 67.5°) determines all four Stokes parameters of the input. Re-roll with 🎲.'
    },
    {
      id: 's9-1a', group: 'Übungsserie 9', label: '9.1 a — L through two parallel λ/4 plates',
      input: 'L',
      comps: [{ type: 'QWP', angle: 0 }, { type: 'QWP', angle: 0 }],
      desc: 'Left-circular light: the first λ/4 plate (axis at 0°) makes it anti-diagonal (A), the ' +
        'second turns it right-circular (R) — two quarter-wave plates act as one half-wave plate. ' +
        'Remove one plate, or scan an angle, to explore.'
    },
    {
      id: 's9-1b', group: 'Übungsserie 9', label: '9.1 b — second λ/4 plate at 45°',
      input: 'L',
      comps: [{ type: 'QWP', angle: 0 }, { type: 'QWP', angle: 45 }],
      desc: 'After the first plate the light is linear at −45° (A) — parallel to the second plate\'s ' +
        'axis. An eigenstate passes unchanged: only a global phase π/2 is added, the point on the ' +
        'sphere stays at A.'
    },
    {
      id: 's9-1c', group: 'Übungsserie 9', label: '9.1 c — second λ/4 plate at 90°',
      input: 'L',
      comps: [{ type: 'QWP', angle: 0 }, { type: 'QWP', angle: 90 }],
      desc: 'The second plate is crossed with the first and undoes it: the output returns to ' +
        'left-circular L (up to a global phase π/2). Crossed quarter-wave plates compensate.'
    },
    {
      id: 's9-1e', group: 'Übungsserie 9', label: '9.1 e — Figure-8: rotating λ/4 on linear input',
      input: 'H',
      comps: [{ type: 'QWP', angle: 45 }],
      scan: { index: 0, param: 'angle' },
      desc: 'Scanning the λ/4-plate axis sweeps the output along a figure-8 whose crossing point is ' +
        'the input state H; the lobes touch the poles when the plate sits at ±45°. Try a circular ' +
        'input (L) instead — then the output stays linear and circles the equator.'
    },
    {
      id: 's9-2a', group: 'Übungsserie 9', label: '9.2 a — LCD phase modulator on circular input',
      input: 'L',
      comps: [{ type: 'PS', angle: 0, phase: 0 }],
      scan: { index: 0, param: 'phase' },
      desc: 'The liquid-crystal modulator diag(e^{iφ}, e^{−iφ}) rotates the Poincaré sphere about ' +
        'the H–V axis by the relative phase δ = 2φ (H and V are its eigenmodes — try them: nothing ' +
        'moves). A circular input sweeps the great circle L → A → R → D.'
    },
    {
      id: 's9-2b', group: 'Übungsserie 9', label: '9.2 b — Modulator between ±45° polarizers',
      input: 'D',
      comps: [{ type: 'POL', angle: 45 }, { type: 'PS', angle: 0, phase: 90 }, { type: 'POL', angle: 135 }],
      scan: { index: 1, param: 'phase' },
      desc: 'Between crossed ±45° polarizers the modulator turns phase into brightness: ' +
        'I = sin²(δ/2) = sin²φ. Watch the intensity readout during the scan — dark at δ = 0°, fully ' +
        'transmitting at δ = 180° (half-wave condition flips D to A). The output state is pinned at A.'
    },
    {
      id: 's9-3', group: 'Übungsserie 9', label: '9.3 — λ/2 plate: rotation in the equator plane',
      input: 'H',
      comps: [{ type: 'HWP', angle: 22.5 }],
      scan: { index: 0, param: 'angle' },
      desc: 'A half-wave plate at angle φ takes linear light at 0° to linear light at 2φ — on the ' +
        'sphere the output moves at 4φ, so a full 0°→180° scan laps the equator twice. Note: this is a ' +
        '180° flip about the plate\'s own (moving) axis, not a rotation about the L/R axis — for ' +
        'elliptical inputs it also mirrors the ellipticity (try input L).'
    },
    {
      id: 's9-3x', group: 'Übungsserie 9', label: '9.3 Bonus — λ/2·λ/4·λ/2·λ/4·λ/2 universal gadget',
      input: 'H',
      comps: [
        { type: 'HWP', angle: 15 }, { type: 'QWP', angle: 45 }, { type: 'HWP', angle: 30 },
        { type: 'QWP', angle: 135 }, { type: 'HWP', angle: 10 }
      ],
      desc: 'Euler-angle construction: with the two λ/4 plates fixed at ±45°, the outer λ/2 plates ' +
        'rotate within the equator plane while the sandwiched middle one rotates in the plane ' +
        'spanned by H/V and L/R. The three free angles (α, β, γ) of the λ/2 plates realize any ' +
        'rotation of the sphere — i.e. any lossless polarization transformation.'
    }
  ];

  (function buildPresetSelect() {
    let currentGroup = null, groupEl = null;
    for (const p of PRESETS) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.label;
      if (p.group) {
        if (p.group !== currentGroup) {
          groupEl = document.createElement('optgroup');
          groupEl.label = p.group;
          presetSel.append(groupEl);
          currentGroup = p.group;
        }
        groupEl.append(opt);
      } else {
        presetSel.append(opt);
      }
    }
  })();

  function applyPreset(p) {
    state.components = p.comps.map(function (c) {
      const comp = { id: nextId++, type: c.type, angle: c.angle };
      if (COMPONENT_DEFS[c.type].variableDelta) comp.phase = c.phase != null ? c.phase : COMPONENT_DEFS[c.type].defaultDelta;
      return comp;
    });
    renderChain();
    presetDesc.textContent = p.desc;
    presetDesc.hidden = !p.desc;
    if (p.input === 'RND') setInput('RND', randomJones());
    else setInput(p.input, BASIS[p.input].jones);
    if (p.scan && state.components[p.scan.index]) {
      const comp = state.components[p.scan.index];
      window.setTimeout(function () { startScan(comp, p.scan.param); }, 150);
    }
  }

  presetSel.addEventListener('change', function () {
    const p = PRESETS.find(function (q) { return q.id === presetSel.value; });
    if (p) applyPreset(p);
  });

  /* -------------------------------- boot --------------------------------- */

  window.addEventListener('resize', resizeCanvas);
  renderChain();
  updateReadouts(liveResult());
  resizeCanvas();
})();
