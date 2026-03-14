import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Activity,
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  Key,
  CreditCard,
  Search,
  Bell,
  Settings,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 glass-panel border-r border-primary/10 flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center neon-glow">
            <Activity className="size-5 text-background-dark font-bold" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-primary neon-text-glow">
            RowRescue
          </h2>
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20"
          >
            <LayoutDashboard className="size-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            href="/files"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors group text-left"
          >
            <FolderOpen className="size-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="font-medium text-slate-400 group-hover:text-primary transition-colors">Files</span>
          </Link>
          <Link
            href="/automations"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors group text-left"
          >
            <Sparkles className="size-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="font-medium text-slate-400 group-hover:text-primary transition-colors">Automations</span>
          </Link>
          <Link
            href="/billing"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors group"
          >
            <CreditCard className="size-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="font-medium text-slate-400 group-hover:text-primary transition-colors">Billing</span>
          </Link>
        </nav>

        <div className="mt-auto glass-panel p-4 rounded-xl border border-primary/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
              Premium Plan
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            You have saved <span className="text-primary font-bold">1.2TB</span> of bandwidth this month.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="glass-header sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
          <div className="w-96">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                className="w-full bg-primary/5 border border-primary/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-primary/10 transition-all text-sm"
                placeholder="Search rescued files..."
                type="text"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-primary transition-colors">
              <Bell className="size-5" />
              <span className="absolute -top-1 -right-1 size-2.5 bg-primary rounded-full border-2 border-background-dark"></span>
            </button>
            <button className="text-slate-400 hover:text-primary transition-colors">
              <Settings className="size-5" />
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-primary/10">
              <div className="relative">
                <div className="rounded-full border border-primary/30 p-0.5 relative z-10 bg-background-dark">
                  <UserButton afterSignOutUrl="/" />
                </div>
                <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-background-dark neon-glow z-20 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
