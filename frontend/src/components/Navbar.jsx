import React from 'react';
import { Database, RefreshCw, Presentation, CheckCircle, XCircle } from 'lucide-react';

export default function Navbar({ 
  currentSection, 
  dbStatus, 
  onRefresh, 
  isRefreshing, 
  onTogglePresentation, 
  presentationOpen 
}) {
  const isConnected = dbStatus?.status === 'connected';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-3.5 flex items-center justify-between">
        {/* Left: Current Section Breadcrumb */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">ConferenceDB</span>
              <span className="text-slate-300">/</span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">{currentSection}</h1>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Academic Conference Paper Submission &amp; Review System
            </p>
          </div>
        </div>

        {/* Right: Controls & Database Status */}
        <div className="flex items-center gap-3">
          {/* Real-time DB Connection Status Badge */}
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm'
                : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
            }`}
            title={isConnected ? `Connected to ${dbStatus.database} on ${dbStatus.host}:${dbStatus.port}` : 'MySQL Offline'}
          >
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="font-mono">
              {isConnected ? `● Connected to MySQL (${dbStatus.database || 'conferencedb'})` : '● Database Offline'}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            title="Refresh MySQL records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Presentation Mode Guide Toggle */}
          <button
            onClick={onTogglePresentation}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all border ${
              presentationOpen
                ? 'bg-blue-700 text-white border-blue-800 ring-2 ring-blue-300'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-700 hover:from-blue-700 hover:to-indigo-800'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Viva Demo Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
}
