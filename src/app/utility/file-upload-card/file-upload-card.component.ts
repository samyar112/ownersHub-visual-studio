import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialogClose } from '@angular/material/dialog';
import { MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule,  } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-file-upload-card',
  standalone: true,
  templateUrl: './file-upload-card.component.html',
  styleUrls: ['./file-upload-card.component.css'],
  imports: [CommonModule, MatDialogClose, MatCardModule, MatDialogContent, MatButtonModule, MatIconModule],
})
export class FileUploadCardComponent {
  @Output() fileSelected = new EventEmitter<any>();

  file: File | null = null;
  fileName: string = '';
  fileSize: string = '';
  fileExtension: string = '';
  dateUploaded: string = '';
  isFileLarge: boolean = false;

  constructor(
    private snackBar: MatSnackBar) {

  }
  // Main function to handle file selection
  onFileSelected( event: any): void {
    const selectedFile = event.target.files[0];
    const maxSizeInBytes = 5 * 1024 * 1024;

    if (selectedFile) {

      if (selectedFile.size > maxSizeInBytes) {
        this.handleLargeFile();
        return;
      }

      this.file = selectedFile;
      this.fileName = selectedFile.name;
      this.fileSize = this.formatFileSize(selectedFile.size);
      this.fileExtension = '.' + selectedFile.name.split('.').pop();
      this.dateUploaded = this.formatDate(new Date());
      this.isFileLarge = false;
      
      this.snackBar.open('File selected successfully.', 'Close', {
        duration: 4000
      });
    }
  }
  private handleLargeFile(): void {
    this.snackBar.open('File size exceeds the 5 MB limit. Try another file.', 'Close', {
      duration: 5000
    });
    this.clearFile();
    this.isFileLarge = true;
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
  }

  private formatFileSize(fileSizeInBytes: number): string {
    const fileSizeInKB = fileSizeInBytes / 1024;
    if (fileSizeInKB >= 1024) {
      return (fileSizeInKB / 1024).toFixed(2) + ' MB';
    } else {
      return fileSizeInKB.toFixed(2) + ' KB';
    }
  }

  onUpload(): void {
    if (this.file && !this.isFileLarge) {
      const fileData = {
        file: this.file,
        fileName: this.fileName,
        fileExtension: this.fileExtension,
        fileSize: this.fileSize,
        dateUploaded: this.dateUploaded
      };
      this.snackBar.open('File successfully uploaded.', 'Close', {
        duration: 3000
      });
      // Emit file data
      this.fileSelected.emit(fileData); 
    }
  }

  clearFile() {
    this.file = null;
    this.fileName = '';
    this.fileExtension = '';
    this.fileSize = '';
    this.dateUploaded = '';
  }
}

