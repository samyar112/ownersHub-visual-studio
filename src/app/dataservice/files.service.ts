import { Injectable } from '@angular/core';
import { Files } from '../model/files';

@Injectable({
  providedIn: 'root'
})
export class FilesDataService {
  constructor() { }

  saveFilesLocal(data: Files) {
    return (window as any).electron.saveFilesLocal(data);
  }

  addFilesData(data: Files) {
    return (window as any).electron.addFilesData(data);
  }

  deleteFilesData(id: number) {
    return (window as any).electron.deleteFilesData(id);
  }

  deleteLocalFile(filePath: string) {
    return (window as any).electron.deleteLocalFile(filePath);
  }

  getFilesByAccountId(accountId: number) {
    return (window as any).electron.getFilesByAccountId(accountId);
  }

  downloadLocalFile(filePath: string) {
    return (window as any).electron.downloadLocalFile(filePath);
  }
  

  downloadSelectedFiles(selectedIds: number[]) {
    return (window as any).electron.downloadSelectedFiles(selectedIds);
  }
}
