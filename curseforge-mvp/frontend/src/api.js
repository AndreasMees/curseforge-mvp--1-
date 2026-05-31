const BASE = 'http://localhost:3005/api';

function getToken() { return localStorage.getItem('token'); }

async function req(path, options = {}) {
  const token = getToken();
  console.log('API Request:', path, { method: options.method });
  
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  const data = await res.json();
  console.log('API Response:', path, { status: res.status });
  
  if (!res.ok) throw new Error(data.error || 'Midagi läks valesti');
  return data;
}

export const api = {
  register: async (body) => {
    console.log('Registering user:', { username: body.username, email: body.email });
    const result = await req('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    return result;
  },
  
  login: async (body) => {
    console.log('Logging in user:', { email: body.email });
    const result = await req('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    return result;
  },

  getMods: async (params = {}) => {
    const defaultParams = { page: 1, limit: 50, ...params };
    const qs = new URLSearchParams(defaultParams).toString();
    const response = await req('/mods' + (qs ? '?' + qs : ''));
    return response;
  },
  
  getModById: (id) => req('/mods/' + id),
  getModDescription: (id) => req('/mods/' + id + '/description'),
  getModGallery: (id) => req('/mods/' + id + '/gallery'),
  downloadMod: (id) => {
    window.open(BASE + '/mods/' + id + '/download', '_blank');
  },
  getModFiles: (id) => req('/mods/' + id + '/files'),
  downloadSpecificVersion: (modId, fileId) => {
    window.open(BASE + '/mods/' + modId + '/download-version/' + fileId, '_blank');
  },
  
  getGameStats: () => req('/mods/games/stats'),
  
  getAutocompleteSuggestions: async (query) => {
    if (!query || query.length < 2) return [];
    const response = await api.getMods({ q: query, limit: 10 });
    return response.mods || [];
  },
  
  getFavorites: async () => {
    const result = await req('/favorites');
    return result;
  },
  
  addToFavorites: (modId, mod) => {
    return req('/favorites/' + modId, { 
      method: 'POST', 
      body: JSON.stringify({
        modName: mod.name,
        modLogoUrl: mod.logo_url,
        modAuthor: mod.author_name
      })
    });
  },
  
  removeFromFavorites: (modId) => {
    return req('/favorites/' + modId, { method: 'DELETE' });
  },
  
  checkFavorite: (modId) => req('/favorites/check/' + modId),
  
  getCollections: () => req('/favorites/collections'),
  createCollection: (name, description) => req('/favorites/collections', {
    method: 'POST',
    body: JSON.stringify({ name, description })
  }),
  addModToCollection: (collectionId, modId, mod) => req('/favorites/collections/' + collectionId + '/mods/' + modId, {
    method: 'POST',
    body: JSON.stringify({
      modName: mod.name,
      modLogoUrl: mod.logo_url
    })
  }),
  getCollectionMods: (collectionId) => req('/favorites/collections/' + collectionId + '/mods'),
  
  uploadMod: (formData) => {
    const token = getToken();
    return fetch(BASE + '/mods', {
      method: 'POST',
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      body: formData,
    }).then(r => r.json());
  },
  deleteMod: (id) => req('/mods/' + id, { method: 'DELETE' }),
};