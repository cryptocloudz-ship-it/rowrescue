import { withAccount, parseBody } from "@/lib/teams/http";
import { createPreset, listPresets } from "@/lib/presets/data";
import { createPresetSchema } from "@/lib/presets/presetRules";

/** GET /api/presets — the user's synced presets plus their team's shared library. */
export async function GET() {
  return withAccount((account) => listPresets(account));
}

/** POST /api/presets — save the current rules as a synced preset (Pro and Team). */
export async function POST(request: Request) {
  return withAccount(async (account) => ({
    preset: await createPreset(account, await parseBody(request, createPresetSchema)),
  }));
}
