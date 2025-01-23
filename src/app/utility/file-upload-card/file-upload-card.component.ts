import { Component } from '@angular/core';
import { MatDialogClose } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload-card',
  standalone: true,
  templateUrl: './file-upload-card.component.html',
  styleUrls: ['./file-upload-card.component.css'],
  imports: [CommonModule, MatDialogClose, MatCardModule, MatButtonModule, MatIconModule],
})
export class FileUploadCardComponent {
  selectedFile: File | null = null;
  fileName: string = '';
  fileSize: string = '';

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
      this.fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB'; // Convert size to MB
    }
  }

  onDeleteFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = '';
  }

}

