import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  constructor() { }

  private idleTimeout: number = 10 * 1000;
  //private idleTimeout: number = 5 * 60 * 1000;
  private timeoutHandle: any;
  private events: string[] = ['mousemove', 'keydown', 'click', 'touchstart'];

  startWatching(idleCallback: () => void) {
    this.resetTimer(idleCallback);

    // Listen for user activity
    this.events.forEach(event => {
      document.addEventListener(event, () => this.resetTimer(idleCallback));
    });
  }

  private resetTimer(idleCallback: () => void) {
    clearTimeout(this.timeoutHandle); 

    // Start a new countdown
    this.timeoutHandle = setTimeout(() => {
      idleCallback(); 
    }, this.idleTimeout);
  }

  stopWatching() {
    clearTimeout(this.timeoutHandle); 
    this.events.forEach(event => {
      document.removeEventListener(event, () => this.resetTimer(() => { }));
    });
  }
}
