import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './home/details/details.component';

const routes: Routes = [
  { 'path': '', component: LoginComponent },
  { 'path': 'login', component: LoginComponent },
  { 'path': 'home', component: HomeComponent },
  { 'path': 'new-owner', component: DetailsComponent },
  { 'path': 'new-owner/:id', component: DetailsComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
