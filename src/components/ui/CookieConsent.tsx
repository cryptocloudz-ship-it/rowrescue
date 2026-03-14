"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("rowrescue_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("rowrescue_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("rowrescue_cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none sm:p-6 lg:p-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="max-w-4xl mx-auto glass-panel border border-primary/20 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 pointer-events-auto shadow-[0_0_50px_rgba(13,242,223,0.1)] relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex-shrink-0 mt-1 sm:mt-0 p-3 bg-primary/10 border border-primary/20 rounded-xl relative z-10 text-primary self-start sm:self-center">
          <Cookie className="w-6 h-6 drop-shadow-[0_0_8px_rgba(13,242,223,0.8)]" />
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <h3 className="text-lg font-bold text-slate-100 mb-1">We respect your privacy</h3>
          <p className="text-sm font-medium text-slate-400 leading-relaxed pr-8 sm:pr-0">
            RowRescue strictly processes your data client-side in your browser. We only use essential tracking cookies to ensure the website functions correctly and optional anonymised analytics to help us improve. Read our <Link href="/legal/cookie-policy" className="text-primary hover:underline underline-offset-2">Cookie Policy</Link> for details.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto relative z-10 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-white transition-colors focus:ring-2 focus:ring-slate-600 focus:outline-none"
          >
            Decline All
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-background-dark rounded-xl font-bold text-sm hover:brightness-110 shadow-[0_0_15px_rgba(13,242,223,0.2)] hover:shadow-[0_0_25px_rgba(13,242,223,0.4)] transition-all neon-glow focus:ring-2 focus:ring-primary focus:outline-none"
          >
            Accept All
          </button>
        </div>

        <button
          onClick={handleDecline}
          aria-label="Close cookie banner"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors z-20 sm:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
