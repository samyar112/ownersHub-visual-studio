const { ipcMain } = require('electron');
const { getDb } = require('../sqlite3.database/database');
const path = require('path');

function handleAddFilesData() {
  ipcMain.handle('addFilesData', async (event, data) => {
    const db = getDb();
    const insertQuery = `
    INSERT INTO files (accountId, file, fileName, fileExtension, fileSize, dateUploaded)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    return new Promise((resolve, reject) => {
      db.run(insertQuery, [
        data.accountId,
        data.file,
        data.fileName,
        data.fileExtension,
        data.fileSize,
        data.dateUploaded
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
}
function handleGetFilesByAccountId() {
  ipcMain.handle('getFilesByAccountId', async (event, accountId) => {
    const db = getDb();
    return new Promise((resolve, reject) => {
      const selectQuery = `SELECT * FROM files WHERE accountId = ? ORDER BY Id DESC`;
      db.all(selectQuery, [accountId], (err, rows) => {
        if (err) {
          console.error("Error querying the database:", err);
          reject(err);
        } else {
          const mappedFiles = rows.map(row => ({
            id: row.Id,
            accountId: row.accountId,
            fileName: row.fileName,     
            fileExtension: row.fileExtension,  
            fileSize: row.fileSize,      
            dateUploaded: row.dateUploaded
          }));

          resolve(mappedFiles);
        }
        db.close();
      });
    });
  });
}

function handleDeleteFilesData() {
  ipcMain.handle('deleteFilesData', async (event, id) => {
    const db = getDb();
    const deleteQuery = `DELETE FROM files WHERE id = ?`;
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
}


function registerFilesIPCHandlers() {
  handleAddFilesData();
  handleDeleteFilesData();
  handleGetFilesByAccountId();
}

module.exports = { registerFilesIPCHandlers };
