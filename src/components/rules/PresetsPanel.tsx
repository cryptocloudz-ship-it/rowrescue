"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bookmark, Trash2, Share2, Upload, RefreshCw } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";
import { ALL_RULES } from "@/lib/engine/rules";
import { applyPresetRules, snapshotRules, PRESET_NAME_MAX } from "@/lib/presets/presetRules";
import { deleteLocalPreset, readLocalPresets, saveLocalPreset, type LocalPreset } from "@/lib/presets/localPresets";
import type { PresetListResponse, SyncedPreset } from "@/lib/presets/types";
import type { RuleConfig } from "@/types/rules";

type Row =
  | { kind: "local"; id: string; name: string; rules: RuleConfig[]; preset: LocalPreset }
  | { kind: "synced"; id: string; name: string; rules: RuleConfig[]; preset: SyncedPreset };

const RULE_NAMES = new Map(ALL_RULES.map((r) => [r.id, r.name]));

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
  return data as T;
}

/**
 * Save the current rule selection under a name and load it on a later file. Free keeps presets in this browser;
 * Pro and Team sync them to the account, and Team members can share them with the team library.
 */
export function PresetsPanel() {
  const ruleConfigs = useSheetStore((s) => s.ruleConfigs);
  const setRuleConfigs = useSheetStore((s) => s.setRuleConfigs);
  const isPro = useSheetStore((s) => s.isPro);
  const { signedIn, limits } = useSheetStore((s) => s.entitlements);

  // Only rendered once a file is open, never during server rendering, so reading storage up front is safe
  const [local, setLocal] = useState<LocalPreset[]>(() => readLocalPresets());
  const [fetched, setFetched] = useState<PresetListResponse | null>(null);
  const synced = signedIn ? fetched : null;
  const [name, setName] = useState("");
  const [share, setShare] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const refresh = useCallback(() => {
    if (!signedIn) return;
    api<PresetListResponse>("/api/presets")
      .then(setFetched)
      .catch(() => setMessage({ text: "Couldn't load your synced presets. Refresh to try again.", error: true }));
  }, [signedIn]);

  useEffect(refresh, [refresh]);

  const syncing = limits.syncPresets && (synced?.canCreate ?? false);
  const canShare = synced?.canShare ?? false;
  const selected = snapshotRules(ruleConfigs);

  const rows: Row[] = [
    ...(synced?.presets ?? []).map((p) => ({ kind: "synced" as const, id: p.id, name: p.name, rules: p.rules, preset: p })),
    ...local.map((p) => ({ kind: "local" as const, id: p.id, name: p.name, rules: p.rules, preset: p })),
  ];

  async function run(action: () => Promise<string>) {
    setBusy(true);
    setMessage(null);
    try {
      setMessage({ text: await action() });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Something went wrong.", error: true });
    } finally {
      setBusy(false);
    }
  }

  function load(row: Row) {
    const result = applyPresetRules(ruleConfigs, row.rules, isPro);
    setRuleConfigs(result.ruleConfigs);
    const skipped = result.skipped.map((id) => RULE_NAMES.get(id) ?? id);
    setMessage({
      text: skipped.length
        ? `Loaded “${row.name}”. Skipped ${skipped.join(", ")}: ${skipped.length === 1 ? "it needs" : "they need"} Pro.`
        : `Loaded “${row.name}”.`,
    });
  }

  const save = () =>
    run(async () => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Name the preset first.");
      if (selected.length === 0) throw new Error("Select at least one rule to save.");
      if (syncing) {
        await api("/api/presets", {
          method: "POST",
          body: JSON.stringify({ name: trimmed, rules: selected, isShared: canShare && share }),
        });
        refresh();
      } else {
        saveLocalPreset(trimmed, selected, limits.maxPresets);
        setLocal(readLocalPresets());
      }
      setName("");
      setShare(false);
      return `Saved “${trimmed}”.`;
    });

  const overwrite = (row: Row) =>
    run(async () => {
      if (selected.length === 0) throw new Error("Select at least one rule to save.");
      if (row.kind === "synced") {
        await api(`/api/presets/${row.id}`, { method: "PATCH", body: JSON.stringify({ rules: selected }) });
        refresh();
      } else {
        saveLocalPreset(row.name, selected, limits.maxPresets);
        setLocal(readLocalPresets());
      }
      return `Updated “${row.name}” with the rules selected now.`;
    });

  const toggleShare = (row: Extract<Row, { kind: "synced" }>) =>
    run(async () => {
      const isShared = !row.preset.isShared;
      await api(`/api/presets/${row.id}`, { method: "PATCH", body: JSON.stringify({ isShared }) });
      refresh();
      return isShared ? `“${row.name}” is now in the team library.` : `“${row.name}” is no longer shared.`;
    });

  const uploadLocal = (row: Extract<Row, { kind: "local" }>) =>
    run(async () => {
      await api("/api/presets", { method: "POST", body: JSON.stringify({ name: row.name, rules: row.rules }) });
      deleteLocalPreset(row.id);
      setLocal(readLocalPresets());
      refresh();
      return `“${row.name}” is now synced to your account.`;
    });

  const remove = (row: Row) =>
    run(async () => {
      if (!window.confirm(`Delete the preset “${row.name}”?`)) return "";
      if (row.kind === "synced") {
        await api(`/api/presets/${row.id}`, { method: "DELETE" });
        refresh();
      } else {
        deleteLocalPreset(row.id);
        setLocal(readLocalPresets());
      }
      return `Deleted “${row.name}”.`;
    });

  const localLimitText =
    limits.maxPresets === Infinity ? null : `${local.length} of ${limits.maxPresets} saved in this browser`;

  return (
    <section aria-labelledby="presets-heading" className="bg-paper border border-rule rounded-lg p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="presets-heading" className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Bookmark className="w-4 h-4 text-accent" aria-hidden="true" />
          Presets
        </h3>
        <p className="text-sm text-ink-muted">
          {syncing ? (canShare ? "Synced to your account and shareable with your team" : "Synced to your account") : localLimitText}
        </p>
      </div>

      {rows.length > 0 ? (
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          {rows.map((row) => {
            const synced = row.kind === "synced" ? row.preset : null;
            const editable = row.kind === "local" || (synced?.mine && !synced.readOnly);
            return (
              <li key={`${row.kind}-${row.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <div className="flex-1 min-w-[180px]">
                  <p className="font-medium text-ink break-words">{row.name}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {row.rules.length} rule{row.rules.length === 1 ? "" : "s"}
                    {row.kind === "local" && " · this browser"}
                    {synced && !synced.mine && ` · shared by ${synced.author ?? "a teammate"}`}
                    {synced?.mine && synced.isShared && " · shared with your team"}
                    {synced?.mine && synced.readOnly && " · read-only"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => load(row)}
                    disabled={busy}
                    className="min-h-9 px-3 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-strong disabled:opacity-50"
                  >
                    Load
                  </button>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => overwrite(row)}
                      disabled={busy || selected.length === 0}
                      title="Replace this preset's rules with the ones selected now"
                      className="min-h-9 px-3 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      Update
                    </button>
                  )}
                  {synced?.mine && editable && (canShare || synced.isShared) && (
                    <button
                      type="button"
                      onClick={() => toggleShare(row as Extract<Row, { kind: "synced" }>)}
                      disabled={busy}
                      aria-pressed={synced.isShared}
                      className="min-h-9 px-3 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {synced.isShared ? "Unshare" : "Share"}
                    </button>
                  )}
                  {row.kind === "local" && syncing && (
                    <button
                      type="button"
                      onClick={() => uploadLocal(row)}
                      disabled={busy}
                      className="min-h-9 px-3 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      Sync
                    </button>
                  )}
                  {(row.kind === "local" || synced?.mine) && (
                    <button
                      type="button"
                      onClick={() => remove(row)}
                      disabled={busy}
                      aria-label={`Delete ${row.name}`}
                      className="min-h-9 px-2.5 rounded-md border border-rule text-ink-muted hover:text-ink hover:border-rule-strong disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-ink-body">
          Save the rules you&apos;ve selected to reuse them on the next file.
        </p>
      )}

      <form
        className="mt-4 flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label htmlFor="preset-name" className="sr-only">
          Preset name
        </label>
        <input
          id="preset-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={PRESET_NAME_MAX}
          placeholder="Name, e.g. Monthly CRM export"
          className="flex-1 min-w-[200px] min-h-10 px-3 rounded-md border border-rule-strong bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {syncing && canShare && (
          <label className="flex items-center gap-2 text-sm text-ink-body">
            <input
              type="checkbox"
              checked={share}
              onChange={(e) => setShare(e.target.checked)}
              className="rounded border-rule text-accent focus:ring-accent"
            />
            Share with team
          </label>
        )}
        <button
          type="submit"
          disabled={busy || selected.length === 0}
          className="min-h-10 px-4 rounded-md border border-rule-strong text-sm font-semibold hover:border-ink-muted disabled:opacity-50"
        >
          Save {selected.length} rule{selected.length === 1 ? "" : "s"}
        </button>
      </form>

      {!syncing && (
        <p className="mt-3 text-xs text-ink-muted">
          <Link href="/pricing" className="font-medium text-accent hover:underline">
            Pro
          </Link>{" "}
          syncs unlimited presets to your account. Team adds a shared library for your team.
        </p>
      )}

      <p role="status" aria-live="polite" className={`mt-3 text-sm ${message?.error ? "text-red-700" : "text-ink-body"}`}>
        {message?.text}
      </p>
    </section>
  );
}
