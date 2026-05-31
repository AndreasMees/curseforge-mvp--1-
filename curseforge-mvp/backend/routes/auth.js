const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, run, get } = require('../db');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('📝 Register request received:', req.body);
  const { username, email, password } = req.body;
  
  // Validate input
  if (!username || !email || !password) {
    console.log('❌ Missing fields');
    return res.status(400).json({ error: 'Kõik väljad on kohustuslikud' });
  }
  
  if (password.length < 6) {
    console.log('❌ Password too short');
    return res.status(400).json({ error: 'Parool peab olema vähemalt 6 tähemärki' });
  }
  
  try {
    const db = await getDB();
    
    // Check if user already exists
    const existingUser = await get(db, 'SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    
    if (existingUser) {
      console.log('❌ User already exists:', existingUser);
      return res.status(400).json({ error: 'E-post või kasutajanimi on juba kasutusel' });
    }
    
    // Hash password and create user
    const hash = await bcrypt.hash(password, 10);
    const result = await run(db, 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash]);
    
    console.log('✅ User created with ID:', result.lastInsertRowid);
    
    // Create token
    const token = jwt.sign({ id: result.lastInsertRowid, username }, SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      username,
      userId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  console.log('🔐 Login request received:', req.body);
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('❌ Missing fields');
    return res.status(400).json({ error: 'E-post ja parool on kohustuslikud' });
  }
  
  try {
    const db = await getDB();
    const user = await get(db, 'SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return res.status(401).json({ error: 'Vale e-post või parool' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('❌ Wrong password for user:', email);
      return res.status(401).json({ error: 'Vale e-post või parool' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
    console.log('✅ Login successful for:', user.username);
    
    res.json({ 
      token, 
      username: user.username,
      userId: user.id 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;