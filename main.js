const { ipcMain } = require('electron');
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { registerIPCHandlers } = require('./sqlite3.database/ownersService');
const { registerFilesIPCHandlers } = require('./sqlite3.database/fileService');


// Error Handling
process.on('uncaughtException', (error) => {
  console.error("Error Loading, Close the application", error)
});

// Create window and load the app
function createWindow() {
  const win = new BrowserWindow({
    width: 1450,
    height: 1000,
    resizable: true,
    minWidth: 800,
    minHeight: 800,
    icon: 'public/assets/owner.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile('dist/owners-hub-demo/browser/index.html');
  // Open DevTools automatically
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  registerIPCHandlers();
  registerFilesIPCHandlers();

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
