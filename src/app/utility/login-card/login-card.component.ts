import { Component, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Login } from '../../model/login';


@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatInputModule, MatCardModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './login-card.component.html',
  styleUrl: './login-card.component.css'
})
export class LoginCardComponent {
  @Output() loginInfo = new EventEmitter<any>();
  userForm: FormGroup;
  isFormSubmitted: boolean = false;
  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = new FormGroup({
     
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onSubmit() {
    this.isFormSubmitted = true;
    //if (this.userForm.valid) {
      const loginData: Login = {
        username: this.userForm.value.username,
        password: this.userForm.value.password
      };
      this.snackBar.open('File successfully uploaded.', 'Close', {
        duration: 3000
      });
      //Emit file Data
      this.loginInfo.emit(loginData);
    //}

    //clearFile() {
    //  this.file = null;
    //  this.fileName = '';
    //  this.fileExtension = '';
    //  this.fileSize = '';
    //  this.dateUploaded = '';
    //}
  }

}
