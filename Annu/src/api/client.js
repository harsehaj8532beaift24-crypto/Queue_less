import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

function getAuthHeaders() {
  const token = localStorage.getItem('queueless_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API] Request failed on ${endpoint}:`, err.message);
    throw err;
  }
}

// Authentication API
export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateProfile: (userData) =>
    request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),
  changePassword: (passwordData) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
  getDemoAccounts: () => request('/auth/demo-accounts'),
};

// Businesses & Venues API
export const businessApi = {
  getAll: (category = 'all', search = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    return request(`/businesses?${params.toString()}`);
  },
  getById: (id) => request(`/businesses/${id}`),
};

// Queues API
export const queueApi = {
  getQueues: (businessId) => {
    const query = businessId ? `?businessId=${businessId}` : '';
    return request(`/queues${query}`);
  },
  getStatus: (queueId) => request(`/queues/${queueId}/status`),
  join: (queueId, bookingData) =>
    request(`/queues/${queueId}/join`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  callNext: (queueId) =>
    request(`/queues/${queueId}/next`, {
      method: 'POST',
    }),
  updateCounters: (queueId, activeCounters) =>
    request(`/queues/${queueId}/counters`, {
      method: 'PATCH',
      body: JSON.stringify({ activeCounters }),
    }),
};

// Tokens API
export const tokenApi = {
  getMyTokens: (phone = '') => {
    const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    return request(`/tokens/my${query}`);
  },
  getBusinessTokens: (businessId) => request(`/tokens/business/${businessId}`),
  cancel: (tokenId) =>
    request(`/tokens/${tokenId}/cancel`, {
      method: 'PATCH',
    }),
  pushBack: (tokenId, delayMins = 10) =>
    request(`/tokens/${tokenId}/pushback`, {
      method: 'PATCH',
      body: JSON.stringify({ delayMins }),
    }),
  updateStatus: (tokenId, status) =>
    request(`/tokens/${tokenId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  verifyQR: (payload) =>
    request('/qr/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// QR Verification & Queue Action API
export const qrApi = {
  verify: (payload) =>
    request('/qr/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  viewPublic: (ref) => request(`/qr/view/${encodeURIComponent(ref)}`),
  executeAction: (tokenId, action, businessId) =>
    request('/qr/action', {
      method: 'POST',
      body: JSON.stringify({ tokenId, action, businessId }),
    }),
};

// Analytics API
export const analyticsApi = {
  getOverview: (businessId) => request(`/analytics/overview?businessId=${businessId}`),
};

// Notifications API
export const notificationApi = {
  getMy: () => request('/notifications/my'),
  clearAll: () => request('/notifications/clear', { method: 'DELETE' }),
};

// Real-Time Socket.IO Client Factory
let socketInstance = null;
export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}
