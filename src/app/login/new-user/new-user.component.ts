import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
//import { ActivatedRoute, RouterLink } from '@angular/router';
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
  pin!: number;
  username!: string;

  constructor(
    private loginDataService: LoginDataService,
    //private route: ActivatedRoute
  ) { }

  openDialog() {
    const dialogRef = this.dialog.open(LoginCardComponent, {
      disableClose: true
    });

    const componentInstance = dialogRef.componentInstance as LoginCardComponent;
    if (componentInstance) {
      componentInstance.loginInfo.subscribe(async (loginData: any) => {
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

  async getAllLoginInfo() {
   this.loginArray = await this.loginDataService.getAllLoginData()
  }

  async openPinDialogBox() {

    this.dialog.open(DialogBoxComponent, {
      data: {
        title: 'You are successfully registered',
        content: `${this.username}, Save this PIN for future use. It will be necessary to access the tool on this machine.`,
        username: this.username, // Include username
        pin: this.pin, // Include generated PIN
        closeButtonText: 'Close',
        confirmButtonText: 'Confirm',
      },
      disableClose: true, // Prevent closing when clicking outside
    });
  }

  async generateRandomPin(): Promise<number> {
   

    // Loop to generate a new pin until it is unique
    do {
      this.pin = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number

      // Async check for uniqueness
      // Wrapping the check in a Promise to simulate async behavior
      await new Promise(resolve => setTimeout(resolve, 0)); // Simulate async behavior (this can be replaced with an actual async task)

    } while (this.loginArray.some(user => user.pin === this.pin)); // Check if the generated PIN already exists

    return this.pin;
  }
}
