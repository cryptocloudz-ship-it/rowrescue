import { describe, it, expect } from "vitest";
import { HUBS, hubMembers, hubForTool, hubForGuide, resolveHubMember, hubNameInline } from "../hubs";
import { TOOLS } from "../tools";
import { GUIDES } from "../guides";

// A hub has to say something its member pages don't, or it is a thin listing page.
const MIN_WORDS = 250;

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

describe("hub pages", () => {
  it("have unique slugs, names, titles, descriptions and h1s within length limits", () => {
    for (const key of ["slug", "name", "metaTitle", "metaDescription", "h1"] as const) {
      const values = HUBS.map((h) => h[key]);
      expect(new Set(values).size, key).toBe(values.length);
    }
    for (const h of HUBS) {
      // The " | SpreadsheetFix" template adds 17 characters
      expect(`${h.metaTitle} | SpreadsheetFix`.length, h.slug).toBeLessThanOrEqual(65);
      expect(h.metaDescription.length, h.slug).toBeLessThanOrEqual(160);
      expect(h.updated, h.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("don't reuse a tool or guide title, so a hub never competes with a member for its keyword", () => {
    const memberTitles = new Set([...TOOLS.flatMap((t) => [t.metaTitle, t.h1]), ...GUIDES.flatMap((g) => [g.metaTitle, g.h1])].map(normalise));
    for (const h of HUBS) {
      expect(memberTitles.has(normalise(h.metaTitle)), h.slug).toBe(false);
      expect(memberTitles.has(normalise(h.h1)), h.slug).toBe(false);
    }
  });

  it("only list pages that exist, once per hub", () => {
    for (const h of HUBS) {
      const members = hubMembers(h);
      for (const m of members) expect(resolveHubMember(m), `${h.slug}: ${m.type} ${m.slug}`).toBeDefined();
      const keys = members.map((m) => `${m.type}:${m.slug}`);
      expect(new Set(keys).size, h.slug).toBe(keys.length);
    }
  });

  it("give every tool exactly one home hub and every guide a hub", () => {
    for (const t of TOOLS) {
      const homes = HUBS.filter((h) => hubMembers(h).some((m) => m.type === "tool" && m.slug === t.slug && !m.crossListed));
      expect(homes.length, t.slug).toBe(1);
      expect(hubForTool(t.slug), t.slug).toBe(homes[0]);
    }
    for (const g of GUIDES) expect(hubForGuide(g.slug), g.slug).toBeDefined();
  });

  it(`carry at least ${MIN_WORDS} words of their own copy`, () => {
    for (const h of HUBS) {
      const copy = [...h.intro, ...h.workflow, ...h.sections.flatMap((s) => [s.heading, s.body, ...s.members.map((m) => m.note)])];
      expect(words(copy.join(" ")), h.slug).toBeGreaterThanOrEqual(MIN_WORDS);
    }
  });

  it("never repeat copy from tool pages, guides or another hub", () => {
    const elsewhere = new Set(
      [
        ...TOOLS.flatMap((t) => [t.intro, t.metaDescription, ...t.sections.map((s) => s.body), ...t.faqs.map((f) => f.a)]),
        ...GUIDES.flatMap((g) => [g.summary, g.metaDescription, ...g.cause, ...g.toolFix]),
      ].map(normalise)
    );
    const seen = new Map<string, string>();
    for (const h of HUBS) {
      const blocks = [...h.intro, ...h.workflow, ...h.sections.flatMap((s) => [s.body, ...s.members.map((m) => m.note)])];
      for (const block of blocks) {
        const key = normalise(block);
        expect(elsewhere.has(key), `${h.slug}: "${block.slice(0, 60)}…" copies a tool or guide`).toBe(false);
        expect(seen.get(key), `${h.slug}: "${block.slice(0, 60)}…" repeats ${seen.get(key)}`).toBeUndefined();
        seen.set(key, h.slug);
      }
    }
  });

  it("read naturally mid-sentence", () => {
    expect(HUBS.map(hubNameInline)).toEqual(["bookkeeping and bank exports", "contact lists and CRM", "CSV file cleanup"]);
  });
});
