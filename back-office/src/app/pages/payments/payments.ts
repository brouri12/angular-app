import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, Payment } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments implements OnInit {
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  
  payments = signal<Payment[]>([]);
  loading = signal(true);
  selectedPayment = signal<Payment | null>(null);
  showValidationModal = signal(false);
  validationNotes = '';
  activeTab = signal<'pending' | 'all'>('pending');

  ngOnInit() {
    this.loadPendingPayments();
  }

  setActiveTab(tab: 'pending' | 'all') {
    this.activeTab.set(tab);
    if (tab === 'pending') {
      this.loadPendingPayments();
    } else {
      this.loadAllPayments();
    }
  }

  loadPendingPayments() {
    this.loading.set(true);
    this.paymentService.getPendingPayments().subscribe({
      next: (data) => {
        this.payments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.loading.set(false);
      }
    });
  }

  loadAllPayments() {
    this.loading.set(true);
    this.paymentService.getAllPayments().subscribe({
      next: (data) => {
        this.payments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.loading.set(false);
      }
    });
  }

  openValidationModal(payment: Payment) {
    this.selectedPayment.set(payment);
    this.validationNotes = '';
    this.showValidationModal.set(true);
  }

  validatePayment() {
    const payment = this.selectedPayment();
    const currentUser = this.authService.getCurrentUserValue();
    
    if (!payment || !currentUser) return;

    this.paymentService.validatePayment(
      payment.id_payment!,
      currentUser.id_user!,
      this.validationNotes
    ).subscribe({
      next: () => {
        this.notificationService.success('Payment Validated', 'The payment has been validated successfully!');
        this.closeModal();
        if (this.activeTab() === 'pending') {
          this.loadPendingPayments();
        } else {
          this.loadAllPayments();
        }
      },
      error: (err) => {
        console.error('Error validating payment:', err);
        this.notificationService.error('Validation Failed', 'Error validating payment. Please try again.');
      }
    });
  }

  rejectPayment() {
    const payment = this.selectedPayment();
    const currentUser = this.authService.getCurrentUserValue();
    
    if (!payment || !currentUser) return;

    if (!this.validationNotes.trim()) {
      this.notificationService.warning('Reason Required', 'Please provide a reason for rejection');
      return;
    }

    this.paymentService.rejectPayment(
      payment.id_payment!,
      currentUser.id_user!,
      this.validationNotes
    ).subscribe({
      next: () => {
        this.notificationService.info('Payment Rejected', 'The payment has been rejected');
        this.closeModal();
        if (this.activeTab() === 'pending') {
          this.loadPendingPayments();
        } else {
          this.loadAllPayments();
        }
      },
      error: (err) => {
        console.error('Error rejecting payment:', err);
        this.notificationService.error('Rejection Failed', 'Error rejecting payment. Please try again.');
      }
    });
  }

  viewReceipt(payment: Payment) {
    if (payment.receiptUrl) {
      window.open(this.paymentService.getReceiptUrl(payment.receiptUrl), '_blank');
    } else {
      this.notificationService.info('No Receipt', 'No receipt is available for this payment');
    }
  }

  closeModal() {
    this.showValidationModal.set(false);
    this.selectedPayment.set(null);
    this.validationNotes = '';
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'Validé':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Rejeté':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
