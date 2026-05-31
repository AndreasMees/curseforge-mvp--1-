const fetch = require('node-fetch');

// IMPORTANT: Get your API key from https://console.curseforge.com/#/api-keys
const CURSEFORGE_API_KEY = 'YOUR_API_KEY_HERE'; // Replace this!
const BASE_URL = 'https://api.curseforge.com/v1';

// Game IDs
const GAME_IDS = {
    minecraft: 432,
    wow: 722,
    valheim: 2236,
    stardew: 3244,
    skyrim: 728,
    factorio: 669,
    rimworld: 404,
    kerbal: 2282
};

async function curseforgeFetch(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url, {
        headers: {
            'x-api-key': CURSEFORGE_API_KEY,
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`CurseForge API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
}

async function searchMods(game, searchFilter = '', sortField = 1, pageSize = 20) {
    const gameId = GAME_IDS[game.toLowerCase()];
    if (!gameId) return [];
    
    const params = {
        gameId: gameId,
        pageSize: pageSize,
        sortField: sortField, // 1 = popularity, 2 = last updated, 3 = name
        sortOrder: 'desc',
        searchFilter: searchFilter
    };
    
    try {
        const mods = await curseforgeFetch('/mods/search', params);
        return mods.map(mod => ({
            id: mod.id,
            name: mod.name,
            description: mod.summary,
            game: game,
            version: mod.latestFiles?.[0]?.gameVersion?.[0] || 'N/A',
            author_name: mod.authors?.[0]?.name || 'Unknown',
            downloads: mod.downloadCount,
            logo_url: mod.logo?.url || null,
            curseforge_url: mod.links?.websiteUrl,
            created_at: mod.dateCreated
        }));
    } catch (error) {
        console.error('Error searching mods:', error);
        return [];
    }
}

async function getModById(modId) {
    try {
        const mod = await curseforgeFetch(`/mods/${modId}`);
        return {
            id: mod.id,
            name: mod.name,
            description: mod.summary,
            full_description: null, // Would need separate API call
            author_name: mod.authors?.[0]?.name,
            downloads: mod.downloadCount,
            logo_url: mod.logo?.url,
            curseforge_url: mod.links?.websiteUrl,
            categories: mod.categories,
            gameVersions: mod.latestFiles?.[0]?.gameVersion || []
        };
    } catch (error) {
        console.error('Error fetching mod:', error);
        return null;
    }
}

module.exports = { searchMods, getModById, GAME_IDS };