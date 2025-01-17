import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Owner } from '../../../model/owner';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatButtonModule, MatIcon, MatMenuModule],  
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent {
  @Input() ownerData!: Owner; 
  @Output() deleteOwner: EventEmitter<number> = new EventEmitter<number>();  
  @Output() editOwner: EventEmitter<Owner> = new EventEmitter<Owner>();  
  @Output() viewOwner: EventEmitter<Owner> = new EventEmitter<Owner>();  

  constructor() {}

  // Pass the current owner data to the parent
  onEdit() {
    this.editOwner.emit(this.ownerData);  
  }

  onView() {
    this.viewOwner.emit(this.ownerData); 
  }

  onDelete() {
    this.deleteOwner.emit(this.ownerData.id);
  }

  onViewFiles() {
    
  }
}