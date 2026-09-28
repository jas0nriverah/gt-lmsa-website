// Deterministic, decorative microscopy artwork. Coordinates and physics use CSS pixels.
export const LENS_RADIUS = 220;
const TAU = Math.PI * 2;
const NAVY = "0,48,87";
const BLUE = "85,121,145";
const GOLD = "179,163,105";
export type TissuePoint = { x: number; y: number; dx: number; dy: number; vx: number; vy: number };
type Cell = { center: TissuePoint; radius: number; ratio: number; angle: number; phase: number; kind: "blood" | "nucleated"; gold: boolean };
type Vessel = { points: [TissuePoint, TissuePoint, TissuePoint, TissuePoint]; width: number };
type Accent = { center: TissuePoint; angle: number; size: number };
type Signal = { vessel: number; start: number; from: number };
export type LensPointer = { x: number; y: number; movedAt: number };
export type Tissue = {
  width: number; height: number; points: TissuePoint[]; cells: Cell[]; vessels: Vessel[];
  dna: Accent[]; neurons: Accent[]; membranes: Accent[]; pulses: Signal[];
  reveal: number; force: number; lens: { x: number; y: number };
};

export function createTissue(width: number, height: number, compact = false): Tissue {
  const tissue: Tissue = { width, height, points: [], cells: [], vessels: [], dna: [], neurons: [], membranes: [], pulses: [], reveal: 0, force: 0, lens: { x: 0, y: 0 } };
  const point = (x: number, y: number): TissuePoint => {
    const p = { x, y, dx: 0, dy: 0, vx: 0, vy: 0 };
    tissue.points.push(p); return p;
  };
  const noise = (n: number) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
  const small = width < 768 || compact;
  const columns = small ? 3 : Math.max(5, Math.ceil(width / 185));
  const rows = small ? 4 : Math.max(4, Math.ceil(height / 145));
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    const i = row * columns + column;
    tissue.cells.push({
      center: point((column + .5 + (noise(i) - .5) * .62) * width / columns, (row + .5 + (noise(i + 71) - .5) * .6) * height / rows),
      radius: (20 + noise(i + 3) * 13) * (small ? .8 : 1), ratio: i % 7 === 0 ? .35 : .65 + noise(i + 40) * .2,
      angle: noise(i + 8) * TAU, phase: noise(i + 12) * TAU, kind: i % 9 === 4 ? "nucleated" : "blood", gold: i % 5 === 2,
    });
  }
  // Narrow, double-walled capillary beds: curved branching vessels, not node connections.
  const beds = small ? [[-.08, .42], [.65, .88]] : [[.04, .20], [.44, .75], [.81, .29]];
  beds.forEach(([x, y], i) => {
    const cx = width * x; const cy = height * y; const direction = i % 2 ? -1 : 1;
    const joint = point(cx + 165, cy + direction * 34);
    const vessel = (points: Vessel["points"], lineWidth: number) => tissue.vessels.push({ points, width: lineWidth });
    vessel([point(cx - 125, cy + 52), point(cx - 10, cy - 98), point(cx + 76, cy + direction * 105), joint], 10);
    vessel([joint, point(cx + 223, cy + direction * 18), point(cx + 212, cy - direction * 133), point(cx + 335, cy - direction * 100)], 6);
    vessel([joint, point(cx + 246, cy + direction * 30), point(cx + 210, cy + direction * 175), point(cx + 334, cy + direction * 143)], 5);
  });
  (small ? [[.75, .68]] : [[.29, .76], [.81, .20], [.57, .42]]).forEach(([x, y], i) => tissue.dna.push({ center: point(width * x, height * y), angle: -.52 + i * .59, size: small ? .65 : .85 }));
  // Just two elongated cells with asymmetric apical arbors; no radial/star-shaped nodes.
  if (!small) [[.12, .77], [.94, .71]].forEach(([x, y], i) => tissue.neurons.push({ center: point(width * x, height * y), angle: i ? -.6 : .85, size: .8 }));
  [[.09, .1], [.52, .14], [.87, .88]].slice(0, small ? 1 : 3).forEach(([x, y], i) => tissue.membranes.push({ center: point(width * x, height * y), angle: i * .7, size: 38 + i * 11 }));
  return tissue;
}

