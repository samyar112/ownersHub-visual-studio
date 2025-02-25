import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class IdleService {


  private idleTimeout: number = 20 * 1000;
  //private idleTimeout: number = 5 * 60 * 1000;
  private timeoutHandle: any;
  private events: string[] = ['mousemove', 'keydown', 'click', 'touchstart'];
  private isIdleScreen = false;


  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isIdleScreen = event.url === '/idle-screen' || event.url === '/login';
      }
    });
  }


  startWatching(idleCallback: () => void) {
    this.resetTimer(idleCallback);

    // Listen for user activity
    this.events.forEach(event => {
      document.addEventListener(event, () => this.resetTimer(idleCallback));
    });
  }

  private resetTimer(idleCallback: () => void) {
    if (this.isIdleScreen) {
      return; // ✅ Stop resetting the timer when on idle screen or login
    }
    clearTimeout(this.timeoutHandle);

    // Start a new countdown
    this.timeoutHandle = setTimeout(() => {
      idleCallback();
    }, this.idleTimeout);
  }

  stopWatching() {
    clearTimeout(this.timeoutHandle);
    if (!this.isIdleScreen) {
      this.events.forEach(event => {
        document.removeEventListener(event, () => this.resetTimer(() => { }));
        this.dialog.closeAll();
      });
    }
  }
}
