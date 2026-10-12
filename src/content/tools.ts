import type { RulePreset } from "@/store/sheetStore";

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
  after: string;
  steps: string[];
  sections: { heading: string; body: string }[];
  faqs: ToolFaq[];
  related: string[];
}

export const TOOLS: ToolPage[] = [
  {
    slug: "remove-duplicates-csv",
    name: "Remove Duplicates",
    metaTitle: "Remove Duplicates from CSV Online — Free & Private",
    metaDescription:
      "Delete duplicate rows from a CSV or Excel file in seconds. Exact or key-column matching, a full change log, and your data never leaves your browser.",
    h1: "Remove duplicate rows from a CSV",
    intro:
      "Drop a CSV or Excel file below and RowRescue finds every repeated row, shows you which ones it will remove, and gives you back a clean file. Matching runs entirely in your browser — nothing is uploaded.",
    kind: "cleaner",
    preset: { ruleIds: ["trimWhitespace", "deduplicateRows"] },
    before: `email,name,plan
ana@acme.io,Ana Ruiz,pro
ben@acme.io,Ben Ode,free
ana@acme.io,Ana Ruiz,pro
ana@acme.io ,Ana Ruiz ,pro`,
    after: `email,name,plan
ana@acme.io,Ana Ruiz,pro
ben@acme.io,Ben Ode,free

# 2 duplicate rows removed`,
    steps: [
      "Upload your CSV, TSV or XLSX file (or try the demo data).",
      "RowRescue trims stray spaces first, so “ana@acme.io ” and “ana@acme.io” count as the same value.",
      "Review the rows marked as duplicates in the preview, then download the de-duplicated file.",
    ],
    sections: [
      {
        heading: "Exact rows or just the columns that matter",
        body: "By default a row is a duplicate when every cell matches another row. Use the column picker on the Remove Duplicates rule to compare only the columns you choose — say, email or order ID — which is useful for CRM exports where the same contact appears with different timestamps.",
      },
      {
        heading: "Why duplicates survive Excel’s Remove Duplicates",
        body: "Invisible trailing spaces, double spaces and inconsistent capitalisation make rows look identical to you but different to Excel. RowRescue normalises whitespace before comparing, which catches the near-duplicates that spreadsheet tools miss.",
      },
      {
        heading: "The first occurrence is always kept",
        body: "When RowRescue finds a repeat, it keeps the first row it saw and removes later copies, so your original ordering is preserved. Every removal is listed in the change log so you can audit exactly what went.",
      },
    ],
    faqs: [
      {
        q: "How do I remove duplicates from a CSV without Excel?",
        a: "Open RowRescue, drop your CSV into the box above and download the cleaned file. There is nothing to install and no account is needed for files up to 5,000 rows.",
      },
      {
        q: "Can I remove duplicates based on one column, like email?",
        a: "Yes. Open the column picker on the Remove Duplicates rule and select only the email column. Rows with the same email are treated as duplicates even if other columns differ.",
      },
      {
        q: "Which duplicate is kept?",
        a: "The first occurrence in the file is kept and later copies are removed. The change log lists every removed row.",
      },
      {
        q: "Is my file uploaded to a server?",
        a: "No. The file is parsed and de-duplicated in your browser with JavaScript. Its contents are never sent to RowRescue.",
      },
      {
        q: "How large a file can I de-duplicate?",
        a: "The free plan processes up to 5,000 rows per file. Pro handles up to 500,000 rows.",
      },
    ],
    related: ["trim-whitespace-csv", "merge-csv-files", "validate-emails-csv"],
  },
  {
    slug: "normalize-dates-csv",
    name: "Normalize Dates",
    metaTitle: "Convert & Normalize Dates in a CSV to YYYY-MM-DD",
    metaDescription:
      "Fix mixed date formats in a CSV: 03/04/2024, 4 March 2024 and 2024-03-04 become one format. Detects US vs European order per column. Free, in-browser.",
    h1: "Normalize mixed date formats in a CSV",
    intro:
      "Exports from different systems mix 12/31/2024, 31.12.2024 and “December 31, 2024” in the same column. Upload your file and RowRescue converts every recognisable date to one consistent format, ready for databases, BI tools and imports.",
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
      "RowRescue checks each column to work out whether it is month-first (US) or day-first (European).",
      "Pick the output format — YYYY-MM-DD, DD/MM/YYYY or MM/DD/YYYY — preview the changes and download.",
    ],
    sections: [
      {
        heading: "Is 03/04/2024 March or April?",
        body: "It depends on where the data came from. RowRescue looks at the whole column: if any value has a day above 12 in the first position (25/12/2024), the column is day-first; if it appears in the second position (12/25/2024), it is month-first. Each column is judged separately, so a US order date and a European delivery date in the same file both convert correctly. If a column gives no evidence either way, RowRescue reads it day-first, and you can force US or European order in the rule settings.",
      },
      {
        heading: "Formats RowRescue understands",
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
        a: "RowRescue infers the order per column from values that can only be read one way, such as 25/12/2024. If a column is entirely ambiguous, you can set US (MM/DD) or European (DD/MM) order explicitly.",
      },
      {
        q: "Why does Excel change my CSV dates?",
        a: "Excel guesses date formats from your computer’s regional settings when it opens a CSV, which can silently swap day and month. Normalising to YYYY-MM-DD before opening the file avoids that guesswork.",
      },
      {
        q: "Are non-date values affected?",
        a: "No. Only cells that parse as valid dates are changed, and every change is recorded in the change log.",
      },
      {
        q: "Is date normalization free?",
        a: "Yes, for files up to 5,000 rows. Pro raises the limit to 500,000 rows and adds Excel export.",
      },
    ],
    related: ["csv-to-excel-cleaner", "trim-whitespace-csv", "fix-csv-encoding"],
  },
  {
    slug: "validate-emails-csv",
    name: "Validate Emails",
    metaTitle: "Validate Email Addresses in a CSV — Free Email List Cleaner",
    metaDescription:
      "Find and quarantine invalid email addresses in a CSV before you import it. Lowercases and trims emails, flags bad formats. Private: runs in your browser.",
    h1: "Validate and clean email addresses in a CSV",
    intro:
      "Before you import a list into your CRM or email platform, upload it here. RowRescue trims and lowercases every address, then moves rows with malformed emails into a separate quarantine so they don’t pollute your import.",
    kind: "cleaner",
    preset: { ruleIds: ["trimWhitespace", "normalizeEmail", "validateEmail", "deduplicateRows"] },
    before: `email,first_name
  Sam@Example.COM ,Sam
lee@example,Lee
kim@example.org,Kim
sam@example.com,Sam`,
    after: `email,first_name
sam@example.com,Sam
kim@example.org,Kim

# quarantined: lee@example (no domain suffix)
# 1 duplicate removed`,
    steps: [
      "Upload the contact list as CSV or Excel. RowRescue detects email columns automatically.",
      "Addresses are trimmed and lowercased so duplicates match, then checked for a valid format.",
      "Rows with invalid emails move to quarantine for review; download the clean list.",
    ],
    sections: [
      {
        heading: "What counts as invalid",
        body: "RowRescue checks syntax: a local part, a single @, a domain and a top-level domain of at least two letters. That catches typos like “lee@example”, “ana.gmail.com” and stray characters from copy-paste. It does not contact mail servers, so it won’t tell you whether a mailbox exists — that also means no address ever leaves your machine.",
      },
      {
        heading: "Quarantine instead of delete",
        body: "Invalid rows aren’t silently thrown away. They’re set aside in a quarantine list so you can fix a typo and keep the contact, or confirm the row should go.",
      },
      {
        heading: "Lowercase first, then de-duplicate",
        body: "“Sam@Example.COM” and “sam@example.com” are the same inbox. Normalising case before de-duplication stops the same person being imported twice and receiving every campaign twice.",
      },
    ],
    faqs: [
      {
        q: "How do I check if emails in a CSV are valid?",
        a: "Upload the CSV above. RowRescue flags every address with an invalid format and moves those rows to a quarantine list you can review before downloading.",
      },
      {
        q: "Does RowRescue verify that the mailbox exists?",
        a: "No. It validates format only and never contacts mail servers, which keeps your list private. Use it to remove malformed addresses before running a deliverability check.",
      },
      {
        q: "Will it remove duplicate emails?",
        a: "Yes. Emails are trimmed and lowercased first, then duplicate rows are removed, so differently-capitalised copies of the same address are caught.",
      },
      {
        q: "Is it safe to upload customer emails?",
        a: "Your file is never uploaded. All checks run in your browser, which makes RowRescue suitable for GDPR-sensitive contact lists.",
      },
      {
        q: "How many emails can I validate for free?",
        a: "Up to 5,000 rows per file on the free plan, or 500,000 rows with Pro.",
      },
    ],
    related: ["remove-duplicates-csv", "trim-whitespace-csv", "merge-csv-files"],
  },
  {
    slug: "trim-whitespace-csv",
    name: "Trim Whitespace",
    metaTitle: "Trim Whitespace in CSV — Remove Extra Spaces Online",
    metaDescription:
      "Remove leading, trailing and double spaces from every cell in a CSV or Excel file, and drop blank rows. Free, instant and private — nothing is uploaded.",
    h1: "Trim whitespace and extra spaces in a CSV",
    intro:
      "Leading spaces, trailing spaces and doubled spaces break lookups, joins and duplicate checks without being visible. Upload a file and RowRescue strips them from every cell and removes fully blank rows.",
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
      "RowRescue trims both ends of every text cell, collapses repeated spaces to one, and removes rows that are completely empty.",
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
        a: "Upload it above. RowRescue trims leading and trailing spaces in every cell and collapses repeated spaces, then lets you download the cleaned file.",
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
    related: ["remove-duplicates-csv", "fix-csv-encoding", "csv-to-excel-cleaner"],
  },
  {
    slug: "merge-csv-files",
    name: "Merge CSV Files",
    metaTitle: "Merge CSV Files Online — Combine Multiple CSVs Into One",
    metaDescription:
      "Combine multiple CSV files into one, even when columns are in a different order. Optional duplicate removal. Free, private and runs in your browser.",
    h1: "Merge multiple CSV files into one",
    intro:
      "Select two or more CSV files and RowRescue stacks them into a single file. Columns are matched by header name, so files with different column orders — or a few extra columns — combine correctly.",
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
      "RowRescue lines up columns by header name and adds any column that appears in only some files.",
      "Optionally remove duplicate rows across files, then download the merged CSV or keep cleaning it.",
    ],
    sections: [
      {
        heading: "Columns are matched by name, not position",
        body: "Copy-pasting files together breaks as soon as one export has its columns in a different order. RowRescue reads each file’s header row and places every value under the right column. Headers are compared ignoring case and surrounding spaces, so “Email ”, “email” and “EMAIL” line up.",
      },
      {
        heading: "Files with different columns",
        body: "If one file has a column the others don’t, it’s added to the merged file and left blank for rows from the other files. Nothing is dropped.",
      },
      {
        heading: "Merge, then clean",
        body: "Monthly exports often overlap. Tick “remove duplicate rows” to de-duplicate across all files while merging, or send the merged file straight into the full RowRescue cleaner to fix dates, emails and spacing.",
      },
    ],
    faqs: [
      {
        q: "How do I combine multiple CSV files into one?",
        a: "Select all the files in the box above and click Merge. RowRescue matches columns by header name and gives you a single CSV to download.",
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
        a: "As many as you like. On the free plan the merged result can contain up to 5,000 rows; Pro allows up to 500,000.",
      },
      {
        q: "Are my files uploaded?",
        a: "No. Files are read and merged in your browser. Nothing is sent to a server.",
      },
    ],
    related: ["remove-duplicates-csv", "csv-to-excel-cleaner", "fix-csv-encoding"],
  },
  {
    slug: "csv-to-excel-cleaner",
    name: "CSV to Excel Cleaner",
    metaTitle: "Clean a CSV and Convert It to Excel (XLSX)",
    metaDescription:
      "Clean up a messy CSV — duplicates, blank rows, spacing, headers, dates — and save it as an Excel-ready file. Private, in-browser CSV to XLSX cleaner.",
    h1: "Clean a CSV and get an Excel-ready file",
    intro:
      "Opening a raw export in Excel usually means mangled dates, blank rows and columns full of stray spaces. Upload the CSV here, let RowRescue fix it, and download a tidy file that opens cleanly in Excel.",
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
      "RowRescue repairs garbled characters, trims spaces, tidies headers, normalises dates and removes blank rows and empty columns.",
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
        a: "Normalise the dates to YYYY-MM-DD first — RowRescue does this automatically — and Excel will read them consistently regardless of regional settings. Pro users can export straight to .xlsx.",
      },
      {
        q: "Is XLSX export free?",
        a: "Cleaning and CSV download are free for files up to 5,000 rows. Native .xlsx export is part of Pro (€12/month).",
      },
      {
        q: "Why do accented characters look wrong when I open a CSV in Excel?",
        a: "Excel may read a UTF-8 file as a legacy encoding. RowRescue repairs characters that are already garbled, and its CSV export is UTF-8 so Excel can display accents correctly.",
      },
      {
        q: "Can I upload an Excel file instead?",
        a: "Yes. RowRescue accepts .xlsx and .xls as well as CSV and TSV.",
      },
    ],
    related: ["normalize-dates-csv", "fix-csv-encoding", "trim-whitespace-csv"],
  },
  {
    slug: "fix-csv-encoding",
    name: "Fix CSV Encoding",
    metaTitle: "Fix CSV Encoding — Repair Ã© and â€™ Characters Online",
    metaDescription:
      "Repair garbled characters like Ã©, â€™ and Ã¼ in a CSV and convert Windows-1252 files to UTF-8. Free, private, runs entirely in your browser.",
    h1: "Fix garbled characters and CSV encoding",
    intro:
      "Seeing “CafÃ©” instead of “Café”, or “donâ€™t” instead of “don’t”? The file was saved in one encoding and opened in another. Upload it here: RowRescue detects the file’s encoding, repairs the garbled text, and gives you back clean UTF-8.",
    kind: "cleaner",
    preset: { ruleIds: ["fixEncoding"] },
    before: `name,city,note
JosÃ© Ã–zil,MÃ¼nchen,donâ€™t call
ZoÃ« Smith,ZÃ¼rich,â‚¬50 credit`,
    after: `name,city,note
José Özil,München,don’t call
Zoë Smith,Zürich,€50 credit`,
    steps: [
      "Upload the CSV. RowRescue reads the raw bytes and detects UTF-8, UTF-8 with BOM, UTF-16 or Windows-1252.",
      "Cells containing mojibake — text that was double-decoded — are repaired back to the original characters, including files that were mis-saved twice.",
      "Download the result as UTF-8, the encoding every modern tool expects.",
    ],
    sections: [
      {
        heading: "What causes “Ã©” in a CSV",
        body: "The character é takes two bytes in UTF-8. When software reads those bytes as Windows-1252 or Latin-1, each byte becomes its own character, and é turns into Ã©. If that broken text is saved and opened the same wrong way again, it gets worse: Ã©. RowRescue reverses this process exactly instead of guessing with find-and-replace.",
      },
      {
        heading: "Two different problems, both handled",
        body: "Sometimes the file itself is in an old encoding such as Windows-1252, which is common for exports from older Windows software. RowRescue detects that from the bytes and decodes it correctly. Other times the text inside the file is already garbled; the Fix Encoding rule repairs those cells. Text that is already correct is never changed.",
      },
      {
        heading: "Safe by design",
        body: "A cell is only changed when the repair is a perfect round-trip: the garbled text must be exactly what UTF-8 looks like when misread. Genuine accented words like “Zürich” or “naïve” are left as they are.",
      },
    ],
    faqs: [
      {
        q: "How do I fix encoding in a CSV file?",
        a: "Upload it above. RowRescue detects the encoding automatically, repairs garbled characters, and lets you download a clean UTF-8 CSV.",
      },
      {
        q: "How do I convert a CSV from ANSI / Windows-1252 to UTF-8?",
        a: "Upload the file. If its bytes aren’t valid UTF-8, RowRescue decodes it as Windows-1252, and every download is UTF-8.",
      },
      {
        q: "Why does my CSV show Ã© instead of é?",
        a: "The file was written as UTF-8 but read as Windows-1252 or Latin-1 somewhere along the way. RowRescue’s Fix Encoding rule reverses that misreading.",
      },
      {
        q: "Will it change text that is already correct?",
        a: "No. A cell is only modified when it matches the exact pattern of misdecoded UTF-8, and every change appears in the change log.",
      },
      {
        q: "Is encoding repair free?",
        a: "Yes, for files up to 5,000 rows. Pro supports files up to 500,000 rows.",
      },
    ],
    related: ["csv-to-excel-cleaner", "trim-whitespace-csv", "merge-csv-files"],
  },
];

export const TOOL_MAP = new Map(TOOLS.map((t) => [t.slug, t]));
