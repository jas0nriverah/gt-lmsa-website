// Decorative anatomy in CSS pixels. No drift, randomness, or autonomous signals.
export type FieldPoint = { x: number; y: number; dx: number; dy: number; vx: number; vy: number };
type Curve = { points: [FieldPoint, FieldPoint, FieldPoint, FieldPoint]; width: number; owner: number; terminal: boolean };
type Neuron = { center: FieldPoint; radius: number; angle: number; gold: boolean; glow: number };
type Pulse = { edge: number; start: number };
export type NeuralField = {
  width: number; height: number; points: FieldPoint[]; neurons: Neuron[]; branches: Curve[]; axons: Curve[]; pulses: Pulse[];
};
export type FieldPointer = { x: number; y: number; movedAt: number; closest: number };
const TAU = Math.PI * 2;
const NAVY = "0,48,87";
const GOLD = "179,163,105";
export const FIELD_RADIUS = 190;

export function createNeuralField(width: number, height: number): NeuralField {
  const field: NeuralField = { width, height, points: [], neurons: [], branches: [], axons: [], pulses: [] };
  const point = (x: number, y: number): FieldPoint => {
    const p = { x, y, dx: 0, dy: 0, vx: 0, vy: 0 };
    field.points.push(p);
    return p;
  };
  const anchors = width < 768
    ? [[.06, .08], [.96, .36], [.08, .76], [.87, .95]]
    : [[.045, .10], [.035, .55], [.22, .94], [.52, .08], [.69, .25], [.965, .13], [.965, .69], [.72, .93]];
  const scale = width < 768 ? .7 : Math.min(1.12, width / 1350);
  anchors.forEach(([x, y], i) => {
    const center = point(width * x, height * y);
    const angle = i * 1.73;
    field.neurons.push({ center, angle, radius: (15 + (i % 3) * 2) * scale, gold: i % 3 === 0, glow: 0 });
    // Uneven arbors, with curved bifurcations and rounded synaptic boutons.
    for (let arm = 0; arm < 5; arm++) {
      const direction = angle + arm * TAU / 5 + Math.sin(i + arm * 3) * .22;
      const length = (67 + ((i * 17 + arm * 23) % 47)) * scale;
      const polar = (distance: number, theta: number, origin = center) => point(origin.x + Math.cos(theta) * distance, origin.y + Math.sin(theta) * distance);
      const fork = polar(length * .58, direction + .12);
      field.branches.push({ points: [center, polar(length * .18, direction - .17), polar(length * .42, direction + .25), fork], width: 1.8 * scale, owner: i, terminal: false });
      for (const side of [-1, 1]) {
        const turn = direction + side * (.44 + (arm % 2) * .16);
        const end = polar(length * .54, turn, fork);
        field.branches.push({ points: [fork, polar(length * .16, direction, fork), polar(length * .37, turn + side * .16, fork), end], width: .85 * scale, owner: i, terminal: true });
        if ((arm + i + side) % 2 === 0) {
          const twig = polar(length * .36, turn + side * .53, fork);
          field.branches.push({ points: [fork, polar(length * .1, turn, fork), polar(length * .26, turn + side * .66, fork), twig], width: .55 * scale, owner: i, terminal: true });
        }
      }
    }
  });
  const targets = width < 768 ? [1, 3, 0, 2] : [3, 0, 1, 4, 5, 6, 7, 4];
  targets.forEach((target, i) => {
    const start = field.neurons[i].center;
    const destination = field.neurons[target].center;
    const dx = destination.x - start.x;
    const dy = destination.y - start.y;
    const distance = Math.hypot(dx, dy);
    // Approach an actual receiving dendritic bouton, but leave a 7px cleft.
    const receivingTips = field.branches.filter((branch) => branch.owner === target && branch.terminal).map((branch) => branch.points[3]);
    const receivingTip = receivingTips.reduce((best, tip) => Math.hypot(tip.x - start.x, tip.y - start.y) < Math.hypot(best.x - start.x, best.y - start.y) ? tip : best);
    const end = point(receivingTip.x - dx / distance * 7, receivingTip.y - dy / distance * 7);
    const bend = Math.min(72, distance * .19) * (i % 2 ? -1 : 1);
    field.axons.push({ points: [start, point(start.x + dx * .33 - dy / distance * bend, start.y + dy * .33 + dx / distance * bend), point(start.x + dx * .68 + dy / distance * bend, start.y + dy * .68 - dx / distance * bend), end], width: 1.1 * scale, owner: i, terminal: true });
  });
  return field;
}

