import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Shield,
  Zap,
  FileSpreadsheet,
  Eye,
  Download,
  CheckCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Activity
} from "lucide-react";

export default async function LandingPage() {
  await auth();

  return (
    <div className="min-h-screen bg-background-dark font-display text-slate-100 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      {/* Nav */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center neon-glow">
              <Activity className="size-5 text-background-dark font-bold" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary neon-text-glow">RowRescue</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/pricing" className="text-slate-300 hover:text-primary transition-colors">
              Pricing
            </Link>
            <SignedOut>
              <Link href="/sign-in" className="text-slate-300 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold transition-all neon-glow"
              >
                Start Cleaning
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/clean"
                className="px-5 py-2.5 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold transition-all neon-glow"
              >
                Start Cleaning
              </Link>
              <div className="relative z-10 p-0.5 rounded-full border border-primary/30">
                <UserButton />
              </div>
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-28 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-panel text-primary rounded-full text-sm font-bold tracking-wide mb-8 border border-primary/20">
          <Shield className="w-4 h-4" />
          100% Client-Side. Zero Data Uploading.
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold text-slate-100 leading-tight mb-6">
          Clean messy CSVs
          <br />
          <span className="text-primary neon-text-glow">in seconds.</span>
        </h1>
        <p className="text-xl text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
          Remove duplicates, fix formatting, normalize dates, validate emails — all
          without uploading your data anywhere. Privacy-first spreadsheet cleaning.
        </p>
        <div className="flex justify-center gap-4 mt-10">
          <Link
            href="/clean"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold text-lg transition-all neon-glow"
          >
            Clean a File Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 glass-panel text-slate-200 rounded-xl hover:bg-primary/10 border border-primary/20 transition-all font-bold text-lg"
          >
            View Pricing
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-6 font-medium">
          No sign-up required. Free for files up to 5,000 rows.
        </p>
      </section>

      {/* Before/After Visualization */}
      <section className="max-w-5xl mx-auto px-4 pb-24 relative z-10">
        <div className="relative rounded-2xl border border-primary/20 glass-panel shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex border-b border-primary/10 bg-background-dark/50 p-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-primary/10 bg-background-dark/30">
            <div className="p-8">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <XCircle className="w-4 h-4" /> Before: Messy Data
              </h3>
              <div className="font-mono text-xs sm:text-sm overflow-x-auto text-slate-400 bg-[#1e2330] border border-rose-500/20 rounded-xl p-5 shadow-inner whitespace-pre leading-relaxed">
{`email,date,phone,name
john.doe@gmail , 12/31/2023, 555-1234, John Doe
jane.smith@yahoo.com, 2023-12-31, (555) 567-8901, Jane Smith
INVALID_EMAIL, 31-12-2023, 5551234, Bob
john.doe@gmail, 12/31/2023, 555-1234, John Doe`}
              </div>
            </div>
            <div className="p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2 mb-4 neon-text-glow">
                <CheckCircle2 className="w-4 h-4 text-primary" /> After: RowRescue
              </h3>
              <div className="font-mono text-xs sm:text-sm overflow-x-auto text-primary/90 bg-[#1e2330]/80 border border-primary/30 rounded-xl p-5 shadow-[inset_0_0_20px_rgba(13,242,223,0.05)] whitespace-pre leading-relaxed">
{`email,date,phone,name
john.doe@gmail.com, 2023-12-31, +1-555-123-4000, John Doe
jane.smith@yahoo.com, 2023-12-31, +1-555-567-8901, Jane Smith
[QUARANTINED: INVALID_EMAIL]
[DUPLICATE ROW REMOVED]`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-primary/10 glass-panel py-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-500 mb-8 uppercase tracking-widest">Trusted by modern data teams at</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-300"><Zap className="w-6 h-6 text-amber-400"/> TechCorp</div>
            <div className="flex items-center gap-2 font-bold text-xl text-slate-300"><Shield className="w-6 h-6 text-indigo-400"/> SecureData</div>
            <div className="flex items-center gap-2 font-bold text-xl text-slate-300"><FileSpreadsheet className="w-6 h-6 text-primary"/> MetricsInc</div>
            <div className="flex items-center gap-2 font-bold text-xl text-slate-300"><CheckCircle className="w-6 h-6 text-emerald-400"/> ClearFlow</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 text-center mb-16">
            Three steps to clean data
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              icon={<FileSpreadsheet className="w-8 h-8" />}
              title="Upload"
              description="Drag and drop your CSV or Excel file. We auto-detect delimiters, encoding, and column types."
            />
            <StepCard
              step={2}
              icon={<Eye className="w-8 h-8" />}
              title="Review & Clean"
              description="See a health report of issues, choose cleaning rules, and preview every change before committing."
            />
            <StepCard
              step={3}
              icon={<Download className="w-8 h-8" />}
              title="Export"
              description="Download your cleaned file as CSV or Excel, plus a change log showing exactly what was modified."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 glass-panel border-y border-primary/10 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 text-center mb-4">
            Everything you need to fix messy data
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto text-lg">
            17+ cleaning rules, instant health reports, and full change tracking log.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Remove Duplicates"
              description="Exact match or by key columns. See exactly which rows were removed."
            />
            <FeatureCard
              title="Normalize Dates"
              description="Detect mixed date formats and convert to a single standard (e.g. YYYY-MM-DD)."
            />
            <FeatureCard
              title="Fix Numbers"
              description="Remove currency symbols, fix comma vs dot decimals, strip thousands separators."
            />
            <FeatureCard
              title="Validate Emails"
              description="Flag invalid email addresses. Quarantine rows for review instead of deleting."
            />
            <FeatureCard
              title="Clean Headers"
              description="Normalize column names to lowercase_underscore, remove special characters."
            />
            <FeatureCard
              title="Change Log"
              description="Every modification is tracked: what changed, which rule applied, original value."
            />
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-24 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-16">
            Built for total privacy
          </h2>
          <div className="grid sm:grid-cols-3 gap-10">
            <TrustCard
              icon={<Shield className="w-10 h-10 text-primary neon-text-glow" />}
              title="Zero Data Upload"
              description="Processing runs securely in JavaScript in your browser. No file data touches our servers. Ever."
            />
            <TrustCard
              icon={<Zap className="w-10 h-10 text-primary neon-text-glow" />}
              title="Instant Processing"
              description="No waiting for server uploads or queues. Files are parsed and cleaned locally at lightning speed."
            />
            <TrustCard
              icon={<CheckCircle className="w-10 h-10 text-primary neon-text-glow" />}
              title="GDPR Ready"
              description="Based in the EU. We only store account email and billing metadata. Full data rights included."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative z-10 border-t border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
            Stop fighting messy spreadsheets.
          </h2>
          <p className="text-slate-400 mt-4 text-xl mb-10">
            Clean your first file in under 3 minutes. No sign-up. No risk.
          </p>
          <Link
            href="/clean"
            className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold text-xl transition-all neon-glow"
          >
            Start Cleaning For Free
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 glass-panel py-10 relative z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <span>&copy; {new Date().getFullYear()} RowRescue. All rights reserved.</span>
          </div>
          <div className="flex gap-8">
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <a href="/legal/terms-of-service" className="hover:text-primary transition-colors">Terms</a>
            <a href="/legal/privacy-policy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="/legal/cookie-policy" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center glass-panel p-8 rounded-2xl border border-primary/10 hover:border-primary/40 transition-all hover:-translate-y-1">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-6 shadow-lg shadow-primary/20">
        {icon}
      </div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Step {step}
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 glass-panel rounded-xl border border-primary/10 hover:border-primary/40 transition-all group cursor-default">
      <h3 className="font-bold text-primary group-hover:neon-text-glow transition-all">{title}</h3>
      <p className="text-sm text-slate-400 mt-3 leading-relaxed">{description}</p>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center glass-panel p-8 rounded-2xl border border-primary/10">
      <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/20">{icon}</div>
      <h3 className="font-bold text-xl text-slate-100 mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
