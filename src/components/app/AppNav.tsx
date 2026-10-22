"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/files", label: "Files" },
  { href: "/automations", label: "Automations" },
  { href: "/team", label: "Team" },
  { href: "/billing", label: "Billing" },
  { href: "/clean", label: "Open the cleaner" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="flex md:flex-col gap-1 overflow-x-auto text-[15px]">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap px-3 py-2.5 rounded-md ${
              active ? "bg-accent-tint text-accent font-medium" : "text-ink-body hover:bg-surface hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
