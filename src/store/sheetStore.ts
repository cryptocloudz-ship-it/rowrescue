import { create } from "zustand";
import type {
  ParsedSheet,
  HealthReport,
  Row,
  CellChange,
  QuarantinedRow,
  ProcessingStage,
} from "@/types/sheet";
import type { RuleConfig } from "@/types/rules";
import { parseFile } from "@/lib/engine/parsers";
import { generateHealthReport } from "@/lib/engine/healthReport";
import { runEngine, undoRule, type EngineResult } from "@/lib/engine/ruleEngine";
import { ALL_RULES } from "@/lib/engine/rules";
import { FREE_RULES } from "@/config/plans";
import { trackFileUpload, trackDemoLoaded, trackCleaningRun } from "@/lib/analytics";
import { ISSUE_TO_RULE } from "@/lib/engine/issueRules";

export const FREE_ROW_LIMIT = 5_000;


/** Rules a tool landing page asks to switch on, with optional per-rule options. */
export interface RulePreset {
  ruleIds: string[];
  options?: Record<string, Record<string, unknown>>;
}

/** Enable rules matching detected issues plus any preset rules, limited to what the plan allows. */
function autoEnableRules(
  ruleConfigs: RuleConfig[],
  report: HealthReport,
  isPro: boolean,
  preset: RulePreset | null
): RuleConfig[] {
  const wanted = new Set(
    report.issues
      .filter((i) => i.count > 0)
      .map((i) => ISSUE_TO_RULE[i.type])
      .filter(Boolean)
  );
  preset?.ruleIds.forEach((id) => wanted.add(id));
  return ruleConfigs.map((rc) => {
    if (!wanted.has(rc.ruleId) || !(isPro || FREE_RULES.includes(rc.ruleId))) return rc;
    const presetOptions = preset?.options?.[rc.ruleId];
    return { ...rc, enabled: true, options: presetOptions ? { ...rc.options, ...presetOptions } : rc.options };
  });
}

interface SheetState {
  // Stage
  stage: ProcessingStage;
  error: string | null;

  // Parsed data
  parsedSheet: ParsedSheet | null;
  healthReport: HealthReport | null;

  // Row limit tracking
  rowLimitHit: boolean;
  totalRowCount: number;

  // Cleaning config
  ruleConfigs: RuleConfig[];
  isPro: boolean;
  preset: RulePreset | null;

  // Engine results
  engineResult: EngineResult | null;
  cleanedRows: Row[];
  allChanges: CellChange[];
  allQuarantined: QuarantinedRow[];
  engineErrors: { ruleId: string; error: string }[];
  cleaningTimeMs: number;

  // Actions
  importFile: (file: File) => Promise<void>;
  setStage: (stage: ProcessingStage) => void;
  setError: (error: string | null) => void;
  toggleRule: (ruleId: string) => void;
  updateRuleOptions: (ruleId: string, options: Record<string, unknown>) => void;
  runCleaning: () => void;
  undoRule: (ruleId: string) => void;
  resetAll: () => void;
  setIsPro: (isPro: boolean) => void;
  setPreset: (preset: RulePreset | null) => void;
  loadDemoData: () => void;
  getDemoCSV: () => string;
}

const DEFAULT_RULE_CONFIGS: RuleConfig[] = ALL_RULES.map((rule) => ({
  ruleId: rule.id,
  enabled: false,
  options: {},
}));

const DEMO_ROWS: Row[] = [
  { Name: "  John Smith  ", Email: "JOHN@EXAMPLE.COM", Phone: "(555) 123-4567", Date: "01/15/2024", Amount: "$1,234.56", Company: "Acme Inc" },
  { Name: "jane doe", Email: "jane@example.com", Phone: "555.987.6543", Date: "2024-02-20", Amount: "€2.345,67", Company: "acme inc" },
  { Name: "John Smith", Email: "JOHN@EXAMPLE.COM", Phone: "(555) 123-4567", Date: "01/15/2024", Amount: "$1,234.56", Company: "Acme Inc" },
  { Name: "Bob Johnson", Email: "bob@invalid", Phone: "not-a-phone", Date: "March 5, 2024", Amount: "3456", Company: "<b>TechCorp</b>" },
  { Name: "", Email: "", Phone: "", Date: "", Amount: "", Company: "" },
  { Name: "Alice Brown ", Email: "  Alice.Brown@Example.COM  ", Phone: "+1-555-111-2222", Date: "2024/04/10", Amount: "£789.00", Company: "Tech Corp" },
  { Name: "Charlie Wilson", Email: "charlie@example.com", Phone: "5551234567", Date: "15-05-2024", Amount: "1.234,00", Company: "Acme Inc." },
];
const DEMO_HEADERS = ["Name", "Email", "Phone", "Date", "Amount", "Company"];

