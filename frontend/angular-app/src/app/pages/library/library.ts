import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibraryService, Book } from '../../services/library.service';

export interface BookView extends Book {
  coverUrl: string;
  pdfFullUrl: string;
  purchased: boolean;   // checked on load for PDF books
}

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './library.html',
  styleUrl: './library.css'
})
export class LibraryPage implements OnInit {
  books = signal<BookView[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  reservingBookId = signal<number | null>(null);
  purchasingBookId = signal<number | null>(null);

  searchTerm = '';
  filterCategory = '';
  filterType = '';

  readonly userId = 1;

  filteredBooks = computed(() => {
    let list = this.books();
    const s = this.searchTerm.toLowerCase().trim();
    const cat = this.filterCategory;
    const type = this.filterType;
    if (s) list = list.filter(b =>
      b.title.toLowerCase().includes(s) ||
      b.author.toLowerCase().includes(s) ||
      (b.category || '').toLowerCase().includes(s)
    );
    if (cat) list = list.filter(b => b.category === cat);
    if (type) list = list.filter(b => b.bookType === type);
    return list;
  });

  categories = computed(() => {
    const cats = new Set(this.books().map(b => b.category).filter(Boolean));
    return Array.from(cats).sort();
  });

  booksByCategory = computed(() => {
    const groups: { category: string; books: BookView[] }[] = [];
    for (const cat of this.categories()) {
      const booksInCat = this.filteredBooks().filter(b => b.category === cat);
      if (booksInCat.length > 0) groups.push({ category: cat, books: booksInCat });
    }
    const uncategorized = this.filteredBooks().filter(b => !b.category);
    if (uncategorized.length > 0) groups.push({ category: 'Other', books: uncategorized });
    return groups;
  });

  constructor(private libraryService: LibraryService, private router: Router) {}

  ngOnInit() { this.loadBooks(); }

  loadBooks() {
    this.loading.set(true);
    this.error.set(null);
    this.libraryService.getAllBooks().subscribe({
      next: books => {
        const views: BookView[] = books.map(b => ({
          ...b,
          coverUrl: this.libraryService.getFileUrl(b.coverImageUrl),
          pdfFullUrl: this.libraryService.getFileUrl(b.pdfUrl),
          purchased: false
        }));
        this.books.set(views);
        this.loading.set(false);
        // Check purchase status for PDF books
        views.filter(b => b.bookType === 'PDF').forEach(b => {
          this.libraryService.hasPurchased(this.userId, b.id).subscribe({
            next: res => {
              if (res.purchased) {
                this.books.update(list =>
                  list.map(x => x.id === b.id ? { ...x, purchased: true } : x)
                );
              }
            },
            error: () => {}
          });
        });
      },
      error: () => {
        this.error.set('Could not load books. Make sure the library service is running.');
        this.loading.set(false);
      }
    });
  }

  onFilterChange() { this.books.update(b => [...b]); }

  // Physical book: reserve regardless of availability (waitlist when 0)
  reserve(book: BookView, event: Event) {
    event.stopPropagation();
    this.reservingBookId.set(book.id);
    this.libraryService.reserveBook(book.id, this.userId).subscribe({
      next: () => {
        this.reservingBookId.set(null);
        this.successMessage.set(`"${book.title}" reserved!`);
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadBooks();
      },
      error: () => {
        this.reservingBookId.set(null);
        this.error.set('Reservation failed. Please try again.');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  // PDF book: navigate to detail page to handle purchase/read
  goToPurchase(book: BookView, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/library', book.id]);
  }

  goToReservations() { this.router.navigate(['/reservations']); }
  goToBook(book: BookView) { this.router.navigate(['/library', book.id]); }

  clearFilters() {
    this.searchTerm = '';
    this.filterCategory = '';
    this.filterType = '';
    this.onFilterChange();
  }

  getCoverGradient(book: BookView): string {
    const gradients = [
      'from-yellow-400 to-orange-500',
      'from-blue-500 to-indigo-600',
      'from-green-400 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-red-400 to-rose-600',
      'from-cyan-400 to-blue-500',
      'from-amber-400 to-yellow-600',
      'from-emerald-400 to-green-600',
    ];
    return gradients[(book.id || 0) % gradients.length];
  }

  getAvailabilityColor(book: BookView): string {
    if (!book.availableCopies) return 'text-red-500';
    if (book.availableCopies <= 2) return 'text-orange-500';
    return 'text-green-600 dark:text-green-400';
  }

  getStars(count = 4): string[] {
    return Array.from({ length: 5 }, (_, i) => i < count ? '★' : '☆');
  }

  formatPrice(price: number): string {
    return price ? '$' + price.toFixed(2) : 'Free';
  }
}

