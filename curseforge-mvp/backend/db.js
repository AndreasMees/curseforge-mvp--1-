const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'curseforge.db');
let db = null;

async function getDB() {
  if (db) return db;
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Wrap sql.js synchronous API into helper functions
function run(db, sql, params = []) {
  db.run(sql, params);
  saveDB();
  // Get last insert rowid
  const res = db.exec('SELECT last_insert_rowid() as id');
  return { lastInsertRowid: res[0]?.values[0][0] ?? null };
}

function get(db, sql, params = []) {
  const res = db.exec(sql, params);
  if (!res[0] || res[0].values.length === 0) return null;
  const cols = res[0].columns;
  const row = res[0].values[0];
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]));
}

function all(db, sql, params = []) {
  const res = db.exec(sql, params);
  if (!res[0]) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
}

async function initDB() {
  const db = await getDB();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS mods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      game TEXT NOT NULL,
      version TEXT DEFAULT '1.0.0',
      filename TEXT,
      author_id INTEGER,
      author_name TEXT,
      downloads INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);

  saveDB();

  const count = get(db, 'SELECT COUNT(*) as c FROM mods');
  if (!count || count.c === 0) {
    const mods = [
      ['OptiFine HD', 'Optimeerib Minecrafti graafikat ja tõstab FPS-i märgatavalt.', 'minecraft', 'v1.20.4', 'sp614x', 14200000],
      ['Create Mod', 'Lisa käitatavaid masinaid, konveiereid ja inseneritööriistu.', 'minecraft', 'v0.5.1', 'simibubi', 8100000],
      ["Biomes O'Plenty", 'Üle 90 uue bioomi, tuhandeid uusi taimi ja elemente.', 'minecraft', 'v18.0', 'Glitchfiend', 6500000],
      ['ElvUI', 'Täielik kasutajaliidese asendus WoWile.', 'wow', 'v13.71', 'Tukui Team', 5900000],
      ['Deadly Boss Mods', 'Bossihäired kõikidele raidimiskohtumistele.', 'wow', 'v9.1.8', 'MysticalOS', 9200000],
      ['Valheim Plus', 'Laialdaselt kohandatav modifikaator.', 'valheim', 'v0.9.9', 'nex', 3100000],
      ['Stardew Valley Expanded', 'Tohutu laiendus — uued karakterid ja alad.', 'stardew', 'v1.14', 'FlashShifter', 4400000],
      ['Immersive Engineering', 'Reaalsuslähedane industriaalne mod masinatega.', 'minecraft', 'v9.1.0', 'BluSunrize', 5000000],
    ];
    mods.forEach(m => {
      db.run(
        'INSERT INTO mods (name, description, game, version, author_name, downloads) VALUES (?, ?, ?, ?, ?, ?)',
        m
      );
    });
    saveDB();
    console.log('✅ Näidisandmed lisatud andmebaasi');
  }

  console.log('✅ Andmebaas valmis:', DB_PATH);
}

module.exports = { getDB, run, get, all, saveDB, initDB };
