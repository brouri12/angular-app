import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibraryService, Book } from '../../services/library.service';

declare var Stripe: any;

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetailPage implements OnInit {
  book = signal<Book | null>(null);
  loading = signal(true);
  purchased = signal(false);
  purchasing = signal(false);
  reserving = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  _coverUrl = '';
  _pdfRawUrl = '';

  readonly userId = 1;
  elements: any = null;
  paymentElement: any = null;
  showPaymentForm = signal(false);
  clientSecret = '';

  stripe: any = null;

  @ViewChild('paymentContainer') paymentContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private libraryService: LibraryService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBook(id);
    this.loadStripe();
  }

  loadBook(id: number) {
    console.log('[BookDetail] Loading book:', id);
    this.loading.set(true);
    this.libraryService.getBook(id).subscribe({
      next: book => {
        console.log('[BookDetail] Book loaded:', book);
        this.book.set(book);

        // Pre-resolve URLs once
        this._coverUrl = this.libraryService.getFileUrl(book.coverImageUrl);
        this._pdfRawUrl = this.libraryService.getFileUrl(book.pdfUrl);

        console.log('[BookDetail] Cover URL:', this._coverUrl);
        console.log('[BookDetail] PDF URL:', this._pdfRawUrl);

        this.loading.set(false);
        this.checkPurchased(book.id);
      },
      error: (err) => {
        console.error('[BookDetail] Book loading error:', err);
        this.error.set('Book not found or failed to load.');
        this.loading.set(false);
      }
    });
  }

  checkPurchased(bookId: number) {
    this.libraryService.hasPurchased(this.userId, bookId).subscribe({
      next: res => this.purchased.set(res.purchased),
      error: () => this.purchased.set(false)
    });
  }

  loadStripe() {
    console.log('[BookDetail] Loading Stripe configuration...');
    this.libraryService.getStripeConfig().subscribe({
      next: config => {
        console.log('[BookDetail] Stripe config received:', config);
        if (!config.publishableKey) {
          console.error('[BookDetail] No publishable key in config');
          this.error.set('Stripe configuration error. Contact support.');
          return;
        }

        if (typeof Stripe !== 'undefined') {
          console.log('[BookDetail] Stripe.js already loaded, initializing...');
          this.stripe = Stripe(config.publishableKey);
          console.log('[BookDetail] Stripe initialized:', this.stripe);
        } else {
          console.log('[BookDetail] Stripe.js not loaded, loading from CDN...');
          // Dynamically load Stripe.js if not already loaded
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.onload = () => {
            console.log('[BookDetail] Stripe.js loaded from CDN, initializing...');
            this.stripe = Stripe(config.publishableKey);
            console.log('[BookDetail] Stripe initialized:', this.stripe);
          };
          script.onerror = () => {
            console.error('[BookDetail] Failed to load Stripe.js from CDN');
            this.error.set('Failed to load payment system. Please refresh.');
          };
          document.head.appendChild(script);
        }
      },
      error: (err) => {
        console.error('[BookDetail] Failed to load Stripe config:', err);
        this.error.set('Failed to initialize payment system. Please refresh.');
      }
    });
  }

  startPurchase() {
    const book = this.book();
    if (!book || !this.stripe) {
      this.error.set('Payment system not ready. Please refresh and try again.');
      return;
    }

    this.purchasing.set(true);
    this.error.set(null);

    this.libraryService.createPaymentIntent(book.id, this.userId).subscribe({
      next: res => {
        this.clientSecret = res.clientSecret;
        this.purchasing.set(false);
        this.showPaymentForm.set(true);
        // Mount Stripe Elements after view updates
        setTimeout(() => this.mountStripeElements(), 100);
      },
      error: (err) => {
        this.purchasing.set(false);
        const msg = err?.error?.error || err?.message || 'Could not initiate payment. Please try again.';
        this.error.set(msg);
      }
    });
  }

  mountStripeElements() {
    if (!this.stripe || !this.clientSecret) return;

    this.elements = this.stripe.elements({ clientSecret: this.clientSecret });
    this.paymentElement = this.elements.create('payment');

    const container = document.getElementById('stripe-payment-element');
    if (container) {
      this.paymentElement.mount(container);
    }
  }

  async submitPayment() {
    if (!this.stripe || !this.elements) return;

    this.purchasing.set(true);
    this.error.set(null);

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        this.purchasing.set(false);
        this.error.set(error.message || 'Payment failed. Please try again.');
        return;
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        this.purchasing.set(false);
        this.error.set('Payment was not completed. Please try again.');
        return;
      }

      // Payment successful, confirm with backend
      this.libraryService.confirmPurchase(
        this.book()!.id,
        this.userId,
        paymentIntent.id
      ).subscribe({
        next: () => {
          this.purchasing.set(false);
          this.purchased.set(true);
          this.showPaymentForm.set(false);
          this.successMessage.set('✅ Purchase successful! You can now read this book.');
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: () => {
          this.purchasing.set(false);
          // Payment went through but recording failed — still grant access
          this.purchased.set(true);
          this.showPaymentForm.set(false);
          this.successMessage.set('💳 Payment successful! Access granted.');
        }
      });
    } catch (err: any) {
      this.purchasing.set(false);
      this.error.set(err.message || 'Payment processing failed');
    }
  }

  cancelPayment() {
    this.showPaymentForm.set(false);
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
  }

  reserve() {
    const book = this.book();
    if (!book) return;
    this.reserving.set(true);
    this.error.set(null);
    // Import LibraryService reservation method
    this.libraryService.reserveBook(book.id, this.userId).subscribe({
      next: () => {
        this.reserving.set(false);
        this.successMessage.set(
          book.availableCopies > 0
            ? `"${book.title}" reserved successfully!`
            : `Added to waitlist for "${book.title}"!`
        );
        setTimeout(() => this.successMessage.set(null), 4000);
        // Reload book to reflect updated availability
        this.loadBook(book.id);
      },
      error: () => {
        this.reserving.set(false);
        this.error.set('Reservation failed. Please try again.');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  goBack() { this.router.navigate(['/library']); }

  getCoverUrl(): string { return this._coverUrl; }

  getCoverGradient(): string {
    const gradients = [
      'from-yellow-400 to-orange-500',
      'from-blue-500 to-indigo-600',
      'from-green-400 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-red-400 to-rose-600',
    ];
    return gradients[(this.book()?.id || 0) % gradients.length];
  }

  formatPrice(price: number): string {
    return price ? '$' + price.toFixed(2) : 'Free';
  }

  getCategoryColor(cat: string): string {
    return ({
      KIDS: 'bg-pink-100 text-pink-800',
      LITERATURE: 'bg-purple-100 text-purple-800',
      SCIENCE: 'bg-blue-100 text-blue-800',
      HISTORY: 'bg-amber-100 text-amber-800',
      TECHNOLOGY: 'bg-cyan-100 text-cyan-800',
    } as any)[cat] || 'bg-gray-100 text-gray-800';
  }
}
