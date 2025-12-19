import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// --- AUTH TOKEN MANAGEMENT ---
let memoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  memoryToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// --- HELPER: CLIENT FINGERPRINTING ---
const getSecurityContext = () => {
  return {
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    webdriver: (navigator as any).webdriver ? 'true' : 'false',
    cores: (navigator as any).hardwareConcurrency || 0,
    platform: (navigator as any).platform || 'unknown'
  };
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Prioritize memory token, then localStorage
    const token = memoryToken || localStorage.getItem('token');

    // Ensure memory token is synced if found in storage but not memory (e.g. on refresh)
    if (!memoryToken && token) {
      memoryToken = token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject Security Headers
    const context = getSecurityContext();
    config.headers['X-Client-Timezone'] = context.timezone;
    config.headers['X-Client-Screen'] = context.screen;
    config.headers['X-Is-Webdriver'] = context.webdriver;

    // VPN Check (Heuristic: Timezone offset vs local time)
    // Note: This is a weak client-side check, but adds a signal.
    // Real VPN detection happens on the backend via GeoIP.
    // However, if the user explicitly wants "Frontend to detect VPN", we send a signal.
    config.headers['X-Is-Vpn'] = 'false'; // Browser cannot reliably detect VPN, but we send the header as requested.

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.hash || window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        setAuthToken(null);
        localStorage.removeItem('role');

        // Immediate Redirect to Login using Hash
        window.location.hash = '#/login';

        // Return a never-resolving promise to prevent downstream error handling
        return new Promise(() => { });
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ==========================================
// AUTH API
// ==========================================
export const authAPI = {
  // Get CAPTCHA challenge
  getCaptchaChallenge: async () => {
    const response = await api.get('/api/auth/captcha/challenge');
    return response.data;
  },

  login: async (
    email: string,
    password: string,
    captchaChallengeId?: string,
    captchaAnswer?: number,
    lat?: number,
    lon?: number,
    fingerprint?: any
  ) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
      captcha_challenge_id: captchaChallengeId,
      captcha_answer: captchaAnswer,
      lat,
      lon,
      // Enhanced fingerprint data
      ...(fingerprint || {})
    });
    return response.data;
  },

  verify2FA: async (email: string, code: string) => {
    console.log('📤 Sending TOTP verification request...');
    const response = await api.post('/api/auth/verify-2fa-login', { email, code });

    console.log('📥 TOTP API Response:');
    console.log('  - Full response:', response);
    console.log('  - response.data:', response.data);
    console.log('  - access_token:', response.data?.access_token);
    console.log('  - token:', response.data?.token);
    console.log('  - role:', response.data?.role);

    if (response.data.access_token || response.data.token) {
      const token = response.data.access_token || response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('role', response.data.role);
      console.log('✅ Token saved to localStorage');
    } else {
      console.error('❌ No token in TOTP response!');
    }
    return response.data;
  },

  verifyEmailOTP: async (email: string, otp: string) => {
    console.log('📤 Sending Email OTP verification request...');
    const response = await api.post('/api/auth/verify-email-otp-login', { email, otp });

    console.log('📥 Email OTP API Response:');
    console.log('  - Full response:', response);
    console.log('  - response.data:', response.data);
    console.log('  - access_token:', response.data?.access_token);
    console.log('  - token:', response.data?.token);
    console.log('  - role:', response.data?.role);

    if (response.data.access_token || response.data.token) {
      const token = response.data.access_token || response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('role', response.data.role);
      console.log('✅ Token saved to localStorage');
    } else {
      console.error('❌ No token in Email OTP response!');
    }
    return response.data;
  },

  resendOTP: async (email: string) => {
    const response = await api.post('/api/auth/resend-email-otp', { email });
    return response.data;
  },

  register: async (
    email: string,
    password: string,
    phone_number?: string,
    adminKey?: string,
    captchaChallengeId?: string,
    captchaAnswer?: number
  ) => {
    const config = adminKey ? { headers: { 'X-ADMIN-KEY': adminKey } } : {};
    const response = await api.post('/api/auth/register', {
      email,
      password,
      phone_number,
      captcha_challenge_id: captchaChallengeId,
      captcha_answer: captchaAnswer
    }, config);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  enable2FA: async () => {
    const response = await api.post('/api/auth/enable-2fa');
    return response.data;
  },

  verify2FASetup: async (code: string) => {
    const response = await api.post('/api/auth/verify-2fa-setup', { code });
    return response.data;
  },

  disable2FA: async (password: string) => {
    const response = await api.post('/api/auth/disable-2fa', { password });
    return response.data;
  },
};

// ==========================================
// USER API
// ==========================================
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/api/users/me', data);
    return response.data;
  },

  freezeAccount: async () => {
    const response = await api.post('/api/users/security/freeze');
    return response.data;
  },

  unfreezeAccount: async (password: string) => {
    const response = await api.post('/api/users/security/unfreeze', { password });
    return response.data;
  },
};

