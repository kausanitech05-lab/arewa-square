/**
 * ═══════════════════════════════════════════════════════
 *   AREWA SQUARE — Frontend API Connector
 *   Include this file in every HTML page:
 *   <script src="./api.js"></script>
 *
 *   Provides: AS.auth, AS.sellers, AS.products,
 *             AS.orders, AS.admin, AS.token, AS.logout
 *
 *   Built by KAUSANITECH | © AREWA SQUARE 2026
 * ═══════════════════════════════════════════════════════
 */

const AS = (function () {

  // ── Base URL — change this once you deploy to Railway ──
  const BASE_URL = 'https://your-api.railway.app/api';
  // For local development use: 'http://localhost:5000/api'

  // ══════════════════════════════════════════════
  //   CORE FETCH HELPER
  // ══════════════════════════════════════════════
  async function request(method, path, body = null, isFormData = false) {
    const token = localStorage.getItem('as_token');
    const headers = {};

    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (token)       headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = isFormData ? body : JSON.stringify(body);

    try {
      const res  = await fetch(`${BASE_URL}${path}`, options);
      const data = await res.json();

      if (!res.ok) {
        // Session expired — redirect to login
        if (res.status === 401) {
          AS.logout();
          return { success: false, message: 'Session expired. Please log in again.' };
        }
        return { success: false, message: data.message || 'Something went wrong.' };
      }

      return data;
    } catch (err) {
      console.error('API error:', err);
      return { success: false, message: 'Connection error. Please check your internet.' };
    }
  }

  // ══════════════════════════════════════════════
  //   SESSION HELPERS
  // ══════════════════════════════════════════════
  function getToken()  { return localStorage.getItem('as_token'); }
  function getRole()   { return localStorage.getItem('as_role');  }
  function getUser()   {
    try { return JSON.parse(localStorage.getItem('as_user')); }
    catch { return null; }
  }
  function getSeller() {
    try { return JSON.parse(localStorage.getItem('as_seller')); }
    catch { return null; }
  }

  function setSession(data) {
    if (data.token)  localStorage.setItem('as_token',  data.token);
    if (data.role)   localStorage.setItem('as_role',   data.role);
    if (data.user)   localStorage.setItem('as_user',   JSON.stringify(data.user));
    if (data.seller) localStorage.setItem('as_seller', JSON.stringify(data.seller));
  }

  function logout() {
    ['as_token', 'as_role', 'as_user', 'as_seller'].forEach(k => localStorage.removeItem(k));
    window.location.href = 'auth.html';
  }

  // ══════════════════════════════════════════════
  //   AUTH
  // ══════════════════════════════════════════════
  const auth = {

    /**
     * Register a buyer
     * @param {{ fullName, email, phone, password, state, city }} data
     */
    async registerBuyer(data) {
      const res = await request('POST', '/auth/register', { ...data, role: 'buyer' });
      if (res.success) setSession(res);
      return res;
    },

    /**
     * Register a seller — uses FormData for file uploads
     * @param {FormData} formData  — must include govId and shopPhoto files
     */
    async registerSeller(formData) {
      formData.append('role', 'seller');
      return await request('POST', '/auth/register', formData, true);
    },

    /**
     * Login any role
     * @param {{ email, password }} data
     */
    async login(data) {
      const res = await request('POST', '/auth/login', data);
      if (res.success) setSession(res);
      return res;
    },

    /** Redirect to correct dashboard based on role */
    redirectByRole(role) {
      const map = {
        admin:  'admin.html',
        seller: 'seller-dashboard.html',
        buyer:  'buyer-dashboard.html',
      };
      window.location.href = map[role] || 'index.html';
    },

    /** Send forgot password email */
    async forgotPassword(email) {
      return await request('POST', '/auth/forgot-password', { email });
    },

    /** Reset password with token from URL */
    async resetPassword(token, password) {
      return await request('POST', `/auth/reset-password/${token}`, { password });
    },

    /** Get current user profile */
    async me() {
      return await request('GET', '/auth/me');
    },
  };

  // ══════════════════════════════════════════════
  //   SELLERS
  // ══════════════════════════════════════════════
  const sellers = {

    /**
     * Browse all approved sellers
     * @param {{ category?, state?, search?, page? }} params
     */
    async getAll(params = {}) {
      const qs = new URLSearchParams(params).toString();
      return await request('GET', `/sellers${qs ? '?' + qs : ''}`);
    },

    /** Get single seller + their products */
    async getById(id) {
      return await request('GET', `/sellers/${id}`);
    },

    /** Update own seller profile */
    async updateProfile(data) {
      return await request('PUT', '/sellers/profile', data);
    },
  };

  // ══════════════════════════════════════════════
  //   PRODUCTS
  // ══════════════════════════════════════════════
  const products = {

    /**
     * Browse products (public)
     * @param {{ category?, search?, sellerId?, page? }} params
     */
    async getAll(params = {}) {
      const qs = new URLSearchParams(params).toString();
      return await request('GET', `/products${qs ? '?' + qs : ''}`);
    },

    /** Get seller's own products */
    async getMine() {
      return await request('GET', '/products/mine');
    },

    /** Get single product */
    async getById(id) {
      return await request('GET', `/products/${id}`);
    },

    /**
     * Add product — uses FormData for images
     * @param {FormData} formData — name, price, category, description, images[]
     */
    async add(formData) {
      return await request('POST', '/products', formData, true);
    },

    /**
     * Edit product
     * @param {string} id
     * @param {FormData|object} data
     */
    async update(id, data) {
      const isForm = data instanceof FormData;
      return await request('PUT', `/products/${id}`, data, isForm);
    },

    /** Delete (soft) product */
    async delete(id) {
      return await request('DELETE', `/products/${id}`);
    },
  };

  // ══════════════════════════════════════════════
  //   ORDERS
  // ══════════════════════════════════════════════
  const orders = {

    /**
     * Buyer places order
     * @param {{ sellerId, items: [{name,price,quantity,icon}], note? }} data
     */
    async place(data) {
      return await request('POST', '/orders', data);
    },

    /** Buyer's own order history */
    async getMine() {
      return await request('GET', '/orders/mine');
    },

    /** Seller's incoming orders */
    async getSeller(status = '') {
      const qs = status ? `?status=${status}` : '';
      return await request('GET', `/orders/seller${qs}`);
    },

    /** Seller confirms order */
    async confirm(orderId) {
      return await request('PUT', `/orders/${orderId}/confirm`);
    },

    /** Seller marks order complete */
    async complete(orderId) {
      return await request('PUT', `/orders/${orderId}/complete`);
    },

    /** Cancel order */
    async cancel(orderId, reason = '') {
      return await request('PUT', `/orders/${orderId}/cancel`, { reason });
    },
  };

  // ══════════════════════════════════════════════
  //   ADMIN
  // ══════════════════════════════════════════════
  const admin = {

    /** Platform stats */
    async getStats() {
      return await request('GET', '/admin/stats');
    },

    /** Seller applications */
    async getApplications(status = 'pending') {
      return await request('GET', `/admin/applications?status=${status}`);
    },

    /** Approve seller application */
    async approveApplication(id) {
      return await request('PUT', `/admin/applications/${id}/approve`);
    },

    /** Reject seller application */
    async rejectApplication(id, reason) {
      return await request('PUT', `/admin/applications/${id}/reject`, { reason });
    },

    /** Get all sellers */
    async getSellers() {
      return await request('GET', '/admin/sellers');
    },

    /** Suspend seller */
    async suspendSeller(id) {
      return await request('PUT', `/admin/sellers/${id}/suspend`);
    },

    /** Reactivate seller */
    async reactivateSeller(id) {
      return await request('PUT', `/admin/sellers/${id}/reactivate`);
    },

    /** Permanently remove seller */
    async removeSeller(id) {
      return await request('DELETE', `/admin/sellers/${id}`);
    },

    /** Get all buyers */
    async getBuyers() {
      return await request('GET', '/admin/buyers');
    },

    /** Suspend buyer */
    async suspendBuyer(id) {
      return await request('PUT', `/admin/buyers/${id}/suspend`);
    },

    /** Reactivate buyer */
    async reactivateBuyer(id) {
      return await request('PUT', `/admin/buyers/${id}/reactivate`);
    },

    /** Get payment data */
    async getPayments() {
      return await request('GET', '/admin/payments');
    },

    /** Confirm seller payment */
    async confirmPayment(sellerId, amount, plan) {
      return await request('PUT', `/admin/payments/${sellerId}/confirm`, { amount, plan });
    },

    /** Suspend seller for overdue payment */
    async suspendForPayment(sellerId) {
      return await request('PUT', `/admin/payments/${sellerId}/suspend`);
    },
  };

  // ══════════════════════════════════════════════
  //   BUYER PROFILE
  // ══════════════════════════════════════════════
  const buyer = {
    async getProfile() {
      return await request('GET', '/buyers/profile');
    },
    async updateProfile(data) {
      return await request('PUT', '/buyers/profile', data);
    },
  };

  // ══════════════════════════════════════════════
  //   PUBLIC API
  // ══════════════════════════════════════════════
  return {
    auth,
    sellers,
    products,
    orders,
    admin,
    buyer,
    logout,
    getToken,
    getRole,
    getUser,
    getSeller,
  };

})();
