import React from 'react';
import { 
  Users, 
  FileText, 
  UserCheck, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Star, 
  ArrowRight,
  TrendingUp,
  Activity,
  PlusCircle,
  Database
} from 'lucide-react';

export default function Dashboard({ stats, statusDistribution, recentPapers, recentReviews, setActiveTab, onRefresh }) {
  const statCards = [
    { label: 'Total Authors', value: stats?.totalAuthors ?? 0, icon: Users, color: 'blue', tab: 'authors' },
    { label: 'Total Papers', value: stats?.totalPapers ?? 0, icon: FileText, color: 'indigo', tab: 'papers' },
    { label: 'Total Reviewers', value: stats?.totalReviewers ?? 0, icon: UserCheck, color: 'emerald', tab: 'reviewers' },
    { label: 'Total Reviews', value: stats?.totalReviews ?? 0, icon: MessageSquare, color: 'amber', tab: 'reviews' },
    { label: 'Conferences', value: stats?.totalConferences ?? 0, icon: Calendar, color: 'purple', tab: 'conferences' },
    { label: 'Official Decisions', value: stats?.totalDecisions ?? 0, icon: CheckCircle2, color: 'rose', tab: 'decisions' },
  ];

  const getColorClasses = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-300';
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-100 hover:border-purple-300';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-100 hover:border-rose-300';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'under review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'revise':
      case 'revision':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-400/20">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            Live MySQL Database: conferencedb
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Conference Management Dashboard</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Real-time administrative overview of papers, peer reviews, committee workloads, and author submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('authors')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Authors</span>
          </button>
          <button
            onClick={() => setActiveTab('query-console')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
          >
            <span>Query Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time MySQL Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => setActiveTab(card.tab)}
              className={`p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group ${getColorClasses(card.color)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800">
                  {card.label}
                </span>
                <div className="p-2 rounded-lg bg-white shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left">
                {card.value}
              </div>
              <div className="mt-1 flex items-center text-[10px] text-slate-400 font-medium">
                <span>View records</span>
                <ArrowRight className="w-2.5 h-2.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Status Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Paper Status Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">FROM paper</span>
          </div>

          <div className="mt-4 space-y-3">
            {statusDistribution && statusDistribution.length > 0 ? (
              statusDistribution.map((item) => {
                const total = stats?.totalPapers || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.Status} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-2 py-0.5 rounded-md border font-semibold ${getStatusBadge(item.Status)}`}>
                        {item.Status}
                      </span>
                      <span className="font-bold text-slate-700">
                        {item.count} papers <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No paper status data</p>
            )}
          </div>
        </div>

        {/* Review Score Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Peer Review Rating Metrics
            </h3>
            <span className="text-xs text-slate-400 font-mono">FROM review</span>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-extrabold text-slate-900">{stats?.avgScore || '0.0'}</span>
              <span className="text-sm font-semibold text-slate-400">/ 10</span>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-slate-500">
              <div>Min: <span className="font-bold text-slate-800">{stats?.minScore ?? '-'}</span></div>
              <div className="w-px h-4 bg-slate-300" />
              <div>Max: <span className="font-bold text-slate-800">{stats?.maxScore ?? '-'}</span></div>
              <div className="w-px h-4 bg-slate-300" />
              <div>Total: <span className="font-bold text-slate-800">{stats?.totalReviews ?? 0}</span></div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('reviews')}
            className="w-full mt-4 py-2 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center"
          >
            View all peer reviews &rarr;
          </button>
        </div>

        {/* Relational Schema Highlights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              DBMS Architecture
            </h3>
            <span className="text-xs text-slate-400 font-mono">3NF Verified</span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
              <span className="text-slate-600 font-medium">Junction Entity</span>
              <span className="font-mono font-semibold text-blue-600">PAPER_AUTHOR (M:N)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
              <span className="text-slate-600 font-medium">Decision Integrity</span>
              <span className="font-mono font-semibold text-indigo-600">DECISION.Paper_ID (1:1 UNIQUE)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
              <span className="text-slate-600 font-medium">Referential Constraints</span>
              <span className="font-mono font-semibold text-emerald-600">ON DELETE RESTRICT</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('query-console')}
            className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
          >
            Launch Query Console &rarr;
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Papers & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Papers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Recent Papers Submitted</h3>
            <button 
              onClick={() => setActiveTab('papers')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View all &rarr;
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {recentPapers && recentPapers.length > 0 ? (
              recentPapers.map((p) => (
                <div key={p.Paper_ID} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Authors: <span className="text-slate-700 font-medium">{p.Authors || 'Unassigned'}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {p.Conference_Name} • {p.Submission_Date}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(p.Status)}`}>
                    {p.Status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No papers found</p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Recent Peer Reviews</h3>
            <button 
              onClick={() => setActiveTab('reviews')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View all &rarr;
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {recentReviews && recentReviews.length > 0 ? (
              recentReviews.map((r) => (
                <div key={r.Review_ID} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{r.Paper_Title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{r.Comments}"</p>
                    <p className="text-[10px] text-slate-400">
                      By {r.Reviewer_Name} on {r.Review_Date}
                    </p>
                  </div>
                  <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{r.Score}/10</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No reviews found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
