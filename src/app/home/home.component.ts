import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DashboardComponent, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  title = 'Owners Hub';
  isOnline: boolean = navigator.onLine;

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit() {
    // Listen to online and offline events to update network status
    window.addEventListener('online', this.updateNetworkStatus.bind(this));
    window.addEventListener('offline', this.updateNetworkStatus.bind(this));
    this.onlineSnackbar()
  }

   //Update the network status based on the online/offline events
  private updateNetworkStatus() {
    this.isOnline = navigator.onLine;
    this.onlineSnackbar();
  }

  private onlineSnackbar() {
    if (this.isOnline==true) {
      this.snackBar.open('Connected to the internet', 'Close', {
        duration: 4000,
        panelClass: ['green-snackbar']
      });
    } else {
      this.snackBar.open('Not connected to the internet', 'Close', {
        duration: 4000,
        panelClass: ['red-snackbar']
      });
    }
  }
}
