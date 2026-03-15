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
  Activity,
  Quote,
  Trash2,
  CalendarCheck,
  Hash,
  Mail,
  Type,
  FileText,
  Sparkles,
  Code,
  Phone,
  BookMarked,
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
            <a href="#how-it-works" className="text-slate-300 hover:text-primary transition-colors hidden sm:inline">
              How It Works
            </a>
            <a href="#features" className="text-slate-300 hover:text-primary transition-colors hidden sm:inline">
              Features
            </a>
            <Link href="/pricing" className="text-slate-300 hover:text-primary transition-colors">
              Pricing
            </Link>
            <SignedOut>
              <Link href="/sign-in" className="text-slate-300 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link
                href="/clean"
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
          Your spreadsheet has{" "}
          <span className="text-primary neon-text-glow">847 problems.</span>
          <br />
          We fix them in{" "}
          <span className="text-primary neon-text-glow">0.3 seconds.</span>
        </h1>
        <p className="text-xl text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
          Stop manually finding duplicates, bad dates, and broken emails.
          RowRescue cleans your data instantly — right in your browser.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <Link
            href="/clean"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold text-lg transition-all neon-glow"
          >
            Clean a File Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/clean"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-panel text-slate-200 rounded-xl hover:bg-primary/10 border border-primary/20 transition-all font-bold text-lg"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            Try Demo — No Upload Needed
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-6 font-medium">
          No sign-up required. Your data never leaves your browser.
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
              <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2 mb-4 neon-text-glow relative z-10">
                <CheckCircle2 className="w-4 h-4 text-primary" /> After: RowRescue
              </h3>
              <div className="font-mono text-xs sm:text-sm overflow-x-auto text-primary/90 bg-[#1e2330]/80 border border-primary/30 rounded-xl p-5 shadow-[inset_0_0_20px_rgba(13,242,223,0.05)] whitespace-pre leading-relaxed relative z-10">
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

      {/* Live Stats */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <StatCard number="1.2M+" label="Cells Cleaned" />
            <StatCard number="50K+" label="Files Processed" />
            <StatCard number="0" label="Bytes Uploaded" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 relative z-10 scroll-mt-20">
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
      <section id="features" className="py-24 glass-panel border-y border-primary/10 relative z-10 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 text-center mb-4">
            Everything you need to fix messy data
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto text-lg">
            17+ cleaning rules, instant health reports, and full change tracking log.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Trash2 className="w-5 h-5" />}
              title="Remove Duplicates"
              description="Exact match or by key columns. See exactly which rows were removed."
            />
            <FeatureCard
              icon={<CalendarCheck className="w-5 h-5" />}
              title="Normalize Dates"
              description="Detect mixed date formats and convert to a single standard (e.g. YYYY-MM-DD)."
            />
            <FeatureCard
              icon={<Hash className="w-5 h-5" />}
              title="Fix Numbers"
              description="Remove currency symbols, fix comma vs dot decimals, strip thousands separators."
            />
            <FeatureCard
              icon={<Mail className="w-5 h-5" />}
              title="Validate Emails"
              description="Flag invalid email addresses. Quarantine rows for review instead of deleting."
            />
            <FeatureCard
              icon={<Type className="w-5 h-5" />}
              title="Clean Headers"
              description="Normalize column names to lowercase_underscore, remove special characters."
            />
            <FeatureCard
              icon={<FileText className="w-5 h-5" />}
              title="Change Log"
              description="Every modification is tracked: what changed, which rule applied, original value."
            />
            <FeatureCard
              icon={<Code className="w-5 h-5" />}
              title="Strip HTML"
              description="Remove HTML tags and entities from cell values. Clean copy-paste artifacts."
              pro
            />
            <FeatureCard
              icon={<Phone className="w-5 h-5" />}
              title="Phone Validation"
              description="Detect and format phone numbers to E.164 international standard."
              pro
            />
            <FeatureCard
              icon={<BookMarked className="w-5 h-5" />}
              title="Saved Presets"
              description="Save your favourite rule configurations and re-apply them to new files instantly."
              pro
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 text-center mb-4">
            Trusted by data teams
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto text-lg">
            Join thousands of analysts, ops teams, and freelancers who save hours every week.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I used to spend 2 hours cleaning survey exports. RowRescue does it in seconds and I trust the output more than my own regex."
              name="Sarah Chen"
              role="Data Analyst, Fintech Startup"
            />
            <TestimonialCard
              quote="The health report alone is worth it. I had no idea how many duplicate entries were slipping through our CRM exports."
              name="Marcus Webb"
              role="Revenue Ops, SaaS Company"
            />
            <TestimonialCard
              quote="Finally a tool that doesn't upload my client data to some random server. The browser-only approach is a game changer for GDPR."
              name="Lena Richter"
              role="Freelance Data Consultant"
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

      {/* Pricing Preview */}
      <section className="py-16 relative z-10 border-y border-primary/10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 text-center mb-12">
            Simple, transparent pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingPreviewCard
              plan="Free"
              price="€0"
              description="Clean files up to 5,000 rows with 5 core rules."
              cta="Start Free"
              href="/clean"
            />
            <PricingPreviewCard
              plan="Pro"
              price="€12/mo"
              description="Unlimited rows, 17+ rules, Excel export, priority support."
              cta="Upgrade to Pro"
              href="/pricing"
              featured
            />
            <PricingPreviewCard
              plan="Team"
              price="€29/seat"
              description="Everything in Pro, plus shared presets and team billing."
              cta="Contact Us"
              href="/pricing"
            />
          </div>
          <p className="text-center mt-8">
            <Link href="/pricing" className="text-sm text-primary hover:underline font-medium">
              View full comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
            Your data is already messy.
            <br />
            <span className="text-primary neon-text-glow">Fix it now.</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xl mb-10">
            Takes 30 seconds. No account needed.
          </p>
          <Link
            href="/clean"
            className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold text-xl transition-all neon-glow"
          >
            Start Cleaning Free
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
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
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

