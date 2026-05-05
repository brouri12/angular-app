import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Reservation {
  id: number;
  userId: number;
  bookId: number;
  reservationDate: string;
  reservationStatus: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  bookTitle?: string;
}

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations-admin.html',
  styleUrl: './reservations-admin.css'
})
export class ReservationsAdmin implements OnInit {
  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  searchTerm = signal('');
  filterStatus = signal('');

  private baseUrl = 'http://localhost:8078/library/reservations';

  filteredReservations = computed(() => {
    let list = this.reservations();
    const s = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    
    if (s) list = list.filter(r =>
      r.id.toString().includes(s) ||
      r.userId.toString().includes(s) ||
      r.bookId.toString().includes(s) ||
      (r.bookTitle || '').toLowerCase().includes(s)
    );
    if (status) list = list.filter(r => r.reservationStatus === status);
    return list;
  });

  activeCount = computed(() => 
    this.reservations().filter(r => r.reservationStatus === 'ACTIVE').length
  );
  
  completedCount = computed(() => 
    this.reservations().filter(r => r.reservationStatus === 'COMPLETED').length
  );
  
  cancelledCount = computed(() => 
    this.reservations().filter(r => r.reservationStatus === 'CANCELLED').length
  );

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    this.http.get<Reservation[]>(`${this.baseUrl}/all`).subscribe({
      next: reservations => {
        this.reservations.set(reservations);
        this.loading.set(false);
      },
      error: () => {
        this.notify('Failed to load reservations', 'error');
        this.loading.set(false);
      }
    });
  }

  cancelReservation(id: number) {
    if (!confirm('Cancel this reservation?')) return;
    
    this.http.post(`${this.baseUrl}/cancel/${id}`, {}).subscribe({
      next: () => {
        this.notify('Reservation cancelled', 'success');
        this.loadReservations();
      },
      error: () => this.notify('Failed to cancel reservation', 'error')
    });
  }

  completeReservation(id: number) {
    if (!confirm('Mark this reservation as completed?')) return;
    
    this.http.post(`${this.baseUrl}/complete/${id}`, {}).subscribe({
      next: () => {
        this.notify('Reservation completed', 'success');
        this.loadReservations();
      },
      error: () => this.notify('Failed to complete reservation', 'error')
    });
  }

  deleteReservation(id: number) {
    if (!confirm('Permanently delete this reservation? This cannot be undone.')) return;

    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.notify('Reservation deleted', 'success');
        this.loadReservations();
      },
      error: () => this.notify('Failed to delete reservation', 'error')
    });
  }

  notify(msg: string, type: 'success' | 'error' = 'success') {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3500);
  }

  getStatusColor(status: string): string {
    return ({
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    } as any)[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }
}
