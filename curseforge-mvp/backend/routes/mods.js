const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { getDB, run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ===== CURSEFORGE API CONFIGURATION =====
const CURSEFORGE_API_KEY = '$2a$10$t4v8XU4bfLoiupy4XctOjeEc/4v1ocNS4nL4gQMfDOfn4Ro4vId1C';
const CURSEFORGE_BASE_URL = 'https://api.curseforge.com/v1';

// Game IDs mapping
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

// Helper function to call CurseForge API using native https
async function curseforgeFetch(endpoint, params = {}) {
    const url = new URL(`${CURSEFORGE_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    console.log('🌐 Calling URL:', url.toString());
    
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'x-api-key': CURSEFORGE_API_KEY,
                'Accept': 'application/json'
            }
        };
        
        const req = https.get(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📡 Response status:', res.statusCode);
                
                if (res.statusCode !== 200) {
                    console.log('❌ Error response:', data);
                    reject(new Error(`CurseForge API error: ${res.statusCode}`));
                    return;
                }
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ Success! Received', jsonData.data?.length || 0, 'mods');
                    resolve(jsonData.data);
                } catch (e) {
                    reject(new Error('Failed to parse JSON response'));
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('💥 Request error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// ===== LOCAL FILE UPLOAD CONFIGURATION =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}_${safe}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ===== API ENDPOINTS =====

// GET /api/mods - Search mods from CurseForge API
router.get('/', async (req, res) => {
    const { game = 'minecraft', q = '', sort = 'popular' } = req.query;
    
    let sortField = 1;
    if (sort === 'new') sortField = 2;
    if (sort === 'name') sortField = 3;
    
    const gameId = GAME_IDS[game.toLowerCase()];
    if (!gameId) {
        return res.status(400).json({ error: 'Invalid game' });
    }
    
    try {
        const params = {
            gameId: gameId,
            pageSize: 50,
            sortField: sortField,
            sortOrder: 'desc',
            searchFilter: q
        };
        
        const mods = await curseforgeFetch('/mods/search', params);
        
        if (!mods || mods.length === 0) {
            return res.json([]);
        }
        
        const formattedMods = mods.map(mod => ({
            id: mod.id,
            name: mod.name,
            description: mod.summary,
            game: game,
            version: mod.latestFiles?.[0]?.gameVersion?.[0] || 'Latest',
            author_name: mod.authors?.[0]?.name || 'Unknown',
            downloads: mod.downloadCount,
            logo_url: mod.logo?.url || null,
            curseforge_url: mod.links?.websiteUrl,
            created_at: mod.dateCreated
        }));
        
        res.json(formattedMods);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch mods from CurseForge: ' + error.message });
    }
});

// GET /api/mods/:id - Get specific mod from CurseForge
router.get('/:id', async (req, res) => {
    try {
        const mod = await curseforgeFetch(`/mods/${req.params.id}`);
        
        if (!mod) {
            return res.status(404).json({ error: 'Mod not found' });
        }
        
        const formattedMod = {
            id: mod.id,
            name: mod.name,
            description: mod.summary,
            author_name: mod.authors?.[0]?.name,
            downloads: mod.downloadCount,
            logo_url: mod.logo?.url,
            curseforge_url: mod.links?.websiteUrl
        };
        
        res.json(formattedMod);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mod details' });
    }
});

// POST /api/mods - Upload custom mod (stored locally)
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    const { name, description, game, version } = req.body;
    if (!name || !game) {
        return res.status(400).json({ error: 'Nimi ja mäng on kohustuslikud' });
    }
    
    const db = await getDB();
    const result = run(db,
        'INSERT INTO mods (name, description, game, version, filename, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, game, version || '1.0.0', req.file?.filename || null, req.user.id, req.user.username]
    );
    res.json({ id: result.lastInsertRowid, message: 'Mod edukalt üles laaditud!' });
});

// GET /api/mods/:id/download - Download local mod
router.get('/:id/download', async (req, res) => {
    const db = await getDB();
    const mod = get(db, 'SELECT * FROM mods WHERE id = ?', [req.params.id]);
    if (!mod) return res.status(404).json({ error: 'Moda ei leitud' });
    
    run(db, 'UPDATE mods SET downloads = downloads + 1 WHERE id = ?', [mod.id]);
    
    if (mod.filename) {
        const filePath = path.join(__dirname, '../uploads', mod.filename);
        if (fs.existsSync(filePath)) return res.download(filePath);
    }
    res.json({ message: 'Allalaadimine alustatud', mod: mod.name });
});

// DELETE /api/mods/:id - Delete locally uploaded mod
router.delete('/:id', authMiddleware, async (req, res) => {
    const db = await getDB();
    const mod = get(db, 'SELECT * FROM mods WHERE id = ?', [req.params.id]);
    if (!mod) return res.status(404).json({ error: 'Moda ei leitud' });
    if (mod.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Pole sinu mod' });
    }
    
    run(db, 'DELETE FROM mods WHERE id = ?', [req.params.id]);
    res.json({ message: 'Mod kustutatud' });
});

module.exports = router;