import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button, Input, Card } from '../components/ui';
import { formatIndianCurrency } from '../src/utils/formatters';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield, CreditCard, Send, Bell, User, Lock, AlertTriangle, CheckCircle,
  XCircle, Clock, Plus, Download, Eye, EyeOff, Smartphone, Globe, Key,
  LogOut, Trash2, RefreshCw, DollarSign, FileText, Building, Wallet,
  Menu, X, Unlock, Home, BarChart3, Settings, ChevronLeft, ShieldAlert, ArrowRight
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Toast Notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Session Management
  const [sessionExpiresIn, setSessionExpiresIn] = useState<number | null>(null);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const IDLE_TIMEOUT = 180 * 1000; // 3 minutes
  const WARNING_TIMEOUT = 150 * 1000; // 2.5 minutes
  const idleTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // ... (keeping other states same) ...

  // ==========================================
  // IDLE TIMER & AUTO-LOGOUT
  // ==========================================
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setShowIdleWarning(false);

    const newTimer = setTimeout(() => {
      // Show Warning at 2.5 mins
      setShowIdleWarning(true);

      // Auto-Logout at 3 mins (nested timeout)
      setTimeout(() => {
        handleLogout();
        // Force redirect if handleLogout doesn't cover it
        window.location.href = '/login?reason=idle';
      }, 30000);

    }, WARNING_TIMEOUT);

    idleTimerRef.current = newTimer;
  };

  useEffect(() => {
    // Events to track activity
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    // Initial start
    resetIdleTimer();

    const handleActivity = () => {
      // Only reset if warning is NOT shown (to prevent infinite resets if user is away)
      if (!showIdleWarning) {
        resetIdleTimer();
      }
    };

    // Add listeners
    events.forEach(event => window.addEventListener(event, handleActivity));

    // Cleanup
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [showIdleWarning]);

  // Payment Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    receiver_account: '',
    amount: '',
    transaction_type: 'card',
    merchant_id: '',
    upi_id: '',
    wallet_type: '',
    lat: 0,
    lon: 0
  });
  const [paymentStep, setPaymentStep] = useState<'form' | 'otp' | '2fa' | 'result'>('form');
  const [paymentOtp, setPaymentOtp] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [selectedCardForPayment, setSelectedCardForPayment] = useState<any>(null);

  // 2FA Setup States
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaUri, setTfaUri] = useState('');
  const [tfaVerifyCode, setTfaVerifyCode] = useState('');
  const [tfaStep, setTfaStep] = useState<'generate' | 'verify'>('generate');

  // Password States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Data States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsTab, setAlertsTab] = useState<'notifications' | 'alerts'>('notifications');
  const [cards, setCards] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);

  // Card Modal
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    card_number: '',
    expiry: '',
    cvv: '',
    card_type: 'DEBIT',
    pin: ''
  });

  // Travel Notice
  const [showTravelNotice, setShowTravelNotice] = useState(false);
  const [travelCountry, setTravelCountry] = useState('');

  // Pagination States
  const [txPage, setTxPage] = useState(1);
  const [txPagination, setTxPagination] = useState({ total: 0, pages: 1 });
  const [devicePage, setDevicePage] = useState(1);
  const [devicePagination, setDevicePagination] = useState({ total: 0, pages: 1 });

  // Dispute Modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    transaction_id: '',
    reason: 'FRAUD',
    description: ''
  });

  // Support Tickets
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: ''
  });

  // Unfreeze Account
  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
  const [unfreezePassword, setUnfreezePassword] = useState('');

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    type: 'danger' | 'success' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Security Check Modal (2FA Nudge)
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);

  // Session Expiry Modal
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    // Check if user should see security suggestion
    if (user && !user.twofa_enabled) {
      const hasSeenSuggestion = sessionStorage.getItem('hasSeen2FASuggestion');
      if (!hasSeenSuggestion) {
        // Delay slightly for smoother UX
        setTimeout(() => setShowSecurityCheck(true), 2000);
      }
    }
  }, [user]);

  // ==================== FETCH FUNCTIONS ====================

  useEffect(() => {
    let isMounted = true; // Cleanup flag to prevent state updates after unmount

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
        const profileSuccess = await fetchUserProfile();
        if (!profileSuccess || !isMounted) return; // Stop if profile load failed (e.g. 401)

        await fetchNotifications();
        if (!isMounted) return;
        await fetchAlerts();
        if (!isMounted) return;
        await fetchCards();
        if (!isMounted) return;
        await fetchDashboardSummary();
        if (!isMounted) return;
        resetIdleTimer();
      } catch (error) {
        // Ignore errors if component unmounted
        if (!isMounted) return;
        console.error('Failed to load initial data:', error);
      }
    };

    // Small delay to ensure token sync completes
    const timeoutId = setTimeout(() => {
      loadInitialData();
    }, 100);

    return () => {
      isMounted = false; // Cleanup: prevent any pending state updates
      clearTimeout(timeoutId);
    };
  }, []);

  // Pagination Effects
  useEffect(() => {
    if (user?.id) fetchTransactions();
  }, [txPage, user?.id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user?.id) {
      fetchDevices();
    }
  }, [devicePage, user?.id]);

  useEffect(() => {
    const handleSessionExpired = () => setShowSessionExpired(true);
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  // Add responsive listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // NavItem Component for Sidebar
  const NavItem: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
    badge?: number;
    onClick?: () => void;
  }> = ({ icon: Icon, label, active, badge, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
        : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
        }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : ''}`} />
      <span className="font-medium">{label}</span>
      {badge && badge > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  const showToastNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };





  const fetchUserProfile = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token, skipping user profile fetch');
      return false;
    }
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      return true;
    } catch (error: any) {
      console.error('Failed to fetch user profile', error);
      if (error.response?.status === 401) {
        handleLogout();
        return false;
      }
      return false;
    }
  };

  const fetchDashboardSummary = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/analytics/dashboard'); // ✅ Correct endpoint
      setDashboardSummary({
        balance: res.data.balance || 0,
        total_transactions: res.data.total_transactions || 0,
        monthly_spending: res.data.monthly_spending || 0,
        pending_transactions: res.data.pending_transactions || 0,
        trust_score: res.data.trust_score || 100,
        // Keep existing properties that might be used elsewhere
        spending_trend: res.data.spending_trend,
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard summary', error);
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/support/notifications');
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await api.post('/api/support/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read');
    }
  };

  const fetchAlerts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/alerts/');
      setAlerts(res.data || []);
    } catch (error) {
      console.error('Failed to fetch alerts');
    }
  };

  const markAlertsAsRead = async () => {
    try {
      await api.put('/api/alerts/read-all');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to mark alerts as read');
    }
  };

  const fetchCards = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/cards/');
      setCards(res.data || []);
    } catch (error) {
      console.error('Failed to fetch cards');
    }
  };

  const fetchDevices = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get(`/api/auth/devices?page=${devicePage}&per_page=5`);
      setDevices(res.data.devices || []);
      setDevicePagination({ total: res.data.total, pages: res.data.pages });
    } catch (error) {
      console.error('Failed to fetch devices');
    }
  };

  const fetchLoginHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/auth/login-history');
      setLoginHistory(res.data || []);
    } catch (error) {
      console.error('Failed to fetch login history');
    }
  };

  const fetchDisputes = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/support/disputes');
      setDisputes(res.data || []);
    } catch (error) {
      console.error('Failed to fetch disputes');
    }
  };

  const fetchMonthlyExpenses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/analytics/dashboard/monthly-expenses');
      setMonthlyExpenses(res.data || []);
    } catch (error) {
      console.error('Failed to fetch monthly expenses');
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!user?.id) {
        console.log('User ID not available yet');
        return;
      }
      const res = await api.get(`/api/accounts/${user.id}/transactions?page=${txPage}&per_page=10`);
      setTransactions(res.data.transactions || []);
      setTxPagination({ total: res.data.total, pages: res.data.pages });
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error.response?.data);
      setTransactions([]);
    }
  };

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/support/tickets');
      setTickets(res.data || []);
    } catch (error) {
      console.error('Failed to fetch tickets');
    }
  };

  // ==================== HANDLER FUNCTIONS ====================

  const handleLogout = async () => {
    // Clear user state FIRST to prevent any new fetches
    setUser(null);

    // Clear tokens IMMEDIATELY to stop any ongoing authenticated requests
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('loginTime');

    // Navigate to landing page IMMEDIATELY - don't wait for API call
    navigate('/');

    // Make logout API call in background (fire-and-forget)
    if (token) {
      api.post('/api/auth/logout').catch(() => {
        // Silently ignore errors - user is already logged out on frontend
      });
    }
  };

  const processPayment = async (payload: any) => {
    try {
      console.log('📤 Sending to backend:', payload);

      const res = await api.post('/api/tx/pay', payload);

      console.log('✅ Backend response:', res.data);

      if (res.data.status === 'PENDING_OTP') {
        setTransactionId(res.data.transaction_id);
        setPaymentStep('otp');
        showToastNotification('OTP sent to your email', 'success');
      } else if (res.data.status === 'PENDING_2FA') {
        // Handle 2FA verification
        setTransactionId(res.data.transaction_id);
        setPaymentStep('2fa');
        showToastNotification('2FA verification required', 'success');
      } else if (res.data.status === 'SUCCESS') {
        setPaymentResult(res.data);
        setPaymentStep('result');
        fetchUserProfile();
        showToastNotification('Payment successful!', 'success');
      } else if (res.data.status === 'FAILED') {
        setPaymentResult(res.data);
        setPaymentStep('result');
        showToastNotification(res.data.message || 'Transaction blocked', 'error');
      }
    } catch (error: any) {
      console.error('❌ Payment Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      showToastNotification(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Payment processing failed',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build the payload with receiver_account for ALL types
      let payload: any = {
        amount: parseFloat(paymentForm.amount),
        transaction_type: paymentForm.transaction_type,
        lat: 0,
        lon: 0
      };

      // Map frontend fields to backend's expected 'receiver_account'
      switch (paymentForm.transaction_type) {
        case 'card':
          if (!paymentForm.merchant_id) {
            showToastNotification('Merchant account is required', 'error');
            setLoading(false);
            return;
          }
          if (!selectedCardForPayment) {
            showToastNotification('Please select a card', 'error');
            setLoading(false);
            return;
          }
          // Backend expects receiver_account for card payments
          payload.receiver_account = paymentForm.merchant_id;
          break;

        case 'netbanking':
          if (!paymentForm.receiver_account) {
            showToastNotification('Receiver account is required', 'error');
            setLoading(false);
            return;
          }
          payload.receiver_account = paymentForm.receiver_account;
          break;

        case 'upi':
          if (!paymentForm.upi_id) {
            showToastNotification('UPI ID is required', 'error');
            setLoading(false);
            return;
          }
          // Backend expects receiver_account for UPI payments
          payload.receiver_account = paymentForm.upi_id;
          break;

        case 'wallet':
          if (!paymentForm.wallet_type || !paymentForm.merchant_id) {
            showToastNotification('Wallet type and merchant ID are required', 'error');
            setLoading(false);
            return;
          }
          // Backend expects receiver_account for wallet payments
          payload.receiver_account = paymentForm.merchant_id;
          payload.wallet_type = paymentForm.wallet_type;
          break;

        default:
          showToastNotification('Invalid payment method', 'error');
          setLoading(false);
          return;
      }

      console.log('🚀 Payment Payload:', payload);

      // ✅ REQUIRE LOCATION PERMISSION - Block if denied
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            payload.lat = position.coords.latitude;
            payload.lon = position.coords.longitude;
            console.log('📍 Location added:', { lat: payload.lat, lon: payload.lon });
            await processPayment(payload);
          },
          async (error) => {
            // Location denied - show warning but still allow (backend will flag it)
            console.warn('⚠️ Location permission denied:', error.message);
            showToastNotification('Location access recommended for security. Transaction may require additional verification.', 'error');
            // Still proceed but backend will flag no-location transactions
            await processPayment(payload);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        showToastNotification('Location services not available. Transaction may require verification.', 'error');
        await processPayment(payload);
      }
    } catch (error: any) {
      console.error('❌ Payment Handler Error:', error);
      showToastNotification('Payment failed', 'error');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/tx/verify-otp', {
        transaction_id: transactionId,
        otp: paymentOtp
      });
      setPaymentResult(res.data);
      setPaymentStep('result');
      fetchUserProfile();
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post('/api/tx/resend-otp');
      showToastNotification('OTP resent to your email', 'success');
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to resend OTP', 'error');
    }
  };

  // State for 2FA verification code
  const [twoFACode, setTwoFACode] = useState('');

  const handleVerify2FATransaction = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/tx/verify-2fa', {
        transaction_id: transactionId,
        totp_code: twoFACode
      });
      setPaymentResult(res.data);
      setPaymentStep('result');
      setTwoFACode('');
      fetchUserProfile();
      showToastNotification('Transaction verified successfully!', 'success');
    } catch (error: any) {
      showToastNotification(error.response?.data?.error || 'Invalid 2FA code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPaymentModal = () => {
    setShowPayModal(false);
    setPaymentForm({
      receiver_account: '',
      amount: '',
      transaction_type: 'card',
      merchant_id: '',
      upi_id: '',
      wallet_type: '',
      lat: 0,
      lon: 0
    });
    setPaymentStep('form');
    setPaymentOtp('');
    setTransactionId('');
    setPaymentResult(null);
    setSelectedCardForPayment(null);
  };

  const handleEnable2FA = async () => {
    try {
      const res = await api.post('/api/auth/enable-2fa');
      setTfaSecret(res.data.secret);
      setTfaUri(res.data.uri);
      setTfaStep('verify');
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to enable 2FA', 'error');
    }
  };

  const handleVerify2FA = async () => {
    try {
      await api.post('/api/auth/verify-2fa-setup', { code: tfaVerifyCode });
      showToastNotification('2FA Enabled Successfully!', 'success');
      setShow2FAModal(false);
      setTfaStep('generate');
      setTfaVerifyCode('');
      fetchUserProfile();
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Invalid code', 'error');
    }
  };

  const handleDisable2FA = async () => {
    try {
      await api.post('/api/auth/disable-2fa', { password: disable2FAPassword });
      setUser((prevUser: any) => ({ ...prevUser, twofa_enabled: false }));
      setShowDisable2FAModal(false);
      setDisable2FAPassword('');
      showToastNotification('2FA Disabled Successfully', 'success');
      await fetchUserProfile();
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to disable 2FA', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/change-password', changePasswordForm);
      showToastNotification('Password changed successfully', 'success');
      setShowChangePasswordModal(false);
      setChangePasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  const handleFreezeAccount = async () => {
    setConfirmAction({
      title: 'Freeze Account',
      message: 'Are you sure you want to freeze your account? All transactions will be blocked.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.post('/api/users/security/freeze');
          showToastNotification('Account frozen successfully', 'success');
          fetchUserProfile();
        } catch (error: any) {
          showToastNotification(error.response?.data?.message || 'Failed to freeze account', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleUnfreezeAccount = async () => {
    try {
      await api.post('/api/users/security/unfreeze', { password: unfreezePassword });
      showToastNotification('Account unfrozen successfully', 'success');
      setShowUnfreezeModal(false);
      setUnfreezePassword('');
      fetchUserProfile();
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to unfreeze account', 'error');
    }
  };

  const handleAddCard = async () => {
    try {
      await api.post('/api/cards', newCard);
      showToastNotification('Card added successfully', 'success');
      setShowAddCard(false);
      setNewCard({ card_number: '', expiry: '', cvv: '', card_type: 'DEBIT', pin: '' });
      fetchCards();
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to add card', 'error');
    }
  };

  const handleLockCard = async (cardId: number) => {
    setConfirmAction({
      title: 'Lock Card',
      message: 'Are you sure you want to lock this card?',
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.post(`/api/cards/${cardId}/lock`);
          showToastNotification('Card locked successfully', 'success');
          fetchCards();
        } catch (error: any) {
          showToastNotification(error.response?.data?.message || 'Failed to lock card', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleRemoveDevice = async (deviceId: number) => {
    setConfirmAction({
      title: 'Remove Device',
      message: 'Remove this device from trusted list?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/auth/devices/${deviceId}`);
          showToastNotification('Device removed', 'success');
          fetchDevices();
        } catch (error: any) {
          showToastNotification(error.response?.data?.message || 'Failed to remove device', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleTravelNotice = async () => {
    try {
      await api.post('/api/tx/travel-notice', { country_code: travelCountry });
      showToastNotification('Travel notice submitted successfully', 'success');
      setShowTravelNotice(false);
      setTravelCountry('');
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to submit travel notice', 'error');
    }
  };

  const handleFileDispute = async () => {
    try {
      await api.post('/api/support/disputes', disputeForm);
      showToastNotification('Dispute filed successfully', 'success');
      setShowDisputeModal(false);
      setDisputeForm({ transaction_id: '', reason: 'FRAUD', description: '' });
      fetchDisputes();
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to file dispute', 'error');
    }
  };

  const handleCreateTicket = async () => {
    try {
      await api.post('/api/support/tickets', newTicket);
      showToastNotification('Support ticket created successfully', 'success');
      setShowCreateTicket(false);
      setNewTicket({ subject: '', description: '' });
      fetchTickets();
    } catch (error: any) {
      showToastNotification(error.response?.data?.message || 'Failed to create ticket', 'error');
    }
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.onConfirm();
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  // Loading text animation state
  const [loadingText, setLoadingText] = React.useState('Connecting to server...');

  React.useEffect(() => {
    const texts = [
      'Connecting to server...',
      'Authenticating session...',
      'Loading profile data...',
      'Initializing dashboard...'
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // 🚀 Full Page Loading Animation
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="pulse-ring w-24 h-24 mb-8"></div>
        <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">SecureBank AI</h2>
        <p className="text-cyan-400 font-mono animate-pulse">{loadingText}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* AURORA BACKGROUND (Global Theme) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[30%] w-[700px] h-[700px] bg-blue-900/10 rounded-full blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]"></div>
      </div>

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div className={`${toastType === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
            } backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px]`}>
            {toastType === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <p className="font-semibold">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* SESSION EXPIRY WARNING */}
      {sessionExpiresIn !== null && sessionExpiresIn <= 5 && sessionExpiresIn > 0 && (
        <div className="fixed top-20 right-4 z-[100] animate-slide-in">
          <div className="bg-orange-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-2xl">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 animate-pulse" />
              <div>
                <p className="font-bold text-sm">Session Expiring Soon!</p>
                <p className="text-xs">Auto-logout in {sessionExpiresIn} minute{sessionExpiresIn !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* IDLE WARNING MODAL */}
      {
        showIdleWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#111] border border-red-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                  <Clock className="w-6 h-6 text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Session Expiring</h3>
                <p className="text-gray-400 mb-6">
                  You have been inactive for a while. For your security, you will be logged out in <span className="text-red-400 font-bold">30 seconds</span>.
                </p>

                <div className="flex gap-3 w-full">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                  >
                    Logout Now
                  </Button>
                  <Button
                    onClick={() => { setShowIdleWarning(false); resetIdleTimer(); }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20"
                  >
                    I'm Here
                  </Button>
                </div>
              </div>

              {/* Progress Bar Animation */}
              <div className="absolute bottom-0 left-0 h-1 bg-red-600 animate-shrink w-full" style={{ animationDuration: '30s' }}></div>
            </div>
          </div>
        )
      }

      <div className="relative flex h-screen">
        {/* ==================== LAYOUT ==================== */}

        {/* MOBILE HEADER - Clean & Minimal */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">SecureBank</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAlertsTab('notifications')}
                className="relative p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                )}
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP SIDEBAR - Glassmorphism */}
        {!isMobile && (
          <div className="w-72 bg-black/20 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">SecureBank</h1>
                  <p className="text-xs text-gray-500 font-medium tracking-wider">PREMIUM</p>
                </div>
              </div>

              <div className="space-y-2">
                <NavItem icon={Home} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <NavItem icon={CreditCard} label="Cards" active={activeTab === 'cards'} onClick={() => { setActiveTab('cards'); fetchCards(); }} />
                <NavItem icon={FileText} label="Transactions" active={activeTab === 'transactions'} onClick={() => { setActiveTab('transactions'); fetchTransactions(); }} />
                <NavItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); fetchMonthlyExpenses(); }} />
                <NavItem icon={Shield} label="Security" active={activeTab === 'security'} onClick={() => { setActiveTab('security'); fetchDevices(); }} />
                <NavItem icon={Bell} label="Support" active={activeTab === 'support'} badge={notifications.filter(n => !n.is_read).length} onClick={() => { setActiveTab('support'); fetchTickets(); }} />
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                    alt="Profile"
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobile && (
          <>
            {/* Overlay */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0a0a0a] border-r border-white/10 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">SecureBank</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-2">
                  <NavItem icon={Home} label="Dashboard" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={CreditCard} label="Cards" active={activeTab === 'cards'} onClick={() => { setActiveTab('cards'); fetchCards(); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={FileText} label="Transactions" active={activeTab === 'transactions'} onClick={() => { setActiveTab('transactions'); fetchTransactions(); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); fetchMonthlyExpenses(); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={Shield} label="Security" active={activeTab === 'security'} onClick={() => { setActiveTab('security'); fetchDevices(); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={Bell} label="Support" active={activeTab === 'support'} badge={notifications.filter(n => !n.is_read).length} onClick={() => { setActiveTab('support'); fetchTickets(); setIsMobileMenuOpen(false); }} />
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                        alt="Profile"
                        className="w-full h-full rounded-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MOBILE BOTTOM NAV - Floating & Glass */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
            <div className="flex items-center justify-around p-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'overview' ? 'text-cyan-400' : 'text-gray-500'}`}
              >
                <Home className={`w-6 h-6 ${activeTab === 'overview' && 'fill-cyan-400/20'}`} />
                <span className="text-[10px] font-medium">Home</span>
              </button>
              <button
                onClick={() => { setActiveTab('transactions'); fetchTransactions(); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'transactions' ? 'text-purple-400' : 'text-gray-500'}`}
              >
                <FileText className={`w-6 h-6 ${activeTab === 'transactions' && 'fill-purple-400/20'}`} />
                <span className="text-[10px] font-medium">History</span>
              </button>

              {/* Floating Action Button (FAB) in Center */}
              <button
                onClick={() => setShowPayModal(true)}
                className="relative -top-6 p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/40 text-white hover:scale-105 transition-transform"
              >
                <Send className="w-6 h-6 ml-0.5" />
              </button>

              <button
                onClick={() => { setActiveTab('cards'); fetchCards(); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'cards' ? 'text-pink-400' : 'text-gray-500'}`}
              >
                <CreditCard className={`w-6 h-6 ${activeTab === 'cards' && 'fill-pink-400/20'}`} />
                <span className="text-[10px] font-medium">Cards</span>
              </button>
              <button
                onClick={() => { setActiveTab('analytics'); fetchMonthlyExpenses(); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'analytics' ? 'text-orange-400' : 'text-gray-500'}`}
              >
                <BarChart3 className={`w-6 h-6 ${activeTab === 'analytics' && 'fill-orange-400/20'}`} />
                <span className="text-[10px] font-medium">Stats</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Overlay */}
        {isMobile && isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 mt-16"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'mt-16 pb-32' : ''}`}>
          {/* Header */}
          <div className="bg-slate-900/30 backdrop-blur-xl border-b border-slate-800 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {activeTab === 'overview' && 'Dashboard'}
                  {activeTab === 'cards' && 'Virtual Cards'}
                  {activeTab === 'transactions' && 'Transactions'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'security' && 'Security'}
                  {activeTab === 'support' && 'Support'}
                </h1>
                <p className="text-gray-400 text-sm">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}
                </p>
              </div>

              {/* Right Side - Notifications Toggle */}
              <div className="hidden md:flex items-center gap-3 md:gap-4">
                {/* Notifications/Alerts Toggle */}
                <div className="flex bg-slate-900/50 rounded-xl p-1 border border-slate-800">
                  <button
                    onClick={() => setAlertsTab('notifications')}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${alertsTab === 'notifications'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notifications</span>
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setAlertsTab('alerts')}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${alertsTab === 'alerts'
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="hidden sm:inline">Alerts</span>
                    {alerts.filter(a => !a.is_read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {alerts.filter(a => !a.is_read).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Content Area with Responsive Padding */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">

            {/* NEW BALANCE CARD - HOLOGRAPHIC DESIGN */}
            {activeTab === 'overview' && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl group">
                {/* Animated Background Mesh */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)] animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen animate-blob"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                      <p className="text-gray-400 font-medium tracking-widest text-xs uppercase mb-1">Total Balance</p>
                      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-gray-400 tracking-tight">
                        {formatIndianCurrency(user?.balance || 0)}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                      <div className={`w-2 h-2 rounded-full ${user?.is_locked ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
                      <span className="text-xs font-bold tracking-wide text-white">
                        {user?.is_locked ? 'FROZEN' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className={`w-4 h-4 ${(user?.trust_score || 0) > 80 ? 'text-emerald-400' : 'text-yellow-400'}`} />
                        <span className="text-xs font-semibold text-gray-400 uppercase">Trust Score</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white">{user?.trust_score || 0}</span>
                        <span className="text-xs text-gray-500 mb-1">/100</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold text-gray-400 uppercase">Account</span>
                      </div>
                      <p className="text-lg font-mono text-white tracking-wider">
                        •••• {user?.account_number?.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW QUICK ACTIONS - NEON GRID */}
            {activeTab === 'overview' && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
                  {/* Transfer - Primary Action */}
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="group relative p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-cyan-500/25 flex flex-col items-center justify-center gap-2 h-32 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110">
                      <Send className="w-16 h-16" />
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm z-10">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-white z-10 text-sm">Send Money</span>
                  </button>

                  {/* Other Actions */}
                  {[
                    { label: 'History', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', action: () => { setActiveTab('transactions'); fetchTransactions(); } },
                    { label: 'Cards', icon: CreditCard, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', action: () => { setActiveTab('cards'); fetchCards(); } },
                    { label: 'Stats', icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', action: () => { setActiveTab('analytics'); fetchMonthlyExpenses(); } },
                    { label: 'Security', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', action: () => { setActiveTab('security'); fetchDevices(); } },
                    { label: 'Support', icon: Bell, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', action: () => { setActiveTab('support'); fetchTickets(); } },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className={`group p-4 rounded-2xl border ${item.border} ${item.bg} hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2 h-32`}
                    >
                      <div className={`p-3 rounded-xl bg-slate-900/50 group-hover:scale-110 transition-transform ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-gray-300 group-hover:text-white">{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* NOTIFICATIONS & ALERTS CONTENT - Only on Overview */}
            {
              activeTab === 'overview' && (notifications.length > 0 || alerts.length > 0) && (
                <Card className="mb-6 sm:mb-8 border-slate-700 bg-slate-800/30">
                  <div className="p-4 sm:p-6">
                    {/* Header with Title and Mark Read */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {alertsTab === 'notifications' ? (
                          <>
                            <Bell className="w-5 h-5 text-cyan-400" />
                            Notifications
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            Alerts
                          </>
                        )}
                      </h3>
                      {alertsTab === 'notifications' && notifications.filter(n => !n.is_read).length > 0 && (
                        <Button
                          onClick={markNotificationsAsRead}
                          size="sm"
                          className="bg-cyan-600 hover:bg-cyan-700 text-xs"
                        >
                          Mark All Read
                        </Button>
                      )}
                      {alertsTab === 'alerts' && alerts.filter(a => !a.is_read).length > 0 && (
                        <Button
                          onClick={markAlertsAsRead}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-xs"
                        >
                          Mark All Read
                        </Button>
                      )}
                    </div>

                    {/* Notifications Content */}
                    {alertsTab === 'notifications' && (
                      <div className="space-y-3">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notif, idx) => (
                            <div key={idx} className="bg-slate-900/50 p-3 sm:p-4 rounded-lg border border-cyan-500/20">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">{notif.title}</h4>
                                  <p className="text-gray-300 text-xs sm:text-sm break-words">{notif.message}</p>
                                  <p className="text-gray-500 text-xs mt-1">{new Date(notif.time).toLocaleString()}</p>
                                </div>
                                {!notif.is_read && (
                                  <span className="flex-shrink-0 w-2 h-2 bg-cyan-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-4">No notifications</p>
                        )}
                      </div>
                    )}

                    {/* Alerts Content */}
                    {alertsTab === 'alerts' && (
                      <div className="space-y-3">
                        {alerts.length > 0 ? (
                          alerts.slice(0, 5).map((alert, idx) => (
                            <div key={idx} className="bg-red-500/10 p-3 sm:p-4 rounded-lg border border-red-500/30">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm sm:text-base break-words">{alert.message}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded ${alert.type === 'DANGER' ? 'bg-red-500/20 text-red-400' :
                                      alert.type === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-blue-500/20 text-blue-400'
                                      }`}>
                                      {alert.type || 'INFO'}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {new Date(alert.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                {!alert.is_read && (
                                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-4">No alerts</p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )
            }
            {/* TAB CONTENT - Overview */}
            {
              activeTab === 'overview' && (
                <Card>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      Travel Notice
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm sm:text-base">
                      Inform us of your travel plans to prevent false fraud flags.
                    </p>
                    <Button
                      onClick={() => setShowTravelNotice(true)}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
                    >
                      Submit Travel Notice
                    </Button>
                  </div>
                </Card>
              )
            }

            {/* TAB CONTENT - Transactions - Full Page View */}
            {
              activeTab === 'transactions' && (
                <div className="min-h-[calc(100vh-200px)]">
                  <Card className="h-full">
                    <div className="p-4 sm:p-6">
                      {/* Header with Back Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setActiveTab('overview')}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                            Transaction History
                          </h3>
                        </div>
                        <Button
                          onClick={fetchTransactions}
                          size="sm"
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {transactions.length > 0 ? (
                          transactions.map((tx) => (
                            <div
                              key={tx.id}
                              className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                {/* Left Section */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`p-2 rounded-lg ${tx.status === 'SUCCESS' ? 'bg-green-500/20' :
                                      tx.status === 'PENDING' ? 'bg-yellow-500/20' :
                                        tx.status === 'BLOCKED' ? 'bg-red-500/20' : 'bg-gray-500/20'
                                      }`}>
                                      {tx.transaction_type === 'card' && <CreditCard className="w-4 h-4 text-white" />}
                                      {tx.transaction_type === 'netbanking' && <Building className="w-4 h-4 text-white" />}
                                      {tx.transaction_type === 'upi' && <Smartphone className="w-4 h-4 text-white" />}
                                      {tx.transaction_type === 'wallet' && <Wallet className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-semibold text-sm sm:text-base truncate">
                                        {tx.transaction_type?.toUpperCase()} Payment
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        To: {tx.receiver_account?.slice(0, 4)}...{tx.receiver_account?.slice(-4)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(tx.timestamp || tx.date || tx.created_at).toLocaleString('en-IN', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    <span>•</span>
                                    <span className="font-mono">ID: {tx.id?.slice(0, 8)}...</span>
                                  </div>

                                  {/* Risk Score Badge */}
                                  {tx.risk_score !== undefined && (
                                    <div className="mt-2">
                                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${tx.risk_score <= 0.25 ? 'bg-green-500/20 text-green-400' :
                                        tx.risk_score <= 0.75 ? 'bg-yellow-500/20 text-yellow-400' :
                                          'bg-red-500/20 text-red-400'
                                        }`}>
                                        <Shield className="w-3 h-3" />
                                        Risk: {(tx.risk_score * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Right Section */}
                                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                                  <div className="text-right">
                                    <p className="text-white font-bold text-lg sm:text-xl font-mono">
                                      {formatIndianCurrency(tx.amount)}
                                    </p>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${tx.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' :
                                      tx.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                        tx.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400' :
                                          'bg-gray-500/20 text-gray-400'
                                      }`}>
                                      {tx.status}
                                    </span>
                                  </div>

                                  {/* Action Buttons */}
                                  {tx.status === 'SUCCESS' && (
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => {
                                          setDisputeForm({
                                            transaction_id: tx.id,
                                            reason: 'FRAUD',
                                            description: ''
                                          });
                                          setShowDisputeModal(true);
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300 text-xs"
                                      >
                                        <AlertTriangle className="w-3 h-3 sm:mr-1" />
                                        <span className="hidden sm:inline">Dispute</span>
                                      </Button>
                                      <Button
                                        onClick={() => showToastNotification('Receipt download feature coming soon', 'success')}
                                        size="sm"
                                        variant="ghost"
                                        className="text-cyan-400 hover:text-cyan-300 text-xs"
                                      >
                                        <Download className="w-3 h-3 sm:mr-1" />
                                        <span className="hidden sm:inline">Receipt</span>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Additional Info */}
                              {tx.lat && tx.lon && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                  <p className="text-gray-400 text-xs flex items-center gap-2">
                                    <Globe className="w-3 h-3" />
                                    Location: {tx.lat.toFixed(4)}, {tx.lon.toFixed(4)}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-16">
                            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">No Transactions Yet</p>
                            <p className="text-gray-500 text-sm mb-6">
                              Start by sending money using the "Send Money" button above
                            </p>
                            <Button
                              onClick={() => setShowPayModal(true)}
                              className="bg-cyan-600 hover:bg-cyan-700"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send Money Now
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Pagination Controls for Transactions */}
                      {txPagination.pages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-slate-700">
                          <Button
                            disabled={txPage === 1}
                            onClick={() => setTxPage(p => Math.max(1, p - 1))}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                          </Button>
                          <span className="text-gray-400 text-sm font-mono">
                            Page <span className="text-white">{txPage}</span> of {txPagination.pages}
                          </span>
                          <Button
                            disabled={txPage === txPagination.pages}
                            onClick={() => setTxPage(p => Math.min(txPagination.pages, p + 1))}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            Next <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )
            }

            {/* TAB CONTENT - Security */}
            {
              activeTab === 'security' && (
                <>
                  {/* 2FA & PASSWORD SECTION */}
                  <Card className="mb-6 sm:mb-8">
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                        Account Security
                      </h3>

                      {/* 2FA Section */}
                      <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-white font-semibold mb-1 text-sm sm:text-base">
                              Two-Factor Authentication
                            </p>
                            <p className="text-gray-400 text-xs sm:text-sm">
                              {user?.twofa_enabled
                                ? '✅ Enabled - Your account is protected'
                                : '⚠️ Not enabled - Enable for better security'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {user?.twofa_enabled ? (
                              <Button
                                onClick={() => setShowDisable2FAModal(true)}
                                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm"
                              >
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                Disable 2FA
                              </Button>
                            ) : (
                              <Button
                                onClick={() => {
                                  setShow2FAModal(true);
                                  handleEnable2FA();
                                }}
                                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm"
                              >
                                <Key className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                Enable 2FA
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Change Password Section */}
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-white font-semibold mb-1 text-sm sm:text-base">Password</p>
                            <p className="text-gray-400 text-xs sm:text-sm">
                              Update your password regularly to keep your account secure
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowChangePasswordModal(true)}
                            className="bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto text-sm"
                          >
                            <Key className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* DEVICES */}
                  <Card className="mb-6 sm:mb-8">
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                        Trusted Devices
                      </h3>
                      <div className="space-y-3">
                        {devices.length > 0 ? (
                          devices.map((d) => (
                            <div
                              key={d.id}
                              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-slate-800/50 p-3 sm:p-4 rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm sm:text-base truncate">
                                  {d.name}
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm">Last used: {d.last_used}</p>
                              </div>
                              <Button
                                onClick={() => handleRemoveDevice(d.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 w-full sm:w-auto"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                <span className="sm:hidden">Remove</span>
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-8 text-sm">No trusted devices</p>
                        )}
                      </div>

                      {/* Pagination Controls for Devices */}
                      {devicePagination.pages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t border-slate-700">
                          <Button
                            disabled={devicePage === 1}
                            onClick={() => setDevicePage(p => Math.max(1, p - 1))}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                          </Button>
                          <span className="text-gray-400 text-sm font-mono">
                            Page <span className="text-white">{devicePage}</span> of {devicePagination.pages}
                          </span>
                          <Button
                            disabled={devicePage === devicePagination.pages}
                            onClick={() => setDevicePage(p => Math.min(devicePagination.pages, p + 1))}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            Next <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* LOGIN HISTORY */}
                  <Card>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Login History</h3>
                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left text-gray-400 pb-3 px-4 sm:px-0 text-xs sm:text-sm">
                                  Time
                                </th>
                                <th className="text-left text-gray-400 pb-3 px-4 sm:px-0 text-xs sm:text-sm">
                                  IP Address
                                </th>
                                <th className="text-left text-gray-400 pb-3 px-4 sm:px-0 text-xs sm:text-sm">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {loginHistory.length > 0 ? (
                                loginHistory.map((h, idx) => (
                                  <tr key={idx} className="border-b border-gray-800">
                                    <td className="py-3 px-4 sm:px-0 text-white text-xs sm:text-sm">
                                      {new Date(h.time).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 sm:px-0 text-gray-300 font-mono text-xs sm:text-sm">
                                      {h.ip}
                                    </td>
                                    <td className="py-3 px-4 sm:px-0">
                                      <span
                                        className={`px-2 py-1 rounded text-xs ${h.status === 'LOGIN_SUCCESS'
                                          ? 'bg-green-500/20 text-green-400'
                                          : 'bg-red-500/20 text-red-400'
                                          }`}
                                      >
                                        {h.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="text-center py-8 text-gray-400 text-sm">
                                    No login history available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )
            }

            {/* TAB CONTENT - Cards */}
            {
              activeTab === 'cards' && (
                <Card>
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                        Your Cards
                      </h3>
                      <Button
                        onClick={() => setShowAddCard(true)}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Card
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {cards.length > 0 ? (
                        cards.map((card) => (
                          <div
                            key={card.id}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-cyan-500/30 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>

                            <div className="relative">
                              <div className="flex justify-between items-start mb-8">
                                <div>
                                  <p className="text-gray-400 text-xs mb-1">
                                    {card.type || 'DEBIT'} CARD
                                  </p>
                                  {card.is_locked && (
                                    <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                                      <Lock className="w-3 h-3" />
                                      Locked
                                    </span>
                                  )}
                                </div>
                                <CreditCard className="w-8 h-8 text-cyan-400" />
                              </div>

                              <p className="text-white font-mono text-xl mb-4 tracking-wider">
                                {card.card_number_masked ||
                                  (card.card_number && card.card_number.length >= 4
                                    ? `**** **** **** ${card.card_number.slice(-4)}`
                                    : '**** **** **** ****')}
                              </p>

                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-gray-500 text-xs">Expires</p>
                                  <p className="text-white text-sm">{card.expiry_date || card.expiry || 'N/A'}</p>
                                </div>
                                <Button
                                  onClick={() => handleLockCard(card.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Lock className="w-4 h-4 mr-1" />
                                  {card.is_locked ? 'Unlock' : 'Lock'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-12">
                          <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-4">No cards linked yet</p>
                          <Button
                            onClick={() => setShowAddCard(true)}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Card
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            }

            {/* TAB CONTENT - Analytics */}
            {
              activeTab === 'analytics' && (
                <Card>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Monthly Expenses by Category</h3>
                    <div className="space-y-4">
                      {monthlyExpenses.length > 0 ? (
                        monthlyExpenses.map((expense, idx) => (
                          <div key={idx} className="bg-slate-800/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: expense.color || '#3b82f6' }}
                                ></div>
                                <span className="text-white">{expense.category || 'Other'}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-cyan-400 font-mono font-bold">
                                  {formatIndianCurrency(expense.amount || 0)}
                                </span>
                                {expense.percentage > 0 && (
                                  <span className="text-gray-400 text-xs ml-2">
                                    ({expense.percentage}%)
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(expense.percentage || 0, 100)}%`,
                                  backgroundColor: expense.color || '#3b82f6'
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-8">No expense data available</p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            }

            {/* TAB CONTENT - Support */}
            {
              activeTab === 'support' && (
                <>
                  <Card className="mb-6">
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white">Support Tickets</h3>
                        <Button
                          onClick={() => setShowCreateTicket(true)}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Ticket
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {tickets.length > 0 ? (
                          tickets.map((ticket) => (
                            <div key={ticket.id} className="bg-slate-800/50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-semibold">{ticket.subject}</h4>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${ticket.status === 'OPEN'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : ticket.status === 'IN_PROGRESS'
                                      ? 'bg-blue-500/20 text-blue-400'
                                      : 'bg-green-500/20 text-green-400'
                                    }`}
                                >
                                  {ticket.status}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm">{ticket.description}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-8">No support tickets</p>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white">Disputes</h3>
                        <Button
                          onClick={() => setShowDisputeModal(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          File Dispute
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {disputes.length > 0 ? (
                          disputes.map((dispute) => (
                            <div key={dispute.id} className="bg-slate-800/50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-white font-semibold">
                                  Transaction: {dispute.transaction_id}
                                </p>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${dispute.status === 'PENDING'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : dispute.status === 'RESOLVED'
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-red-500/20 text-red-400'
                                    }`}
                                >
                                  {dispute.status}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm">
                                {dispute.reason}: {dispute.description}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-8">No disputes filed</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </>
              )
            }
          </div >

          {/* ==================== ALL MODALS ==================== */}

          {/* PAYMENT MODAL */}
          {
            showPayModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <Card className="max-w-2xl w-full bg-slate-900 border-cyan-500/50 my-8">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Send className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      Send Money
                    </h3>

                    {paymentStep === 'form' && (
                      <form onSubmit={handlePayment} className="space-y-4 sm:space-y-5">
                        {/* Transaction Type Selector */}
                        <div>
                          <label className="text-gray-300 text-sm mb-3 block font-semibold">
                            Payment Method
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            {[
                              {
                                value: 'card',
                                label: 'Card',
                                icon: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />,
                                desc: '16 digits'
                              },
                              {
                                value: 'netbanking',
                                label: 'Bank',
                                icon: <Building className="w-4 h-4 sm:w-5 sm:h-5" />,
                                desc: '10-12 digits'
                              },
                              {
                                value: 'upi',
                                label: 'UPI',
                                icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />,
                                desc: 'user@bank'
                              },
                              {
                                value: 'wallet',
                                label: 'Wallet',
                                icon: <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />,
                                desc: '16 digits'
                              }
                            ].map((method) => (
                              <button
                                key={method.value}
                                type="button"
                                onClick={() => {
                                  setPaymentForm({
                                    ...paymentForm,
                                    transaction_type: method.value,
                                    receiver_account: '',
                                    merchant_id: '',
                                    upi_id: ''
                                  });
                                  setSelectedCardForPayment(null);
                                }}
                                className={`p-3 sm:p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${paymentForm.transaction_type === method.value
                                  ? 'border-cyan-500 bg-cyan-500/20'
                                  : 'border-gray-600 bg-slate-800/50 hover:border-gray-500'
                                  }`}
                              >
                                {method.icon}
                                <span className="text-white text-xs font-semibold">{method.label}</span>
                                <span className="text-gray-400 text-xs">{method.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* CARD PAYMENT */}
                        {paymentForm.transaction_type === 'card' && (
                          <>
                            <div>
                              <label className="text-gray-300 text-sm mb-2 block font-semibold">
                                Select Card
                              </label>
                              {cards.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                  {cards.map((card) => (
                                    <button
                                      key={card.id}
                                      type="button"
                                      onClick={() => setSelectedCardForPayment(card)}
                                      className={`p-3 rounded-lg border-2 text-left transition-all ${selectedCardForPayment?.id === card.id
                                        ? 'border-cyan-500 bg-cyan-500/20'
                                        : 'border-gray-600 bg-slate-800/50 hover:border-gray-500'
                                        }`}
                                    >
                                      <p className="text-white font-mono text-sm">
                                        **** {card.card_number?.slice(-4)}
                                      </p>
                                      <p className="text-gray-400 text-xs">{card.type}</p>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-400 text-sm">
                                  No cards available. Add a card first.
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="text-gray-300 text-sm mb-2 block font-semibold">
                                Merchant Account Number <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={paymentForm.merchant_id}
                                onChange={(e) => {
                                  const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 16);
                                  setPaymentForm({ ...paymentForm, merchant_id: cleanValue });
                                }}
                                placeholder="4111111111111111"
                                maxLength={16}
                                required
                                className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono text-lg focus:border-cyan-500 focus:outline-none"
                              />
                              {paymentForm.merchant_id && (
                                <div className="mt-2">
                                  {paymentForm.merchant_id.length === 16 ? (
                                    <p className="text-green-400 text-xs flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Valid 16-digit merchant account
                                    </p>
                                  ) : (
                                    <p className="text-red-400 text-xs flex items-center gap-1">
                                      <XCircle className="w-3 h-3" />
                                      Must be exactly 16 digits ({paymentForm.merchant_id.length}/16)
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* NET BANKING */}
                        {paymentForm.transaction_type === 'netbanking' && (
                          <div>
                            <label className="text-gray-300 text-sm mb-2 block font-semibold">
                              Receiver Account Number <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={paymentForm.receiver_account}
                              onChange={(e) => {
                                const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 16);
                                setPaymentForm({ ...paymentForm, receiver_account: cleanValue });
                              }}
                              placeholder="1000000055"
                              maxLength={16}
                              required
                              className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono text-lg focus:border-cyan-500 focus:outline-none"
                            />
                            {paymentForm.receiver_account && (
                              <p
                                className={`text-xs mt-1 ${paymentForm.receiver_account.length >= 10
                                  ? 'text-green-400'
                                  : 'text-yellow-400'
                                  }`}
                              >
                                {paymentForm.receiver_account.length}/16 digits
                              </p>
                            )}
                          </div>
                        )}

                        {/* UPI */}
                        {paymentForm.transaction_type === 'upi' && (
                          <div>
                            <label className="text-gray-300 text-sm mb-2 block font-semibold">
                              UPI ID <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={paymentForm.upi_id}
                              onChange={(e) =>
                                setPaymentForm({
                                  ...paymentForm,
                                  upi_id: e.target.value.toLowerCase().replace(/[^a-z0-9@.-]/g, '')
                                })
                              }
                              placeholder="user@bank"
                              required
                              className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono text-lg focus:border-cyan-500 focus:outline-none"
                            />
                            {paymentForm.upi_id && (
                              <p
                                className={`text-xs mt-1 ${/^[\w.\-]+@[\w\-]+$/.test(paymentForm.upi_id)
                                  ? 'text-green-400'
                                  : 'text-red-400'
                                  }`}
                              >
                                {/^[\w.\-]+@[\w\-]+$/.test(paymentForm.upi_id)
                                  ? '✓ Valid UPI ID'
                                  : '✗ Must contain @'}
                              </p>
                            )}
                          </div>
                        )}

                        {/* WALLET */}
                        {paymentForm.transaction_type === 'wallet' && (
                          <>
                            <div>
                              <label className="text-gray-300 text-sm mb-2 block font-semibold">
                                Wallet Type
                              </label>
                              <select
                                value={paymentForm.wallet_type}
                                onChange={(e) =>
                                  setPaymentForm({ ...paymentForm, wallet_type: e.target.value })
                                }
                                className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white"
                                required
                              >
                                <option value="">Select</option>
                                <option value="paytm">Paytm</option>
                                <option value="phonepe">PhonePe</option>
                                <option value="googlepay">Google Pay</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-gray-300 text-sm mb-2 block font-semibold">
                                Merchant ID <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={paymentForm.merchant_id}
                                onChange={(e) => {
                                  const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 16);
                                  setPaymentForm({ ...paymentForm, merchant_id: cleanValue });
                                }}
                                placeholder="1234567890123456"
                                maxLength={16}
                                required
                                className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono text-lg focus:border-cyan-500 focus:outline-none"
                              />
                            </div>
                          </>
                        )}

                        {/* Amount */}
                        <div>
                          <label className="text-gray-300 text-sm mb-2 block font-semibold">
                            Amount (₹) <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={paymentForm.amount}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                setPaymentForm({ ...paymentForm, amount: value });
                              }
                            }}
                            placeholder="1000.00"
                            required
                            className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono text-xl focus:border-cyan-500 focus:outline-none"
                          />
                          {paymentForm.amount && (
                            <p className="text-cyan-400 text-xs mt-1 font-semibold">
                              {formatIndianCurrency(parseFloat(paymentForm.amount) || 0)}
                            </p>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                          <Button
                            type="submit"
                            disabled={loading || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                          >
                            {loading ? 'Processing...' : 'Send Payment'}
                          </Button>
                          <Button
                            type="button"
                            onClick={resetPaymentModal}
                            variant="ghost"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* OTP Step */}
                    {paymentStep === 'otp' && (
                      <div className="space-y-4">
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                          <p className="text-yellow-200 text-sm">
                            OTP sent to your registered email. Please enter it below.
                          </p>
                        </div>

                        <Input
                          type="text"
                          value={paymentOtp}
                          onChange={(e) =>
                            setPaymentOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="text-center tracking-widest font-mono text-xl"
                        />

                        <Button
                          onClick={handleResendOtp}
                          variant="ghost"
                          size="sm"
                          className="w-full text-cyan-400 hover:text-cyan-300"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend OTP
                        </Button>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleVerifyOtp}
                            disabled={paymentOtp.length !== 6 || loading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                          </Button>
                          <Button onClick={resetPaymentModal} variant="ghost" className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 2FA Verification Step */}
                    {paymentStep === '2fa' && (
                      <div className="space-y-4">
                        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
                          <p className="text-purple-200 text-sm">
                            Security Check: Please enter the 6-digit code from your Authenticator App.
                          </p>
                        </div>

                        <Input
                          type="text"
                          value={twoFACode}
                          onChange={(e) =>
                            setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="000 000"
                          maxLength={6}
                          className="text-center tracking-widest font-mono text-xl"
                        />

                        <div className="flex gap-3">
                          <Button
                            onClick={handleVerify2FATransaction}
                            disabled={twoFACode.length !== 6 || loading}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            {loading ? 'Verifying...' : 'Verify Code'}
                          </Button>
                          <Button onClick={resetPaymentModal} variant="ghost" className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Result Step */}
                    {paymentStep === 'result' && (
                      <div className="text-center space-y-4">
                        {paymentResult?.status === 'SUCCESS' ? (
                          <>
                            <div className="relative w-24 h-24 mx-auto mb-6">
                              {/* Google Pay Style Animation */}
                              <div className="absolute inset-0 bg-green-500 rounded-full gpay-circle"></div>
                              <svg className="absolute inset-0 w-full h-full p-6 text-white gpay-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>

                            <h4 className="text-xl sm:text-2xl font-bold text-green-400 animate-slide-in">
                              Payment Successful!
                            </h4>
                            <p className="text-gray-300 text-sm sm:text-base">
                              {formatIndianCurrency(parseFloat(paymentForm.amount))} sent successfully
                            </p>
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                              <p className="text-gray-400 text-sm">New Balance</p>
                              <p className="text-white text-xl sm:text-2xl font-bold">
                                {formatIndianCurrency(paymentResult?.new_balance || user?.balance || 0)}
                              </p>
                            </div>
                            {/* RISK SCORE DISPLAY */}
                            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/30 rounded-lg border border-white/5">
                              <span className="text-gray-400 text-xs uppercase tracking-wider">Security Score</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${paymentResult?.risk_score > 0.6 ? 'bg-red-500' : paymentResult?.risk_score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                <span className={`font-mono font-bold ${paymentResult?.risk_score > 0.6 ? 'text-red-400' : paymentResult?.risk_score > 0.3 ? 'text-yellow-400' : 'text-green-400'}`}>
                                  {paymentResult?.risk_score?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : paymentResult?.status === 'BLOCKED' ? (
                          <>
                            <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto" />
                            <h4 className="text-xl sm:text-2xl font-bold text-red-400">
                              Transaction Blocked
                            </h4>
                            <p className="text-gray-300 text-sm sm:text-base">
                              {paymentResult?.message}
                            </p>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                              <p className="text-red-200 text-sm">
                                This transaction was flagged by our fraud detection system. If you
                                believe this is an error, please contact support.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto" />
                            <h4 className="text-xl sm:text-2xl font-bold text-red-400">
                              Payment Failed
                            </h4>
                            <p className="text-gray-300 text-sm sm:text-base">
                              {paymentResult?.message}
                            </p>
                          </>
                        )}

                        <Button onClick={resetPaymentModal} className="w-full bg-cyan-600 hover:bg-cyan-700">
                          Close
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )
          }

          {/* CONFIRMATION MODAL */}
          {
            showConfirmModal && confirmAction && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full bg-slate-900 border-orange-500/50">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl font-bold text-white mb-4">{confirmAction.title}</h3>
                    <p className="text-gray-300 mb-6">{confirmAction.message}</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleConfirm}
                        className={`flex-1 ${confirmAction.type === 'danger'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                          }`}
                      >
                        Confirm
                      </Button>
                      <Button
                        onClick={() => {
                          setShowConfirmModal(false);
                          setConfirmAction(null);
                        }}
                        variant="ghost"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )
          }

          {/* 2FA SETUP MODAL */}
          {
            show2FAModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full bg-slate-900 border-purple-500/50">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Key className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      Enable 2FA
                    </h3>

                    {tfaStep === 'generate' && (
                      <div className="text-center">
                        <p className="text-gray-300 mb-4">Loading...</p>
                      </div>
                    )}

                    {tfaStep === 'verify' && (
                      <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-blue-200 text-sm">
                            Two-Factor Authentication adds an extra layer of security to your account.
                          </p>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">Secret Key:</p>
                          <p className="text-white font-mono text-sm break-all">{tfaSecret}</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                          <QRCodeSVG value={tfaUri} size={200} className="mx-auto" />
                        </div>

                        <p className="text-gray-300 text-sm text-center">
                          Scan the QR code with Google Authenticator or enter the secret key manually.
                        </p>

                        <Input
                          type="text"
                          value={tfaVerifyCode}
                          onChange={(e) =>
                            setTfaVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="000000"
                          maxLength={6}
                          className="text-center tracking-widest font-mono text-xl"
                        />

                        <div className="flex gap-3">
                          <Button
                            onClick={handleVerify2FA}
                            disabled={tfaVerifyCode.length !== 6}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            Verify & Enable
                          </Button>
                          <Button
                            onClick={() => {
                              setShow2FAModal(false);
                              setTfaStep('generate');
                            }}
                            variant="ghost"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )
          }

          {/* DISABLE 2FA MODAL */}
          {
            showDisable2FAModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full bg-slate-900 border-red-500/50">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Disable 2FA</h3>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                      <p className="text-orange-200 text-sm">
                        ⚠️ Disabling 2FA will reduce your account security. Please enter your password
                        to confirm.
                      </p>
                    </div>

                    <Input
                      label="Password"
                      type="password"
                      value={disable2FAPassword}
                      onChange={(e) => setDisable2FAPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      icon={<Lock className="w-4 h-4" />}
                    />

                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={handleDisable2FA}
                        disabled={!disable2FAPassword}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Disable 2FA
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDisable2FAModal(false);
                          setDisable2FAPassword('');
                        }}
                        variant="ghost"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )
          }

          {/* CHANGE PASSWORD MODAL */}
          {
            showChangePasswordModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full bg-slate-900 border-cyan-500/50">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Key className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      Change Password
                    </h3>

                    <form
                      onSubmit={handleChangePassword}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Current Password</label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? 'text' : 'password'}
                            value={changePasswordForm.old_password}
                            onChange={(e) =>
                              setChangePasswordForm({
                                ...changePasswordForm,
                                old_password: e.target.value
                              })
                            }
                            placeholder="Enter current password"
                            required
                            className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white pr-12 focus:border-cyan-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={changePasswordForm.new_password}
                            onChange={(e) =>
                              setChangePasswordForm({
                                ...changePasswordForm,
                                new_password: e.target.value
                              })
                            }
                            placeholder="Enter new password"
                            required
                            className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white pr-12 focus:border-cyan-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={changePasswordForm.confirm_password}
                            onChange={(e) =>
                              setChangePasswordForm({
                                ...changePasswordForm,
                                confirm_password: e.target.value
                              })
                            }
                            placeholder="Confirm new password"
                            required
                            className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white pr-12 focus:border-cyan-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {changePasswordForm.new_password &&
                        changePasswordForm.confirm_password &&
                        changePasswordForm.new_password !== changePasswordForm.confirm_password && (
                          <p className="text-red-400 text-sm">Passwords do not match</p>
                        )}

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                          type="submit"
                          disabled={
                            loading ||
                            !changePasswordForm.old_password ||
                            !changePasswordForm.new_password ||
                            changePasswordForm.new_password !== changePasswordForm.confirm_password
                          }
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowChangePasswordModal(false);
                            setChangePasswordForm({
                              old_password: '',
                              new_password: '',
                              confirm_password: ''
                            });
                            setShowOldPassword(false);
                            setShowNewPassword(false);
                            setShowConfirmPassword(false);
                          }}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            )
          }

          {/* UNFREEZE ACCOUNT MODAL */}
          {
            showUnfreezeModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full bg-slate-900 border-green-500/50">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Unlock className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      Unfreeze Account
                    </h3>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                      <p className="text-orange-200 text-sm">
                        Enter your password to unfreeze your account and resume transactions.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUnfreezeAccount();
                      }}
                      className="space-y-4"
                    >
                      <Input
                        label="Password"
                        type="password"
                        value={unfreezePassword}
                        onChange={(e) => setUnfreezePassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        icon={<Lock className="w-4 h-4" />}
                      />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          type="submit"
                          disabled={loading || !unfreezePassword}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {loading ? 'Unfreezing...' : 'Unfreeze Account'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowUnfreezeModal(false);
                            setUnfreezePassword('');
                          }}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            )
          }

          {/* ADD CARD MODAL */}
          {
            showAddCard && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <Card className="max-w-md w-full bg-slate-900 border-cyan-500/50 my-8">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      Add New Card
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddCard();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Card Number</label>
                        <input
                          type="text"
                          value={newCard.card_number}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setNewCard({ ...newCard, card_number: value });
                          }}
                          placeholder="1234567890123456"
                          maxLength={16}
                          required
                          className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono text-lg focus:border-cyan-500 focus:outline-none"
                        />
                        {newCard.card_number && (
                          <p
                            className={`text-xs mt-1 ${newCard.card_number.length === 16 ? 'text-green-400' : 'text-yellow-400'
                              }`}
                          >
                            {newCard.card_number.length}/16 digits
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-300 text-sm mb-2 block">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={newCard.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setNewCard({ ...newCard, expiry: value.slice(0, 5) });
                            }}
                            placeholder="12/25"
                            maxLength={5}
                            required
                            className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-gray-300 text-sm mb-2 block">CVV</label>
                          <input
                            type="text"
                            value={newCard.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                              setNewCard({ ...newCard, cvv: value });
                            }}
                            placeholder="123"
                            maxLength={3}
                            required
                            className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Card Type</label>
                        <select
                          value={newCard.card_type}
                          onChange={(e) => setNewCard({ ...newCard, card_type: e.target.value })}
                          className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="DEBIT">Debit Card</option>
                          <option value="CREDIT">Credit Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Card PIN (4 digits)</label>
                        <input
                          type="password"
                          value={newCard.pin}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setNewCard({ ...newCard, pin: value });
                          }}
                          placeholder="****"
                          maxLength={4}
                          required
                          className="w-full bg-slate-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-200 text-xs">
                          Your card information is encrypted and stored securely.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                          type="submit"
                          disabled={
                            loading ||
                            newCard.card_number.length !== 16 ||
                            !newCard.expiry ||
                            newCard.cvv.length !== 3 ||
                            newCard.pin.length !== 4
                          }
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                        >
                          {loading ? 'Adding...' : 'Add Card'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowAddCard(false);
                            setNewCard({
                              card_number: '',
                              expiry: '',
                              cvv: '',
                              card_type: 'DEBIT',
                              pin: ''
                            });
                          }}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            )
          }

          {/* TRAVEL NOTICE MODAL */}
          {
            showTravelNotice && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full bg-slate-900 border-blue-500/50">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      Travel Notice
                    </h3>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <p className="text-blue-200 text-sm">
                        Inform us about your travel plans to prevent transactions from being flagged as
                        fraudulent.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleTravelNotice();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Country Code</label>
                        <select
                          value={travelCountry}
                          onChange={(e) => setTravelCountry(e.target.value)}
                          required
                          className="w-full bg-slate-800 border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select Country</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                          <option value="SG">Singapore</option>
                          <option value="AE">United Arab Emirates</option>
                          <option value="FR">France</option>
                          <option value="DE">Germany</option>
                          <option value="JP">Japan</option>
                          <option value="TH">Thailand</option>
                        </select>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                          type="submit"
                          disabled={loading || !travelCountry}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? 'Submitting...' : 'Submit Notice'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowTravelNotice(false);
                            setTravelCountry('');
                          }}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            )
          }

          {/* DISPUTE MODAL */}
          {
            showDisputeModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <Card className="max-w-md w-full bg-slate-900 border-red-500/50 my-8">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                      File Dispute
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleFileDispute();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Transaction ID</label>
                        <input
                          type="text"
                          value={disputeForm.transaction_id}
                          onChange={(e) =>
                            setDisputeForm({ ...disputeForm, transaction_id: e.target.value })
                          }
                          placeholder="Enter transaction ID"
                          required
                          className="w-full bg-slate-800 border border-red-500/30 rounded-lg px-4 py-3 text-white font-mono focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Reason</label>
                        <select
                          value={disputeForm.reason}
                          onChange={(e) =>
                            setDisputeForm({ ...disputeForm, reason: e.target.value })
                          }
                          className="w-full bg-slate-800 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                        >
                          <option value="FRAUD">Fraudulent Transaction</option>
                          <option value="UNAUTHORIZED">Unauthorized Transaction</option>
                          <option value="NOT_RECEIVED">Service/Product Not Received</option>
                          <option value="DUPLICATE">Duplicate Charge</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Description</label>
                        <textarea
                          value={disputeForm.description}
                          onChange={(e) =>
                            setDisputeForm({ ...disputeForm, description: e.target.value })
                          }
                          placeholder="Please provide details about your dispute..."
                          rows={4}
                          required
                          className="w-full bg-slate-800 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-200 text-xs">
                          Disputes are reviewed within 5-7 business days. You will be notified via email
                          about the outcome.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          {loading ? 'Filing...' : 'File Dispute'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowDisputeModal(false);
                            setDisputeForm({ transaction_id: '', reason: 'FRAUD', description: '' });
                          }}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            )
          }

          {/* CREATE TICKET MODAL */}
          {
            showCreateTicket && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <Card className="max-w-md w-full bg-slate-900 border-yellow-500/50 my-8">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                      Create Support Ticket
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateTicket();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Subject</label>
                        <input
                          type="text"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                          placeholder="Brief description of your issue"
                          required
                          className="w-full bg-slate-800 border border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Description</label>
                        <textarea
                          value={newTicket.description}
                          onChange={(e) =>
                            setNewTicket({ ...newTicket, description: e.target.value })
                          }
                          placeholder="Please provide detailed information about your issue..."
                          rows={5}
                          required
                          className="w-full bg-slate-800 border border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                        >
                          {loading ? 'Creating...' : 'Create Ticket'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowCreateTicket(false);
                            setNewTicket({ subject: '', description: '' });
                          }}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            )
          }

          {/* SECURITY CHECK MODAL (2FA SUGGESTION) */}
          {
            showSecurityCheck && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                <Card className="max-w-md w-full bg-slate-900 border-cyan-500/50 shadow-2xl relative overflow-hidden">
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                  <div className="p-6 relative z-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                      <ShieldAlert className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">Secure Your Account</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      We noticed you haven't enabled <span className="text-cyan-400 font-semibold">2-Factor Authentication</span> yet.
                      Enable it now to protect your account from unauthorized access.
                    </p>

                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          setShowSecurityCheck(false);
                          setShow2FAModal(true); // Open the actual 2FA setup modal
                          sessionStorage.setItem('hasSeen2FASuggestion', 'true');
                        }}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-6 text-lg shadow-lg shadow-cyan-900/20"
                      >
                        Enable 2FA Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      <button
                        onClick={() => {
                          setShowSecurityCheck(false);
                          sessionStorage.setItem('hasSeen2FASuggestion', 'true');
                        }}
                        className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
                      >
                        Remind me later
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            )
          }

          {/* SESSION EXPIRY MODAL */}
          {
            showSessionExpired && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
                <Card className="max-w-sm w-full bg-slate-900 border-red-500/50 shadow-2xl">
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                      <LogOut className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Session Expired</h3>
                    <p className="text-gray-400 mb-6">
                      Your session has timed out for security reasons. Please log in again to continue.
                    </p>
                    <Button
                      onClick={() => {
                        setShowSessionExpired(false);
                        window.location.href = '/login';
                      }}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Log In Again
                    </Button>
                  </div>
                </Card>
              </div>
            )
          }
        </div>
      </div>
    </div >
  );
};
export default UserDashboard;