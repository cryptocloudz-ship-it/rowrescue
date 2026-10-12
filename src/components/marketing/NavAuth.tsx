"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

// Client-side auth state keeps marketing pages statically renderable
export function NavAuth() {
  return (
    <>
      <SignedOut>
        <Link href="/sign-in" className="text-slate-300 hover:text-primary transition-colors">
          Sign In
        </Link>
      </SignedOut>
      <Link
        href="/clean"
        className="px-5 py-2.5 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold transition-all neon-glow"
      >
        Start Cleaning
      </Link>
      <SignedIn>
        <div className="relative z-10 p-0.5 rounded-full border border-primary/30">
          <UserButton />
        </div>
      </SignedIn>
    </>
  );
}
