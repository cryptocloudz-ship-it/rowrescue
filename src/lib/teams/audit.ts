/**
 * Team audit log. Entries record who did what to which preset or member. Metadata is limited to the keys below,
 * so rule settings and anything from a file can never end up here.
 */

export const AUDIT_ACTIONS = [
  "preset.create",
  "preset.update",
  "preset.delete",
  "preset.share",
  "preset.unshare",
  "member.invite",
  "member.invite_revoked",
  "member.join",
  "member.leave",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditMetadata {
  presetName?: string;
  changed?: string[];
  email?: string;
  removedBy?: string;
  seats?: number;
}

const METADATA_KEYS: (keyof AuditMetadata)[] = ["presetName", "changed", "email", "removedBy", "seats"];

export interface AuditEntry {
  teamId: string;
  userId: string;
  action: AuditAction;
  presetId?: string | null;
  metadata?: AuditMetadata & Record<string, unknown>;
}

/** The row to insert, with metadata cut down to the allowed keys. */
export function auditRow(entry: AuditEntry) {
  const metadata: Record<string, unknown> = {};
  for (const key of METADATA_KEYS) {
    const value = entry.metadata?.[key];
    if (value !== undefined) metadata[key] = value;
  }
  return {
    id: crypto.randomUUID(),
    teamId: entry.teamId,
    userId: entry.userId,
    action: entry.action,
    presetId: entry.presetId ?? null,
    metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
  };
}

const ACTION_LABELS: Record<AuditAction, string> = {
  "preset.create": "Created preset",
  "preset.update": "Updated preset",
  "preset.delete": "Deleted preset",
  "preset.share": "Shared preset with the team",
  "preset.unshare": "Stopped sharing preset",
  "member.invite": "Invited member",
  "member.invite_revoked": "Revoked invite",
  "member.join": "Joined the team",
  "member.leave": "Left the team",
};

export function auditActionLabel(action: string) {
  return ACTION_LABELS[action as AuditAction] ?? action;
}

export function parseAuditMetadata(json: string | null): AuditMetadata {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as AuditMetadata) : {};
  } catch {
    return {};
  }
}
