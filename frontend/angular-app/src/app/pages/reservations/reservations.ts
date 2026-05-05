import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LibraryService, Reservation, Book } from '../../services/library.service';

interface ReservationWithBook extends Reservation {
  book?: Book;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class ReservationsPage implements OnInit {
  reservations = signal<ReservationWithBook[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  cancellingId = signal<number | null>(null);

  readonly userId = 1;

  constructor(public libraryService: LibraryService, private router: Router) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    this.libraryService.getMyReservations(this.userId).subscribe({
      next: reservations => {
        this.reservations.set(reservations);
        this.loading.set(false);
        // Load book details for each reservation
        reservations.forEach(r => this.loadBookForReservation(r));
      },
      error: () => {
        this.error.set('Could not load reservations.');
        this.loading.set(false);
      }
    });
  }

  loadBookForReservation(reservation: Reservation) {
    this.libraryService.getBook(reservation.bookId).subscribe({
      next: book => {
        this.reservations.update(list =>
          list.map(r => r.id === reservation.id ? { ...r, book } : r)
        );
      },
      error: () => {} // silently ignore
    });
  }

  cancel(reservation: ReservationWithBook) {
    this.cancellingId.set(reservation.id);
    this.libraryService.cancelReservation(reservation.id).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.successMessage.set('Reservation cancelled successfully.');
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadReservations();
      },
      error: () => {
        this.cancellingId.set(null);
        this.error.set('Could not cancel reservation.');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  goToLibrary() {
    this.router.navigate(['/library']);
  }

  getStatusColor(status: string): string {
    return ({
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    } as any)[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    return ({ ACTIVE: '✅', CANCELLED: '❌', COMPLETED: '🏁' } as any)[status] || '📋';
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getCoverGradient(book?: Book): string {
    const gradients = [
      'from-yellow-400 to-orange-500',
      'from-blue-500 to-indigo-600',
      'from-green-400 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-red-400 to-rose-600',
    ];
    const idx = (book?.id || 0) % gradients.length;
    return gradients[idx];
  }
}
