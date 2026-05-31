const express = require('express');
const { getDB, run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user's favorites
router.get('/', authMiddleware, async (req, res) => {
    console.log(`📥 Getting favorites for user ${req.user.id}`);
    const db = await getDB();
    const favorites = await all(db, 
        'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
    );
    console.log(`✅ Found ${favorites.length} favorites`);
    res.json(favorites);
});

// Add mod to favorites
router.post('/:modId', authMiddleware, async (req, res) => {
    const { modId } = req.params;
    const { modName, modLogoUrl, modAuthor } = req.body;
    
    console.log(`❤️ Adding mod ${modId} to favorites for user ${req.user.id}`);
    const db = await getDB();
    
    try {
        const result = await run(db,
            'INSERT INTO favorites (user_id, mod_id, mod_name, mod_logo_url, mod_author) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, modId, modName, modLogoUrl, modAuthor]
        );
        console.log('✅ Added to favorites');
        res.json({ success: true, message: 'Mod added to favorites' });
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            console.log('⚠️ Mod already in favorites');
            res.status(400).json({ error: 'Mod already in favorites' });
        } else {
            console.error('❌ Error:', error);
            res.status(500).json({ error: 'Failed to add to favorites' });
        }
    }
});

// Remove mod from favorites
router.delete('/:modId', authMiddleware, async (req, res) => {
    const { modId } = req.params;
    console.log(`💔 Removing mod ${modId} from favorites for user ${req.user.id}`);
    const db = await getDB();
    
    await run(db, 'DELETE FROM favorites WHERE user_id = ? AND mod_id = ?', [req.user.id, modId]);
    console.log('✅ Removed from favorites');
    res.json({ success: true, message: 'Mod removed from favorites' });
});

// Check if mod is favorited
router.get('/check/:modId', authMiddleware, async (req, res) => {
    const { modId } = req.params;
    const db = await getDB();
    
    const favorite = await get(db,
        'SELECT * FROM favorites WHERE user_id = ? AND mod_id = ?',
        [req.user.id, modId]
    );
    
    res.json({ isFavorite: !!favorite });
});

// Collections
router.get('/collections', authMiddleware, async (req, res) => {
    const db = await getDB();
    const collections = await all(db,
        'SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
    );
    res.json(collections);
});

router.post('/collections', authMiddleware, async (req, res) => {
    const { name, description } = req.body;
    const db = await getDB();
    
    const result = await run(db,
        'INSERT INTO collections (user_id, name, description) VALUES (?, ?, ?)',
        [req.user.id, name, description]
    );
    res.json({ id: result.lastInsertRowid, name, description });
});

router.post('/collections/:collectionId/mods/:modId', authMiddleware, async (req, res) => {
    const { collectionId, modId } = req.params;
    const { modName, modLogoUrl } = req.body;
    const db = await getDB();
    
    const collection = await get(db,
        'SELECT * FROM collections WHERE id = ? AND user_id = ?',
        [collectionId, req.user.id]
    );
    
    if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    await run(db,
        'INSERT INTO collection_items (collection_id, mod_id, mod_name, mod_logo_url) VALUES (?, ?, ?, ?)',
        [collectionId, modId, modName, modLogoUrl]
    );
    
    res.json({ success: true });
});

router.get('/collections/:collectionId/mods', authMiddleware, async (req, res) => {
    const { collectionId } = req.params;
    const db = await getDB();
    
    const collection = await get(db,
        'SELECT * FROM collections WHERE id = ? AND user_id = ?',
        [collectionId, req.user.id]
    );
    
    if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const mods = await all(db,
        'SELECT * FROM collection_items WHERE collection_id = ? ORDER BY added_at DESC',
        [collectionId]
    );
    
    res.json({ collection, mods });
});

module.exports = router;