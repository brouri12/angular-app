import {
  Component, Input, Output, EventEmitter, OnChanges,
  SimpleChanges, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { StripeService } from '../../services/stripe.service';
import { RegistrationService } from '../../services/registration.service';

const SPONSORSHIP_AMOUNT = 50; // USD

@Component({
  selector: 'app-sponsor-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sponsor-modal.component.html',
  styleUrls: ['./sponsor-modal.component.css']
})
export class SponsorModalComponent implements OnChanges {
  @Input() open = false;
  @Input() eventId: number | null = null;
  @Input() clubId: number | null = null;
  @Input() eventTitle = '';
  @Output() closed = new EventEmitter<void>();
  @Output() sponsored = new EventEmitter<void>();

  @ViewChild('cardEl') cardElRef!: ElementRef;

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;

  loading = false;
  errorMsg = '';
  successMsg = '';
  amount = SPONSORSHIP_AMOUNT;

  constructor(
    private stripeService: StripeService,
    private registrationService: RegistrationService
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      this.errorMsg = '';
      this.successMsg = '';
      // init Stripe after view renders
      setTimeout(() => this.initStripe(), 100);
    }
    if (changes['open'] && !this.open) {
      this.destroyCard();
    }
  }

  private async initStripe() {
    this.stripe = await this.stripeService.getStripe();
    if (!this.stripe || !this.cardElRef) return;

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1a1a1a',
          '::placeholder': { color: '#aab7c4' }
        }
      }
    });
    this.card.mount(this.cardElRef.nativeElement);
  }

  private destroyCard() {
    if (this.card) {
      this.card.destroy();
      this.card = null;
    }
  }

  async pay() {
    if (!this.stripe || !this.card || !this.eventId || !this.clubId) return;

    this.loading = true;
    this.errorMsg = '';

    try {
      // 1. Create payment intent on backend
      const intent: any = await this.stripeService
        .createPaymentIntent(this.amount, 'usd')
        .toPromise();

      const clientSecret = intent?.clientSecret;
      if (!clientSecret) throw new Error('Payment intent creation failed');

      // 2. Confirm card payment
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: this.card }
      });

      if (result.error) {
        this.errorMsg = result.error.message || 'Payment failed';
        this.loading = false;
        return;
      }

      // 3. Mark event as sponsored
      this.registrationService.sponsorEvent(this.eventId, this.clubId).subscribe({
        next: () => {
          this.successMsg = `Payment successful! Your club is now sponsoring "${this.eventTitle}".`;
          this.loading = false;
          this.sponsored.emit();
        },
        error: (err) => {
          this.errorMsg = err?.error || 'Payment succeeded but sponsorship update failed.';
          this.loading = false;
        }
      });

    } catch (e: any) {
      this.errorMsg = e?.message || 'An error occurred';
      this.loading = false;
    }
  }

  close() {
    this.destroyCard();
    this.closed.emit();
  }
}
