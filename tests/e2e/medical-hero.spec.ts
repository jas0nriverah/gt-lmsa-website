import { expect, test, type Locator, type Page } from "@playwright/test";

const desktopSomaAnchors = [
  [0.045, 0.1],
  [0.035, 0.55],
  [0.22, 0.94],
  [0.52, 0.08],
  [0.69, 0.25],
  [0.965, 0.13],
  [0.965, 0.69],
  [0.72, 0.93],
] as const;

async function expectBackgroundSpansHero(network: Locator) {
  const coverage = await network.evaluate((element) => {
    const section = element.closest("section");
    if (!section) throw new Error("The neural background must belong to the hero section");
    const hero = section.getBoundingClientRect();
    const background = element.getBoundingClientRect();
    return {
      width: background.width,
      height: background.height,
      leftGap: Math.abs(background.left - hero.left),
      rightGap: Math.abs(background.right - hero.right),
      topGap: Math.abs(background.top - hero.top),
      bottomGap: Math.abs(background.bottom - hero.bottom),
    };
  });
  expect(coverage.width).toBeGreaterThan(0);
  expect(coverage.height).toBeGreaterThan(0);
  expect(coverage.leftGap).toBeLessThanOrEqual(1);
  expect(coverage.rightGap).toBeLessThanOrEqual(1);
  expect(coverage.topGap).toBeLessThanOrEqual(1);
  expect(coverage.bottomGap).toBeLessThanOrEqual(1);
}

async function pointAtAnchor(network: Locator, index: number) {
  return network.evaluate((element, anchor) => {
    const bounds = element.getBoundingClientRect();
    const [x, y] = anchor;
    return { x: bounds.left + bounds.width * x, y: bounds.top + bounds.height * y };
  }, desktopSomaAnchors[index]);
}

async function moveNearAnchor(page: Page, network: Locator, index: number) {
  const point = await pointAtAnchor(network, index);
  await page.mouse.move(point.x + 24, point.y + 8);
}

