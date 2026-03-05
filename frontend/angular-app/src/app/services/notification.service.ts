import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  confirmCallback?: () => void;
  cancelCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  success(title: string, message: string) {
    this.show({
      id: this.generateId(),
      type: 'success',
      title,
      message
    });
  }

  error(title: string, message: string) {
    this.show({
      id: this.generateId(),
      type: 'error',
      title,
      message
    });
  }

  warning(title: string, message: string) {
    this.show({
      id: this.generateId(),
      type: 'warning',
      title,
      message
    });
  }

  info(title: string, message: string) {
    this.show({
      id: this.generateId(),
      type: 'info',
      title,
      message
    });
  }

  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void) {
    this.show({
      id: this.generateId(),
      type: 'confirm',
      title,
      message,
      confirmCallback: onConfirm,
      cancelCallback: onCancel
    });
  }

  private show(notification: Notification) {
    this.notificationSubject.next(notification);
  }

  close() {
    this.notificationSubject.next(null);
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
