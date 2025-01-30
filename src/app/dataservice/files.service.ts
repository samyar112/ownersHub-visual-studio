import { Injectable } from '@angular/core';
import { Files } from '../model/files';

@Injectable({
  providedIn: 'root'
})
export class FilesDataService {

  constructor() { }

  addFilesData(data: Files) {
    return (window as any).electron.addFilesData(data);
  }

  deleteFilesData(id: number) {
    return (window as any).electron.deleteFilesData(id);
  }

  getFilesByAccountId(accountId: number) {
    return (window as any).electron.getFilesByAccountId(accountId);
  }

  downloadFilesData(id: number) {
    return (window as any).electron.downloadFilesData(id);
  }

  downloadSelectedFiles(selectedIds: number[]) {
    return (window as any).electron.downloadSelectedFiles(selectedIds);
  }

}
