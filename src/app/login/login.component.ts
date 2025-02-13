import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ErrorMessages } from './../error-messages.enum';
import { FooterComponent } from './footer/footer.component';
import { NewUserComponent } from './new-user/new-user.component';
import { HeaderComponent } from '../home/header/header.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, FormsModule, MatButtonModule, MatInputModule, HeaderComponent, FooterComponent, NewUserComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  pin: string = '';
  failedAttempts: number = 0;
  maxAttempts: number = 5;
  remainingAttempts: number = this.maxAttempts;
  isButtonDisabled: boolean = false;
  isPinInvalid: boolean = false;
  errorMessage: string = '';
  // Todo: integrate database later
  expectedPin: string = '1234'

  constructor(private router: Router) {}

   onSubmit(pinField: any) {
    pinField.control.markAsTouched();

    if (this.pin === this.expectedPin) {
      this.router.navigate(['/home']);  // Navigate to the home page
    } else {
      this.handleIncorrectPin();
    }
  }

  // Handle incorrect pin error and update the error message
  private handleIncorrectPin() {
    this.isPinInvalid = true;
    this.failedAttempts++;
      this.remainingAttempts = this.maxAttempts - this.failedAttempts;
    
    if (this.failedAttempts <= this.maxAttempts) {
      this.errorMessage = `${ErrorMessages.IncorrectPin} ${this.remainingAttempts}`;
      this.pin = '';
    } else {
      this.isButtonDisabled = true;
      this.pin = '';
      this.errorMessage = ErrorMessages.TooManyAttempts;
    // Handle the case of too many failed attempts  
    setTimeout(() => {
      this.failedAttempts = 0;  
      this.remainingAttempts = this.maxAttempts;
      this.isButtonDisabled = false; 
      this.errorMessage = ''
      this.pin = ''; 
    }, 10000);  // Timeout for 10 seconds
    }
  }
}

