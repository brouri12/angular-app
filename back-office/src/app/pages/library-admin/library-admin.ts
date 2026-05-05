import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LibraryAdminService, Book, Category, BookType, LIBRARY_BASE } from '../../services/library-admin.service';
import { Theme } from '../../services/theme';

@Component({
  selector: 'app-library-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './library-admin.html',
  styleUrl: './library-admin.css'
})
export class LibraryAdmin implements OnInit {
  books = signal<Book[]>([]);
  loading = signal(false);
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  showForm = signal(false);
  editingBook: Book | null = null;
  deleting = signal<number | null>(null);
  saving = signal(false);
  uploadingCover = signal(false);
  uploadingPdf = signal(false);

  searchTerm = signal('');
  filterCategory = signal('');
  filterType = signal('');

  form: Book = this.emptyBook();

  readonly categories: Category[] = ['KIDS', 'LITERATURE', 'SCIENCE', 'HISTORY', 'TECHNOLOGY'];
  readonly bookTypes: BookType[] = ['PHYSICAL', 'PDF'];
  readonly uploadBase = `${LIBRARY_BASE}/files/upload`;

  availableCount = computed(() => this.books().filter(b => b.availableCopies > 0).length);
  pdfCount = computed(() => this.books().filter(b => b.bookType === 'PDF').length);

  filteredBooks = computed(() => {
    let list = this.books();
    const s = this.searchTerm().toLowerCase().trim();
    const cat = this.filterCategory();
    const type = this.filterType();
    if (s) list = list.filter(b =>
      b.title.toLowerCase().includes(s) ||
      b.author.toLowerCase().includes(s) ||
      (b.isbn || '').toLowerCase().includes(s)
    );
    if (cat) list = list.filter(b => b.category === cat);
    if (type) list = list.filter(b => b.bookType === type);
    return list;
  });

  constructor(
    private svc: LibraryAdminService,
    private http: HttpClient,
    public themeService: Theme
  ) {}

  ngOnInit() { this.loadBooks(); }

  loadBooks() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: books => { this.books.set(books); this.loading.set(false); },
      error: () => { this.notify('Failed to load books', 'error'); this.loading.set(false); }
    });
  }

  openCreate() { this.editingBook = null; this.form = this.emptyBook(); this.showForm.set(true); }
  openEdit(book: Book) { this.editingBook = book; this.form = { ...book }; this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.editingBook = null; }

  onCoverFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingCover.set(true);
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<{ url: string }>(this.uploadBase, fd).subscribe({
      next: res => { this.form = { ...this.form, coverImageUrl: res.url }; this.uploadingCover.set(false); },
      error: () => { this.notify('Cover upload failed', 'error'); this.uploadingCover.set(false); }
    });
  }

  onPdfFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingPdf.set(true);
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<{ url: string }>(this.uploadBase, fd).subscribe({
      next: res => { this.form = { ...this.form, pdfUrl: res.url }; this.uploadingPdf.set(false); },
      error: () => { this.notify('PDF upload failed', 'error'); this.uploadingPdf.set(false); }
    });
  }

  getFilePreviewUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const url = `http://localhost:8078${path}`;
    console.log('[BackOffice] File preview URL:', path, '->', url);
    return url;
  }

  save() {
    if (!this.form.title?.trim()) { this.notify('Title is required', 'error'); return; }
    if (!this.form.author?.trim()) { this.notify('Author is required', 'error'); return; }
    if (!this.form.category) { this.notify('Category is required', 'error'); return; }
    if (!this.form.bookType) { this.notify('Book type is required', 'error'); return; }

    // Enforce copies constraint before saving
    if (this.form.totalCopies < 0) this.form.totalCopies = 0;
    if (this.form.availableCopies < 0) this.form.availableCopies = 0;
    if (this.form.availableCopies > this.form.totalCopies) {
      this.form.availableCopies = this.form.totalCopies;
    }

    this.saving.set(true);
    const wasEditing = !!this.editingBook;
    const op = this.editingBook?.id
      ? this.svc.update(this.editingBook.id, this.form)
      : this.svc.create(this.form);

    op.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadBooks();
        this.notify(wasEditing ? '✅ Book updated!' : '✅ Book created!', 'success');
      },
      error: () => { this.saving.set(false); this.notify('❌ Failed to save book', 'error'); }
    });
  }

  confirmDelete(book: Book) {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    this.deleting.set(book.id!);
    this.svc.delete(book.id!).subscribe({
      next: () => { this.deleting.set(null); this.loadBooks(); this.notify('Book deleted.', 'success'); },
      error: () => { this.deleting.set(null); this.notify('❌ Failed to delete book', 'error'); }
    });
  }

  notify(msg: string, type: 'success' | 'error' = 'success') {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3500);
  }

  onTotalCopiesChange() {
    if (this.form.totalCopies < 0) this.form.totalCopies = 0;
    if (this.form.availableCopies > this.form.totalCopies) {
      this.form.availableCopies = this.form.totalCopies;
    }
  }

  onAvailableCopiesChange() {
    if (this.form.availableCopies < 0) this.form.availableCopies = 0;
    if (this.form.availableCopies > this.form.totalCopies) {
      this.form.availableCopies = this.form.totalCopies;
      this.notify(`Available copies capped to total (${this.form.totalCopies})`, 'error');
    }
  }

  emptyBook(): Book {
    return { title: '', author: '', isbn: '', coverImageUrl: '', category: 'LITERATURE', bookType: 'PHYSICAL', price: 0, totalCopies: 1, availableCopies: 1, pdfUrl: '' };
  }

  formatPrice(price: number): string {
    return price ? '$' + price.toFixed(2) : 'Free';
  }

  getCategoryColor(cat: string): string {
    return ({
      KIDS: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
      LITERATURE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      SCIENCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      HISTORY: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      TECHNOLOGY: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    } as any)[cat] || 'bg-gray-100 text-gray-800';
  }

  getTypeColor(type: string): string {
    return type === 'PDF' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white';
  }

  getAvailabilityColor(book: Book): string {
    if (!book.availableCopies) return 'text-red-500';
    if (book.availableCopies <= 2) return 'text-orange-500';
    return 'text-green-600';
  }
}
