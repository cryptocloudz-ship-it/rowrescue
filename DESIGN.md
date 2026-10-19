# SpreadsheetFix design rules

Who we design for: **finance and bookkeeping people** cleaning transaction exports
before an import or month-end. The site should feel **precise and premium**
(the finish of Stripe or Linear, without copying their colours or layouts),
use **neutrals with one accent**, push one action (**clean a file now**), and
carry **no personality**: plain statements and real product UI.

The source design is the "SpreadsheetFix Redesign Plan" canvas (hero B, split layout).

## Ban list

Every new or changed section is checked against this list in review. If it's on
the list, it doesn't ship.

**Visual**
- No glow, `text-shadow` halos, neon, blur, glassmorphism or `backdrop-filter` panels.
- No gradient washes, blurred colour blobs, noise or paper textures.
- No dark theme by default.
- No pill badge above the headline, and no centred hero with two buttons side by side.
- No fake window chrome (red/amber/green dots).
- No icon-in-a-tinted-square cards, stat-tile rows or "three steps" rows.
- No illustrations, mascots, emoji or decorative icons. Icons appear only where they label a control.
- No Space Grotesk, Geist, Inter, Roboto or Arial for new work.

**Copy**
- No number on the page that isn't computed from a real file or true for the product
  (e.g. "847 problems", "0.3 seconds").
- No adjectives doing the selling ("lightning fast", "powerful", "magic").
- No jokes, puns or exclamation marks.
- One claim per fact, and it matches everywhere (rule counts, limits, prices
  must agree with `src/config/plans.ts`).
- Placeholders such as `[CUSTOMER QUOTE]` stay until real content exists. Never invent testimonials.

**Conversion**
- One primary action per screen. On the homepage it is "Choose a file".
- Sell Pro after the first result, not before it.

## Tokens

Defined in `src/app/globals.css` under `@theme`, so they work as Tailwind classes
(`text-ink`, `bg-surface`, `border-rule`, `font-data`, …).

| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#FFFFFF` | Page ground |
| `--color-surface` | `#F7F8FA` | Toolbars, table headers, drop zone, quiet panels |
| `--color-rule` | `#E4E7EC` | Hairline borders and table rules |
| `--color-rule-strong` | `#D5DAE1` | Outer border of product frames, secondary button border |
| `--color-ink` | `#0E1525` | Headlines, primary text |
| `--color-ink-body` | `#3A4354` | Body copy |
| `--color-ink-muted` | `#5F6878` | Labels, captions (5.4:1 on surface) |
| `--color-ink-faint` | `#8A92A0` | Struck-through "before" values only, never body text |
| `--color-accent` | `#1F3D99` | Primary button, fixed values, links (9:1 on white) |
| `--color-accent-strong` | `#142A6B` | Accent hover and pressed states |
| `--color-accent-tint` | `#EEF2FB` | Selected row or list item |

The accent means "fixed" or "act". It is never used for decoration. Pro upsells use the
accent too, never a second brand colour.

**Status colours** are the only other hues, and only for state: `emerald` for success,
`amber` for warnings (e.g. a past-due subscription, a row-limit notice), `rose` for errors.
Use the 50 shade for backgrounds, 200 for borders and 700/800 for text.

**Type**
- `--font-ui`: IBM Plex Sans 400/500/600. Headlines are 600 with `-0.03em` tracking.
- `--font-data`: IBM Plex Mono 400/500, for every cell value, file name and code-like token.
- Always use `tabular-nums`. Amounts are right-aligned with two decimals.
- Scale: 13 / 14 / 16 / 18 / 24 / 36 / 54 px. Body copy is 16–18 px with 1.6 line height.

**Shape and space**
- 8 px spacing grid. Content max width 1200 px with 24 px gutters.
- Radius: 6 px for controls, 8 px for panels, 10 px for product frames.
- Borders default to `--color-rule` (set in `globals.css`), so a bare `border` is a hairline.
- Elevation: product frames and dialogs only, `0 1px 2px rgb(14 21 37 / 4%), 0 12px 32px rgb(14 21 37 / 6%)`.
- Touch targets are at least 44 px tall. The primary button is 48 px.

**Imagery**
- The only imagery is the product: real table UI showing before → after values.
  "Before" values are struck through in `ink-faint`; "after" values are in `accent`.
- Example values must be fixes the engine actually makes (check `src/lib/engine/rules`),
  and Pro-only fixes are labelled as Pro.
