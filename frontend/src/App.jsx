import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import PresentationGuide from './components/PresentationGuide';

import Dashboard from './pages/Dashboard';
import Authors from './pages/Authors';
import Papers from './pages/Papers';
import Reviewers from './pages/Reviewers';
import Reviews from './pages/Reviews';
import Conferences from './pages/Conferences';
import Decisions from './pages/Decisions';
import QueryConsole from './pages/QueryConsole';

import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbStatus, setDbStatus] = useState({ status: 'connecting', database: 'conferencedb' });
  const [stats, setStats] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [recentPapers, setRecentPapers] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Presentation guide state
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [presentationStep, setPresentationStep] = useState(1);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const fetchGlobalData = async () => {
    setIsRefreshing(true);
    try {
      const [healthRes, statsRes] = await Promise.all([
        api.getHealth().catch(err => ({ status: 'offline', error: err.message })),
        api.getDashboardStats().catch(err => null)
      ]);

      setDbStatus(healthRes);

      if (statsRes && statsRes.success) {
        setStats(statsRes.stats);
        setStatusDistribution(statsRes.statusDistribution || []);
        setRecentPapers(statsRes.recentPapers || []);
        setRecentReviews(statsRes.recentReviews || []);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    // Periodic health check every 20 seconds
    const interval = setInterval(() => {
      api.getHealth()
        .then(res => setDbStatus(res))
        .catch(err => setDbStatus({ status: 'offline', error: err.message }));
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    await fetchGlobalData();
    showToast('Records refreshed from MySQL', 'success');
  };

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'authors': return 'Authors Directory';
      case 'papers': return 'Paper Submissions';
      case 'reviewers': return 'Reviewer Committee';
      case 'reviews': return 'Peer Reviews';
      case 'conferences': return 'Conferences';
      case 'decisions': return 'Paper Decisions';
      case 'query-console': return 'SQL Query Console';
      default: return 'ConferenceDB';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stats={stats} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar 
          currentSection={getSectionTitle()}
          dbStatus={dbStatus}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onTogglePresentation={() => setPresentationOpen(!presentationOpen)}
          presentationOpen={presentationOpen}
        />

        {/* Presentation Walkthrough Banner */}
        <PresentationGuide 
          isOpen={presentationOpen}
          onClose={() => setPresentationOpen(false)}
          currentStep={presentationStep}
          setCurrentStep={setPresentationStep}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard 
                stats={stats}
                statusDistribution={statusDistribution}
                recentPapers={recentPapers}
                recentReviews={recentReviews}
                setActiveTab={setActiveTab}
                onRefresh={handleRefresh}
              />
            )}

            {activeTab === 'authors' && (
              <Authors 
                showToast={showToast}
                onStatsChange={fetchGlobalData}
              />
            )}

            {activeTab === 'papers' && (
              <Papers 
                showToast={showToast}
                onStatsChange={fetchGlobalData}
              />
            )}

            {activeTab === 'reviewers' && (
              <Reviewers 
                showToast={showToast}
                onStatsChange={fetchGlobalData}
              />
            )}

            {activeTab === 'reviews' && (
              <Reviews 
                showToast={showToast}
                onStatsChange={fetchGlobalData}
              />
            )}

            {activeTab === 'conferences' && (
              <Conferences 
                showToast={showToast}
                onStatsChange={fetchGlobalData}
              />
            )}

            {activeTab === 'decisions' && (
              <Decisions 
                showToast={showToast}
                onStatsChange={fetchGlobalData}
              />
            )}

            {activeTab === 'query-console' && (
              <QueryConsole 
                showToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Toast Alert */}
      {toast && (
        <Toast 
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
