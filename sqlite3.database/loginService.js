const { ipcMain } = require('electron');
const { getDb } = require('../sqlite3.database/database');
const path = require('path');

module.exports = { registerLoginIPCHandlers };
function registerLoginIPCHandlers() {
  handleAddLoginData();
  handleGetAllLoginData()
}

function handleAddLoginData() {
  ipcMain.handle('addLoginData', async (event, data) => {
    const db = getDb();
    const insertQuery = `
      INSERT INTO login (username, password, pin)
      VALUES (?, ?, ?)
    `;
    try {
      const result = await new Promise((resolve, reject) => {
        db.run(insertQuery, [
          data.username,
          data.password,
          data.pin
        ], function (err) {
          if (err) {
            reject(new Error('Error adding data: ' + err.message));
          } else {
            resolve('Data added successfully with ID: ' + this.lastID);
          }
        });
      });
      db.close(); 
      return result;
    } catch (error) {
      db.close(); 
      throw error; 
    }
  });
}

function handleGetAllLoginData() {
  ipcMain.handle('getAllLoginData', async () => {
    const db = getDb();
    try {
      const selectQuery = 'SELECT * FROM login';
      const rows = await new Promise((resolve, reject) => {
        db.all(selectQuery, (err, rows) => {
          console.log('Made the promise Login Data', rows)
          if (err) {
            reject(err);
          } else {
            resolve(rows); 
          }
        });
      });
      db.close();
      return rows;
    } catch (err) {
      console.error('Error querying the database:', err);
      throw new Error(err);
    }
  });
}
