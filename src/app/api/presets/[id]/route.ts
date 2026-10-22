import { withAccount, parseBody } from "@/lib/teams/http";
import { deletePreset, updatePreset } from "@/lib/presets/data";
import { updatePresetSchema } from "@/lib/presets/presetRules";

/** PATCH /api/presets/:id — rename, overwrite the rules of, or share/unshare one of your presets. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAccount(async (account) => ({
    preset: await updatePreset(account, id, await parseBody(request, updatePresetSchema)),
  }));
}

/** DELETE /api/presets/:id — delete one of your presets. Allowed on any plan. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAccount((account) => deletePreset(account, id));
}
