import { describe, it, expect } from "vitest";
import { effectivePlan } from "../plans";

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
