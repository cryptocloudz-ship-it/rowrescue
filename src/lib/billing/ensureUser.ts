import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/drizzle";

/**
 * Return the signed-in user's row, creating it from the Clerk session if it doesn't exist yet.
 * Doesn't rely on the Clerk webhook having run.
 */
export async function ensureUser(userId: string) {
  const [existing] = await db.select().from(users).where(eq(users.id, userId));
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
  if (!clerkUser || clerkUser.id !== userId || !email) return null;

  await db.insert(users).values({ id: userId, email }).onConflictDoNothing();
  const [created] = await db.select().from(users).where(eq(users.id, userId));
  return created ?? null;
}
