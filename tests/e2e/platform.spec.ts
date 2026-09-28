import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { Pool } from "pg";

const appOrigin = "http://127.0.0.1:3100";
const fixtureOrigin = "http://127.0.0.1:3111";
const testDatabaseUrl = process.env.TEST_DATABASE_URL!;
let createdEventId: string | undefined;

function atlantaDateTimeInput(instant: Date): string {
  const values = new Map<string, string>(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(instant).map(({ type, value }) => [type, value] as const),
  );
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}T${values.get("hour")}:${values.get("minute")}`;
}

test.afterEach(async () => {
  if (!createdEventId) return;
  const pool = new Pool({ connectionString: testDatabaseUrl, max: 1 });
  try {
    await pool.query("DELETE FROM events WHERE id = $1", [createdEventId]);
  } finally {
    createdEventId = undefined;
    await pool.end();
  }
});

test("resource search and category filters work on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/resources");

  await page.getByRole("searchbox", { name: "Search the directory" }).fill("MCAT");
  await expect(page.locator(".resource-entry")).toHaveCount(2);

  await page.getByRole("button", { name: "Medical school", exact: true }).click();
  await expect(page.locator(".resource-entry")).toHaveCount(1);
  await expect(page.getByText(/1 resource in Medical school matching/i)).toBeVisible();
  await expect.poll(() => page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test("synthetic member and officer can complete the reviewed chapter journey", async ({ page }) => {
  const runId = randomUUID().slice(0, 8);
  const memberName = `Playwright Member ${runId}`;
  const eventTitle = `Synthetic browser event ${runId}`;

  await page.goto(`${fixtureOrigin}/member`);
  await expect(page.getByRole("heading", { name: "Create your profile" })).toBeVisible();
  await page.getByLabel("Name", { exact: true }).fill(memberName);
  await page.getByRole("button", { name: "Create member profile" }).click();
  await expect(page.getByRole("heading", { name: `Welcome, ${memberName}` })).toBeVisible();
  await expect(page.getByText("pending", { exact: true })).toBeVisible();

  const officerApiStatus = await page.evaluate(async () =>
    (await fetch("/api/platform/officer/analytics")).status,
  );
  expect(officerApiStatus).toBe(403);
  await page.goto("/officer");
  await expect(page.getByRole("status").filter({
    hasText: "This signed-in account does not have officer dashboard access.",
  })).toBeVisible();

  await page.goto(`${fixtureOrigin}/officer`);
  await expect(page.getByRole("heading", { name: "Officer workspace" })).toBeVisible();
  const officerViews = page.getByRole("navigation", { name: "Officer dashboard views" });
  await officerViews.getByRole("button", { name: "Members" }).click();
  const pendingMember = page.locator("article").filter({ hasText: memberName });
  await expect(pendingMember).toBeVisible();
  await pendingMember.getByRole("button", { name: "Approve membership" }).click();
  await expect(page.getByRole("status").filter({
    hasText: `${memberName} membership is now active.`,
  })).toBeVisible();

  await officerViews.getByRole("button", { name: "Events" }).click();
  await page.getByRole("button", { name: "Create event", exact: true }).first().click();
  const start = new Date(Date.now() + 45 * 60_000);
  const end = new Date(start.getTime() + 2 * 60 * 60_000);
  await page.getByLabel("Event title").fill(eventTitle);
  await page.getByLabel("Category").fill("Browser test");
  await page.getByLabel("Description").fill("Synthetic Playwright event; test data only.");
  await page.getByLabel("Location").fill("Local test fixture");
  await page.getByLabel("Timing label").fill("Synthetic browser journey");
  await page.getByLabel("Starts at").fill(atlantaDateTimeInput(start));
  await page.getByLabel("Ends at").fill(atlantaDateTimeInput(end));
  await page.getByLabel("Publication status").selectOption("published");
  await page.getByLabel("Registration status").selectOption("open");

  const eventCreated = page.waitForResponse((response) =>
    new URL(response.url()).pathname === "/api/platform/officer/events" &&
    response.request().method() === "POST",
  );
  const eventForm = page.locator("form").filter({ has: page.getByLabel("Event title") });
  await eventForm.getByRole("button", { name: "Create event", exact: true }).click();
  const createResponse = await eventCreated;
  expect(createResponse.status()).toBe(201);
  const createPayload = await createResponse.json() as { data?: { id?: string } };
  const eventId = createPayload.data?.id;
  expect(eventId).toMatch(/^[0-9a-f-]{36}$/i);
  if (!eventId) throw new Error("Event creation response did not include its ID.");
  createdEventId = eventId;
  await expect(page.getByRole("status").filter({ hasText: "Event was created." })).toBeVisible();

  await page.goto(`${fixtureOrigin}/member`);
  await expect(page.getByRole("heading", { name: `Welcome, ${memberName}` })).toBeVisible();
  const upcomingPanel = page.locator("section.card").filter({
    has: page.getByRole("heading", { name: "Upcoming events" }),
  });
  const eventCard = upcomingPanel.locator("article").filter({ hasText: eventTitle });
  await expect(eventCard).toBeVisible();
  await eventCard.getByRole("button", { name: "RSVP", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "You’re registered for this event." })).toBeVisible();
  await eventCard.getByRole("button", { name: "Cancel RSVP" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your RSVP was cancelled." })).toBeVisible();
  await eventCard.getByRole("button", { name: "RSVP", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "You’re registered for this event." })).toBeVisible();

  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: appOrigin });
  await page.getByRole("button", { name: "Get ticket code" }).click();
  const ticketField = page.getByRole("textbox", { name: "Opaque ticket code" });
  await expect(ticketField).toHaveValue(/^[A-Za-z0-9_-]{43}$/);
  const ticketCode = await ticketField.inputValue();
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(ticketCode);

  await page.goto(`${fixtureOrigin}/officer`);
  await expect(page.getByRole("heading", { name: "Officer workspace" })).toBeVisible();
  await page.getByRole("navigation", { name: "Officer dashboard views" })
    .getByRole("button", { name: "Attendance" }).click();
  const eventSelect = page.getByLabel("Event", { exact: true });
  await expect(eventSelect).toBeVisible();
  await eventSelect.selectOption({ label: eventTitle });

  const registrationRow = page.getByRole("row").filter({ hasText: memberName });
  await expect(registrationRow).toBeVisible();
  const registrationId = (await registrationRow.locator("td").nth(0).innerText()).trim();
  expect(registrationId).toMatch(/^[0-9a-f-]{36}$/i);

  await page.getByRole("radio", { name: "Pasted ticket code" }).check();
  await page.getByLabel("Attendee ticket code").fill(ticketCode);
  const confirmation = page.getByRole("checkbox", {
    name: "I confirm that the attendee presented this registration ID or ticket code for the selected event.",
  });
  await confirmation.check();
  await page.getByRole("button", { name: "Confirm check-in" }).click();
  await expect(page.getByRole("status").filter({ hasText: `Check-in confirmed for ${memberName}` })).toBeVisible();
  const checkedInAt = registrationRow.locator("td").nth(3);
  await expect(checkedInAt).not.toHaveText("Not checked in");
  const firstRecordedTime = (await checkedInAt.innerText()).trim();

  await page.getByRole("radio", { name: "Registration ID" }).check();
  await page.getByRole("textbox", { name: "Registration ID" }).fill(registrationId);
  await confirmation.check();
  await page.getByRole("button", { name: "Confirm check-in" }).click();
  await expect(page.getByRole("status").filter({ hasText: `Check-in confirmed for ${memberName}` })).toBeVisible();
  await expect(checkedInAt).toHaveText(firstRecordedTime);
});

test("officers preserve stale event edits, explicitly reload, and filter activity metadata", async ({ page }) => {
  const runId = randomUUID().slice(0, 8);
  const eventTitle = `Synthetic undated draft ${runId}`;
  let staleTab: typeof page | undefined;

  try {
    await page.goto(`${fixtureOrigin}/officer`);
    await expect(page.getByRole("heading", { name: "Officer workspace" })).toBeVisible();
    const officerViews = page.getByRole("navigation", { name: "Officer dashboard views" });
    await officerViews.getByRole("button", { name: "Events" }).click();
    await page.getByRole("button", { name: "Create event", exact: true }).first().click();

    const eventForm = page.locator("form").filter({ has: page.getByLabel("Event title") });
    await page.getByLabel("Event title").fill(eventTitle);
    await page.getByLabel("Category").fill("Playwright test");
    await page.getByLabel("Description").fill("Synthetic undated draft for the stale-edit browser test.");
    await page.getByLabel("Location").fill("Initial location");
    await page.getByLabel("Starts at").fill("");
    await page.getByLabel("Ends at").fill("");
    await page.getByLabel("Publication status").selectOption("draft");
    await page.getByLabel("Registration status").selectOption("closed");

    const eventCreated = page.waitForResponse((response) =>
      new URL(response.url()).pathname === "/api/platform/officer/events" &&
      response.request().method() === "POST",
    );
    await eventForm.getByRole("button", { name: "Create event", exact: true }).click();
    const createResponse = await eventCreated;
    expect(createResponse.status()).toBe(201);
    const createPayload = await createResponse.json() as {
      data?: { id?: string; startsAt?: string | null; endsAt?: string | null; publicationStatus?: string; registrationStatus?: string; version?: number };
    };
    const eventId = createPayload.data?.id;
    if (eventId) createdEventId = eventId;
    expect(eventId).toMatch(/^[0-9a-f-]{36}$/i);
    if (!eventId) throw new Error("Event creation response did not include its ID.");
    expect(createPayload.data).toMatchObject({
      startsAt: null,
      endsAt: null,
      publicationStatus: "draft",
      registrationStatus: "closed",
      version: 1,
    });
    await expect(page.getByRole("status").filter({ hasText: "Event was created." })).toBeVisible();

    staleTab = await page.context().newPage();
    await staleTab.goto(`${fixtureOrigin}/officer`);
    await expect(staleTab.getByRole("heading", { name: "Officer workspace" })).toBeVisible();
    const staleViews = staleTab.getByRole("navigation", { name: "Officer dashboard views" });
    await staleViews.getByRole("button", { name: "Events" }).click();
    const staleEventCard = staleTab.locator("article").filter({ hasText: eventTitle });
    await expect(staleEventCard).toBeVisible();
    await staleEventCard.getByRole("button", { name: "Edit", exact: true }).click();
    const staleForm = staleTab.locator("form").filter({ has: staleTab.getByLabel("Event title") });
    await staleTab.getByLabel("Location").fill("Unsaved location");

    const writerEventCard = page.locator("article").filter({ hasText: eventTitle });
    await expect(writerEventCard).toBeVisible();
    await writerEventCard.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByLabel("Location").fill("Saved location");
    const savedResponsePromise = page.waitForResponse((response) =>
      new URL(response.url()).pathname === `/api/platform/officer/events/${eventId}` &&
      response.request().method() === "PATCH",
    );
    await eventForm.getByRole("button", { name: "Save event changes" }).click();
    const savedResponse = await savedResponsePromise;
    expect(savedResponse.status()).toBe(200);
    expect(savedResponse.request().postDataJSON()).toMatchObject({ expectedVersion: 1, location: "Saved location" });
    const savedPayload = await savedResponse.json() as { data?: { location?: string; version?: number } };
    expect(savedPayload.data).toMatchObject({ location: "Saved location", version: 2 });
    await expect(page.getByRole("status").filter({ hasText: "Event changes were saved." })).toBeVisible();

    const staleResponsePromise = staleTab.waitForResponse((response) =>
      new URL(response.url()).pathname === `/api/platform/officer/events/${eventId}` &&
      response.request().method() === "PATCH",
    );
    await staleForm.getByRole("button", { name: "Save event changes" }).click();
    const staleResponse = await staleResponsePromise;
    expect(staleResponse.status()).toBe(409);
    const stalePayload = await staleResponse.json() as { error?: { code?: string } };
    expect(stalePayload.error?.code).toBe("STALE_EVENT");
    await expect(staleTab.getByRole("alert")).toContainText("Your unsaved changes are still here");
    await expect(staleTab.getByLabel("Location")).toHaveValue("Unsaved location");

    const reloadResponsePromise = staleTab.waitForResponse((response) =>
      new URL(response.url()).pathname === `/api/platform/officer/events/${eventId}` &&
      response.request().method() === "GET",
    );
    await staleTab.getByRole("button", {
      name: "Reload latest event (discard unsaved changes)",
      exact: true,
    }).click();
    const reloadResponse = await reloadResponsePromise;
    expect(reloadResponse.status()).toBe(200);
    const reloadPayload = await reloadResponse.json() as { data?: { location?: string; version?: number } };
    expect(reloadPayload.data).toMatchObject({ location: "Saved location", version: 2 });
    await expect(staleTab.getByLabel("Location")).toHaveValue("Saved location");
    await expect(staleTab.getByRole("status").filter({
      hasText: "Loaded the latest event. Your unsaved changes were discarded.",
    })).toBeVisible();

    await staleViews.getByRole("button", { name: "Activity" }).click();
    const actionFilter = staleTab.locator("#officer-audit-action");
    await expect(actionFilter).toBeEnabled();
    const filteredAuditPromise = staleTab.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === "/api/platform/officer/audit" &&
        url.searchParams.get("action") === "event.updated";
    });
    await actionFilter.selectOption("event.updated");
    const filteredAuditResponse = await filteredAuditPromise;
    expect(filteredAuditResponse.status()).toBe(200);
    const auditPayload = await filteredAuditResponse.json() as {
      data?: { items?: { action?: string; targetId?: string }[] };
    };
    expect(auditPayload.data?.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: "event.updated", targetId: eventId }),
    ]));

    const auditEntry = staleTab.locator("article").filter({ hasText: eventId });
    await expect(auditEntry).toHaveCount(1);
    await expect(auditEntry.getByRole("heading", { name: "Event updated" })).toBeVisible();
    await auditEntry.getByRole("button", { name: "View change details" }).click();
    for (const detail of [
      "Previous publication status",
      "Publication status",
      "Previous registration status",
      "Registration status",
      "Previous version",
      "Version",
    ]) {
      await expect(auditEntry.getByText(detail, { exact: true })).toBeVisible();
    }
    await expect(auditEntry).not.toContainText("Saved location");
  } finally {
    await staleTab?.close();
  }
});
