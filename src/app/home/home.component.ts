import { Component } from '@angular/core';
import { SideNavComponent } from "./side-nav/side-nav.component";
import { DashboardComponent } from "./dashboard/dashboard.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SideNavComponent, DashboardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  title = 'Owners Hub';
}
