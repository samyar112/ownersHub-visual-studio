import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';


@Component({
  selector: 'app-dialog-box',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  //changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-box.component.html',
  styleUrl: './dialog-box.component.css'
})
export class DialogBoxComponent {
  @Output() confirm = new EventEmitter<void>();
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    title: string,
    description: string,
    content: string,
    footer: string,
    closeButtonText: string,
    confirmButtonText: string
  }) { }

  onConfirm() {
    this.confirm.emit();
  }
}
