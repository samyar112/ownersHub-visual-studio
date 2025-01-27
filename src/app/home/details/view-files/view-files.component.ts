import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { OwnerDataService } from '../../../dataservice/owners.service';
import { FilesDataService } from '../../../dataservice/files.service';
import { Owner } from '../../../model/owner';
import { Files } from '../../../model/files';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-view-files',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, CommonModule, MatButtonModule, MatTableModule, MatPaginator, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatMenuModule],
  templateUrl: './view-files.component.html',
  styleUrl: './view-files.component.css',
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewFilesComponent implements OnInit {
  displayedColumns: string[] = ['select','fileName','fileExtension', 'fileSize', 'dateUploaded', 'star'];
  dataSource: MatTableDataSource<Files> = new MatTableDataSource<Files>();
  selection = new SelectionModel<Files>(true, []);
  readonly dialog = inject(MatDialog);

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


  file!: Blob;
  fileId!: any;
  fileName?: string; 
  fileSize?: string;
  fileExtension?: string;
  dateUploaded?: string;



  constructor(
    private ownerDataService: OwnerDataService,
    private filesDataService: FilesDataService,
    private route: ActivatedRoute,
    private router: Router
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

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  populateCard(ownerData: Owner) {
    console.log(ownerData);
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
       const files: Files[] = await this.filesDataService.getFilesByAccountId(this.accountId);
       this.dataSource.data = files;
       this.fileId = files.map(file => file.id)
       console.log(files);
      this.totalItems = files.length;
      // Set the data in the table
      this.dataSource.paginator = this.paginator;
    } catch (error) {
      console.error('Error loading owners:', error);
    }
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
        }
        await this.filesDataService.addFilesData(allData);
        this.loadFilesofOwner();

      });
    } else {
      console.error("Dialog component instance is not available.");
    }
  }

  onDownload() {
    //TODO
  }

  async onDelete() {
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
        await this.filesDataService.deleteFilesData(this.fileId);
      } catch (error: any) {
        alert('Error deleting owner data. Please try again.');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

