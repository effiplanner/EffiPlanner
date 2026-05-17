import { test, expect } from "@playwright/test";

test("landing loads", async ({ page }) => {
  await page.goto("/ro");
  await expect(page.getByText("Mai puțin gândit. Mai bine mâncat.")).toBeVisible();
});
