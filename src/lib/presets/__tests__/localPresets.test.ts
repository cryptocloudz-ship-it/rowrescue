import { describe, expect, it } from "vitest";
import { deleteLocalPreset, LOCAL_PRESETS_KEY, readLocalPresets, saveLocalPreset } from "../localPresets";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

const rules = [{ ruleId: "trimWhitespace", enabled: true, options: {} }];

describe("local presets", () => {
  it("saves up to the plan limit, then refuses", () => {
    const storage = memoryStorage();
    for (const name of ["a", "b", "c"]) saveLocalPreset(name, rules, 3, storage);
    expect(readLocalPresets(storage).map((p) => p.name)).toEqual(["a", "b", "c"]);
    expect(() => saveLocalPreset("d", rules, 3, storage)).toThrow(/up to 3 presets/);
  });

  it("overwrites a preset with the same name even at the limit", () => {
    const storage = memoryStorage();
    for (const name of ["a", "b", "c"]) saveLocalPreset(name, rules, 3, storage, 1);
    const newRules = [{ ruleId: "deduplicateRows", enabled: true, options: {} }];
    const updated = saveLocalPreset("B", newRules, 3, storage, 2);
    const all = readLocalPresets(storage);
    expect(all).toHaveLength(3);
    expect(all.find((p) => p.id === updated.id)).toMatchObject({ name: "B", rules: newRules, createdAt: 1, updatedAt: 2 });
  });

  it("deletes by id", () => {
    const storage = memoryStorage();
    const a = saveLocalPreset("a", rules, 3, storage);
    saveLocalPreset("b", rules, 3, storage);
    deleteLocalPreset(a.id, storage);
    expect(readLocalPresets(storage).map((p) => p.name)).toEqual(["b"]);
  });

  it("ignores corrupt storage and malformed entries", () => {
    expect(readLocalPresets(memoryStorage({ [LOCAL_PRESETS_KEY]: "nope" }))).toEqual([]);
    const mixed = JSON.stringify([{ id: "1", name: "ok", rules }, { id: 2 }, null, { id: "3", name: "bad", rules: "x" }]);
    expect(readLocalPresets(memoryStorage({ [LOCAL_PRESETS_KEY]: mixed })).map((p) => p.name)).toEqual(["ok"]);
  });

  it("returns nothing and refuses to save when storage is unavailable", () => {
    expect(readLocalPresets(null)).toEqual([]);
    expect(() => saveLocalPreset("a", rules, 3, null)).toThrow(/blocking local storage/);
  });
});
