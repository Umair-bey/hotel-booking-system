const Database = require('better-sqlite3');
const path = require('path');

// Uses Render's persistent disk in production, local folder for development
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'hotel.db');
const db = new Database(dbPath);

// Enable foreign key enforcement — critical for ON DELETE CASCADE
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_no TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    guest_name TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status TEXT DEFAULT 'confirmed',
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  );
`);

console.log('✅ Database ready');

module.exports = db;