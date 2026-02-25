import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SubscriptionService, UserSubscription } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './subscription.html',
  styleUrl: './subscription.css'
})
export class Subscription implements OnInit {
  currentSubscription = signal<UserSubscription | null>(null);
  subscriptionHistory = signal<UserSubscription[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showCancelModal = signal(false);
  cancelReason = '';

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSubscription();
    this.loadHistory();
  }

  loadSubscription() {
    this.loading.set(true);
    this.error.set(null);

    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (subscription) => {
        this.currentSubscription.set(subscription);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading subscription:', err);
        if (err.status === 204) {
          // No subscription found
          this.currentSubscription.set(null);
        } else {
          this.error.set('Failed to load subscription');
        }
        this.loading.set(false);
      }
    });
  }

  loadHistory() {
    this.subscriptionService.getSubscriptionHistory().subscribe({
      next: (history) => {
        this.subscriptionHistory.set(history);
      },
      error: (err) => {
        console.error('Error loading history:', err);
      }
    });
  }

  toggleAutoRenew() {
    const current = this.currentSubscription();
    if (!current) return;

    const newValue = !current.autoRenew;
    
    this.subscriptionService.toggleAutoRenew(newValue).subscribe({
      next: (updated) => {
        this.currentSubscription.set(updated);
        alert(`Auto-renewal ${newValue ? 'enabled' : 'disabled'} successfully!`);
      },
      error: (err) => {
        console.error('Error toggling auto-renew:', err);
        alert('Failed to update auto-renewal setting');
      }
    });
  }

  openCancelModal() {
    this.showCancelModal.set(true);
  }

  closeCancelModal() {
    this.showCancelModal.set(false);
    this.cancelReason = '';
  }

  confirmCancel() {
    if (!this.cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    this.subscriptionService.cancelSubscription(this.cancelReason).subscribe({
      next: (cancelled) => {
        this.currentSubscription.set(cancelled);
        this.closeCancelModal();
        alert('Subscription cancelled successfully');
        this.loadHistory();
      },
      error: (err) => {
        console.error('Error cancelling subscription:', err);
        alert('Failed to cancel subscription');
      }
    });
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'EXPIRED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'SUSPENDED': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getDaysRemainingText(days: number): string {
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  }
}
