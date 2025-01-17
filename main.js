const { ipcMain } = require('electron');
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

// Error Handling
process.on('uncaughtException', (error) => {
  alert("Error Loading, Close the application", error)
});

// Create window and load the app
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 950,
    resizable: true,
    minWidth: 800,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile('dist/owners-hub-demo/browser/index.html');
  // Open DevTools automatically
  //win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Sqlite3 connection
function getDb() {
  const db = new sqlite3.Database(path.join(__dirname, 'sqlite3-data.db'), (err) => {
    console.log("database Connected");
    if (err) {
      console.error('Database connection failed:', err);
    }
  });
  return db;
}

// Handle adding new data for owners
ipcMain.handle('addData', async (event, data) => {
  const db = getDb();
  const insertQuery = `
    INSERT INTO owners (accountId, ownerName, contactName, email, phone, address, city, state, zip)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    db.run(insertQuery, [
      data.accountId,
      data.ownerName,
      data.contactName,
      data.email,
      data.phone,
      data.address,
      data.city,
      data.state,
      data.zip
    ], function (err) {
      if (err) {
        reject('Error adding data: ' + err.message);
      } else {
        resolve('Data added successfully with ID: ' + this.lastID);
      }
    });
    db.close();
  });
});

// Handle editing data for owners
ipcMain.handle('editData', async (event, data) => {
  const db = getDb();
  const updateQuery = `
    UPDATE owners 
    SET accountId = ?, ownerName = ?, contactName = ?, email = ?, phone = ?, 
        address = ?, city = ?, state = ?, zip = ? 
    WHERE id = ?
  `;

  return new Promise((resolve, reject) => {
    db.run(updateQuery, [
      data.accountId,   // accountId
      data.ownerName,    // owner_name
      data.contactName,  // contact_name
      data.email,        // email
      data.phone,        // phone
      data.address,      // address
      data.city,         // city
      data.state,        // state
      data.zip,          // zip
      data.id            // id (primary key) to update the correct record
    ], function (err) {
      if (err) {
        reject('Error updating data: ' + err.message);
      } else {
        resolve('Data updated successfully');
      }
      db.close();
    });
  });
});

// Handle deleting data for owners
ipcMain.handle('deleteData', async (event, id) => {
  const db = getDb();
  const deleteQuery = `DELETE FROM owners WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db.run(deleteQuery, [id], function (err) {
      if (err) {
        reject('Error deleting data: ' + err.message);
      } else {
        resolve('Data deleted successfully');
      }
      db.close();
    });
  });
});

// Handle getting all data for owners
ipcMain.handle('getAllData', async () => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM owners ORDER BY accountID DESC';
    db.all(query, [], (err, rows) => {
      if (err) {
        reject('Error fetching owners: ' + err.message);
      } else {
        // Map rows to the correct owner model format
        const owners = rows.map(row => ({
          id: row.id,          // Now including 'id'
          accountId: row.accountId,
          ownerName: row.ownerName,
          contactName: row.contactName,
          email: row.email,
          phone: row.phone,
          address: row.address,
          city: row.city,
          state: row.state,
          zip: row.zip
        }));
        resolve(owners);  // Return the result rows mapped to Owner model
      }
      db.close();
    });
  });
});

// Handle getting an owner by ID
ipcMain.handle('getDataById', async (event, id) => {
  const db = getDb();
  const selectQuery = `SELECT * FROM owners WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        reject('Error fetching owner by ID: ' + err.message);
      } else {
        // Map the row to the Owner model
        if (row) {
          resolve({
            id: row.id,          // Now including 'id'
            accountId: row.accountId,
            ownerName: row.ownerName,
            contactName: row.contactName,
            email: row.email,
            phone: row.phone,
            address: row.address,
            city: row.city,
            state: row.state,
            zip: row.zip
          });
        } else {
          resolve(null);
        }
      }
      db.close();
    });
  });
});

ipcMain.handle('getAccountId', async (event, accountId) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    const selectQuery = `SELECT * FROM owners WHERE accountId = ?`;
    db.get(selectQuery, [accountId], (err, row) => {
      if (err) {
        console.error("Error querying the database:", err);
        reject(err);
      } else {
        resolve(row);
      }
      db.close();
    });
  });
});
