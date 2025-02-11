import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { OwnerDataService } from '../../../dataservice/owners.service';
import { FilesDataService } from '../../../dataservice/files.service';
import { Owner } from '../../../model/owner';
import { Files } from '../../../model/files';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../../utility/dialog-box/dialog-box.component';
import { FileUploadCardComponent } from '../../../utility/file-upload-card/file-upload-card.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-view-files',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, CommonModule, MatButtonModule, MatTableModule, MatPaginator, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatMenuModule, MatProgressSpinnerModule ],
  templateUrl: './view-files.component.html',
  styleUrl: './view-files.component.css',
})
export class ViewFilesComponent implements OnInit {
  displayedColumns: string[] = ['select','fileName','fileExtension', 'fileSize', 'dateUploaded', 'star'];
  dataSource: MatTableDataSource<Files> = new MatTableDataSource<Files>();
  selection = new SelectionModel<Files>(true, []);
  readonly dialog = inject(MatDialog);

  filesArray: Files[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 5;
  totalItems = 0;

  ownerId?: any;
  accountId!: number;
  ownerName?: string;
  contactName?: string;
  email?: string;
  phone?: number;
  address?: string;
  city?: string;
  state?: string;
  postal?: number;

  isUploading: boolean = false;
  isSaveLocal: boolean = false;

  constructor(
    private ownerDataService: OwnerDataService,
    private filesDataService: FilesDataService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.ownerId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchData();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  checkboxLabel(row?: Files): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  populateCard(ownerData: Owner) {
      this.accountId = ownerData.accountId,
      this.ownerName = ownerData.ownerName,
      this.contactName = ownerData.contactName,
      this.email = ownerData.email,
      this.phone = ownerData.phone,
      this.address = ownerData.address,
      this.city = ownerData.city,
      this.state = ownerData.state,
      this.postal = ownerData.zip
  }

  async fetchData(): Promise<void> {
    await this.ownerDataService.getOwnersDataById(this.ownerId).then((ownerData: Owner) => {
      this.populateCard(ownerData);
      this.loadFilesofOwner();
    }).catch((error: any) => {
      console.error('Error fetching owner data:', error);
    });
  }

  async loadFilesofOwner() {
     try {
      this.filesArray = await this.filesDataService.getFilesByAccountId(this.accountId);

      this.dataSource.data = this.filesArray;
      this.totalItems = this.filesArray.length;
      // Set the data in the table
      this.dataSource.paginator = this.paginator;
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  }

  setSaveLocal(value: boolean) {
    this.isSaveLocal = value;
    this.onUpload(); 
  }

  onUpload() {
    const dialogRef = this.dialog.open(FileUploadCardComponent, {
      disableClose: true
    });
    
    const componentInstance = dialogRef.componentInstance as FileUploadCardComponent;

    // Listen for the file data emitted by the child component
    if (componentInstance) {
      componentInstance.fileSelected.subscribe(async (fileData: any) => {
        const uploadedFile = fileData.file;
        const allData = {
          file: uploadedFile,
          accountId: this.accountId,
          fileName: fileData.fileName,
          fileExtension: fileData.fileExtension,
          fileSize: fileData.fileSize,
          dateUploaded: fileData.dateUploaded
        };
        // Convert file to ArrayBuffer (binary format) before sending to Electron
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          const binaryData = fileReader.result as ArrayBuffer;
       
          // Send the file as a Blob to Electron via IPC
          allData.file = binaryData;  // Update the file data to send the Blob
          this.isUploading = true
          try {
            if (this.isSaveLocal) {
              await this.filesDataService.saveFilesLocal(allData);
            } else {
              await this.filesDataService.addFilesData(allData);
            }
            
            this.isUploading = false;
            this.loadFilesofOwner();
          } catch (error) {
            this.isUploading = false
            console.error('Upload Failed:', error);
          }
        };

        //// Read the file as ArrayBuffer
        fileReader.readAsArrayBuffer(uploadedFile);
      });
    } else {
      console.error("Dialog component instance is not available.");
    }
  }

  async onDelete(id: number) {
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      data: {
        title: 'Confirm Deletion?',
        content: 'Please confirm if you want to proceed with delete action.',
        closeButtonText: 'Close',
        confirmButtonText: 'Confirm',
      },
      disableClose: true
    });

    dialogRef.componentInstance.confirm.subscribe(async () => {
      try {
        // Finds the file based on the id. 
        const file = this.filesArray.find(f => f.id === id);
          const filePath = file?.filePath;

          if (!filePath) {
            await this.filesDataService.deleteFilesData(id);
          } else {
            // Call the deleteLocalFile method from the service
            await this.filesDataService.deleteLocalFile(filePath!);
            await this.filesDataService.deleteFilesData(id);
          }
        // Refresh the files after deletion
        this.loadFilesofOwner();
      } catch (error: any) {
        alert('Error deleting owner data. Please try again.');
      }
    });
  }

  async onDownload(id: number) {
    try {
      const file = this.filesArray.find(f => f.id === id);
      const filePath = file?.filePath;
      if (!filePath) {
        //const fileData = await this.filesDataService.downloadFilesData(id);
        this.downloadHelper(file?.file || null, 'application/octet-stream', file?.fileName)
      } else {
        const fileData = await this.filesDataService.downloadLocalFile(filePath)
        this.downloadHelper(fileData, 'application/octet-stream', file?.fileName)
      }
     
    } catch (error: any) {
      console.error('Error downloading file:', error);
    }
  }

  async onDownloadAsZip() {
    const selectedIds = this.selection.selected.map(row => row.id);
    if (selectedIds.length > 0) {
      try {
        const fileData = await this.filesDataService.downloadSelectedFiles(selectedIds);
        console.log('fileReceived:', fileData)
        this.downloadHelper(fileData, 'application/zip', 'selected_files.zip')
      } catch (error: any) {
        console.error('Error downloading ZIP file:', error);
      }
    } else {
      this.dialog.open(DialogBoxComponent, {
        data: {
          title: 'No Files Selected',
          content: 'Please select at least one file!',
          closeButtonText: 'Close',
          confirmButtonText: 'OK',
        },
        disableClose: true
      });
    }
  }

  //Helper method to download files and zip
  downloadHelper(blobData: File | null, type: string, fileName?: string,) {

    if (!blobData) {
      throw new Error('File data is empty or not found.');
    }

    const blob = new Blob([blobData], { type: type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName!;
    link.click();

    //Revoke the object URL to release memory
    URL.revokeObjectURL(link.href);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

