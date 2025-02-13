import { Injectable } from '@angular/core';
import { Login } from '../model/login';

@Injectable({
  providedIn: 'root'
})
export class LoginDataService {
  constructor() { }

  addLoginData(data: Login) {
    return (window as any).electron.addLoginData(data);
  }

}
