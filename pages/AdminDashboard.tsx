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
  AlertTriangle, BarChart3, PieChart, TrendingUp, MapPin, Smartphone, Wifi, FileText,
  Share2, AlertOctagon, ShieldCheck
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

  // Fraud Ring Details
  const [showRingDetailModal, setShowRingDetailModal] = useState(false);
  const [selectedRing, setSelectedRing] = useState<any>(null);

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
  // Fetch Overview Data (Stats, Recent Tx, Requests)
  const fetchOverviewData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
    const token = localStorage.getItem('token');
    if (!token) return;

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
    const token = localStorage.getItem('token');
    if (!token) return;

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
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get('/api/admin/system/fraud-rings');
      setFraudRings(res.data.fraud_rings || []);
      showToastNotification(`Detected ${res.data.total_rings || 0} fraud rings`, 'success');
    } catch (error) {
      showToastNotification('Failed to scan fraud rings', 'error');
    }
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
    const token = localStorage.getItem('token');
    if (!token) return;

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
    const token = localStorage.getItem('token');
    if (!token) return;

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
    let isMounted = true; // FIXED: Cleanup flag to prevent state updates after unmount

    const loadInitialData = async () => {
      if (!isMounted) return;

      // CRITICAL: Wait for token to be available before fetching
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⏳ Token not yet available, skipping initial data load');
        return;
      }

      console.log('✅ Token found, loading initial data...');

      try {
        await fetchOverviewData();
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load initial data:', error);
      }
    };

    // Small delay to ensure token sync completes
    const timeoutId = setTimeout(() => {
      loadInitialData();
    }, 100);

    const interval = setInterval(() => {
      // Only poll if component is still mounted
      if (!isMounted) return;
      // Poll based on active tab - OPTIMIZED: Reduced from 10s to 30s
      if (activeTab === 'overview') fetchOverviewData();
      if (activeTab === 'transactions') fetchTransactions();
      if (activeTab === 'users') fetchUsers();
    }, 30000); // Changed from 10000 to 30000 (30 seconds)

    return () => {
      isMounted = false; // Cleanup: prevent any pending state updates
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
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
    // Clear auth state using AuthContext
    logout();

    // Navigate to landing page IMMEDIATELY
    navigate('/');

    // Make logout API call in background (fire-and-forget)
    api.post('/api/auth/logout').catch(() => {
      // Silently ignore errors
    });
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
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-blue-500/30">

      {/* AURORA BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[30%] w-[700px] h-[700px] bg-blue-900/10 rounded-full blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]"></div>
      </div>
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



      {/* FRAUD RING DETAIL MODAL */}
      {
        showRingDetailModal && selectedRing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="max-w-xl w-full bg-[#111] border-red-500/30 shadow-2xl shadow-red-900/20">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Network className="w-5 h-5 text-red-500" />
                      Fraud Ring Detected
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Shared IP Cluster Analysis</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowRingDetailModal(false)}>
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-red-200 text-xs font-bold uppercase tracking-wider">Common IP Address</p>
                    <p className="text-white font-mono text-lg">{selectedRing.ip_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-200 text-xs font-bold uppercase tracking-wider">Risk Level</p>
                    <p className="text-red-400 font-bold">{selectedRing.risk_level}</p>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Linked Accounts ({selectedRing.distinct_users})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedRing.users.map((u: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{u.email}</p>
                          <p className="text-xs text-gray-500 font-mono">User ID: {u.id}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleUserAction(u.email, 'LOCK');
                          // Optional: close modal or show success
                        }}
                        className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white h-7 text-xs border border-red-500/30"
                      >
                        <Lock className="w-3 h-3 mr-1" /> Block
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowRingDetailModal(false)}>Close</Button>
                  <Button
                    onClick={() => {
                      selectedRing.users.forEach((u: any) => handleUserAction(u.email, 'LOCK'));
                      setShowRingDetailModal(false);
                      showToastNotification('Batch action initiated for all users in ring');
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Block All Accounts
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )
      }

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

        {/* UNIFIED DASHBOARD OVERVIEW CARD */}
        <div className="mb-8 bg-gradient-to-br from-red-900/40 via-[#0a0a0a] to-black border border-red-500/30 rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="p-6 relative z-10">
            {/* Top Section: System Health */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="w-full">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-red-400 text-xs font-bold tracking-widest uppercase mb-1">System Health</p>
                    <h2 className="text-4xl font-bold text-white flex items-baseline gap-2">
                      {(100 - (stats?.fraud_rate || 0)).toFixed(1)}%
                      <span className="text-sm text-gray-500 font-medium">Success Rate</span>
                    </h2>
                  </div>
                  <Activity className="w-8 h-8 text-red-500 mb-2" />
                </div>
                <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                    style={{ width: `${100 - (stats?.fraud_rate || 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

            {/* Bottom Section: Compact Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* Users */}
              <div className="flex flex-col">
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">Total Users</p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xl font-bold text-white">{stats?.total_users || 0}</span>
                </div>
              </div>

              {/* Blocked */}
              <div className="flex flex-col">
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">Blocked</p>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-500" />
                  <span className="text-xl font-bold text-white">{stats?.blocked_transactions || 0}</span>
                </div>
              </div>

              {/* Alerts */}
              <div className="flex flex-col col-span-2 md:col-span-1">
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">Fraud Alerts</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-xl font-bold text-white">
                    {stats?.total_fraud_alerts || 0} <span className="text-sm text-gray-600 font-normal">({stats?.fraud_alerts_today || 0})</span>
                  </span>
                </div>
              </div>

              {/* Rings */}
              <div className="flex flex-col">
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">Fraud Rings</p>
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-purple-400" />
                  <span className="text-xl font-bold text-white">{stats?.fraud_rings_detected || 0}</span>
                </div>
              </div>

              {/* Locked */}
              <div className="flex flex-col">
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">Locked</p>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-400" />
                  <span className="text-xl font-bold text-white">{stats?.locked_accounts || 0}</span>
                </div>
              </div>

              {/* High Risk */}
              <div className="flex flex-col">
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">High Risk</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xl font-bold text-white">{stats?.high_risk_users || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS - SCROLLABLE APP BAR (Mobile) / WRAPPED (Desktop) */}
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md -mx-6 px-6 py-2 mb-6 border-b border-white/5 md:static md:bg-transparent md:mx-0 md:p-0 md:border-none">
          <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-1 md:flex-wrap md:overflow-visible">
            {['overview', 'transactions', 'users', 'rules', 'requests', 'fraud-rings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 capitalize border ${activeTab === tab
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/20'
                  : 'bg-white/5 text-gray-400 border-transparent hover:border-white/10 hover:text-white'
                  }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
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
                      <th className="text-right py-3 px-6 text-xs font-semibold text-gray-400 uppercase">Amount</th>
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
                        <td className="py-4 px-6 text-sm font-mono text-cyan-400 text-right">{formatIndianCurrency(tx.amount)}</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`font-mono font-bold ${(tx.risk_score) >= 0.7 ? 'text-red-500' : (tx.risk_score) >= 0.4 ? 'text-orange-400' : 'text-green-400'}`}>
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
                    <th className="text-right py-3 px-6 text-xs text-gray-400 uppercase">Balance</th>
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
                      <td className="py-4 px-6 text-sm font-mono text-gray-300 text-right">{formatIndianCurrency(user.balance)}</td>
                      <td className="py-4 px-6 text-right">
                        {user.is_locked ? (
                          <Button size="sm" onClick={() => handleUserAction(user.email, 'UNLOCK')} className="h-8 bg-green-600 hover:bg-green-700 text-xs shadow-lg shadow-green-900/20">Unlock</Button>
                        ) : (
                          <Button size="sm" onClick={() => handleUserAction(user.email, 'LOCK')} className="h-8 bg-red-600 hover:bg-red-700 text-xs shadow-lg shadow-red-900/20">Lock Account</Button>
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Network className="w-6 h-6 text-red-500" />
                  </div>
                  Fraud Rings Detected
                </h3>
                <p className="text-gray-400 text-sm mt-1 ml-11">AI-driven cluster analysis of shared IP addresses and device fingerprints</p>
              </div>
              <Button onClick={fetchFraudRings} className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-900/20 border-0">
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Network
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fraudRings.slice((fraudRingsPage - 1) * 6, fraudRingsPage * 6).map((ring, i) => (
                <div key={ring.ip_address || i} className="group relative bg-[#111] hover:bg-[#161616] p-6 rounded-2xl border border-white/5 transition-all duration-300 hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-900/10">
                  {/* Decorator Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/40 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                        <Share2 className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono text-lg font-bold text-white tracking-tight">{ring.ip_address}</h4>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          {ring.distinct_users} Linked Identities
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20 shadow-sm flex items-center gap-1.5">
                      <AlertOctagon className="w-3 h-3" />
                      {ring.risk_level}
                    </span>
                  </div>

                  <div className="space-y-3 bg-black/40 rounded-xl p-4 border border-white/5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Connected Accounts</p>
                    <div className="space-y-2">
                      {ring.users.slice(0, 3).map((u: any, idx: number) => (
                        <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/10">
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-300 font-mono truncate">{u.email}</span>
                        </div>
                      ))}
                      {ring.users.length > 3 && (
                        <div className="text-center pt-1">
                          <span className="text-xs text-gray-500 font-medium hover:text-white cursor-pointer transition-colors">
                            +{ring.users.length - 3} more accounts
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="w-full border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300">
                      Block All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                      onClick={() => {
                        setSelectedRing(ring);
                        setShowRingDetailModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {fraudRings.length === 0 && (
                <div className="col-span-full py-20 text-center bg-[#111] rounded-2xl border border-white/5 border-dashed">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">System Secure</h3>
                  <p className="text-gray-500">No fraud rings detected at this moment.</p>
                </div>
              )}
            </div>
            {fraudRings.length > 0 && (
              <div className="mt-8 flex justify-center">
                <PaginationControls
                  page={fraudRingsPage}
                  totalPages={Math.ceil(fraudRings.length / 6)}
                  setPage={setFraudRingsPage}
                  loading={false}
                />
              </div>
            )}
          </Card>
        )}




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

  const styles: Record<string, { border: string; bg: string; iconBg: string }> = {
    blue: {
      border: 'hover:border-blue-500/30 hover:shadow-blue-500/5',
      bg: 'hover:shadow-lg',
      iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20'
    },
    yellow: {
      border: 'hover:border-yellow-500/30 hover:shadow-yellow-500/5',
      bg: 'hover:shadow-lg',
      iconBg: 'bg-yellow-500/10 group-hover:bg-yellow-500/20'
    },
    red: {
      border: 'hover:border-red-500/30 hover:shadow-red-500/5',
      bg: 'hover:shadow-lg',
      iconBg: 'bg-red-500/10 group-hover:bg-red-500/20'
    },
    purple: {
      border: 'hover:border-purple-500/30 hover:shadow-purple-500/5',
      bg: 'hover:shadow-lg',
      iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/20'
    },
    orange: {
      border: 'hover:border-orange-500/30 hover:shadow-orange-500/5',
      bg: 'hover:shadow-lg',
      iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20'
    },
    green: {
      border: 'hover:border-green-500/30 hover:shadow-green-500/5',
      bg: 'hover:shadow-lg',
      iconBg: 'bg-green-500/10 group-hover:bg-green-500/20'
    },
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <div className={`bg-[#111] border border-white/5 rounded-2xl p-6 transition-all group ${currentStyle.border} ${currentStyle.bg}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-xl font-bold text-white">
            {value}
          </h3>
        </div>
        <div className={`p-2 rounded-lg transition-colors ${currentStyle.iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
