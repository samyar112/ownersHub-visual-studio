import { Injectable } from '@angular/core';
import { Owner } from './model/owner'; // Make sure the path is correct

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  constructor() { }

  addData(data: Owner) {
    return (window as any).electron.addData(data);
  }

  editData(data: Owner) {
    return (window as any).electron.editData(data);
  }

  deleteData(id: number) {
    return (window as any).electron.deleteData(id);
  }


  getAllData() {
    return (window as any).electron.getAllData();
  }

  getDataById(id: number) {
    return (window as any).electron.getDataById(id);
  }

  getAccountId(accountId: number) {
    return (window as any).electron.getAccountId(accountId);
  } 
}
