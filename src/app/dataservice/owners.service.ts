import { Injectable } from '@angular/core';
import { Owner } from '../model/owner'; 

@Injectable({
  providedIn: 'root'
})
export class OwnerDataService {
  constructor() { }

  addOwnersData(data: Owner) {
    return (window as any).electron.addOwnersData(data);
  }

  editOwnersData(data: Owner) {
    return (window as any).electron.editOwnersData(data);
  }

  deleteOwnersData(id: number) {
    return (window as any).electron.deleteOwnersData(id);
  }


  getAllOwnersData() {
    return (window as any).electron.getAllOwnersData();
  }

  getOwnersDataById(id: number) {
    return (window as any).electron.getOwnersDataById(id);
  }

  getOwnersAccountId(accountId: number) {
    return (window as any).electron.getOwnersAccountId(accountId);
  } 
}
