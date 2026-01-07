import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button, Card, Input } from '../components/ui';
import { formatIndianCurrency } from '../src/utils/formatters';
import {
  Shield, Users, Activity, LogOut, CheckCircle,
  XCircle, Lock, Mail, RefreshCw,
  Eye, Search, ChevronLeft, ChevronRight, Network, ArrowUpRight,
  AlertTriangle, BarChart3, PieChart, TrendingUp, MapPin, Smartphone, Wifi, FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // --- 1. STATE MANAGEMENT ---

  // Dashboard Core Data
  const [stats, setStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [fraudRings, setFraudRings] = useState<any[]>([]);

  // Analytics Data
  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
  const [alertsTimeline, setAlertsTimeline] = useState<any[]>([]);
  const [txVolume, setTxVolume] = useState<any[]>([]);
  const [fraudCategories, setFraudCategories] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);

  // Intelligence Data
  const [ipIntel, setIpIntel] = useState<any[]>([]);
  const [deviceIntel, setDeviceIntel] = useState<any[]>([]);
  const [highRiskUsers, setHighRiskUsers] = useState<any[]>([]);

  // Alerts & Logs Data
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [suspiciousTx, setSuspiciousTx] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  const [alertsPage, setAlertsPage] = useState(1);
  const [alertsTotalPages, setAlertsTotalPages] = useState(1);
  const [suspiciousPage, setSuspiciousPage] = useState(1);
  const [suspiciousTotalPages, setSuspiciousTotalPages] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsTotalPages, setTicketsTotalPages] = useState(1);
  const [ipPage, setIpPage] = useState(1);
  const [devicePage, setDevicePage] = useState(1);
  const [highRiskPage, setHighRiskPage] = useState(1);
  const [fraudRingsPage, setFraudRingsPage] = useState(1);

  // Tab Management
  const [activeTab, setActiveTab] = useState('overview');

  // Transactions Tab State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txSearch, setTxSearch] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  // Users Tab State
  const [users, setUsers] = useState<any[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Modals & Forms
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ email: '', title: '', message: '' });
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({ field: 'amount', operator: '>', value: '', action: 'BLOCK' });
  const [showTxDetailModal, setShowTxDetailModal] = useState(false);
  const [txDetail, setTxDetail] = useState<any>(null);

  // Confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    type: 'danger' | 'success' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // --- 2. DATA FETCHING ---

  const showToastNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fetch Overview Data (Stats, Recent Tx, Requests)
  const fetchOverviewData = useCallback(async () => {
    try {
      const [statsRes, rulesRes, unlocksRes, recentTxRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/rules'),
        api.get('/api/admin/unlock-requests'),
        api.get('/api/admin/transactions?per_page=5&page=1') // Limit to 5 for Overview
      ]);

      setStats(statsRes.data);
      setRules(rulesRes.data || []);
      setUnlockRequests(unlocksRes.data || []);
      setRecentTransactions(recentTxRes.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch overview data');
    }
  }, []);

  // Fetch Full Transactions (Paginated & Search)
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await api.get(`/api/admin/transactions?page=${txPage}&per_page=10&search=${txSearch}`);
      setTransactions(res.data.transactions || []);
      setTxTotalPages(res.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch transactions');
    } finally {
      setTxLoading(false);
    }
  }, [txPage, txSearch]);

  // Fetch Full Users (Paginated & Search)
  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const res = await api.get(`/api/admin/users?page=${userPage}&per_page=10&search=${userSearch}`);
      setUsers(res.data.users || []);
      setUserTotalPages(res.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setUserLoading(false);
    }
  }, [userPage, userSearch]);

  const fetchFraudRings = async () => {
    try {
      const res = await api.get('/api/admin/system/fraud-rings');
      setFraudRings(res.data.fraud_rings || []);
      showToastNotification(`Detected ${res.data.total_rings || 0} fraud rings`, 'success');
    } catch (error) {
      showToastNotification('Failed to scan fraud rings', 'error');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [riskRes, alertsRes, volumeRes, categoriesRes, geoRes] = await Promise.all([
        api.get('/api/admin/analytics/risk-distribution'),
        api.get('/api/admin/analytics/alerts-timeline'),
        api.get('/api/admin/analytics/transaction-volume'),
        api.get('/api/admin/analytics/fraud-categories'),
        api.get('/api/admin/analytics/geo-distribution')
      ]);
      setRiskDistribution(riskRes.data || []);
      setAlertsTimeline(alertsRes.data || []);
      setTxVolume(volumeRes.data || []);
      setFraudCategories(categoriesRes.data || []);
      setGeoData(geoRes.data || []);
    } catch (error) {
      console.error('Failed to fetch analytics');
    }
  };

  const fetchIntelligence = async () => {
    try {
      const [ipRes, deviceRes, highRiskRes] = await Promise.all([
        api.get('/api/admin/intelligence/ip-analysis'),
        api.get('/api/admin/intelligence/device-analysis'),
        api.get('/api/admin/intelligence/high-risk-users')
      ]);
      setIpIntel(ipRes.data || []);
      setDeviceIntel(deviceRes.data || []);
      setHighRiskUsers(highRiskRes.data || []);
    } catch (error) {
      console.error('Failed to fetch intelligence');
    }
  };

  const fetchAlertsAndLogs = async () => {
    try {
      const [alertsRes, suspiciousRes, logsRes, ticketsRes] = await Promise.all([
        api.get(`/api/admin/fraud-alerts?page=${alertsPage}&per_page=10`),
        api.get(`/api/admin/suspicious-transactions?page=${suspiciousPage}&per_page=10`),
        api.get('/api/admin/audit-logs'),
        api.get(`/api/admin/support-tickets/all?page=${ticketsPage}&per_page=10`)
      ]);
      setFraudAlerts(alertsRes.data.alerts || []);
      setAlertsTotalPages(alertsRes.data.pages || 1);
      setSuspiciousTx(suspiciousRes.data.transactions || []);
      setSuspiciousTotalPages(suspiciousRes.data.pages || 1);
      setAuditLogs(logsRes.data || []);
      setSupportTickets(ticketsRes.data.tickets || []);
      setTicketsTotalPages(ticketsRes.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch alerts and logs');
    }
  };

  // --- 3. EFFECTS ---

  // Initial Load & Polling
  useEffect(() => {
    fetchOverviewData();

    const interval = setInterval(() => {
      // Poll based on active tab - OPTIMIZED: Reduced from 10s to 30s
      if (activeTab === 'overview') fetchOverviewData();
      if (activeTab === 'transactions') fetchTransactions();
      if (activeTab === 'users') fetchUsers();
    }, 30000); // Changed from 10000 to 30000 (30 seconds)

    return () => clearInterval(interval);
  }, [activeTab, fetchOverviewData, fetchTransactions, fetchUsers]);

  // Load data when switching to analytics/intelligence/alerts tabs
  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'intelligence') fetchIntelligence();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'alerts-logs') fetchAlertsAndLogs();
  }, [activeTab, alertsPage, suspiciousPage, ticketsPage]);

  // OPTIMIZED: Debounced search - Wait 500ms after user stops typing before fetching
  useEffect(() => {
    if (activeTab !== 'transactions') return;

    const debounceTimer = setTimeout(() => {
      fetchTransactions();
    }, 500); // Debounce delay

    return () => clearTimeout(debounceTimer);
  }, [txPage, txSearch, activeTab]);

  useEffect(() => {
    if (activeTab !== 'users') return;

    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce delay

    return () => clearTimeout(debounceTimer);
  }, [userPage, userSearch, activeTab]);


  // --- 4. ACTION HANDLERS ---
  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.error('Logout API call failed:', e);
    }

    // Show thank you message
    showToastNotification('Thank you! Visit again soon 👋', 'success');

    // Wait a moment for user to see the message
    setTimeout(() => {
      // Clear auth state using AuthContext
      logout();
      // Redirect to login page
      navigate('/login');
    }, 1000);
  };

  const handleTransactionAction = async (txId: string, action: string) => {
    setConfirmAction({
      title: `${action} Transaction`,
      message: `Are you sure you want to ${action.toLowerCase()} transaction?`,
      type: action === 'BLOCK' ? 'danger' : 'warning',
      onConfirm: async () => {
        try {
          await api.post('/api/admin/transaction-action', { txid: txId, action });
          showToastNotification(`Transaction ${action.toLowerCase()}ed`, 'success');
          // Refresh current view
          if (activeTab === 'overview') fetchOverviewData();
          if (activeTab === 'transactions') fetchTransactions();
        } catch (error: any) {
          showToastNotification(error.response?.data?.message || 'Action failed', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleUserAction = async (email: string, action: string) => {
    setConfirmAction({
      title: `${action} User`,
      message: `Confirm ${action.toLowerCase()} for user ${email}?`,
      type: action === 'LOCK' ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          await api.post('/api/admin/user-action', { email, action });
          showToastNotification(`User ${action.toLowerCase()}ed`, 'success');
          if (activeTab === 'users') fetchUsers();
        } catch (error: any) {
          showToastNotification(error.response?.data?.message || 'Failed', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleCreateRule = async () => {
    try {
      await api.post('/api/admin/rules', newRule);
      showToastNotification('Rule created', 'success');
      setShowRuleModal(false);
      setNewRule({ field: 'amount', operator: '>', value: '', action: 'BLOCK' });
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to create rule', 'error');
    }
  };

  const handleUnlockRequestAction = async (requestId: number, decision: string) => {
    setConfirmAction({
      title: `${decision} Unlock Request`,
      message: `Are you sure you want to ${decision.toLowerCase()} this unlock request?`,
      type: decision === 'APPROVE' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          await api.post('/api/admin/unlock-requests/resolve', { request_id: requestId, decision });
          showToastNotification(`Request ${decision.toLowerCase()}d`, 'success');
          fetchOverviewData();
        } catch (error: any) {
          showToastNotification(error.response?.data?.message || 'Failed to process request', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewTransactionDetails = async (txId: string) => {
    try {
      const res = await api.get(`/api/admin/transactions/${txId}`);
      setTxDetail(res.data);
      setShowTxDetailModal(true);
    } catch (error) {
      showToastNotification('Failed to load details', 'error');
    }
  };

  // --- 5. RENDER HELPERS ---

  const PaginationControls = ({ page, totalPages, setPage, loading }: any) => (
    <div className="flex items-center justify-between mt-4 border-t border-gray-700 pt-4">
      <span className="text-gray-400 text-sm">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || loading}
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500/30">
      {/* TOAST & MODALS */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right duration-300">
          <div className={`${toastType === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
            } backdrop-blur-xl border px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3`}>
            {toastType === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <p className="font-semibold text-sm">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            <h3 className={`text-xl font-bold mb-2 ${confirmAction.type === 'danger' ? 'text-red-500' : 'text-white'}`}>
              {confirmAction.title}
            </h3>
            <p className="text-gray-400 mb-6">{confirmAction.message}</p>
            <div className="flex gap-3">
              <Button onClick={() => setShowConfirmModal(false)} variant="ghost" className="flex-1 hover:bg-gray-800">Cancel</Button>
              <Button
                onClick={() => { confirmAction.onConfirm(); setShowConfirmModal(false); }}
                className={`flex-1 ${confirmAction.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">FraudGuard <span className="text-gray-500 font-normal">Admin</span></h1>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* STATS HEADER - ENHANCED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Main Hero Stat */}
          <div className="md:col-span-2 bg-gradient-to-br from-red-600/20 via-purple-900/20 to-black border border-red-500/30 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/20 transition-all"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-red-400 text-sm font-semibold tracking-wide uppercase">System Health</p>
                  <h2 className="text-3xl font-bold text-white mt-1">
                    {(100 - (stats?.fraud_rate || 0)).toFixed(1)}%
                    <span className="text-lg text-gray-400 font-normal ml-2">Success Rate</span>
                  </h2>
                </div>
                <Activity className="w-8 h-8 text-red-500" />
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-purple-500 h-1.5 rounded-full"
                  style={{ width: `${100 - (stats?.fraud_rate || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* stat Cards Grid */}
          <StatCard
            key="stat-users"
            label="Total Users"
            value={stats?.total_users || 0}
            icon={<Users className="w-5 h-5 text-blue-400" />}
            color="blue"
          />
          <StatCard
            key="stat-blocked"
            label="Blocked Today"
            value={stats?.blocked_transactions || 0}
            icon={<Shield className="w-5 h-5 text-yellow-500" />}
            color="yellow"
          />
          <StatCard
            key="stat-alerts"
            label="Fraud Alerts"
            value={`${stats?.total_fraud_alerts || 0} (${stats?.fraud_alerts_today || 0} today)`}
            icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
            color="red"
          />
          <StatCard
            key="stat-rings"
            label="Fraud Rings"
            value={stats?.fraud_rings_detected || 0}
            icon={<Network className="w-5 h-5 text-purple-400" />}
            color="purple"
          />
          <StatCard
            key="stat-locked"
            label="Locked Accounts"
            value={stats?.locked_accounts || 0}
            icon={<Lock className="w-5 h-5 text-orange-400" />}
            color="orange"
          />
          <StatCard
            key="stat-high-risk"
            label="High-Risk Users"
            value={stats?.high_risk_users || 0}
            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
            color="red"
          />
        </div>

        {/* TABS */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1 bg-white/5 rounded-xl w-full">
          {['overview', 'analytics', 'intelligence', 'alerts-logs', 'transactions', 'users', 'rules', 'requests', 'fraud-rings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* --- OVERVIEW CONTENT --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Live Transactions</h3>
                <Button onClick={() => setActiveTab('transactions')} variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400 uppercase">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400 uppercase">User</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                      <th className="text-right py-3 px-6 text-xs font-semibold text-gray-400 uppercase">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentTransactions.map((tx, idx) => (
                      <tr key={tx.id || idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tx.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            tx.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'SUCCESS' ? 'bg-green-400' : tx.status === 'FAILED' ? 'bg-red-400' : 'bg-yellow-400'
                              }`}></div>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-300">{tx.user}</td>
                        <td className="py-4 px-6 text-sm font-mono text-cyan-400">{formatIndianCurrency(tx.amount)}</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`font-mono font-bold ${(tx.risk_score) > 0.7 ? 'text-red-400' : 'text-green-400'}`}>
                            {tx.risk_score.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentTransactions.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-500">No recent transactions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Quick Actions / Requests */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#111] border-white/5 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Pending Unlock Requests</h3>
                {unlockRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending requests.</p>
                ) : (
                  <div className="space-y-3">
                    {unlockRequests.slice(0, 3).map(req => (
                      <div key={req.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-white">{req.user_email}</p>
                          <p className="text-xs text-gray-400 mt-1">"{req.reason}"</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleUnlockRequestAction(req.id, 'APPROVE')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Rules Summary */}
              <Card className="bg-[#111] border-white/5 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Active Rules</h3>
                  <Button onClick={() => setActiveTab('rules')} variant="ghost" size="sm" className="text-gray-400">Manage</Button>
                </div>
                <div className="space-y-3">
                  {rules.slice(0, 4).map(rule => (
                    <div key={rule.id} className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-transparent hover:border-purple-500/30 transition-colors">
                      <span className="text-gray-300 font-mono">
                        {rule.field} {rule.operator} {rule.value}
                      </span>
                      <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        {rule.action}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- TRANSACTIONS TAB --- */}
        {activeTab === 'transactions' && (
          <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center">
              <h3 className="text-xl font-bold text-white">Transaction Logs</h3>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search ID or Email..."
                    className="pl-9 bg-black border-white/10"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                  />
                </div>
                <Button onClick={fetchTransactions} variant="ghost" className="border border-white/10">
                  <RefreshCw className={`w-4 h-4 ${txLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Timestamp</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">User</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Amount</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Status</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Score</th>
                    <th className="text-right py-3 px-6 text-xs text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx, idx) => (
                    <tr key={tx.id || idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-6 text-xs text-gray-500 font-mono">
                        {new Date(tx.date).toLocaleString()}
                      </td>
                      <td className="py-3 px-6 text-sm text-white">{tx.user}</td>
                      <td className="py-3 px-6 text-sm font-mono text-cyan-400">{formatIndianCurrency(tx.amount)}</td>
                      <td className="py-3 px-6">
                        <span className={`text-xs px-2 py-0.5 rounded ${tx.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' :
                          tx.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-sm font-bold text-gray-400">{tx.risk_score.toFixed(2)}</td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          {tx.status === 'FAILED' && (
                            <Button size="sm" onClick={() => handleTransactionAction(tx.id, 'ALLOW')} className="h-7 text-xs bg-green-600/20 text-green-400 hover:bg-green-600/40 border border-green-500/30">
                              Allow
                            </Button>
                          )}
                          {tx.status === 'SUCCESS' && (
                            <Button size="sm" onClick={() => handleTransactionAction(tx.id, 'BLOCK')} className="h-7 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30">
                              Block
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewTransactionDetails(tx.id)}
                            className="h-7 w-7 p-0 rounded-full text-gray-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && !txLoading && (
                <div className="p-12 text-center text-gray-500">No transactions found matching your criteria.</div>
              )}
            </div>

            <div className="p-4 border-t border-white/5">
              <PaginationControls
                page={txPage}
                totalPages={txTotalPages}
                setPage={setTxPage}
                loading={txLoading}
              />
            </div>
          </Card>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center">
              <h3 className="text-xl font-bold text-white">Registered Users</h3>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search email..."
                    className="pl-9 bg-black border-white/10"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Email</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Role</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Trust Score</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Balance</th>
                    <th className="text-right py-3 px-6 text-xs text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user, idx) => (
                    <tr key={user.id || idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-sm text-white font-medium flex items-center gap-2">
                        {user.is_locked && <Lock className="w-3 h-3 text-red-500" />}
                        {user.email}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-400">{user.role}</td>
                      <td className="py-4 px-6">
                        <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full ${user.trust_score > 80 ? 'bg-green-500' : user.trust_score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${user.trust_score}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">{user.trust_score}/100</span>
                      </td>
                      <td className="py-4 px-6 text-sm font-mono text-gray-300">{formatIndianCurrency(user.balance)}</td>
                      <td className="py-4 px-6 text-right">
                        {user.is_locked ? (
                          <Button size="sm" onClick={() => handleUserAction(user.email, 'UNLOCK')} className="h-8 bg-green-600 hover:bg-green-700 text-xs">Unlock Account</Button>
                        ) : (
                          <Button size="sm" onClick={() => handleUserAction(user.email, 'LOCK')} className="h-8 bg-red-600 hover:bg-red-700 text-xs">Lock Account</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5">
              <PaginationControls page={userPage} totalPages={userTotalPages} setPage={setUserPage} loading={userLoading} />
            </div>
          </Card>
        )}

        {/* --- OTHER TABS (Rules, Fraud Rings) retained but simplified wrapper --- */}
        {activeTab === 'rules' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[#111] border-white/5 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Add New Rule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Field</label>
                  <select
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    value={newRule.field}
                    onChange={e => setNewRule({ ...newRule, field: e.target.value })}
                  >
                    <option value="amount">Amount</option>
                    <option value="risk_score">Risk Score</option>
                    <option value="location">Location</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <select
                    className="w-24 bg-black border border-white/10 rounded-lg p-3 text-white"
                    value={newRule.operator}
                    onChange={e => setNewRule({ ...newRule, operator: e.target.value })}
                  >
                    <option value=">">Greater </option>
                    <option value="<">Less </option>
                    <option value="=">Equal</option>
                  </select>
                  <Input
                    className="bg-black border-white/10"
                    placeholder="Value (e.g. 50000)"
                    value={newRule.value}
                    onChange={e => setNewRule({ ...newRule, value: e.target.value })}
                  />
                </div>
                <Button onClick={() => handleCreateRule()} className="w-full bg-red-600 hover:bg-red-700">Create Rule</Button>
              </div>
            </Card>
            <Card className="bg-[#111] border-white/5 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Active Rules</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {rules.map(r => (
                  <div key={r.id} className="p-4 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center group hover:border-red-500/50 transition-colors">
                    <div className="font-mono text-sm text-gray-300">
                      {r.field} <span className="text-purple-400">{r.operator}</span> {r.value}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wider">{r.action}</span>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-400" onClick={async () => {
                        try {
                          await api.delete(`/api/admin/rules/${r.id}`);
                          fetchOverviewData();
                          showToastNotification('Rule deleted');
                        } catch (e) { showToastNotification('Failed', 'error'); }
                      }}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* --- REQUESTS TAB (New) --- */}
        {activeTab === 'requests' && (
          <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Unlock Requests</h3>
              <p className="text-gray-500 text-sm">Review users requesting account unlock.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Date</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">User</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Trust Score</th>
                    <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Reason</th>
                    <th className="text-right py-3 px-6 text-xs text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {unlockRequests.map(req => (
                    <tr key={req.request_id || req.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-500 font-mono">
                        {new Date(req.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-white font-medium">{req.user_email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${req.trust_score < 30 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {req.trust_score}/100
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-300 italic">"{req.reason}"</td>
                      <td className="py-4 px-6 text-right flex justify-end gap-2">
                        <Button size="sm" onClick={() => handleUnlockRequestAction(req.request_id || req.id, 'APPROVE')} className="bg-green-600 hover:bg-green-700 h-8 text-xs">Approve</Button>
                        <Button size="sm" onClick={() => handleUnlockRequestAction(req.request_id || req.id, 'REJECT')} variant="ghost" className="text-red-400 hover:text-red-300 h-8 text-xs">Reject</Button>
                      </td>
                    </tr>
                  ))}
                  {unlockRequests.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-gray-500">No pending unlock requests.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Existing Fraud Rings View (Simplified for V2) */}
        {activeTab === 'fraud-rings' && (
          <Card className="bg-[#111] border-white/5 p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-white"><Network className="text-red-500" /> Fraud Rings</h3>
                <p className="text-gray-500 text-sm">Cluster analysis of shared IPs</p>
              </div>
              <Button onClick={fetchFraudRings} className="bg-red-600">Scan Now</Button>
            </div>
            <div className="grid gap-4">
              {fraudRings.slice((fraudRingsPage - 1) * 5, fraudRingsPage * 5).map((ring, i) => (
                <div key={ring.ip_address || i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-mono text-cyan-400">{ring.ip_address}</p>
                      <p className="text-gray-400 text-sm">{ring.distinct_users} Linked Users</p>
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">{ring.risk_level}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ring.users.map((u: any) => (
                      <span key={u.id} className="px-2 py-1 bg-black rounded text-xs text-gray-300 border border-white/10">{u.email}</span>
                    ))}
                  </div>
                </div>
              ))}
              {fraudRings.length === 0 && <div className="text-center py-10 text-gray-500">No active fraud rings detected.</div>}
            </div>
            {fraudRings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <PaginationControls
                  page={fraudRingsPage}
                  totalPages={Math.ceil(fraudRings.length / 5)}
                  setPage={setFraudRingsPage}
                  loading={false}
                />
              </div>
            )}
          </Card>
        )}

        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Risk Distribution */}
              <Card className="bg-[#111] border-white/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Risk Score Distribution</h3>
                </div>
                <div className="space-y-3">
                  {riskDistribution.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{item.range}</span>
                        <span className="text-white font-semibold">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.range === 'Critical' ? 'bg-red-500' :
                            item.range === 'High' ? 'bg-orange-500' :
                              item.range === 'Medium' ? 'bg-yellow-500' :
                                item.range === 'Low' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                          style={{ width: `${Math.min(100, (item.count / Math.max(...riskDistribution.map(r => r.count), 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Fraud Categories Pie */}
              <Card className="bg-[#111] border-white/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Fraud Categories</h3>
                </div>
                <div className="space-y-2">
                  {fraudCategories.slice(0, 8).map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <span className="text-sm text-gray-300">{cat.category}</span>
                      <span className="text-sm font-bold text-white">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Alerts Timeline */}
            <Card className="bg-[#111] border-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Alerts Over Time (Last 30 Days)</h3>
              </div>
              <div className="h-48 flex items-end gap-1">
                {alertsTimeline.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group">
                    <div
                      className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t hover:opacity-80 transition-all"
                      style={{ height: `${Math.max(5, (day.count / Math.max(...alertsTimeline.map(d => d.count), 1)) * 100)}%` }}
                      title={`${day.date}: ${day.count} alerts`}
                    ></div>
                    {idx % 5 === 0 && (
                      <span className="text-[8px] text-gray-600 mt-1">{day.date?.slice(-5)}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Geographic Distribution - Heatmap */}
            <Card className="bg-[#111] border-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Geographic Distribution</h3>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {geoData.slice(0, 20).map((location, idx) => {
                  const maxCount = Math.max(...geoData.map((l: any) => l.count || 0));
                  const percentage = maxCount > 0 ? ((location.count || 0) / maxCount) * 100 : 0;
                  const intensity = Math.floor((percentage / 100) * 5);

                  const getHeatColor = (intensity: number) => {
                    const colors = [
                      'bg-green-900/40',
                      'bg-green-700/60',
                      'bg-green-600/80',
                      'bg-green-500',
                      'bg-green-400',
                      'bg-green-300'
                    ];
                    return colors[Math.min(intensity, 5)];
                  };

                  return (
                    <div key={`geo-${idx}`} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {location.location || 'Unknown Location'}
                        </span>
                        <span className="text-green-400 font-bold">{location.count} txns</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getHeatColor(intensity)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {geoData.length === 0 && <p className="text-gray-500 text-center py-8">No geographic data available</p>}
              </div>
            </Card>
          </div >
        )
        }

        {/* --- INTELLIGENCE TAB --- */}
        {
          activeTab === 'intelligence' && (
            <div className="space-y-6">
              {/* IP Intelligence */}
              <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">IP Intelligence</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">IP Address</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Users</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Transactions</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Avg Risk</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ipIntel.slice((ipPage - 1) * 10, ipPage * 10).map((ip, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 px-6 text-sm font-mono text-cyan-400">{ip.ip_address}</td>
                          <td className="py-3 px-6 text-sm text-white">{ip.user_count}</td>
                          <td className="py-3 px-6 text-sm text-gray-400">{ip.transaction_count}</td>
                          <td className="py-3 px-6 text-sm font-bold text-yellow-400">{ip.avg_risk_score}</td>
                          <td className="py-3 px-6">
                            <span className={`text-xs px-2 py-1 rounded ${ip.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                              ip.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>{ip.risk_level}</span>
                          </td>
                        </tr>
                      ))}
                      {ipIntel.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">No suspicious IP activity detected</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-white/5">
                  <PaginationControls
                    page={ipPage}
                    totalPages={Math.ceil(ipIntel.length / 10)}
                    setPage={setIpPage}
                    loading={false}
                  />
                </div>
              </Card>

              {/* Device Intelligence */}
              <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Device Intelligence</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Device ID</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Users</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Transactions</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {deviceIntel.slice((devicePage - 1) * 10, devicePage * 10).map((dev, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 px-6 text-sm font-mono text-gray-300">{dev.device_id}</td>
                          <td className="py-3 px-6 text-sm text-white">{dev.user_count}</td>
                          <td className="py-3 px-6 text-sm text-gray-400">{dev.transaction_count}</td>
                          <td className="py-3 px-6">
                            <span className={`text-xs px-2 py-1 rounded ${dev.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                              }`}>{dev.risk_level}</span>
                          </td>
                        </tr>
                      ))}
                      {deviceIntel.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-500">No suspicious device activity detected</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-white/5">
                  <PaginationControls
                    page={devicePage}
                    totalPages={Math.ceil(deviceIntel.length / 10)}
                    setPage={setDevicePage}
                    loading={false}
                  />
                </div>
              </Card>

              {/* High-Risk Users */}
              <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-bold text-white">High-Risk Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Email</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Trust Score</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Status</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Failed TX</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Avg Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {highRiskUsers.slice((highRiskPage - 1) * 20, highRiskPage * 20).map((user, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 px-6 text-sm text-white font-medium">{user.email}</td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-800 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${user.trust_score < 10 ? 'bg-red-500' :
                                    user.trust_score < 30 ? 'bg-orange-500' : 'bg-yellow-500'
                                    }`}
                                  style={{ width: `${user.trust_score}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-400">{user.trust_score}</span>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            {user.is_locked && <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">LOCKED</span>}
                          </td>
                          <td className="py-3 px-6 text-sm text-gray-400">{user.failed_transactions}/{user.total_transactions}</td>
                          <td className="py-3 px-6 text-sm font-bold text-yellow-400">{user.avg_risk_score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-white/5">
                  <PaginationControls
                    page={highRiskPage}
                    totalPages={Math.ceil(highRiskUsers.length / 20)}
                    setPage={setHighRiskPage}
                    loading={false}
                  />
                </div>
              </Card>
            </div>
          )
        }

        {/* --- ALERTS & LOGS TAB --- */}
        {
          activeTab === 'alerts-logs' && (
            <div className="space-y-6">
              {/* Fraud Alerts */}
              <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-bold text-white">Fraud Alerts</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Alert Level</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Description</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">User</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Amount</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {fraudAlerts.map((alert, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 px-6">
                            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">{alert.alert_level}</span>
                          </td>
                          <td className="py-3 px-6 text-sm text-gray-300">{alert.description}</td>
                          <td className="py-3 px-6 text-sm text-white">{alert.transaction?.user_email || 'Unknown'}</td>
                          <td className="py-3 px-6 text-sm text-cyan-400">{formatIndianCurrency(alert.transaction?.amount || 0)}</td>
                          <td className="py-3 px-6">
                            {alert.is_resolved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </td>
                        </tr>
                      ))}
                      {fraudAlerts.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">No fraud alerts</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-white/5">
                  <PaginationControls page={alertsPage} totalPages={alertsTotalPages} setPage={setAlertsPage} loading={false} />
                </div>
              </Card>

              {/* Suspicious Transactions */}
              <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Suspicious Transactions (Risk &gt; 0.7)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">User</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Amount</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Risk Score</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Reason</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {suspiciousTx.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 px-6 text-sm text-white">{tx.user_email}</td>
                          <td className="py-3 px-6 text-sm text-cyan-400">{formatIndianCurrency(tx.amount)}</td>
                          <td className="py-3 px-6 text-sm font-bold text-red-400">{tx.risk_score.toFixed(2)}</td>
                          <td className="py-3 px-6 text-xs text-gray-400">{tx.risk_reason?.slice(0, 50)}...</td>
                          <td className="py-3 px-6 text-xs font-mono text-gray-500">{tx.ip_address}</td>
                        </tr>
                      ))}
                      {suspiciousTx.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">No suspicious transactions</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-white/5">
                  <PaginationControls page={suspiciousPage} totalPages={suspiciousTotalPages} setPage={setSuspiciousPage} loading={false} />
                </div>
              </Card>

              {/* Audit Logs */}
              <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Audit Logs</h3>
                </div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full">
                    <thead className="bg-white/5 sticky top-0">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Action</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Details</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">IP</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {auditLogs.slice(0, 30).map((log, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 px-6 text-sm font-semibold text-purple-400">{log.action}</td>
                          <td className="py-3 px-6 text-xs text-gray-400">{log.details}</td>
                          <td className="py-3 px-6 text-xs font-mono text-gray-500">{log.ip}</td>
                          <td className="py-3 px-6 text-xs text-gray-500">{new Date(log.time).toLocaleString()}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-500">No audit logs</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Support Tickets */}
              <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Support Tickets</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">ID</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">User</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Subject</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Status</th>
                        <th className="text-left py-3 px-6 text-xs text-gray-400 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {supportTickets.map((ticket, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 px-6 text-sm text-gray-400">#{ticket.id}</td>
                          <td className="py-3 px-6 text-sm text-white">{ticket.user_email}</td>
                          <td className="py-3 px-6 text-sm text-gray-300">{ticket.subject}</td>
                          <td className="py-3 px-6">
                            <span className={`text-xs px-2 py-1 rounded ${ticket.status === 'OPEN' ? 'bg-green-500/20 text-green-400' :
                              ticket.status === 'CLOSED' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>{ticket.status}</span>
                          </td>
                          <td className="py-3 px-6 text-xs text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {supportTickets.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">No support tickets</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-white/5">
                  <PaginationControls page={ticketsPage} totalPages={ticketsTotalPages} setPage={setTicketsPage} loading={false} />
                </div>
              </Card>
            </div>
          )
        }

      </main >
    </div >
  );
};

// Helper Component for Stat Cards
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'border-blue-500/30 hover:shadow-blue-500/5',
    yellow: 'border-yellow-500/30 hover:shadow-yellow-500/5',
    red: 'border-red-500/30 hover:shadow-red-500/5',
    purple: 'border-purple-500/30 hover:shadow-purple-500/5',
    orange: 'border-orange-500/30 hover:shadow-orange-500/5',
    green: 'border-green-500/30 hover:shadow-green-500/5',
  };
  return (
    <div className={`bg-[#111] border border-white/5 rounded-2xl p-6 hover:${colors[color]} transition-all hover:shadow-lg group`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-xl font-bold text-white">
            {value}
          </h3>
        </div>
        <div className={`p-2 bg-${color}-500/10 rounded-lg group-hover:bg-${color}-500/20 transition-colors`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