export function closestNeuron(field: NeuralField, x: number, y: number) {
  let best = 0;
  let distance = Infinity;
  field.neurons.forEach(({ center }, i) => {
    const d = Math.hypot(center.x - x, center.y - y);
    if (d < distance) { best = i; distance = d; }
  });
  return best;
}

export function stimulateNeuron(field: NeuralField, closest: number, now: number) {
  // Each cell has an outgoing axon. A bounded pulse cannot become a pointer trail.
  const edge = field.axons.findIndex((axon) => axon.owner === closest);
  if (edge >= 0 && field.pulses.length < 3) field.pulses.push({ edge, start: now });
}

export function stepNeuralField(field: NeuralField, pointer: FieldPointer | null, now: number, dt: number) {
  // A stationary pointer releases the field, rather than holding tissue displaced.
  const strength = pointer ? Math.max(0, 1 - Math.max(0, now - pointer.movedAt - 100) / 260) : 0;
  let displacement = 0;
  let moving = false;
  // Bounded substeps make the damped spring stable even after a slow frame.
  const steps = Math.max(1, Math.ceil(Math.min(dt, .05) / (1 / 120)));
  const h = Math.min(dt, .05) / steps;
  for (const p of field.points) {
    const x = pointer ? pointer.x - p.x : 0;
    const y = pointer ? pointer.y - p.y : 0;
    const distance = Math.hypot(x, y);
    const influence = Math.max(0, 1 - distance / FIELD_RADIUS);
    const pull = strength * influence * Math.min(20, distance * .32) / Math.max(1, distance);
    const tx = x * pull;
    const ty = y * pull;
    for (let s = 0; s < steps; s++) {
      p.vx += ((tx - p.dx) * 190 - p.vx * 24) * h;
      p.vy += ((ty - p.dy) * 190 - p.vy * 24) * h;
      p.dx += p.vx * h;
      p.dy += p.vy * h;
    }
    if (!strength && Math.hypot(p.dx, p.dy, p.vx, p.vy) < .025) p.dx = p.dy = p.vx = p.vy = 0;
    displacement = Math.max(displacement, Math.hypot(p.dx, p.dy));
    if (p.dx || p.dy || p.vx || p.vy) moving = true;
  }
  for (let i = 0; i < field.neurons.length; i++) {
    const neuron = field.neurons[i];
    const local = pointer ? Math.max(0, 1 - Math.hypot(pointer.x - neuron.center.x, pointer.y - neuron.center.y) / FIELD_RADIUS) : 0;
    const target = strength * Math.max(local, pointer?.closest === i ? .65 : 0);
    neuron.glow += (target - neuron.glow) * (1 - Math.exp(-dt * 12));
    if (!strength && neuron.glow < .001) neuron.glow = 0;
    if (neuron.glow) moving = true;
  }
  field.pulses = field.pulses.filter((pulse) => now - pulse.start < 1500);
  return { displacement, moving: moving || field.pulses.length > 0 || strength > 0, active: strength > 0 };
}

export function resetNeuralField(field: NeuralField) {
  for (const p of field.points) p.dx = p.dy = p.vx = p.vy = 0;
  for (const n of field.neurons) n.glow = 0;
  field.pulses = [];
}

