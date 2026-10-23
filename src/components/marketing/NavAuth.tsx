"use client";

import Link from "next/link";
import { useSessionHint } from "@/components/auth/clientAuth";

// Marketing pages don't load Clerk: the session cookie decides between "Sign in" and the dashboard link
export function NavAuth() {
  const signedIn = useSessionHint();
  return (
    <>
      {signedIn ? (
        <Link href="/dashboard" className="text-ink hover:text-accent py-3 hidden sm:inline">
          Dashboard
        </Link>
      ) : (
        <Link href="/sign-in" className="text-ink hover:text-accent py-3 hidden sm:inline">
          Sign in
        </Link>
      )}
      <Link
        href="/clean"
        className="inline-flex items-center min-h-10 px-3.5 whitespace-nowrap rounded-md border border-rule-strong bg-paper text-ink text-sm font-medium hover:border-ink-muted transition-colors"
      >
        Open the cleaner
      </Link>
    </>
  );
}
