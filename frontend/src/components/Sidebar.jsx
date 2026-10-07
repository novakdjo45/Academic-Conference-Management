import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCheck, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Terminal,
  Database,
  Layers
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'authors', label: 'Authors', icon: Users, badgeKey: 'totalAuthors' },
  { id: 'papers', label: 'Papers', icon: FileText, badgeKey: 'totalPapers' },
  { id: 'reviewers', label: 'Reviewers', icon: UserCheck, badgeKey: 'totalReviewers' },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare, badgeKey: 'totalReviews' },
  { id: 'conferences', label: 'Conferences', icon: Calendar, badgeKey: 'totalConferences' },
  { id: 'decisions', label: 'Decisions', icon: CheckCircle2, badgeKey: 'totalDecisions' },
  { id: 'query-console', label: 'Query Console', icon: Terminal }
];

export default function Sidebar({ activeTab, setActiveTab, stats }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight leading-tight">ConferenceDB</h2>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400">DBMS Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeCount = item.badgeKey && stats ? stats[item.badgeKey] : null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {badgeCount !== null && badgeCount !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                  isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span>Engine:</span>
          <span className="font-mono text-emerald-400">MySQL 9.7</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span>Database:</span>
          <span className="font-mono text-blue-400">conferencedb</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span>Port:</span>
          <span className="font-mono text-slate-300">3306</span>
        </div>
      </div>
    </aside>
  );
}
