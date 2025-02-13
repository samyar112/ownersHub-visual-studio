const { ipcMain } = require('electron');
const { getDb } = require('../sqlite3.database/database');
const path = require('path');

module.exports = { registerLoginIPCHandlers };
function registerLoginIPCHandlers() {
  handleAddLoginData();
}

function handleAddLoginData() {
  ipcMain.handle('addLoginData', async (event, data) => {
    const db = getDb();
    const insertQuery = `
      INSERT INTO login (username, password, pin)
      VALUES (?, ?, ?)
    `;

    try {
      // Using a Promise to handle the insert operation
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
