"use client";

import { Check } from "lucide-react";
import type { Reconciliation } from "@/lib/engine/reconcile";

export function formatTotal(value: number, decimals: number): string {
  return value.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function signed(value: number, decimals: number): string {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatTotal(Math.abs(value), decimals)}`;
}

/** Before/after totals for every amount column, so a bookkeeper can see nothing was lost. */
export function TotalsCheck({ reconciliation }: { reconciliation: Reconciliation }) {
  const { columns, balanced, traceable } = reconciliation;
  if (columns.length === 0) return null;

  const offColumns = columns.filter((c) => !c.balanced).length;
  const unreadable = columns.reduce((n, c) => n + c.unreadable.before, 0);

  let heading: string;
  let detail: string;
  if (!traceable) {
    heading = "Totals can't be verified";
    detail = "Some removed rows couldn't be traced back to a step, so the breakdown below may be incomplete.";
  } else if (balanced) {
    heading = "Totals balance";
    detail = "Every amount column adds up: the total before cleaning, minus removed rows, equals the total after.";
  } else {
    heading = `Totals changed in ${offColumns} column${offColumns > 1 ? "s" : ""}`;
    detail = "A value changed during cleaning, not just its format. Check the column below before you export.";
  }

  return (
    <section aria-labelledby="totals-check-heading" className="rounded-lg border border-rule font-ui">
      <div className="flex flex-wrap items-start gap-3 px-5 py-4 border-b border-rule">
        {traceable && balanced && (
          <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <Check className="size-3.5 text-emerald-700" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3
            id="totals-check-heading"
            className={`font-semibold ${traceable && !balanced ? "text-rose-700" : "text-ink"}`}
          >
            {heading}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-body">{detail}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-surface text-left text-[13px] text-ink-muted">
              <th scope="col" className="px-5 py-2.5 font-medium">Column</th>
              <th scope="col" className="px-5 py-2.5 font-medium text-right">Before</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Removed</th>
              <th scope="col" className="px-5 py-2.5 font-medium text-right">After</th>
              <th scope="col" className="px-5 py-2.5 font-medium text-right">Check</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((c) => (
              <tr key={c.column} className="border-t border-rule align-top">
                <th scope="row" className="px-5 py-3 text-left font-medium">
                  {c.column}
                  {c.cleanedColumn !== c.column && (
                    <span className="block text-[13px] font-normal text-ink-muted">now {c.cleanedColumn}</span>
                  )}
                </th>
                <td className="px-5 py-3 text-right font-data tabular-nums">{formatTotal(c.before, c.decimals)}</td>
                <td className="px-5 py-3">
                  {c.removed.length === 0 ? (
                    <span className="text-ink-muted">None</span>
                  ) : (
                    <ul className="space-y-1">
                      {c.removed.map((r) => (
                        <li key={r.ruleId} className="flex justify-between gap-4">
                          <span className="text-ink-body">
                            {r.ruleName} · {r.rows} row{r.rows > 1 ? "s" : ""}
                          </span>
                          <span className="font-data tabular-nums">{signed(-r.total, c.decimals)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-5 py-3 text-right font-data tabular-nums">{formatTotal(c.after, c.decimals)}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  {c.balanced ? (
                    <span className="text-emerald-700 font-medium">Balances</span>
                  ) : (
                    <span className="text-rose-700 font-medium">Off by {signed(c.difference, c.decimals)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unreadable > 0 && (
        <p className="px-5 py-3 border-t border-rule text-[13px] text-ink-muted">
          {unreadable} cell{unreadable > 1 ? "s" : ""} in these columns couldn&apos;t be read as numbers and{" "}
          {unreadable > 1 ? "aren't" : "isn't"} included in the totals.
        </p>
      )}
    </section>
  );
}
