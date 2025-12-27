// src/services/api.js
import axios from 'axios';

// Base URL taken from Vite env
const BASE = 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: BASE,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper: set Authorization header globally for the axios client
 * Call setAuthToken(token) after login, and setAuthToken(null) on logout.
 */
export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

/**
 * Helper to extract a good message from axios error
 */
const extractError = (err) => {
  if (!err) return 'Unknown error';
  if (err.response && err.response.data) {
    // Common patterns: { message } or { error } or { detail }
    const d = err.response.data;
    return d.message || d.error || d.detail || JSON.stringify(d);
  }
  return err.message || String(err);
};

/* -------------------------
   AUTH: signup / login
   ------------------------- */

/**
 * Register merchant (POST /api/signup)
 * returns server response (assumed success boolean/message or created user)
 */
export const registerMerchant = async (username, password) => {
  try {
    const resp = await client.post('/api/signup', { username, password });
    return resp.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Login user (POST /api/login)
 * Expectation: backend returns something indicating success.
 * Common responses:
 *  - { token, user: { username, role } }
 *  - { message: "OK", user: {...} }
 *
 * We return the response object so AuthContext can handle token+user.
 */
export const loginUser = async (username, password) => {
  try {
    // Use POST for credentials (safer). If backend supports GET, we could also make GET.
    const resp = await client.post('/api/login', { username, password });
    return resp.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/* -------------------------
   TRANSACTIONS
   ------------------------- */

/**
 * Get all transactions (admin)
 * GET /api/get-all-transactions
 */
export const getAllTransactions = async () => {
  try {
    const resp = await client.get('/api/get-all-transactions');
    return resp.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Get transactions by username
 * GET /api/get-transaction/:username
 */
export const getMerchantTransactions = async (username) => {
  try {
    const resp = await client.get(`/api/get-transaction/${encodeURIComponent(username)}`);
    return resp.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/* -------------------------
   PREDICTION
   ------------------------- */

/**
 * Call prediction API
 * POST /api/analyze-risk
 *
 * transactionPayload expected to contain:
 *  - transaction_id (uuid)
 *  - username
 *  - timestamp or date/time
 *  - Amount
 *  - V1..V28
 *
 * Returns backend response (e.g. { fraud_probability, risk_label, transaction_id, ... })
 */
export const analyzeRisk = async (transactionPayload) => {
  try {
    const resp = await client.post('/api/analyze-risk', transactionPayload);
    return resp.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/* -------------------------
   Optional: expose client for advanced use
   ------------------------- */

export default client;
