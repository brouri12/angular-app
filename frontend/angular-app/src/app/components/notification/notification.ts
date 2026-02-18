import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
  notifications = this.notificationService.getNotifications();

  remove(id: number) {
    this.notificationService.remove(id);
  }
}
