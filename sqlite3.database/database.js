const sqlite3 = require('sqlite3').verbose();
const path = require('path');

 //Sqlite3 connection
function getDb() {
  const db = new sqlite3.Database(path.join(__dirname, 'sqlite3-data.db'), (err) => {
    if (err) {
      console.error('Database connection failed:', err);
    }
  });
  return db;
}

module.exports = { getDb };
