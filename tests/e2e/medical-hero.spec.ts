import { expect, test } from "@playwright/test";

test("medical hero fits mobile and its motion can be paused with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const hero = page.getByTestId("medical-hero");
  await expect(hero.getByRole("img", { name: "Latino Medical Student Association PLUS logo" })).toBeVisible();
  const pause = hero.getByRole("button", { name: "Pause hero animation" });
  await expect(pause).toBeEnabled();
  await pause.focus();
  await page.keyboard.press("Space");
  const play = hero.getByRole("button", { name: "Play hero animation" });
  await expect(play).toBeFocused();
  await expect(hero.locator(".medical-hero__pulse")).toHaveCSS("animation-play-state", "paused");
  await play.press("Enter");
  await expect(pause).toBeVisible();
  await expect(hero.locator(".medical-hero__pulse")).toHaveCSS("animation-play-state", "running");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("medical hero honors reduced motion without hiding the chapter identity", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.getByTestId("medical-hero");
  await expect(hero.getByRole("img", { name: "Latino Medical Student Association PLUS logo" })).toBeVisible();
  await expect(hero.locator(".medical-hero__pulse")).toHaveCSS("animation-name", "none");
  await expect(hero.getByRole("button", { name: /hero animation/ })).toHaveCount(0);
  await expect.poll(() => hero.locator("svg").evaluateAll((nodes) => nodes.every((node) => node.getAttribute("aria-hidden") === "true"))).toBe(true);
});
