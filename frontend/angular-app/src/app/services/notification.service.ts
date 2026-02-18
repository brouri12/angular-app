import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private nextId = 0;

  getNotifications = this.notifications.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 5000) {
    const notification: Notification = {
      id: this.nextId++,
      message,
      type,
      duration
    };

    this.notifications.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  success(message: string, duration = 5000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 7000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 5000) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 5000) {
    this.show(message, 'warning', duration);
  }

  remove(id: number) {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  clear() {
    this.notifications.set([]);
  }
}
