import { expect, test, type Locator, type Page } from "@playwright/test";

function geometry(network: Locator) {
  return network.evaluate((element) => ({
    neurons: Array.from(element.querySelectorAll("[data-neuron]"), (node) => node.getAttribute("transform")),
    connections: Array.from(element.querySelectorAll("[data-connection]"), (path) => path.getAttribute("d")),
  }));
}

function signalStates(network: Locator) {
  return network.evaluate((element) => Array.from(element.querySelectorAll("[data-signal]")).flatMap((path) =>
    // Inspect pointer-triggered Web Animations independently of the finite CSS intro.
    path.getAnimations().filter((animation) => !(animation instanceof CSSAnimation)).map((animation) => animation.playState),
  ));
}

function haloOpacities(network: Locator) {
  return network.locator("[data-halo]").evaluateAll((halos) => halos.map((halo) => Number(getComputedStyle(halo).opacity)));
}

const centralNeuron = { id: 1, x: 790, y: 320 };
const leftNeuron = { id: 6, x: 140, y: 135 };

async function expectBackgroundSpansHero(network: Locator) {
  const coverage = await network.evaluate((element) => {
    const section = element.closest("section");
    if (!section) throw new Error("The neural background must belong to the hero section");
    const hero = section.getBoundingClientRect();
    const background = element.getBoundingClientRect();
    return { width: background.width, leftGap: Math.abs(background.left - hero.left), rightGap: Math.abs(background.right - hero.right) };
  });
  expect(coverage.width).toBeGreaterThan(0);
  expect(coverage.leftGap).toBeLessThanOrEqual(1);
  expect(coverage.rightGap).toBeLessThanOrEqual(1);
}

async function moveNearNeuron(page: Page, network: Locator, neuron = centralNeuron) {
  const point = await network.locator("svg").evaluate((svg, position) => {
    const matrix = (svg as SVGSVGElement).getScreenCTM();
    if (!matrix) throw new Error("The neural SVG must have a screen transform");
    const screen = new DOMPoint(position.x, position.y).matrixTransform(matrix);
    return { x: screen.x + 20, y: screen.y };
  }, neuron);
  await page.mouse.move(point.x, point.y);
}

async function expectStaticNetwork(page: Page, network: Locator) {
  await expect(network).toHaveAttribute("data-interactive", "false");
  await expect(network.locator("[data-neuron]")).toHaveCount(9);
  await expect(network.locator("[data-connection]")).toHaveCount(23);
  await expect(network.locator("[data-signal]")).toHaveCount(23);
  await expectBackgroundSpansHero(network);
  const baseline = await geometry(network);
  await moveNearNeuron(page, network);
  // Let any pointer handler and scheduled animation frame run before checking immobility.
  await network.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(network).toHaveAttribute("data-interactive", "false");
  expect(await geometry(network)).toEqual(baseline);
  expect(await network.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect.poll(() => haloOpacities(network).then((values) => values.length > 0 && values.every((opacity) => opacity === 0))).toBe(true);
}

async function expectPointerResponse(page: Page, network: Locator, neuron = centralNeuron) {
  const baseline = await geometry(network);
  await moveNearNeuron(page, network, neuron);
  await expect.poll(() => signalStates(network).then((states) => {
    const running = states.filter((state) => state === "running").length;
    return running > 0 && running < 23;
  }), {
    intervals: [16, 32, 50],
  }).toBe(true);
  await expect.poll(() => network.locator(`[data-neuron="${neuron.id}"]`).getAttribute("transform")).not.toBe(baseline.neurons[neuron.id]);
  await expect.poll(() => geometry(network).then((value) => value.connections)).not.toEqual(baseline.connections);
  await expect.poll(() => haloOpacities(network).then((values) => values.some((opacity) => opacity > 0))).toBe(true);
  return baseline;
}

test("welcome hero fits mobile, presents a concise board, and keeps its background static", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to GT-LMSA+", exact: true })).toBeVisible();
  await expect(page.getByTestId("medical-hero").getByRole("img", { name: "Latino Medical Student Association PLUS logo" })).toBeVisible();
  await expect(page.getByRole("button", { name: /(?:pause|play).*motion|hero animation/i })).toHaveCount(0);
  const network = page.getByTestId("neural-network");
  await expect(network).toHaveAttribute("aria-hidden", "true");
  await expectStaticNetwork(page, network);
  const board = page.locator("#executive-board .board-person");
  await expect(board).toHaveCount(8);
  for (const card of await board.all()) {
    await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(card.locator("p")).toHaveCount(1);
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("neural background honors reduced motion without hiding chapter identity", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to GT-LMSA+", exact: true })).toBeVisible();
  await expect(page.getByTestId("medical-hero").getByRole("img")).toBeVisible();
  const network = page.getByTestId("neural-network");
  await expectStaticNetwork(page, network);
  await expect(network.locator("svg")).toBeVisible();
  await expect(page.getByRole("button", { name: /(?:pause|play).*motion|hero animation/i })).toHaveCount(0);
});

test("desktop neural background responds to nearby pointers, resets on leave, and permits joining", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const network = page.getByTestId("neural-network");
  await expect(network).toHaveAttribute("data-interactive", "true");
  await expect(network).toHaveAttribute("aria-hidden", "true");
  await expect(network).toHaveCSS("pointer-events", "none");
  await expect(network.locator("[data-neuron]")).toHaveCount(9);
  await expect(network.locator("[data-connection]")).toHaveCount(23);
  await expect(network.locator("[data-signal]")).toHaveCount(23);
  await expectBackgroundSpansHero(network);
  await expect.poll(() => network.evaluate((element) => element.getAnimations({ subtree: true }).every((animation) => {
    const timing = animation.effect?.getComputedTiming();
    return timing && Number(timing.endTime) <= 4500 && timing.iterations === 1;
  }))).toBe(true);
  await expect.poll(() => network.evaluate((element) => element.getAnimations({ subtree: true }).every((animation) => animation.playState === "finished")), { timeout: 7000 }).toBe(true);

  for (const neuron of [centralNeuron, leftNeuron]) {
    const baseline = await expectPointerResponse(page, network, neuron);
    // The header is outside the hero section, so this must clear its pointer response.
    await page.mouse.move(8, 8);
    await expect.poll(() => geometry(network)).toEqual(baseline);
    await expect.poll(() => haloOpacities(network).then((values) => values.every((opacity) => opacity === 0))).toBe(true);
    await expect.poll(() => signalStates(network)).toEqual([]);
  }

  const hero = page.getByRole("region", { name: "Welcome to GT-LMSA+", exact: true });
  await hero.getByRole("link", { name: "Join LMSA+", exact: true }).click();
  await expect(page).toHaveURL(/\/join(?:\?|$)/);
});

test("enabling reduced motion during pointer interaction restores the static network", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const network = page.getByTestId("neural-network");
  await expect(network).toHaveAttribute("data-interactive", "true");
  const baseline = await expectPointerResponse(page, network);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(network).toHaveAttribute("data-interactive", "false");
  await expect.poll(() => geometry(network)).toEqual(baseline);
  await expect.poll(() => signalStates(network)).toEqual([]);
  await expectStaticNetwork(page, network);
});

test.describe("desktop-sized touch devices", () => {
  test.use({ hasTouch: true, viewport: { width: 1440, height: 1000 } });

  test("keep the network static even with no reduced-motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expectStaticNetwork(page, page.getByTestId("neural-network"));
  });
});
