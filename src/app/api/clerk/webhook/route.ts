import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/drizzle";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name } = event.data;
      const primaryEmail =
        email_addresses.find((e) => e.id === event.data.primary_email_address_id)
          ?.email_address ?? email_addresses[0]?.email_address;

      if (!primaryEmail) break;

      const name = [first_name, last_name].filter(Boolean).join(" ") || null;
      const today = new Date().toISOString().split("T")[0];

      await db.insert(users).values({
        id,
        email: primaryEmail,
        name,
        plan: "free",
        exportsToday: 0,
        exportsResetDate: today,
      });
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name } = event.data;
      const primaryEmail =
        email_addresses.find((e) => e.id === event.data.primary_email_address_id)
          ?.email_address ?? email_addresses[0]?.email_address;

      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      await db
        .update(users)
        .set({
          ...(primaryEmail && { email: primaryEmail }),
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      if (id) {
        await db.delete(users).where(eq(users.id, id));
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
