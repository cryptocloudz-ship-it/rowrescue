import type { RulePreset } from "@/store/sheetStore";
import { FREE_RULES } from "@/config/plans";
import type { ToolFaq } from "./tools";

/**
 * Problem guides at /guides/<slug>: pages for people searching the exact error or symptom they see.
 * Each one explains the cause, the honest manual fix in Excel or Google Sheets, and the SpreadsheetFix fix,
 * with a before/after sample that guides.test.ts runs through the real engine.
 */
export interface GuidePage {
  slug: string;
  /** Short label used in cross-links */
  name: string;
  /** <title> — keep under 60 chars */
  metaTitle: string;
  /** Meta description — keep under 155 chars */
  metaDescription: string;
  h1: string;
  /** First published (YYYY-MM-DD), for Article JSON-LD */
  published: string;
  /** Last meaningful content change (YYYY-MM-DD), for the sitemap and dateModified */
  updated: string;
  /** The problem as the reader sees it, and what the page covers */
  summary: string;
  /** "Why this happens", one paragraph per entry */
  cause: string[];
  /** Fixing it by hand, one block per method or app */
  manualFix: { heading: string; steps: string[]; note?: string }[];
  /** "Fix it with SpreadsheetFix", one paragraph per entry */
  toolFix: string[];
  /** Honest limits of the SpreadsheetFix fix */
  limits: string[];
  /** The matching tool page; its uploader is embedded with `preset` */
  tool: string;
  preset: RulePreset;
  before: string;
  /** Must be exactly what the engine produces from `before` (checked in guides.test.ts) */
  after: string;
  afterNote?: string;
  /** Totals check for the sample's amount column, as the app shows it (checked in guides.test.ts) */
  totals?: { column: string; before: number; removed: number; after: number };
  faqs: ToolFaq[];
  relatedTools: string[];
  relatedGuides: string[];
}

