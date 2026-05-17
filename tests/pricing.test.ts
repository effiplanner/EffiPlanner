import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/pricing";

describe("formatMoney", () => {
  it("formats RON as lei", () => {
    expect(formatMoney({ cents: 1234, currency: "RON" })).toBe("12.34 lei");
  });
});
