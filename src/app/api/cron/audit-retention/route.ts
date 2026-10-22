import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { purgeLapsedTeams } from "@/lib/teams/retention";

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Refuse everything if the secret isn't set. */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Daily (see vercel.json): enforce the Team audit log retention period in the privacy policy
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await purgeLapsedTeams();
  console.log("[Cron] audit-retention:", result);
  return NextResponse.json(result);
}
