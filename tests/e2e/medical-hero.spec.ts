import { expect, test } from "@playwright/test";

test("welcome hero fits mobile, presents a concise board, and finishes its decorative motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to GT-LMSA+", exact: true })).toBeVisible();
  await expect(page.getByTestId("medical-hero").getByRole("img", { name: "Latino Medical Student Association PLUS logo" })).toBeVisible();
  await expect(page.getByRole("button", { name: /(?:pause|play).*motion|hero animation/i })).toHaveCount(0);
  const network = page.getByTestId("neural-network");
  await expect(network).toHaveAttribute("aria-hidden", "true");
  await expect.poll(() => network.evaluate((element) => element.getAnimations({ subtree: true }).every((animation) => {
    const timing = animation.effect?.getComputedTiming();
    return timing && Number(timing.endTime) <= 4500 && timing.iterations === 1;
  }))).toBe(true);
  await expect.poll(() => network.evaluate((element) => element.getAnimations({ subtree: true }).every((animation) => animation.playState === "finished")), { timeout: 7000 }).toBe(true);
  const board = page.locator("#executive-board .board-person");
  await expect(board).toHaveCount(8);
  for (const card of await board.all()) {
    await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(card.locator("p")).toHaveCount(1);
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("neural background honors reduced motion without hiding chapter identity", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to GT-LMSA+", exact: true })).toBeVisible();
  await expect(page.getByTestId("medical-hero").getByRole("img")).toBeVisible();
  const network = page.getByTestId("neural-network");
  await expect.poll(() => network.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(network.locator("svg")).toBeVisible();
  await expect(page.getByRole("button", { name: /(?:pause|play).*motion|hero animation/i })).toHaveCount(0);
});
