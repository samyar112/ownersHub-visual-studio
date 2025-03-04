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

// Main function to handle adding login data
function handleAddLoginData() {
  ipcMain.handle('addLoginData', async (event, data) => {
    const db = getDb();

    try {
      await insertLoginParameters(db, data);
      const result = await activateLoginTrigger(db);
      return result;
    } catch (error) {
      console.error("Error processing login data:", error.message);
      return { error: error.message };
    } finally {
      db.close();
    }
  });
}

// Function to insert login parameters
async function insertLoginParameters(db, data) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data || !data.username || !data.password || !data.pin) {
        throw new Error("Missing required parameters: username, password, or pin");
      }

      // Hash password and pin before storing
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      const hashedPin = await bcrypt.hash(data.pin, saltRounds);

      // Insert new parameters into _tblProcessParameter
      const query = `INSERT INTO _tblProcessParameters (username, password, pin) VALUES 
                          ( ?, ?, ?)`;

      db.run(query, [data.username, hashedPassword, hashedPin], (err) => {
        if (err) {
          reject(new Error("Error inserting parameters: " + err.message));
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
// Function to activate the trigger
async function activateLoginTrigger(db) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE _tblProcessEvent SET Login_Insert = 1 WHERE id = 1";

    db.run(query, (err) => {
      if (err) {
        reject(new Error("Error updating trigger flag: " + err.message));
      } else {
        resolve({ message: "User login insertion triggered successfully." });
      }
    });
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
