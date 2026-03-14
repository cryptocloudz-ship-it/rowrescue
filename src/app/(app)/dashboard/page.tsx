"use client";

import {
  UploadCloud,
  Plus,
  TrendingUp,
  ShieldCheck,
  HardDrive,
  FileText,
  Download,
  Hourglass,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <section>
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 mb-2">
            Welcome back, Alex
          </h1>
          <p className="text-slate-400">
            Your privacy-first CSV cleaning workspace is ready for action.
          </p>
        </div>

        <Link href="/clean" className="block relative overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-emerald-500/5 to-primary/5 group cursor-pointer hover:border-primary/60 transition-all">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="size-10 text-primary neon-text-glow" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-100 mb-2">Upload CSV to Rescue</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              Drag and drop your files here or click to browse. Supports .csv, .xlsx, and .json up to 500MB.
            </p>
            
            <button className="bg-primary text-background-dark font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all neon-glow flex items-center gap-2">
              <Plus className="size-5 font-bold" />
              Select Files
            </button>
          </div>
        </Link>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-primary/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-medium">Rows Rescued</p>
            <TrendingUp className="text-primary bg-primary/10 p-1.5 rounded-lg size-7" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-100">124,502</p>
            <p className="text-emerald-400 text-xs font-bold">+12.4%</p>
          </div>
          <div className="h-8 w-full mt-2 flex items-end gap-1">
            <div className="bg-primary/20 hover:bg-primary w-full h-1/2 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-2/3 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-1/3 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-3/4 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-1/2 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-5/6 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-full rounded-sm transition-all"></div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-primary/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-medium">Data Quality Score</p>
            <ShieldCheck className="text-primary bg-primary/10 p-1.5 rounded-lg size-7" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-100">98.2%</p>
            <p className="text-emerald-400 text-xs font-bold">+0.4%</p>
          </div>
          <div className="h-8 w-full mt-2 flex items-end gap-1">
            <div className="bg-primary/20 hover:bg-primary w-full h-5/6 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-4/6 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-5/6 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-full rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-5/6 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-full rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-full rounded-sm transition-all"></div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-primary/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-medium">Storage Saved</p>
            <HardDrive className="text-primary bg-primary/10 p-1.5 rounded-lg size-7" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-100">4.2GB</p>
            <p className="text-rose-400 text-xs font-bold">-5%</p>
          </div>
          <div className="h-8 w-full mt-2 flex items-end gap-1">
            <div className="bg-primary/20 hover:bg-primary w-full h-1/2 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-1/3 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-1/4 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-1/2 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-2/3 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-1/2 rounded-sm transition-all"></div>
            <div className="bg-primary/20 hover:bg-primary w-full h-1/3 rounded-sm transition-all"></div>
          </div>
        </div>
      </div>

      {/* Recent Rescues Table */}
      <section className="glass-panel rounded-xl border border-primary/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-primary/10 flex justify-between items-center bg-primary/5">
          <h2 className="text-lg font-bold text-slate-100">Recent Rescues</h2>
          <button className="text-primary text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500 font-bold border-b border-primary/10">
              <tr>
                <th className="px-6 py-4">Filename</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Rows Saved</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              <tr className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <span className="font-medium text-slate-200">sales_data_q3.csv</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Cleaned
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-slate-300">45,210</td>
                <td className="px-6 py-4 text-slate-400 text-sm">2 mins ago</td>
                <td className="px-6 py-4 text-right">
                  <button className="size-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                    <Download className="size-5" />
                  </button>
                </td>
              </tr>
              
              <tr className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <span className="font-medium text-slate-200">raw_leads_2024.xlsx</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="size-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/30">
                      Processing
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-300">12,800</td>
                <td className="px-6 py-4 text-slate-400 text-sm">15 mins ago</td>
                <td className="px-6 py-4 text-right">
                  <button className="size-8 rounded-lg inline-flex items-center justify-center text-slate-600 cursor-not-allowed">
                    <Hourglass className="size-5 text-amber-500/50" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <span className="font-medium text-slate-200">user_feedback_v2.csv</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Cleaned
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-slate-300">102,450</td>
                <td className="px-6 py-4 text-slate-400 text-sm">2 hours ago</td>
                <td className="px-6 py-4 text-right">
                  <button className="size-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                    <Download className="size-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
