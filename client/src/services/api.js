const BASE_URL = '/api';

/**
 * Generic API request wrapper with JWT token handling
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('acousticpulse_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // If CSV or Blob download
    if (options.responseType === 'blob') {
      if (!response.ok) throw new Error('Download failed');
      return await response.blob();
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    getDemoAccounts: () => request('/auth/demo-accounts')
  },

  // Monitoring Stations
  stations: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/stations${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/stations/${id}`),
    create: (data) => request('/stations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/stations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/stations/${id}`, { method: 'DELETE' })
  },

  // Noise & Telemetry
  noise: {
    getStats: () => request('/noise/stats'),
    getTrends: (range = '24h', stationId) => {
      const query = new URLSearchParams({ range, ...(stationId && { stationId }) }).toString();
      return request(`/noise/trends?${query}`);
    },
    getHeatmap: () => request('/noise/heatmap'),
    getViolations: (limit = 20) => request(`/noise/violations?limit=${limit}`),
    triggerSimulateTick: () => request('/noise/simulate-tick', { method: 'POST' })
  },

  // Complaints
  complaints: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/complaints${query ? `?${query}` : ''}`);
    },
    getByIdOrTracking: (identifier) => request(`/complaints/${identifier}`),
    create: (data) => request('/complaints', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, data) => request(`/complaints/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/complaints/${id}`, { method: 'DELETE' })
  },

  // Alerts
  alerts: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/alerts${query ? `?${query}` : ''}`);
    },
    getStats: () => request('/alerts/stats'),
    resolve: (id) => request(`/alerts/${id}/resolve`, { method: 'PUT' })
  },

  // Analytics
  analytics: {
    getOverview: (range = '30d') => request(`/analytics/overview?range=${range}`)
  },

  // Acoustic Profiles
  profiles: {
    getAll: () => request('/profiles')
  },

  // Recommendations
  recommendations: {
    getAll: () => request('/recommendations')
  },

  // Policy Simulator
  simulator: {
    run: (params) => request('/simulator/run', { method: 'POST', body: JSON.stringify(params) })
  },

  // Reports
  reports: {
    generate: (data) => request('/reports/generate', { method: 'POST', body: JSON.stringify(data) }),
    downloadCsv: async (data) => {
      const token = localStorage.getItem('acousticpulse_token');
      const res = await fetch(`${BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ ...data, format: 'csv' })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acoustic_report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  },

  // Users
  users: {
    getAll: (role) => request(`/users${role ? `?role=${role}` : ''}`),
    updateRole: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  // Search
  search: {
    query: (q) => request(`/search?q=${encodeURIComponent(q)}`)
  }
};
