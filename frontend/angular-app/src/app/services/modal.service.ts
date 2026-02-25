import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalType = 'login' | 'register' | null;

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalType>(null);
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

  isOpen(): boolean {
    return this.modalSubject.value !== null;
  }

  getCurrentModal(): ModalType {
    return this.modalSubject.value;
  }
}
