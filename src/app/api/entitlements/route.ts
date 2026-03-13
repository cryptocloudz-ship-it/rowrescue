import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { getPlanLimits } from "@/config/plans";

/**
 * GET /api/entitlements
 *
 * Returns the authenticated user's plan limits and usage.
 * Falls back to free tier for unauthenticated requests.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    const freeLimits = getPlanLimits("free");
    return NextResponse.json({
      plan: "free",
      status: null,
      exportsToday: 0,
      limits: freeLimits,
      periodEnd: null,
    });
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    const freeLimits = getPlanLimits("free");
    return NextResponse.json({
      plan: "free",
      status: null,
      exportsToday: 0,
      limits: freeLimits,
      periodEnd: null,
    });
  }

  // Reset daily export counter if it's a new day
  const today = new Date().toISOString().split("T")[0];
  let exportsToday = user.exportsToday;

  if (user.exportsResetDate !== today) {
    await db
      .update(users)
      .set({ exportsToday: 0, exportsResetDate: today })
      .where(eq(users.id, userId));
    exportsToday = 0;
  }

  const limits = getPlanLimits(user.plan);

  return NextResponse.json({
    plan: user.plan,
    status: user.subscriptionStatus,
    exportsToday,
    limits,
    periodEnd: user.currentPeriodEnd?.toISOString() ?? null,
  });
}

/**
 * POST /api/entitlements
 *
 * Record an export event. Increments exports_today counter.
 * Enforces server-side rate limits.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const body = await request.json();
  const { fileName, rowCount, rulesApplied } = body;

  // Unauthenticated: enforce free limits without persistence
  if (!userId) {
    const limits = getPlanLimits("free");
    if (rowCount > limits.maxRows) {
      return NextResponse.json(
        {
          error: `Row limit exceeded. Free plan allows ${limits.maxRows.toLocaleString()} rows. Upgrade to Pro for up to 500,000 rows.`,
          code: "ROW_LIMIT_EXCEEDED",
        },
        { status: 403 }
      );
    }
    return NextResponse.json({
      allowed: true,
      exportsRemaining: limits.maxExportsPerDay,
      fileName,
      rulesApplied,
    });
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const plan = user?.plan ?? "free";
  const limits = getPlanLimits(plan);

  // Enforce row limit
  if (rowCount > limits.maxRows) {
    return NextResponse.json(
      {
        error: `Row limit exceeded. Your ${plan} plan allows ${limits.maxRows.toLocaleString()} rows.`,
        code: "ROW_LIMIT_EXCEEDED",
      },
      { status: 403 }
    );
  }

  // Reset daily counter if needed and check export limit
  const today = new Date().toISOString().split("T")[0];
  let exportsToday = user?.exportsToday ?? 0;

  if (user && user.exportsResetDate !== today) {
    exportsToday = 0;
  }

  if (exportsToday >= limits.maxExportsPerDay) {
    return NextResponse.json(
      {
        error: `Daily export limit reached (${limits.maxExportsPerDay}). Upgrade for unlimited exports.`,
        code: "EXPORT_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  // Increment counter
  if (user) {
    await db
      .update(users)
      .set({
        exportsToday: exportsToday + 1,
        exportsResetDate: today,
      })
      .where(eq(users.id, userId));
  }

  return NextResponse.json({
    allowed: true,
    exportsRemaining: limits.maxExportsPerDay - (exportsToday + 1),
    fileName,
    rulesApplied,
  });
}
