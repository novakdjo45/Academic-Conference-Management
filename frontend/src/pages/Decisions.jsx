import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  Search, 
  RefreshCw, 
  Trash2, 
  X, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import DeleteModal from '../components/DeleteModal';

export default function Decisions({ showToast, onStatsChange }) {
  const [decisions, setDecisions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    Decision_ID: '',
    Paper_ID: '',
    Outcome: 'Accept',
    Decision_Date: new Date().toISOString().split('T')[0],
    Remarks: ''
  });

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const res = await api.getDecisions();
      if (res.success) {
        setDecisions(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch decisions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPapers = async () => {
    try {
      const res = await api.getPapers();
      if (res.success) setPapers(res.data);
    } catch (err) {
      console.error('Failed to fetch papers for decisions:', err);
    }
  };

  useEffect(() => {
    fetchDecisions();
    fetchPapers();
  }, []);

  const handleOpenAdd = () => {
    fetchPapers();
    setFormData({
      Decision_ID: '',
      Paper_ID: papers.length > 0 ? papers[0].Paper_ID : '',
      Outcome: 'Accept',
      Decision_Date: new Date().toISOString().split('T')[0],
      Remarks: ''
    });
    setIsAddOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Paper_ID || !formData.Outcome) {
      showToast('Paper and Outcome are required', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createDecision(formData);
      if (res.success) {
        showToast('Official decision recorded in MySQL & Paper status updated', 'success');
        setIsAddOpen(false);
        await fetchDecisions();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Failed to record decision', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePrompt = (dec) => {
    setSelectedDecision(dec);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDecision) return;
    setActionLoading(true);
    try {
      const res = await api.deleteDecision(selectedDecision.Decision_ID);
      if (res.success) {
        showToast('Decision removed successfully', 'success');
        setIsDeleteOpen(false);
        setSelectedDecision(null);
        await fetchDecisions();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete decision', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getOutcomeBadge = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'accept':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'revise':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reject':
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredDecisions = decisions.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      (d.Paper_Title && d.Paper_Title.toLowerCase().includes(q)) ||
      (d.Outcome && d.Outcome.toLowerCase().includes(q)) ||
      (d.Remarks && d.Remarks.toLowerCase().includes(q)) ||
      String(d.Decision_ID).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            Paper Decisions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Table: <span className="font-mono text-slate-700 font-semibold">decision</span> • 1:1 UNIQUE constraint on <span className="font-mono text-slate-700">Paper_ID</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search decisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={fetchDecisions}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
            title="Refresh from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Decision</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-mono">Decision ID</th>
                <th className="py-3.5 px-4">Paper Title</th>
                <th className="py-3.5 px-4 text-center">Outcome</th>
                <th className="py-3.5 px-4">Decision Date</th>
                <th className="py-3.5 px-4">Remarks</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Loading decisions from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No decisions recorded yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Record an official Accept / Revise / Reject decision for any submitted paper</p>
                  </td>
                </tr>
              ) : (
                filteredDecisions.map((dec) => (
                  <tr key={dec.Decision_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-900">
                      #{dec.Decision_ID}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      {dec.Paper_Title || `Paper #${dec.Paper_ID}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getOutcomeBadge(dec.Outcome)}`}>
                        {dec.Outcome}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {dec.Decision_Date}
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic max-w-sm truncate">
                      "{dec.Remarks || 'No remarks recorded'}"
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePrompt(dec)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Decision"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Paper Decision</h3>
                  <p className="text-xs text-slate-500">INSERT INTO decision &amp; UPDATE paper</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Select Paper (Foreign Key: Paper_ID) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.Paper_ID}
                  onChange={(e) => setFormData({ ...formData, Paper_ID: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select Paper</option>
                  {papers.map((p) => (
                    <option key={p.Paper_ID} value={p.Paper_ID}>
                      ID {p.Paper_ID}: {p.Title} (Current: {p.Status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Decision Outcome <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.Outcome}
                  onChange={(e) => setFormData({ ...formData, Outcome: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Accept">Accept (Approved)</option>
                  <option value="Revise">Revise (Revision Required)</option>
                  <option value="Reject">Reject (Not Accepted)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Remarks / Evaluation Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Paper meets conference requirements and demonstrates high empirical validity."
                  value={formData.Remarks}
                  onChange={(e) => setFormData({ ...formData, Remarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Decision Date
                </label>
                <input
                  type="date"
                  value={formData.Decision_Date}
                  onChange={(e) => setFormData({ ...formData, Decision_Date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Record Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Decision"
        itemName={selectedDecision ? `Decision #${selectedDecision.Decision_ID} for "${selectedDecision.Paper_Title}"` : ''}
        loading={actionLoading}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedDecision(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
