// HealthOS frontend API client
// Matches the current FastAPI backend.

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ENDPOINTS = {
  // Authentication
  signup: '/auth/register',
  login: '/auth/login',
  me: '/auth/me',

  // Dashboard
  dashboard: '/dashboard',

  // Health tracking
  water: '/health/water',
  sleep: '/health/sleep',
  activity: '/health/activity',
  weight: '/health/weight',

  // Mood
  mood: '/mood',
};

const KEY = 'healthos_token';

export const tokenStore = {
  get: () => localStorage.getItem(KEY),
  set: (token) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
};

const http = axios.create({
  baseURL: BASE,
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && tokenStore.get()) {
      window.dispatchEvent(
        new Event('healthos:unauthorized')
      );
    }

    const err = new Error(friendly(error));
    err.status = status;

    return Promise.reject(err);
  }
);

function friendly(error) {
  if (!error.response) {
    return 'Cannot reach the server. Check that the backend is running.';
  }

  const { status, data } = error.response;
  const detail = data?.detail;

  if (status === 422) {
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join('. ');
    }

    return 'Some fields are invalid.';
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  if (status === 403) {
    return "You don't have permission to do that.";
  }

  if (status === 404) {
    return 'The requested endpoint was not found.';
  }

  if (status >= 500) {
    return 'The server ran into a problem. Please try again.';
  }

  return 'Something went wrong.';
}


// --------------------------------------------------
// Authentication
// --------------------------------------------------

export const authApi = {
  async login(email, password) {
    const { data } = await http.post(
      ENDPOINTS.login,
      {
        email,
        password,
      }
    );

    const token = data?.access_token;

    if (!token) {
      throw new Error(
        'Login succeeded but the server returned no token.'
      );
    }

    return token;
  },

  async signup(payload) {
    const { data } = await http.post(
      ENDPOINTS.signup,
      payload
    );

    return data;
  },
};


// --------------------------------------------------
// User
// --------------------------------------------------

export const userApi = {
  async me() {
    const { data } = await http.get(
      ENDPOINTS.me
    );

    return data;
  },

  async update() {
    throw new Error(
      'Profile updates are not implemented in the current backend.'
    );
  },
};


// --------------------------------------------------
// Dashboard
// --------------------------------------------------

export function normalizeDashboard(data) {
  const today = data?.today || {};
  const last7 = data?.last_7_days || {};

  return {
    today: {
      date: today.date ?? null,
      water_ml: today.water_ml ?? 0,
      steps: today.steps ?? 0,
      exercise_minutes: today.exercise_minutes ?? 0,
      sleep_minutes: today.sleep_minutes ?? null,
      weight_kg: today.weight_kg ?? null,
      mood_score: today.mood_score ?? null,
    },

    last_7_days: {
      water: Array.isArray(last7.water)
        ? last7.water
        : [],

      activity: Array.isArray(last7.activity)
        ? last7.activity
        : [],
    },
  };
}

export const dashboardApi = {
  async get() {
    const { data } = await http.get(
      ENDPOINTS.dashboard
    );

    return normalizeDashboard(data);
  },
};


// --------------------------------------------------
// Health tracking
// --------------------------------------------------

export const healthApi = {

  // Water
  addWater: async (amount_ml) => {
    const { data } = await http.post(
      ENDPOINTS.water,
      { amount_ml }
    );

    return data;
  },

  getWater: async () => {
    const { data } = await http.get(
      ENDPOINTS.water
    );

    return data;
  },


  // Sleep
  addSleep: async (
    sleep_date,
    duration_minutes,
    quality = null
  ) => {
    const { data } = await http.post(
      ENDPOINTS.sleep,
      {
        sleep_date,
        duration_minutes,
        quality,
      }
    );

    return data;
  },

  getSleep: async () => {
    const { data } = await http.get(
      ENDPOINTS.sleep
    );

    return data;
  },


  // Activity
  addActivity: async (
    steps,
    exercise_minutes = 0
  ) => {
    const { data } = await http.post(
      ENDPOINTS.activity,
      {
        steps,
        exercise_minutes,
      }
    );

    return data;
  },

  getActivity: async () => {
    const { data } = await http.get(
      ENDPOINTS.activity
    );

    return data;
  },


  // Weight
  addWeight: async (weight_kg) => {
    const { data } = await http.post(
      ENDPOINTS.weight,
      {
        weight_kg,
      }
    );

    return data;
  },

  getWeight: async () => {
    const { data } = await http.get(
      ENDPOINTS.weight
    );

    return data;
  },
};


// --------------------------------------------------
// Mood
// --------------------------------------------------

export const moodApi = {

  add: async (mood_score, journal = null) => {
    const { data } = await http.post(
      ENDPOINTS.mood,
      {
        mood_score,
        journal,
      }
    );

    return data;
  },

  get: async () => {
    const { data } = await http.get(
      ENDPOINTS.mood
    );

    return data;
  },
};


// --------------------------------------------------
// Legacy report API
// --------------------------------------------------
// The current backend does not have medical reports.
// These exports are kept so existing frontend imports
// don't crash during compilation.

export const reportsApi = {
  async list() {
    throw new Error(
      'Medical reports are not implemented in the current backend.'
    );
  },

  async get() {
    throw new Error(
      'Medical reports are not implemented in the current backend.'
    );
  },

  async upload() {
    throw new Error(
      'Medical report uploads are not implemented in the current backend.'
    );
  },

  async openFile() {
    throw new Error(
      'Medical reports are not implemented in the current backend.'
    );
  },
};


// --------------------------------------------------
// Legacy AI chat API
// --------------------------------------------------
// AI assistant backend is planned but not implemented
// in the current backend.

export const chatApi = {
  async send() {
    throw new Error(
      'AI chat is not implemented in the current backend.'
    );
  },
};