import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ MatIconModule, CommonModule ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isOnline: boolean = navigator.onLine;

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit() {
    // Listen to online and offline events to update network status
    window.addEventListener('online', this.updateNetworkStatus.bind(this));
    window.addEventListener('offline', this.updateNetworkStatus.bind(this));
  }

  //Update the network status based on the online/offline events
  private updateNetworkStatus() {
    this.isOnline = navigator.onLine;
    this.onlineSnackbar();
  }

  private onlineSnackbar() {
    if (this.isOnline == true) {
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