export function stimulateTissue(tissue: Tissue, pointer: LensPointer, now: number) {
  let nearest = -1; let distance = LENS_RADIUS; let from = 0;
  tissue.vessels.forEach((vessel, i) => {
    // Hit-test the visible curve, not its off-curve Bezier handles.
    for (let sample = 0; sample <= 16; sample++) {
      const t = sample / 16; const p = vesselPosition(vessel, t);
      const d = Math.hypot(pointer.x - p.x, pointer.y - p.y);
      if (d < distance) { nearest = i; distance = d; from = t; }
    }
  });
  if (nearest >= 0 && tissue.pulses.length < 2) tissue.pulses.push({ vessel: nearest, start: now, from });
}

export function stepTissue(tissue: Tissue, pointer: LensPointer | null, now: number, elapsed: number) {
  const dt = Math.min(Math.max(elapsed, 0), .05);
  const age = pointer ? now - pointer.movedAt : Infinity;
  // Geometry relaxes first; the lens lingers briefly, then disappears when idle.
  const force = Math.max(0, 1 - Math.max(0, age - 80) / 450);
  const revealTarget = Math.max(0, 1 - Math.max(0, age - 650) / 850);
  if (pointer) tissue.lens = { x: pointer.x, y: pointer.y };
  tissue.force += (force - tissue.force) * (1 - Math.exp(-dt * 12));
  tissue.reveal += (revealTarget - tissue.reveal) * (1 - Math.exp(-dt * (pointer ? 14 : 7)));
  if (!revealTarget && tissue.reveal < .001) tissue.reveal = 0;
  if (!force && tissue.force < .001) tissue.force = 0;
  let displacement = 0;
  let moving = tissue.force > 0 || tissue.reveal > 0;
  const steps = Math.max(1, Math.ceil(dt * 120)); const h = dt / steps;
  for (const p of tissue.points) {
    const x = tissue.lens.x - p.x; const y = tissue.lens.y - p.y;
    const distance = Math.hypot(x, y);
    const influence = Math.max(0, 1 - distance / LENS_RADIUS);
    // A gentle fluid swirl/pull, bounded to a few pixels, never a pointer trail.
    const amount = force * influence * Math.min(15, distance * .22) / Math.max(1, distance);
    const tx = (x * .85 - y * .22) * amount; const ty = (y * .85 + x * .22) * amount;
    for (let s = 0; s < steps; s++) {
      p.vx += ((tx - p.dx) * 150 - p.vx * 23) * h; p.vy += ((ty - p.dy) * 150 - p.vy * 23) * h;
      p.dx += p.vx * h; p.dy += p.vy * h;
    }
    if (!force && Math.hypot(p.dx, p.dy, p.vx, p.vy) < .02) p.dx = p.dy = p.vx = p.vy = 0;
    displacement = Math.max(displacement, Math.hypot(p.dx, p.dy));
    if (p.dx || p.dy || p.vx || p.vy) moving = true;
  }
  tissue.pulses = tissue.pulses.filter((pulse) => now - pulse.start < 1200);
  return { displacement, moving: moving || tissue.pulses.length > 0, active: revealTarget > 0 };
}

export function resetTissue(tissue: Tissue) {
  for (const p of tissue.points) p.dx = p.dy = p.vx = p.vy = 0;
  tissue.reveal = tissue.force = 0; tissue.pulses = []; tissue.lens = { x: 0, y: 0 };
}

const position = (p: TissuePoint) => ({ x: p.x + p.dx, y: p.y + p.dy });
function vesselPosition(vessel: Vessel, t: number) {
  const u = 1 - t; const [a,b,c,d] = vessel.points.map(position);
  return { x: u**3*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t**3*d.x, y: u**3*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t**3*d.y };
}
function traceVessel(ctx: CanvasRenderingContext2D, vessel: Vessel) {
  const [a, b, c, d] = vessel.points.map(position);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(b.x, b.y, c.x, c.y, d.x, d.y);
}
function irregularCell(ctx: CanvasRenderingContext2D, radius: number, ratio: number, phase: number) {
  const points = Array.from({ length: 24 }, (_, i) => {
    const angle = i * TAU / 24;
    const r = radius * (1 + .065 * Math.sin(angle * 3 + phase) + .045 * Math.cos(angle * 2 - phase));
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r * ratio };
  });
  ctx.beginPath(); ctx.moveTo((points[23].x + points[0].x) / 2, (points[23].y + points[0].y) / 2);
  points.forEach((p, i) => { const next = points[(i + 1) % points.length]; ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2); });
  ctx.closePath();
}

