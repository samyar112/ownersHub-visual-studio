import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';


@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewUserComponent {
  readonly dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(DialogBoxComponent);
  }
}

