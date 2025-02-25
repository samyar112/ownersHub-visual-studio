import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MenuComponent } from "./menu/menu.component";
import { Router, RouterLink } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { OwnerDataService } from '../../dataservice/owners.service';
import { FilesDataService } from '../../dataservice/files.service';
import { Owner } from '../../model/owner';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../utility/dialog-box/dialog-box.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatIconModule, MatButtonModule, 
    MenuComponent, MatPaginator, MatPaginatorModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  
  displayedColumns: string[] = ['accountId', 'ownerName', 'contactName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'star'];
  dataSource: MatTableDataSource<Owner> = new MatTableDataSource<Owner>();
  readonly dialog = inject(MatDialog);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 10;
  totalItems = 0;
 
  constructor(
    private ownerDataService: OwnerDataService,
    private filesDataService: FilesDataService,
    private router: Router) {}
  
  ngOnInit() {
    this.loadOwners();
  }

  async loadOwners() {
    try {
      const owners: Owner[] = await this.ownerDataService.getAllOwnersData();
      this.dataSource.data = owners;
      this.totalItems = owners.length;
      // Set the data in the table
      this.dataSource.paginator = this.paginator;
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  }

  onView(ownerData: Owner) {
    this.router.navigate(['/new-owner', ownerData.id], { 
      queryParams: { mode: 'view' } });
  }

  onEdit(ownerData: Owner) {
    this.router.navigate(['/new-owner', ownerData.id], { 
      queryParams: { mode: 'edit' } });
  }

  onViewFiles(ownerData: Owner) {
    this.router.navigate(['/view-files', ownerData.id]);
  }
   
  async onDelete(ownerData: Owner) {
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      data: {
        title: 'Confirm Deletion?',
        description: `Owner Name: ${ownerData.ownerName}`,
        content: 'Please confirm if you want to proceed with delete action.',
        closeButtonText: 'Close',
        confirmButtonText: 'Confirm',
      },
      disableClose: true
    });

    dialogRef.componentInstance.confirm.subscribe(async () => {
      try {
        const files = await this.filesDataService.getFilesByAccountId(ownerData.accountId);
        for (const file of files) {
          const filePath = file?.filePath;
          const fileId = file?.id;
          if (!filePath) {
            await this.filesDataService.deleteFilesData(fileId);
          } else {
            await this.filesDataService.deleteLocalFile(filePath);
            await this.filesDataService.deleteFilesData(fileId);
          }
        }
        await this.ownerDataService.deleteOwnersData(ownerData.id);


        this.loadOwners();
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

