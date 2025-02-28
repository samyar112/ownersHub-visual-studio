import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../utility/dialog-box/dialog-box.component';
import { LoginCardComponent } from '../../utility/login-card/login-card.component';
import { LoginDataService } from '../../dataservice/login.service';
import { Login } from '../../model/login';


@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [MatButtonModule, LoginCardComponent],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewUserComponent {
  readonly dialog = inject(MatDialog);

  loginArray: Login[] = []
  pin!: string;
  username!: string;
  isExistingUser: boolean = true

  constructor(
    private loginDataService: LoginDataService,
    
  ) { }

  openDialog(isExistingUser: boolean) {
    //const isExistingUser: boolean = true; 
    const dialogRef = this.dialog.open(LoginCardComponent, {
      data: {
        title: isExistingUser ? 'Enter your existing Username and Password' : 'Register to generate a PIN'
      },
      disableClose: true
    });

    const componentInstance = dialogRef.componentInstance as LoginCardComponent;
    if (componentInstance) {
      componentInstance.loginInfo.subscribe(async (loginData: any) => {
        await this.generateUniquePin()
        this.username = loginData.username;
        const allData = {
          username: loginData.username,
          password: loginData.password,
          pin: this.pin
        };
        try {
          await this.loginDataService.addLoginData(allData);
          dialogRef.close();
          this.openPinDialogBox()  
        } catch (error) {
          console.error('Login Upload Failed:', error)
        }
      });
    }
  }

  openPinDialogBox() {
    this.dialog.open(DialogBoxComponent, {
      data: {
        title: 'Registration Successful!',
        description: `Username: ${this.username}`,
        content: `Pin: ${this.pin}`,
        footer: 'Save this PIN for future use. It will be necessary to access the tool on this machine.',
        closeButtonText: 'Close',
        confirmButtonText: 'Okay',
      },
      disableClose: true
    });
  }

  async generateUniquePin(): Promise<string> {
    let newPin;
    let attempts = 0;
    const maxAttempts = 50;
    do {
      // Generate a 4-digit PIN
      newPin = Math.floor(1000 + Math.random() * 9000).toString(); 
      attempts++;

      // Check if the PIN exists in the database
      const response = await this.loginDataService.getAllLoginData(newPin);

      if (!response.success) {
        this.pin = newPin;
        return this.pin; 
      }

      if (attempts >= maxAttempts) {
        throw new Error("Unable to generate a unique PIN. Try again.");
      }

    } while (true);
  }
}
