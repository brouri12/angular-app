import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css'
})
export class PdfViewerComponent {
  @Input() pdfUrl: SafeResourceUrl = '';
  @Input() pdfRawUrl: string = '';
  @Input() bookTitle: string = '';
  @Output() onClose = new EventEmitter<void>();

  // PDF viewer state
  currentPage = signal(1);
  totalPages = signal(0);
  isLoading = signal(true);
  error = signal<string | null>(null);
  zoomLevel = signal(100); // Percentage
  isFullscreen = signal(false);

  // Controls visibility
  showControls = signal(true);
  controlsTimeout: any;

  // Search functionality
  searchText = signal('');
  searchResults = signal<number[]>([]);
  currentSearchIndex = signal(0);

  // Bookmarks
  bookmarks = signal<number[]>([]);

  ngOnInit() {
    this.loadPdf();
  }

  /**
   * Load PDF and detect total pages
   * Note: This requires PDF.js library for full functionality
   */
  loadPdf() {
    if (!this.pdfUrl) {
      this.error.set('PDF URL not provided');
      this.isLoading.set(false);
      return;
    }
    // isLoading will be cleared when the iframe fires its load event
  }

  onIframeLoad() {
    this.isLoading.set(false);
  }

  onIframeError() {
    this.isLoading.set(false);
    this.error.set('Failed to load PDF. Please try again.');
  }

  /**
   * Navigate to page
   */
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.updatePdfViewerPage();
  }

  /**
   * Next page
   */
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  /**
   * Previous page
   */
  prevPage() {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  /**
   * First page
   */
  firstPage() {
    this.goToPage(1);
  }

  /**
   * Last page
   */
  lastPage() {
    this.goToPage(this.totalPages());
  }

  /**
   * Update PDF viewer to show current page
   * Uses PDF.js anchor (page=X) or scrolling
   */
  updatePdfViewerPage() {
    const iframe = document.querySelector('iframe[id="pdfIframe"]') as HTMLIFrameElement;
    if (iframe && this.pdfRawUrl) {
      const baseUrl = this.pdfRawUrl.split('#')[0];
      iframe.src = `${baseUrl}#page=${this.currentPage()}`;
    }
  }

  /**
   * Zoom in (max 200%)
   */
  zoomIn() {
    const newZoom = Math.min(this.zoomLevel() + 10, 200);
    this.zoomLevel.set(newZoom);
  }

  /**
   * Zoom out (min 50%)
   */
  zoomOut() {
    const newZoom = Math.max(this.zoomLevel() - 10, 50);
    this.zoomLevel.set(newZoom);
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom() {
    this.zoomLevel.set(100);
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    this.isFullscreen.set(!this.isFullscreen());
  }

  /**
   * Add current page to bookmarks
   */
  addBookmark() {
    const bookmarks = this.bookmarks();
    if (!bookmarks.includes(this.currentPage())) {
      this.bookmarks.set([...bookmarks, this.currentPage()].sort((a, b) => a - b));
    }
  }

  /**
   * Remove bookmark
   */
  removeBookmark(page: number) {
    this.bookmarks.set(this.bookmarks().filter(b => b !== page));
  }

  /**
   * Go to bookmark
   */
  goToBookmark(page: number) {
    this.goToPage(page);
  }

  /**
   * Search in PDF (requires PDF.js for actual text search)
   */
  search() {
    if (!this.searchText()) return;
    // In production, implement actual text search using PDF.js
    // For now, show placeholder
    this.searchResults.set([1, 3, 5]); // Mock results
  }

  /**
   * Go to next search result
   */
  nextSearchResult() {
    const results = this.searchResults();
    if (results.length === 0) return;
    let nextIndex = (this.currentSearchIndex() + 1) % results.length;
    this.currentSearchIndex.set(nextIndex);
    this.goToPage(results[nextIndex]);
  }

  /**
   * Go to previous search result
   */
  prevSearchResult() {
    const results = this.searchResults();
    if (results.length === 0) return;
    let prevIndex = (this.currentSearchIndex() - 1 + results.length) % results.length;
    this.currentSearchIndex.set(prevIndex);
    this.goToPage(results[prevIndex]);
  }

  /**
   * Show controls temporarily on mouse move
   */
  onMouseMove() {
    this.showControls.set(true);
    clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(() => {
      this.showControls.set(false);
    }, 3000);
  }

  /**
   * Close reader
   */
  close() {
    this.onClose.emit();
  }

  /**
   * Download PDF (with restrictions)
   */
  downloadPdf() {
    const link = document.createElement('a');
    link.href = this.pdfRawUrl;
    link.download = `${this.bookTitle}.pdf`;
    link.click();
  }

  /**
   * Print PDF
   */
  printPdf() {
    const iframe = document.querySelector('iframe[id="pdfIframe"]') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.print();
    }
  }

  /**
   * Format page navigation input
   */
  handlePageInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    const page = parseInt(input);
    if (!isNaN(page)) {
      this.goToPage(page);
    }
  }
}

