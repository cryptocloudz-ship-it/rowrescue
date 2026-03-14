"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight, FileSpreadsheet, Eye, Download } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { loadDemoData } = useSheetStore();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("rowrescue_welcome_seen");
    if (!hasSeenWelcome) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
      localStorage.setItem("rowrescue_welcome_seen", "true");
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel border border-primary/20 rounded-3xl shadow-[0_0_50px_rgba(13,242,223,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="p-8 pb-6 relative z-10 border-b border-primary/10 bg-slate-900/50">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl shadow-[inset_0_0_15px_rgba(13,242,223,0.1)] flex items-center justify-center mb-6 text-primary">
            <Sparkles className="w-7 h-7 drop-shadow-[0_0_8px_rgba(13,242,223,0.8)]" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome to RowRescue!
          </h2>
          <p className="text-slate-400 mt-3 text-base leading-relaxed font-medium">
            The fastest, most private way to clean messy spreadsheets. Everything runs securely in your browser.
          </p>
        </div>
        
        <div className="p-8 space-y-8 bg-slate-900/30 relative z-10">
          <div className="space-y-6">
            <div className="flex gap-4 items-start group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full glass-panel border border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-extrabold text-base shadow-[0_0_10px_rgba(13,242,223,0.1)] group-hover:scale-110 transition-transform">1</div>
              <div className="pt-1">
                <h4 className="text-base font-bold text-slate-200 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-primary" /> Upload securely</h4>
                <p className="text-sm font-medium text-slate-400 mt-1">Drag &amp; drop your CSV or Excel file. Data never leaves your device.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full glass-panel border border-amber-500/20 bg-amber-500/10 flex items-center justify-center text-amber-400 font-extrabold text-base shadow-[0_0_10px_rgba(251,191,36,0.1)] group-hover:scale-110 transition-transform">2</div>
              <div className="pt-1">
                <h4 className="text-base font-bold text-slate-200 flex items-center gap-2"><Eye className="w-4 h-4 text-amber-400" /> Review &amp; Clean</h4>
                <p className="text-sm font-medium text-slate-400 mt-1">Toggle our 17 smart rules and instantly preview all changes.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full glass-panel border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-blue-400 font-extrabold text-base shadow-[0_0_10px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform">3</div>
              <div className="pt-1">
                <h4 className="text-base font-bold text-slate-200 flex items-center gap-2"><Download className="w-4 h-4 text-blue-400" /> Export instantly</h4>
                <p className="text-sm font-medium text-slate-400 mt-1">Download your pristine data alongside a detailed change log.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setIsOpen(false);
                loadDemoData();
              }}
              className="flex-1 flex justify-center items-center gap-2 px-6 py-4 glass-panel bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-extrabold rounded-xl transition-all shadow-[inset_0_0_15px_rgba(13,242,223,0.1)] hover:shadow-[0_0_20px_rgba(13,242,223,0.2)] text-sm group"
            >
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Try Demo Data
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 flex justify-center items-center gap-2 px-6 py-4 bg-primary text-background-dark hover:brightness-110 font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(13,242,223,0.25)] hover:shadow-[0_0_30px_rgba(13,242,223,0.4)] neon-glow text-sm group"
            >
              Upload My File <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
