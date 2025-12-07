import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Menu, Bell } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Sidebar from '../components/dashboard/Sidebar';
import StatsOverview from '../components/dashboard/StatsOverview';
import QuickActions from '../components/dashboard/QuickActions';
import RecentTransactions from '../components/dashboard/RecentTransactions';

interface UserProfile {
  id: string;
  email: string;
  balance: number;
  trust_score: number;
  is_locked: boolean;
  account_number: string;
  twofa_enabled?: boolean;
}

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Core States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [userRes, summaryRes, txRes] = await Promise.all([
        api.get('/api/auth/me'),
        api.get('/api/analytics/dashboard'),
        api.get('/api/accounts/transactions?page=1&per_page=5').catch(() => ({ data: { transactions: [] } }))
      ]);

      setUser(userRes.data);
      setDashboardSummary(summaryRes.data);
      setTransactions(txRes.data.transactions || []);
    } catch (error: any) {
      console.error('Dashboard Load Error:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleQuickAction = (action: string) => {
    toast.info(`Action ${action} clicked - Coming Soon!`);
    // Logic to open modals will go here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="pulse-ring w-24 h-24 mb-8"></div>
        <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">SecureBank AI</h2>
        <p className="text-cyan-400 font-mono">Decrypting Secure Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">

        {/* Header (Mobile Only / Responsive) */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">SecureBank</span>
          </div>
          <button className="p-2 relative text-gray-400 hover:text-white">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full z-10">

          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Welcome back, {user?.email.split('@')[0]}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Last login: {new Date().toLocaleDateString()} • {user?.account_number}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                {/* Desktop Header Actions could go here */}
              </div>
            </div>
          </div>

          {/* Core Dashboard View */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Stats Overview */}
              <StatsOverview user={user} summary={dashboardSummary} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Actions & Charts) */}
                <div className="lg:col-span-2 space-y-8">
                  <QuickActions onAction={handleQuickAction} />

                  {/* Future Chart or Analytics Component */}
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 h-64 flex items-center justify-center text-gray-500">
                    Analytics Chart Placeholder
                  </div>
                </div>

                {/* Right Column (Recent Transactions) */}
                <div className="lg:col-span-1">
                  <RecentTransactions
                    transactions={transactions}
                    onViewAll={() => setActiveTab('transactions')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
              <p className="text-xl">Component for {activeTab} coming soon...</p>
            </div>
          )}

        </main>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};