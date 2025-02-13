const { ipcMain } = require('electron');
const { getDb } = require('../sqlite3.database/database');
const path = require('path');

module.exports = { registerOwnersIPCHandlers };
function registerOwnersIPCHandlers() {
  handleAddOwnersData();
  handleEditOwnersData();
  handleDeleteOwnersData();
  handleGetAllOwnersData();
  handleGetOwnersDataById();
  handleGetOwnersAccountId();
}
function handleAddOwnersData() {
  ipcMain.handle('addOwnersData', async (event, data) => {
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
}
function handleEditOwnersData() {
  ipcMain.handle('editOwnersData', async (event, data) => {
    const db = getDb();
    const updateQuery = `
    UPDATE owners 
    SET accountId = ?, ownerName = ?, contactName = ?, email = ?, phone = ?, 
        address = ?, city = ?, state = ?, zip = ? 
    WHERE id = ?
  `;

    return new Promise((resolve, reject) => {
      db.run(updateQuery, [
        data.accountId,  
        data.ownerName,    
        data.contactName,  
        data.email,        
        data.phone,       
        data.address,      
        data.city,         
        data.state,       
        data.zip,          
        data.id            
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
}
function handleDeleteOwnersData() {
  ipcMain.handle('deleteOwnersData', async (event, id) => {
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
}
function handleGetAllOwnersData() {
  ipcMain.handle('getAllOwnersData', async () => {
    const db = getDb();
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM owners ORDER BY accountID DESC';
      db.all(query, [], (err, rows) => {
        if (err) {
          reject('Error fetching owners: ' + err.message);
        } else {
          // Map rows to the correct owner model format
          const owners = rows.map(row => ({
            id: row.id, 
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
}
function handleGetOwnersDataById() {
  ipcMain.handle('getOwnersDataById', async (event, id) => {
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
              id: row.id,
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
}
function handleGetOwnersAccountId() {
  ipcMain.handle('getOwnersAccountId', async (event, accountId) => {
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
}
