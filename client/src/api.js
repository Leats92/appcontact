const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function logout() {
  localStorage.removeItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email, password, phone, firstName, lastName) =>
    request(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, phone, firstName, lastName }),
    }),
  getContacts: () => request(`/contacts`),
  createContact: (payload) => request(`/contacts`, { method: 'POST', body: JSON.stringify(payload) }),
  updateContact: (id, payload) => request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
};

