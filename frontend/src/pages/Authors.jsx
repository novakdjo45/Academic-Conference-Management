import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Trash2, 
  X, 
  Mail, 
  Building2,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import DeleteModal from '../components/DeleteModal';
import DetailsModal from '../components/DetailsModal';

export default function Authors({ showToast, onStatsChange }) {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [detailedAuthor, setDetailedAuthor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    Author_ID: '',
    Name: '',
    Email: '',
    Affiliation: ''
  });

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.getAuthors();
      if (res.success) {
        setAuthors(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch authors from MySQL', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      Author_ID: '',
      Name: '',
      Email: '',
      Affiliation: ''
    });
    setIsAddOpen(true);
  };

  const handlePrefillPresentation = () => {
    setFormData({
      Author_ID: '',
      Name: 'Test Author',
      Email: `test_${Date.now().toString().slice(-4)}@example.com`,
      Affiliation: 'Woxsen University'
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Name || !formData.Email) {
      showToast('Name and Email are required', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createAuthor(formData);
      if (res.success) {
        showToast('Author inserted successfully', 'success');
        setIsAddOpen(false);
        await fetchAuthors();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Failed to insert author', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (author) => {
    try {
      const res = await api.getAuthorById(author.Author_ID);
      if (res.success) {
        setDetailedAuthor(res.data);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePrompt = (author) => {
    setSelectedAuthor(author);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAuthor) return;
    setActionLoading(true);
    try {
      const res = await api.deleteAuthor(selectedAuthor.Author_ID);
      if (res.success) {
        showToast('Record deleted successfully', 'success');
        setIsDeleteOpen(false);
        setSelectedAuthor(null);
        await fetchAuthors();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Cannot delete this record because it is referenced by another record.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAuthors = authors.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.Name.toLowerCase().includes(q) ||
      a.Email.toLowerCase().includes(q) ||
      (a.Affiliation && a.Affiliation.toLowerCase().includes(q)) ||
      String(a.Author_ID).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Authors
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Table: <span className="font-mono text-slate-700 font-semibold">author</span> • Primary Key: <span className="font-mono text-slate-700">Author_ID</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 sm:w-64"
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

          {/* Refresh Button */}
          <button
            onClick={fetchAuthors}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
            title="Refresh from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Add Author Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Author</span>
          </button>
        </div>
      </div>

      {/* Authors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-mono">Author ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Affiliation</th>
                <th className="py-3.5 px-4 text-center">Papers</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading authors from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAuthors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No records found.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm ? 'Try adjusting your search filter' : 'No records exist in the AUTHOR table'}
                    </p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Author</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAuthors.map((author) => (
                  <tr key={author.Author_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      #{author.Author_ID}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {author.Name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{author.Email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{author.Affiliation || <span className="text-slate-400 italic">None</span>}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {author.Paper_Count} {author.Paper_Count === 1 ? 'paper' : 'papers'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(author)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Author Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(author)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Author"
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
          <span>Showing {filteredAuthors.length} of {authors.length} authors</span>
          <span className="font-mono text-[11px] text-slate-400">SELECT * FROM author</span>
        </div>
      </div>

      {/* ADD AUTHOR MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Author</h3>
                  <p className="text-xs text-slate-500">Executes INSERT INTO author</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* Optional ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Author ID <span className="text-slate-400 font-normal lowercase">(optional - auto-calculated if blank)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 104"
                  value={formData.Author_ID}
                  onChange={(e) => setFormData({ ...formData, Author_ID: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Author Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">* (UNIQUE)</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. author@example.com"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Affiliation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Affiliation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Woxsen University"
                  value={formData.Affiliation}
                  onChange={(e) => setFormData({ ...formData, Affiliation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Demo Helper Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePrefillPresentation}
                  className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  ⚡ Auto-fill Demo Data ("Test Author", "Woxsen University")
                </button>
              </div>

              {/* Modal Buttons */}
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
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Inserting into MySQL...' : 'Insert Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Author"
        itemName={selectedAuthor ? `${selectedAuthor.Name} (ID: ${selectedAuthor.Author_ID})` : ''}
        loading={actionLoading}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedAuthor(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Record Details Modal */}
      <DetailsModal
        isOpen={isDetailsOpen}
        title="Author Record Details"
        data={detailedAuthor}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailedAuthor(null);
        }}
      />
    </div>
  );
}
