const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, run, get } = require('../db');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Kõik väljad on kohustuslikud' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Parool peab olema vähemalt 6 tähemärki' });
    }
    
    const db = await getDB();
    const exists = get(db, 'SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    
    if (exists) {
        return res.status(400).json({ error: 'E-post või kasutajanimi on juba kasutusel' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const result = run(db, 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash]);
    
    const token = jwt.sign({ id: result.lastInsertRowid, username }, SECRET, { expiresIn: '7d' });
    res.json({ token, username });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'E-post ja parool on kohustuslikud' });
    }
    
    const db = await getDB();
    const user = get(db, 'SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
        return res.status(401).json({ error: 'Vale e-post või parool' });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(401).json({ error: 'Vale e-post või parool' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
});

module.exports = router;