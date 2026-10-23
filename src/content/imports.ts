import type { RulePreset } from "@/store/sheetStore";
import { FREE_RULES, FREE_MAX_ROWS } from "@/config/plans";
import type { ToolFaq } from "./tools";

/**
 * Import pages at /import/<bank>-to-<software>: how to get one bank's CSV export into one accounting
 * product's bank statement import. Software requirements come from the vendor's own help pages. Banks
 * don't publish their CSV layouts, so each bank's header row is one that independent parsers and guides
 * agree on, and the page says so. Samples are checked against the real engine in imports.test.ts.
 */

export interface Source {
  label: string;
  url: string;
}

export type BankId = "revolut" | "wise" | "monzo";
export type SoftwareId = "xero" | "quickbooks";

export interface Bank {
  name: string;
  /** How to get the export, from the bank's own help centre */
  exportSteps: string[];
  /** The bank's own help pages (export route and formats) */
  officialSources: Source[];
  /** Where the column layout comes from: parser code and guides that agree on it */
  layoutSources: Source[];
}

export interface Software {
  name: string;
  /** What the import needs, each point from the vendor's documentation */
  requirements: string[];
  sources: Source[];
}

export const BANKS: Record<BankId, Bank> = {
  revolut: {
    name: "Revolut",
    exportSteps: [
      "In the Revolut app, go to Home, tap Accounts and pick the currency account.",
      "Tap More (…), then Statement.",
      "Choose the period, pick Excel rather than PDF, and tap Generate.",
    ],
    officialSources: [
      {
        label: "Revolut Help: Download an account statement for a specific currency",
        url: "https://help.revolut.com/en-GB/help/profile-and-plan/managing-my-account/account-statement-per-chosen-currency/",
      },
    ],
    layoutSources: [
      {
        label: "ofxstatement-revolut: parser code and sample statement",
        url: "https://github.com/mlaitinen/ofxstatement-revolut/blob/master/src/ofxstatement/plugins/revolut.py",
      },
      {
        label: "beancount-importers: Revolut importer",
        url: "https://github.com/Evernight/beancount-importers/blob/main/src/beancount_importers/import_revolut.py",
      },
      { label: "revolut-toolkit: statement file format", url: "https://github.com/lastunicorn/revolut-toolkit" },
    ],
  },
  wise: {
    name: "Wise",
    exportSteps: [
      "On the Wise website, click your initials and open Statements and reports, then Statement.",
      "Choose the currencies and the period. One statement covers up to 365 days.",
      "Pick CSV (XLSX also works here) and download the file.",
    ],
    officialSources: [
      { label: "Wise Help: How do I download a statement?", url: "https://wise.com/help/articles/2736049/how-do-i-download-a-statement" },
      {
        label: "Wise Help: Using accounting exports with your accounting software",
        url: "https://wise.com/help/articles/3eYyJYoIeAGrftknu4ImNC/using-accounting-exports-with-your-accounting-software",
      },
    ],
    layoutSources: [
      {
        label: "ledger-autosync: Wise CSV plugin (full header list)",
        url: "https://github.com/egh/ledger-autosync/blob/master/examples/plugins/wise.py",
      },
      {
        label: "ofxstatement-transferwise: parser code and sample statement",
        url: "https://github.com/kedder/ofxstatement-transferwise",
      },
      {
        label: "beancount-importers: Wise importer",
        url: "https://github.com/Evernight/beancount-importers/blob/main/src/beancount_importers/import_wise.py",
      },
    ],
  },
  monzo: {
    name: "Monzo",
    exportSteps: [
      "In the Monzo app, tap the three vertical dots on your card.",
      "Tap Bank statements and choose the date range.",
      "Choose CSV as the format.",
    ],
    officialSources: [
      { label: "Monzo Help: Exporting your transactions", url: "https://monzo.com/help/budgeting-overdrafts-savings/exporting-my-transactions" },
    ],
    layoutSources: [
      {
        label: "beancount-importers: Monzo importer",
        url: "https://github.com/Evernight/beancount-importers/blob/main/src/beancount_importers/import_monzo.py",
      },
      { label: "monzo-crunch-convert: converter code", url: "https://github.com/brabster/monzo-crunch-convert/blob/main/convert.py" },
      { label: "beancount.io: Monzo CSV notes", url: "https://beancount.io/tools/csv-to-beancount/monzo" },
    ],
  },
};

export const SOFTWARE: Record<SoftwareId, Software> = {
  xero: {
    name: "Xero",
    requirements: [
      "Only Date and Amount are required. Payee, Description and Reference are optional.",
      "Money in and money out share one Amount column: income positive, expenses negative.",
      "Dates in a listed format, such as DD/MM/YYYY, MM/DD/YYYY or DD-MM-YYYY.",
      "Delete opening and closing balance columns, the account number and empty rows.",
      "A header row in row 1, with a unique name for each column.",
      "No more than 100,000 rows per file.",
    ],
    sources: [
      { label: "Xero Central: Import a bank statement in CSV format", url: "https://central.xero.com/0/article/Import-a-CSV-bank-statement" },
    ],
  },
  quickbooks: {
    name: "QuickBooks Online",
    requirements: [
      "Exactly 3 columns (Date, Description, Amount) or 4 (Date, Description, Credit, Debit).",
      "One date format for every row; Intuit recommends dd/mm/yyyy.",
      "Leave zero amounts blank instead of writing 0.",
      "No numbers or special characters in the Description column.",
      "The file must be 350 KB or less, with up to 1,000 lines per upload.",
    ],
    sources: [
      {
        label: "QuickBooks Help: Prepare your CSV file for bank upload to QuickBooks",
        url: "https://quickbooks.intuit.com/learn-support/en-uk/help-article/bank-transactions/format-csv-files-excel-get-bank-transactions/L4BjLWckq_GB_en_GB",
      },
      {
        label: "QuickBooks Help: Manually upload transactions into QuickBooks Online",
        url: "https://quickbooks.intuit.com/learn-support/en-uk/help-article/import-transactions/manually-upload-transactions-quickbooks-online/L0rE9OXBz_GB_en_GB",
      },
    ],
  },
};

