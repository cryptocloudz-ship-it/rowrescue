"use client";

import { FolderOpen, History, FileText, Download, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock history data since we process client-side
const MOCK_HISTORY = [
  { id: 1, name: "q1_sales_raw_export.csv", date: "2 mins ago", rows: "12,450", rules: 4, size: "1.2 MB" },
  { id: 2, name: "customer_leads_messy.xlsx", date: "2 hours ago", rows: "3,102", rules: 7, size: "450 KB" },
  { id: 3, name: "inventory_log_2026.csv", date: "Yesterday", rows: "84,000", rules: 2, size: "8.4 MB" },
  { id: 4, name: "newsletter_subs_final.csv", date: "Mar 12, 2026", rows: "850", rules: 5, size: "120 KB" },
];

export default function FilesPage() {
  const [history, setHistory] = useState(MOCK_HISTORY);

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="p-8 pb-20 fade-in slide-in-from-bottom-5 duration-700">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(13,242,223,0.5)]" />
            File History
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium max-w-2xl">
            A metadata log of your recent cleaning sessions. Real file data is never retained.
          </p>
        </div>
        
        <Link 
          href="/clean"
          className="px-6 py-3 bg-primary text-background-dark font-extrabold rounded-xl hover:brightness-110 shadow-[0_0_20px_rgba(13,242,223,0.25)] hover:shadow-[0_0_30px_rgba(13,242,223,0.4)] transition-all neon-glow whitespace-nowrap"
        >
          Clean New File
        </Link>
      </header>

      {/* Privacy Guarantee Banner */}
      <div className="mb-10 p-5 glass-panel bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4 shadow-[inset_0_0_15px_rgba(13,242,223,0.05)]">
        <ShieldAlert className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-slate-200">Zero Data Retention Guarantee</h3>
          <p className="text-sm font-medium text-slate-400 mt-1">
            RowRescue is a strictly local tool. The history below only shows metadata (names, timestamps, row counts) stored locally in your browser to help you keep track of your work. The actual contents of your spreadsheets are permanently discarded the moment you leave the app.
          </p>
        </div>
      </div>

      <div className="glass-panel border border-primary/10 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="p-6 border-b border-primary/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-200">Recent Sessions</h2>
          </div>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-sm font-bold text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Log
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
              <History className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">No recent history</h3>
            <p className="text-slate-500 mt-2 mb-8 max-w-sm">Files you clean will appear here as a metadata log so you can track your productivity.</p>
            <Link 
              href="/clean"
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:text-white hover:bg-slate-700 rounded-xl transition-all"
            >
              Start Your First Clean
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Filename</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Date Cleaned</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Size</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Rows</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Rules Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                        <span className="font-bold text-slate-300">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-400">{item.date}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-500">{item.size}</td>
                    <td className="py-4 px-6 text-sm font-mono text-slate-300 text-right">{item.rows}</td>
                    <td className="py-4 px-6 text-sm font-bold text-primary text-right">{item.rules} rules</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
