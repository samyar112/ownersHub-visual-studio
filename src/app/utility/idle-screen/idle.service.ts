import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private time: number = 0;
  private interval: any;
  private running: boolean = false;
  private idleTimeout: number = 10000; // 10 seconds before executing callback
  private idleTimer: any; // Reference for idle timeout

  // Events that detect user activity
  private userActivityEvents = ['mousemove', 'keydown', 'touchstart', 'click'];

  constructor() {
    this.addEventListeners();
  }
  //track user activity
  private addEventListeners() {
    this.userActivityEvents.forEach(event => {
      window.addEventListener(event, () => this.stopTimer());
    });
  }

  // Start the idle timer and execute the callback after the timeout
  startTimer(callback: () => void) {
    clearTimeout(this.idleTimer);

    this.idleTimer = setTimeout(() => {
      if (!this.running) {
        this.running = true;
        this.interval = setInterval(() => {
          this.time++;
        }, 1000);

        // Execute callback function after timeout
        callback();
      }
    }, this.idleTimeout);
  }

  stopTimer() {
    this.running = false;
    clearInterval(this.interval);
    clearTimeout(this.idleTimer);
   
  }
}
