import { describe, expect, it } from "vitest";
import { auditActionLabel, auditRow, parseAuditMetadata } from "../audit";

describe("auditRow", () => {
  it("keeps only allowed metadata keys, so rule settings or file data can't be logged", () => {
    const row = auditRow({
      teamId: "t1",
      userId: "u1",
      action: "preset.update",
      presetId: "p1",
      metadata: { presetName: "CRM", changed: ["rules"], rules: [{ ruleId: "x" }], rows: [["secret"]] },
    });
    expect(row).toMatchObject({ teamId: "t1", userId: "u1", action: "preset.update", presetId: "p1" });
    expect(JSON.parse(row.metadata!)).toEqual({ presetName: "CRM", changed: ["rules"] });
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("stores null metadata when there is nothing to record", () => {
    expect(auditRow({ teamId: "t1", userId: "u1", action: "member.join" }).metadata).toBeNull();
  });
});

describe("display helpers", () => {
  it("labels known actions and passes unknown ones through", () => {
    expect(auditActionLabel("member.leave")).toBe("Left the team");
    expect(auditActionLabel("something.new")).toBe("something.new");
  });

  it("parses metadata defensively", () => {
    expect(parseAuditMetadata(null)).toEqual({});
    expect(parseAuditMetadata("{bad")).toEqual({});
    expect(parseAuditMetadata('{"email":"a@b.c"}')).toEqual({ email: "a@b.c" });
  });
});
