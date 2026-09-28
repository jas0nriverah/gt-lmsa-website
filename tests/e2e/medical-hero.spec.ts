import { expect, test, type Locator } from "@playwright/test";

async function expectBackgroundSpansHero(background: Locator) {
  const coverage = await background.evaluate((element) => {
    const section = element.closest("section");
    if (!section) throw new Error("The biomedical background must belong to the hero section");
    const canvas = element.querySelector("canvas");
    if (!canvas) throw new Error("The biomedical background must contain its full-hero canvas");
    const hero = section.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    const canvasBounds = canvas.getBoundingClientRect();
    return {
      width: bounds.width,
      height: bounds.height,
      leftGap: Math.abs(bounds.left - hero.left),
      rightGap: Math.abs(bounds.right - hero.right),
      topGap: Math.abs(bounds.top - hero.top),
      bottomGap: Math.abs(bounds.bottom - hero.bottom),
      canvasLeftGap: Math.abs(canvasBounds.left - hero.left),
      canvasRightGap: Math.abs(canvasBounds.right - hero.right),
      canvasTopGap: Math.abs(canvasBounds.top - hero.top),
      canvasBottomGap: Math.abs(canvasBounds.bottom - hero.bottom),
    };
  });
  expect(coverage.width).toBeGreaterThan(0);
  expect(coverage.height).toBeGreaterThan(0);
  expect(coverage.leftGap).toBeLessThanOrEqual(1);
  expect(coverage.rightGap).toBeLessThanOrEqual(1);
  expect(coverage.topGap).toBeLessThanOrEqual(1);
  expect(coverage.bottomGap).toBeLessThanOrEqual(1);
  expect(coverage.canvasLeftGap).toBeLessThanOrEqual(1);
  expect(coverage.canvasRightGap).toBeLessThanOrEqual(1);
  expect(coverage.canvasTopGap).toBeLessThanOrEqual(1);
  expect(coverage.canvasBottomGap).toBeLessThanOrEqual(1);
}

async function canvasFrame(background: Locator) {
  return background.locator("canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
}

async function cropInk(background: Locator, crop: "left" | "right") {
  return background.locator("canvas").evaluate((canvas, cropSide) => {
    const source = canvas as HTMLCanvasElement;
    const context = source.getContext("2d");
    if (!context) throw new Error("Canvas 2D context is unavailable");
    const width = source.width;
    const height = source.height;
    const x = cropSide === "left" ? 0 : cropSide === "right" ? Math.floor(width * 0.62) : 0;
    const cropWidth = cropSide === "left" ? Math.floor(width * 0.38) : cropSide === "right" ? width - x : width;
    const pixels = context.getImageData(x, 0, cropWidth, height).data;
    let ink = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      // Transparent black contributes no visible ink against the white hero.
      ink += ((255 - pixels[index]) + (255 - pixels[index + 1]) + (255 - pixels[index + 2])) * pixels[index + 3] / 255;
    }
    return ink;
  }, crop);
}

async function expectCoords(background: Locator, x: number, y: number) {
  await expect(background).toHaveAttribute("data-lens-x", x.toFixed(3));
  await expect(background).toHaveAttribute("data-lens-y", y.toFixed(3));
}

async function heroPoint(background: Locator, x: number, y: number) {
  return background.evaluate((element, point) => {
    const bounds = element.getBoundingClientRect();
    return { x: bounds.left + point.x, y: bounds.top + point.y };
  }, { x, y });
}

async function expectStaticCanvas(background: Locator) {
  await expect(background).toHaveAttribute("data-interactive", "false");
  await expect(background).toHaveAttribute("data-state", "static");
  const count = Number(await background.getAttribute("data-cell-count"));
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(20);
  await expect.poll(() => background.getAttribute("data-reveal").then(Number)).toBe(0);
  await expect.poll(() => background.getAttribute("data-displacement").then(Number)).toBe(0);
  await expect.poll(() => background.getAttribute("data-pulses").then(Number)).toBe(0);
  await expect(background.locator("canvas")).toHaveCount(1);
  await expectBackgroundSpansHero(background);
  const baseline = await canvasFrame(background);
  await background.page().mouse.move(60, 140);
  await background.page().waitForTimeout(200);
  expect(await canvasFrame(background)).toBe(baseline);
}

async function expectCanvasIdle(background: Locator) {
  await expect(background).toHaveAttribute("data-state", "idle", { timeout: 5500 });
  await expect.poll(() => background.getAttribute("data-reveal").then(Number)).toBe(0);
  await expect.poll(() => background.getAttribute("data-displacement").then(Number), { intervals: [16, 32, 50], timeout: 5500 }).toBe(0);
}

test("welcome hero fits mobile, presents a concise board, and keeps its canvas static", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to GT-LMSA+", exact: true })).toBeVisible();
  await expect(page.getByTestId("medical-hero").getByRole("img", { name: "Latino Medical Student Association PLUS logo" })).toBeVisible();
  await expect(page.getByRole("button", { name: /(?:pause|play).*motion|hero animation/i })).toHaveCount(0);

  const background = page.getByTestId("biomedical-background");
  await expect(background).toHaveAttribute("aria-hidden", "true");
  await expect(background).toHaveCSS("pointer-events", "none");
  await expectStaticCanvas(background);

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
  const background = page.getByTestId("biomedical-background");
  await expect(background).toHaveAttribute("aria-hidden", "true");
  await expectStaticCanvas(background);
  await expect(page.getByRole("button", { name: /(?:pause|play).*motion|hero animation/i })).toHaveCount(0);
});

