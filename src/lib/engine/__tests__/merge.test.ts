import { describe, it, expect } from "vitest";
import { mergeSheets } from "../merge";

describe("mergeSheets", () => {
  const jan = { headers: ["email", "name"], rows: [{ email: "ana@acme.io", name: "Ana" }] };
  const feb = {
    headers: ["name", "Email ", "city"],
    rows: [
      { name: "Ben", "Email ": "ben@acme.io", city: "Lyon" },
      { name: "Ana", "Email ": "ana@acme.io", city: "" },
    ],
  };

  it("matches headers ignoring case and spaces, and unions extra columns", () => {
    const r = mergeSheets([jan, feb], { dedupe: true });
    expect(r.headers).toEqual(["email", "name", "city"]);
    expect(r.rows).toEqual([
      { email: "ana@acme.io", name: "Ana", city: "" },
      { email: "ben@acme.io", name: "Ben", city: "Lyon" },
    ]);
    expect(r.duplicatesRemoved).toBe(1);
  });

  it("aligns values under the right header", () => {
    const r = mergeSheets([
      { headers: ["a", "b"], rows: [{ a: "1", b: "2" }] },
      { headers: ["b", "a", "c"], rows: [{ b: "4", a: "3", c: "5" }] },
    ]);
    expect(r.headers).toEqual(["a", "b", "c"]);
    expect(r.rows).toEqual([
      { a: "1", b: "2", c: "" },
      { a: "3", b: "4", c: "5" },
    ]);
  });

  it("removes duplicates across files and truncates to maxRows", () => {
    const a = { headers: ["x"], rows: [{ x: "1" }, { x: "2" }] };
    const b = { headers: ["x"], rows: [{ x: "2" }, { x: "3" }] };
    const r = mergeSheets([a, b], { dedupe: true, maxRows: 2 });
    expect(r.duplicatesRemoved).toBe(1);
    expect(r.truncatedFrom).toBe(3);
    expect(r.rows).toEqual([{ x: "1" }, { x: "2" }]);
  });
});
