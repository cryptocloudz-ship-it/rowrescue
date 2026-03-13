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
  ArrowRight,
} from "lucide-react";

export default async function LandingPage() {
  await auth();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold text-teal-600">TidySheet</span>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <SignedOut>
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Start Cleaning
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/clean"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Start Cleaning
              </Link>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          100% client-side. Your data never leaves your browser.
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
          Clean messy CSVs
          <br />
          <span className="text-teal-600">in seconds.</span>
        </h1>
        <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
          Remove duplicates, fix formatting, normalize dates, validate emails — all
          without uploading your data anywhere. Privacy-first spreadsheet cleaning.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/clean"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-lg"
          >
            Clean a File Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-lg"
          >
            View Pricing
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          No sign-up required. Free for files up to 5,000 rows.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Three steps to clean data
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              icon={<FileSpreadsheet className="w-6 h-6" />}
              title="Upload"
              description="Drag and drop your CSV or Excel file. We auto-detect delimiters, encoding, and column types."
            />
            <StepCard
              step={2}
              icon={<Eye className="w-6 h-6" />}
              title="Review & Clean"
              description="See a health report of issues, choose cleaning rules, and preview every change before committing."
            />
            <StepCard
              step={3}
              icon={<Download className="w-6 h-6" />}
              title="Export"
              description="Download your cleaned file as CSV or Excel, plus a change log showing exactly what was modified."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Everything you need to fix messy data
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            17 cleaning rules, instant health reports, and full change tracking.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Remove Duplicates"
              description="Exact match or by key columns. See which rows were removed."
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
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Built for privacy
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <TrustCard
              icon={<Shield className="w-8 h-8 text-teal-600" />}
              title="Zero Data Upload"
              description="All processing runs in JavaScript in your browser. No file data touches our servers. Ever."
            />
            <TrustCard
              icon={<Zap className="w-8 h-8 text-teal-600" />}
              title="Instant Processing"
              description="No waiting for server responses. Files are parsed and cleaned locally at full speed."
            />
            <TrustCard
              icon={<CheckCircle className="w-8 h-8 text-teal-600" />}
              title="GDPR Ready"
              description="Based in Ireland. We only store account email and billing metadata. Full data rights included."
            />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Perfect for
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "E-commerce", desc: "Clean Shopify, WooCommerce, and product catalog exports" },
              { title: "Email Marketing", desc: "Deduplicate and validate Mailchimp, Klaviyo lists" },
              { title: "Accounting", desc: "Fix Xero, QuickBooks CSV imports with mixed formats" },
              { title: "Legal & Ops", desc: "Standardize client records, case data, and reporting" },
            ].map((uc) => (
              <div
                key={uc.title}
                className="p-5 bg-gray-50 rounded-xl"
              >
                <h3 className="font-semibold text-gray-900">{uc.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Stop fighting messy spreadsheets
          </h2>
          <p className="text-teal-100 mt-4 text-lg">
            Clean your first file in under 3 minutes. No sign-up. No risk.
          </p>
          <Link
            href="/clean"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-teal-700 rounded-lg hover:bg-teal-50 font-semibold text-lg"
          >
            Start Cleaning — Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} TidySheet. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-700">Pricing</Link>
            <a href="/legal/terms-of-service" className="hover:text-gray-700">Terms</a>
            <a href="/legal/privacy-policy" className="hover:text-gray-700">Privacy</a>
            <a href="/legal/cookie-policy" className="hover:text-gray-700">Cookies</a>
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
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl mb-4">
        {icon}
      </div>
      <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">
        Step {step}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
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
    <div className="p-5 border rounded-xl hover:border-teal-200 transition-colors">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
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
    <div className="flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
}
