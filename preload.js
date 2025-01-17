const { contextBridge, ipcRenderer } = require('electron');

// Expose the necessary APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Owners Table
  addData: (data) => ipcRenderer.invoke('addData', data),
  editData: (data) => ipcRenderer.invoke('editData', data),
  deleteData: (id) => ipcRenderer.invoke('deleteData', id),
  getAllData: () => ipcRenderer.invoke('getAllData'),
  getDataById: (id) => ipcRenderer.invoke('getDataById', id),
  getAccountId: (accountId) => ipcRenderer.invoke('getAccountId', accountId)
});
