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

      let fileBuffer;
      if (data.file instanceof ArrayBuffer) {
        fileBuffer = Buffer.from(data.file); // Convert ArrayBuffer to Buffer
      } else {
        reject("File data is not in a valid format.");
        return;
      }
      db.run(insertQuery, [
        data.accountId,
        fileBuffer,
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

function handleDownloadFilesData() {
  ipcMain.handle('downloadFilesData', async (event, id) => {
    const db = getDb();
    const downloadQuery = `SELECT id, file, fileName FROM files WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.get(downloadQuery, [id], (err, row) => {
        if (err) {
          reject('Error downloading data: ' + err.message);
        } else if (row) {
          resolve({
            id: row.id,
            file: row.file,
            fileName: row.fileName
          });
        } else {
          reject('No file found with that ID');
        }
        db.close();
      });
    });
  });
}

function handleDownloadSelectedFiles() {
  ipcMain.handle('downloadSelectedFiles', async (event, selectedIds) => {
    const db = getDb();
    // Use a parameterized query to fetch multiple files based on the selected IDs
    const downloadQuery = `SELECT id, file, fileName FROM files WHERE id IN (${selectedIds.join(',')})`;

    return new Promise((resolve, reject) => {
      db.all(downloadQuery, [], (err, rows) => {
        if (err) {
          reject('Error downloading data: ' + err.message);
        } else if (row) {
          resolve({
            id: row.id,
            file: row.file,
            fileName: row.fileName
          });
        } else {
          reject('No file found with that ID');
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
  handleDownloadFilesData();
  handleDownloadSelectedFiles();
}

module.exports = { registerFilesIPCHandlers };
