import { Check, X } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { name: "Exports per day", free: "5", pro: "Unlimited", team: "Unlimited" },
  { name: "Max rows per file", free: "5,000", pro: "500,000", team: "500,000" },
  { name: "Remove duplicates", free: true, pro: true, team: true },
  { name: "Remove empty rows/columns", free: true, pro: true, team: true },
  { name: "Trim whitespace", free: true, pro: true, team: true },
  { name: "Normalize headers", free: true, pro: true, team: true },
  { name: "Normalize dates", free: false, pro: true, team: true },
  { name: "Normalize numbers", free: false, pro: true, team: true },
  { name: "Normalize emails/phones", free: false, pro: true, team: true },
  { name: "Strip HTML", free: false, pro: true, team: true },
  { name: "Validate & quarantine", free: false, pro: true, team: true },
  { name: "Excel export", free: false, pro: true, team: true },
  { name: "Change log & summary", free: false, pro: true, team: true },
  { name: "Saved presets", free: "3 (local)", pro: "Unlimited (synced)", team: "Unlimited (shared)" },
  { name: "Shared preset library", free: false, pro: false, team: true },
  { name: "Team audit log", free: false, pro: false, team: true },
  { name: "Seat management", free: false, pro: false, team: true },
  { name: "Watermark", free: "Yes", pro: "No", team: "No" },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-gray-700">{value}</span>;
  }
  return value ? (
    <Check className="w-5 h-5 text-teal-600 mx-auto" />
  ) : (
    <X className="w-5 h-5 text-gray-300 mx-auto" />
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-teal-600">
            TidySheet
          </Link>
          <Link
            href="/clean"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
          >
            Start Cleaning
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500 mt-3">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Free */}
          <div className="border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">Free</h3>
            <p className="text-sm text-gray-500 mt-1">
              Perfect for quick cleanups
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">€0</span>
              <span className="text-gray-500 ml-1">/month</span>
            </div>
            <Link
              href="/clean"
              className="mt-6 block w-full text-center px-4 py-2.5 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-medium text-sm"
            >
              Get Started
            </Link>
            <p className="text-xs text-gray-400 mt-2 text-center">
              No account required
            </p>
          </div>

          {/* Pro */}
          <div className="border-2 border-teal-600 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-teal-600 text-white text-xs font-semibold rounded-full">
              Most Popular
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
            <p className="text-sm text-gray-500 mt-1">
              Full power for professionals
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">€9</span>
              <span className="text-gray-500 ml-1">/month</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">or €79/year (save 27%)</p>
            <button className="mt-6 w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm">
              Start Free Trial
            </button>
          </div>

          {/* Team */}
          <div className="border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">Team</h3>
            <p className="text-sm text-gray-500 mt-1">
              Shared cleaning for your org
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">€19</span>
              <span className="text-gray-500 ml-1">/seat/month</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 2 seats</p>
            <button className="mt-6 w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
              Contact Us
            </button>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 pr-4 text-sm font-semibold text-gray-900">
                  Feature
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-900 text-center">
                  Free
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-teal-600 text-center">
                  Pro
                </th>
                <th className="py-3 pl-4 text-sm font-semibold text-gray-900 text-center">
                  Team
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.name} className="border-b last:border-0">
                  <td className="py-3 pr-4 text-sm text-gray-700">
                    {feature.name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <FeatureCell value={feature.free} />
                  </td>
                  <td className="py-3 px-4 text-center bg-teal-50/30">
                    <FeatureCell value={feature.pro} />
                  </td>
                  <td className="py-3 pl-4 text-center">
                    <FeatureCell value={feature.team} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FaqItem
              question="Is my data really private?"
              answer="Yes. All file processing happens 100% in your browser using JavaScript. Your file contents are never uploaded to our servers. We only store account info (email, plan) and billing metadata."
            />
            <FaqItem
              question="Can I use TidySheet without creating an account?"
              answer="Yes! The Free tier works without any sign-up. Just upload your file and start cleaning. You only need an account for Pro/Team features."
            />
            <FaqItem
              question="What file formats are supported?"
              answer="CSV, TSV, and Excel (.xlsx) files up to 50MB. We auto-detect delimiters and encoding."
            />
            <FaqItem
              question="Can I cancel my subscription anytime?"
              answer="Yes. Cancel from your billing page at any time. You'll keep access until the end of your billing period."
            />
            <FaqItem
              question="What happens to my presets if I downgrade?"
              answer="Your synced presets remain in the database but become read-only. You can still export them. Local presets are never affected."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b pb-6">
      <h3 className="font-semibold text-gray-900">{question}</h3>
      <p className="text-sm text-gray-600 mt-2">{answer}</p>
    </div>
  );
}
