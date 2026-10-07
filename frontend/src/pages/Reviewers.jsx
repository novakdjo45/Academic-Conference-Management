import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Trash2, 
  X, 
  Mail, 
  Award, 
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import DeleteModal from '../components/DeleteModal';
import DetailsModal from '../components/DetailsModal';

export default function Reviewers({ showToast, onStatsChange }) {
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [detailedReviewer, setDetailedReviewer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    Reviewer_ID: '',
    Name: '',
    Email: '',
    Expertise: '',
    Current_Load: 0
  });

  const fetchReviewers = async () => {
    setLoading(true);
    try {
      const res = await api.getReviewers();
      if (res.success) {
        setReviewers(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch reviewers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewers();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      Reviewer_ID: '',
      Name: '',
      Email: '',
      Expertise: '',
      Current_Load: 0
    });
    setIsAddOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Name || !formData.Email) {
      showToast('Name and Email are required', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createReviewer(formData);
      if (res.success) {
        showToast('Reviewer inserted successfully into MySQL', 'success');
        setIsAddOpen(false);
        await fetchReviewers();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Failed to insert reviewer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (reviewer) => {
    try {
      const res = await api.getReviewerById(reviewer.Reviewer_ID);
      if (res.success) {
        setDetailedReviewer(res.data);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePrompt = (reviewer) => {
    setSelectedReviewer(reviewer);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReviewer) return;
    setActionLoading(true);
    try {
      const res = await api.deleteReviewer(selectedReviewer.Reviewer_ID);
      if (res.success) {
        showToast('Reviewer deleted successfully', 'success');
        setIsDeleteOpen(false);
        setSelectedReviewer(null);
        await fetchReviewers();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Cannot delete reviewer due to foreign-key references', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReviewers = reviewers.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.Name.toLowerCase().includes(q) ||
      r.Email.toLowerCase().includes(q) ||
      (r.Expertise && r.Expertise.toLowerCase().includes(q)) ||
      String(r.Reviewer_ID).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Reviewers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Table: <span className="font-mono text-slate-700 font-semibold">reviewer</span> • Primary Key: <span className="font-mono text-slate-700">Reviewer_ID</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviewers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
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
            onClick={fetchReviewers}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
            title="Refresh from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Reviewer</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-mono">Reviewer ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Expertise</th>
                <th className="py-3.5 px-4 text-center">Current Load</th>
                <th className="py-3.5 px-4 text-center">Reviews Done</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                      <span>Loading reviewers from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReviewers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No reviewers found.</p>
                  </td>
                </tr>
              ) : (
                filteredReviewers.map((reviewer) => (
                  <tr key={reviewer.Reviewer_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                      #{reviewer.Reviewer_ID}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {reviewer.Name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{reviewer.Email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-slate-400" />
                        <span>{reviewer.Expertise || <span className="text-slate-400 italic">None</span>}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                        {reviewer.Current_Load}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {reviewer.Completed_Reviews} completed
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(reviewer)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Reviewer Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(reviewer)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Reviewer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Reviewer</h3>
                  <p className="text-xs text-slate-500">INSERT INTO reviewer</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Reviewer ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 203"
                  value={formData.Reviewer_ID}
                  onChange={(e) => setFormData({ ...formData, Reviewer_ID: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Gupta"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Email <span className="text-rose-500">* (UNIQUE)</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@reviewer.com"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Expertise
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Networks, Cryptography"
                  value={formData.Expertise}
                  onChange={(e) => setFormData({ ...formData, Expertise: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Current Assigned Load
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.Current_Load}
                  onChange={(e) => setFormData({ ...formData, Current_Load: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Inserting...' : 'Insert Reviewer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Reviewer"
        itemName={selectedReviewer ? `${selectedReviewer.Name} (ID: ${selectedReviewer.Reviewer_ID})` : ''}
        loading={actionLoading}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedReviewer(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Details Modal */}
      <DetailsModal
        isOpen={isDetailsOpen}
        title="Reviewer Details"
        data={detailedReviewer}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailedReviewer(null);
        }}
      />
    </div>
  );
}
