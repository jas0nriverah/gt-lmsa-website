import assert from "node:assert/strict";
import test from "node:test";
import {
  createTissue,
  drawTissue,
  LENS_RADIUS,
  resetTissue,
  stepTissue,
  stimulateTissue,
  type LensPointer,
  type Tissue,
} from "./biomedical-lens";

function advance(tissue: Tissue, pointer: LensPointer | null, start: number, seconds: number, step = 1 / 60) {
  let result = { displacement: 0, moving: false, active: false };
  const frames = Math.ceil(seconds / step);
  let elapsedTotal = 0;
  for (let frame = 1; frame <= frames; frame++) {
    const elapsed = Math.min(step, seconds - (frame - 1) * step);
    elapsedTotal += elapsed;
    result = stepTissue(tissue, pointer, start + elapsedTotal * 1000, elapsed);
  }
  return result;
}

function maxDisplacement(tissue: Tissue) {
  return Math.max(0, ...tissue.points.map((point) => Math.hypot(point.dx, point.dy)));
}

test("tissue layout is deterministic and uses fewer cells on mobile", () => {
  const mobile = createTissue(390, 844);
  const mobileAgain = createTissue(390, 844);
  const desktop = createTissue(1440, 900);
  const desktopAgain = createTissue(1440, 900);
  const compactDesktop = createTissue(1440, 900, true);

  assert.equal(mobile.cells.length, 12);
  assert.equal(compactDesktop.cells.length, 12, "compact mode should remain compact at desktop viewport dimensions");
  assert.ok(mobile.cells.length < desktop.cells.length);
  assert.ok(desktop.cells.length >= 20);
  assert.deepEqual(
    mobile.cells.map(({ center, radius, ratio, angle, phase, kind, gold }) => ({ center: { x: center.x, y: center.y }, radius, ratio, angle, phase, kind, gold })),
    mobileAgain.cells.map(({ center, radius, ratio, angle, phase, kind, gold }) => ({ center: { x: center.x, y: center.y }, radius, ratio, angle, phase, kind, gold })),
  );
  assert.deepEqual(
    desktop.cells.map(({ center, radius, ratio, angle, phase, kind, gold }) => ({ center: { x: center.x, y: center.y }, radius, ratio, angle, phase, kind, gold })),
    desktopAgain.cells.map(({ center, radius, ratio, angle, phase, kind, gold }) => ({ center: { x: center.x, y: center.y }, radius, ratio, angle, phase, kind, gold })),
  );
});

test("lens position follows the exact pointer while only points inside 220px are pulled", () => {
  const tissue = createTissue(1440, 900);
  const anchor = tissue.cells[0].center;
  const pointer = { x: anchor.x + 180, y: anchor.y, movedAt: 0 };

  stepTissue(tissue, pointer, 16, 1 / 60);
  assert.deepEqual(tissue.lens, { x: pointer.x, y: pointer.y });

  const remote = tissue.points.find((point) => Math.hypot(point.x - pointer.x, point.y - pointer.y) > LENS_RADIUS + 80);
  assert.ok(remote, "fixture should contain a point outside the lens radius");
  const remoteStart = { x: remote.x, y: remote.y, dx: remote.dx, dy: remote.dy };
  const result = advance(tissue, pointer, 16, 0.5);

  assert.ok(Math.hypot(anchor.dx, anchor.dy) > 0, "nearby tissue should move toward the lens");
  assert.deepEqual(
    { x: remote.x, y: remote.y, dx: remote.dx, dy: remote.dy },
    remoteStart,
    "remote tissue should remain fixed",
  );
  assert.ok(result.displacement <= 20, "spring displacement should remain bounded");

  resetTissue(tissue);
  const edgePointer = { x: anchor.x + LENS_RADIUS + 1, y: anchor.y, movedAt: 0 };
  advance(tissue, edgePointer, 0, 0.5);
  assert.equal(Math.hypot(anchor.dx, anchor.dy), 0, "points beyond the 220px radius should not move");
});