export const GUIDES: GuidePage[] = [
  {
    slug: "csv-garbled-characters-excel",
    name: "Garbled characters (Ã©, â€™)",
    metaTitle: "Ã© or â€™ in a CSV Opened in Excel? How to Fix It",
    metaDescription:
      "Why a CSV shows Ã©, â€™ or Ã¼ in Excel, how to import it with the right encoding by hand, and how to repair text that is already garbled.",
    h1: "Why your CSV shows Ã© and â€™ in Excel, and how to fix it",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "You open a bank or CRM export in Excel and “Café” reads “CafÃ©”, “don’t” reads “donâ€™t”, and a euro sign has turned into “â‚¬”. In most cases nothing is wrong with the data: the file was saved as UTF-8 and Excel read it as a different encoding. This guide shows how to tell which of two situations you are in, how to fix each one in Excel or Google Sheets, and how SpreadsheetFix repairs both without you mapping characters by hand.",
    cause: [
      "Every character in a CSV is stored as one or more bytes, and the encoding is the rulebook that maps bytes to characters. UTF-8, which almost every modern system exports, stores plain English letters in one byte and accented letters, curly quotes and currency symbols in two or three. The CSV format has nowhere to declare which rulebook was used, so the program opening the file has to guess.",
      "When you double-click a CSV, Excel on Windows usually guesses your system’s legacy code page, typically Windows-1252 on English and Western European setups. That code page reads every byte as a character of its own. So the two bytes of é are shown as two characters, Ã and ©, and the three bytes of a curly apostrophe become â, € and ™. The pattern is distinctive: Ã or Â followed by an odd symbol almost always stands for an accented letter, and â€ followed by another character almost always stands for punctuation such as ’, “, – or •.",
      "Two different situations look identical on screen. In the first, the file is fine and only the way Excel opened it is wrong, so reopening it correctly fixes everything. In the second, someone already opened the file the wrong way and saved it, or a system upstream did, and the garbled characters are now the real content of the cells. Reimporting can’t help then, because the file genuinely contains “CafÃ©”. To tell them apart, open the CSV in a plain text editor such as Notepad or TextEdit: if you see “Café” there, it’s the first case; if you see “CafÃ©”, it’s the second.",
      "If garbled text goes through the same mistake a second time, each garbled character is garbled again, and é turns into a longer run such as ÃƒÂ©. The cause and the cure are the same, just applied twice.",
    ],
    manualFix: [
      {
        heading: "In Excel, when the file itself is fine",
        steps: [
          "Open a blank workbook instead of double-clicking the CSV.",
          "Go to Data > Get Data > From File > From Text/CSV (Data > From Text in older versions) and pick the file.",
          "In the preview window, set File Origin to 65001: Unicode (UTF-8). The preview updates straight away, so check that é and ’ now look right.",
          "Check the delimiter in the same window, then click Load.",
          "If you need to pass the file on, use File > Save As and choose CSV UTF-8 (Comma delimited). That format starts the file with a byte order mark, which tells Excel to read it as UTF-8 the next time someone opens it.",
        ],
        note: "Older versions of Excel, including on a Mac, use the Text Import Wizard instead, where the same setting is also called File origin.",
      },
      {
        heading: "In Google Sheets",
        steps: [
          "Use File > Import > Upload and choose the CSV.",
          "Sheets expects UTF-8, so a file that is fine displays correctly without any encoding setting.",
          "If the cells still show Ã© in Sheets, the garbling is inside the file itself, so follow the next method.",
        ],
      },
      {
        heading: "When the text itself is garbled",
        steps: [
          "Open Find and Replace (Ctrl+H) and make sure Match entire cell contents is switched off.",
          "Replace each garbled sequence with the character it stands for: Ã© with é, Ã¨ with è, Ã¼ with ü, Ã¶ with ö, â€™ with ’, â€“ with –, and so on for every accented letter and symbol your data uses.",
          "Do the longer sequences first. Many of them share their first characters, so replacing a short one too early can leave half-repaired text behind.",
          "Check a sample of rows afterwards, especially names from other languages: any sequence missing from your list stays broken.",
        ],
        note: "This works, but it is slow and easy to get wrong on a file with names from several countries, which is where an automatic repair earns its keep.",
      },
    ],
    toolFix: [
      "SpreadsheetFix handles both situations. When you load a CSV, it reads the raw bytes and decides the encoding itself: a byte order mark is honoured, valid UTF-8 is read as UTF-8, and anything that isn’t valid UTF-8 is read as Windows-1252, the code page older Windows software writes. A file that was only opened the wrong way comes through clean, with no setting to choose.",
      "For text that is already garbled, the Fix Encoding rule reverses the mistake instead of looking characters up in a table. It turns each character of a suspect cell back into the Windows-1252 byte it came from, then reads those bytes as UTF-8. If that gives valid text, the cell is replaced; if any character couldn’t have come from this mistake, the cell is left alone. Text that went through the mistake twice is repaired in a second pass.",
      "The CSV you download is UTF-8 with a byte order mark, so double-clicking it in Excel shows the accents correctly. Every changed cell is listed in the preview before you export, and amount columns are covered by the totals check, so you can confirm that repairing payee names didn’t touch a single number.",
    ],
    limits: [
      "A cell is only repaired when the whole cell round-trips. A cell that mixes correct accents with garbled ones, such as “Rosé CafÃ©”, is left as it is, so search the preview for Ã and â€ after cleaning.",
      "Characters that were saved as question marks or replacement boxes (? or �) can’t be recovered. Those bytes were thrown away when the file was written, so the only fix is a fresh export from the source system.",
      "Other legacy encodings, such as the code pages used for Cyrillic, Greek or Japanese files, aren’t detected. A file that isn’t valid UTF-8 is always read as Windows-1252.",
    ],
    tool: "fix-csv-encoding",
    preset: { ruleIds: ["fixEncoding"] },
    before: `date,payee,memo,amount
2024-03-04,CafÃ© MÃ¼ller,Team coffee,-18.40
2024-03-05,SÃ£o Paulo Imports,Invoice â€“ March,-1250.00
2024-03-06,ZoÃ« Dupont,Refund â€“ didnâ€™t arrive,45.00`,
    after: `date,payee,memo,amount
2024-03-04,Café Müller,Team coffee,-18.40
2024-03-05,São Paulo Imports,Invoice – March,-1250.00
2024-03-06,Zoë Dupont,Refund – didn’t arrive,45.00`,
    afterNote: "5 cells repaired. Dates and amounts are unchanged.",
    faqs: [
      {
        q: "Why does Excel show Ã© instead of é?",
        a: "Your CSV was saved as UTF-8 and Excel opened it with your computer’s legacy code page, usually Windows-1252, which reads each of the two bytes of é as a separate character. Import the file with File Origin set to UTF-8, or load it in SpreadsheetFix, which detects the encoding for you.",
      },
      {
        q: "What does â€™ mean in a spreadsheet?",
        a: "It is a curly apostrophe (’) whose three UTF-8 bytes were read as three Windows-1252 characters. In the same way, â€“ is an en dash, â€¢ is a bullet and â‚¬ is a euro sign.",
      },
      {
        q: "Will saving as CSV UTF-8 fix it?",
        a: "Only if the cells look right when you save. Saving as CSV UTF-8 stores whatever is in the cells, so if they already contain garbled text, the new file contains that garbled text too, correctly encoded.",
      },
      {
        q: "Is my file uploaded to repair it?",
        a: "No. The bytes are decoded and repaired in your browser, and the file never reaches SpreadsheetFix’s servers. Fix Encoding is a free rule for files up to 5,000 rows.",
      },
    ],
    relatedTools: ["fix-csv-encoding", "csv-to-excel-cleaner", "remove-html-tags-csv"],
    relatedGuides: ["vlookup-na-hidden-spaces", "excel-european-number-format"],
  },
  {
    slug: "csv-dates-day-month-swapped",
    name: "Day and month swapped",
    metaTitle: "CSV Dates With Day and Month Swapped? How to Fix Them",
    metaDescription:
      "Why Excel reads 03/04/2024 as 4 March instead of 3 April, how to reimport a bank CSV with the right date order, and how to fix every date at once.",
    h1: "Fix CSV dates with the day and month swapped",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "Your bank statement says the insurance went out on 3 April, but the spreadsheet says 4 March. A few rows down, 15/04/2024 sits on the left of its cell as text while the dates above it sit on the right. This is the most common date problem with bank exports: the file and your spreadsheet disagree about whether the day or the month comes first. Here is why it happens, how to fix it by hand in Excel and Google Sheets before an accounting import, and how SpreadsheetFix works out the order for each column.",
    cause: [
      "A date written as 03/04/2024 has no single meaning. In the UK, Ireland, most of Europe, Australia and much of the rest of the world it is 3 April. In the US it is 4 March. A CSV stores it as plain text, with nothing to say which convention the bank used.",
      "When Excel opens a CSV, it reads dates using the regional settings of your computer, not of the file. On a computer set to US English, it reads 03/04/2024 as 4 March. Then it reaches 15/04/2024, which can’t be month 15, so it gives up and keeps that cell as text. The result is a column in which every date that could be read either way has been converted wrongly and silently, and the rest are text. Sorting, filtering and date arithmetic give nonsense, and an accounting import either rejects the text dates or books the converted ones to the wrong month.",
      "The reverse happens when a day-first computer opens a US export. And once Excel has converted the wrong dates, they are real date values, so saving the file locks the mistake in: the original text is gone and the saved CSV contains the swapped dates. That is why every fix below starts from the original export, not from a copy that has been opened and saved.",
      "Mixed formats add a second layer. Files merged from two sources, or exports where someone has edited a few rows by hand, can hold 2024-04-16, 16 Apr 2024 and 16/04/2024 in the same column. An import screen asks you for one date format and applies it to every row, so a single stray format is enough to fail the import or move a payment into a different period.",
    ],
    manualFix: [
      {
        heading: "In Excel, with Power Query",
        steps: [
          "Start from the original CSV, not a copy that was opened and saved in Excel.",
          "In a blank workbook, go to Data > From Text/CSV, pick the file and click Transform Data.",
          "Right-click the date column and choose Change Type > Using Locale. Set the data type to Date and the locale to one that writes dates the way your bank does, for example English (United Kingdom) for day-first dates.",
          "Click Close & Load. Every date in the column is read with the order you chose, whatever your computer’s settings are.",
        ],
      },
      {
        heading: "In Excel, with Text to Columns",
        steps: [
          "Select the date column and choose Data > Text to Columns.",
          "Click Next twice, choose Date in step 3, and pick the order the file uses, such as DMY.",
          "Click Finish. Excel converts each text date using that order.",
        ],
        note: "This only helps with cells that are still text. Dates Excel has already converted the wrong way are numbers now, and have to come from the original file.",
      },
      {
        heading: "In Google Sheets",
        steps: [
          "Before importing, open File > Settings and set Locale to a country that uses the file’s date order, such as United Kingdom.",
          "Import with File > Import and leave the option to convert text to numbers, dates and formulas switched on.",
          "Compare a few dates whose day is 12 or lower with the bank statement before you rely on the result.",
        ],
      },
      {
        heading: "When one column mixes several formats",
        steps: [
          "Sort or filter the column so that text dates separate from real ones; text is left-aligned by default.",
          "Convert the leftovers with a formula, for example =DATE(RIGHT(A2,4),MID(A2,4,2),LEFT(A2,2)) for text in DD/MM/YYYY form with two-digit days and months.",
          "Paste the results back as values and give the whole column one format, ideally yyyy-mm-dd.",
        ],
      },
    ],
    toolFix: [
      "SpreadsheetFix reads the dates as text, exactly as the bank wrote them, before any spreadsheet has had a chance to convert them, and decides the order for each column from the evidence in that column. If any date has a first number above 12, such as 15/04/2024, the column must be day-first. If any has a second number above 12, such as 04/15/2024, it must be month-first. Every other date in the column is then read the same way, so 03/04/2024 next to 15/04/2024 becomes 2024-04-03.",
      "Each column is judged on its own, so a transaction date and a value date produced by different systems can follow different conventions in the same file. ISO dates such as 2024-04-16 and English month names such as 16 Apr 2024 or April 16, 2024 are recognised too. Everything is rewritten as YYYY-MM-DD, which sorts correctly even as text and can’t be misread by the next program that opens it. Cells that aren’t dates are left as they are.",
      "Load the CSV straight from your bank, check the converted dates in the preview, and download. Normalize Dates is a free rule for files up to 5,000 rows, and the statement is read in your browser rather than uploaded.",
    ],
    limits: [
      "If every date in a column has both numbers at 12 or below, as in an export covering only the first twelve days of a month, there is no evidence either way, and SpreadsheetFix reads the column day-first. For a US export, compare the first rows with the statement before you import.",
      "Two-digit years are read the way Excel reads them: 00 to 29 become 2000 to 2029, and 30 to 99 become 1930 to 1999. They follow the same per-column day/month detection as four-digit years, but a date before 1930 needs a four-digit year to come out right.",
      "A swap that Excel has already saved into the file can’t be undone from that file. Download the export again and clean the fresh copy.",
    ],
    tool: "normalize-dates-csv",
    preset: { ruleIds: ["normalizeDate"], options: { normalizeDate: { targetFormat: "YYYY-MM-DD", dateOrder: "auto" } } },
    before: `date,description,amount
03/04/2024,Direct debit Insurance,-61.20
15/04/2024,Salary,2500.00
2024-04-16,Card payment Fuel,-48.75
18 Apr 2024,Transfer to savings,-300.00`,
    after: `date,description,amount
2024-04-03,Direct debit Insurance,-61.20
2024-04-15,Salary,2500.00
2024-04-16,Card payment Fuel,-48.75
2024-04-18,Transfer to savings,-300.00`,
    afterNote: "15/04/2024 proves the column is day-first, so 03/04/2024 is read as 3 April.",
    faqs: [
      {
        q: "Why does Excel swap the day and month in my CSV?",
        a: "Excel reads CSV dates with your computer’s regional settings. If the file was written day-first and your computer expects month-first, or the other way round, every date with a day of 12 or less is converted the wrong way and the rest are left as text.",
      },
      {
        q: "How do I stop Excel changing dates when I open a CSV?",
        a: "Don’t double-click the file. Import it with Data > From Text/CSV and set the column’s locale in Power Query, or use Text to Columns with the right date order. Or convert the dates to YYYY-MM-DD first, which Excel reads the same way in every region.",
      },
      {
        q: "Which date format should I use for an accounting import?",
        a: "Whichever the import screen asks for, as long as every row follows it. Many import tools have you pick the file’s date format during column mapping and apply that choice to every row, so a column that mixes formats is what causes rejected rows or entries in the wrong month.",
      },
      {
        q: "Does SpreadsheetFix change my original file?",
        a: "No. The file is read in your browser and the original stays untouched on your computer. You download a cleaned copy after checking every change in the preview.",
      },
    ],
    relatedTools: ["normalize-dates-csv", "csv-to-excel-cleaner", "remove-duplicates-csv"],
    relatedGuides: ["excel-european-number-format", "duplicate-transactions-bank-csv"],
  },
  {
    slug: "duplicate-transactions-bank-csv",
    name: "Duplicate transactions",
    metaTitle: "Duplicate Transactions in a Bank CSV? Find and Remove Them",
    metaDescription:
      "Why bank CSV exports contain duplicate transactions, how to find them in Excel without deleting real repeat payments, and how to check the totals after.",
    h1: "Remove duplicate transactions from a bank CSV",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "Your reconciliation is out by exactly the amount of one payment, and that payment appears twice. Duplicate transactions are easy to create and expensive to miss, but deleting them carelessly is just as bad: two identical coffees on the same day are two real purchases. This guide covers where duplicates come from, how to find them by hand in Excel or Google Sheets, and how SpreadsheetFix removes them while showing you exactly how much money it took out.",
    cause: [
      "Most duplicates come from overlapping date ranges. You export March on the 31st while that day’s card payments are still pending, then export again on 2 April starting from the 31st, and every transaction that had already cleared on the 31st is now in both files. Stitch the two together and those rows are doubled.",
      "Others come from the process around the file: a statement uploaded to accounting software for a period that was also arriving through a bank feed, a monthly export downloaded twice and merged, or a copy and paste that grabbed one row too many. Some banks also list a pending card payment and then the settled version of the same payment, sometimes with a slightly different description or date.",
      "The difficulty is that real transactions can be identical too. Two £3.50 coffees from the same café on the same day produce two rows with the same date, description and amount, and if the bank doesn’t export a transaction reference, nothing in the file separates them from a genuine duplicate. Any method of removing duplicates has to answer two questions: what counts as the same transaction, and how will you know what was removed?",
    ],
    manualFix: [
      {
        heading: "Find them in Excel first",
        steps: [
          'Add a helper column that joins the fields identifying a transaction, for example =A2&"|"&B2&"|"&D2 for date, description and amount, or just the reference column if your bank exports one.',
          "Next to it, count how often each key appears with =COUNTIF(E:E,E2). Anything above 1 is a candidate duplicate.",
          "Filter the count column for values above 1 and check each group against the bank statement. Delete only the rows that are true copies.",
          "Compare the SUM of the amount column before and after. The difference should equal the total of the rows you deleted.",
        ],
      },
      {
        heading: "Or use Remove Duplicates",
        steps: [
          "Keep a copy of the original sheet, select the data and choose Data > Remove Duplicates.",
          "Tick only the columns that identify a transaction. Ticking every column removes only rows that match in every cell; ticking too few removes real repeat payments.",
          "Excel tells you how many rows it removed but not which ones, so compare against the copy you kept.",
        ],
        note: "Google Sheets has the same command under Data > Data cleanup > Remove duplicates, with the same choice of columns. Both compare cell contents exactly, so a copy whose description has an extra trailing space is not treated as a duplicate.",
      },
    ],
    toolFix: [
      "SpreadsheetFix’s Remove Duplicates rule keeps the first copy of each row and removes later ones. By default a row only counts as a duplicate when every cell matches, which is the cautious choice for bank exports: two coffees with different references or different times stay in the file. If your bank exports a reliable reference or transaction ID, you can use the column picker to compare only that column instead.",
      "Before you export, the preview lists every removed row, and the totals check sets out what happened to the money. For each amount column it shows the total before cleaning, the total of the rows each rule removed, and the total after, and checks that the total before, minus what was removed, equals the total after to the cent. If the removed amount doesn’t match a duplicate you can find on the statement, look again before you import.",
      "Remove Duplicates is a free rule for files up to 5,000 rows, and the file is processed in your browser, so the statement never leaves your computer.",
    ],
    limits: [
      "Exact matching won’t catch a pending payment and its settled version if the description or date changed between them. Look for those by amount and review them by hand.",
      "If two genuine payments are identical in every exported column, nothing in the file can separate them, and exact matching removes the second one. Check the removed rows against the statement; that is what the list of removed rows is for.",
      "Comparing only some columns is more aggressive. Picking just date and amount, for example, would remove two different suppliers paid the same amount on the same day.",
    ],
    tool: "remove-duplicates-csv",
    preset: { ruleIds: ["deduplicateRows"] },
    before: `date,description,reference,amount
2024-05-01,Office supplies,TX-88213,-64.30
2024-05-02,Client payment Acme,TX-88240,1200.00
2024-05-02,Client payment Acme,TX-88240,1200.00
2024-05-03,Coffee,TX-88251,-3.50
2024-05-03,Coffee,TX-88252,-3.50`,
    after: `date,description,reference,amount
2024-05-01,Office supplies,TX-88213,-64.30
2024-05-02,Client payment Acme,TX-88240,1200.00
2024-05-03,Coffee,TX-88251,-3.50
2024-05-03,Coffee,TX-88252,-3.50`,
    afterNote: "1 exact copy removed. The two coffees have different references, so both stay.",
    totals: { column: "amount", before: 2328.7, removed: 1200, after: 1128.7 },
    faqs: [
      {
        q: "Why does my bank CSV have duplicate transactions?",
        a: "Usually because two exports overlapped by a day or more, or because the same period arrived twice, once through a bank feed and once as an uploaded statement. Pending card payments that later settle can also appear twice.",
      },
      {
        q: "How do I remove duplicates in Excel without deleting real transactions?",
        a: "Mark candidates with a COUNTIF helper column and review them before deleting anything, or use Data > Remove Duplicates with only the columns that identify a transaction ticked. Keep the original sheet so you can see what was removed.",
      },
      {
        q: "Which copy is kept?",
        a: "SpreadsheetFix keeps the first occurrence in the file and removes the later ones, so the original row order is preserved.",
      },
      {
        q: "How do I know the totals are still right?",
        a: "The totals check lists, for every amount column, the total before cleaning, the amount each rule removed and the total after, and flags any column where those don’t add up to the cent.",
      },
    ],
    relatedTools: ["remove-duplicates-csv", "merge-csv-files", "trim-whitespace-csv"],
    relatedGuides: ["csv-dates-day-month-swapped", "vlookup-na-hidden-spaces"],
  },
  {
    slug: "excel-european-number-format",
    name: "European number format (1.234,56)",
    metaTitle: "European Numbers (1.234,56) in Excel: Fix SUM and Imports",
    metaDescription:
      "Why Excel can’t add 1.234,56 or 950,00 and leaves them as text, how to convert European number formats by hand, and how to fix a whole bank export.",
    h1: "Fix European number formats (1.234,56) in Excel and CSV imports",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "A bank export from Germany, the Netherlands, France or Spain lands in an English-language Excel, and the SUM under the amount column says 0, or a figure that is clearly too small. Some cells sit on the left, some on the right. The file isn’t broken: it uses a comma as the decimal separator and a dot or space to group thousands, and your spreadsheet expects the opposite. Here is what goes wrong, how to convert the numbers by hand, and how SpreadsheetFix converts a whole file at once.",
    cause: [
      "Most of continental Europe writes one thousand two hundred and thirty-four euros fifty-six as 1.234,56, France and the Nordic countries often as 1 234,56, and English-language settings as 1,234.56. A CSV stores whichever version the bank produced, as text, and the program that opens it decides what the characters mean based on your computer’s regional settings.",
      "On a computer that uses a dot for decimals, Excel can’t read 1.234,56 or 950,00 as numbers, so it keeps them as text. SUM, AVERAGE and pivot tables skip text without any error, which is why the total comes out at 0 or too low instead of failing loudly. Worse is a value that happens to fit the local format: an amount written without decimals, such as 2.500, means two thousand five hundred in a German export but is read as two and a half, and looks like a perfectly normal number.",
      "The same mismatch breaks imports. Accounting software and databases that expect dot decimals reject 950,00 as an invalid amount or read it differently from what the bank meant. And because the comma is already taken by decimals, European banks often separate columns with semicolons, so the file opens as a single column when you double-click it.",
    ],
    manualFix: [
      {
        heading: "In Excel, with Text to Columns",
        steps: [
          "Select the amount column and choose Data > Text to Columns.",
          "Choose Delimited, click Next, clear every delimiter, and click Next again.",
          "In step 3, click Advanced and set the decimal separator to a comma and the thousands separator to a dot, or to a space if that is what the file uses. These settings describe the file, not your computer.",
          "Click OK, then Finish. The column becomes real, right-aligned numbers that SUM can add. Repeat for each amount column.",
        ],
        note: "Cells Excel already read the wrong way, such as 2.500, are numbers now and Text to Columns won’t touch them. For those, start from the original CSV and import it through Data > From Text/CSV, using Change Type > Using Locale in Power Query with a European locale.",
      },
      {
        heading: "In Excel, with a formula",
        steps: [
          'In a helper column, use =NUMBERVALUE(C2,",",".") to read the text in C2 with a comma as the decimal separator and a dot as the group separator.',
          "Fill it down, then copy the helper column and paste it over the original as values.",
        ],
        note: "NUMBERVALUE is available in Excel 2013 and later.",
      },
      {
        heading: "In Google Sheets",
        steps: [
          "Before importing, open File > Settings and set Locale to a country that writes numbers the way the file does, such as Germany.",
          "Import with File > Import, choose semicolon as the separator if the file uses one, and keep the conversion of text to numbers switched on.",
          "Sheets now stores real numbers. If you switch the locale back afterwards, spot-check a few amounts against the statement.",
        ],
      },
    ],
    toolFix: [
      "SpreadsheetFix’s Normalize Numbers rule reads the separators in each cell and rewrites the value as a plain dot-decimal number. When a cell has a dot followed by three digits and also a comma, as in 1.234,56, the dots are treated as thousands separators and the comma as the decimal point. A single comma with no dot, as in 950,00 or -4,90, is read as the decimal point. Spaces between digit groups are removed, and currency symbols such as € and £ are stripped, so “€8.410,20” becomes 8410.20.",
      "Semicolon-separated files are detected when they load, and the cleaned file is written with commas between columns and dots in the numbers, which is what an English-language Excel and most databases and accounting imports expect.",
      "The totals check reads amounts in either style, so it compares each amount column’s total before and after conversion. If the conversion read a value differently from the way the totals check reads it, that column shows as off, with the difference. Normalize Numbers is a Pro rule; the file is converted in your browser and isn’t uploaded.",
    ],
    limits: [
      "A comma followed by exactly three digits, as in 1,234, is read as a US-style thousands separator and becomes 1234. In a European file that could mean one point two three four, so check three-decimal values such as exchange rates or weights in the preview.",
      "A value like 2.500 with no comma is left as it is, and dot-decimal software reads it as two and a half. If your file writes whole thousands this way, check those cells.",
      "The rule applies to every column unless you pick columns, so phone numbers lose their spaces and other numeric codes can change. Use the column picker to limit it to your amount columns.",
      "Currency codes written as letters aren’t removed, so a cell such as 12,50 EUR is left unchanged.",
    ],
    tool: "convert-comma-decimal-csv",
    preset: { ruleIds: ["normalizeNumbers"] },
    before: `date;description;amount;balance
2024-03-01;Stripe payout;1.234,56;€8.410,20
2024-03-04;Office rent;-950,00;€7.460,20
2024-03-05;Bank fee;-4,90;€7.455,30`,
    after: `date,description,amount,balance
2024-03-01,Stripe payout,1234.56,8410.20
2024-03-04,Office rent,-950.00,7460.20
2024-03-05,Bank fee,-4.90,7455.30`,
    afterNote: "Semicolon-separated input, comma-separated output. The amount and balance totals match before and after.",
    faqs: [
      {
        q: "Why does Excel SUM return 0 for my numbers?",
        a: "The cells are text, not numbers. With European formatting such as 1.234,56 in an English-language Excel, the values can’t be read as numbers, and SUM skips text without an error. Convert the column with Text to Columns or NUMBERVALUE, or convert the file before opening it.",
      },
      {
        q: "How do I open a semicolon-separated CSV in Excel?",
        a: "Use Data > From Text/CSV and choose Semicolon as the delimiter in the preview window, rather than double-clicking the file.",
      },
      {
        q: "Should I change my computer’s regional settings instead?",
        a: "You can, but it changes how every program on the computer reads and writes numbers and dates, including the CSVs you send to other people. Converting the file is usually the smaller change.",
      },
      {
        q: "Is Normalize Numbers free?",
        a: "It is part of Pro. Free users can still fix encoding, dates, spacing and duplicates on files up to 5,000 rows.",
      },
    ],
    relatedTools: ["convert-comma-decimal-csv", "normalize-dates-csv", "csv-to-excel-cleaner"],
    relatedGuides: ["csv-dates-day-month-swapped", "csv-garbled-characters-excel"],
  },
  {
    slug: "vlookup-na-hidden-spaces",
    name: "VLOOKUP #N/A from hidden spaces",
    metaTitle: "VLOOKUP Returns #N/A but the Values Match? Hidden Spaces",
    metaDescription:
      "Why VLOOKUP and XLOOKUP return #N/A on values that look identical, how to find trailing and non-breaking spaces in Excel, and how to clean a whole file.",
    h1: "VLOOKUP returns #N/A but the values match: fixing hidden spaces",
    published: "2026-10-21",
    updated: "2026-10-21",
    summary:
      "You look up an invoice number from your bank export in the invoice list, and VLOOKUP returns #N/A even though INV-1001 is plainly there in both sheets. Most of the time the two values aren’t actually the same: one has a space you can’t see at the end, at the start or doubled in the middle, or a non-breaking space that came from a web page or PDF. This guide shows how to confirm that’s the problem, how to clean it with formulas, and how SpreadsheetFix cleans every cell in a file at once.",
    cause: [
      "VLOOKUP, XLOOKUP, MATCH and COUNTIF compare text character by character. “INV-1001” and “INV-1001 ” differ by one character, so the lookup fails, and nothing on screen tells you why. Exports are full of these: fixed-width fields from older accounting systems padded with trailing spaces, names typed with a double space, references copied out of an email or a banking portal.",
      "The most stubborn one is the non-breaking space. Web pages and PDFs use it to keep words together, and it comes along when you copy from them. It looks exactly like a normal space but is a different character, code 160 instead of 32. Excel’s TRIM function only removes code 32, so a cell can go through TRIM and still fail the lookup. Tabs and line breaks pasted into a cell cause the same problem.",
      "Spaces don’t only break lookups. Remove Duplicates treats “Contoso GmbH” and “Contoso  GmbH” as two different customers, pivot tables split one supplier into two rows, and an import that matches on customer or invoice number creates a new record instead of updating the existing one.",
    ],
    manualFix: [
      {
        heading: "Confirm it’s whitespace",
        steps: [
          "Compare lengths: =LEN(A2) gives more characters than you can see when something is hidden.",
          "Test the two cells directly with a formula such as =A2=Sheet2!A2. FALSE on values that look the same confirms they differ.",
          "Find out what the last character is with =CODE(RIGHT(A2,1)). 32 is a normal space, 160 a non-breaking space, 9 a tab and 10 a line break.",
        ],
      },
      {
        heading: "Clean it with formulas",
        steps: [
          'In a helper column, use =TRIM(SUBSTITUTE(A2,CHAR(160)," ")). SUBSTITUTE turns non-breaking spaces into normal ones, then TRIM removes spaces from both ends and reduces runs of spaces inside the text to one.',
          'To remove line breaks and other non-printing characters too, wrap it in CLEAN: =TRIM(CLEAN(SUBSTITUTE(A2,CHAR(160)," "))). CLEAN deletes line breaks rather than turning them into spaces, so words on either side of one can run together.',
          "Fill down, paste the helper column over the original as values, and do the same in the other sheet: both sides of a lookup need cleaning.",
        ],
        note: "Google Sheets has the same TRIM, CLEAN, SUBSTITUTE and CHAR functions, and its TRIM has the same blind spot for non-breaking spaces.",
      },
    ],
    toolFix: [
      "SpreadsheetFix’s Trim Whitespace rule does the formula work across every text cell in the file. It removes whitespace from both ends of each cell and collapses any run of whitespace inside it to a single space. That covers normal spaces, non-breaking spaces, tabs and line breaks, so a reference that ends in a non-breaking space comes out the same as one typed cleanly.",
      "Clean both files you are matching, the bank export and the invoice list, or the CRM export and the order sheet, and the lookups line up. Every changed cell is highlighted in the preview with its value before and after, so you can see which references were carrying hidden characters. If a column needs its spacing kept, such as a fixed-width code, use the column picker to leave it out.",
      "Trim Whitespace is a free rule for files up to 5,000 rows, and it runs in your browser, so neither file is uploaded.",
    ],
    limits: [
      "Zero-width characters, such as the zero-width space some websites insert, don’t count as whitespace and aren’t removed. If LEN still reports extra characters after cleaning, find them with =UNICODE(MID(A2,n,1)) for each position n.",
      "Line breaks inside a cell are turned into a single space rather than deleted, so a two-line address becomes one line.",
      "A lookup can also fail for reasons that have nothing to do with whitespace: a number stored as text on one side and as a number on the other, or a lookup range that doesn’t start at the column you are searching. If the values still don’t match after cleaning, check those next.",
    ],
    tool: "trim-whitespace-csv",
    preset: { ruleIds: ["trimWhitespace"] },
    before: `invoice,customer,amount
"INV-1001 ",Northwind Ltd,450.00
" INV-1002","Contoso  GmbH",1200.00
"INV-1003 ",Fabrikam Inc,89.90`,
    after: `invoice,customer,amount
INV-1001,Northwind Ltd,450.00
INV-1002,Contoso GmbH,1200.00
INV-1003,Fabrikam Inc,89.90`,
    afterNote: "The space after INV-1003 is a non-breaking space, which TRIM in Excel would leave in place.",
    faqs: [
      {
        q: "Why does VLOOKUP return #N/A when the value is there?",
        a: "Usually because the two values differ by a character you can’t see, most often a trailing space or a non-breaking space. Check with =LEN() or a direct comparison such as =A2=B2, then clean both sides.",
      },
      {
        q: "Why doesn’t TRIM fix my VLOOKUP?",
        a: "TRIM only removes the normal space character. Non-breaking spaces copied from web pages and PDFs are a different character, so turn them into normal spaces first with SUBSTITUTE and CHAR(160), then trim.",
      },
      {
        q: "Does trimming remove the spaces between words?",
        a: "No. Single spaces between words are kept. Spaces at the start and end are removed, and runs of two or more are reduced to one.",
      },
      {
        q: "Can I clean only some columns?",
        a: "Yes. Trim Whitespace applies to every text column by default, and its column picker lets you limit it to the columns you choose.",
      },
    ],
    relatedTools: ["trim-whitespace-csv", "remove-duplicates-csv", "remove-html-tags-csv"],
    relatedGuides: ["duplicate-transactions-bank-csv", "csv-garbled-characters-excel"],
  },
];

export const GUIDE_MAP = new Map(GUIDES.map((g) => [g.slug, g]));

/** True when a guide's preset includes a rule that only Pro unlocks. */
export function guideNeedsPro(guide: GuidePage): boolean {
  return guide.preset.ruleIds.some((id) => !FREE_RULES.includes(id));
}

/** Newest `updated` across all guides, for the /guides index in the sitemap. */
export function guidesUpdated(): string {
  return GUIDES.map((g) => g.updated).sort().at(-1)!;
}
