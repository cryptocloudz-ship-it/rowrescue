"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-100 font-display relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <header className="glass-header sticky top-0 z-50 border-b border-primary/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center neon-glow">
              <Activity className="size-5 text-background-dark font-bold" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight neon-text-glow">
              RowRescue
            </span>
          </Link>
          <Link
            href="/clean"
            className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-xl hover:bg-primary/20 font-bold transition-all text-sm"
          >
            Start Cleaning
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 relative z-10 prose prose-invert prose-slate">
        <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm font-medium text-slate-400 mb-12">Last Updated: March 2026</p>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed mb-4">
            By accessing or using the RowRescue application ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
          </p>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">2. Description of Service</h2>
          <p className="leading-relaxed mb-4">
            RowRescue is a client-side data cleaning application. We provide a set of tools to format, deduplicate, and validate CSV and Excel data within your web browser. Due to our privacy-first architecture, your file contents are never transmitted to our servers for processing.
          </p>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">3. Refund & Fair Use Policy</h2>
          <div className="p-6 my-6 bg-amber-500/10 border border-amber-500/30 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
            <p className="leading-relaxed font-medium text-amber-100/90 relative z-10">
              We offer a <strong className="text-amber-400">3-day money-back guarantee</strong> on all paid subscriptions. To prevent abuse, this guarantee is strictly subject to a <strong>Fair Use Policy</strong>.
            </p>
            <p className="leading-relaxed mt-4 font-medium text-amber-100/80 relative z-10">
              We actively monitor account usage patterns. If we determine that the Service has been abused (e.g., executing massive data cleanups immediately followed by a refund request, or sharing a single account credential across multiple users), we reserve the right to <strong>deny your refund request</strong> and instantly terminate your access.
            </p>
          </div>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">4. User Accounts</h2>
          <p className="leading-relaxed mb-4">
            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">5. Limitation of Liability</h2>
          <p className="leading-relaxed mb-4">
            In no event shall RowRescue, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>
        
        <div className="border-t border-slate-800 pt-8 mt-12">
          <Link href="/pricing" className="text-primary hover:underline font-bold">
            &larr; Back to Pricing
          </Link>
        </div>
      </main>
    </div>
  );
}