test("stationary pointer fully settles geometry and reveal within five seconds", () => {
  const tissue = createTissue(1440, 900);
  const pointer = { x: tissue.cells[0].center.x + 80, y: tissue.cells[0].center.y, movedAt: 0 };

  advance(tissue, pointer, 0, 0.5);
  assert.ok(tissue.reveal > 0.3);
  assert.ok(maxDisplacement(tissue) > 0);

  const settled = advance(tissue, pointer, 500, 5);
  assert.equal(tissue.reveal, 0);
  assert.equal(tissue.force, 0);
  assert.equal(maxDisplacement(tissue), 0);
  assert.equal(settled.displacement, 0);
  assert.equal(settled.moving, false);
  assert.equal(settled.active, false);
});

test("pointer leave releases spring force gradually instead of snapping", () => {
  const tissue = createTissue(1440, 900);
  const pointer = { x: tissue.cells[0].center.x + 80, y: tissue.cells[0].center.y, movedAt: 0 };
  advance(tissue, pointer, 0, 0.5);
  const beforeLeave = maxDisplacement(tissue);
  assert.ok(beforeLeave > 0);

  const firstRelease = stepTissue(tissue, null, 500, 1 / 60);
  const afterRelease = maxDisplacement(tissue);
  assert.ok(afterRelease > 0, "geometry should retain momentum on the first pointer-free frame");
  assert.ok(afterRelease < beforeLeave + 1, "release should continue the spring trajectory without a jump");
  assert.ok(firstRelease.moving);

  const laterRelease = advance(tissue, null, 516.67, 0.5);
  assert.ok(maxDisplacement(tissue) < afterRelease, "spring should decay after pointer leave");
  assert.ok(laterRelease.moving, "the settling spring should keep requesting animation frames");
});

test("reset clears all lens state and returns every point to its resting geometry", () => {
  const tissue = createTissue(1440, 900);
  const pointer = { x: tissue.cells[0].center.x + 80, y: tissue.cells[0].center.y, movedAt: 0 };
  advance(tissue, pointer, 0, 0.5);
  stimulateTissue(tissue, { x: tissue.vessels[0].points[1].x, y: tissue.vessels[0].points[1].y, movedAt: 500 }, 500);
  assert.ok(tissue.reveal > 0);
  assert.ok(tissue.force > 0);
  assert.ok(tissue.pulses.length > 0);

  resetTissue(tissue);
  assert.equal(tissue.reveal, 0);
  assert.equal(tissue.force, 0);
  assert.deepEqual(tissue.lens, { x: 0, y: 0 });
  assert.equal(tissue.pulses.length, 0);
  assert.equal(maxDisplacement(tissue), 0);
  assert.ok(tissue.points.every((point) => point.vx === 0 && point.vy === 0));
});

test("pulse count is capped at two, distant stimulation is ignored, and pulses expire", () => {
  const tissue = createTissue(1440, 900);
  stimulateTissue(tissue, { x: -10_000, y: -10_000, movedAt: 0 }, 0);
  assert.equal(tissue.pulses.length, 0);

  const control = tissue.vessels[0].points[1];
  const pointer = { x: control.x, y: control.y, movedAt: 100 };
  stimulateTissue(tissue, pointer, 100);
  stimulateTissue(tissue, pointer, 200);
  for (let index = 0; index < 8; index++) stimulateTissue(tissue, pointer, 300 + index);
  assert.equal(tissue.pulses.length, 2);

  stepTissue(tissue, null, 1300, 0);
  assert.equal(tissue.pulses.length, 1, "pulse expires 1200ms after its own start time");
  stepTissue(tissue, null, 1400, 0);
  assert.equal(tissue.pulses.length, 0);
});

