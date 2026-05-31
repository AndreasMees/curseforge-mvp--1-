const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { getDB, run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ===== CURSEFORGE API CONFIGURATION =====
const CURSEFORGE_API_KEY = '$2a$10$TV8yO6VUWEvxqERmJeR35OWfuD0UXRQF8hp6dXuQ0tFsStYcP6qGy';
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

// Helper function to call CurseForge API
async function curseforgeFetch(endpoint, params = {}) {
    const url = new URL(`${CURSEFORGE_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    console.log('🌐 Calling:', url.toString());
    
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
                console.log('📡 Status:', res.statusCode);
                
                if (res.statusCode !== 200) {
                    console.log('❌ Error:', data);
                    reject(new Error(`API error: ${res.statusCode}`));
                    return;
                }
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ Got', jsonData.data?.length || 0, 'mods');
                    resolve(jsonData.data);
                } catch (e) {
                    reject(new Error('Failed to parse JSON'));
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('💥 Error:', error.message);
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

// GET /api/mods - Search mods with pagination
router.get('/', async (req, res) => {
    const { game = 'minecraft', q = '', sort = 'popular', page = 1, limit = 50 } = req.query;
    
    let sortField = 1;
    if (sort === 'new') sortField = 2;
    if (sort === 'downloads') sortField = 4;
    
    const gameId = GAME_IDS[game.toLowerCase()];
    if (!gameId) {
        return res.status(400).json({ error: 'Invalid game' });
    }
    
    const pageNum = parseInt(page);
    const pageSize = Math.min(parseInt(limit), 100);
    const offset = (pageNum - 1) * pageSize;
    
    try {
        const params = {
            gameId: gameId,
            pageSize: pageSize,
            sortField: sortField,
            sortOrder: 'desc',
            searchFilter: q,
            index: offset
        };
        
        const mods = await curseforgeFetch('/mods/search', params);
        
        if (!mods || mods.length === 0) {
            return res.json({
                mods: [],
                currentPage: pageNum,
                totalPages: 1,
                hasMore: false
            });
        }
        
        const formattedMods = mods.map(mod => ({
            id: mod.id,
            name: mod.name,
            description: mod.summary || 'No description available',
            game: game,
            version: mod.latestFiles?.[0]?.gameVersion?.[0] || 'Latest',
            author_name: mod.authors?.[0]?.name || 'Unknown',
            downloads: mod.downloadCount || 0,
            logo_url: mod.logo?.url || null,
            curseforge_url: mod.links?.websiteUrl || `https://www.curseforge.com/${game}/mods/${mod.slug}`,
            created_at: mod.dateCreated,
            categories: mod.categories?.map(c => c.name) || []
        }));
        
        const hasMore = mods.length === pageSize;
        
        res.json({
            mods: formattedMods,
            currentPage: pageNum,
            totalPages: hasMore ? pageNum + 5 : pageNum,
            hasMore: hasMore,
            totalMods: formattedMods.length
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch mods: ' + error.message });
    }
});

// GET /api/mods/:id - Get specific mod
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
            full_description: null,
            author_name: mod.authors?.[0]?.name,
            downloads: mod.downloadCount,
            logo_url: mod.logo?.url,
            curseforge_url: mod.links?.websiteUrl,
            categories: mod.categories,
            gameVersions: mod.latestFiles?.[0]?.gameVersion || []
        };
        
        res.json(formattedMod);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mod details' });
    }
});

// GET /api/mods/:id/description - Get full mod description
router.get('/:id/description', async (req, res) => {
    try {
        const description = await curseforgeFetch(`/mods/${req.params.id}/description`);
        res.json({ description: description });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch description' });
    }
});

// GET /api/mods/:id/gallery - Get mod images/screenshots
router.get('/:id/gallery', async (req, res) => {
    try {
        const mod = await curseforgeFetch(`/mods/${req.params.id}`);
        const screenshots = mod.screenshots || [];
        const gallery = screenshots.map(img => ({
            url: img.url,
            title: img.title || 'Screenshot',
            thumbnail: img.thumbnailUrl || img.url
        }));
        res.json({ gallery: gallery, logo: mod.logo?.url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// GET /api/mods/:id/download - DIRECT DOWNLOAD (redirect to CurseForge CDN)
router.get('/:id/download', async (req, res) => {
    try {
        const mod = await curseforgeFetch(`/mods/${req.params.id}`);
        
        if (!mod || !mod.latestFiles || mod.latestFiles.length === 0) {
            return res.status(404).json({ error: 'No files available for download' });
        }
        
        const latestFile = mod.latestFiles[0];
        const downloadUrl = latestFile.downloadUrl;
        
        if (!downloadUrl) {
            return res.status(404).json({ error: 'Download URL not available' });
        }
        
        console.log(`📥 Downloading: ${latestFile.fileName}`);
        console.log(`🔗 URL: ${downloadUrl}`);
        
        // Redirect to CurseForge CDN for direct download
        res.redirect(downloadUrl);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download mod: ' + error.message });
    }
});

// GET /api/mods/:id/files - Get all available files for a mod (so user can choose version)
router.get('/:id/files', async (req, res) => {
    try {
        const files = await curseforgeFetch(`/mods/${req.params.id}/files`);
        const availableFiles = files.map(file => ({
            id: file.id,
            name: file.fileName,
            size: file.fileLength,
            date: file.fileDate,
            downloadUrl: file.downloadUrl,
            gameVersion: file.gameVersion,
            fileType: file.fileType
        }));
        res.json(availableFiles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch files: ' + error.message });
    }
});

// GET /api/mods/:id/download-version/:fileId - Download specific version
router.get('/:id/download-version/:fileId', async (req, res) => {
    try {
        const { id, fileId } = req.params;
        const file = await curseforgeFetch(`/mods/${id}/files/${fileId}`);
        
        if (!file || !file.downloadUrl) {
            return res.status(404).json({ error: 'File not found or download URL missing' });
        }
        
        console.log(`📥 Downloading specific version: ${file.fileName}`);
        res.redirect(file.downloadUrl);
    } catch (error) {
        res.status(500).json({ error: 'Failed to download file: ' + error.message });
    }
});

// POST /api/mods - Upload custom mod
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

// DELETE /api/mods/:id - Delete local mod
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