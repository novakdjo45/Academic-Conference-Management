import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  BookOpen, 
  Copy, 
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function QueryConsole({ showToast }) {
  const [presets, setPresets] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Fetch presets on load
  useEffect(() => {
    api.getQueryPresets()
      .then((res) => {
        if (res.success && res.queries) {
          setPresets(res.queries);
          // Default to master demo query
          if (res.queries.length > 0) {
            setSqlQuery(res.queries[0].sql);
          }
        }
      })
      .catch((err) => console.error('Preset error:', err));
  }, []);

  const handleRunQuery = async (queryToRun) => {
    const q = queryToRun || sqlQuery;
    if (!q.trim()) {
      showToast('Please enter an SQL query first', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.executeQuery(q);
      if (res.success) {
        setResult(res);
        showToast(`Query executed successfully: ${res.rowCount} row(s) returned`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Error executing query against MySQL');
      setResult(null);
      showToast(err.message || 'Query failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setSqlQuery(preset.sql);
    handleRunQuery(preset.sql);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    }
  };

  const exportToCSV = () => {
    if (!result || !result.data || result.data.length === 0) return;
    const headers = result.columns.join(',');
    const rows = result.data.map(row => 
      result.columns.map(col => {
        const val = row[col] === null ? '' : String(row[col]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `query_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported query results to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            SQL Query Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute real SQL SELECT and multi-table JOIN statements directly against MySQL <span className="font-mono text-blue-600">conferencedb</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">Ctrl + Enter</kbd> to run
          </span>
        </div>
      </div>

      {/* Preset Queries Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recommended Presentation &amp; Report Queries
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold border transition-all text-left ${
                preset.id === 'demo-master'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* SQL Editor Area */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        {/* Editor Bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">conferencedb.sql</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSqlQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => handleRunQuery()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Query</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="p-4">
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={8}
            spellCheck={false}
            placeholder="SELECT p.Title, a.Name FROM paper p JOIN paper_author pa ON p.Paper_ID = pa.Paper_ID JOIN author a ON pa.Author_ID = a.Author_ID;"
            className="w-full bg-transparent text-slate-100 font-mono text-xs sm:text-sm focus:outline-none resize-y leading-relaxed"
          />
        </div>
      </div>

      {/* Query Execution Status Banner */}
      {result && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-emerald-950">Query executed successfully on MySQL</p>
              <p className="text-emerald-700 text-[11px]">
                Returned <span className="font-mono font-bold">{result.rowCount}</span> rows in <span className="font-mono font-bold">{result.executionTimeMs}ms</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-lg font-medium hover:bg-emerald-50 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">SQL Execution Error</p>
            <p className="font-mono mt-1 text-[11px] leading-relaxed text-rose-800">{error}</p>
          </div>
        </div>
      )}

      {/* Query Results Table */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Result Set ({result.rowCount} rows)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Columns: {result.columns?.join(', ')}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4 font-mono text-slate-400 w-12 text-center">#</th>
                  {result.columns.map((col) => (
                    <th key={col} className="py-3 px-4 font-mono">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {result.data.length === 0 ? (
                  <tr>
                    <td colSpan={result.columns.length + 1} className="py-8 text-center text-slate-400">
                      Empty result set (0 rows returned)
                    </td>
                  </tr>
                ) : (
                  result.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 text-center">
                        {idx + 1}
                      </td>
                      {result.columns.map((col) => {
                        const val = row[col];
                        return (
                          <td key={col} className="py-2.5 px-4 break-words max-w-md">
                            {val === null || val === undefined ? (
                              <span className="text-slate-300 italic font-mono text-[11px]">NULL</span>
                            ) : typeof val === 'number' ? (
                              <span className="font-mono font-semibold text-blue-900">{val}</span>
                            ) : (
                              <span>{String(val)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
