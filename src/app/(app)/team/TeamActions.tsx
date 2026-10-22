"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function call(url: string, init: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
  return data;
}

function inviteLink(token: string) {
  return `${window.location.origin}/team/join?token=${encodeURIComponent(token)}`;
}

export function InviteForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { invite } = await call("/api/team/invites", { method: "POST", body: JSON.stringify({ email }) });
      await navigator.clipboard?.writeText(inviteLink(invite.token)).catch(() => {});
      setMessage({ text: `Invite created for ${invite.email}. The join link is copied: send it to them.` });
      setEmail("");
      router.refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Something went wrong.", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex flex-wrap gap-3">
        <label htmlFor="invite-email" className="sr-only">
          Email address
        </label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          placeholder="colleague@company.com"
          className="flex-1 min-w-[220px] min-h-11 px-3 rounded-md border border-rule-strong bg-paper text-[15px] focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || busy}
          className="min-h-11 px-5 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-strong disabled:opacity-50"
        >
          {busy ? "Inviting…" : "Invite"}
        </button>
      </div>
      <p role="status" aria-live="polite" className={`mt-2 text-sm ${message?.error ? "text-red-700" : "text-ink-body"}`}>
        {message?.text}
      </p>
    </form>
  );
}

export function CopyInviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(inviteLink(token));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="min-h-9 px-3 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

/** A button that calls the API and refreshes the page; `confirm` asks first. */
export function ActionButton({
  url,
  method = "DELETE",
  body,
  label,
  confirm,
  redirectTo,
  primary,
}: {
  url: string;
  method?: string;
  body?: unknown;
  label: string;
  confirm?: string;
  redirectTo?: string;
  primary?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    setError(null);
    try {
      await call(url, { method, ...(body !== undefined && { body: JSON.stringify(body) }) });
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className={
          primary
            ? "min-h-11 px-5 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-strong disabled:opacity-50"
            : "min-h-9 px-3 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted disabled:opacity-50"
        }
      >
        {busy ? "Working…" : label}
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-700 max-w-[280px] text-right">
          {error}
        </span>
      )}
    </span>
  );
}
