import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { effectivePlan, formatEuro, formatRows, PLANS } from "../plans";

describe("effectivePlan", () => {
  it("keeps paid plans only while the subscription is in good standing", () => {
    expect(effectivePlan("pro", "active")).toBe("pro");
    expect(effectivePlan("team", "trialing")).toBe("team");
    expect(effectivePlan("pro", "past_due")).toBe("pro");
    expect(effectivePlan("pro", "canceled")).toBe("free");
    expect(effectivePlan("pro", "incomplete")).toBe("free");
    expect(effectivePlan("pro", null)).toBe("free");
    expect(effectivePlan(undefined, undefined)).toBe("free");
  });
});

describe("plan figures in copy", () => {
  it("formats prices and row counts the way the site shows them", () => {
    expect(formatEuro(1200)).toBe("€12");
    expect(formatEuro(825)).toBe("€8.25");
    expect(formatEuro(850)).toBe("€8.50");
    expect(formatRows(500_000)).toBe("500,000");
  });

  // Limits and prices are set once in PLANS; copy that types them out goes stale when they change
  it("aren't written out by hand anywhere in src", () => {
    const figures = new Set<string>();
    for (const plan of Object.values(PLANS)) {
      figures.add(formatRows(plan.limits.maxRows));
      for (const cents of [plan.priceMonthly, plan.priceYearly]) if (cents) figures.add(formatEuro(cents));
    }
    const root = join(__dirname, "../..");
    const files = (readdirSync(root, { recursive: true }) as string[]).filter(
      (f) => /\.tsx?$/.test(f) && !f.includes("__tests__") && !f.endsWith(join("config", "plans.ts"))
    );
    for (const file of files) {
      const source = readFileSync(join(root, file), "utf8");
      for (const figure of figures) {
        // Digits, separators or a decimal point on either side mean a different number, e.g. €12.480,75 in a sample
        const escaped = figure.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        expect(source, `${file} contains ${figure}`).not.toMatch(new RegExp(`(?<![\\d.,])${escaped}(?![\\d]|[.,]\\d)`));
      }
    }
  });
});
