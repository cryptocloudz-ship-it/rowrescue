import { and, desc, eq, ne } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { presets, users } from "@/db/drizzle";
import { presetActor, TeamError, writeAudit, type Account } from "@/lib/teams/data";
import {
  canCreatePreset,
  canDeletePreset,
  canEditPreset,
  canSharePresets,
} from "@/lib/teams/policy";
import type { AuditEntry } from "@/lib/teams/audit";
import { parseStoredRules, type createPresetSchema, type updatePresetSchema } from "./presetRules";
import type { PresetListResponse, SyncedPreset } from "./types";

type PresetRow = typeof presets.$inferSelect;
type CreateInput = z.output<typeof createPresetSchema>;
type UpdateInput = z.output<typeof updatePresetSchema>;

function toDto(row: PresetRow, account: Account, author: string | null): SyncedPreset | null {
  const rules = parseStoredRules(row.rules);
  if (!rules) return null;
  const mine = row.userId === account.user.id;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    rules,
    isShared: row.isShared,
    mine,
    readOnly: !canEditPreset(presetActor(account), row),
    author,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Audit only presets of people in a team; there's no team log to write to otherwise. */
async function audit(account: Account, entry: Omit<AuditEntry, "teamId" | "userId">) {
  if (!account.team) return;
  await writeAudit({ ...entry, teamId: account.team.id, userId: account.user.id });
}

/**
 * The user's own presets (kept readable after a downgrade) plus, on Team, the presets teammates shared.
 */
export async function listPresets(account: Account): Promise<PresetListResponse> {
  const actor = presetActor(account);
  const own = await db.select().from(presets).where(eq(presets.userId, account.user.id)).orderBy(desc(presets.updatedAt));
  const shared =
    actor.limits.hasSharedPresets && actor.teamId
      ? await db
          .select({ preset: presets, authorName: users.name, authorEmail: users.email })
          .from(presets)
          .innerJoin(users, eq(users.id, presets.userId))
          .where(and(eq(presets.teamId, actor.teamId), eq(presets.isShared, true), ne(presets.userId, account.user.id)))
          .orderBy(desc(presets.updatedAt))
      : [];

  return {
    presets: [
      ...own.map((row) => toDto(row, account, null)),
      ...shared.map((r) => toDto(r.preset, account, r.authorName || r.authorEmail)),
    ].filter((p): p is SyncedPreset => p !== null),
    canCreate: canCreatePreset(actor),
    canShare: canSharePresets(actor),
  };
}

export async function createPreset(account: Account, input: CreateInput): Promise<SyncedPreset> {
  const actor = presetActor(account);
  if (!canCreatePreset(actor)) {
    throw new TeamError("Synced presets are part of Pro and Team. Free presets are saved in your browser.", 403);
  }
  if (input.isShared && !canSharePresets(actor)) {
    throw new TeamError("Sharing presets with a team needs the Team plan.", 403);
  }

  const [row] = await db
    .insert(presets)
    .values({
      id: crypto.randomUUID(),
      userId: account.user.id,
      teamId: input.isShared ? actor.teamId : null,
      name: input.name,
      description: input.description,
      rules: JSON.stringify(input.rules),
      isShared: input.isShared,
    })
    .returning();

  await audit(account, { action: "preset.create", presetId: row.id, metadata: { presetName: row.name } });
  if (row.isShared) await audit(account, { action: "preset.share", presetId: row.id, metadata: { presetName: row.name } });
  return toDto(row, account, null)!;
}

async function ownPreset(account: Account, id: string) {
  const [row] = await db.select().from(presets).where(eq(presets.id, id));
  // Someone else's preset reads as missing, so ids can't be probed
  if (!row || row.userId !== account.user.id) throw new TeamError("Preset not found.", 404);
  return row;
}

export async function updatePreset(account: Account, id: string, input: UpdateInput): Promise<SyncedPreset> {
  const actor = presetActor(account);
  const row = await ownPreset(account, id);
  if (!canEditPreset(actor, row)) {
    throw new TeamError("This preset is read-only because your plan no longer syncs presets. You can still load or delete it.", 403);
  }
  const sharingChanged = input.isShared !== undefined && input.isShared !== row.isShared;
  if (sharingChanged && input.isShared && !canSharePresets(actor)) {
    throw new TeamError("Sharing presets with a team needs the Team plan.", 403);
  }

  const changed = (["name", "description", "rules"] as const).filter((key) => input[key] !== undefined);
  const isShared = input.isShared ?? row.isShared;
  const [updated] = await db
    .update(presets)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.rules !== undefined && { rules: JSON.stringify(input.rules) }),
      isShared,
      teamId: isShared ? actor.teamId : null,
      updatedAt: new Date(),
    })
    .where(eq(presets.id, row.id))
    .returning();

  if (changed.length > 0) {
    await audit(account, { action: "preset.update", presetId: row.id, metadata: { presetName: updated.name, changed } });
  }
  if (sharingChanged) {
    await audit(account, {
      action: isShared ? "preset.share" : "preset.unshare",
      presetId: row.id,
      metadata: { presetName: updated.name },
    });
  }
  return toDto(updated, account, null)!;
}

export async function deletePreset(account: Account, id: string) {
  const row = await ownPreset(account, id);
  if (!canDeletePreset(presetActor(account), row)) throw new TeamError("Preset not found.", 404);
  await db.delete(presets).where(eq(presets.id, row.id));
  await audit(account, { action: "preset.delete", presetId: row.id, metadata: { presetName: row.name } });
}
