import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Trash2, 
  X, 
  Star,
  FileText,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import DeleteModal from '../components/DeleteModal';
import DetailsModal from '../components/DetailsModal';

export default function Reviews({ showToast, onStatsChange }) {
  const [reviews, setReviews] = useState([]);
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedReview, setSelectedReview] = useState(null);
  const [detailedReview, setDetailedReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    Review_ID: '',
    Paper_ID: '',
    Reviewer_ID: '',
    Score: 8,
    Comments: '',
    Review_Date: new Date().toISOString().split('T')[0]
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getReviews();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        api.getPapers(),
        api.getReviewers()
      ]);
      if (pRes.success) setPapers(pRes.data);
      if (rRes.success) setReviewers(rRes.data);
    } catch (err) {
      console.error('Dropdown fetch error:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchDropdownData();
  }, []);

  const handleOpenAdd = () => {
    fetchDropdownData();
    setFormData({
      Review_ID: '',
      Paper_ID: papers.length > 0 ? papers[0].Paper_ID : '',
      Reviewer_ID: reviewers.length > 0 ? reviewers[0].Reviewer_ID : '',
      Score: 8,
      Comments: '',
      Review_Date: new Date().toISOString().split('T')[0]
    });
    setIsAddOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Paper_ID || !formData.Reviewer_ID) {
      showToast('Paper and Reviewer are required', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createReview(formData);
      if (res.success) {
        showToast('Review submitted successfully into MySQL', 'success');
        setIsAddOpen(false);
        await fetchReviews();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (review) => {
    try {
      const res = await api.getReviewById(review.Review_ID);
      if (res.success) {
        setDetailedReview(res.data);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePrompt = (review) => {
    setSelectedReview(review);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReview) return;
    setActionLoading(true);
    try {
      const res = await api.deleteReview(selectedReview.Review_ID);
      if (res.success) {
        showToast('Review deleted successfully from MySQL', 'success');
        setIsDeleteOpen(false);
        setSelectedReview(null);
        await fetchReviews();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete review', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      (r.Paper_Title && r.Paper_Title.toLowerCase().includes(q)) ||
      (r.Reviewer_Name && r.Reviewer_Name.toLowerCase().includes(q)) ||
      (r.Comments && r.Comments.toLowerCase().includes(q)) ||
      String(r.Review_ID).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            Reviews
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Table: <span className="font-mono text-slate-700 font-semibold">review</span> • Joined with <span className="font-mono text-slate-700">paper, reviewer</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-48 sm:w-64"
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
            onClick={fetchReviews}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
            title="Refresh from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Review</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-mono">Review ID</th>
                <th className="py-3.5 px-4">Paper Title</th>
                <th className="py-3.5 px-4">Reviewer</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4">Comments</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                      <span>Loading reviews from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No reviews found.</p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.Review_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-900">
                      #{review.Review_ID}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      {review.Paper_Title || `Paper #${review.Paper_ID}`}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{review.Reviewer_Name || `Reviewer #${review.Reviewer_ID}`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        review.Score >= 8 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : review.Score >= 6 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        <Star className="w-3 h-3 fill-current" />
                        <span>{review.Score} / 10</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic max-w-sm truncate">
                      "{review.Comments || 'No comments'}"
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {review.Review_Date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(review)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="View Review"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(review)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Review"
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

      {/* Add Review Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Peer Review</h3>
                  <p className="text-xs text-slate-500">INSERT INTO review</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Paper (Foreign Key: Paper_ID) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.Paper_ID}
                  onChange={(e) => setFormData({ ...formData, Paper_ID: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">Select Paper to Review</option>
                  {papers.map((p) => (
                    <option key={p.Paper_ID} value={p.Paper_ID}>
                      ID {p.Paper_ID}: {p.Title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Reviewer (Foreign Key: Reviewer_ID) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.Reviewer_ID}
                  onChange={(e) => setFormData({ ...formData, Reviewer_ID: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">Select Reviewer</option>
                  {reviewers.map((r) => (
                    <option key={r.Reviewer_ID} value={r.Reviewer_ID}>
                      ID {r.Reviewer_ID}: {r.Name} ({r.Expertise || 'Reviewer'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Review Score (1 - 10): <span className="text-amber-600 font-bold">{formData.Score}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.Score}
                  onChange={(e) => setFormData({ ...formData, Score: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>1 (Poor)</span>
                  <span>5 (Average)</span>
                  <span>10 (Outstanding)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Reviewer Comments
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide technical feedback, experimental soundness..."
                  value={formData.Comments}
                  onChange={(e) => setFormData({ ...formData, Comments: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Review Date
                </label>
                <input
                  type="date"
                  value={formData.Review_Date}
                  onChange={(e) => setFormData({ ...formData, Review_Date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Review"
        itemName={selectedReview ? `Review #${selectedReview.Review_ID} for "${selectedReview.Paper_Title}"` : ''}
        loading={actionLoading}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedReview(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Details Modal */}
      <DetailsModal
        isOpen={isDetailsOpen}
        title="Review Details"
        data={detailedReview}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailedReview(null);
        }}
      />
    </div>
  );
}
