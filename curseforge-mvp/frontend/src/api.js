const BASE = 'http://localhost:3005/api';

function getToken() { return localStorage.getItem('token'); }

async function req(path, options = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Midagi läks valesti');
  return data;
}

export const api = {
  register: (body) => req('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getMods: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req('/mods' + (qs ? '?' + qs : ''));
  },
  downloadMod: (id) => req(`/mods/${id}/download`),
  uploadMod: (formData) => {
    const token = getToken();
    return fetch(BASE + '/mods', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json());
  },
  deleteMod: (id) => req(`/mods/${id}`, { method: 'DELETE' }),
};
