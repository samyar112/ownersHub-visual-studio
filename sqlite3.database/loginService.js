const { ipcMain } = require('electron');
const { getDb } = require('../sqlite3.database/database');
const path = require('path');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

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
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      const hashedPin = await bcrypt.hash(data.pin, saltRounds);
      const result = await new Promise((resolve, reject) => {
        db.run(insertQuery, [
          data.username,
          hashedPassword,
          hashedPin
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
  ipcMain.handle('getAllLoginData', async (event, { pin }) => {
    const db = getDb();
    try {
      const selectQuery = 'SELECT username, pin FROM login';

      const users = await new Promise((resolve, reject) => {
        db.all(selectQuery, (err, rows) => {
          if (err) {
            reject(new Error('Error fetching PINs: ' + err.message));
          } else {
            resolve(rows);
          }
        });
      });

      db.close();

      if (!users || users.length === 0) {
        return { success: false };
      }
      //Use this to verify if the user has been in the database. 
      if (!pin) {
        return users.map(user => user.username) || [];
      }

      // Compare entered PIN with each stored hashed PIN
      for (const user of users) {
        const isPinMatch = await bcrypt.compare(pin, user.pin);
        if (isPinMatch) {
          return { success: true, username: user.username };
        }
      }
      return { success: false };
    } catch (error) {
      db.close();
      return { success: false, message: error.message };
    }
  });
}
