import { Injectable } from '@angular/core';
import { Login } from '../model/login';

@Injectable({
  providedIn: 'root'
})
export class LoginDataService {
  constructor() { }

  loginData(data: Login) {
    return (window as any).electron.loginData(data);
  }

  loginParameters(data: Login) {
    return (window as any).electron.loginParameters(data);
  }

  loginUpdate(data: Login) {
    return (window as any).electron.loginUpdate(data);
  }

  getAllLoginData(pin: string) {
    return (window as any).electron.getAllLoginData(pin);
  }
}
