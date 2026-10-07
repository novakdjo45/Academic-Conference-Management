import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Trash2, 
  X, 
  MapPin, 
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import DeleteModal from '../components/DeleteModal';
import DetailsModal from '../components/DetailsModal';

export default function Conferences({ showToast, onStatsChange }) {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedConference, setSelectedConference] = useState(null);
  const [detailedConference, setDetailedConference] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    Conference_ID: '',
    Conference_Name: '',
    Start_Date: '',
    End_Date: '',
    Location: ''
  });

  const fetchConferences = async () => {
    setLoading(true);
    try {
      const res = await api.getConferences();
      if (res.success) {
        setConferences(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch conferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      Conference_ID: '',
      Conference_Name: '',
      Start_Date: '',
      End_Date: '',
      Location: ''
    });
    setIsAddOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Conference_Name) {
      showToast('Conference Name is required', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createConference(formData);
      if (res.success) {
        showToast('Conference created successfully in MySQL', 'success');
        setIsAddOpen(false);
        await fetchConferences();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create conference', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (conf) => {
    try {
      const res = await api.getConferenceById(conf.Conference_ID);
      if (res.success) {
        setDetailedConference(res.data);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePrompt = (conf) => {
    setSelectedConference(conf);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConference) return;
    setActionLoading(true);
    try {
      const res = await api.deleteConference(selectedConference.Conference_ID);
      if (res.success) {
        showToast('Conference deleted successfully', 'success');
        setIsDeleteOpen(false);
        setSelectedConference(null);
        await fetchConferences();
        if (onStatsChange) onStatsChange();
      }
    } catch (err) {
      showToast(err.message || 'Cannot delete conference due to linked paper records', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredConferences = conferences.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.Conference_Name.toLowerCase().includes(q) ||
      (c.Location && c.Location.toLowerCase().includes(q)) ||
      String(c.Conference_ID).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Conferences
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Table: <span className="font-mono text-slate-700 font-semibold">conference</span> • Primary Key: <span className="font-mono text-slate-700">Conference_ID</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conferences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-48 sm:w-64"
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
            onClick={fetchConferences}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
            title="Refresh from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Conference</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-mono">Conf ID</th>
                <th className="py-3.5 px-4">Conference Title</th>
                <th className="py-3.5 px-4">Schedule Dates</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Submissions</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                      <span>Loading conferences from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredConferences.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No conferences found.</p>
                  </td>
                </tr>
              ) : (
                filteredConferences.map((conf) => (
                  <tr key={conf.Conference_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-900">
                      #{conf.Conference_ID}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {conf.Conference_Name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {conf.Start_Date} <span className="text-slate-400">to</span> {conf.End_Date}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{conf.Location || 'TBA'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                        {conf.Total_Papers} {conf.Total_Papers === 1 ? 'paper' : 'papers'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(conf)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Conference Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(conf)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Conference"
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
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Conference</h3>
                  <p className="text-xs text-slate-500">INSERT INTO conference</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Conference Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. International Conference on Machine Learning 2026"
                  value={formData.Conference_Name}
                  onChange={(e) => setFormData({ ...formData, Conference_Name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.Start_Date}
                    onChange={(e) => setFormData({ ...formData, Start_Date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.End_Date}
                    onChange={(e) => setFormData({ ...formData, End_Date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Location / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad / Virtual"
                  value={formData.Location}
                  onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Conference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Conference"
        itemName={selectedConference ? `${selectedConference.Conference_Name} (ID: ${selectedConference.Conference_ID})` : ''}
        loading={actionLoading}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedConference(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Details Modal */}
      <DetailsModal
        isOpen={isDetailsOpen}
        title="Conference Details"
        data={detailedConference}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailedConference(null);
        }}
      />
    </div>
  );
}