async function expectStaticCanvas(network: Locator, count: number) {
  await expect(network).toHaveAttribute("data-interactive", "false");
  await expect(network).toHaveAttribute("data-state", "static");
  await expect(network).toHaveAttribute("data-neuron-count", String(count));
  await expect(network).toHaveAttribute("data-active-neuron", "-1");
  await expect.poll(() => network.getAttribute("data-displacement").then(Number)).toBe(0);
  await expect.poll(() => network.getAttribute("data-pulses").then(Number)).toBe(0);
  await expect(network.locator("canvas")).toHaveCount(1);
  await expectBackgroundSpansHero(network);
  const baseline = await network.locator("canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  await network.page().mouse.move(60, 140);
  await network.page().waitForTimeout(200);
  expect(await network.locator("canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL())).toBe(baseline);
}

async function expectCanvasIdle(network: Locator) {
  await expect(network).toHaveAttribute("data-state", "idle", { timeout: 5000 });
  await expect(network).toHaveAttribute("data-active-neuron", "-1");
  await expect.poll(() => network.getAttribute("data-displacement").then(Number)).toBeLessThan(0.1);
  await expect.poll(() => network.getAttribute("data-pulses").then(Number)).toBe(0);
}

test("welcome hero fits mobile, presents a concise board, and keeps its canvas static", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to GT-LMSA+", exact: true })).toBeVisible();
  await expect(page.getByTestId("medical-hero").getByRole("img", { name: "Latino Medical Student Association PLUS logo" })).toBeVisible();
  await expect(page.getByRole("button", { name: /(?:pause|play).*motion|hero animation/i })).toHaveCount(0);

  const network = page.getByTestId("neural-network");
  await expect(network).toHaveAttribute("aria-hidden", "true");
  await expectStaticCanvas(network, 4);

  const board = page.locator("#executive-board .board-person");
  await expect(board).toHaveCount(8);
  for (const card of await board.all()) {
    await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(card.locator("p")).toHaveCount(1);
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("reduced motion keeps the desktop canvas static without hiding chapter identity", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to GT-LMSA+", exact: true })).toBeVisible();
  await expect(page.getByTestId("medical-hero").getByRole("img")).toBeVisible();
  const network = page.getByTestId("neural-network");
  await expect(network).toHaveAttribute("aria-hidden", "true");
  await expectStaticCanvas(network, 8);
  await expect(page.getByRole("button", { name: /(?:pause|play).*motion|hero animation/i })).toHaveCount(0);
});

test("desktop canvas responds to the nearest soma, settles, and leaves the join link usable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const network = page.getByTestId("neural-network");
  await expect(network).toHaveAttribute("data-interactive", "true");
  await expect(network).toHaveAttribute("data-neuron-count", "8");
  await expect(network).toHaveAttribute("aria-hidden", "true");
  await expect(network).toHaveCSS("pointer-events", "none");
  await expect(network.locator("canvas")).toHaveCount(1);
  await expectBackgroundSpansHero(network);
  await expectCanvasIdle(network);

  const idleFrame = await network.locator("canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(200);
  const nextIdleFrame = await network.locator("canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  expect(nextIdleFrame).toBe(idleFrame);
  await testInfo.attach("neural-background-idle.png", {
    body: await network.screenshot(),
    contentType: "image/png",
  });

  const heroBounds = await network.boundingBox();
  if (!heroBounds) throw new Error("Missing hero bounds");
  await page.mouse.move(heroBounds.x + 4, heroBounds.y + 4);
  await expect(network).toHaveAttribute("data-active-neuron", "0");
  await expect.poll(() => network.getAttribute("data-state")).toMatch(/^(active|settling)$/);
  await expect.poll(() => network.getAttribute("data-displacement").then(Number)).toBeGreaterThanOrEqual(1);
  expect(await network.locator("canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL())).not.toBe(idleFrame);

  // A quick move across the hero should select the nearby right-side soma.
  await moveNearAnchor(page, network, 5);
  await expect(network).toHaveAttribute("data-active-neuron", "5");
  await expect.poll(() => network.getAttribute("data-state")).toMatch(/^(active|settling)$/);
  await expect.poll(() => network.getAttribute("data-displacement").then(Number)).toBeGreaterThanOrEqual(1);

  // All earlier signals must finish before testing a fresh empty-region activation.
  await expectCanvasIdle(network);

  // This point is well away from every soma; proximity still chooses the closest one and emits a pulse.
  const emptyPoint = await network.evaluate((element, anchors) => {
    const bounds = element.getBoundingClientRect();
    const x = 0.45;
    const y = 0.5;
    const nearestNeuron = anchors
      .map(([anchorX, anchorY], index) => ({
        index,
        distance: Math.hypot((anchorX - x) * bounds.width, (anchorY - y) * bounds.height),
      }))
      .sort((left, right) => left.distance - right.distance)[0].index;
    return {
      x: bounds.left + bounds.width * x,
      y: bounds.top + bounds.height * y,
      nearestNeuron,
    };
  }, desktopSomaAnchors);
  await page.mouse.move(emptyPoint.x, emptyPoint.y);
  await expect(network).toHaveAttribute("data-active-neuron", String(emptyPoint.nearestNeuron));
  await expect.poll(() => network.getAttribute("data-state")).toMatch(/^(active|settling)$/);
  await expect.poll(() => network.getAttribute("data-pulses").then(Number)).toBeGreaterThan(0);

  // Leave the pointer still over the hero; the response must decay without requiring pointer leave.
  await expectCanvasIdle(network);
  await expect.poll(() => network.getAttribute("data-displacement").then(Number), { timeout: 5000 }).toBeLessThan(0.1);
  const settledFrame = await network.locator("canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  expect(settledFrame).toBe(idleFrame);
  await page.waitForTimeout(200);
  const stableFrame = await network.locator("canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  expect(stableFrame).toBe(settledFrame);

  const hero = page.getByRole("region", { name: "Welcome to GT-LMSA+", exact: true });
  await hero.getByRole("link", { name: "Join LMSA+", exact: true }).click();
  await expect(page).toHaveURL(/\/join(?:\?|$)/);
});

test("enabling reduced motion during an active response clears canvas motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const network = page.getByTestId("neural-network");
  await expect(network).toHaveAttribute("data-interactive", "true");
  await moveNearAnchor(page, network, 0);
  await expect.poll(() => network.getAttribute("data-state")).toMatch(/^(active|settling)$/);
  await expect.poll(() => network.getAttribute("data-displacement").then(Number)).toBeGreaterThanOrEqual(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectStaticCanvas(network, 8);
});

test.describe("desktop-sized touch devices", () => {
  test.use({ hasTouch: true, viewport: { width: 1440, height: 1000 } });

  test("keep the canvas static even with no reduced-motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expectStaticCanvas(page.getByTestId("neural-network"), 8);
  });
});
