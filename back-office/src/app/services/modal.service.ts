import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<'login' | 'register' | null>(null);
  public modal$ = this.modalSubject.asObservable();

  openLogin() {
    this.modalSubject.next('login');
  }

  openRegister() {
    this.modalSubject.next('register');
  }

  close() {
    this.modalSubject.next(null);
  }
}
