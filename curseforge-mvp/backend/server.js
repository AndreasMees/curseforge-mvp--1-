const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const modRoutes = require('./routes/mods');
const favoriteRoutes = require('./routes/favorites'); // ADD THIS

const app = express();
const PORT = 3005;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initDB();

app.use('/api/auth', authRoutes);
app.use('/api/mods', modRoutes);
app.use('/api/favorites', favoriteRoutes); // ADD THIS

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`\n✅ Backend käib: http://localhost:${PORT}`);
  console.log('   Stopp: Ctrl+C\n');
});