test("on-curve activation stores the nearest parameter on the deformed vessel", () => {
  const tissue = createTissue(1440, 900);
  const point = (x: number, y: number, dx = 0, dy = 0) => ({ x, y, dx, dy, vx: 0, vy: 0 });
  const vessel: Tissue["vessels"][number] = {
    points: [point(0, 0), point(500, 0, 10, -10), point(500, 500), point(0, 500)],
    width: 10,
  };
  tissue.vessels = [vessel];
  const t = 0.5;
  const u = 1 - t;
  const [a, b, c, d] = vessel.points;
  const clicked = {
    x: u ** 3 * (a.x + a.dx) + 3 * u ** 2 * t * (b.x + b.dx) + 3 * u * t ** 2 * (c.x + c.dx) + t ** 3 * (d.x + d.dx),
    y: u ** 3 * (a.y + a.dy) + 3 * u ** 2 * t * (b.y + b.dy) + 3 * u * t ** 2 * (c.y + c.dy) + t ** 3 * (d.y + d.dy),
  };

  assert.ok(Math.hypot(clicked.x - b.x, clicked.y - b.y) > LENS_RADIUS, "raw control point should be outside the hit radius");
  stimulateTissue(tissue, { ...clicked, movedAt: 100 }, 100);

  assert.equal(tissue.pulses.length, 1);
  assert.equal(tissue.pulses[0].vessel, 0);
  assert.equal(tissue.pulses[0].from, 0.5);
});

test("signals begin on the nearby deformed vessel, not an invisible curve handle", () => {
  const tissue = createTissue(1440, 900);
  const vessel = tissue.vessels[0];
  const coordinates = [[0, 0], [0, 1000], [1000, 1000], [1000, 0]];
  vessel.points.forEach((point, index) => {
    point.x = coordinates[index][0]; point.y = coordinates[index][1]; point.dx = 12;
  });
  tissue.vessels = [vessel];
  // This cubic's visible midpoint is over 500px away from either handle.
  stimulateTissue(tissue, { x: 512, y: 750, movedAt: 100 }, 100);
  assert.equal(tissue.pulses.length, 1);
  assert.equal(tissue.pulses[0].vessel, 0);
  assert.equal(tissue.pulses[0].from, .5);
});

test("renderer clears the canvas and applies a bounded reveal mask", () => {
  const tissue = createTissue(800, 600);
  const calls: Array<{ name: string; args: unknown[] }> = [];
  const gradientStops: Array<Array<[number, string]>> = [];
  let currentGradient = -1;
  const target = { globalCompositeOperation: "source-over" } as unknown as CanvasRenderingContext2D;
  const context = new Proxy(target, {
    get(object, property, receiver) {
      const value = Reflect.get(object, property, receiver);
      if (value !== undefined) return value;
      if (property === "createRadialGradient") {
        return (...args: unknown[]) => {
          calls.push({ name: "createRadialGradient", args });
          currentGradient = gradientStops.length;
          gradientStops.push([]);
          return {
            addColorStop: (offset: number, color: string) => gradientStops[currentGradient].push([offset, color]),
          };
        };
      }
      return (...args: unknown[]) => calls.push({ name: String(property), args });
    },
    set(object, property, value, receiver) {
      calls.push({ name: String(property), args: [value] });
      return Reflect.set(object, property, value, receiver);
    },
  });

  drawTissue(context, tissue, 0);
  assert.ok(calls.some(({ name, args }) => name === "clearRect" && args[0] === 0 && args[1] === 0 && args[2] === 800 && args[3] === 600));
  assert.ok(calls.some(({ name, args }) => name === "fillRect" && args[0] === 0 && args[1] === 0 && args[2] === 800 && args[3] === 600));
  assert.ok(calls.some(({ name, args }) => name === "globalCompositeOperation" && args[0] === "destination-in"));
  assert.equal(context.globalCompositeOperation, "source-over");

  calls.length = 0;
  tissue.lens = { x: 200, y: 300 };
  tissue.reveal = 1;
  drawTissue(context, tissue, 16);
  const mask = calls.find(({ name, args }) => name === "createRadialGradient" && args[0] === 200 && args[1] === 300 && args[5] === LENS_RADIUS);
  assert.ok(mask, "revealed frame should center its radial mask on the lens coordinates");
  const stops = gradientStops.at(-1) ?? [];
  assert.deepEqual(stops.map(([offset]) => offset), [0, 0.38, 0.72, 1]);
  const alphas = stops.map(([, color]) => Number(String(color).match(/rgba\(0,0,0,([^)]+)\)/)?.[1]));
  assert.ok(alphas.every((alpha) => Number.isFinite(alpha) && alpha >= 0 && alpha <= 1));
});
