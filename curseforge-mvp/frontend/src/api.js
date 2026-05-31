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

  getMods: async (params = {}) => {
    const defaultParams = { page: 1, limit: 50, ...params };
    const qs = new URLSearchParams(defaultParams).toString();
    const response = await req('/mods' + (qs ? '?' + qs : ''));
    return response;
  },
  
  getModById: (id) => req(`/mods/${id}`),
  getModDescription: (id) => req(`/mods/${id}/description`),
  getModGallery: (id) => req(`/mods/${id}/gallery`),
  
  // NEW: Direct download functions
  downloadMod: (id) => {
    // Open download in new tab/window
    window.open(`${BASE}/mods/${id}/download`, '_blank');
  },
  
  getModFiles: (id) => req(`/mods/${id}/files`),
  downloadSpecificVersion: (modId, fileId) => {
    window.open(`${BASE}/mods/${modId}/download-version/${fileId}`, '_blank');
  },
  
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