"use client";

import { Sparkles, Plus, Share2, HelpCircle, FileJson, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock automations data
const MOCK_AUTOMATIONS = [
  { id: 1, name: "Monthly Sales Report Cleanup", triggers: ["Deduplicate", "Normalize Dates", "Remove Empty"], type: "local" },
  { id: 2, name: "GDPR Email Scrub (Marketing)", triggers: ["Validate Emails", "Lower Case", "Strip HTML"], type: "team" },
  { id: 3, name: "Inventory Sync (Shopify)", triggers: ["Number Format", "Remove Currency", "Rename Columns"], type: "team" },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);

  return (
    <div className="p-8 pb-20 fade-in slide-in-from-bottom-5 duration-700">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            Automations & Presets
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium max-w-2xl">
            Save unique combinations of cleaning rules. Share your ultimate recipes with your team.
          </p>
        </div>
        
        <button 
          className="px-6 py-3 bg-amber-500 text-slate-900 font-extrabold rounded-xl hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Create Automation
        </button>
      </header>

      {/* Info Banner */}
      <div className="mb-10 p-5 glass-panel bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4 shadow-[inset_0_0_15px_rgba(245,158,11,0.05)]">
        <HelpCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-slate-200">How Automations Work</h3>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Build your perfect cleaning pipeline once and save it as an Automation. The next time you upload a messy file, simply run your saved Automation to trigger all 17 rules precisely as you configured them—saving hours of repetitive work.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.map((automation) => (
          <div key={automation.id} className="glass-panel group border border-amber-500/10 hover:border-amber-500/30 rounded-3xl p-6 transition-all shadow-[0_5px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 relative overflow-hidden">
             
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-900/80 border border-amber-500/20 rounded-xl relative z-10">
                <FileJson className="w-6 h-6 text-amber-500/80" />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                automation.type === 'team' 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {automation.type === 'team' ? 'Team Shared' : 'Personal (Local)'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-100 mb-2 relative z-10">{automation.name}</h3>
            
            <div className="flex flex-wrap gap-2 mb-8 relative z-10">
              {automation.triggers.map((trigger, i) => (
                <span key={i} className="text-xs font-medium bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-700/50">
                  {trigger}
                </span>
              ))}
              <span className="text-xs font-medium text-slate-500 px-1 py-1">+ configured targets</span>
            </div>

            <div className="border-t border-slate-800/50 pt-5 flex items-center gap-3 relative z-10">
              <Link 
                href="/clean"
                className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl transition-colors border border-amber-500/20"
              >
                <Play className="w-4 h-4" fill="currentColor" /> Run Now
              </Link>
              {automation.type === 'local' && (
                <button 
                  title="Share with Team"
                  className="p-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all focus:outline-none"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        
        {/* Empty placeholder card for creating new */}
        <button className="glass-panel border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-3xl p-6 transition-all flex flex-col items-center justify-center min-h-[250px] group focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-background-dark">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
            <Plus className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <p className="text-lg font-bold text-slate-300 group-hover:text-amber-400 transition-colors">Create New Automation</p>
          <p className="text-sm font-medium text-slate-500 mt-2 text-center max-w-[200px]">Save your current rules on the cleaning page.</p>
        </button>
      </div>
    </div>
  );
}