export const useSheetStore = create<SheetState>((set, get) => ({
  stage: "idle",
  error: null,
  parsedSheet: null,
  healthReport: null,
  rowLimitHit: false,
  totalRowCount: 0,
  ruleConfigs: DEFAULT_RULE_CONFIGS,
  isPro: false,
  preset: null,
  engineResult: null,
  cleanedRows: [],
  allChanges: [],
  allQuarantined: [],
  engineErrors: [],
  cleaningTimeMs: 0,

  importFile: async (file: File) => {
    try {
      set({ stage: "parsing", error: null, rowLimitHit: false, totalRowCount: 0 });
      const parsed = await parseFile(file);
      const { isPro } = get();
      const totalRows = parsed.rows.length;

      // Soft-cap: truncate to free limit but keep going
      if (!isPro && totalRows > FREE_ROW_LIMIT) {
        parsed.rows = parsed.rows.slice(0, FREE_ROW_LIMIT);
        parsed.rowCount = FREE_ROW_LIMIT;
        set({ rowLimitHit: true, totalRowCount: totalRows });
      } else {
        set({ totalRowCount: totalRows });
      }

      set({ parsedSheet: parsed, stage: "health-check" });
      const report = generateHealthReport(parsed.rows, parsed.headers);

      const { ruleConfigs, isPro: userIsPro, preset } = get();
      const autoEnabled = autoEnableRules(ruleConfigs, report, userIsPro, preset);

      set({ healthReport: report, ruleConfigs: autoEnabled, stage: "configuring" });

      trackFileUpload({
        file_type: file.name.split(".").pop() || "unknown",
        row_count: parsed.rowCount,
        file_size_bytes: file.size,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to parse file",
        stage: "idle",
      });
    }
  },

  setStage: (stage) => set({ stage }),
  setError: (error) => set({ error }),

  toggleRule: (ruleId: string) => {
    const { ruleConfigs, isPro } = get();
    if (!isPro && !FREE_RULES.includes(ruleId)) return;
    set({
      ruleConfigs: ruleConfigs.map((rc) =>
        rc.ruleId === ruleId ? { ...rc, enabled: !rc.enabled } : rc
      ),
    });
  },

  updateRuleOptions: (ruleId, options) => {
    const { ruleConfigs } = get();
    set({
      ruleConfigs: ruleConfigs.map((rc) =>
        rc.ruleId === ruleId ? { ...rc, options: { ...rc.options, ...options } } : rc
      ),
    });
  },

  runCleaning: () => {
    const { parsedSheet, ruleConfigs } = get();
    if (!parsedSheet) return;

    set({ stage: "cleaning" });

    const t0 = performance.now();
    const result = runEngine(parsedSheet.rows, ruleConfigs);
    const cleaningTimeMs = Math.round(performance.now() - t0);

    set({
      engineResult: result,
      cleanedRows: result.cleanedRows,
      allChanges: result.allChanges,
      allQuarantined: result.allQuarantined,
      engineErrors: result.errors,
      cleaningTimeMs,
      stage: "previewing",
    });

    trackCleaningRun({
      rules_enabled: ruleConfigs.filter((rc) => rc.enabled).length,
      row_count: parsedSheet.rowCount,
      duration_ms: cleaningTimeMs,
      changes_count: result.allChanges.length,
    });
  },

  undoRule: (ruleId: string) => {
    const { parsedSheet, ruleConfigs } = get();
    if (!parsedSheet) return;

    // Disable the rule and re-run
    const updatedConfigs = ruleConfigs.map((rc) =>
      rc.ruleId === ruleId ? { ...rc, enabled: false } : rc
    );

    const result = undoRule(parsedSheet.rows, updatedConfigs, ruleId);

    set({
      ruleConfigs: updatedConfigs,
      engineResult: result,
      cleanedRows: result.cleanedRows,
      allChanges: result.allChanges,
      allQuarantined: result.allQuarantined,
      engineErrors: result.errors,
    });
  },

  resetAll: () => {
    set({
      stage: "idle",
      error: null,
      parsedSheet: null,
      healthReport: null,
      rowLimitHit: false,
      totalRowCount: 0,
      ruleConfigs: DEFAULT_RULE_CONFIGS,
      engineResult: null,
      cleanedRows: [],
      allChanges: [],
      allQuarantined: [],
      engineErrors: [],
      cleaningTimeMs: 0,
      preset: null,
    });
  },

  setIsPro: (isPro) => set({ isPro }),
  setPreset: (preset) => set({ preset }),

  loadDemoData: () => {
    const parsed: ParsedSheet = {
      fileName: "demo-messy-data.csv",
      fileSize: 512,
      headers: DEMO_HEADERS,
      rows: DEMO_ROWS,
      rowCount: DEMO_ROWS.length,
      columnCount: DEMO_HEADERS.length,
      delimiter: ",",
      encoding: "UTF-8",
    };
    const report = generateHealthReport(DEMO_ROWS, DEMO_HEADERS);

    const { ruleConfigs, isPro, preset } = get();
    const autoEnabled = autoEnableRules(ruleConfigs, report, isPro, preset);

    set({ parsedSheet: parsed, healthReport: report, ruleConfigs: autoEnabled, stage: "configuring", error: null });

    trackDemoLoaded();
  },

  getDemoCSV: () => {
    const lines = [DEMO_HEADERS.join(",")];
    for (const row of DEMO_ROWS) {
      const values = DEMO_HEADERS.map((h) => {
        const val = String(row[h] ?? "");
        return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      });
      lines.push(values.join(","));
    }
    return lines.join("\n");
  },
}));
