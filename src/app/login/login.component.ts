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
import { LoginDataService } from '../dataservice/login.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, FormsModule, MatButtonModule, MatInputModule, HeaderComponent, FooterComponent, NewUserComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  username: string = '';
  pin: string = '';
  failedAttempts: number = 0;
  maxAttempts: number = 5;
  remainingAttempts: number = this.maxAttempts;
  isButtonDisabled: boolean = false;
  isPinInvalid: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private loginDataService: LoginDataService
  ) { }

  async onSubmit(pinField: any) {
    pinField.control.markAsTouched();
    const result = await this.loginDataService.getAllLoginData(this.pin);
    if (result.success) {
      this.username = result.username;
      localStorage.setItem('username', this.username)
      this.router.navigate(['/home']);
    } else {
      this.handleIncorrectPin();
      return;
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