export function drawTissue(ctx: CanvasRenderingContext2D, tissue: Tissue, now: number) {
  const { width, height } = tissue;
  ctx.clearRect(0, 0, width, height); ctx.lineCap = "round"; ctx.lineJoin = "round";
  // Render one hidden tissue layer, then apply one soft microscope mask to all of it.
  for (const vessel of tissue.vessels) {
    traceVessel(ctx, vessel); ctx.strokeStyle = `rgba(${BLUE},.24)`; ctx.lineWidth = vessel.width; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = vessel.width - 1.7; ctx.stroke();
    ctx.strokeStyle = `rgba(${GOLD},.12)`; ctx.lineWidth = .65; ctx.stroke();
  }
  for (const membrane of tissue.membranes) {
    const p = position(membrane.center); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(membrane.angle);
    irregularCell(ctx, membrane.size, .79, 1.7); ctx.strokeStyle = `rgba(${BLUE},.22)`; ctx.lineWidth = .7; ctx.stroke();
    irregularCell(ctx, membrane.size - 5, .79, 1.7); ctx.strokeStyle = `rgba(${GOLD},.18)`; ctx.stroke(); ctx.restore();
  }
  for (const cell of tissue.cells) {
    const p = position(cell.center);
    const local = Math.max(0, 1 - Math.hypot(p.x - tissue.lens.x, p.y - tissue.lens.y) / LENS_RADIUS);
    const zoom = 1 + local * tissue.force * .13;
    const color = cell.gold ? GOLD : cell.kind === "blood" ? BLUE : NAVY;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(cell.angle); ctx.scale(zoom, zoom);
    const r = cell.radius;
    irregularCell(ctx, r, cell.ratio, cell.phase);
    // A pale center and richer rim suggest biconcave erythrocytes, without red icons.
    const fill = ctx.createRadialGradient(-r * .1, -r * .06, r * .12, 0, 0, r);
    fill.addColorStop(0, `rgba(${color},.018)`); fill.addColorStop(.56, `rgba(${color},.10)`); fill.addColorStop(.83, `rgba(${color},.23)`); fill.addColorStop(1, `rgba(${color},.08)`);
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = `rgba(${color},.38)`; ctx.lineWidth = .95; ctx.stroke();
    if (cell.kind === "blood") {
      ctx.beginPath(); ctx.ellipse(-r * .09, r * .03, r * .48, r * cell.ratio * .46, .06, 0, TAU);
      ctx.strokeStyle = `rgba(${color},.22)`; ctx.lineWidth = .7; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -r * .03, r * .77, r * cell.ratio * .72, 0, Math.PI * 1.12, Math.PI * 1.9);
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.6; ctx.stroke();
    } else {
      // Lobulated nucleus and a few fine cytoplasmic granules.
      ctx.save(); ctx.translate(-r * .09, 0); irregularCell(ctx, r * .42, .82, cell.phase + 2);
      ctx.fillStyle = `rgba(${NAVY},.11)`; ctx.fill(); ctx.strokeStyle = `rgba(${NAVY},.28)`; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
      for (let i = 0; i < 8; i++) { const a = i * 2.4 + cell.phase; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .64, Math.sin(a) * r * cell.ratio * .65, .9, 0, TAU); ctx.fillStyle = `rgba(${BLUE},.28)`; ctx.fill(); }
    }
    ctx.restore();
  }
  for (const dna of tissue.dna) {
    const p = position(dna.center); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(dna.angle); ctx.scale(dna.size, dna.size);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let y = -90; y <= 90; y += 3) { const x = side * Math.sin((y + 90) / 24) * 19; if (y === -90) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.strokeStyle = `rgba(${side === 1 ? NAVY : GOLD},.31)`; ctx.lineWidth = 1.2; ctx.stroke();
    }
    for (let y = -84; y < 88; y += 9) { const x = Math.sin((y + 90) / 24) * 19; ctx.beginPath(); ctx.moveTo(-x, y); ctx.lineTo(x, y + 2); ctx.strokeStyle = `rgba(${BLUE},.20)`; ctx.lineWidth = .75; ctx.stroke(); }
    ctx.restore();
  }
  for (const neuron of tissue.neurons) {
    const p = position(neuron.center); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(neuron.angle); ctx.scale(neuron.size, neuron.size);
    // An elongated piriform soma, one apical dendrite and asymmetric lateral branches.
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.bezierCurveTo(8, -10, 22, 9, 9, 20); ctx.bezierCurveTo(-11, 35, -22, 7, -10, -6); ctx.quadraticCurveTo(-4, -14, 0, -24);
    ctx.fillStyle = `rgba(${BLUE},.10)`; ctx.fill(); ctx.strokeStyle = `rgba(${NAVY},.29)`; ctx.lineWidth = .9; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 7, 5.5, 7, .3, 0, TAU); ctx.strokeStyle = `rgba(${NAVY},.23)`; ctx.stroke();
    const branches = [[0,-23,-12,-51,6,-72,-3,-112],[-3,-69,-23,-67,-29,-91,-49,-98],[-3,-83,13,-88,14,-110,33,-123],[10,18,37,18,40,2,65,-5],[-11,10,-33,14,-34,40,-59,45],[4,24,0,59,22,71,14,116]];
    ctx.strokeStyle = `rgba(${BLUE},.30)`;
    for (const [a,b,c,d,e,f,g,h] of branches) { ctx.beginPath(); ctx.moveTo(a,b); ctx.bezierCurveTo(c,d,e,f,g,h); ctx.lineWidth = .8; ctx.stroke(); }
    ctx.restore();
  }
  // Two small, open waveform fragments, not repeated decorative icons.
  for (const [x, y] of [[.38, .12], [.83, .87]].slice(0, width < 768 ? 1 : 2)) {
    ctx.beginPath(); const wave = [[-55,0],[-20,0],[-14,-4],[-8,7],[0,-16],[7,5],[13,0],[50,0]];
    wave.forEach(([dx,dy], i) => i ? ctx.lineTo(width*x+dx,height*y+dy) : ctx.moveTo(width*x+dx,height*y+dy));
    ctx.strokeStyle = `rgba(${GOLD},.30)`; ctx.lineWidth = .9; ctx.stroke();
  }
  for (const signal of tissue.pulses) {
    const progress = Math.max(0, Math.min(1, (now - signal.start) / 1200));
    const t = Math.max(0, Math.min(1, signal.from + (signal.from > .6 ? -1 : 1) * progress * .4));
    const { x,y } = vesselPosition(tissue.vessels[signal.vessel],t);
    ctx.beginPath(); ctx.arc(x,y,2.3,0,TAU); ctx.fillStyle = `rgba(${GOLD},${Math.sin(progress*Math.PI)*.65})`; ctx.fill();
  }
  ctx.globalCompositeOperation = "destination-in";
  const baseline = .028;
  if (tissue.reveal) {
    const mask = ctx.createRadialGradient(tissue.lens.x,tissue.lens.y,0,tissue.lens.x,tissue.lens.y,LENS_RADIUS);
    mask.addColorStop(0,`rgba(0,0,0,${baseline+tissue.reveal*.94})`);
    mask.addColorStop(.38,`rgba(0,0,0,${baseline+tissue.reveal*.78})`);
    mask.addColorStop(.72,`rgba(0,0,0,${baseline+tissue.reveal*.28})`);
    mask.addColorStop(1,`rgba(0,0,0,${baseline})`); ctx.fillStyle=mask;
  } else ctx.fillStyle=`rgba(0,0,0,${baseline})`;
  ctx.fillRect(0,0,width,height); ctx.globalCompositeOperation="source-over";
}
