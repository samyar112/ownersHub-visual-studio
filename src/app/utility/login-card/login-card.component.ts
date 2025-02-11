import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatInputModule, MatCardModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './login-card.component.html',
  styleUrl: './login-card.component.css'
})
export class LoginCardComponent {
  userForm: FormGroup;
  isFormSubmitted: boolean = false;
  constructor (
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = new FormGroup({
     
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  async onSubmit() {
    this.isFormSubmitted = true;
    if (this.userForm.invalid) {
      return;
    }
  }
}
