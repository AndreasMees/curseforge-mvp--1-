const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDB, run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  const { game, q, sort } = req.query;
  const db = await getDB();
  let sql = 'SELECT * FROM mods WHERE 1=1';
  const params = [];

  if (game && game !== 'all') { sql += ' AND game = ?'; params.push(game); }
  if (q) { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  sql += sort === 'new' ? ' ORDER BY created_at DESC' : ' ORDER BY downloads DESC';

  res.json(all(db, sql, params));
});

router.get('/:id', async (req, res) => {
  const db = await getDB();
  const mod = get(db, 'SELECT * FROM mods WHERE id = ?', [req.params.id]);
  if (!mod) return res.status(404).json({ error: 'Moda ei leitud' });
  res.json(mod);
});

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  const { name, description, game, version } = req.body;
  if (!name || !game) return res.status(400).json({ error: 'Nimi ja mäng on kohustuslikud' });

  const db = await getDB();
  const result = run(db,
    'INSERT INTO mods (name, description, game, version, filename, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, game, version || '1.0.0', req.file?.filename || null, req.user.id, req.user.username]
  );
  res.json({ id: result.lastInsertRowid, message: 'Mod edukalt üles laaditud!' });
});

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

router.delete('/:id', authMiddleware, async (req, res) => {
  const db = await getDB();
  const mod = get(db, 'SELECT * FROM mods WHERE id = ?', [req.params.id]);
  if (!mod) return res.status(404).json({ error: 'Moda ei leitud' });
  if (mod.author_id !== req.user.id) return res.status(403).json({ error: 'Pole sinu mod' });

  run(db, 'DELETE FROM mods WHERE id = ?', [req.params.id]);
  res.json({ message: 'Mod kustutatud' });
});

module.exports = router;
