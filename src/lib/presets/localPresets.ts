import type { RuleConfig } from "@/types/rules";
import { parseStoredRules } from "./presetRules";

/** Presets kept in this browser only: the Free plan's storage, and still readable after upgrading. */

export const LOCAL_PRESETS_KEY = "spreadsheetfix_presets";

export interface LocalPreset {
  id: string;
  name: string;
  rules: RuleConfig[];
  createdAt: number;
  updatedAt: number;
}

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;

function defaultStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // blocked storage, e.g. some private windows
  }
}

export function readLocalPresets(storage: Storage | null = defaultStorage()): LocalPreset[] {
  if (!storage) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(storage.getItem(LOCAL_PRESETS_KEY) ?? "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((p) => {
    if (!p || typeof p.id !== "string" || typeof p.name !== "string") return [];
    const rules = parseStoredRules(JSON.stringify(p.rules));
    if (!rules) return [];
    return [{ id: p.id, name: p.name, rules, createdAt: Number(p.createdAt) || 0, updatedAt: Number(p.updatedAt) || 0 }];
  });
}

function write(presets: LocalPreset[], storage: Storage | null) {
  if (!storage) throw new Error("This browser is blocking local storage, so presets can't be saved here.");
  storage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(presets));
}

/** Save a new local preset, or overwrite one with the same name. Throws when the plan's limit is reached. */
export function saveLocalPreset(
  name: string,
  rules: RuleConfig[],
  maxPresets: number,
  storage: Storage | null = defaultStorage(),
  now = Date.now()
): LocalPreset {
  const presets = readLocalPresets(storage);
  const existing = presets.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    const updated = { ...existing, name, rules, updatedAt: now };
    write(presets.map((p) => (p.id === existing.id ? updated : p)), storage);
    return updated;
  }
  if (presets.length >= maxPresets) {
    throw new Error(`The Free plan saves up to ${maxPresets} presets in this browser. Delete one, or upgrade to Pro for unlimited synced presets.`);
  }
  const created: LocalPreset = { id: crypto.randomUUID(), name, rules, createdAt: now, updatedAt: now };
  write([...presets, created], storage);
  return created;
}

export function deleteLocalPreset(id: string, storage: Storage | null = defaultStorage()) {
  write(readLocalPresets(storage).filter((p) => p.id !== id), storage);
}