test("desktop lens reveals and magnifies tissue beneath the pointer, then settles", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const background = page.getByTestId("biomedical-background");
  await expect(background).toHaveAttribute("data-interactive", "true");
  await expect(background).toHaveAttribute("data-state", "idle");
  await expect(background).toHaveAttribute("aria-hidden", "true");
  await expect(background.locator("canvas")).toHaveCount(1);
  await expectBackgroundSpansHero(background);
  await expectCanvasIdle(background);
  expect(Number(await background.getAttribute("data-cell-count"))).toBeGreaterThanOrEqual(20);

  const idleFrame = await canvasFrame(background);
  await page.waitForTimeout(180);
  expect(await canvasFrame(background)).toBe(idleFrame);
  await testInfo.attach("biomedical-background-idle.png", {
    body: await background.screenshot({ path: testInfo.outputPath("biomedical-idle.png") }),
    contentType: "image/png",
  });

  const bounds = await background.boundingBox();
  if (!bounds) throw new Error("Missing hero bounds");
  const first = { x: 70, y: 90 };
  const firstPoint = await heroPoint(background, first.x, first.y);
  const leftBefore = await cropInk(background, "left");
  await page.mouse.move(firstPoint.x, firstPoint.y);
  await expectCoords(background, first.x, first.y);
  await expect.poll(() => background.getAttribute("data-reveal").then(Number), { intervals: [16, 32, 50], timeout: 1500 }).toBeGreaterThan(0.3);
  await expect.poll(() => background.getAttribute("data-state")).toMatch(/^(active|settling)$/);
  await expect.poll(() => background.getAttribute("data-displacement").then(Number), { intervals: [16, 32, 50] }).toBeGreaterThan(0);
  expect(Number(await background.getAttribute("data-pulses"))).toBeGreaterThanOrEqual(0);
  await expect.poll(() => canvasFrame(background), { intervals: [16, 32, 50] }).not.toBe(idleFrame);
  await expect.poll(() => cropInk(background, "left"), { intervals: [16, 32, 50] }).toBeGreaterThan(leftBefore);

  await page.waitForTimeout(300);
  await testInfo.attach("biomedical-background-active.png", {
    body: await background.screenshot({ path: testInfo.outputPath("biomedical-active.png") }),
    contentType: "image/png",
  });

  const right = { x: bounds.width - 100, y: 150 };
  const rightPoint = await heroPoint(background, right.x, right.y);
  const rightBefore = await cropInk(background, "right");
  const leftAtFirst = await cropInk(background, "left");
  await page.mouse.move(rightPoint.x, rightPoint.y);
  await expectCoords(background, right.x, right.y);
  await expect.poll(() => cropInk(background, "right"), { intervals: [16, 32, 50] }).toBeGreaterThan(rightBefore);
  await expect.poll(() => cropInk(background, "left"), { intervals: [16, 32, 50] }).toBeLessThan(leftAtFirst);
  await background.screenshot({ path: testInfo.outputPath("biomedical-right.png") });

  await expectCanvasIdle(background);
  const settledFrame = await canvasFrame(background);
  expect(settledFrame).toBe(idleFrame);
  await page.waitForTimeout(180);
  expect(await canvasFrame(background)).toBe(settledFrame);

  const center = { x: bounds.width * 0.45, y: bounds.height * 0.5 };
  const centerPoint = await heroPoint(background, center.x, center.y);
  await page.mouse.move(centerPoint.x, centerPoint.y);
  await expectCoords(background, center.x, center.y);
  await expect.poll(() => canvasFrame(background), { intervals: [16, 32, 50] }).not.toBe(idleFrame);
  await expectCanvasIdle(background);

  const leavePoint = await heroPoint(background, first.x, first.y);
  await page.mouse.move(leavePoint.x, leavePoint.y);
  await expect.poll(() => background.getAttribute("data-displacement").then(Number), { intervals: [16, 32, 50] }).toBeGreaterThan(0);
  await page.mouse.move(bounds.x + bounds.width + 40, bounds.y + bounds.height + 40);
  const displacementAfterLeave = Number(await background.getAttribute("data-displacement"));
  expect(displacementAfterLeave).toBeGreaterThan(0);
  await expectCanvasIdle(background);
  expect(await canvasFrame(background)).toBe(idleFrame);

  const hero = page.getByRole("region", { name: "Welcome to GT-LMSA+", exact: true });
  await hero.getByRole("link", { name: "Join LMSA+", exact: true }).click();
  await expect(page).toHaveURL(/\/join(?:\?|$)/);
});

test("enabling reduced motion during an active lens clears all motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const background = page.getByTestId("biomedical-background");
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(background).toHaveAttribute("data-interactive", "true");
    const point = await heroPoint(background, 70 + attempt, 90);
    await page.mouse.move(point.x, point.y);
    await expect.poll(() => background.getAttribute("data-reveal").then(Number), { intervals: [16, 32, 50] }).toBeGreaterThan(0.3);
    await expect.poll(() => background.getAttribute("data-displacement").then(Number), { intervals: [16, 32, 50] }).toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectStaticCanvas(background);
  }
  // Also honor preference changes when there is no animation frame running.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expectCanvasIdle(background);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectStaticCanvas(background);
});

test.describe("desktop-sized touch devices", () => {
  test.use({ hasTouch: true, viewport: { width: 1440, height: 1000 } });

  test("keep the canvas static even with no reduced-motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expectStaticCanvas(page.getByTestId("biomedical-background"));
  });
});
