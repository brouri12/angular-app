import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SubscriptionReminderService } from '../../services/subscription-reminder.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionReminder } from '../../models/subscription-reminder.model';

@Component({
  selector: 'app-subscription-reminders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subscription-reminders.html',
  styleUrl: './subscription-reminders.css'
})
export class SubscriptionReminders implements OnInit, OnDestroy {
  private reminderService = inject(SubscriptionReminderService);
  private authService = inject(AuthService);
  
  showDropdown = signal(false);
  reminders = this.reminderService.reminders;
  reminderCount = this.reminderService.reminderCount;
  unreadCount = signal(0);
  
  private pollingSubscription?: Subscription;
  private currentUserId?: number;
  
  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && (user.id || user.id_user)) {
        this.currentUserId = user.id || user.id_user!;
        this.loadReminders(this.currentUserId);
        this.startPolling(this.currentUserId);
      }
    });
  }
  
  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
  
  loadReminders(userId: number) {
    this.reminderService.getUserReminders(userId).subscribe({
      next: () => {
        const unread = this.reminders().filter(r => !r.isRead).length;
        this.unreadCount.set(unread);
        
        if (this.reminders().length === 0) {
          console.log(`ℹ️ No subscription reminders to display for user ${userId}`);
        } else {
          console.log(`📬 Displaying ${this.reminders().length} reminder(s) for user ${userId}`);
        }
      },
      error: (err) => {
        console.error('❌ Error loading reminders:', err);
      }
    });
  }
  
  startPolling(userId: number) {
    this.pollingSubscription = this.reminderService.startPolling(userId).subscribe();
  }
  
  toggleDropdown() {
    this.showDropdown.update(v => !v);
  }
  
  closeDropdown() {
    this.showDropdown.set(false);
  }
  
  dismissReminder(reminder: SubscriptionReminder, event: Event) {
    event.stopPropagation();
    if (this.currentUserId) {
      this.reminderService.dismissReminder(this.currentUserId, reminder.reminderType).subscribe(() => {
        const unread = this.reminders().filter(r => !r.isRead).length;
        this.unreadCount.set(unread);
      });
    }
  }
  
  markAsRead(reminder: SubscriptionReminder, event: Event) {
    if (!reminder.isRead) {
      reminder.isRead = true;
      const unread = this.reminders().filter(r => !r.isRead).length;
      this.unreadCount.set(unread);
    }
  }
  
  getSeverityColor(reminderType: string): string {
    return this.reminderService.getSeverityColor(reminderType);
  }
  
  getSeverityIcon(reminderType: string): string {
    return this.reminderService.getSeverityIcon(reminderType);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `in ${diffDays} days`;
    }
  }
}