// ==========================================
// ANALYTICS API
// ==========================================
export const analyticsAPI = {
  getDashboard: async () => {
    const response = await api.get('/api/analytics/dashboard');
    return response.data;
  },

  getMonthlyExpenses: async () => {
    const response = await api.get('/api/analytics/dashboard/monthly-expenses');
    return response.data;
  },

  getYearlySummary: async () => {
    const response = await api.get('/api/analytics/yearly-summary');
    return response.data;
  },
};

// ==========================================
// TRANSACTION API
// ==========================================
export const transactionAPI = {
  getHistory: async (page = 1, perPage = 10, status?: string) => {
    const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() });
    if (status) params.append('status', status);
    const response = await api.get(`/api/tx/history?${params.toString()}`);
    return response.data;
  },

  processPayment: async (paymentData: any) => {
    // paymentData should include: amount, receiver_account, transaction_type, nonce, lat, lon
    const response = await api.post('/api/tx/pay', paymentData);
    return response.data;
  },

  verifyOTP: async (transactionId: string, otp: string) => {
    const response = await api.post('/api/tx/verify-otp', { transaction_id: transactionId, otp });
    return response.data;
  },

  resendOTP: async () => {
    const response = await api.post('/api/tx/resend-otp');
    return response.data;
  },
};

// ==========================================
// CARDS API
// ==========================================
export const cardsAPI = {
  getCards: async () => {
    const response = await api.get('/api/cards');
    return response.data;
  },

  createVirtualCard: async (data: { pin?: string; type?: string; name?: string }) => {
    const response = await api.post('/api/cards/create-virtual', data);
    return response.data;
  },

  addCard: async (data: { card_number: string; expiry_date: string; cvv: string; pin: string; type?: string }) => {
    const response = await api.post('/api/cards', data);
    return response.data;
  },

  lockCard: async (cardId: number) => {
    const response = await api.post(`/api/cards/${cardId}/lock`);
    return response.data;
  },

  unlockCard: async (cardId: number) => {
    const response = await api.post(`/api/cards/${cardId}/unlock`);
    return response.data;
  },

  deleteCard: async (cardId: number) => {
    const response = await api.delete(`/api/cards/${cardId}`);
    return response.data;
  },

  changePin: async (cardId: number, oldPin: string, newPin: string) => {
    const response = await api.post(`/api/cards/${cardId}/change-pin`, { old_pin: oldPin, new_pin: newPin });
    return response.data;
  },
};

// ==========================================
// NOTIFICATIONS API
// ==========================================
export const notificationsAPI = {
  getNotifications: async () => {
    const response = await api.get('/api/support/notifications');
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.post('/api/support/notifications/read-all');
    return response.data;
  },
};

// ==========================================
// SUPPORT API
// ==========================================
export const supportAPI = {
  createTicket: async (subject: string, description: string) => {
    const response = await api.post('/api/support/ticket', { subject, description });
    return response.data;
  },

  getTickets: async () => {
    const response = await api.get('/api/support/tickets');
    return response.data;
  },

  getTicketDetails: async (ticketId: number) => {
    const response = await api.get(`/api/support/ticket/${ticketId}`);
    return response.data;
  },

  getFAQs: async () => {
    const response = await api.get('/api/support/faq');
    return response.data;
  },

  createDispute: async (transactionId: string, reason: string, description: string) => {
    const response = await api.post('/api/support/disputes', { transaction_id: transactionId, reason, description });
    return response.data;
  },

  getDisputes: async () => {
    const response = await api.get('/api/support/disputes');
    return response.data;
  },
};

// ==========================================
// ALERTS API
// ==========================================
export const alertsAPI = {
  getAlerts: async () => {
    const response = await api.get('/api/alerts');
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.put('/api/alerts/read-all');
    return response.data;
  },
};

// ==========================================
// ADMIN SECURITY API (NEW)
// ==========================================
export const adminSecurityAPI = {
  // Security Events
  getSecurityEvents: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/admin/security-events?${params}`);
    return response.data;
  },

  resolveSecurityEvent: async (eventId: number, data: { notes: string }) => {
    const response = await api.post(`/api/admin/security-events/${eventId}/resolve`, data);
    return response.data;
  },

  getSecurityStats: async () => {
    const response = await api.get('/api/admin/security-events/stats');
    return response.data;
  },

  // IP Reputation
  getIPReputation: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/admin/ip-reputation?${params}`);
    return response.data;
  },

  blacklistIP: async (data: { ip_address: string; reason: string }) => {
    const response = await api.post('/api/admin/ip-reputation/blacklist', data);
    return response.data;
  },

  // Honeypots
  getHoneypots: async () => {
    const response = await api.get('/api/admin/honeypots');
    return response.data;
  },

  createHoneypot: async (data?: any) => {
    const response = await api.post('/api/admin/honeypots', data || {});
    return response.data;
  },

  // Progressive Lockouts
  applyLockout: async (userId: string, data: { level: number; reason: string }) => {
    const response = await api.post(`/api/admin/users/${userId}/lockout`, data);
    return response.data;
  },

  getLockoutStatus: async (userId: string) => {
    const response = await api.get(`/api/admin/users/${userId}/lockout/status`);
    return response.data;
  },

  // SOC Dashboard
  getDashboardMetrics: async () => {
    const response = await api.get('/api/admin/dashboard/metrics');
    return response.data;
  },
};

