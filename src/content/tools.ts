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
      "Delete duplicate rows from a CSV or Excel file in seconds. Exact or key-column matching, a preview of every removed row, and your data never leaves your browser.",
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
ben@acme.io,Ben Ode,free

# 2 duplicate rows removed`,
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
        a: "Open SpreadsheetFix, drop your CSV into the box above and download the cleaned file. There is nothing to install and no account is needed for files up to 5,000 rows.",
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
      "Pick the output format — YYYY-MM-DD, DD/MM/YYYY or MM/DD/YYYY — preview the changes and download.",
    ],
    sections: [
      {
        heading: "Is 03/04/2024 March or April?",
        body: "It depends on where the data came from. SpreadsheetFix looks at the whole column: if any value has a day above 12 in the first position (25/12/2024), the column is day-first; if it appears in the second position (12/25/2024), it is month-first. Each column is judged separately, so a US order date and a European delivery date in the same file both convert correctly. If a column gives no evidence either way, SpreadsheetFix reads it day-first, and you can force US or European order in the rule settings.",
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
      "Find invalid email addresses in a CSV before you import it. Lowercases and trims emails, flags bad formats. Private: runs in your browser.",
    h1: "Validate and clean email addresses in a CSV",
    intro:
      "Before you import a list into your CRM or email platform, upload it here. SpreadsheetFix trims and lowercases every address, then flags every row with a malformed email so you can fix or delete it before your import.",
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
kim@example.org,Kim

# flagged: lee@example (no domain suffix)
# 1 duplicate removed`,
    steps: [
      "Upload the contact list as CSV or Excel. SpreadsheetFix detects email columns automatically.",
      "Addresses are trimmed and lowercased so duplicates match, then checked for a valid format.",
      "Rows with invalid emails are flagged and listed for review. Fix or delete them, then download the clean list.",
    ],
    sections: [
      {
        heading: "What counts as invalid",
        body: "SpreadsheetFix checks syntax: a local part, a single @, a domain and a top-level domain of at least two letters. That catches typos like “lee@example”, “ana.gmail.com” and stray characters from copy-paste. It does not contact mail servers, so it won’t tell you whether a mailbox exists — that also means no address ever leaves your machine.",
      },
      {
        heading: "Flag instead of delete",
        body: "Invalid rows aren’t silently thrown away. They stay in the file and are listed as flagged, so you can fix a typo and keep the contact, or confirm the row should go.",
      },
      {
        heading: "Lowercase first, then de-duplicate",
        body: "“Sam@Example.COM” and “sam@example.com” are the same inbox. Normalising case before de-duplication stops the same person being imported twice and receiving every campaign twice.",
      },
    ],
    faqs: [
      {
        q: "How do I check if emails in a CSV are valid?",
        a: "Upload the CSV above. SpreadsheetFix flags every address with an invalid format and lists those rows so you can review them before downloading.",
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
        a: "Cleaning and CSV download are free for files up to 5,000 rows. Native .xlsx export is part of Pro (€12/month).",
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
        a: "Yes, for files up to 5,000 rows. Pro supports files up to 500,000 rows.",
      },
    ],
    related: ["csv-to-excel-cleaner", "trim-whitespace-csv", "merge-csv-files"],
  },
  {
    slug: "remove-blank-rows-csv",
    name: "Remove Blank Rows",
    metaTitle: "Remove Blank Rows and Empty Columns from a CSV",
    metaDescription:
      "Delete empty rows and empty columns from a CSV or Excel file, including rows that only contain spaces. Free, private, runs in your browser.",
    h1: "Remove blank rows and empty columns from a CSV",
    intro:
      "Exports often arrive with spacer rows between sections and trailing columns with no data. Upload the file and SpreadsheetFix removes every row and column that has nothing in it, so sorting, filtering and imports work as expected.",
    kind: "cleaner",
    preset: { ruleIds: ["trimWhitespace", "removeEmptyRows", "removeEmptyColumns"] },
    before: `date,description,amount,,
2026-09-01,Office rent,1200.00,,
,,,,
2026-09-02,Software,49.00,,
   ,  ,,,`,
    after: `date,description,amount
2026-09-01,Office rent,1200.00
2026-09-02,Software,49.00

# 2 blank rows and 2 empty columns removed`,
    steps: [
      "Upload your CSV, TSV or Excel file.",
      "Whitespace is trimmed first, so a row of cells that only contain spaces counts as blank.",
      "Rows where every cell is empty and columns with no values are removed. Check the preview, then download.",
    ],
    sections: [
      {
        heading: "What counts as blank",
        body: "A row is removed only when every one of its cells is empty after trimming spaces, tabs and non-breaking spaces. A row with a single value in any column is kept. The same test applies to columns: a column is removed only when no row has a value in it.",
      },
      {
        heading: "Why blank rows break things",
        body: "Excel treats a blank row as the edge of a table, so sorting, filters and pivot tables can silently stop at it. Import tools often reject the file or create empty records. Removing them before the file goes anywhere avoids both problems.",
      },
      {
        heading: "Empty trailing columns",
        body: "Files saved from spreadsheets frequently carry extra commas at the end of each line, which appear as unnamed empty columns. SpreadsheetFix drops them, so the cleaned file has exactly the columns that hold data.",
      },
    ],
    faqs: [
      {
        q: "How do I delete blank rows from a CSV?",
        a: "Upload the file above and download the result. Rows where every cell is empty, or only contains spaces, are removed. It's free for files up to 5,000 rows.",
      },
      {
        q: "Will it remove rows that are only partly empty?",
        a: "No. A row is kept if any of its cells has a value. Only completely empty rows are removed.",
      },
      {
        q: "Does it also remove empty columns?",
        a: "Yes. Columns with no value in any row are removed, including the unnamed columns created by trailing commas.",
      },
      {
        q: "Is my file uploaded?",
        a: "No. The file is read and cleaned in your browser. Its contents are never sent to SpreadsheetFix.",
      },
    ],
    related: ["trim-whitespace-csv", "csv-to-excel-cleaner", "remove-duplicates-csv"],
  },
  {
    slug: "clean-csv-headers",
    name: "Clean Column Headers",
    metaTitle: "Clean CSV Column Headers — snake_case, kebab-case, camelCase",
    metaDescription:
      "Turn messy CSV headers like “ Invoice Date ” and “Amount (EUR)” into consistent column names: snake_case, kebab-case or camelCase. Free and in-browser.",
    h1: "Clean up CSV column headers",
    intro:
      "Headers with spaces, capitals, brackets and stray punctuation make a file awkward to load into a database, a script or Power Query. Upload it here and SpreadsheetFix rewrites every header into one predictable style.",
    kind: "cleaner",
    preset: { ruleIds: ["normalizeHeaders"], options: { normalizeHeaders: { style: "lowercase_underscore" } } },
    before: ` Invoice Date ,Customer Name,Amount (EUR),VAT-Rate
2026-09-01,Acme Ltd,1200.00,23`,
    after: `invoice_date,customer_name,amount_eur,vat_rate
2026-09-01,Acme Ltd,1200.00,23`,
    steps: [
      "Upload your CSV or Excel file.",
      "Choose a header style: lowercase_with_underscores (the default), lowercase-with-dashes or camelCase.",
      "Check the renamed headers in the preview and download the file. Cell values are not changed.",
    ],
    sections: [
      {
        heading: "What the rule does to each header",
        body: "Leading and trailing spaces are removed, the text is lowercased, spaces and separators become the chosen joiner, and characters other than letters and digits are dropped. A header that would end up empty becomes column_1, column_2 and so on, so every column keeps a name.",
      },
      {
        heading: "Why consistent headers matter",
        body: "SQL databases, pandas, R and most import tools either reject or quietly rewrite column names with spaces and symbols. Fixing them once in the file means your queries and formulas reference the same names every time the export is refreshed.",
      },
      {
        heading: "When not to rename",
        body: "Some import templates, such as accounting or CRM imports, expect their own exact header names. If you're preparing a file for one of those, leave this rule off and keep the template's headers.",
      },
    ],
    faqs: [
      {
        q: "How do I convert CSV headers to snake_case?",
        a: "Upload the file above. The default style is lowercase with underscores, so “Invoice Date” becomes invoice_date.",
      },
      {
        q: "Can I use camelCase or kebab-case instead?",
        a: "Yes. The Normalize Headers rule has a style option with lowercase_underscore, lowercase-dash and camelCase.",
      },
      {
        q: "Does it change the data in the rows?",
        a: "No. Only the header row is rewritten.",
      },
      {
        q: "Can I rename columns to specific names?",
        a: "Renaming columns with your own map is a Pro rule. Normalize Headers, which applies one style to every header, is free.",
      },
    ],
    related: ["csv-to-excel-cleaner", "remove-blank-rows-csv", "trim-whitespace-csv"],
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
        heading: "Duplicates are off by default here",
        body: "Two identical transactions on the same day, such as two coffees at the same price, are legitimate. This page doesn't remove duplicate rows. If your export really does repeat rows, for example after combining overlapping downloads, turn on Remove Duplicates and review each removed row in the preview.",
      },
    ],
    faqs: [
      {
        q: "Is it safe to clean a bank statement online?",
        a: "With SpreadsheetFix the file isn't sent anywhere: cleaning runs in your browser. You can confirm this by opening your browser's developer tools and watching the Network tab while you clean a file.",
      },
      {
        q: "Which date format should I choose?",
        a: "YYYY-MM-DD sorts correctly everywhere and is what most databases expect. If you're importing into accounting software, use the format its import template asks for; DD/MM/YYYY and MM/DD/YYYY are also available.",
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
      "Choose the date format your software expects. This page starts with DD/MM/YYYY; switch to MM/DD/YYYY or YYYY-MM-DD if your template uses those.",
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
        a: "It depends on the product and the organisation's region settings. Check the sample file in the import screen and pick the same format here.",
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
cara@example.ie,Cara

# 1 duplicate removed · flagged: ben@example (no domain suffix)`,
    steps: [
      "Upload your list as CSV or Excel.",
      "Addresses are trimmed and lowercased, then duplicate rows are removed. Normalising first means “Ana@Example.com ” and “ana@example.com” are recognised as the same subscriber.",
      "Rows with invalid addresses are flagged and listed for review. Fix or delete them, then download the list and import it.",
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
  },
  {
    slug: "clean-crm-export",
    name: "Clean a CRM Export",
    metaTitle: "Clean a CRM Contact Export (HubSpot, Salesforce) — Free",
    metaDescription:
      "Tidy contacts exported from HubSpot, Salesforce or Pipedrive: fix names, emails and dates, remove duplicates and blank rows. Runs privately in your browser.",
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
José,Müller,jose@acme.io,2024-03-14

# 1 blank row and 1 duplicate removed`,
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
        a: "Up to 5,000 rows per file. Pro handles up to 500,000.",
      },
    ],
    related: ["clean-email-list", "remove-duplicates-csv", "fix-csv-encoding"],
  },
];

export const TOOL_MAP = new Map(TOOLS.map((t) => [t.slug, t]));
