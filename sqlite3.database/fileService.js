const { app, ipcMain } = require('electron');
const { getDb } = require('../sqlite3.database/database');
const path = require('path');
const archiver = require('archiver');
const fs = require('fs');

//const saveDirectory = path.join('C:', 'ProgramData', 'OwnersHub-Demo', 'Uploaded_Files');
const saveDirectory = path.join(app.getPath('appData'), 'owners-hub-demo', 'Uploaded_Files');



function handleSaveFilesLocal() {
  ipcMain.handle('saveFilesLocal', async (event, data) => {

    if (!fs.existsSync(saveDirectory)) {
      fs.mkdirSync(saveDirectory);
    }

    const filePath = path.join(saveDirectory, data.fileName)
    const emptyFile = null;

    const db = getDb();
    if (!db) {
      reject('Database connection failed');
      return;
    }

    const insertQuery = `
    INSERT INTO files (accountId, file, fileName, fileExtension, fileSize, dateUploaded, filePath)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    return new Promise((resolve, reject) => {

      let fileBuffer;
      if (data.file instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Buffer
        fileBuffer = Buffer.from(data.file);
      } else {
        reject("File data is not in a valid format.");
        return;
      }

      writeFileSync(filePath, fileBuffer);

      db.run(insertQuery, [
        data.accountId,
        emptyFile,
        data.fileName,
        data.fileExtension,
        data.fileSize,
        data.dateUploaded,
        filePath
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

function writeFileSync(filePath, file) {
  fs.writeFileSync(filePath, file);
  try {
    console.log(`File successfully saved to: ${filePath}`);
  } catch (err) {
    console.error('Error writing the file:', err.message);
    throw new Error(`Failed to write file to ${filePath}: ${err.message}`);
  }
}

function handleAddFilesData() {
  ipcMain.handle('addFilesData', async (event, data) => {
    const db = getDb();
    const insertQuery = `
    INSERT INTO files (accountId, file, fileName, fileExtension, fileSize, dateUploaded, filePath)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    return new Promise((resolve, reject) => {

      let fileBuffer;
      if (data.file instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Buffer
        fileBuffer = Buffer.from(data.file);
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
  //try {
  //  fs.unlink(savedFilePaths);
  //  console.log(`File ${savedFilePaths} was deleted successfully.`);
  //} catch (err) {
  //  console.error('Error deleting the file:', err);
  //}

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
    const downloadQuery = `SELECT file, fileName FROM files WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.get(downloadQuery, [id], (err, row) => {
        if (err) {
          reject('Error downloading data: ' + err.message);
        } else if (row) {
          resolve({
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
    const placeholders = selectedIds.map(() => '?').join(',');
    const downloadQuery = `SELECT file, fileName FROM files WHERE id IN (${placeholders})`;

    return new Promise((resolve, reject) => {
      db.all(downloadQuery, selectedIds, (err, rows) => {
        if (err) {
          reject('Error downloading data: ' + err.message);
          return;
        }

        if (!rows.length) {
          reject('No files found with that ID');
          return;
        }

        // Create a ZIP using Archiver library
        const zipBuffer = [];
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('data', chunk => zipBuffer.push(chunk));
        archive.on('end', () => {
          const bufferFile = Buffer.concat(zipBuffer);
          // Send the buffer back to the renderer process
          event.sender.send('download-file', bufferFile);
          resolve(bufferFile);
        });

        // Add files to the archive
        rows.forEach(row => {
          const fileData = row.file;
          const fileName = row.fileName;

          if (Buffer.isBuffer(fileData)) {
            archive.append(fileData, { name: fileName });
          } else {
            console.error(`File data is not a buffer for ID: ${row.id}`);
          }
        });

        archive.finalize().catch((error) => {
          console.error('Error finalizing the archive:', error);
          reject('Error finalizing the archive: ' + error.message);
        });
      });
    });
  });
}

function registerFilesIPCHandlers() {
  handleSaveFilesLocal();
  handleAddFilesData();
  handleDeleteFilesData();
  handleGetFilesByAccountId();
  handleDownloadFilesData();
  handleDownloadSelectedFiles();
}

module.exports = { registerFilesIPCHandlers };
