import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../utility/dialog-box/dialog-box.component';
import { LoginCardComponent } from '../../utility/login-card/login-card.component';


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

  openDialog() {
    //const dialogRef = this.dialog.open(LoginCardComponent, {
    this.dialog.open(LoginCardComponent, {
    });
    //const componentInstance = dialogRef.componentInstance as LoginCardComponent;
  }
}
