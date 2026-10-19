"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSheetStore } from "@/store/sheetStore";
import { ACCEPTED_TYPES, validateFile } from "@/components/upload/fileValidation";
import { HERO_ROWS, HERO_FIXES, HERO_FILE_NAME, type HeroCell } from "@/content/heroSample";

function showSpaces(value: string) {
  return value.replace(/ +$/, (m) => "␣".repeat(m.length));
}

function CellValue({ cell }: { cell: HeroCell }) {
  if (typeof cell === "string") return <>{cell}</>;
  return (
    <>
      <del className="block text-xs text-ink-faint whitespace-pre">{showSpaces(cell.before)}</del>
      <ins className="block no-underline text-accent">{cell.after}</ins>
    </>
  );
}

export function HomeHero() {
  const router = useRouter();
  const { importFile, loadDemoData } = useSheetStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const problem = validateFile(file);
      if (problem) {
        setError(problem);
        return;
      }
      // The store lives in memory, so parsing carries on while /clean loads
      importFile(file);
      router.push("/clean");
    },
    [importFile, router]
  );

  const openSample = useCallback(() => {
    loadDemoData();
    router.push("/clean");
  }, [loadDemoData, router]);

  return (
    <section className="bg-paper text-ink font-ui tabular-nums">
      <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-[72px] flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
        <div className="flex-1 min-w-0 lg:max-w-[520px]">
          <h1 className="text-[36px] sm:text-[46px] lg:text-[54px] leading-[1.08] font-semibold tracking-[-0.03em]">
            Clean transaction exports before they reach your books.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[500px]">
            Dates, amounts, duplicates and spacing, standardised in your browser. Review every
            change before you export.
          </p>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={`mt-8 flex flex-col items-start gap-3 p-6 rounded-lg border border-dashed cursor-pointer transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
              isDragging ? "border-accent bg-accent-tint" : "border-[#b8c0cc] bg-surface hover:border-ink-muted"
            }`}
          >
            <span className="inline-flex items-center min-h-12 px-[22px] rounded-md bg-accent text-white text-base font-semibold hover:bg-accent-strong transition-colors">
              Choose a file
            </span>
            <span className="text-sm text-ink-muted">
              {isDragging ? "Drop to open it" : "or drop a CSV or Excel file here, up to 50 MB"}
            </span>
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>

          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-[#b42318]">
              {error}
            </p>
          )}

          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <div>
              <dt className="text-ink-muted">Processing</dt>
              <dd className="mt-0.5 font-medium">In your browser</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Upload</dt>
              <dd className="mt-0.5 font-medium">None</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Account</dt>
              <dd className="mt-0.5 font-medium">Not required</dd>
            </div>
          </dl>
        </div>

        <div className="flex-[1.2] min-w-0">
          <figure className="m-0">
            <div className="rounded-[10px] border border-rule-strong bg-paper shadow-frame overflow-hidden">
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-2 px-4 py-3 border-b border-rule bg-surface text-[13px]">
                <span className="font-data font-medium">{HERO_FILE_NAME}</span>
                <span className="text-accent font-semibold">{HERO_FIXES.pro} fixes ready to review</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] border-collapse font-data text-sm leading-snug">
                  <thead>
                    <tr className="text-left font-ui text-[13px] text-ink-muted">
                      <th scope="col" className="px-4 py-2.5 font-medium border-b border-rule">date</th>
                      <th scope="col" className="px-4 py-2.5 font-medium border-b border-rule">vendor</th>
                      <th scope="col" className="px-4 py-2.5 font-medium border-b border-rule text-right">amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HERO_ROWS.map((row, i) => {
                      const border = i < HERO_ROWS.length - 1 ? "border-b border-rule" : "";
                      if (row.duplicate) {
                        return (
                          <tr key={i} className="bg-surface">
                            <td colSpan={2} className={`px-4 py-3 text-ink-faint ${border}`}>
                              <del>
                                {row.date as string}&nbsp;&nbsp;{row.vendor as string}
                              </del>
                              <span className="ml-3 font-ui text-[13px] text-accent">Duplicate removed</span>
                            </td>
                            <td className={`px-4 py-3 text-right text-ink-faint ${border}`}>
                              <del>{row.amount as string}</del>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={i}>
                          <td className={`px-4 py-3 ${border}`}>
                            <CellValue cell={row.date} />
                          </td>
                          <td className={`px-4 py-3 ${border}`}>
                            <CellValue cell={row.vendor} />
                          </td>
                          <td className={`px-4 py-3 text-right ${border}`}>
                            <CellValue cell={row.amount} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <figcaption className="mt-3.5 text-sm leading-relaxed text-ink-muted">
              An example file. The free plan makes {HERO_FIXES.free} of these {HERO_FIXES.pro} fixes (dates, spacing and the duplicate); amount formatting is Pro.{" "}
              <button
                type="button"
                onClick={openSample}
                className="text-accent hover:text-accent-strong underline underline-offset-2 font-medium"
              >
                Try it with sample data
              </button>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
