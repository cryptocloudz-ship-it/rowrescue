import { NextResponse } from "next/server";
import type { z } from "zod";
import { currentAccount, TeamError, type Account } from "./data";

/** Run a signed-in route handler, turning TeamErrors into JSON error responses. */
export async function withAccount(handler: (account: Account) => Promise<unknown>) {
  try {
    const account = await currentAccount();
    if (!account) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    return NextResponse.json((await handler(account)) ?? { ok: true });
  } catch (err) {
    if (err instanceof TeamError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

/** Parse a JSON request body against a schema, or throw a 400 with the first problem. */
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.output<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new TeamError("Invalid JSON body.", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new TeamError(parsed.error.issues[0]?.message ?? "Invalid request.", 400);
  return parsed.data;
}
