const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const modRoutes = require('./routes/mods');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initDB();

app.use('/api/auth', authRoutes);
app.use('/api/mods', modRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`\n✅ Backend käib: http://localhost:${PORT}`);
  console.log('   Stopp: Ctrl+C\n');
});
