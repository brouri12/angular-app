import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Loan {
  id: number;
  userId: number;
  bookId: number;
  loanDate: string;
  returnDate: string | null;
  loanStatus: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}

@Component({
  selector: 'app-loans-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loans-admin.html',
  styleUrl: './loans-admin.css'
})
export class LoansAdmin implements OnInit {
  loans = signal<Loan[]>([]);
  loading = signal(false);
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  searchTerm = signal('');
  filterStatus = signal('');

  private baseUrl = 'http://localhost:8078/library/loans';

  filteredLoans = computed(() => {
    let list = this.loans();
    const s = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    
    if (s) list = list.filter(l =>
      l.id.toString().includes(s) ||
      l.userId.toString().includes(s) ||
      l.bookId.toString().includes(s)
    );
    if (status) list = list.filter(l => l.loanStatus === status);
    return list;
  });

  activeCount = computed(() => 
    this.loans().filter(l => l.loanStatus === 'ACTIVE').length
  );
  
  returnedCount = computed(() => 
    this.loans().filter(l => l.loanStatus === 'RETURNED').length
  );
  
  overdueCount = computed(() => 
    this.loans().filter(l => l.loanStatus === 'OVERDUE').length
  );

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loading.set(true);
    this.http.get<Loan[]>(`${this.baseUrl}/all`).subscribe({
      next: loans => {
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: () => {
        this.notify('Failed to load loans', 'error');
        this.loading.set(false);
      }
    });
  }

  returnLoan(id: number) {
    if (!confirm('Mark this loan as returned?')) return;
    
    this.http.post(`${this.baseUrl}/return/${id}`, {}).subscribe({
      next: () => {
        this.notify('Loan returned successfully', 'success');
        this.loadLoans();
      },
      error: () => this.notify('Failed to return loan', 'error')
    });
  }

  deleteLoan(id: number) {
    if (!confirm('Permanently delete this loan? This cannot be undone.')) return;

    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.notify('Loan deleted', 'success');
        this.loadLoans();
      },
      error: () => this.notify('Failed to delete loan', 'error')
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
      RETURNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    } as any)[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  }
}