const position = (p: FieldPoint) => ({ x: p.x + p.dx, y: p.y + p.dy });
function trace(ctx: CanvasRenderingContext2D, curve: Curve) {
  const [a, b, c, d] = curve.points.map(position);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(b.x, b.y, c.x, c.y, d.x, d.y);
}
function along(curve: Curve, t: number) {
  const [a, b, c, d] = curve.points.map(position);
  const u = 1 - t;
  return { x: u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x,
    y: u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y };
}
function halo(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, alpha: number, color: string) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${color},${alpha})`); gradient.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill();
}

export function drawNeuralField(ctx: CanvasRenderingContext2D, field: NeuralField, now: number) {
  const { width: w, height: h } = field;
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  // Far-background membranes; deliberately incomplete, faint, and not graph nodes.
  ctx.strokeStyle = `rgba(${GOLD},.085)`; ctx.lineWidth = 1;
  for (const [x, y, radius] of [[.18, .02, 44], [.96, .42, 68], [.58, .95, 52]]) {
    ctx.beginPath(); ctx.ellipse(w * x, h * y, radius, radius * .81, -.4, .3, TAU - .3); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(w * x + 3, h * y - 2, radius - 5, radius * .81 - 4, -.4, .9, TAU - .6); ctx.stroke();
  }
  // One quiet ECG accent, in the lower-right margin, not woven into every axon.
  ctx.strokeStyle = `rgba(${GOLD},.14)`;
  ctx.beginPath();
  const ecg = [[-72, 0], [-22, 0], [-16, -5], [-9, 9], [0, -16], [8, 4], [15, 0], [67, 0]];
  ecg.forEach(([x, y], i) => i ? ctx.lineTo(w * .88 + x, h * .92 + y) : ctx.moveTo(w * .88 + x, h * .92 + y)); ctx.stroke();
  for (const curve of [...field.axons, ...field.branches]) {
    const neuron = field.neurons[curve.owner];
    const color = neuron.gold ? GOLD : NAVY;
    const alpha = (curve.width > 1.4 ? .23 : .18) + neuron.glow * .17;
    ctx.strokeStyle = `rgba(${color},${alpha})`; ctx.lineWidth = curve.width;
    trace(ctx, curve); ctx.stroke();
    if (curve.terminal) {
      const tip = position(curve.points[3]);
      if (neuron.glow > .01) halo(ctx, tip.x, tip.y, 7, neuron.glow * .16, GOLD);
      ctx.fillStyle = `rgba(${color},${.22 + neuron.glow * .28})`;
      ctx.beginPath(); ctx.ellipse(tip.x, tip.y, 1.7, 1.15, neuron.angle, 0, TAU); ctx.fill();
    }
  }
  for (const neuron of field.neurons) {
    const { x, y } = position(neuron.center);
    const color = neuron.gold ? GOLD : NAVY;
    const radius = neuron.radius * (1 + neuron.glow * .14);
    if (neuron.glow) halo(ctx, x, y, radius * 2.7, neuron.glow * .14, GOLD);
    // Soft, irregular soma with five tapered origins flowing into the arbors.
    const outline = Array.from({ length: 20 }, (_, j) => {
      const theta = neuron.angle + j * TAU / 20;
      const r = radius * (1 + .24 * Math.cos(j * TAU / 4) + .09 * Math.sin(j * 2.3));
      return { x: x + Math.cos(theta) * r, y: y + Math.sin(theta) * r };
    });
    ctx.beginPath();
    ctx.moveTo((outline[19].x + outline[0].x) / 2, (outline[19].y + outline[0].y) / 2);
    outline.forEach((p, j) => { const next = outline[(j + 1) % outline.length]; ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2); });
    ctx.closePath(); ctx.fillStyle = `rgba(${color},${.075 + neuron.glow * .12})`; ctx.fill();
    ctx.strokeStyle = `rgba(${color},${.32 + neuron.glow * .26})`; ctx.lineWidth = 1.05; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x - radius * .1, y + radius * .08, radius * .36, radius * .30, neuron.angle, 0, TAU);
    ctx.fillStyle = `rgba(${color},${.14 + neuron.glow * .14})`; ctx.fill();
    ctx.strokeStyle = `rgba(${color},.18)`; ctx.lineWidth = .6; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + radius * .02, y + radius * .08, radius * .09, 0, TAU); ctx.fill();
  }
  for (const pulse of field.pulses) {
    const elapsed = (now - pulse.start) / 1500;
    const curve = field.axons[pulse.edge];
    const t = Math.min(1, elapsed / .83);
    const p = along(curve, t);
    const alpha = Math.sin(Math.PI * Math.min(1, elapsed)) * .65;
    halo(ctx, p.x, p.y, t === 1 ? 11 : 6, alpha * .4, GOLD);
    ctx.fillStyle = `rgba(${GOLD},${alpha})`; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, TAU); ctx.fill();
  }
}
