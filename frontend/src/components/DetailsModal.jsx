import React from 'react';
import { Eye, X } from 'lucide-react';

export default function DetailsModal({ isOpen, title, data, onClose }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{title || 'Record Details'}</h3>
              <p className="text-xs text-slate-500">Live data directly from MySQL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => {
              // skip nested arrays/objects for top level grid
              if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return null;

              return (
                <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="block text-sm font-medium text-slate-800 break-words">
                    {value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-slate-400 italic">None</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {/* If there are linked arrays like papers or reviews */}
          {data.papers && data.papers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Associated Papers ({data.papers.length})
              </h4>
              <div className="space-y-2">
                {data.papers.map((p, idx) => (
                  <div key={idx} className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs">
                    <p className="font-semibold text-blue-950">ID {p.Paper_ID}: {p.Title}</p>
                    <p className="text-slate-500 mt-0.5">Status: <span className="font-medium text-blue-800">{p.Status}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.reviews && data.reviews.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Reviews ({data.reviews.length})
              </h4>
              <div className="space-y-2">
                {data.reviews.map((r, idx) => (
                  <div key={idx} className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-indigo-950">Score: {r.Score}/10</span>
                      <span className="text-slate-400">{r.Review_Date}</span>
                    </div>
                    <p className="text-slate-600 mt-1 italic">"{r.Comments}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
