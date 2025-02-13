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

  username!: string;
  password!: string;


  constructor(
    private loginDataService: LoginDataService,
    //private route: ActivatedRoute
  ) { }

  openDialog() {
    const dialogRef = this.dialog.open(LoginCardComponent, {
      disableClose: true
    });

    const pin = 1234
    const componentInstance = dialogRef.componentInstance as LoginCardComponent;
    if (componentInstance) {
      componentInstance.loginInfo.subscribe(async (loginData: any) => {
        const allData = {
          username: loginData.username,
          password: loginData.password,
          pin: pin
        };
        try {
          await this.loginDataService.addLoginData(allData);
          dialogRef.close();
        } catch (error) {
          console.error('Login Upload Failed:', error)
        }
      });
    }
  }
}
