import type { RulePreset } from "@/store/sheetStore";
import { FREE_RULES, FREE_MAX_ROWS, PRO_MAX_ROWS, PRO_PRICE_MONTHLY } from "@/config/plans";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolPage {
  slug: string;
  /** Short label used in nav and cross-links */
  name: string;
  /** <title> — keep under ~60 chars */
  metaTitle: string;
  /** Meta description — keep under ~155 chars */
  metaDescription: string;
  h1: string;
  intro: string;
  /** "cleaner" opens the uploader with a rule preset; "merge" renders the multi-file merger */
  kind: "cleaner" | "merge";
  preset?: RulePreset;
  before: string;
  /** Must be exactly what the engine produces from `before` (checked in tools.test.ts) */
  after: string;
  /** What `after` shows: the cleaned file (default) or the rows flagged for review, with a reason column */
  afterView?: "cleaned" | "flagged";
  /** One line under the after sample, e.g. how many rows were removed */
  afterNote?: string;
  steps: string[];
  sections: { heading: string; body: string }[];
  faqs: ToolFaq[];
  related: string[];
  /** Problem guides (/guides/<slug>) that use this tool, linked from the page */
  guides?: string[];
  /** Last meaningful content change (YYYY-MM-DD), for the sitemap. Defaults to TOOLS_UPDATED. */
  updated?: string;
}

/** Sitemap date for tool pages without their own `updated`. Bump it when copy changes across all pages. */
export const TOOLS_UPDATED = "2026-10-20";

