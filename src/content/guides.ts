export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** ISO date; bump `updated` when the content changes */
  published: string;
  updated: string;
  summary: string;
  sections: { heading: string; paragraphs: string[] }[];
  /** Tool page slug the guide leads to */
  tool: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "stop-excel-changing-dates-in-csv",
    title: "How to stop Excel changing dates in a CSV",
    metaTitle: "How to Stop Excel Changing Dates in a CSV File",
    metaDescription:
      "Why Excel swaps day and month, turns codes into dates and drops leading zeros when it opens a CSV, and three ways to prevent it.",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "Excel converts values when it opens a CSV, using your computer's regional settings. Normalise dates to YYYY-MM-DD before opening, or import with column types set to Text.",
    sections: [
      {
        heading: "Why it happens",
        paragraphs: [
          "A CSV is plain text with no column types. When you double-click one, Excel guesses a type for every value. Anything that looks like a date is converted using the date order from your operating system's regional settings.",
          "On a computer set to US English, 03/04/2026 becomes 4 March. On a computer set to UK or Irish English, the same text becomes 3 April. Values that can't be a date in that order, like 13/04/2026 on a US machine, stay as text. The column ends up mixing real dates and text, and sorting breaks.",
          "The same guessing turns product codes like 1-10 into 10 January, removes leading zeros from 00123, and shows long account numbers in scientific notation, losing digits after the fifteenth.",
        ],
      },
      {
        heading: "Option 1: normalise the dates before Excel sees them",
        paragraphs: [
          "Excel reads YYYY-MM-DD (2026-04-03) the same way in every region. Converting a date column to that format before opening the file removes the ambiguity entirely.",
          "SpreadsheetFix's Normalize Dates rule does this in your browser. It looks at each column to work out whether it's day-first or month-first, for example a value like 25/03/2026 proves the column is day-first, and converts every date it recognises.",
        ],
      },
      {
        heading: "Option 2: import instead of opening",
        paragraphs: [
          "In Excel, use Data › From Text/CSV rather than double-clicking the file. In the preview, choose Transform Data, select the affected columns and set their type to Text. Excel then keeps the values exactly as they are in the file.",
          "This is the safest approach for codes and account numbers, but you'll need to convert date columns to real dates afterwards if you want to sort or filter by them.",
        ],
      },
      {
        heading: "Option 3: turn off automatic conversion",
        paragraphs: [
          "Recent Microsoft 365 versions have File › Options › Data › Automatic Data Conversion, where you can stop Excel removing leading zeros, converting long numbers and converting some text to dates. It applies to every file you open, and isn't available in older versions.",
        ],
      },
      {
        heading: "If the dates are already wrong",
        paragraphs: [
          "Once Excel has converted and saved a file, the original text is gone, so there's no reliable way back for dates where day and month are both 12 or under. Go back to the original export, clean it first, then open it.",
        ],
      },
    ],
    tool: "normalize-dates-csv",
  },
  {
    slug: "fix-garbled-characters-in-csv",
    title: "Why your CSV shows Ã© instead of é, and how to fix it",
    metaTitle: "Fix Ã©, â€™ and Other Garbled Characters in a CSV",
    metaDescription:
      "What causes mojibake like Ã©, â€™ and Ã¼ in CSV files, how to open the file correctly in Excel, and how to repair text that's already garbled.",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "Garbled characters appear when UTF-8 text is read as Windows-1252. Open the file with UTF-8 selected, or repair already-garbled text by reversing the misreading.",
    sections: [
      {
        heading: "What the garbled text means",
        paragraphs: [
          "Most modern software saves text as UTF-8, where characters outside basic English use two to four bytes. é is stored as the bytes C3 A9. Software that assumes the older Windows-1252 encoding reads each byte as its own character: C3 is Ã and A9 is ©. So é becomes Ã©.",
          "The same thing turns ’ (a curly apostrophe, three bytes) into â€™, ü into Ã¼ and € into â‚¬. Once you know the pattern, the original character can be worked out exactly.",
        ],
      },
      {
        heading: "If the file opens garbled in Excel",
        paragraphs: [
          "The file itself may be fine and Excel is reading it with the wrong encoding. Use Data › From Text/CSV, and in the preview set File Origin to 65001: Unicode (UTF-8). If the characters look right in the preview, load it.",
          "When you save a CSV from Excel for someone else, choose CSV UTF-8 (Comma delimited) rather than plain CSV, so accents survive the trip.",
        ],
      },
      {
        heading: "If the garbled text is in the file",
        paragraphs: [
          "Sometimes the damage has already been saved: a system read the text wrongly and wrote Ã© back into the export. Changing the encoding on import won't help, because the file really does contain Ã and ©.",
          "Find and replace works for a few characters but misses combinations and can break real text. A better approach reverses the misreading: turn each character back into its Windows-1252 byte, then decode the bytes as UTF-8. If the result is valid, the cell was garbled; if not, it was real text and should be left alone.",
          "That's what SpreadsheetFix's Fix Encoding rule does. It only changes a cell when the repair round-trips exactly, so genuine words like Zürich are never touched, and it can undo text that was garbled twice.",
        ],
      },
      {
        heading: "Files in an old encoding",
        paragraphs: [
          "Exports from older Windows software are sometimes saved in Windows-1252 rather than UTF-8. SpreadsheetFix detects this from the file's bytes and decodes it correctly, and every download is UTF-8.",
        ],
      },
    ],
    tool: "fix-csv-encoding",
  },
  {
    slug: "excel-remove-duplicates-not-working",
    title: "Excel's Remove Duplicates isn't removing duplicates: why and what to do",
    metaTitle: "Excel Remove Duplicates Not Working? 4 Reasons and Fixes",
    metaDescription:
      "Rows that look identical but survive Excel's Remove Duplicates usually differ by hidden spaces, case or formatting. How to find the difference and fix it.",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "Remove Duplicates compares values exactly. Hidden spaces, non-breaking spaces, numbers stored as text and differing columns make rows look the same but compare as different.",
    sections: [
      {
        heading: "1. Trailing or double spaces",
        paragraphs: [
          "“Acme Ltd” and “Acme Ltd ” look the same in a cell, but Excel treats them as different values. Check with =LEN(A2): if two apparently identical cells have different lengths, there are extra spaces.",
          "Fix it with =TRIM(A2) in a helper column, paste the results as values over the original, and run Remove Duplicates again.",
        ],
      },
      {
        heading: "2. Non-breaking spaces",
        paragraphs: [
          "Text copied from web pages, PDFs and some systems contains non-breaking spaces (character 160). TRIM ignores them. Use =TRIM(SUBSTITUTE(A2,CHAR(160),\" \")) to replace them with normal spaces first.",
        ],
      },
      {
        heading: "3. Numbers stored as text",
        paragraphs: [
          "If one row has 1200 as a number and another has “1200” as text, Excel sees two different values. A small green triangle in the corner of a cell is the usual sign. Select the column and use the warning menu's Convert to Number.",
        ],
      },
      {
        heading: "4. You compared every column",
        paragraphs: [
          "By default Remove Duplicates compares all selected columns. If the rows share an email address but have different timestamps or IDs, they're not duplicates by that definition. In the Remove Duplicates dialog, untick everything except the columns that identify a record.",
        ],
      },
      {
        heading: "Doing it in one step",
        paragraphs: [
          "SpreadsheetFix trims and collapses every kind of whitespace before comparing rows, and lets you choose key columns such as email. It also shows each row it will remove before you download, which Excel doesn't. Note that matching is still exact after spaces are normalised: “Acme Ltd” and “ACME Limited” are different values.",
        ],
      },
    ],
    tool: "remove-duplicates-csv",
  },
  {
    slug: "csv-vs-xlsx",
    title: "CSV vs XLSX: which format to use for exports and imports",
    metaTitle: "CSV vs XLSX: Differences and When to Use Each",
    metaDescription:
      "CSV is plain text that every system can read; XLSX keeps types, formulas and formatting. How to choose, and the problems each one causes.",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "Use CSV to move data between systems and XLSX when people will work with it in Excel. Most problems with CSV come from it having no column types.",
    sections: [
      {
        heading: "What each format stores",
        paragraphs: [
          "A CSV file is plain text: one line per row, values separated by commas (or semicolons in some regions). It stores nothing else: no column types, no formatting, no formulas, one sheet only.",
          "An XLSX file is a zipped set of XML documents. It stores each cell's type and value, formulas, formatting, multiple sheets, charts and more.",
        ],
      },
      {
        heading: "When to use CSV",
        paragraphs: [
          "Use CSV for imports and exports between systems: CRMs, accounting software, databases, email platforms. Almost every tool reads it, files are small, and the content is easy to inspect in a text editor.",
          "The trade-off is that whatever opens the file has to guess the types. That's where Excel's date and leading-zero problems come from, and why encoding matters: a CSV doesn't reliably say which character encoding it uses.",
        ],
      },
      {
        heading: "When to use XLSX",
        paragraphs: [
          "Use XLSX when the file is going to a person who'll work with it in Excel. Dates arrive as dates, codes keep their leading zeros and nobody needs an import wizard.",
          "Many import tools accept XLSX too, but some only take CSV, and multiple sheets or merged header cells can confuse them.",
        ],
      },
      {
        heading: "Converting between them",
        paragraphs: [
          "Going from XLSX to CSV loses formatting, formulas (only results are kept) and all but one sheet. Save as CSV UTF-8 to keep non-English characters.",
          "Going from CSV to XLSX is where cleaning pays off: fix dates, spacing and encoding in the CSV first, so the workbook starts with correct values. SpreadsheetFix accepts both formats; cleaned files download as CSV on the free plan or as XLSX on Pro.",
        ],
      },
    ],
    tool: "csv-to-excel-cleaner",
  },
];

export const GUIDE_MAP = new Map(GUIDES.map((g) => [g.slug, g]));