export interface ImportPage {
  slug: string;
  bank: BankId;
  software: SoftwareId;
  /** Short label used in cross-links */
  name: string;
  /** <title> — keep under 60 chars */
  metaTitle: string;
  /** Meta description — keep under 155 chars */
  metaDescription: string;
  h1: string;
  /** First published (YYYY-MM-DD) */
  published: string;
  /** Last meaningful content change (YYYY-MM-DD), for the sitemap and dateModified */
  updated: string;
  summary: string;
  /** The bank's header row, as the exports in layoutSources show it */
  exportHeader: string;
  /** What the bank's file looks like, one paragraph per entry */
  exportNotes: string[];
  /** Where the bank's file and the software's import disagree, and the fix for each */
  gaps: { problem: string; fix: string }[];
  /** The whole job, from export to import, in order */
  steps: string[];
  /** "What SpreadsheetFix does here", one paragraph per entry */
  toolFix: string[];
  limits: string[];
  preset: RulePreset;
  before: string;
  /** Exactly what the engine produces from `before` on Pro (or on Free, when the preset is all free rules) */
  after: string;
  /** For presets with Pro rules: exactly what the Free plan produces from `before` */
  afterFree?: string;
  afterNote?: string;
  /** Totals check for the sample's amount column, as the app shows it */
  totals?: { column: string; before: number; removed: number; after: number };
  faqs: ToolFaq[];
  relatedTools: string[];
  relatedGuides: string[];
}

const BASE_RULES = ["fixEncoding", "trimWhitespace", "removeEmptyRows", "removeEmptyColumns", "normalizeDate"];
const DMY = { normalizeDate: { targetFormat: "DD/MM/YYYY", dateOrder: "auto" } };

