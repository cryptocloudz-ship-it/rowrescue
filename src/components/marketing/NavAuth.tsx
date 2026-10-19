"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

// Client-side auth state keeps marketing pages statically renderable
export function NavAuth() {
  return (
    <>
      <SignedOut>
        <Link href="/sign-in" className="text-ink hover:text-accent py-3 hidden sm:inline">
          Sign in
        </Link>
      </SignedOut>
      <Link
        href="/clean"
        className="inline-flex items-center min-h-10 px-3.5 whitespace-nowrap rounded-md border border-rule-strong bg-paper text-ink text-sm font-medium hover:border-ink-muted transition-colors"
      >
        Open the cleaner
      </Link>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
