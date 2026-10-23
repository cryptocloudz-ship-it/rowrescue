import { TOOL_MAP, toolNeedsPro } from "./tools";
import { GUIDE_MAP, guideNeedsPro } from "./guides";

/**
 * Hub pages at /tools/<slug>: one page per job (bookkeeping, contact lists, file cleanup) that groups the tool pages
 * and guides for that job, says which order to run them in, and links to every member. hubs.test.ts checks that every
 * tool and guide belongs to a hub and that hub copy doesn't repeat tool or guide copy.
 *
 * Members are typed so a new kind of page can join a hub: add a variant to HubMember (e.g. `{ type: "import"; slug }`),
 * a case to resolveHubMember(), and list the pages in the hub's sections.
 */
export type HubMember =
  | { type: "tool"; slug: string; note: string; crossListed?: boolean }
  | { type: "guide"; slug: string; note: string };

export interface HubSection {
  heading: string;
  body: string;
  members: HubMember[];
}

export interface Hub {
  slug: string;
  /** Short label for nav, breadcrumbs and the footer */
  name: string;
  /** <title> before the " | SpreadsheetFix" template; the whole title stays within 65 characters */
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  /** The order to run the hub's tools in, one step per entry */
  workflow: string[];
  sections: HubSection[];
  /** Last meaningful content change (YYYY-MM-DD), for the sitemap */
  updated: string;
}

