const { app, ipcMain } = require('electron');
const { getDb } = require('../sqlite3.database/database');
const path = require('path');
const archiver = require('archiver');
const fs = require('fs');

//const saveDirectory = path.join('C:', 'ProgramData', 'OwnersHub-Demo', 'Uploaded_Files');
const saveDirectory = path.join(app.getPath('appData'), 'owners-hub-demo', 'Uploaded_Files');

module.exports = { registerFilesIPCHandlers };
function registerFilesIPCHandlers() {
  handleSaveFilesLocal();
  handleAddFilesData();
  handleDeleteFilesData();
  handleLocalDeleteFile();
  handleGetFilesByAccountId();
  handleDownloadLocalFile();
  handleDownloadSelectedFiles();
}

function handleSaveFilesLocal() {
  ipcMain.handle('saveFilesLocal', async (event, data) => {

    if (!fs.existsSync(saveDirectory)) {
      fs.mkdirSync(saveDirectory);
    }

    let timeStamp = Date.now();
    const lastFourDigits = timeStamp % 10000;
    const fileExtension = path.extname(data.fileName);
    const baseName = path.basename(data.fileName, fileExtension);

    let filePath = path.join(saveDirectory, `${baseName}_${lastFourDigits}${fileExtension}`);

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
      const selectQuery = `SELECT * FROM files WHERE accountId = ? ORDER BY dateUploaded DESC`;
      db.all(selectQuery, [accountId], (err, rows) => {
        if (err) {
          console.error("Error querying the database:", err);
          reject(err);
        } else {
          const mappedFiles = rows.map(row => ({
            id: row.Id,
            accountId: row.accountId,
            fileName: row.fileName,
            file: row.file,
            fileExtension: row.fileExtension,
            fileSize: row.fileSize,
            dateUploaded: row.dateUploaded,
            filePath: row.filePath
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
function handleLocalDeleteFile() {
  ipcMain.handle('deleteLocalFile', async (event, filePath) => {
    try {
      const resolvedPath = path.resolve(filePath);
      console.log('Resolved Path:', resolvedPath);

      // Ensure the file exists before attempting to delete
      await fs.promises.access(resolvedPath); // Check if the file exists
      await fs.promises.unlink(resolvedPath); // Delete the file
      console.log('File deleted successfully:', resolvedPath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  });
}
function handleDownloadLocalFile() {
  ipcMain.handle('downloadLocalFile', async (event, filePath) => {
    console.log('I am here:', filePath);
    try {
      const resolvedPath = path.resolve(filePath);
      console.log('Resolved Path:', resolvedPath);

      // Check if file exists
      await fs.promises.access(resolvedPath);

      // Read the file as a buffer
      const fileBuffer = await fs.promises.readFile(resolvedPath);
      console.log('File read successfully:', resolvedPath);

      // Send the buffer to the renderer process
      return fileBuffer;
    } catch (err) {
      console.error('Error reading file:', err);
      throw new Error('File not found or unable to read.');
    }
  });
}
function handleDownloadSelectedFiles() {
  ipcMain.handle('downloadSelectedFiles', async (event, selectedIds) => {
    const db = getDb();
    const placeholders = selectedIds.map(() => '?').join(',');
    const downloadQuery = `SELECT file, fileName, filePath FROM files WHERE id IN (${placeholders})`;

    return new Promise((resolve, reject) => {
      db.all(downloadQuery, selectedIds, async (err, rows) => {
        if (err) {
          reject('Error downloading data: ' + err.message);
          return;
        }

        if (!rows.length) {
          reject('No files found with that ID');
          return;
        }

        try {
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

          // Loop through the rows and process each file
          for (const row of rows) {
            const fileName = row.fileName;
            let fileBuffer;

            // Check if the file is stored as a buffer or in the file system
            if (Buffer.isBuffer(row.file)) {
              fileBuffer = row.file;
            } else if (row.filePath) {
              // Read the file from the file path asynchronously
              fileBuffer = await fs.promises.readFile(row.filePath);
            } else {
              console.error(`No file or filePath for ID: ${row.id}`);
              continue; 
            }

            // Append fileBuffer to the archive
            if (fileBuffer) {
              archive.append(fileBuffer, { name: fileName });
            }
          }

          // Finalize the archive after all files are appended
          archive.finalize();
        } catch (error) {
          console.error('Error processing files for ZIP archive:', error);
          reject('Error processing files: ' + error.message);
        }
      });
    });
  });
}
