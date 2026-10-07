import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Trash2, 
  X, 
  Calendar,
  Building,
  Users,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import DeleteModal from '../components/DeleteModal';
import DetailsModal from '../components/DetailsModal';

export default function Papers({ showToast, onStatsChange }) {
  const [papers, setPapers] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedPaper, setSelectedPaper] = useState(null);
  const [detailedPaper, setDetailedPaper] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    Paper_ID: '',
    Title: '',
    Abstract: '',
    Submission_Date: new Date().toISOString().split('T')[0],
    Status: 'Under Review',
    Conference_ID: '',
    Author_IDs: []
  });

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await api.getPapers({ status: statusFilter });
      if (res.success) {
        setPapers(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch papers from MySQL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [confRes, authRes] = await Promise.all([
        api.getConferences(),
        api.getAuthors()
      ]);
      if (confRes.success) setConferences(confRes.data);
      if (authRes.success) setAuthors(authRes.data);
    } catch (err) {
      console.error('Error fetching dropdown options:', err);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [statusFilter]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleOpenAdd = () => {
    fetchDropdownData();
    setFormData({
      Paper_ID: '',
      Title: '',
      Abstract: '',
      Submission_Date: new Date().toISOString().split('T')[0],
      Status: 'Under Review',
      Conference_ID: conferences.length > 0 ? conferences[0].Conference_ID : '',
      Author_IDs: authors.length > 0 ? [authors[0].Author_ID] : []
    });
    setIsAddOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Title) {
      showToast('Title is required', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createPaper(formData);
      if (res.success) {
        showToast('Paper inserted successfully into MySQL', 'success');
        setIsAddOpen(false);
        await fetchPapers();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Failed to insert paper', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (paper) => {
    try {
      const res = await api.getPaperById(paper.Paper_ID);
      if (res.success) {
        setDetailedPaper(res.data);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePrompt = (paper) => {
    setSelectedPaper(paper);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPaper) return;
    setActionLoading(true);
    try {
      const res = await api.deletePaper(selectedPaper.Paper_ID);
      if (res.success) {
        showToast('Paper deleted successfully', 'success');
        setIsDeleteOpen(false);
        setSelectedPaper(null);
        await fetchPapers();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Cannot delete paper due to relational constraints', 'error');
    } finally {
      setActionLoading(false);
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

  const filteredPapers = papers.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.Title.toLowerCase().includes(q) ||
      (p.Authors && p.Authors.toLowerCase().includes(q)) ||
      (p.Conference_Name && p.Conference_Name.toLowerCase().includes(q)) ||
      String(p.Paper_ID).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Papers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Table: <span className="font-mono text-slate-700 font-semibold">paper</span> • Joined with <span className="font-mono text-slate-700">paper_author, author, conference</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Revise">Revise</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, author, conference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
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

          {/* Refresh */}
          <button
            onClick={fetchPapers}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
            title="Refresh from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Add Paper */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Paper</span>
          </button>
        </div>
      </div>

      {/* Papers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-mono">Paper ID</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Author(s)</th>
                <th className="py-3.5 px-4">Conference</th>
                <th className="py-3.5 px-4">Submission Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Loading papers from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPapers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No papers found.</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust status filter or add a paper record</p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Paper</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPapers.map((paper) => (
                  <tr key={paper.Paper_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-900">
                      #{paper.Paper_ID}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 max-w-xs">{paper.Title}</div>
                      {paper.Abstract && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">{paper.Abstract}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{paper.Authors || <span className="text-slate-400 italic">No Author</span>}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{paper.Conference_Name || 'General'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {paper.Submission_Date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(paper.Status)}`}>
                        {paper.Status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(paper)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Full Paper Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(paper)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Paper"
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

        {/* Table Footer */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredPapers.length} of {papers.length} papers</span>
          <span className="font-mono text-[11px] text-slate-400">SELECT * FROM paper JOIN conference ...</span>
        </div>
      </div>

      {/* ADD PAPER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Paper</h3>
                  <p className="text-xs text-slate-500">INSERT INTO paper &amp; paper_author</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Paper Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Database Systems in Modern Clouds"
                  value={formData.Title}
                  onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Abstract */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Abstract
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of research methodology and experimental findings..."
                  value={formData.Abstract}
                  onChange={(e) => setFormData({ ...formData, Abstract: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Conference Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Conference (Foreign Key: Conference_ID)
                </label>
                <select
                  value={formData.Conference_ID}
                  onChange={(e) => setFormData({ ...formData, Conference_ID: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select Conference</option>
                  {conferences.map((c) => (
                    <option key={c.Conference_ID} value={c.Conference_ID}>
                      ID {c.Conference_ID}: {c.Conference_Name} ({c.Location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Primary Author (Junction Table: paper_author)
                </label>
                <select
                  value={formData.Author_IDs[0] || ''}
                  onChange={(e) => setFormData({ ...formData, Author_IDs: [e.target.value] })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select Author</option>
                  {authors.map((a) => (
                    <option key={a.Author_ID} value={a.Author_ID}>
                      ID {a.Author_ID}: {a.Name} ({a.Affiliation || a.Email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Initial Status
                  </label>
                  <select
                    value={formData.Status}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Revise">Revise</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Submission Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    value={formData.Submission_Date}
                    onChange={(e) => setFormData({ ...formData, Submission_Date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Buttons */}
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
                  {actionLoading ? 'Inserting...' : 'Insert Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Paper"
        itemName={selectedPaper ? `${selectedPaper.Title} (ID: ${selectedPaper.Paper_ID})` : ''}
        loading={actionLoading}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedPaper(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Record Details Modal */}
      <DetailsModal
        isOpen={isDetailsOpen}
        title="Paper Record Details"
        data={detailedPaper}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailedPaper(null);
        }}
      />
    </div>
  );
}
