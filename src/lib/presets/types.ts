import type { RuleConfig } from "@/types/rules";

/** A preset as the API returns it. Safe to import from client code. */
export interface SyncedPreset {
  id: string;
  name: string;
  description: string;
  rules: RuleConfig[];
  isShared: boolean;
  /** Written by the signed-in user (false for presets from the team library). */
  mine: boolean;
  /** Can't be edited: someone else's preset, or the author's plan no longer syncs. */
  readOnly: boolean;
  author: string | null;
  updatedAt: string;
}

export interface PresetListResponse {
  presets: SyncedPreset[];
  canCreate: boolean;
  canShare: boolean;
}