export const HUBS: Hub[] = [
  {
    slug: "bookkeeping-bank-exports",
    name: "Bookkeeping and bank exports",
    metaTitle: "CSV Tools for Bookkeeping and Bank Exports",
    metaDescription:
      "Tools and guides for bank statements, card exports and accounting imports: dates, decimal commas and duplicates, with a totals check on every amount column.",
    h1: "CSV tools for bookkeepers: from bank export to accounting import",
    intro: [
      "A bank or card export is rarely ready for Xero, QuickBooks or Sage. The dates follow the bank’s locale, the amounts may use a decimal comma, a second download repeats last week’s transactions, and payee names arrive with broken accents. Every one of those problems is small, and every one of them can stop an import or post a transaction twice.",
      "The pages below cover that path from download to import. Whichever one you start from, the totals check adds up each amount column before and after cleaning, so you can show a client or a reviewer that no figure moved while the file was being tidied.",
    ],
    workflow: [
      "If the period spans several downloads, stack them into one file first, so overlapping days show up as repeated rows.",
      "Repair the text and the layout: broken characters in payee names, padded descriptions and the blank spacer rows some banks insert.",
      "Rewrite the dates in the order your accounting software’s import screen asks for, and turn decimal-comma amounts into plain numbers.",
      "Read the removed rows in the preview before you export: two identical card payments on the same day can both be real.",
    ],
    sections: [
      {
        heading: "Statements and imports",
        body: "Start here when the file is a statement you downloaded, or a sheet you are about to load into accounting software.",
        members: [
          {
            type: "tool",
            slug: "clean-bank-statement-csv",
            note: "One pass for a downloaded statement: encoding, spacing, blank rows and dates in YYYY-MM-DD, then the totals check.",
          },
          {
            type: "tool",
            slug: "prepare-csv-for-accounting-import",
            note: "Writes dates as DD/MM/YYYY and leaves the template’s starred headers exactly as the importer expects them.",
          },
          {
            type: "tool",
            slug: "merge-csv-files",
            note: "Combine monthly or per-account downloads into one file, matching columns by header name.",
          },
        ],
      },
      {
        heading: "Dates, amounts and repeated transactions",
        body: "The three problems that most often change what the ledger shows, rather than just how the file looks.",
        members: [
          {
            type: "tool",
            slug: "normalize-dates-csv",
            note: "Works out per column whether the bank wrote day-first or month-first dates before converting them.",
          },
          {
            type: "tool",
            slug: "convert-comma-decimal-csv",
            note: "For German, French or Spanish exports where 1.234,50 has to become 1234.50 before it can be summed.",
          },
          {
            type: "tool",
            slug: "remove-duplicates-csv",
            note: "Finds rows repeated by overlapping downloads; every removal is listed in the preview so legitimate repeats can be kept.",
            crossListed: true,
          },
        ],
      },
      {
        heading: "Guides for bookkeeping files",
        body: "Why these problems happen, how to fix them by hand in Excel or Google Sheets, and where a tool helps.",
        members: [
          {
            type: "guide",
            slug: "duplicate-transactions-bank-csv",
            note: "Telling a transaction that was downloaded twice apart from two real purchases of the same amount.",
          },
          {
            type: "guide",
            slug: "stop-excel-changing-dates-in-csv",
            note: "Why Excel swaps the day and month when it opens a statement, and how to open it without that happening.",
          },
          {
            type: "guide",
            slug: "excel-european-number-format",
            note: "Getting SUM to work on amounts written as 1.234,56, in Excel and in accounting imports.",
          },
        ],
      },
    ],
    updated: "2026-10-22",
  },
  {
    slug: "contact-lists-crm",
    name: "Contact lists and CRM",
    metaTitle: "CSV Tools for Contact Lists and CRM Data",
    metaDescription:
      "Tools for mailing lists and CRM exports: check email addresses, format phone numbers, fix name casing and remove duplicate contacts before you import.",
    h1: "Tools for contact lists, mailing lists and CRM data",
    intro: [
      "Contact data decays in predictable ways. The same person signs up twice with different capitalisation, a phone number is typed four different ways, an import from an old system garbles every accented surname, and a list exported from one CRM won’t match records in the next. Email platforms bill by contact and penalise bounces, so each of those costs money as well as looking careless.",
      "These pages deal with people data specifically: addresses, names and numbers. The files hold personal data, which is why everything here runs in your browser and nothing is sent to us.",
    ],
    workflow: [
      "Fix the text before you compare anything: repair accents, trim spaces and lower-case email addresses.",
      "Standardise the fields people type freely, such as phone numbers and name casing, in the columns you choose.",
      "Remove duplicates once the values are normalised, matching on the email column alone if names and dates differ between copies.",
      "Look at the flagged rows in the quarantine file and decide which addresses to fix and which to drop before importing.",
    ],
    sections: [
      {
        heading: "Whole-file cleanups",
        body: "Presets for a complete export, when you want one pass before a re-import, a migration or a campaign.",
        members: [
          {
            type: "tool",
            slug: "clean-crm-export",
            note: "For HubSpot, Salesforce or Pipedrive exports, keeping the original headers so the file can go back in.",
          },
          {
            type: "tool",
            slug: "clean-email-list",
            note: "For a mailing list before Mailchimp or a similar platform: normalised addresses, duplicates removed, bad ones flagged.",
          },
          {
            type: "tool",
            slug: "merge-csv-files",
            note: "Join lists from several events or forms into one file before you de-duplicate it.",
            crossListed: true,
          },
        ],
      },
      {
        heading: "Single fields",
        body: "When only one column is the problem and you don’t want the rest of the file touched.",
        members: [
          {
            type: "tool",
            slug: "validate-emails-csv",
            note: "Checks each address’s shape and puts malformed ones in a separate quarantine file; it never contacts mail servers.",
          },
          {
            type: "tool",
            slug: "format-phone-numbers-csv",
            note: "Rewrites numbers in E.164 form for dialers and SMS tools; pick the phone columns so IDs and dates are left alone.",
          },
          {
            type: "tool",
            slug: "proper-case-csv",
            note: "Turns ANA RUIZ and ben ode into Ana Ruiz and Ben Ode for mail merges and labels.",
          },
          {
            type: "tool",
            slug: "remove-duplicates-csv",
            note: "Match on every column, or only on the email or customer ID column, keeping the first copy of each contact.",
          },
        ],
      },
      {
        heading: "Guide",
        body: "For lists that still look duplicated after Excel says it removed the duplicates.",
        members: [
          {
            type: "guide",
            slug: "excel-remove-duplicates-not-working",
            note: "The hidden differences, such as trailing spaces and case, that stop Excel treating two contacts as the same.",
          },
        ],
      },
    ],
    updated: "2026-10-22",
  },
  {
    slug: "csv-file-cleanup",
    name: "CSV file cleanup",
    metaTitle: "CSV Cleanup: Encoding, Spaces, Headers, Blanks",
    metaDescription:
      "Tools for the structure of a CSV rather than its data: broken characters, hidden spaces, blank rows, messy headers, HTML in cells and missing values.",
    h1: "Tidy the text and structure of any CSV",
    intro: [
      "Some problems have nothing to do with what the file is about. Whether it holds products, survey answers or sensor readings, a CSV can be saved in the wrong encoding, padded with invisible spaces, broken up by empty rows, or given headers that no script can address. These faults are why a lookup returns #N/A, why a database load stops halfway, or why a column that looks complete has gaps.",
      "The tools here fix the container rather than the content, so they are the usual first step before any of the more specific cleanups on this site.",
    ],
    workflow: [
      "Repair the encoding first: every later step compares text, and garbled characters make equal values look different.",
      "Strip hidden spaces, HTML tags and empty rows and columns, so what you see in each cell is what is really there.",
      "Rename the headers if the file is going into code or a database, and leave them alone if an import template expects the originals.",
      "Flag rows with blanks in the columns that must be filled, and fix them before the file moves on.",
    ],
    sections: [
      {
        heading: "Text inside the cells",
        body: "Characters and markup that make values display or compare wrongly.",
        members: [
          {
            type: "tool",
            slug: "fix-csv-encoding",
            note: "Detects how the file was saved and turns CafÃ© back into Café, writing clean UTF-8.",
          },
          {
            type: "tool",
            slug: "trim-whitespace-csv",
            note: "Removes leading, trailing and doubled spaces from every cell, the usual cause of failed lookups.",
          },
          {
            type: "tool",
            slug: "remove-html-tags-csv",
            note: "Keeps the text of product descriptions exported from Shopify, WooCommerce or a CMS and drops the tags.",
          },
        ],
      },
      {
        heading: "Rows, columns and headers",
        body: "The shape of the file: what counts as a row, a column and a name for it.",
        members: [
          {
            type: "tool",
            slug: "remove-blank-rows-csv",
            note: "Drops rows of bare commas and columns that have a header but no data underneath.",
          },
          {
            type: "tool",
            slug: "clean-csv-headers",
            note: "Rewrites headers in lower-case snake_case for SQL, pandas and import mappers.",
          },
          {
            type: "tool",
            slug: "find-missing-values-csv",
            note: "Flags every row with a blank in the columns you mark as required, before an import trips over it.",
          },
          {
            type: "tool",
            slug: "csv-to-excel-cleaner",
            note: "A combined pass for a raw export you are about to open in Excel, with headers, dates and blanks tidied.",
          },
        ],
      },
      {
        heading: "Guides for file problems",
        body: "Explanations of the symptoms these tools fix, with the manual fix in Excel or Google Sheets.",
        members: [
          {
            type: "guide",
            slug: "fix-garbled-characters-in-csv",
            note: "Where Ã© and â€™ come from, and how to open the file so they don’t appear.",
          },
          {
            type: "guide",
            slug: "vlookup-na-hidden-spaces",
            note: "Finding the invisible characters that make two matching values fail a lookup.",
          },
          {
            type: "guide",
            slug: "csv-vs-xlsx",
            note: "What each format keeps and loses, and which to choose for an export or an import.",
          },
        ],
      },
    ],
    updated: "2026-10-22",
  },
];

