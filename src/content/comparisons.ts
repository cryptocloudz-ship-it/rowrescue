import type { ToolFaq } from "./tools";

export interface Comparison {
  slug: string;
  /** The other product, as it appears in "SpreadsheetFix vs …" */
  competitor: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  /** Side-by-side facts. Keep them checkable; no scores, no ticks for vague claims. */
  rows: { aspect: string; us: string; them: string }[];
  chooseThem: string[];
  chooseUs: string[];
  sections: { heading: string; body: string }[];
  faqs: ToolFaq[];
  /** Tool page slugs to link to */
  tools: string[];
}

export const COMPARISONS: Comparison[] = [
  {
    slug: "excel",
    competitor: "Excel",
    metaTitle: "SpreadsheetFix vs Excel for Cleaning CSV Files",
    metaDescription:
      "When Excel's Remove Duplicates, TRIM and CSV import are enough, and when a dedicated CSV cleaner saves time. An honest comparison.",
    h1: "SpreadsheetFix vs Excel for cleaning CSV data",
    intro:
      "Excel can clean almost anything if you know the right functions and do the steps by hand. SpreadsheetFix does the common cleaning steps for a CSV in one pass, before the file is opened in Excel, so Excel's automatic type conversion never gets a chance to change it.",
    rows: [
      { aspect: "Where it runs", us: "In your browser, nothing to install", them: "Desktop app, or Excel for the web" },
      { aspect: "Opening a CSV", us: "Values kept as text until a rule changes them", them: "Dates, long numbers and leading zeros converted on open, based on regional settings" },
      { aspect: "Duplicates", us: "Whitespace normalised before matching; preview of every removed row", them: "Data › Remove Duplicates; ignores case, but spaces and formatting make values differ; no list of what was removed" },
      { aspect: "Spaces", us: "Trims and collapses spaces, including non-breaking spaces", them: "TRIM removes regular spaces only, not non-breaking ones (CHAR(160))" },
      { aspect: "Mixed date formats", us: "Detects day-first or month-first per column and converts to one format", them: "Manual: Text to Columns, DATEVALUE, or Power Query" },
      { aspect: "Garbled characters (Ã©)", us: "Repaired automatically", them: "Re-import with the right file origin, or fix by hand" },
      { aspect: "Proof totals didn't change", us: "Totals check on amount columns", them: "Manual SUM before and after" },
      { aspect: "Size", us: "5,000 rows free, 500,000 on Pro", them: "1,048,576 rows per sheet" },
      { aspect: "Formulas, pivots, charts", us: "No", them: "Yes" },
    ],
    chooseThem: [
      "You need formulas, pivot tables or charts on the result.",
      "The cleaning is a one-off fix you already know how to do.",
      "You're already using Power Query to refresh the same report.",
    ],
    chooseUs: [
      "You want to clean a CSV before Excel changes its dates and codes.",
      "You need several fixes on an export without writing formulas.",
      "You want to see every change, and a check that totals still match, before you use the file.",
    ],
    sections: [
      {
        heading: "Excel changes a CSV the moment you open it",
        body: "When you double-click a CSV, Excel guesses each column's type. 03/04/2026 becomes a date in whichever order your regional settings use, 00123 becomes 123, and a 16-digit card or account reference is shown in scientific notation, with every digit after the fifteenth turned into a zero. Recent Microsoft 365 versions let you turn some of these conversions off under File › Options › Data. Cleaning the CSV first, and normalising dates to YYYY-MM-DD, avoids the problem in every version.",
      },
      {
        heading: "Why Remove Duplicates misses duplicates",
        body: "Excel ignores capitalisation but otherwise compares cells as they are displayed. “Acme Ltd” and “Acme Ltd ” (with a trailing space) are different to it, the same date in two formats counts twice, and TRIM won't remove the non-breaking spaces that come from web pages and PDFs. SpreadsheetFix trims and collapses whitespace before comparing, so rows that differ only by spacing are matched, and it shows each removed row so you can check the result.",
      },
      {
        heading: "Use both",
        body: "The two tools do different jobs. Clean the export in SpreadsheetFix, then open the cleaned file in Excel for analysis. On Pro you can download a native .xlsx in which every value is stored as text, exactly as cleaned, so Excel has nothing to guess.",
      },
    ],
    faqs: [
      {
        q: "Is SpreadsheetFix a replacement for Excel?",
        a: "No. It cleans files; it doesn't do formulas, pivot tables or charts. Most people use it to prepare a CSV before opening it in Excel.",
      },
      {
        q: "How do I stop Excel changing dates in a CSV?",
        a: "Convert the dates to YYYY-MM-DD before opening the file, or import it with Data › From Text/CSV and set the column type to Text. SpreadsheetFix's Normalize Dates rule does the first option for you.",
      },
      {
        q: "Why doesn't Excel's TRIM remove all spaces?",
        a: "TRIM removes the regular space character (code 32). Non-breaking spaces (code 160) are left, which is why cells copied from web pages still look padded. SpreadsheetFix removes both.",
      },
    ],
    tools: ["remove-duplicates-csv", "normalize-dates-csv", "csv-to-excel-cleaner", "trim-whitespace-csv"],
  },
  {
    slug: "google-sheets",
    competitor: "Google Sheets",
    metaTitle: "SpreadsheetFix vs Google Sheets for Cleaning CSV Data",
    metaDescription:
      "Google Sheets has data cleanup built in, but your file goes to Google Drive. Compare it with a CSV cleaner that runs in your browser.",
    h1: "SpreadsheetFix vs Google Sheets for cleaning CSV data",
    intro:
      "Google Sheets has useful cleanup tools under Data › Data cleanup, and it's free. The main differences are where your data goes, how dates are interpreted on import, and how many cleaning steps exist without writing formulas.",
    rows: [
      { aspect: "Where your data goes", us: "Stays in your browser; never uploaded", them: "Uploaded to and stored in Google Drive" },
      { aspect: "Account", us: "Not needed for free use", them: "Google account required" },
      { aspect: "Duplicates", us: "Whitespace normalised before matching; preview of removed rows", them: "Data cleanup › Remove duplicates, by selected columns" },
      { aspect: "Spaces", us: "Trim and collapse", them: "Data cleanup › Trim whitespace" },
      { aspect: "Mixed date formats", us: "Detects day/month order per column and converts", them: "Parsed on import using the spreadsheet's locale; mixed orders need formulas" },
      { aspect: "Garbled characters (Ã©)", us: "Repaired automatically", them: "Manual find and replace" },
      { aspect: "Email validation", us: "Flags malformed addresses", them: "Data validation rule or formula" },
      { aspect: "Size", us: "5,000 rows free, 500,000 on Pro", them: "Up to 10 million cells per spreadsheet" },
      { aspect: "Collaboration", us: "No shared editing", them: "Real-time shared editing" },
    ],
    chooseThem: [
      "Several people need to edit the result together.",
      "The data is already in Google Drive and policy allows it.",
      "You need formulas or charts on the cleaned data.",
    ],
    chooseUs: [
      "The file holds customer, financial or HR data that shouldn't be uploaded to another service.",
      "Dates in the export mix day-first and month-first formats.",
      "You want several fixes in one pass, with a preview of every change.",
    ],
    sections: [
      {
        heading: "Uploading is the difference that matters most",
        body: "Importing a CSV into Google Sheets copies it to Google's servers, where it stays until you delete it. For many files that's fine. For bank exports, payroll, patient or customer lists, your company's data policy may not allow it. SpreadsheetFix reads the file in your browser tab, so there's no copy anywhere else.",
      },
      {
        heading: "Dates are read using the spreadsheet's locale",
        body: "When you import, Sheets converts date-like text using the locale set in File › Settings. A US-locale sheet reads 03/04/2026 as 4 March; an Irish-locale sheet reads it as 3 April. If an export mixes both, some dates are silently wrong. SpreadsheetFix looks at each column to decide the order; a column with no date above the 12th is read day-first, so check the preview.",
      },
      {
        heading: "Clean first, then share",
        body: "If the cleaned file does need to go to Sheets, clean it here first and import the result. You still get Sheets' collaboration, and the data arrives with consistent dates and no duplicates.",
      },
    ],
    faqs: [
      {
        q: "Does Google Sheets have a remove duplicates feature?",
        a: "Yes, under Data › Data cleanup › Remove duplicates. Rows that differ only by extra spaces count as different, so run Data cleanup › Trim whitespace first, or clean the file here.",
      },
      {
        q: "Is it safe to put customer data in Google Sheets?",
        a: "It depends on your organisation's policies and agreements with Google. If you can't upload the data, SpreadsheetFix lets you clean it without it leaving your computer.",
      },
      {
        q: "Can I use SpreadsheetFix with Google Sheets?",
        a: "Yes. Download a CSV from Sheets with File › Download › CSV, clean it here, and import the result back.",
      },
    ],
    tools: ["remove-duplicates-csv", "normalize-dates-csv", "validate-emails-csv", "fix-csv-encoding"],
  },
  {
    slug: "openrefine",
    competitor: "OpenRefine",
    metaTitle: "SpreadsheetFix vs OpenRefine — Which Data Cleaner to Use",
    metaDescription:
      "OpenRefine is a free, powerful desktop tool for messy data. SpreadsheetFix is a quicker browser cleaner for everyday CSV fixes. Here's when to use each.",
    h1: "SpreadsheetFix vs OpenRefine",
    intro:
      "OpenRefine is a free, open-source tool for exploring and transforming messy data, and it's very good at it. It's also a desktop application with its own concepts to learn. SpreadsheetFix covers the common fixes for a CSV with no installation and very little to learn.",
    rows: [
      { aspect: "Setup", us: "Open a web page", them: "Download and run the app (it opens in your browser, served from your computer)" },
      { aspect: "Where data is processed", us: "In your browser; never uploaded", them: "On your computer; never uploaded" },
      { aspect: "Price", us: "Free up to 5,000 rows; Pro €12/month", them: "Free and open source" },
      { aspect: "Learning curve", us: "Pick rules, preview, download", them: "Facets, clustering and GREL expressions" },
      { aspect: "Fuzzy duplicates (Jon / John)", us: "No; exact matching after trimming spaces (emails are also lowercased)", them: "Yes, with clustering" },
      { aspect: "Custom transformations", us: "18 built-in rules", them: "Any transformation you can express in GREL, Python or Clojure" },
      { aspect: "Mixed date formats", us: "Detects day/month order per column", them: "Possible with expressions" },
      { aspect: "Proof totals didn't change", us: "Totals check on amount columns", them: "Not built in" },
    ],
    chooseThem: [
      "You need fuzzy matching or clustering of near-duplicate names.",
      "You're doing research or data journalism and need to explore the data, not just fix it.",
      "You want unlimited rows for free and are comfortable installing software.",
    ],
    chooseUs: [
      "You can't install software on your work computer.",
      "You need the common fixes on a routine export without writing expressions.",
      "You want colleagues who aren't data specialists to be able to do the cleaning.",
    ],
    sections: [
      {
        heading: "Both keep data on your machine",
        body: "Neither tool uploads your file. OpenRefine runs a small server on your own computer and you use it through your browser; SpreadsheetFix runs entirely inside the browser tab. Either is a reasonable choice for sensitive data.",
      },
      {
        heading: "Power versus speed",
        body: "OpenRefine can do things SpreadsheetFix can't, such as clustering similar spellings, splitting multi-valued cells and reconciling names against Wikidata. SpreadsheetFix is quicker for the common jobs: trim, de-duplicate, fix dates, repair encoding, validate emails. Those take a few clicks with no expressions.",
      },
    ],
    faqs: [
      {
        q: "Is SpreadsheetFix an OpenRefine alternative?",
        a: "For routine CSV cleaning, yes. For exploratory work, fuzzy matching or custom transformations, OpenRefine is more capable.",
      },
      {
        q: "Does SpreadsheetFix do clustering like OpenRefine?",
        a: "No. Duplicates are matched exactly after spaces and, for emails, case are normalised.",
      },
      {
        q: "Do I need Java for SpreadsheetFix?",
        a: "No. It runs in any modern browser with nothing to install.",
      },
    ],
    tools: ["remove-duplicates-csv", "normalize-dates-csv", "fix-csv-encoding", "trim-whitespace-csv"],
  },
  {
    slug: "power-query",
    competitor: "Power Query",
    metaTitle: "SpreadsheetFix vs Power Query for Cleaning CSV Files",
    metaDescription:
      "Power Query builds repeatable data pipelines inside Excel and Power BI. SpreadsheetFix fixes a CSV in a few clicks. Compare the two for everyday cleaning.",
    h1: "SpreadsheetFix vs Power Query",
    intro:
      "Power Query, built into Excel and Power BI, records every transformation step so you can refresh a report when new data arrives. It's the right tool for repeatable pipelines. SpreadsheetFix is for fixing a file quickly when you don't want to build one.",
    rows: [
      { aspect: "Where it runs", us: "Any modern browser", them: "Excel (Windows, with fewer features on Mac) and Power BI" },
      { aspect: "Repeatable steps", us: "No; you choose rules for each file", them: "Recorded, refreshable query steps" },
      { aspect: "Learning curve", us: "Pick rules, preview, download", them: "Query editor; M language for advanced steps" },
      { aspect: "Trim", us: "Trims ends and collapses inner spaces", them: "Text.Trim trims ends only" },
      { aspect: "Duplicates", us: "Matched after normalising whitespace", them: "Remove Duplicates is exact and case-sensitive" },
      { aspect: "Mixed date formats in one column", us: "Detected per column", them: "One locale per column; mixed orders need custom steps" },
      { aspect: "Encoding", us: "Detected from the file's bytes", them: "Guessed on import; corrected by hand with File Origin" },
      { aspect: "Size", us: "500,000 rows on Pro", them: "Millions of rows" },
    ],
    chooseThem: [
      "The same report is refreshed from new data every week or month.",
      "You need to join several tables or load into the Data Model.",
      "The files are larger than 500,000 rows.",
    ],
    chooseUs: [
      "You need a clean file now, not a query to maintain.",
      "You're on a computer without Excel for Windows.",
      "You want to hand the job to someone who doesn't use Power Query.",
    ],
    sections: [
      {
        heading: "A pipeline versus a pass",
        body: "Power Query's strength is repeatability: once the steps are built, refreshing applies them to new data. That's worth the setup for recurring reports. For a one-off export, or for files that change shape each time, a single cleaning pass is faster.",
      },
      {
        heading: "They work well together",
        body: "Some teams clean awkward exports in SpreadsheetFix first, for example repairing garbled encoding or mixed date formats, and then load the cleaned file in Power Query, where the remaining steps are simpler.",
      },
    ],
    faqs: [
      {
        q: "Is Power Query available on Mac?",
        a: "Yes, in Microsoft 365 for Mac, but with fewer data sources and features than on Windows.",
      },
      {
        q: "Does Power Query's Remove Duplicates ignore case?",
        a: "No, it's case-sensitive by default. Lowercase or trim the column first, or clean the file in SpreadsheetFix before loading it.",
      },
    ],
    tools: ["normalize-dates-csv", "fix-csv-encoding", "remove-duplicates-csv", "clean-csv-headers"],
  },
];

export const COMPARISON_MAP = new Map(COMPARISONS.map((c) => [c.slug, c]));
