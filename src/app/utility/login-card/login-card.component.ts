import { Component, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogClose } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Login } from '../../model/login';
import { LoginDataService } from '../../dataservice/login.service';


@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatInputModule, MatCardModule, MatDialogClose, MatButtonModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './login-card.component.html',
  styleUrl: './login-card.component.css'
})
export class LoginCardComponent {
  @Output() loginInfo = new EventEmitter<any>();
  userForm: FormGroup;
  isFormSubmitted: boolean = false;
  loginArray: Login[] = []
  pin: string = ''
  usernameExists: boolean = false;
  
  constructor(
    private loginService: LoginDataService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = new FormGroup({
     
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  async onSubmit() {
   this.isFormSubmitted = true;
   if (this.userForm.valid) {
     const result = await this.loginService.getAllLoginData(this.pin);
     this.loginArray = result;

     const newUsername = this.userForm.value.username;
     // Iterate through the array of usernames
     const usernameExists = this.loginArray.some(user => user === newUsername);
     if (usernameExists) {
       this.userForm.controls['username'].setErrors({ usernameTaken: true });
       return;
     }
      const loginData: Login = {
        username: newUsername.trim().toLowerCase(),
        password: this.userForm.value.password,
        pin: ''
      };

      this.snackBar.open('Successfully Registered', 'Close', {
        duration: 3000
      });
      //Emit file Data
      this.loginInfo.emit(loginData);
    }
  }
}
