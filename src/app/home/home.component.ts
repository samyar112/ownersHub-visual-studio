import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from '../home/header/header.component';
import { IdleService } from '../utility/idle-screen/idle.service';
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DashboardComponent, HeaderComponent, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  title = 'Owners Hub';
  constructor(
    private idleService: IdleService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.idleService.startWatching(() => this.logoutUser())
  }

  logoutUser() {
    this.snackBar.open('You were idle for too long. Logging out...', 'Close', {
      duration: 5000
    });
    this.dialog.closeAll;
    this.router.navigate(['/idle-screen']);
  }

  ngOnDestroy() {
    this.idleService.stopWatching();
  }
}
