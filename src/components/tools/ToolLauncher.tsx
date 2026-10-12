"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSheetStore, type RulePreset } from "@/store/sheetStore";
import { FileUploader } from "@/components/upload/FileUploader";
import { EntitlementsSync } from "@/components/billing/EntitlementsSync";

/** Uploader for a tool landing page: applies the tool's rule preset, then hands off to /clean once the file is parsed. */
export function ToolLauncher({ preset }: { preset: RulePreset }) {
  const router = useRouter();
  const stage = useSheetStore((s) => s.stage);

  useEffect(() => {
    const store = useSheetStore.getState();
    store.resetAll();
    store.setPreset(preset);
    router.prefetch("/clean");
  }, [preset, router]);

  useEffect(() => {
    if (stage === "configuring") router.push("/clean");
  }, [stage, router]);

  return (
    <>
      <EntitlementsSync />
      <FileUploader />
      {stage === "parsing" && (
        <p role="status" className="mt-4 text-center text-sm text-slate-400">
          Reading your file…
        </p>
      )}
    </>
  );
}