export const IMPORTS: ImportPage[] = [
  {
    slug: "revolut-to-xero",
    bank: "revolut",
    software: "xero",
    name: "Revolut to Xero",
    metaTitle: "Revolut to Xero: Import a Revolut Statement CSV",
    metaDescription:
      "Get a Revolut statement into Xero's CSV import: fix the date-and-time stamps, separate fees, pending rows and the balance column Xero asks you to delete.",
    h1: "How to import a Revolut statement into Xero",
    published: "2026-10-23",
    updated: "2026-10-23",
    summary:
      "Revolut’s spreadsheet statement is close to what Xero’s bank statement import wants, but not close enough to upload as it is. Its dates carry a time of day in a format Xero doesn’t list, fees sit in a column of their own, and the file includes transactions that never completed. This page walks through each mismatch for a Revolut personal statement, what to change, and which of those changes SpreadsheetFix makes for you in the browser.",
    exportHeader: "Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance",
    exportNotes: [
      "Revolut doesn’t publish the layout of its statement file. The header above is the one current exports use according to the open-source parsers and guides listed under Sources, which agree on it. Open your own file and compare its first row with it before following the steps, because Revolut has changed the layout before and tools built on it have had to catch up.",
      "Every transaction has two timestamps, Started Date and Completed Date, written like 2026-09-02 10:02:51. Started Date is when you paid or the transfer began; Completed Date is when it settled and the balance moved. For a card payment the two can be a day or more apart, so a coffee bought on the 31st can complete in the following month.",
      "Amount is signed, with money out negative, which is what Xero wants. Fee is a separate column, so a charge such as an ATM fee isn’t included in Amount, and Balance is the running balance of the account. State says whether a row is COMPLETED. Revolut’s own help says statements include pending, completed and reverted transactions, so a file downloaded mid-month can hold rows that will never reach your bank balance.",
    ],
    gaps: [
      {
        problem: "Dates like 2026-09-02 10:02:51 aren’t one of the date formats Xero lists for CSV imports.",
        fix: "Rewrite both date columns as DD/MM/YYYY. SpreadsheetFix does this, and drops the time of day.",
      },
      {
        problem: "Xero wants every amount in one column, but Revolut’s fees are in a second one.",
        fix: "Add each non-zero fee as its own row, with the fee as a negative amount on the same date.",
      },
      {
        problem: "Rows whose State isn’t COMPLETED never moved money, but would import as if they had.",
        fix: "Filter the State column and delete every row that isn’t COMPLETED before you import.",
      },
      {
        problem: "Xero calculates the balance itself and asks you to delete balance columns.",
        fix: "Delete the Balance column. Keep a note of the closing balance to check the reconciliation against.",
      },
    ],
    steps: [
      "Download the statement from the Revolut app as Excel, one currency account at a time, and match each to its own Xero bank account.",
      "Upload the file below. SpreadsheetFix rewrites Started Date and Completed Date as DD/MM/YYYY, tidies spacing and removes blank rows, then checks that Amount, Fee and Balance total the same as before.",
      "Download the cleaned CSV and open it in Google Sheets, or in Excel through Data > From Text/CSV with the date columns set to Text, so the dates aren’t converted again.",
      "Delete rows whose State isn’t COMPLETED, add a row for each fee, and delete the Balance column.",
      "In Xero, go to Accounting > Bank accounts, open the account’s menu and choose Import a Statement.",
      "Assign Completed Date to Transaction Date, Amount to Transaction Amount and Description to Payee or Description, then confirm DD/MM/YYYY if Xero asks.",
    ],
    toolFix: [
      "The date problem is the one most likely to stop the import, and it’s the one SpreadsheetFix fixes completely. Both timestamp columns are rewritten as DD/MM/YYYY, the first date format Xero lists, and the time of day is dropped. The Started Date of a card payment and its Completed Date are converted separately, so each keeps its own day.",
      "Because cleaning runs in your browser, the statement, with its payees and balances, is never uploaded. Before you download, the totals check adds up the Amount, Fee and Balance columns and confirms that they match the original to the cent, so you know that rewriting dates didn’t touch a figure.",
      `Everything on this page uses free rules, so files up to ${FREE_MAX_ROWS} rows clean without an account. Filtering by State, adding fee rows and deleting the Balance column are left to you, because they are decisions about your books rather than formatting.`,
    ],
    limits: [
      "SpreadsheetFix doesn’t remove columns that contain data, so the Balance column is still there in the download and has to be deleted by hand.",
      "It doesn’t filter rows by State or turn the Fee column into separate rows, so check the State column and look for non-zero fees yourself.",
      "Xero remembers how you assigned the columns. If a later Revolut file has different columns, Xero asks you to assign them again, so compare the header row each time.",
    ],
    preset: { ruleIds: BASE_RULES, options: DMY },
    before: `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
CARD_PAYMENT,Current,2026-09-01 08:14:22,2026-09-02 10:02:51,Pret A Manger,-6.45,0.00,GBP,COMPLETED,1243.55
TRANSFER,Current,2026-09-03 12:00:05,2026-09-03 12:00:06,To ACME Supplies Ltd,-250.00,0.00,GBP,COMPLETED,993.55
TOPUP,Current,2026-09-05 09:11:42,2026-09-05 09:12:12,Payment from Client SARL,1500.00,0.00,GBP,COMPLETED,2493.55
ATM,Current,2026-09-06 14:20:00,2026-09-06 14:20:01,Cash at Lisbon ATM,-100.00,1.00,GBP,COMPLETED,2392.55`,
    after: `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
CARD_PAYMENT,Current,01/09/2026,02/09/2026,Pret A Manger,-6.45,0.00,GBP,COMPLETED,1243.55
TRANSFER,Current,03/09/2026,03/09/2026,To ACME Supplies Ltd,-250.00,0.00,GBP,COMPLETED,993.55
TOPUP,Current,05/09/2026,05/09/2026,Payment from Client SARL,1500.00,0.00,GBP,COMPLETED,2493.55
ATM,Current,06/09/2026,06/09/2026,Cash at Lisbon ATM,-100.00,1.00,GBP,COMPLETED,2392.55`,
    afterNote:
      "Eight timestamps rewritten as DD/MM/YYYY. The ATM row’s 1.00 fee still needs its own row before import: -1.00 on 06/09/2026.",
    totals: { column: "Amount", before: 1143.55, removed: 0, after: 1143.55 },
    faqs: [
      {
        q: "Which Revolut date should I use in Xero, Started Date or Completed Date?",
        a: "Completed Date, in most cases. It is when the money actually left or reached the account, so it matches the balance Revolut shows and makes the Xero reconciliation agree. Started Date is useful as a reference when you match card payments to receipts.",
      },
      {
        q: "Why does Xero reject the dates in my Revolut file?",
        a: "Revolut writes each date with the time of day, for example 2026-09-02 10:02:51, and that isn’t one of the formats Xero’s CSV import lists. Rewrite the dates as DD/MM/YYYY first.",
      },
      {
        q: "How do I get Revolut fees into Xero?",
        a: "Xero’s import takes a single amount column, so a fee in Revolut’s Fee column won’t come through on its own. Add a separate row for each fee with a negative amount and a description such as “Revolut fee”, then reconcile it to your bank charges account.",
      },
      {
        q: "Does SpreadsheetFix upload my Revolut statement?",
        a: "No. The file is read and cleaned by JavaScript in your browser tab. Nothing in it is sent to SpreadsheetFix’s servers.",
      },
    ],
    relatedTools: ["clean-bank-statement-csv", "prepare-csv-for-accounting-import", "normalize-dates-csv"],
    relatedGuides: ["stop-excel-changing-dates-in-csv", "duplicate-transactions-bank-csv"],
  },
  {
    slug: "revolut-to-quickbooks",
    bank: "revolut",
    software: "quickbooks",
    name: "Revolut to QuickBooks",
    metaTitle: "Revolut to QuickBooks Online: Upload a Statement CSV",
    metaDescription:
      "Turn a Revolut statement into the 3-column CSV QuickBooks Online uploads: Date, Description, Amount, with zero-value holds and extra columns dealt with.",
    h1: "How to upload a Revolut statement to QuickBooks Online",
    published: "2026-10-23",
    updated: "2026-10-23",
    summary:
      "QuickBooks Online is stricter than most about bank upload files. Intuit says a CSV must have exactly three columns, Date, Description and Amount, or four with Credit and Debit, and Revolut’s statement has ten. Its dates carry a time of day, and it can include zero-value rows that QuickBooks wants blank. Here is how to get from one to the other, step by step, and where SpreadsheetFix saves you the fiddly parts.",
    exportHeader: "Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance",
    exportNotes: [
      "The header above is the one that open-source Revolut parsers and import guides agree on, listed under Sources at the end of this page. Revolut itself doesn’t document the file, so compare it with the first row of your own export before you start; an extra or renamed column changes which steps you need.",
      "For QuickBooks, three of those ten columns matter. Completed Date is the settlement date, when the balance actually changed. Description holds the merchant or the counterparty, such as “To ACME Supplies Ltd”. Amount is signed, with payments negative, which is exactly how Intuit describes the 3-column format, so you don’t need to split it into Credit and Debit.",
      "Two Revolut habits trip the upload. Card authorisations that were later released can appear with an Amount of 0.00, and Intuit’s checklist says cells holding only a zero should be blank. And descriptions can contain numbers or symbols, such as a masked card number in a top-up, which Intuit also asks you to remove from the Description column.",
    ],
    gaps: [
      {
        problem: "QuickBooks accepts exactly three or four columns. Revolut’s file has ten.",
        fix: "Keep Date, Description and Amount, in that order, and delete the other seven columns.",
      },
      {
        problem: "Dates like 2026-08-12 09:15:40 mix a date and a time, where QuickBooks wants one consistent date format.",
        fix: "Rewrite the dates as dd/mm/yyyy, the format Intuit recommends. SpreadsheetFix does this for every date column.",
      },
      {
        problem: "Rows with an Amount of 0.00, such as released card holds, break Intuit’s blank-for-zero rule.",
        fix: "Delete those rows: they moved no money. Blanking the cell would leave a transaction with no amount.",
      },
      {
        problem: "Fees are in their own column, which the 3-column format has no place for.",
        fix: "Add a row for each non-zero fee, with the fee as a negative amount and a plain description such as Revolut fee.",
      },
    ],
    steps: [
      "Export the Revolut statement as Excel from the currency account’s Statement option, one account per file.",
      "Upload it below. On Pro, SpreadsheetFix renames Completed Date to Date, moves Date, Description and Amount to the front, and rewrites every date as dd/mm/yyyy.",
      "Download the cleaned CSV and open it in Google Sheets, or import it into Excel with Data > From Text/CSV and the Date column set to Text.",
      "Delete rows whose State isn’t COMPLETED and rows whose Amount is 0.00, and add fee rows where the Fee column isn’t zero.",
      "Delete every column after Amount, and remove numbers and symbols such as * from the descriptions.",
      "In QuickBooks, go to Bank transactions, choose Link account > Upload from file, pick the account and match the three columns. Keep each upload within 1,000 lines and 350 KB.",
    ],
    toolFix: [
      "On Pro, this page’s preset does the reshaping that takes longest by hand. Completed Date is renamed Date and the columns are reordered so Date, Description and Amount come first, which leaves the seven columns QuickBooks doesn’t need in one block you can delete in a single selection. Every date is rewritten as dd/mm/yyyy, with the time of day dropped.",
      `On the free plan, for files up to ${FREE_MAX_ROWS} rows, the dates are converted, spacing is trimmed and blank rows are removed, but the columns keep Revolut’s names and order, because renaming and reordering columns are Pro rules.`,
      "On both plans the statement is processed in your browser and never uploaded, and the totals check confirms that Amount, Fee and Balance add up to the same figures after cleaning. That is worth seeing before an upload you will then categorise and reconcile line by line.",
    ],
    limits: [
      "SpreadsheetFix doesn’t delete columns that contain data, rows by State, or zero-value rows, so those edits happen in your spreadsheet after cleaning.",
      "Numbers and symbols inside descriptions are left as they are. Intuit asks for them to be removed, so use Find and Replace on the Description column before uploading.",
      "Revolut statements can be longer than the 1,000 lines QuickBooks takes per upload. Export shorter periods and upload them one at a time.",
    ],
    preset: {
      ruleIds: [...BASE_RULES, "renameColumns", "reorderColumns"],
      options: {
        ...DMY,
        renameColumns: { aliasMap: { "Completed Date": "Date" } },
        reorderColumns: { order: ["Date", "Description", "Amount"] },
      },
    },
    before: `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
CARD_PAYMENT,Current,2026-08-11 18:40:02,2026-08-12 09:15:40,Tesco Stores,-32.18,0.00,GBP,COMPLETED,812.40
CARD_PAYMENT,Current,2026-08-12 07:55:10,2026-08-12 07:55:10,Car hire temporary hold,0.00,0.00,GBP,COMPLETED,812.40
TRANSFER,Current,2026-08-14 10:01:33,2026-08-14 10:01:34,Payment from Harbour Design,900.00,0.00,GBP,COMPLETED,1712.40
TRANSFER,Current,2026-08-15 16:20:00,2026-08-15 16:20:01,To Northgate Print,-145.00,0.00,GBP,COMPLETED,1567.40`,
    after: `Date,Description,Amount,Type,Product,Started Date,Fee,Currency,State,Balance
12/08/2026,Tesco Stores,-32.18,CARD_PAYMENT,Current,11/08/2026,0.00,GBP,COMPLETED,812.40
12/08/2026,Car hire temporary hold,0.00,CARD_PAYMENT,Current,12/08/2026,0.00,GBP,COMPLETED,812.40
14/08/2026,Payment from Harbour Design,900.00,TRANSFER,Current,14/08/2026,0.00,GBP,COMPLETED,1712.40
15/08/2026,To Northgate Print,-145.00,TRANSFER,Current,15/08/2026,0.00,GBP,COMPLETED,1567.40`,
    afterFree: `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
CARD_PAYMENT,Current,11/08/2026,12/08/2026,Tesco Stores,-32.18,0.00,GBP,COMPLETED,812.40
CARD_PAYMENT,Current,12/08/2026,12/08/2026,Car hire temporary hold,0.00,0.00,GBP,COMPLETED,812.40
TRANSFER,Current,14/08/2026,14/08/2026,Payment from Harbour Design,900.00,0.00,GBP,COMPLETED,1712.40
TRANSFER,Current,15/08/2026,15/08/2026,To Northgate Print,-145.00,0.00,GBP,COMPLETED,1567.40`,
    afterNote:
      "The Pro result: Date, Description and Amount lead, ready for the columns after them to be deleted. The 0.00 hold row is still there to delete by hand.",
    totals: { column: "Amount", before: 722.82, removed: 0, after: 722.82 },
    faqs: [
      {
        q: "Does QuickBooks Online accept Revolut’s CSV as it is?",
        a: "Not usually. Intuit says an uploaded CSV must have three columns (Date, Description, Amount) or four (Date, Description, Credit, Debit), and Revolut’s statement has ten, with dates that include a time.",
      },
      {
        q: "Should I use the 3-column or the 4-column format for Revolut?",
        a: "The 3-column one. Revolut already writes a single signed Amount, with payments negative and money in positive, which is the 3-column format exactly. Splitting it into Credit and Debit adds work for no benefit.",
      },
      {
        q: "Is renaming and reordering the columns free?",
        a: `No, those are Pro rules. The free plan converts the dates, trims spacing and removes blank rows in files up to ${FREE_MAX_ROWS} rows, and you can then move the three columns by hand.`,
      },
      {
        q: "What do I do with Revolut’s 0.00 transactions?",
        a: "Delete them. They are usually card holds that were released, so they never changed your balance, and Intuit asks for zero-only amount cells to be left blank, which would leave a row with no amount at all.",
      },
    ],
    relatedTools: ["prepare-csv-for-accounting-import", "clean-bank-statement-csv", "normalize-dates-csv"],
    relatedGuides: ["stop-excel-changing-dates-in-csv", "excel-european-number-format"],
  },
  {
    slug: "wise-to-xero",
    bank: "wise",
    software: "xero",
    name: "Wise to Xero",
    metaTitle: "Wise to Xero: Import a Wise Statement CSV by Currency",
    metaDescription:
      "Import a Wise CSV statement into Xero one currency at a time: drop the running balance, handle Wise fee rows and map payee columns without duplicates.",
    h1: "How to import a Wise statement into Xero",
    published: "2026-10-23",
    updated: "2026-10-23",
    summary:
      "A Wise account holds a balance in each currency, and Xero holds each bank account in one currency, so most of the work of importing a Wise CSV is splitting it correctly and deciding what each column means. The dates and amounts are already in a shape Xero can read. This page covers the Wise file column by column, what Xero needs instead, and the cleanup SpreadsheetFix does before you import.",
    exportHeader:
      "TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance,Exchange From,Exchange To,Exchange Rate,Payer Name,Payee Name,Payee Account Number,Merchant,Card Last Four Digits,Card Holder Full Name,Attachment,Note,Total fees",
    exportNotes: [
      "Wise doesn’t publish its statement CSV layout. The header above is the one open-source Wise parsers agree on, and one of them shows newer exports adding columns such as a date-and-time column and a transaction type. Look at the first row of your own file and work from the columns it actually has.",
      "Date is written day-month-year with hyphens, like 02-09-2026, and Amount is signed, with money out negative. Both fit Xero’s CSV import as they are: DD-MM-YYYY is on Xero’s list of accepted date formats, and Xero wants income and expenses in one column. Each row also names its currency in the Currency column, and Running Balance gives the balance of that currency after the row.",
      "Fees need care. In the sample statements we checked, a transfer’s fee appears twice: as a number in the transfer’s Total fees column and as its own row, described as charges for that transfer, with the fee as a negative amount. The fee row is the one that moves the running balance. Importing both rows is right; adding Total fees on top would count the fee twice.",
    ],
    gaps: [
      {
        problem: "Xero bank accounts hold one currency, but a Wise statement can cover several.",
        fix: "Make one file per currency by filtering the Currency column, and import each into the matching Xero account.",
      },
      {
        problem: "Xero asks you to delete balance columns, and Wise includes Running Balance.",
        fix: "Delete Running Balance, but note the last value for each currency to check the reconciliation.",
      },
      {
        problem: "The counterparty is spread across Payee Name, Payer Name and Merchant, but Xero has one Payee field.",
        fix: "Map Description to Description and use Payment Reference as Reference; spell payees exactly as your Xero contacts to avoid duplicates.",
      },
      {
        problem: "Many Wise columns are empty for a given period, which makes the column mapping screen longer than it needs to be.",
        fix: "Remove the empty columns before importing. SpreadsheetFix does this automatically.",
      },
    ],
    steps: [
      "On the Wise website, download a CSV statement for the period, choosing the currencies you keep in Xero.",
      "Upload it below. SpreadsheetFix removes columns that are empty in this file, rewrites the dates as DD/MM/YYYY, trims spacing and checks the amount totals.",
      "Download the result and open it in Google Sheets, or in Excel through Data > From Text/CSV, so the dates stay as written.",
      "Filter by Currency and save one file per currency, then delete Running Balance from each.",
      "In Xero, open the matching bank account’s menu, choose Import a Statement and upload the file for that currency.",
      "Assign Date to Transaction Date and Amount to Transaction Amount, and Description and Payment Reference to the fields you use. Then review the warnings and complete the import.",
    ],
    toolFix: [
      "A Wise statement for a quiet month can be mostly empty columns: exchange details when nothing was converted, card details when no card was used, attachments and notes no one added. SpreadsheetFix removes every column that is empty from top to bottom, so Xero’s column assignment screen shows only what the file actually contains.",
      `The dates are rewritten as DD/MM/YYYY. Xero would accept Wise’s DD-MM-YYYY too, but one slash format across all your bank imports means Xero’s remembered date format fits every file. These are free rules, so a statement of up to ${FREE_MAX_ROWS} rows needs no account, and the file never leaves your browser.`,
      "Before you download, the totals check adds up Amount, Running Balance and Total fees before and after cleaning and confirms that nothing changed. When you then split the file by currency, the Amount totals per currency are what to compare with Wise’s own statement.",
    ],
    limits: [
      "Which columns are removed depends on the file: a month with a currency conversion keeps the exchange columns. Xero asks you to assign columns again whenever the set changes, so expect that step to come back now and then.",
      "SpreadsheetFix doesn’t split files by currency or delete the Running Balance column, which still contains data. Both are quick filters in a spreadsheet.",
      "Fees are left exactly as Wise wrote them. If your file has a Total fees value but no matching charges row, add the fee yourself; the running balance tells you which case you have.",
    ],
    preset: { ruleIds: BASE_RULES, options: DMY },
    before: `TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance,Exchange From,Exchange To,Exchange Rate,Payer Name,Payee Name,Payee Account Number,Merchant,Card Last Four Digits,Card Holder Full Name,Attachment,Note,Total fees
TRANSFER-1024551,02-09-2026,-480.00,EUR,Sent money to Atelier Roux,Invoice 2291,3120.00,,,,,Atelier Roux,FR7600000000000000000000000,,,,,,2.15
TRANSFER-1024551,02-09-2026,-2.15,EUR,Wise Charges for: TRANSFER-1024551,,3117.85,,,,,,,,,,,,0.00
TRANSFER-1031876,07-09-2026,1250.00,EUR,Received money from Northwind BV with reference INV-77,INV-77,4367.85,,,,Northwind BV,,,,,,,,0.00
TRANSFER-1033410,09-09-2026,300.00,EUR,Topped up balance,,4667.85,,,,,,,,,,,,0.00`,
    after: `TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance,Payer Name,Payee Name,Payee Account Number,Total fees
TRANSFER-1024551,02/09/2026,-480.00,EUR,Sent money to Atelier Roux,Invoice 2291,3120.00,,Atelier Roux,FR7600000000000000000000000,2.15
TRANSFER-1024551,02/09/2026,-2.15,EUR,Wise Charges for: TRANSFER-1024551,,3117.85,,,,0.00
TRANSFER-1031876,07/09/2026,1250.00,EUR,Received money from Northwind BV with reference INV-77,INV-77,4367.85,Northwind BV,,,0.00
TRANSFER-1033410,09/09/2026,300.00,EUR,Topped up balance,,4667.85,,,,0.00`,
    afterNote:
      "Eight empty columns removed and four dates rewritten. The 2.15 fee is imported once, from its own row; Total fees on the transfer row is the same fee.",
    totals: { column: "Amount", before: 1067.85, removed: 0, after: 1067.85 },
    faqs: [
      {
        q: "Can I import a multi-currency Wise statement into one Xero bank account?",
        a: "No. Each Xero bank account has one currency, so split the Wise file by its Currency column and import each part into the Xero account for that currency.",
      },
      {
        q: "Does Xero accept Wise’s date format?",
        a: "Yes. Wise writes dates as DD-MM-YYYY, which is on Xero’s list of CSV date formats. SpreadsheetFix still rewrites them as DD/MM/YYYY so every bank file you import uses the same format.",
      },
      {
        q: "Do I need a CSV at all?",
        a: "Not always. Wise offers accounting integrations and other statement formats, and Xero recommends OFX, QFX or QuickBooks files where your bank provides them. A CSV is the fallback when neither suits, for example for a period before a connection existed.",
      },
      {
        q: "Will the Wise fee be counted twice?",
        a: "Not if you import the rows as they are and ignore the Total fees column. In the exports we checked, the fee also has its own negative row, and that row is what reduces the balance.",
      },
    ],
    relatedTools: ["clean-bank-statement-csv", "prepare-csv-for-accounting-import", "remove-blank-rows-csv"],
    relatedGuides: ["fix-garbled-characters-in-csv", "duplicate-transactions-bank-csv"],
  },
  {
    slug: "wise-to-quickbooks",
    bank: "wise",
    software: "quickbooks",
    name: "Wise to QuickBooks",
    metaTitle: "Wise to QuickBooks Online: Upload a Wise CSV Statement",
    metaDescription:
      "Reshape a Wise statement into QuickBooks Online's 3-column bank upload: one currency per file, Date, Description and Amount first, under 1,000 lines.",
    h1: "How to upload a Wise statement to QuickBooks Online",
    published: "2026-10-23",
    updated: "2026-10-23",
    summary:
      "Wise’s statement CSV has around twenty columns, and QuickBooks Online’s bank upload takes three or four. The good news is that Wise already uses the column names QuickBooks expects for the three that matter, Date, Description and Amount, and writes a single signed amount. What’s left is moving those to the front, getting rid of the rest, and splitting currencies apart. This page shows each step and what SpreadsheetFix handles.",
    exportHeader:
      "TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance,Exchange From,Exchange To,Exchange Rate,Payer Name,Payee Name,Payee Account Number,Merchant,Card Last Four Digits,Card Holder Full Name,Attachment,Note,Total fees",
    exportNotes: [
      "This is the header that open-source Wise parsers and converters agree on; their code is linked under Sources. Wise doesn’t document the statement CSV itself, and newer files can carry extra columns, so check the first row of your download. Whatever else it has, the Date, Description and Amount columns are what QuickBooks needs.",
      "Wise puts the identifier first, in TransferWise ID, and Date second, written like 15-09-2026. QuickBooks wants Date as the first column and recommends dd/mm/yyyy, so both the order and the separators change. Amount is signed, with outgoing payments negative, which matches Intuit’s 3-column format without any splitting.",
      "Descriptions are where Intuit’s checklist bites. Wise descriptions often name a transfer ID or a reference, as in “Wise Charges for: TRANSFER-2209930” or “Received money from Fjord Analytics AS with reference Q3”, and Intuit asks for numbers and special characters such as colons to be removed from the Description column. Decide how much of that text you want in QuickBooks before you delete it.",
    ],
    gaps: [
      {
        problem: "QuickBooks takes exactly three or four columns, and Intuit’s layout puts Date first. Wise starts with TransferWise ID.",
        fix: "Move Date, Description and Amount to the front, then delete everything after Amount.",
      },
      {
        problem: "Wise writes 15-09-2026; Intuit recommends dd/mm/yyyy, the same in every row.",
        fix: "Rewrite the dates with slashes. SpreadsheetFix does this for the whole column.",
      },
      {
        problem: "A statement can mix currencies, and a QuickBooks bank account has one.",
        fix: "Split the file by the Currency column before deleting it, and upload each currency to its own account.",
      },
      {
        problem: "Uploads are capped at 1,000 lines and 350 KB per file.",
        fix: "A year of an active Wise balance can pass that. Download shorter periods from Wise, or split the file by date.",
      },
    ],
    steps: [
      "Download a CSV statement from Wise’s Statements and reports page for the currencies and period you need.",
      "Upload it below. On Pro, SpreadsheetFix moves Date, Description and Amount to the front, removes empty columns and rewrites dates as dd/mm/yyyy.",
      "Download the cleaned CSV, open it in Google Sheets or through Excel’s Data > From Text/CSV, and filter it by Currency, saving one file per currency.",
      "In each file, delete every column after Amount and remove the numbers and symbols Intuit lists from the descriptions.",
      "In QuickBooks, go to Bank transactions, choose Link account > Upload from file, and select the account for that currency.",
      "Match the Date, Description and Amount columns on screen, review the transactions, and upload each currency in turn.",
    ],
    toolFix: [
      "On Pro, this page puts Date, Description and Amount in the first three columns, so the columns QuickBooks won’t accept sit together at the end, ready to delete in one go. Columns that are empty throughout the file are removed, and every date is rewritten as dd/mm/yyyy.",
      `On the free plan, for files up to ${FREE_MAX_ROWS} rows, the dates are rewritten and the empty columns removed, but the column order stays as Wise wrote it, because reordering columns is a Pro rule. You can still drag the three columns into place in your spreadsheet.`,
      "Either way the statement is processed in your browser, never uploaded, and the totals check confirms that Amount, Running Balance and Total fees add up to the same figures after cleaning as before.",
    ],
    limits: [
      "SpreadsheetFix doesn’t split a file by currency, delete columns that contain data, or remove numbers from descriptions, so those steps happen in your spreadsheet.",
      "It doesn’t check the 350 KB and 1,000-line limits either. Count the rows after splitting by currency, and download a shorter period from Wise if a file is over.",
      "Fees stay as Wise exported them. Check whether each fee in the Total fees column also has its own row, so that it reaches QuickBooks exactly once.",
    ],
    preset: {
      ruleIds: [...BASE_RULES, "reorderColumns"],
      options: { ...DMY, reorderColumns: { order: ["Date", "Description", "Amount"] } },
    },
    before: `TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance,Exchange From,Exchange To,Exchange Rate,Payer Name,Payee Name,Payee Account Number,Merchant,Card Last Four Digits,Card Holder Full Name,Attachment,Note,Total fees
TRANSFER-2207815,15-09-2026,2000.00,GBP,Received money from Fjord Analytics AS with reference Q3,Q3,5410.00,,,,Fjord Analytics AS,,,,,,,,0.00
TRANSFER-2209930,18-09-2026,-640.00,GBP,Sent money to Oakline Studio,Invoice 0193,4770.00,GBP,EUR,1.15840,,Oakline Studio,FR7600000000000000000000000,,,,,,4.10
TRANSFER-2209930,18-09-2026,-4.10,GBP,Wise Charges for: TRANSFER-2209930,,4765.90,,,,,,,,,,,,0.00`,
    after: `Date,Description,Amount,TransferWise ID,Currency,Payment Reference,Running Balance,Exchange From,Exchange To,Exchange Rate,Payer Name,Payee Name,Payee Account Number,Total fees
15/09/2026,Received money from Fjord Analytics AS with reference Q3,2000.00,TRANSFER-2207815,GBP,Q3,5410.00,,,,Fjord Analytics AS,,,0.00
18/09/2026,Sent money to Oakline Studio,-640.00,TRANSFER-2209930,GBP,Invoice 0193,4770.00,GBP,EUR,1.15840,,Oakline Studio,FR7600000000000000000000000,4.10
18/09/2026,Wise Charges for: TRANSFER-2209930,-4.10,TRANSFER-2209930,GBP,,4765.90,,,,,,,0.00`,
    afterFree: `TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance,Exchange From,Exchange To,Exchange Rate,Payer Name,Payee Name,Payee Account Number,Total fees
TRANSFER-2207815,15/09/2026,2000.00,GBP,Received money from Fjord Analytics AS with reference Q3,Q3,5410.00,,,,Fjord Analytics AS,,,0.00
TRANSFER-2209930,18/09/2026,-640.00,GBP,Sent money to Oakline Studio,Invoice 0193,4770.00,GBP,EUR,1.15840,,Oakline Studio,FR7600000000000000000000000,4.10
TRANSFER-2209930,18/09/2026,-4.10,GBP,Wise Charges for: TRANSFER-2209930,,4765.90,,,,,,,0.00`,
    afterNote:
      "The Pro result: five empty columns removed, three dates rewritten, and Date, Description and Amount first. The exchange columns stay because this file has a conversion in it.",
    totals: { column: "Amount", before: 1355.9, removed: 0, after: 1355.9 },
    faqs: [
      {
        q: "Which QuickBooks CSV format suits a Wise statement?",
        a: "The 3-column format: Date, Description, Amount. Wise already uses those column names and a single signed amount, so you only need to move them to the front and delete the rest.",
      },
      {
        q: "Why does QuickBooks reject my Wise CSV?",
        a: "Usually because the file has more than four columns, or because Date isn’t the first column. Intuit’s rules also cover consistent dates, blank zero amounts and descriptions without numbers or special characters.",
      },
      {
        q: "Is reordering the columns included in the free plan?",
        a: `No. Reordering columns is a Pro rule. The free plan rewrites dates and removes empty columns in files up to ${FREE_MAX_ROWS} rows; you can move the columns yourself after downloading.`,
      },
      {
        q: "How do I handle several Wise currencies in QuickBooks?",
        a: "Upload each currency into a QuickBooks bank account in that currency. Filter the cleaned file by the Currency column, save each currency as its own CSV, then delete the Currency column before uploading.",
      },
    ],
    relatedTools: ["prepare-csv-for-accounting-import", "clean-bank-statement-csv", "remove-blank-rows-csv"],
    relatedGuides: ["fix-garbled-characters-in-csv", "stop-excel-changing-dates-in-csv"],
  },
  {
    slug: "monzo-to-quickbooks",
    bank: "monzo",
    software: "quickbooks",
    name: "Monzo to QuickBooks",
    metaTitle: "Monzo to QuickBooks Online: Upload a Monzo CSV Export",
    metaDescription:
      "Prepare a Monzo CSV for QuickBooks Online's bank upload: use the merchant name as the description, keep three columns, and handle Pot transfers.",
    h1: "How to upload Monzo transactions to QuickBooks Online",
    published: "2026-10-23",
    updated: "2026-10-23",
    summary:
      "Monzo’s CSV export already writes dates day-first and amounts in one signed column, which is most of what QuickBooks Online asks for. The work is in the columns: QuickBooks takes only three or four, and the most readable name for each transaction is in Monzo’s Name column, not its Description. Pot transfers need a decision too. This page goes through the export, the changes QuickBooks needs and the part SpreadsheetFix automates.",
    exportHeader: "Date,Name,Amount,Currency,Description",
    exportNotes: [
      "Monzo doesn’t publish the layout of its CSV export, and the file has more columns than the five shown here. These are the ones that open-source Monzo importers agree on, by name, so their order in your file may differ. Check your own header row: the steps below only rely on these five being present.",
      "Date is written day-first, like 01/09/2026, which is already the dd/mm/yyyy format Intuit recommends. Amount is in your account’s currency and signed, with spending negative, which is Intuit’s 3-column layout. Name holds the merchant or payee name, which is what you will want to read in QuickBooks when categorising; Description holds further detail that came with the payment.",
      "Monzo’s help says the export includes Pots. Money moved between your main balance and a Pot appears as a transaction with the Pot as its name, even though it never left Monzo. If the Pot isn’t its own bank account in QuickBooks, those rows will look like real spending and income.",
    ],
    gaps: [
      {
        problem: "QuickBooks wants a Description column that describes the transaction; Monzo’s best description is in Name.",
        fix: "Use Name as the Description column. On Pro, SpreadsheetFix renames Name to Description and keeps Monzo’s original as Bank description.",
      },
      {
        problem: "QuickBooks accepts exactly three columns, Date, Description and Amount, in that order. Monzo’s export has many more.",
        fix: "Move the three to the front and delete the rest before uploading.",
      },
      {
        problem: "Transfers to and from Pots are internal, but QuickBooks treats every uploaded row as a bank transaction.",
        fix: "Delete Pot transfer rows, or set the Pot up as its own account in QuickBooks and record them as transfers.",
      },
      {
        problem: "Intuit asks for no numbers or special characters in Description.",
        fix: "Merchant names rarely have any, which is another reason to use Name. Check the column before uploading anyway.",
      },
    ],
    steps: [
      "In the Monzo app, tap the three dots on your card, choose Bank statements, pick the date range and export a CSV.",
      "Upload it below. On Pro, Name becomes Description, Monzo’s Description becomes Bank description, and Date, Description and Amount move to the front.",
      "Download the cleaned CSV and open it in Google Sheets, or through Excel’s Data > From Text/CSV, so the dates aren’t reinterpreted.",
      "Delete Pot transfers you don’t track as a separate account, and any rows whose amount is zero.",
      "Delete every column after Amount and save the file as CSV.",
      "In QuickBooks, go to Bank transactions, choose Link account > Upload from file, select your Monzo account and match the three columns.",
    ],
    toolFix: [
      "On Pro, this page’s preset does the column work. Monzo’s Name column is renamed Description, its original Description is kept as Bank description in case you want it later, and the columns are reordered so Date, Description and Amount come first. The columns QuickBooks won’t take end up together at the end, ready to delete in one selection.",
      `On the free plan, for files up to ${FREE_MAX_ROWS} rows, SpreadsheetFix checks the dates, trims spacing and removes blank rows and empty columns, but leaves the column names and order alone, because renaming and reordering columns are Pro rules. Monzo’s dates are usually already in the right format, so in many free runs the preview simply confirms there is nothing to fix.`,
      "In both cases the export is processed in your browser and never uploaded, and the totals check confirms that the Amount column adds up to the same total after cleaning as before.",
    ],
    limits: [
      "SpreadsheetFix can’t tell a Pot transfer from a real payment, and doesn’t delete columns that contain data. Both are edits for your spreadsheet after cleaning.",
      "The rename relies on your file having columns called Name and Description. If your export names them differently, the rename doesn’t apply and the columns are left as they are.",
      "QuickBooks takes up to 1,000 lines and 350 KB per upload. For a busy account, export a shorter date range from Monzo and upload each file in turn.",
    ],
    preset: {
      ruleIds: [...BASE_RULES, "renameColumns", "reorderColumns"],
      options: {
        ...DMY,
        renameColumns: { aliasMap: { Description: "Bank description", Name: "Description" } },
        reorderColumns: { order: ["Date", "Description", "Amount"] },
      },
    },
    before: `Date,Name,Amount,Currency,Description
01/09/2026,Pret A Manger,-5.85,GBP,PRET A MANGER LONDON GBR
02/09/2026,Harbour Design Ltd,1200.00,GBP,SEPT RETAINER
03/09/2026,Savings Pot,-200.00,GBP,Savings Pot
04/09/2026,Northgate Print,-88.20,GBP,NORTHGATE PRINT LEEDS GBR`,
    after: `Date,Description,Amount,Currency,Bank description
01/09/2026,Pret A Manger,-5.85,GBP,PRET A MANGER LONDON GBR
02/09/2026,Harbour Design Ltd,1200.00,GBP,SEPT RETAINER
03/09/2026,Savings Pot,-200.00,GBP,Savings Pot
04/09/2026,Northgate Print,-88.20,GBP,NORTHGATE PRINT LEEDS GBR`,
    afterFree: `Date,Name,Amount,Currency,Description
01/09/2026,Pret A Manger,-5.85,GBP,PRET A MANGER LONDON GBR
02/09/2026,Harbour Design Ltd,1200.00,GBP,SEPT RETAINER
03/09/2026,Savings Pot,-200.00,GBP,Savings Pot
04/09/2026,Northgate Print,-88.20,GBP,NORTHGATE PRINT LEEDS GBR`,
    afterNote:
      "The Pro result: Name is now Description, Monzo’s own Description is kept as Bank description, and the dates were already dd/mm/yyyy. The Savings Pot row is still there for you to decide on.",
    totals: { column: "Amount", before: 905.95, removed: 0, after: 905.95 },
    faqs: [
      {
        q: "Can QuickBooks Online read Monzo’s CSV as it is?",
        a: "Not as it is. Intuit says the file must have three columns (Date, Description, Amount) or four (Date, Description, Credit, Debit), and Monzo’s export has more. The dates and the signed Amount column are already in the form QuickBooks wants.",
      },
      {
        q: "Should I use Monzo’s Name or Description column?",
        a: "Name, in most cases. It holds the merchant or payee, which is easier to categorise and to build bank rules on in QuickBooks than the text a payment arrived with.",
      },
      {
        q: "What should I do with Monzo Pot transfers?",
        a: "If you don’t track the Pot as its own account in QuickBooks, delete those rows before uploading, because the money never left Monzo. If you do, upload them and record them as transfers between the two accounts.",
      },
      {
        q: "Do I need Pro for this?",
        a: `For the renaming and reordering, yes: those are Pro rules. The free plan cleans files up to ${FREE_MAX_ROWS} rows with the other rules on this page, and you can then rename and move the columns by hand.`,
      },
    ],
    relatedTools: ["prepare-csv-for-accounting-import", "clean-bank-statement-csv", "trim-whitespace-csv"],
    relatedGuides: ["duplicate-transactions-bank-csv", "vlookup-na-hidden-spaces"],
  },
];

export const IMPORT_MAP = new Map(IMPORTS.map((p) => [p.slug, p]));

/** True when a page's preset includes a rule that only Pro unlocks. */
export function importNeedsPro(page: ImportPage): boolean {
  return page.preset.ruleIds.some((id) => !FREE_RULES.includes(id));
}

/** Newest `updated` across all import pages, for the /import index in the sitemap. */
export function importsUpdated(): string {
  return IMPORTS.map((p) => p.updated).sort().at(-1)!;
}

/** Every source a page cites: the bank's help pages, the layout's corroborating sources, the software's docs. */
export function importSources(page: ImportPage): { official: Source[]; layout: Source[] } {
  return {
    official: [...SOFTWARE[page.software].sources, ...BANKS[page.bank].officialSources],
    layout: BANKS[page.bank].layoutSources,
  };
}