export const TOOLS: ToolPage[] = [
  {
    slug: "remove-duplicates-csv",
    name: "Remove Duplicates",
    metaTitle: "Remove Duplicates from CSV Online — Free & Private",
    metaDescription:
      "Delete duplicate rows from a CSV or Excel file in seconds. Exact or key-column matching, a preview of removals, and your data never leaves your browser.",
    h1: "Remove duplicate rows from a CSV",
    intro:
      "Drop a CSV or Excel file below and SpreadsheetFix finds every repeated row, shows you which ones it will remove, and gives you back a clean file. Matching runs entirely in your browser — nothing is uploaded.",
    kind: "cleaner",
    preset: { ruleIds: ["trimWhitespace", "deduplicateRows"] },
    before: `email,name,plan
ana@acme.io,Ana Ruiz,pro
ben@acme.io,Ben Ode,free
ana@acme.io,Ana Ruiz,pro
ana@acme.io ,Ana Ruiz ,pro`,
    after: `email,name,plan
ana@acme.io,Ana Ruiz,pro
ben@acme.io,Ben Ode,free`,
    afterNote: "2 duplicate rows removed: an exact copy, and one that only differed by trailing spaces.",
    steps: [
      "Upload your CSV, TSV or XLSX file (or try the demo data).",
      "SpreadsheetFix trims stray spaces first, so “ana@acme.io ” and “ana@acme.io” count as the same value.",
      "Review the rows marked as duplicates in the preview, then download the de-duplicated file.",
    ],
    sections: [
      {
        heading: "Exact rows or just the columns that matter",
        body: "By default a row is a duplicate when every cell matches another row. Use the column picker on the Remove Duplicates rule to compare only the columns you choose — say, email or order ID — which is useful for CRM exports where the same contact appears with different timestamps.",
      },
      {
        heading: "Why duplicates survive Excel’s Remove Duplicates",
        body: "Invisible trailing spaces, double spaces and inconsistent capitalisation make rows look identical to you but different to Excel. SpreadsheetFix normalises whitespace before comparing, which catches the near-duplicates that spreadsheet tools miss.",
      },
      {
        heading: "The first occurrence is always kept",
        body: "When SpreadsheetFix finds a repeat, it keeps the first row it saw and removes later copies, so your original ordering is preserved. Every removal is shown in the preview before you export, so you can check exactly what went.",
      },
    ],
    faqs: [
      {
        q: "How do I remove duplicates from a CSV without Excel?",
        a: `Open SpreadsheetFix, drop your CSV into the box above and download the cleaned file. There is nothing to install and no account is needed for files up to ${FREE_MAX_ROWS} rows.`,
      },
      {
        q: "Can I remove duplicates based on one column, like email?",
        a: "Yes. Open the column picker on the Remove Duplicates rule and select only the email column. Rows with the same email are treated as duplicates even if other columns differ.",
      },
      {
        q: "Which duplicate is kept?",
        a: "The first occurrence in the file is kept and later copies are removed. The preview shows every removed row before you export.",
      },
      {
        q: "Is my file uploaded to a server?",
        a: "No. The file is parsed and de-duplicated in your browser with JavaScript. Its contents are never sent to SpreadsheetFix.",
      },
      {
        q: "How large a file can I de-duplicate?",
        a: `The free plan processes up to ${FREE_MAX_ROWS} rows per file. Pro handles up to ${PRO_MAX_ROWS} rows.`,
      },
    ],
    related: ["trim-whitespace-csv", "validate-emails-csv", "remove-blank-rows-csv"],
    guides: ["duplicate-transactions-bank-csv", "excel-remove-duplicates-not-working"],
  },
  {
    slug: "normalize-dates-csv",
    name: "Normalize Dates",
    metaTitle: "Convert & Normalize Dates in a CSV to YYYY-MM-DD",
    metaDescription:
      "Fix mixed date formats in a CSV: 03/04/2024, 4 March 2024 and 2024-03-04 become one format. Detects US vs European order per column. Free, in-browser.",
    h1: "Normalize mixed date formats in a CSV",
    intro:
      "Exports from different systems mix 12/31/2024, 31.12.2024 and “December 31, 2024” in the same column. Upload your file and SpreadsheetFix converts every recognisable date to one consistent format, ready for databases, BI tools and imports.",
    kind: "cleaner",
    preset: { ruleIds: ["normalizeDate"], options: { normalizeDate: { targetFormat: "YYYY-MM-DD", dateOrder: "auto" } } },
    before: `order_id,ordered,shipped
1001,12/31/2024,Jan 2 2025
1002,03/04/2024,March 6 2024
1003,2024-05-01,5 May 2024`,
    after: `order_id,ordered,shipped
1001,2024-12-31,2025-01-02
1002,2024-03-04,2024-03-06
1003,2024-05-01,2024-05-05`,
    steps: [
      "Upload the CSV or Excel file containing your dates.",
      "SpreadsheetFix checks each column to work out whether it is month-first (US) or day-first (European).",
      "Every date is rewritten as YYYY-MM-DD, which Excel, Google Sheets and databases all read the same way, or as DD/MM/YYYY or MM/DD/YYYY if you pick one in the rule’s settings. Preview the changes and download.",
    ],
    sections: [
      {
        heading: "Is 03/04/2024 March or April?",
        body: "It depends on where the data came from. SpreadsheetFix looks at the whole column: if any value has a day above 12 in the first position (25/12/2024), the column is day-first; if it appears in the second position (12/25/2024), it is month-first. Each column is judged separately, so a US order date and a European delivery date in the same file both convert correctly. If a column gives no evidence either way, SpreadsheetFix reads it day-first, and you can set day-first or month-first yourself in the rule’s settings.",
      },
      {
        heading: "Formats SpreadsheetFix understands",
        body: "ISO dates (2024-03-04), slash, dash and dot separated dates (03/04/2024, 03-04-2024, 03.04.2024), and written months in English, full or abbreviated (March 4, 2024; 4 Mar 2024). Cells that aren’t dates are left untouched.",
      },
      {
        heading: "Why use YYYY-MM-DD",
        body: "ISO 8601 dates sort correctly as text, are unambiguous across countries, and are accepted by virtually every database, spreadsheet and import tool. It’s the safest default when you don’t know where a file is going next.",
      },
    ],
    faqs: [
      {
        q: "How do I change the date format in a CSV file?",
        a: "Upload the file above, choose your target format in the Normalize Dates rule, and download the result. Every recognisable date in the file is rewritten to that one format.",
      },
      {
        q: "Will it confuse US and European dates?",
        a: "SpreadsheetFix infers the order per column from values that can only be read one way, such as 25/12/2024. If a column is entirely ambiguous, you can set US (MM/DD) or European (DD/MM) order explicitly.",
      },
      {
        q: "Why does Excel change my CSV dates?",
        a: "Excel guesses date formats from your computer’s regional settings when it opens a CSV, which can silently swap day and month. Normalising to YYYY-MM-DD before opening the file avoids that guesswork.",
      },
      {
        q: "Are non-date values affected?",
        a: "No. Only cells that parse as valid dates are changed, and every change is shown in the preview before you export.",
      },
      {
        q: "Is date normalization free?",
        a: `Yes, for files up to ${FREE_MAX_ROWS} rows. Pro raises the limit to ${PRO_MAX_ROWS} rows and adds Excel export.`,
      },
    ],
    related: ["convert-comma-decimal-csv", "csv-to-excel-cleaner", "clean-csv-headers"],
    guides: ["stop-excel-changing-dates-in-csv"],
    updated: "2026-10-23",
  },
  {
    slug: "validate-emails-csv",
    name: "Validate Emails",
    metaTitle: "Validate Email Addresses in a CSV — Free Email List Cleaner",
    metaDescription:
      "Find invalid email addresses in a CSV before you import it. Lowercases and trims emails, flags bad formats. Private: runs in your browser.",
    h1: "Validate and clean email addresses in a CSV",
    intro:
      "Before you import a list into your CRM or email platform, upload it here. SpreadsheetFix trims and lowercases every address, then flags rows with malformed emails and lists them in a separate quarantine file, so you can fix them before they pollute your import.",
    kind: "cleaner",
    preset: { ruleIds: ["trimWhitespace", "normalizeEmail", "validateEmail", "deduplicateRows"] },
    before: `email,first_name
  Sam@Example.COM ,Sam
lee@example,Lee
kim@example.org,Kim
sam@example.com,Sam`,
    after: `email,first_name
sam@example.com,Sam
lee@example,Lee
kim@example.org,Kim`,
    afterNote: "lee@example is flagged for review (no domain suffix) and listed in a separate quarantine file. 1 duplicate removed.",
    steps: [
      "Upload the contact list as CSV or Excel. SpreadsheetFix detects email columns automatically.",
      "Addresses are trimmed and lowercased so duplicates match, then checked for a valid format.",
      "Rows with invalid emails are flagged for review; download the cleaned list and, separately, the flagged rows.",
    ],
    sections: [
      {
        heading: "What counts as invalid",
        body: "SpreadsheetFix checks syntax: a local part, a single @, a domain and a top-level domain of at least two letters. That catches typos like “lee@example”, “ana.gmail.com” and stray characters from copy-paste. It does not contact mail servers, so it won’t tell you whether a mailbox exists — that also means no address ever leaves your machine.",
      },
      {
        heading: "Quarantine instead of delete",
        body: "Invalid rows aren’t silently thrown away. They stay in the file and are also listed in a quarantine download, so you can fix a typo and keep the contact, or confirm the row should go.",
      },
      {
        heading: "Lowercase first, then de-duplicate",
        body: "“Sam@Example.COM” and “sam@example.com” are the same inbox. Normalising case before de-duplication stops the same person being imported twice and receiving every campaign twice.",
      },
    ],
    faqs: [
      {
        q: "How do I check if emails in a CSV are valid?",
        a: "Upload the CSV above. SpreadsheetFix flags every address with an invalid format and lists those rows in a quarantine file you can review and download separately.",
      },
      {
        q: "Does SpreadsheetFix verify that the mailbox exists?",
        a: "No. It validates format only and never contacts mail servers, which keeps your list private. Use it to remove malformed addresses before running a deliverability check.",
      },
      {
        q: "Will it remove duplicate emails?",
        a: "Yes. Emails are trimmed and lowercased first, then duplicate rows are removed, so differently-capitalised copies of the same address are caught.",
      },
      {
        q: "Is it safe to upload customer emails?",
        a: "Your file is never uploaded. All checks run in your browser, which makes SpreadsheetFix suitable for GDPR-sensitive contact lists.",
      },
      {
        q: "How many emails can I validate for free?",
        a: `Up to ${FREE_MAX_ROWS} rows per file on the free plan, or ${PRO_MAX_ROWS} rows with Pro.`,
      },
    ],
    related: ["remove-duplicates-csv", "format-phone-numbers-csv", "find-missing-values-csv"],
    updated: "2026-10-22",
  },
  {
    slug: "trim-whitespace-csv",
    name: "Trim Whitespace",
    metaTitle: "Trim Whitespace in CSV — Remove Extra Spaces Online",
    metaDescription:
      "Remove leading, trailing and double spaces from every cell in a CSV or Excel file, and drop blank rows. Free, instant and private — nothing is uploaded.",
    h1: "Trim whitespace and extra spaces in a CSV",
    intro:
      "Leading spaces, trailing spaces and doubled spaces break lookups, joins and duplicate checks without being visible. Upload a file and SpreadsheetFix strips them from every cell and removes fully blank rows.",
    kind: "cleaner",
    preset: { ruleIds: ["trimWhitespace", "removeEmptyRows"] },
    before: `sku,product,colour
"  A-100","Desk  Lamp ","black"
,,
"A-101 ","Floor Lamp","  white"`,
    after: `sku,product,colour
A-100,Desk Lamp,black
A-101,Floor Lamp,white`,
    steps: [
      "Upload your CSV, TSV or Excel file.",
      "SpreadsheetFix trims both ends of every text cell, collapses repeated spaces to one, and removes rows that are completely empty.",
      "Check the highlighted changes in the preview and download.",
    ],
    sections: [
      {
        heading: "The bug you can’t see",
        body: "“A-100 ” and “A-100” look the same on screen, but a VLOOKUP, SQL join or import matcher treats them as different values. Trailing spaces are one of the most common reasons a lookup returns #N/A on data that “definitely matches”.",
      },
      {
        heading: "Tabs and line breaks too",
        body: "Whitespace trimming also handles tabs and stray line breaks inside cells — the usual leftovers from copying out of web pages, PDFs and email.",
      },
      {
        heading: "Only the columns you choose",
        body: "Trimming applies to every column by default. If a column needs its spacing preserved — fixed-width codes, for example — restrict the rule to specific columns in its settings.",
      },
    ],
    faqs: [
      {
        q: "How do I remove spaces from a CSV file?",
        a: "Upload it above. SpreadsheetFix trims leading and trailing spaces in every cell and collapses repeated spaces, then lets you download the cleaned file.",
      },
      {
        q: "Does it remove spaces inside words?",
        a: "No. Single spaces between words are kept. Only spaces at the start and end of a cell are removed, and runs of multiple spaces are collapsed to one.",
      },
      {
        q: "Is this the same as Excel’s TRIM function?",
        a: "It does the same job across the whole file at once, without writing formulas or helper columns, and also removes completely empty rows.",
      },
      {
        q: "Will blank rows be removed?",
        a: "Yes, rows where every cell is empty are removed. Rows that are only partly empty are kept.",
      },
    ],
    related: ["remove-blank-rows-csv", "remove-html-tags-csv", "remove-duplicates-csv"],
    guides: ["vlookup-na-hidden-spaces"],
  },
  {
    slug: "merge-csv-files",
    name: "Merge CSV Files",
    metaTitle: "Merge CSV Files Online — Combine Multiple CSVs Into One",
    metaDescription:
      "Combine multiple CSV files into one, even when columns are in a different order. Optional duplicate removal. Free, private and runs in your browser.",
    h1: "Merge multiple CSV files into one",
    intro:
      "Select two or more CSV files and SpreadsheetFix stacks them into a single file. Columns are matched by header name, so files with different column orders — or a few extra columns — combine correctly.",
    kind: "merge",
    before: `jan.csv:  email,name
          ana@acme.io,Ana
feb.csv:  name,email,city
          Ben,ben@acme.io,Lyon`,
    after: `email,name,city
ana@acme.io,Ana,
ben@acme.io,Ben,Lyon`,
    steps: [
      "Choose or drop all the CSV files you want to combine.",
      "SpreadsheetFix lines up columns by header name and adds any column that appears in only some files.",
      "Optionally remove duplicate rows across files, then download the merged CSV or keep cleaning it.",
    ],
    sections: [
      {
        heading: "Columns are matched by name, not position",
        body: "Copy-pasting files together breaks as soon as one export has its columns in a different order. SpreadsheetFix reads each file’s header row and places every value under the right column. Headers are compared ignoring case and surrounding spaces, so “Email ”, “email” and “EMAIL” line up.",
      },
      {
        heading: "Files with different columns",
        body: "If one file has a column the others don’t, it’s added to the merged file and left blank for rows from the other files. Nothing is dropped.",
      },
      {
        heading: "Merge, then clean",
        body: "Monthly exports often overlap. Tick “remove duplicate rows” to de-duplicate across all files while merging, or send the merged file straight into the full SpreadsheetFix cleaner to fix dates, emails and spacing.",
      },
    ],
    faqs: [
      {
        q: "How do I combine multiple CSV files into one?",
        a: "Select all the files in the box above and click Merge. SpreadsheetFix matches columns by header name and gives you a single CSV to download.",
      },
      {
        q: "What if my CSV files have different columns?",
        a: "Every column from every file is included. Rows from files that lack a column get an empty value in it.",
      },
      {
        q: "Can I remove duplicates while merging?",
        a: "Yes. Enable the remove-duplicates option to drop rows that appear in more than one file.",
      },
      {
        q: "How many files can I merge?",
        a: `As many as you like. On the free plan the merged result can contain up to ${FREE_MAX_ROWS} rows; Pro allows up to ${PRO_MAX_ROWS}.`,
      },
      {
        q: "Are my files uploaded?",
        a: "No. Files are read and merged in your browser. Nothing is sent to a server.",
      },
    ],
    related: ["remove-duplicates-csv", "clean-csv-headers", "csv-to-excel-cleaner"],
  },
  {
    slug: "csv-to-excel-cleaner",
    name: "CSV to Excel Cleaner",
    metaTitle: "Clean a CSV and Convert It to Excel (XLSX)",
    metaDescription:
      "Clean up a messy CSV — duplicates, blank rows, spacing, headers, dates — and save it as an Excel-ready file. Private, in-browser CSV to XLSX cleaner.",
    h1: "Clean a CSV and get an Excel-ready file",
    intro:
      "Opening a raw export in Excel usually means mangled dates, blank rows and columns full of stray spaces. Upload the CSV here, let SpreadsheetFix fix it, and download a tidy file that opens cleanly in Excel.",
    kind: "cleaner",
    preset: {
      ruleIds: ["fixEncoding", "trimWhitespace", "removeEmptyRows", "removeEmptyColumns", "normalizeHeaders", "deduplicateRows", "normalizeDate"],
      options: { normalizeDate: { targetFormat: "YYYY-MM-DD", dateOrder: "auto" } },
    },
    before: `Customer Name ,Signup Date,Notes,
José Díaz,03/14/2024,,
,,,
Mia Chen ,2024-02-01,,`,
    after: `customer_name,signup_date
José Díaz,2024-03-14
Mia Chen,2024-02-01`,
    steps: [
      "Upload the CSV you’d normally open in Excel.",
      "SpreadsheetFix repairs garbled characters, trims spaces, tidies headers, normalises dates and removes blank rows and empty columns.",
      "Download a clean CSV that opens correctly in Excel — or, on Pro, a native .xlsx workbook.",
    ],
    sections: [
      {
        heading: "Why Excel mangles CSV files",
        body: "Excel guesses each column’s type when it opens a CSV. It reads dates using your regional settings, drops leading zeros from codes, and can show accented characters as “Ã©” if the file’s encoding isn’t what it expects. Cleaning the data before it reaches Excel removes most of those surprises.",
      },
      {
        heading: "Free clean CSV, or native XLSX on Pro",
        body: "Free users download a cleaned CSV that opens directly in Excel. Pro adds one-click .xlsx export, so the file arrives as a real workbook, with no import wizard and no type guessing.",
      },
      {
        heading: "Tidy headers for pivot tables",
        body: "Header normalisation turns “Customer Name ” into customer_name, so pivot tables, Power Query and formulas reference clean, predictable column names.",
      },
    ],
    faqs: [
      {
        q: "How do I convert a CSV to Excel without breaking the dates?",
        a: "Normalise the dates to YYYY-MM-DD first — SpreadsheetFix does this automatically — and Excel will read them consistently regardless of regional settings. Pro users can export straight to .xlsx.",
      },
      {
        q: "Is XLSX export free?",
        a: `Cleaning and CSV download are free for files up to ${FREE_MAX_ROWS} rows. Native .xlsx export is part of Pro (${PRO_PRICE_MONTHLY}/month).`,
      },
      {
        q: "Why do accented characters look wrong when I open a CSV in Excel?",
        a: "Excel may read a UTF-8 file as a legacy encoding. SpreadsheetFix repairs characters that are already garbled, and its CSV export is UTF-8 so Excel can display accents correctly.",
      },
      {
        q: "Can I upload an Excel file instead?",
        a: "Yes. SpreadsheetFix accepts .xlsx and .xls as well as CSV and TSV.",
      },
    ],
    related: ["normalize-dates-csv", "convert-comma-decimal-csv", "fix-csv-encoding"],
    guides: ["csv-vs-xlsx"],
  },
  {
    slug: "fix-csv-encoding",
    name: "Fix CSV Encoding",
    metaTitle: "Fix CSV Encoding — Repair Ã© and â€™ Characters Online",
    metaDescription:
      "Repair garbled characters like Ã©, â€™ and Ã¼ in a CSV and convert Windows-1252 files to UTF-8. Free, private, runs entirely in your browser.",
    h1: "Fix garbled characters and CSV encoding",
    intro:
      "Seeing “CafÃ©” instead of “Café”, or “donâ€™t” instead of “don’t”? The file was saved in one encoding and opened in another. Upload it here: SpreadsheetFix detects the file’s encoding, repairs the garbled text, and gives you back clean UTF-8.",
    kind: "cleaner",
    preset: { ruleIds: ["fixEncoding"] },
    before: `name,city,note
JosÃ© Ã–zil,MÃ¼nchen,donâ€™t call
ZoÃ« Smith,ZÃ¼rich,â‚¬50 credit`,
    after: `name,city,note
José Özil,München,don’t call
Zoë Smith,Zürich,€50 credit`,
    steps: [
      "Upload the CSV. SpreadsheetFix reads the raw bytes and detects UTF-8, UTF-8 with BOM, UTF-16 or Windows-1252.",
      "Cells containing mojibake — text that was double-decoded — are repaired back to the original characters, including files that were mis-saved twice.",
      "Download the result as UTF-8, the encoding every modern tool expects.",
    ],
    sections: [
      {
        heading: "What causes “Ã©” in a CSV",
        body: "The character é takes two bytes in UTF-8. When software reads those bytes as Windows-1252 or Latin-1, each byte becomes its own character, and é turns into Ã©. If that broken text is saved and opened the same wrong way again, it gets worse: Ã©. SpreadsheetFix reverses this process exactly instead of guessing with find-and-replace.",
      },
      {
        heading: "Two different problems, both handled",
        body: "Sometimes the file itself is in an old encoding such as Windows-1252, which is common for exports from older Windows software. SpreadsheetFix detects that from the bytes and decodes it correctly. Other times the text inside the file is already garbled; the Fix Encoding rule repairs those cells. Text that is already correct is never changed.",
      },
      {
        heading: "Safe by design",
        body: "A cell is only changed when the repair is a perfect round-trip: the garbled text must be exactly what UTF-8 looks like when misread. Genuine accented words like “Zürich” or “naïve” are left as they are.",
      },
    ],
    faqs: [
      {
        q: "How do I fix encoding in a CSV file?",
        a: "Upload it above. SpreadsheetFix detects the encoding automatically, repairs garbled characters, and lets you download a clean UTF-8 CSV.",
      },
      {
        q: "How do I convert a CSV from ANSI / Windows-1252 to UTF-8?",
        a: "Upload the file. If its bytes aren’t valid UTF-8, SpreadsheetFix decodes it as Windows-1252, and every download is UTF-8.",
      },
      {
        q: "Why does my CSV show Ã© instead of é?",
        a: "The file was written as UTF-8 but read as Windows-1252 or Latin-1 somewhere along the way. SpreadsheetFix’s Fix Encoding rule reverses that misreading.",
      },
      {
        q: "Will it change text that is already correct?",
        a: "No. A cell is only modified when it matches the exact pattern of misdecoded UTF-8, and every change is shown in the preview before you export.",
      },
      {
        q: "Is encoding repair free?",
        a: `Yes, for files up to ${FREE_MAX_ROWS} rows. Pro supports files up to ${PRO_MAX_ROWS} rows.`,
      },
    ],
    related: ["remove-html-tags-csv", "csv-to-excel-cleaner", "trim-whitespace-csv"],
    guides: ["fix-garbled-characters-in-csv"],
  },
  {
    slug: "format-phone-numbers-csv",
    name: "Format Phone Numbers",
    metaTitle: "Format Phone Numbers in a CSV to E.164 (+14155550132)",
    metaDescription:
      "Turn (415) 555-0132, 415.555.0198 and 0044 numbers into one +E.164 format and flag cells that aren’t phone numbers. Runs in your browser, no upload.",
    h1: "Format phone numbers in a CSV",
    intro:
      "Contact exports mix (415) 555-0132, 415.555.0198 and +44 20 7946 0958 in the same column, which trips up SMS tools, dialers and CRM matching. Upload the file and SpreadsheetFix rewrites each number in E.164 form (a plus sign, the country code and the digits, nothing else) and flags cells that can’t be a phone number. It all runs in your browser. Normalize Phone and Validate Phone are Pro rules.",
    kind: "cleaner",
    preset: { ruleIds: ["normalizePhone", "validatePhone"] },
    before: `name,phone
Ana Ruiz,(415) 555-0132
Ben Ode,415.555.0198
Cara Lin,+44 20 7946 0958
Dev Rao,0044 161 496 0753
Eli Park,ask reception`,
    after: `name,phone
Ana Ruiz,+14155550132
Ben Ode,+14155550198
Cara Lin,+442079460958
Dev Rao,+441614960753
Eli Park,ask reception`,
    afterNote: "1 row flagged for review: “ask reception” isn’t a phone number. It stays in the file and is listed in a separate quarantine download.",
    steps: [
      "Upload your contact list as CSV or Excel. With Pro, Normalize Phone and Validate Phone are switched on for you.",
      "Open the column picker on Normalize Phone and tick only your phone columns, so order numbers, dates and other long digit strings are left alone.",
      "Run the rules, check the rewritten numbers and flagged rows in the preview, then download.",
    ],
    sections: [
      {
        heading: "What E.164 looks like",
        body: "E.164 is the international standard for writing phone numbers: a +, the country code, then the national number with no spaces, dashes or brackets. It’s +14155550132 rather than (415) 555-0132. Twilio, most SMS and calling platforms and many CRMs expect it, and because each number has exactly one spelling, duplicate contacts become easy to spot. SpreadsheetFix removes every character except digits and a leading +, turns a 00 international prefix into +, and leaves numbers that already start with + otherwise as they are.",
      },
      {
        heading: "Numbers without a country code are treated as US or Canadian",
        body: "A number like 415.555.0198 doesn’t say which country it belongs to, so SpreadsheetFix assumes +1, the North American code, and drops any leading zeros before adding it. That is right for US and Canadian lists but wrong for local numbers from elsewhere: a UK number written 020 7946 0958 would become +12079460958. If your file has numbers from other countries, make sure they include their country code (+44… or 0044…) before cleaning. Those convert correctly.",
      },
      {
        heading: "Pick the phone column first",
        body: "Normalize Phone rewrites any cell with seven or more digits in the columns it is given. Left on all columns, it would also turn an order number like 1002345 into +11002345, or a date like 2024-03-04 into +120240304. Open the column picker on the rule and select only your phone columns. Validate Phone already limits itself to columns whose header contains phone, tel, mobile, cell or fax.",
      },
      {
        heading: "What gets flagged",
        body: "After formatting, Validate Phone checks each phone cell: an optional + followed by 7 to 20 characters made only of digits, spaces, dashes, dots and brackets. Cells containing words, like “ask reception” or “n/a”, fail, and the row is flagged. Flagged rows stay in the cleaned file and are also listed in a quarantine file you can download, so you can fix them by hand.",
      },
    ],
    faqs: [
      {
        q: "How do I format phone numbers in a CSV file?",
        a: "Upload the file above, limit Normalize Phone to your phone column with the column picker, and run it. Every number becomes a + and country code followed by digits, and you download the cleaned CSV. Both phone rules are part of Pro.",
      },
      {
        q: "What happens to phone extensions?",
        a: "Extensions aren’t recognised. Their digits are appended to the number, so 415-555-0101 ext. 12 becomes +1415555010112. Move extensions into their own column before cleaning.",
      },
      {
        q: "Can I format numbers for a country other than the US?",
        a: "Numbers that already include a country code, written as +44 or 0044, are converted correctly for any country. Numbers without one are assumed to be +1 (US and Canada), and there’s currently no setting to change that default.",
      },
      {
        q: "Does it check that a number is real?",
        a: "No. It checks that the cell looks like a phone number, not that the number exists or has the right length for its country. Nothing is looked up online, so your contacts never leave your browser.",
      },
      {
        q: "Is phone formatting free?",
        a: `No. Normalize Phone and Validate Phone are Pro rules (${PRO_PRICE_MONTHLY}/month). On the free plan you can still upload a file, and the health report counts the invalid phone numbers it finds.`,
      },
    ],
    related: ["validate-emails-csv", "proper-case-csv", "find-missing-values-csv"],
  },
  {
    slug: "convert-comma-decimal-csv",
    name: "Convert Comma Decimals",
    metaTitle: "Convert European Numbers in a CSV: 1.234,56 → 1234.56",
    metaDescription:
      "Change comma decimals and European formats like €1.234,56 to 1234.56 so Excel, databases and accounting imports read them as numbers. Runs in your browser.",
    h1: "Convert comma decimals and European number formats in a CSV",
    intro:
      "A bank or ERP export from Germany, France or Spain writes one thousand two hundred and thirty-four euros fifty as 1.234,50, and an English-locale spreadsheet, database or accounting import reads that as text, or worse, as 1.2345. Upload the file and SpreadsheetFix converts amounts to plain dot-decimal numbers, removing currency symbols and thousands separators on the way. It runs in your browser without uploading anything. Normalize Numbers is a Pro rule.",
    kind: "cleaner",
    preset: { ruleIds: ["normalizeNumbers"] },
    before: `date,payee,amount,balance
2024-03-01,Stripe payout,"1.234,50","€12.480,75"
2024-03-02,Office rent,"-850,00","€11.630,75"
2024-03-04,Card refund,"1 299,00","€12.929,75"
2024-03-05,US client,"$1,050.00","€13.979,75"`,
    after: `date,payee,amount,balance
2024-03-01,Stripe payout,1234.50,12480.75
2024-03-02,Office rent,-850.00,11630.75
2024-03-04,Card refund,1299.00,12929.75
2024-03-05,US client,1050.00,13979.75`,
    steps: [
      "Upload the CSV or Excel export. With Pro, Normalize Numbers is switched on for you.",
      "If the file has other numeric columns, such as phone numbers or reference codes, use the column picker to limit the rule to your amount columns.",
      "Check the converted values in the preview and download a file that sums correctly.",
    ],
    sections: [
      {
        heading: "How each value is read",
        body: "SpreadsheetFix looks at the separators in each cell. When a dot is followed by three digits and the cell also has a comma (1.234,50 or 1.234.567,89), the dots are thousands separators and the comma is the decimal point. When commas group digits in threes before an optional dot decimal (1,050.00), the commas are dropped. A single comma with no dot, as in 89,90 or -850,00, is read as the decimal point. Spaces between digit groups, the French and Nordic style 1 299,00, are removed first.",
      },
      {
        heading: "Currency symbols are stripped",
        body: "The symbols €, $, £, ¥, ₹, ₽, ₩ and ₪ are removed, so “€12.480,75” becomes 12480.75 and adds up in a SUM or pivot table. Currency codes written as letters, such as EUR or USD, are not removed, and a cell that still isn’t a valid number after cleaning (“12,50 EUR”, “n/a”) is left exactly as it was.",
      },
      {
        heading: "The one value it can’t tell apart",
        body: "On its own, 1,234 could mean one thousand two hundred and thirty-four (US) or one point two three four (European). SpreadsheetFix reads a comma followed by exactly three digits as a thousands separator, so it becomes 1234. Likewise, 1.234 with no comma is left as it is, which dot-decimal software reads as 1.234. If your file has three-decimal values such as exchange rates, fuel prices or weights in kilograms, check those columns in the preview.",
      },
    ],
    faqs: [
      {
        q: "How do I change comma decimals to dots in a CSV?",
        a: "Upload the file above and run Normalize Numbers. Values like 89,90 and 1.234,50 become 89.90 and 1234.50, and you download a CSV that English-locale tools read as numbers. The rule is part of Pro.",
      },
      {
        q: "Why does Excel show my European numbers as text?",
        a: "When your computer uses a dot as the decimal separator, Excel can’t read 1.234,50 as a number, so it keeps it as text and leaves it out of SUM and pivot tables. Converting the file to dot decimals first saves you from changing your system’s regional settings.",
      },
      {
        q: "Will it change dates, phone numbers or IDs?",
        a: "Dates like 2024-03-01 or 03.04.2024 aren’t valid numbers, so they’re left alone. Values that are numeric once spaces are removed do change: a phone number written +44 20 7946 0958 loses its spaces. Limit the rule to your amount columns if the file has other numeric columns.",
      },
      {
        q: "Can I convert dots to commas instead?",
        a: "Not from this page. It converts to dot decimals, which is what most databases, accounting imports and APIs expect, and the app doesn’t currently offer a switch for comma output.",
      },
      {
        q: "Is my bank export uploaded?",
        a: "No. The file is read and converted in your browser, so amounts, payees and balances never reach SpreadsheetFix’s servers.",
      },
    ],
    related: ["normalize-dates-csv", "csv-to-excel-cleaner", "find-missing-values-csv"],
    guides: ["excel-european-number-format"],
  },
  {
    slug: "proper-case-csv",
    name: "Proper Case Text",
    metaTitle: "Convert CSV Text to Proper Case (Title Case) Online",
    metaDescription:
      "Fix names, cities and product titles typed in ALL CAPS or all lowercase. SpreadsheetFix converts chosen columns to Title Case in your browser, no upload.",
    h1: "Convert CSV text to proper case",
    intro:
      "Sign-up forms and older systems leave you with ANA RUIZ, ben ode and sAN fRANCISCO in the same list, which looks careless in a mail merge, on a shipping label or on an invoice. Upload the file and SpreadsheetFix gives every word a capital first letter and lower-cases the rest, in the columns you choose. It runs in your browser without uploading your list. Normalize Case is a Pro rule.",
    kind: "cleaner",
    preset: { ruleIds: ["normalizeCase"], options: { normalizeCase: { caseType: "title" } } },
    before: `first_name,last_name,city
ANA,RUIZ,SAN FRANCISCO
ben,ode,new york
émile,zola,PARIS
cARA,lIN,los angeles`,
    after: `first_name,last_name,city
Ana,Ruiz,San Francisco
Ben,Ode,New York
Émile,Zola,Paris
Cara,Lin,Los Angeles`,
    steps: [
      "Upload the CSV or Excel file. With Pro, Normalize Case opens already set to Title Case.",
      "Use the column picker to choose the columns to convert (names, cities, product titles) and leave out emails, codes and IDs.",
      "Preview every changed cell, then download.",
    ],
    sections: [
      {
        heading: "What Title Case does here",
        body: "Each word, meaning a run of characters that starts with a letter or digit and ends at the next space, gets an upper-case first letter and the rest in lower case. “SAN FRANCISCO” becomes San Francisco, and accented letters work too, so “émile” becomes Émile. Punctuation inside a word doesn’t start a new word, so JEAN-LUC becomes Jean-luc and O’NEIL becomes O’neil.",
      },
      {
        heading: "Choose columns before you run it",
        body: "With no columns selected, Normalize Case changes every text column in the file. That would turn ana@acme.io into Ana@acme.io and an invoice number like INV-101 into Inv-101. Open the column picker on the rule and tick only the columns that hold names or titles; everything else is left exactly as it was.",
      },
      {
        heading: "Names that need a second look",
        body: "Title Case is a rule, not a dictionary. It can’t know that McDonald has a second capital, that van der Berg is often written with lower-case particles, or that IBM should stay in capitals; those come out as Mcdonald, Van Der Berg and Ibm. It gets the bulk of a list right in one pass, and the preview highlights every changed cell so you can spot the few names worth fixing by hand.",
      },
    ],
    faqs: [
      {
        q: "How do I change text to proper case in a CSV?",
        a: "Upload the file, pick the name or title columns in the Normalize Case column picker, and run it. Every word in those columns starts with a capital and the rest is lower case. This needs Pro.",
      },
      {
        q: "Is this the same as Excel’s PROPER function?",
        a: "It does a similar job across whole columns at once, without a helper column or a formula to fill down. One difference: PROPER capitalises after any non-letter, giving Jean-Luc and O’Neil, while SpreadsheetFix only starts a new word after a space, giving Jean-luc and O’neil.",
      },
      {
        q: "Will it change numbers or dates?",
        a: "Digits have no case, so values like 2024-03-01 or 1299.00 come out the same. Codes that mix letters and digits, such as AB-100X, do change, which is another reason to choose your columns first.",
      },
      {
        q: "Is my customer list uploaded?",
        a: "No. The conversion runs in your browser with JavaScript, and names and addresses never leave your computer.",
      },
      {
        q: "Is proper-case conversion free?",
        a: `No. Normalize Case is a Pro rule (${PRO_PRICE_MONTHLY}/month). Pro also raises the row limit from ${FREE_MAX_ROWS} to ${PRO_MAX_ROWS} rows per file.`,
      },
    ],
    related: ["trim-whitespace-csv", "format-phone-numbers-csv", "clean-csv-headers"],
  },
  {
    slug: "remove-blank-rows-csv",
    name: "Remove Blank Rows",
    metaTitle: "Remove Blank Rows and Empty Columns from a CSV — Free",
    metaDescription:
      "Delete empty rows and columns from a CSV or Excel file, including rows that only hold spaces or commas. Free, instant and runs in your browser, no upload.",
    h1: "Remove blank rows and empty columns from a CSV",
    intro:
      "Exports pick up blank lines between sections, rows of bare commas, and columns that have a header but nothing underneath. They inflate row counts, break formulas that look for the last row and trip up imports that expect every row to hold data. Upload the file and SpreadsheetFix drops every fully empty row and column, free and without uploading anything.",
    kind: "cleaner",
    preset: { ruleIds: ["removeEmptyRows", "removeEmptyColumns"] },
    before: `date,description,amount,notes,
2024-03-01,Stripe payout,1200.00,,
,,,,
2024-03-02,Office rent,-850.00,,
"   ",,,,

2024-03-04,Card refund,45.90,,`,
    after: `date,description,amount
2024-03-01,Stripe payout,1200.00
2024-03-02,Office rent,-850.00
2024-03-04,Card refund,45.90`,
    afterNote: "The 3 blank lines are dropped as the file is read. The notes column and an unnamed column created by the trailing comma are removed because no row has a value in them.",
    steps: [
      "Upload your CSV, TSV or Excel file.",
      "SpreadsheetFix removes rows where every cell is empty or only whitespace, and columns where no row has a value, including unnamed columns left by trailing commas.",
      "Check the result in the preview, then download the compacted file.",
    ],
    sections: [
      {
        heading: "What counts as empty",
        body: "A row is removed only when every cell in it is blank or holds nothing but spaces or tabs. A row with a single value, such as a lone date or a stray “x”, is kept because it may still matter. Columns get the same test: a column is dropped only when no row has a value in it, even if it has a header.",
      },
      {
        heading: "Where blank rows and columns come from",
        body: "Accounting and banking exports often insert empty lines between sections or after a totals block. Excel can save trailing commas when cells beyond your data were once edited or formatted, which creates unnamed columns, and clearing rows instead of deleting them leaves rows of empty cells behind. You don’t see any of this in a spreadsheet grid, but it shows up as phantom rows and Column1, Column2 fields in imports and Power Query.",
      },
      {
        heading: "Partly empty rows are a different problem",
        body: "A row that is missing one important value, such as an invoice with no amount or a contact with no email, isn’t blank, so it stays. To catch those, use Find Missing Values, which flags rows with gaps in the columns you say are required.",
      },
      {
        heading: "Why blank rows break things",
        body: "Excel treats a blank row as the edge of a table, so sorting, filters and pivot tables can silently stop at it. Import tools often reject the file or create empty records. Removing them before the file goes anywhere avoids both problems.",
      },
    ],
    faqs: [
      {
        q: "How do I delete blank rows in a CSV file?",
        a: "Drop the file into the box above. Fully empty rows and empty columns are removed automatically, and you download the cleaned CSV. There are no formulas, filters or sorting involved.",
      },
      {
        q: "Will it delete rows that are only partly empty?",
        a: "No. A row is only removed when every cell is blank. Rows with at least one value stay exactly as they are.",
      },
      {
        q: "Does it remove empty columns that have a header?",
        a: "Yes. If a column has a header but no values in any row, it’s removed. Columns with even one value are kept.",
      },
      {
        q: "Is this quicker than filtering for blanks in Excel?",
        a: "In Excel you filter for blanks, select the visible rows and delete them, then deal with empty columns separately, and a cell holding a single space doesn’t count as blank there. Here it’s one step, and whitespace-only cells count as empty.",
      },
      {
        q: "Is it free?",
        a: `Yes. Removing blank rows and empty columns is free for files up to ${FREE_MAX_ROWS} rows, with no account. Pro raises the limit to ${PRO_MAX_ROWS} rows.`,
      },
    ],
    related: ["trim-whitespace-csv", "remove-duplicates-csv", "find-missing-values-csv"],
    updated: "2026-10-22",
  },
  {
    slug: "remove-html-tags-csv",
    name: "Remove HTML Tags",
    metaTitle: "Remove HTML Tags from a CSV — Strip HTML Online",
    metaDescription:
      "Strip <p>, <br>, <b> and other HTML tags from product descriptions and CMS exports, leaving plain text. Runs in your browser; your file isn’t uploaded.",
    h1: "Remove HTML tags from a CSV",
    intro:
      "Shopify, WooCommerce and most CMS exports store descriptions as HTML, so a CSV meant for a marketplace feed, a spreadsheet review or a translator arrives full of <p>, <br/> and <span class=…>. Upload it and SpreadsheetFix strips the tags and keeps the text, entirely in your browser. Strip HTML is a Pro rule.",
    kind: "cleaner",
    preset: { ruleIds: ["stripHtml", "trimWhitespace"] },
    before: `sku,title,description
A-100,<b>Desk Lamp</b>,"<p>Adjustable arm, <em>warm</em> LED.</p>"
A-101,Floor Lamp,"<p>Linen shade,<br/> oak base.</p>"
A-102,"<span class=""new"">Wall Light</span>",Brass finish and matte glass`,
    after: `sku,title,description
A-100,Desk Lamp,"Adjustable arm, warm LED."
A-101,Floor Lamp,"Linen shade, oak base."
A-102,Wall Light,Brass finish and matte glass`,
    steps: [
      "Upload the product or content export as CSV or Excel. With Pro, Strip HTML is switched on for you.",
      "If some columns should keep their markup, use the column picker to apply Strip HTML only to the description fields.",
      "Preview the plain-text result and download it.",
    ],
    sections: [
      {
        heading: "What gets removed",
        body: "Anything from a < to the next > is treated as a tag and removed: opening and closing tags, self-closing tags like <br/>, and tags with attributes such as <span class=\"new\">. The text between the tags is kept, and spaces at the start and end of each cell are trimmed, so “<p>Linen shade,<br/> oak base.</p>” becomes “Linen shade, oak base.”",
      },
      {
        heading: "What it doesn’t do",
        body: "HTML entities aren’t decoded, so &amp; and &nbsp; stay as written. Tags are removed rather than replaced with spaces, so <p>One.</p><p>Two.</p> becomes One.Two. with nothing in between. And a literal less-than sign followed later by a greater-than sign, as in “size < 10 and > 5”, is also read as a tag. Check descriptions like these in the preview before you export.",
      },
      {
        heading: "Limit it to the HTML columns",
        body: "By default every text column is cleaned. If a column should keep its angle brackets, such as code snippets or email templates you want to keep as HTML, use the column picker to apply Strip HTML only to the fields that need it.",
      },
    ],
    faqs: [
      {
        q: "How do I remove HTML tags from a CSV file?",
        a: "Upload the CSV above and run Strip HTML. Every tag is removed from the cells, the text is kept, and you download a plain-text CSV. Strip HTML is part of Pro.",
      },
      {
        q: "Can I do this in Excel instead?",
        a: "Excel’s Find and Replace with the wildcard <*> also removes tags, but it changes cells without showing you what it did, and it’s easy to run on the wrong columns of a large sheet. Here you see every changed cell in a preview before anything is downloaded.",
      },
      {
        q: "Are HTML entities like &amp; converted?",
        a: "No. Entities are left as they are. If your export uses them, replace the common ones (&amp;, &nbsp;, &quot;) after cleaning.",
      },
      {
        q: "Is my product catalogue uploaded?",
        a: "No. The file is parsed and cleaned in your browser, and nothing is sent to a server.",
      },
      {
        q: "Is Strip HTML free?",
        a: `No, Strip HTML is a Pro rule (${PRO_PRICE_MONTHLY}/month). Free users can still trim whitespace, remove duplicates and fix encoding on files up to ${FREE_MAX_ROWS} rows.`,
      },
    ],
    related: ["fix-csv-encoding", "trim-whitespace-csv", "proper-case-csv"],
  },
  {
    slug: "clean-csv-headers",
    name: "Clean Column Headers",
    metaTitle: "Clean CSV Column Headers — Convert to snake_case Online",
    metaDescription:
      "Turn headers like “Customer ID”, “E-mail Address” and “Amount (EUR)” into clean snake_case names for SQL, pandas and imports. Free, runs in your browser.",
    h1: "Clean up CSV column headers",
    intro:
      "Headers written for people, like “Customer ID ”, “E-mail Address” or “Amount (EUR)”, are awkward for software. Spaces and brackets have to be quoted in SQL, break attribute access in pandas and confuse import mappers. Upload a file and SpreadsheetFix rewrites every header as lower-case snake_case, free and without uploading your data.",
    kind: "cleaner",
    preset: { ruleIds: ["normalizeHeaders"] },
    before: `Customer ID ,First Name,E-mail Address,Amount (EUR),Sign-up Date
1001,Ana,ana@acme.io,120.00,2024-03-01
1002,Ben,ben@acme.io,85.50,2024-03-04`,
    after: `customer_id,first_name,e_mail_address,amount_eur,sign_up_date
1001,Ana,ana@acme.io,120.00,2024-03-01
1002,Ben,ben@acme.io,85.50,2024-03-04`,
    steps: [
      "Upload the CSV or Excel file whose headers need tidying.",
      "SpreadsheetFix trims each header, lower-cases it, turns spaces and hyphens into underscores and drops other punctuation.",
      "Check the new names in the preview and download. The data underneath is unchanged.",
    ],
    sections: [
      {
        heading: "The rules it applies",
        body: "Every header is trimmed and lower-cased, and each run of spaces or hyphens becomes a single underscore. Any remaining character that isn’t a–z, 0–9 or an underscore is removed, so brackets, slashes, # and % disappear: “Amount (EUR)” becomes amount_eur and “Sign-up Date” becomes sign_up_date. A header that ends up empty, such as one made only of symbols, is named column_ followed by its position, counting from 0.",
      },
      {
        heading: "Why snake_case",
        body: "Lower-case names with underscores work unquoted in PostgreSQL, MySQL and SQLite, as attribute names in pandas (df.amount_eur), and as keys in JSON and most import tools. They also make column names predictable, so a script written against one month’s export keeps working on the next, even if someone added a trailing space or changed the capitalisation.",
      },
      {
        heading: "Accents and symbols are dropped, not translated",
        body: "Characters outside a–z are removed rather than converted, so “Prénom” becomes prnom and “Größe” becomes gre. If your headers use accented letters, check the preview and rename those columns by hand after cleaning.",
      },
      {
        heading: "When not to rename",
        body: "Some import templates, such as accounting or CRM imports, expect their own exact header names. If you’re preparing a file for one of those, leave this rule off and keep the template’s headers.",
      },
    ],
    faqs: [
      {
        q: "How do I clean column names in a CSV?",
        a: "Upload the file above. Every header is rewritten as lower-case snake_case and you download the CSV with the new header row. Data rows aren’t touched.",
      },
      {
        q: "Can I choose camelCase or kebab-case instead?",
        a: "Not at the moment. The app always uses snake_case (customer_id), the most widely accepted style for databases and data tools.",
      },
      {
        q: "What if two headers end up with the same name?",
        a: "Rename one of them before cleaning. If “Price” and “PRICE” both become price, the column further to the right replaces the other one in the cleaned file.",
      },
      {
        q: "Does it change my data?",
        a: "No. Only the header row changes; every value stays in its column. Header cleaning runs after the other rules, so column choices you made on the original header names still apply.",
      },
      {
        q: "Is header cleaning free?",
        a: `Yes. Normalize Headers is a free rule for files up to ${FREE_MAX_ROWS} rows, with no account needed.`,
      },
    ],
    related: ["merge-csv-files", "csv-to-excel-cleaner", "remove-blank-rows-csv"],
    updated: "2026-10-22",
  },
  {
    slug: "find-missing-values-csv",
    name: "Find Missing Values",
    metaTitle: "Find Missing Values in a CSV — Flag Blank Required Fields",
    metaDescription:
      "Flag every row with a blank email, amount or ID before you import a CSV. Choose the required columns and review the flagged rows. Runs in your browser.",
    h1: "Find rows with missing values in a CSV",
    intro:
      "An import that fails on row 4,182 because one invoice has no amount is a slow way to find gaps. Upload the file, tell SpreadsheetFix which columns must always be filled in, and it flags every row with a blank in any of them, so you can fix them before the import rather than after. The check runs in your browser without uploading the file. Validate Required is a Pro rule.",
    kind: "cleaner",
    preset: { ruleIds: ["validateRequired", "removeEmptyRows"] },
    before: `invoice,customer,email,amount
INV-101,Acme Ltd,ap@acme.io,1200.00
INV-102,Birch & Co,,640.00
INV-103,Cobalt GmbH,billing@cobalt.de,
INV-104,Dune LLC,ops@dune.io,310.00
INV-105,Elm Studio,,`,
    after: `invoice,customer,email,amount,reason
INV-102,Birch & Co,,640.00,Missing required: email
INV-103,Cobalt GmbH,billing@cobalt.de,,Missing required: amount
INV-105,Elm Studio,,,"Missing required: email, amount"`,
    afterView: "flagged",
    afterNote: "With email and amount ticked as required. Flagged rows also stay in the cleaned file.",
    steps: [
      "Upload the CSV or Excel file you’re about to import.",
      "Open the column picker on Validate Required and tick the columns that must never be blank. Until you pick at least one, the rule has nothing to check.",
      "Run it, review the flagged rows, and download the cleaned file plus a quarantine CSV listing each flagged row and what it’s missing.",
    ],
    sections: [
      {
        heading: "You decide what “required” means",
        body: "A blank notes field or a missing phone number may be fine; a missing invoice number or amount is not. Validate Required only checks the columns you select, and flags a row when any of them is empty or contains only spaces. Each flagged row records which columns were missing, for example “Missing required: email, amount”.",
      },
      {
        heading: "Flagged, not deleted",
        body: "Rows with gaps aren’t removed. They stay in the cleaned file in their original order and are also collected in a quarantine file with the reason, so you can fill in the blanks or drop the rows deliberately. Fully empty rows are different: they hold no data at all, so SpreadsheetFix removes them before checking, and they don’t show up as hundreds of false alarms.",
      },
      {
        heading: "Check before the import, not after",
        body: "Accounting tools, CRMs and e-commerce platforms usually reject an import at the first bad row, or accept it and leave empty fields that surface weeks later. Running the check first gives you the full list of incomplete rows at once, which is much quicker to work through than one error message at a time.",
      },
    ],
    faqs: [
      {
        q: "How do I find blank cells in a CSV?",
        a: "Upload the file above, select the columns that must be filled in on the Validate Required rule, and run it. Every row with a blank in those columns is flagged and listed with the columns it’s missing.",
      },
      {
        q: "Does a cell with only spaces count as missing?",
        a: "Yes. A value made only of spaces or tabs is treated as blank.",
      },
      {
        q: "Why was nothing flagged?",
        a: "Validate Required only checks the columns you pick. If its column picker still shows “All columns”, no column has been chosen, so tick at least one column and run it again.",
      },
      {
        q: "Are rows with missing values deleted?",
        a: "No. They stay in the cleaned file and are also listed in a separate quarantine CSV you can download, so nothing disappears without you deciding.",
      },
      {
        q: "Is it free?",
        a: `Validate Required is a Pro rule (${PRO_PRICE_MONTHLY}/month). Free users can still remove fully blank rows and validate email addresses on files up to ${FREE_MAX_ROWS} rows.`,
      },
    ],
    related: ["remove-blank-rows-csv", "validate-emails-csv", "format-phone-numbers-csv"],
  },
  {
    slug: "clean-bank-statement-csv",
    name: "Clean Bank Statement CSV",
    metaTitle: "Clean a Bank Statement CSV Export — Private, In-Browser",
    metaDescription:
      "Tidy bank statement and card exports: fix dates, garbled payee names, stray spaces and blank rows, with a totals check that proves amounts didn't change.",
    h1: "Clean a bank statement CSV export",
    intro:
      "Bank and card exports mix date formats, carry spacer rows and garble accented payee names. Upload the statement and SpreadsheetFix tidies it in your browser, so transaction data never leaves your computer, then checks that the amount columns still add up to the same totals.",
    kind: "cleaner",
    preset: {
      ruleIds: ["fixEncoding", "trimWhitespace", "removeEmptyRows", "removeEmptyColumns", "normalizeDate"],
      options: { normalizeDate: { targetFormat: "YYYY-MM-DD", dateOrder: "auto" } },
    },
    before: `Date,Description,Amount,Balance
03/09/2026,  CAFÃ‰ NERO   DUBLIN ,-4.50,1820.10
,,,
04/09/2026,Salary  ACME LTD,2400.00,4220.10`,
    after: `Date,Description,Amount,Balance
2026-09-03,CAFÉ NERO DUBLIN,-4.50,1820.10
2026-09-04,Salary ACME LTD,2400.00,4220.10`,
    steps: [
      "Download the statement from your bank as CSV or Excel and upload it here.",
      "SpreadsheetFix repairs garbled characters, trims spacing in descriptions, removes blank rows and converts dates to one format.",
      "The totals check adds up every amount column before and after cleaning and shows that the figures match to the cent. Then download.",
    ],
    sections: [
      {
        heading: "Your statement stays on your computer",
        body: "Statements contain account numbers, balances and a record of where you spend money. SpreadsheetFix parses and cleans the file with JavaScript in your browser tab; the contents are never uploaded, stored or seen by us.",
      },
      {
        heading: "Proof that the numbers didn't change",
        body: "For columns such as Amount, Debit, Credit and Balance, the totals check sums the values before cleaning, subtracts any rows that were removed, and compares the result with the cleaned file. If a single value changed, it says which column and by how much.",
      },
      {
        heading: "Check duplicates before removing them",
        body: "Two identical transactions on the same day, such as two coffees at the same price, are legitimate. This page doesn't ask for duplicate removal, but if the file has identical rows the health check switches Remove Duplicates on, so look at each removed row in the preview and turn the rule off if they are real transactions. Overlapping downloads that repeat whole days are the case where removing them is right.",
      },
    ],
    faqs: [
      {
        q: "Is it safe to clean a bank statement online?",
        a: "With SpreadsheetFix the file isn't sent anywhere: cleaning runs in your browser. You can confirm this by opening your browser's developer tools and watching the Network tab while you clean a file.",
      },
      {
        q: "What date format does the cleaned file use?",
        a: "YYYY-MM-DD, which sorts correctly everywhere and is what most databases expect. If your accounting software's import template wants DD/MM/YYYY, use the Prepare CSV for Accounting Import page instead.",
      },
      {
        q: "Will it change my amounts?",
        a: "The rules on this page don't touch amount values. The totals check confirms that by comparing column totals before and after cleaning.",
      },
      {
        q: "Can I combine several months of statements?",
        a: "Yes. Use the Merge CSV Files tool to stack monthly exports into one file, then clean the result.",
      },
    ],
    related: ["normalize-dates-csv", "merge-csv-files", "prepare-csv-for-accounting-import"],
    updated: "2026-10-22",
  },
  {
    slug: "prepare-csv-for-accounting-import",
    name: "Prepare CSV for Accounting Import",
    metaTitle: "Prepare a CSV for Xero, QuickBooks or Sage Import",
    metaDescription:
      "Fix the dates, spacing, blank rows and garbled characters that make Xero, QuickBooks and Sage reject a CSV import. Free and private, in your browser.",
    h1: "Prepare a CSV for import into accounting software",
    intro:
      "Accounting imports reject files for small reasons: a date in the wrong order, a blank line, a stray space in a reference, a character the importer can't read. Upload the file here, fix those in one pass, and import a file that matches what the template expects.",
    kind: "cleaner",
    preset: {
      ruleIds: ["fixEncoding", "trimWhitespace", "removeEmptyRows", "removeEmptyColumns", "normalizeDate"],
      options: { normalizeDate: { targetFormat: "DD/MM/YYYY", dateOrder: "auto" } },
    },
    before: `*InvoiceNumber,*ContactName,*InvoiceDate,*UnitAmount
INV-0041 ,Müller GmbH,2026-09-03,450.00
,,,
INV-0042,MÃ¼ller GmbH,Sept 5 2026,120.00`,
    after: `*InvoiceNumber,*ContactName,*InvoiceDate,*UnitAmount
INV-0041,Müller GmbH,03/09/2026,450.00
INV-0042,Müller GmbH,05/09/2026,120.00`,
    steps: [
      "Upload the CSV you want to import. Keep the header row exactly as the import template gives it.",
      "Dates are rewritten as DD/MM/YYYY, the order most UK, Irish and Australian templates use. If your template expects month-first dates, switch Normalize Dates off before cleaning.",
      "Review the changes, download the cleaned CSV and import it.",
    ],
    sections: [
      {
        heading: "The usual reasons an import fails",
        body: "Mixed date formats in one column, dates in the wrong day/month order for the organisation's region, references with trailing spaces that no longer match existing records, empty lines in the middle of the file, and names garbled by an encoding mismatch. Each of these is a rule in SpreadsheetFix.",
      },
      {
        heading: "Headers are left alone",
        body: "Import templates rely on exact header names, often with asterisks marking required fields. This preset doesn't rename headers, so the importer can still map every column.",
      },
      {
        heading: "Contact names that match",
        body: "When “Müller GmbH” appears correctly on one row and as “MÃ¼ller GmbH” on another, most software creates two contacts. Repairing the encoding first means both rows match the same contact.",
      },
    ],
    faqs: [
      {
        q: "Which date format does my accounting software need?",
        a: "It depends on the product and the organisation's region settings, so check the sample file in the import screen. This page writes DD/MM/YYYY; if your software expects another format, switch Normalize Dates off so the dates stay as they are.",
      },
      {
        q: "Does SpreadsheetFix connect to Xero or QuickBooks?",
        a: "No. It cleans the file in your browser; you then import the downloaded CSV using your software's own import screen.",
      },
      {
        q: "Will amounts with currency symbols be fixed?",
        a: "Removing currency symbols and fixing decimal separators is the Normalize Numbers rule, which is part of Pro. This free preset doesn't change amounts.",
      },
      {
        q: "Is my data uploaded?",
        a: "No. The file is processed entirely in your browser.",
      },
    ],
    related: ["clean-bank-statement-csv", "normalize-dates-csv", "fix-csv-encoding"],
    updated: "2026-10-22",
  },
  {
    slug: "clean-email-list",
    name: "Clean an Email List",
    metaTitle: "Clean an Email List CSV Before Importing — Free",
    metaDescription:
      "Lowercase and trim email addresses, remove duplicate subscribers and flag invalid emails before importing a list into Mailchimp or another email tool.",
    h1: "Clean an email list before you import it",
    intro:
      "Mailing lists collected from forms, events and old exports carry duplicates, capitalised and padded addresses, and entries that aren't email addresses at all. Upload the list and SpreadsheetFix tidies it in your browser before it reaches your email platform.",
    kind: "cleaner",
    preset: { ruleIds: ["trimWhitespace", "normalizeEmail", "deduplicateRows", "validateEmail"] },
    before: `email,first_name
Ana@Example.com ,Ana
ana@example.com,Ana
ben@example,Ben
cara@example.ie,Cara`,
    after: `email,first_name
ana@example.com,Ana
ben@example,Ben
cara@example.ie,Cara`,
    afterNote: "1 duplicate removed. ben@example is flagged for review (no domain suffix) and listed in a separate quarantine file.",
    steps: [
      "Upload your list as CSV or Excel.",
      "Addresses are trimmed and lowercased, then duplicate rows are removed. Normalising first means “Ana@Example.com ” and “ana@example.com” are recognised as the same subscriber.",
      "Rows with invalid addresses are flagged for review and listed in a separate quarantine file. Fix or delete them, then download the list and import it.",
    ],
    sections: [
      {
        heading: "Why clean before importing",
        body: "Most email platforms charge by the number of contacts, so duplicates cost money. Invalid addresses bounce, and a high bounce rate can hurt delivery for the whole list. Fixing both before import is cheaper than cleaning up afterwards.",
      },
      {
        heading: "What “invalid” means here",
        body: "SpreadsheetFix checks that each address has the shape of an email: a name, an @, a domain and a top-level domain such as .com or .ie. It doesn't contact mail servers, so it can't tell whether a correctly formed mailbox actually exists.",
      },
      {
        heading: "Duplicates by email only",
        body: "If the same person appears with different names or signup dates, open the column picker on Remove Duplicates and select only the email column. Rows with the same address are then treated as duplicates, and the first one is kept.",
      },
    ],
    faqs: [
      {
        q: "How do I remove duplicate emails from a list?",
        a: "Upload the list above. Addresses are normalised and duplicate rows removed. To de-duplicate on the email column alone, select it in the Remove Duplicates column picker.",
      },
      {
        q: "Does it verify that the mailbox exists?",
        a: "No. It checks the address format only and never contacts mail servers, which keeps your list private.",
      },
      {
        q: "Is it OK to lowercase email addresses?",
        a: "In practice, yes. Email providers treat addresses case-insensitively, and email platforms compare them that way too.",
      },
      {
        q: "Is my list uploaded anywhere?",
        a: "No. Everything runs in your browser.",
      },
    ],
    related: ["validate-emails-csv", "remove-duplicates-csv", "clean-crm-export"],
    updated: "2026-10-22",
  },
  {
    slug: "clean-crm-export",
    name: "Clean a CRM Export",
    metaTitle: "Clean a CRM Contact Export (HubSpot, Salesforce) — Free",
    metaDescription:
      "Tidy contacts exported from HubSpot, Salesforce or Pipedrive: fix names, emails and dates, remove duplicates and blank rows. Private, in your browser.",
    h1: "Clean a contact export from your CRM",
    intro:
      "Contact exports collect years of inconsistent data entry: padded names, garbled accents, mixed date formats, duplicate records. Upload the export and SpreadsheetFix tidies it before you re-import, migrate or analyse it.",
    kind: "cleaner",
    preset: {
      ruleIds: ["fixEncoding", "trimWhitespace", "normalizeEmail", "removeEmptyRows", "removeEmptyColumns", "deduplicateRows", "normalizeDate"],
      options: { normalizeDate: { targetFormat: "YYYY-MM-DD", dateOrder: "auto" } },
    },
    before: `First Name,Last Name,Email,Created
JosÃ©,  MÃ¼ller,Jose@Acme.io ,03/14/2024
,,,
José,Müller,jose@acme.io,2024-03-14`,
    after: `First Name,Last Name,Email,Created
José,Müller,jose@acme.io,2024-03-14`,
    afterNote: "The blank row is removed, and once the first record's encoding, spacing, email and date are fixed it matches the second, so the duplicate is removed.",
    steps: [
      "Export contacts, companies or deals from your CRM as CSV and upload the file.",
      "SpreadsheetFix repairs encoding, trims spacing, lowercases emails, standardises dates and removes blank rows.",
      "Duplicates are removed after the values are normalised, so records that differed only in spacing or case are caught. Review and download.",
    ],
    sections: [
      {
        heading: "Before a migration",
        body: "Moving between CRMs is the best time to clean data, because every record passes through a file anyway. Cleaning the export first means the new system starts without the old one's duplicates and formatting problems.",
      },
      {
        heading: "Duplicates that differ slightly",
        body: "Two records that differ only by a trailing space, an uppercase letter in the email or a garbled accent are normalised to the same values first, then matched. To match on email alone, choose the email column in the Remove Duplicates column picker.",
      },
      {
        heading: "Customer data stays private",
        body: "Contact exports hold personal data. SpreadsheetFix processes the file in your browser and never uploads it, so you're not sending your customer list to another processor.",
      },
    ],
    faqs: [
      {
        q: "Does SpreadsheetFix connect to my CRM?",
        a: "No. Export a CSV from your CRM, clean it here, and import the downloaded file back or into another tool.",
      },
      {
        q: "Can it merge duplicate records field by field?",
        a: "No. When it finds a duplicate it keeps the first row and removes later ones, and shows each removal in the preview. Use your CRM's merge feature if you need to combine fields from both records.",
      },
      {
        q: "Will it change the header names my CRM expects?",
        a: "Not with this preset. Header normalisation is off, so the export's headers are kept for re-import.",
      },
      {
        q: "How many contacts can I clean for free?",
        a: `Up to ${FREE_MAX_ROWS} rows per file. Pro handles up to ${PRO_MAX_ROWS}.`,
      },
    ],
    related: ["clean-email-list", "remove-duplicates-csv", "fix-csv-encoding"],
    updated: "2026-10-22",
  },
];

export const TOOL_MAP = new Map(TOOLS.map((t) => [t.slug, t]));

/** True when a page's preset includes a rule that only Pro unlocks. */
export function toolNeedsPro(tool: ToolPage): boolean {
  return tool.preset?.ruleIds.some((id) => !FREE_RULES.includes(id)) ?? false;
}

export function toolUpdated(tool: ToolPage): string {
  return tool.updated ?? TOOLS_UPDATED;
}