export const HUB_MAP = new Map(HUBS.map((h) => [h.slug, h]));

export function hubPath(hub: Hub): string {
  return `/tools/${hub.slug}`;
}

export function hubMembers(hub: Hub): HubMember[] {
  return hub.sections.flatMap((s) => s.members);
}

export type ResolvedHubMember = { href: string; name: string; note: string; pro: boolean };

/** Turns a hub entry into a link, or undefined if the page doesn't exist (hubs.test.ts fails on that). */
export function resolveHubMember(member: HubMember): ResolvedHubMember | undefined {
  switch (member.type) {
    case "tool": {
      const tool = TOOL_MAP.get(member.slug);
      return tool && { href: `/${tool.slug}`, name: tool.name, note: member.note, pro: toolNeedsPro(tool) };
    }
    case "guide": {
      const guide = GUIDE_MAP.get(member.slug);
      return guide && { href: `/guides/${guide.slug}`, name: guide.h1, note: member.note, pro: guideNeedsPro(guide) };
    }
  }
}

/** The hub a tool belongs to (its listing that isn't cross-listed), for breadcrumbs. */
export function hubForTool(slug: string): Hub | undefined {
  return HUBS.find((h) => hubMembers(h).some((m) => m.type === "tool" && m.slug === slug && !m.crossListed));
}

/** The hub that lists a guide. */
export function hubForGuide(slug: string): Hub | undefined {
  return HUBS.find((h) => hubMembers(h).some((m) => m.type === "guide" && m.slug === slug));
}

export function hubsUpdated(): string {
  return HUBS.map((h) => h.updated).sort().at(-1)!;
}

/** The hub name for use mid-sentence: "bookkeeping and bank exports", but "CSV file cleanup". */
export function hubNameInline(hub: Hub): string {
  const first = hub.name.split(" ")[0];
  return first === first.toUpperCase() ? hub.name : hub.name.charAt(0).toLowerCase() + hub.name.slice(1);
}
