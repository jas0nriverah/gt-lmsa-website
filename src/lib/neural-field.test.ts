import assert from "node:assert/strict";
import test from "node:test";
import {
  closestNeuron,
  createNeuralField,
  FIELD_RADIUS,
  resetNeuralField,
  stepNeuralField,
  stimulateNeuron,
} from "./neural-field";

test("creates deterministic eight-neuron desktop and four-neuron mobile geometry", () => {
  const desktop = createNeuralField(1440, 900);
  const mobile = createNeuralField(390, 844);

  assert.equal(desktop.neurons.length, 8);
  assert.equal(desktop.axons.length, 8);
  assert.equal(desktop.branches.length, 160);
  assert.equal(mobile.neurons.length, 4);
  assert.equal(mobile.axons.length, 4);
  assert.equal(mobile.branches.length, 80);
  assert.deepEqual(desktop, createNeuralField(1440, 900));
  assert.deepEqual(mobile, createNeuralField(390, 844));
  assert.deepEqual(desktop.neurons.map(({ center }) => [center.x / 1440, center.y / 900]), [
    [0.045, 0.1], [0.035, 0.55], [0.22, 0.94], [0.52, 0.08],
    [0.69, 0.25], [0.965, 0.13], [0.965, 0.69], [0.72, 0.93],
  ]);
});

test("pulls nearby geometry within 190px, leaves remote points unchanged, and bounds displacement", () => {
  const field = createNeuralField(1440, 900);
  const anchor = field.neurons[0].center;
  const pointerX = anchor.x + 80;
  const pointerY = anchor.y;
  const nearby = anchor;
  const remote = field.points.find((point) => Math.hypot(point.x - pointerX, point.y - pointerY) > FIELD_RADIUS);
  assert.ok(remote, "fixture should include points outside the local field");

  let maxDisplacement = 0;
  for (let frame = 0; frame < 180; frame++) {
    const now = frame * (1000 / 60);
    const pointer = { x: pointerX, y: pointerY, movedAt: now, closest: 0 };
    const result = stepNeuralField(field, pointer, now, 1 / 60);
    maxDisplacement = Math.max(maxDisplacement, result.displacement);
    assert.equal(remote.dx, 0);
    assert.equal(remote.dy, 0);
  }

  assert.ok(Math.hypot(nearby.dx, nearby.dy) > 0, "nearby geometry should respond");
  assert.ok(maxDisplacement <= 14, `expected bounded displacement, got ${maxDisplacement}`);
});

test("switches the closest neuron immediately as the pointer moves between cells", () => {
  const field = createNeuralField(1440, 900);
  const first = field.neurons[0].center;
  const next = field.neurons[5].center;
  assert.equal(closestNeuron(field, first.x, first.y), 0);
  assert.equal(closestNeuron(field, next.x, next.y), 5);

  let now = 100;
  let pointer = { x: first.x, y: first.y, movedAt: now, closest: closestNeuron(field, first.x, first.y) };
  stepNeuralField(field, pointer, now, 1 / 60);
  assert.ok(field.neurons[0].glow > 0);

  now += 16;
  pointer = { x: next.x, y: next.y, movedAt: now, closest: closestNeuron(field, next.x, next.y) };
  stepNeuralField(field, pointer, now, 1 / 60);
  assert.equal(pointer.closest, 5);
  assert.ok(field.neurons[5].glow > 0);
});

test("a stationary pointer releases the spring and fully rests within five seconds", () => {
  const field = createNeuralField(1440, 900);
  const anchor = field.neurons[0].center;
  const pointer = { x: anchor.x + 75, y: anchor.y + 12, movedAt: 0, closest: 0 };
  let result = { displacement: Infinity, moving: true, active: true };

  for (let frame = 1; frame <= 300; frame++) {
    result = stepNeuralField(field, pointer, frame * (1000 / 60), 1 / 60);
  }

  assert.equal(result.displacement, 0);
  assert.equal(result.moving, false);
  assert.ok(field.points.every(({ dx, dy, vx, vy }) => dx === 0 && dy === 0 && vx === 0 && vy === 0));
  assert.ok(field.neurons.every(({ glow }) => glow === 0));
});

test("caps outgoing pulses, expires them after their lifetime, and reset clears all field activity", () => {
  const field = createNeuralField(1440, 900);
  stimulateNeuron(field, 5, 1000);
  assert.equal(field.pulses.length, 1);
  assert.equal(field.axons[field.pulses[0].edge].owner, 5, "pulse should travel on the stimulated neuron's outgoing axon");

  stimulateNeuron(field, 0, 1010);
  stimulateNeuron(field, 1, 1020);
  stimulateNeuron(field, 2, 1030);
  assert.equal(field.pulses.length, 3, "pulse count must remain capped at three");

  const lifetimeField = createNeuralField(1440, 900);
  stimulateNeuron(lifetimeField, 3, 1000);
  stepNeuralField(lifetimeField, null, 2499, 1 / 60);
  assert.equal(lifetimeField.pulses.length, 1);
  stepNeuralField(lifetimeField, null, 2500, 1 / 60);
  assert.equal(lifetimeField.pulses.length, 0);

  const anchor = field.neurons[0].center;
  stepNeuralField(field, { x: anchor.x + 80, y: anchor.y, movedAt: 1100, closest: 0 }, 1100, 1 / 60);
  assert.ok(field.points.some(({ dx, dy }) => dx !== 0 || dy !== 0));
  assert.ok(field.neurons.some(({ glow }) => glow > 0));
  resetNeuralField(field);
  assert.equal(field.pulses.length, 0);
  assert.ok(field.points.every(({ dx, dy, vx, vy }) => dx === 0 && dy === 0 && vx === 0 && vy === 0));
  assert.ok(field.neurons.every(({ glow }) => glow === 0));
});
