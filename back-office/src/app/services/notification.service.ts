import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  confirmCallback?: () => void;
  cancelCallback?: () => void;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Single notification (used by notification.component.ts)
  notification$ = new BehaviorSubject<Notification | null>(null);
  private nextId = 1;

  success(title: string, message?: string): void {
    this.show(title, message || '', 'success');
  }

  error(title: string, message?: string): void {
    this.show(title, message || '', 'error');
  }

  info(title: string, message?: string): void {
    this.show(title, message || '', 'info');
  }

  warning(title: string, message?: string): void {
    this.show(title, message || '', 'warning');
  }

  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void): void {
    this.notification$.next({
      id: this.nextId++,
      title,
      message,
      type: 'confirm',
      confirmCallback: onConfirm,
      cancelCallback: onCancel
    });
  }

  close(): void {
    this.notification$.next(null);
  }

  private show(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.notification$.next({ id: this.nextId++, title, message, type });
    setTimeout(() => this.close(), 5000);
  }
}
