const { contextBridge, ipcRenderer } = require('electron');

// Expose the necessary APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Owners Table
  addOwnersData: (data) => ipcRenderer.invoke('addOwnersData', data),
  editOwnersData: (data) => ipcRenderer.invoke('editOwnersData', data),
  deleteOwnersData: (id) => ipcRenderer.invoke('deleteOwnersData', id),
  getAllOwnersData: () => ipcRenderer.invoke('getAllOwnersData'),
  getOwnersDataById: (id) => ipcRenderer.invoke('getOwnersDataById', id),
  getOwnersAccountId: (accountId) => ipcRenderer.invoke('getOwnersAccountId', accountId),

  //Files Table
  addFilesData: (data) => ipcRenderer.invoke('addFilesData', data),
  deleteFilesDataa: (id) => ipcRenderer.invoke('deleteFilesData', id),
  getFilesByAccountId: (accountId) => ipcRenderer.invoke('getFilesByAccountId', accountId)

});