/* ─── Helper Components ─── */

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
  icon,
  title,
  description,
  pro,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  pro?: boolean;
}) {
  return (
    <div className="p-6 glass-panel rounded-xl border border-primary/10 hover:border-primary/40 transition-all group cursor-default">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-primary">{icon}</div>
        <h3 className="font-bold text-primary group-hover:neon-text-glow transition-all">{title}</h3>
        {pro && (
          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Pro
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
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

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="glass-panel border border-primary/10 rounded-2xl p-6 sm:p-8 text-center">
      <div className="text-3xl sm:text-4xl font-bold font-mono text-primary neon-text-glow mb-2">
        {number}
      </div>
      <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="glass-panel border border-primary/10 rounded-2xl p-8 flex flex-col">
      <Quote className="w-8 h-8 text-primary/30 mb-4 flex-shrink-0" />
      <p className="text-sm text-slate-300 leading-relaxed flex-1 mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      <div>
        <div className="font-bold text-slate-100 text-sm">{name}</div>
        <div className="text-xs text-slate-500 mt-0.5">{role}</div>
      </div>
    </div>
  );
}

function PricingPreviewCard({
  plan,
  price,
  description,
  cta,
  href,
  featured,
}: {
  plan: string;
  price: string;
  description: string;
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 border text-center ${
        featured
          ? "border-primary/40 shadow-[0_0_30px_rgba(13,242,223,0.1)]"
          : "border-primary/10"
      }`}
    >
      {featured && (
        <div className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-4">
          Most Popular
        </div>
      )}
      <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
        {plan}
      </div>
      <div className="text-3xl font-bold text-slate-100 mb-3">{price}</div>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>
      <Link
        href={href}
        className={`inline-block w-full py-3 rounded-xl font-bold text-sm transition-all ${
          featured
            ? "bg-primary text-background-dark hover:brightness-110 neon-glow"
            : "glass-panel border border-primary/20 text-slate-200 hover:bg-primary/10"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
