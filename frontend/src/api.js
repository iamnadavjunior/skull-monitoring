const API_BASE = '/skull-monitoring/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Don't set Content-Type for FormData (browser sets boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Guard against non-JSON responses (e.g. HTML error pages)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/skull-monitoring/login';
    }
    throw new Error('Server error — unexpected response');
  }

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/skull-monitoring/login';
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),

  // Public (no auth) — with safe JSON parsing
  publicGet: (path) => fetch(`${API_BASE}${path}`).then(r => {
    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('application/json')) throw new Error('Server error');
    return r.json();
  }),
};
