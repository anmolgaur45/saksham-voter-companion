import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Intercept any browser-visible backend calls so tests run without a live backend
  await page.route("**/api/chat", (route) =>
    route.fulfill({ json: { response: "ok", agent: "knowledge", citations: [], grounded: false } })
  );
  await page.route("**/api/tts", (route) =>
    route.fulfill({ json: { audio: "", format: "mp3" } })
  );
  await page.route("**/api/booth**", (route) =>
    route.fulfill({ json: { name: "Test", state: "Delhi", center: { lat: 28.6, lng: 77.2 }, booths: [] } })
  );
  await page.route("**/api/constituency/**", (route) =>
    route.fulfill({ json: { constituency: "New Delhi", elections: [] } })
  );
  await page.route("**/api/timeline**", (route) =>
    route.fulfill({ json: [] })
  );
  await page.route("**/api/translate**", (route) =>
    route.fulfill({ json: { translated: [] } })
  );
});

test("dashboard: onboarding completes and State B renders", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Get started" }).click();

  // Step 1 — name
  await page.getByPlaceholder("Your first name").fill("Arjun");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2 — first-time voter
  await page.getByRole("button", { name: "No" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 3 — constituency (Continue is always enabled)
  await page.getByPlaceholder("e.g. Mumbai North").fill("New Delhi");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4 — language (English is default)
  await page.getByRole("button", { name: "Done" }).click();

  // State B: welcome strip should be visible
  await expect(page.getByText("Welcome back, Arjun")).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText("New Delhi").first()).toBeVisible();
});

test("practice simulator: completes all 6 steps", async ({ page }) => {
  await page.goto("/practice");

  // Steps 1–4: instruction cards
  await page.getByRole("button", { name: "Enter Polling Station" }).click();
  await page.getByRole("button", { name: "Proceed to Ink Marking" }).click();
  await page.getByRole("button", { name: "Walk to Voting Compartment" }).click();
  await page.getByRole("button", { name: "Face the EVM" }).click();

  // Step 5: EVM — vote for a candidate, then confirm
  await page.getByRole("button", { name: "Vote for Arjun Kumar" }).click();
  await page.getByRole("button", { name: "Exit Booth" }).click();

  // Step 6: SuccessCard
  await expect(page.getByText("Vote Counted!")).toBeVisible({ timeout: 5_000 });
});

test("quiz: all 15 questions answered and score displayed", async ({ page }) => {
  await page.goto("/quiz");

  for (let i = 0; i < 15; i++) {
    // Click the first option button inside the options container
    await page.locator("div.flex.flex-col.gap-2\\.5 button").first().click();
    await page.getByRole("button", { name: "Check answer" }).click();
    if (i < 14) {
      await page.getByRole("button", { name: "Next question" }).click();
    } else {
      await page.getByRole("button", { name: "See results" }).click();
    }
  }

  await expect(page.getByText("Quiz complete")).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText("%")).toBeVisible();
});

test("language toggle: switching to Hindi sets html lang attribute", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Hindi" }).click();

  const lang = await page.evaluate(() => document.documentElement.lang);
  expect(lang).toBe("hi");
});
