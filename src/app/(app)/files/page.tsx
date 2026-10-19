import Link from "next/link";

export default function FilesPage() {
  return (
    <div className="max-w-[960px] px-6 md:px-10 py-10">
      <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Files</h1>
      <div className="mt-8 rounded-lg border border-rule bg-surface p-8">
        <h2 className="font-semibold">No files are stored</h2>
        <p className="mt-2 leading-relaxed text-ink-body max-w-[560px]">
          SpreadsheetFix reads and cleans files in your browser tab. Nothing is uploaded, so we keep no copies or
          history. Download the cleaned file before you close the tab.
        </p>
        <Link
          href="/clean"
          className="mt-6 inline-flex items-center min-h-11 px-5 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors"
        >
          Open the cleaner
        </Link>
      </div>
    </div>
  );
}
