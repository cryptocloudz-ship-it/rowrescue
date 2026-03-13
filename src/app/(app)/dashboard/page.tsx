"use client";

import { FileSpreadsheet, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-teal-600">
            TidySheet
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/clean"
              className="text-gray-600 hover:text-gray-900"
            >
              Clean
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900"
            >
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Clean and manage your spreadsheets
            </p>
          </div>
          <Link
            href="/clean"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New file
          </Link>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <FileSpreadsheet className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            No files cleaned yet
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            Upload a CSV or Excel file to get started. Your data is processed
            entirely in your browser — nothing is stored on our servers.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Link
              href="/clean"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Upload a file
            </Link>
            <Link
              href="/clean"
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Try demo data
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
