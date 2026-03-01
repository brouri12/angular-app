import { Component, signal, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbonnementService } from '../../services/abonnement.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService, PaymentRequest } from '../../services/payment.service';
import { StripeService } from '../../services/stripe.service';
import { Abonnement, HistoriqueAbonnement } from '../../models/abonnement.model';
import { User } from '../../models/user.model';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-pricing',
  imports: [CommonModule, FormsModule],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css'
})
export class Pricing implements OnInit {
  private abonnementService = inject(AbonnementService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private stripeService = inject(StripeService);
  
  @ViewChild('cardElement') cardElement!: ElementRef;
  
  billingCycle = signal<'monthly' | 'annual'>('monthly');
  abonnements = signal<Abonnement[]>([]);
  loading = signal(true);
  showPurchaseModal = signal(false);
  showReceiptUpload = signal(false);
  showStripeForm = signal(false);
  showPaymentSuccess = signal(false);
  selectedAbonnement = signal<Abonnement | null>(null);
  currentUser = signal<User | null>(null);
  selectedReceipt = signal<File | null>(null);
  processingPayment = signal(false);
  paymentSuccessTransaction = signal('');
  confettiPieces = Array.from({ length: 28 }, (_, i) => i);
  
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;
  private successRedirectTimer: ReturnType<typeof setTimeout> | null = null;
  
  purchaseForm = {
    nom_client: '',
    email_client: '',
    methode_paiement: 'carte'
  };

  faqs = [
    {
      q: 'Can I switch plans later?',
      a: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes, all paid plans come with a 7-day free trial. No credit card required for the Free plan.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
    },
    {
      q: 'Can I get a refund?',
      a: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.',
    },
  ];

  ngOnInit() {
    this.loadAbonnements();
    this.loadCurrentUser();
  }

  ngOnDestroy() {
    if (this.successRedirectTimer) {
      clearTimeout(this.successRedirectTimer);
      this.successRedirectTimer = null;
    }
  }

  loadCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  loadAbonnements() {
    this.loading.set(true);
    this.abonnementService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements.set(data.filter(a => a.statut === 'Actif'));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading abonnements:', err);
        this.loading.set(false);
      }
    });
  }

  setBillingCycle(cycle: 'monthly' | 'annual') {
    this.billingCycle.set(cycle);
  }

  getPrice(abonnement: Abonnement): string {
    const prix = this.billingCycle() === 'monthly' 
      ? abonnement.prix 
      : abonnement.prix * 10; // Annual = 10 months price
    return `$${prix}`;
  }

  getSavings(): string {
    return this.billingCycle() === 'annual' ? 'Save 17%' : '';
  }

  openPurchaseModal(abonnement: Abonnement) {
    this.selectedAbonnement.set(abonnement);
    
    // Auto-fill user data if logged in
    const user = this.currentUser();
    if (user) {
      this.purchaseForm.nom_client = `${user.prenom || ''} ${user.nom || ''}`.trim();
      this.purchaseForm.email_client = user.email;
    }
    
    this.showPurchaseModal.set(true);
  }

  closePurchaseModal() {
    this.showPurchaseModal.set(false);
    this.showReceiptUpload.set(false);
    this.showStripeForm.set(false);
    this.selectedAbonnement.set(null);
    this.selectedReceipt.set(null);
    
    // Clean up Stripe
    if (this.card) {
      this.card.destroy();
      this.card = null;
    }
    
    this.purchaseForm = {
      nom_client: '',
      email_client: '',
      methode_paiement: 'carte'
    };
  }

  submitPurchase() {
    const abonnement = this.selectedAbonnement();
    if (!abonnement) return;

    const methode = this.purchaseForm.methode_paiement;

    // If bank transfer, show receipt upload
    if (methode === 'virement') {
      this.showReceiptUpload.set(true);
      return;
    }

    // For credit card or PayPal, show Stripe form
    if (methode === 'carte' || methode === 'paypal') {
      this.showStripeForm.set(true);
      setTimeout(() => this.initializeStripe(), 100);
      return;
    }
  }

  async initializeStripe() {
    try {
      this.stripe = await this.stripeService.getStripe();
      if (!this.stripe) {
        alert('Failed to load Stripe');
        return;
      }

      this.elements = this.stripe.elements();
      this.card = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a'
          }
        }
      });

      const cardElement = document.getElementById('card-element');
      if (cardElement) {
        this.card.mount('#card-element');
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      alert('Failed to initialize payment form');
    }
  }

  async processStripePayment() {
    const abonnement = this.selectedAbonnement();
    if (!abonnement || !this.stripe || !this.card) return;

    this.processingPayment.set(true);

    try {
      const amount = this.billingCycle() === 'monthly' ? abonnement.prix : abonnement.prix * 10;
      
      // Create payment intent
      const intentResponse = await this.stripeService.createPaymentIntent(amount, 'usd').toPromise();
      
      if (!intentResponse || !intentResponse.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        intentResponse.clientSecret,
        {
          payment_method: {
            card: this.card,
            billing_details: {
              name: this.purchaseForm.nom_client,
              email: this.purchaseForm.email_client
            }
          }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Save payment record
        const currentUser = this.currentUser();
        const paymentRequest: PaymentRequest = {
          idUser: currentUser?.id_user,
          idAbonnement: abonnement.id_abonnement,
          nomClient: this.purchaseForm.nom_client,
          emailClient: this.purchaseForm.email_client,
          typeAbonnement: abonnement.nom,
          montant: amount,
          methodePaiement: this.purchaseForm.methode_paiement,
          referenceTransaction: paymentIntent.id,
          stripePaymentId: paymentIntent.id
        };

        this.paymentService.createPayment(paymentRequest).subscribe({
          next: () => {
            this.closePurchaseModal();
            this.showPaymentSuccessExperience(paymentIntent.id);
          },
          error: (err) => {
            console.error('Error saving payment:', err);
            alert('Payment succeeded but failed to save record. Please contact support.');
          }
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message || 'Unknown error'}`);
    } finally {
      this.processingPayment.set(false);
    }
  }

  cancelStripeForm() {
    this.showStripeForm.set(false);
    if (this.card) {
      this.card.destroy();
      this.card = null;
    }
  }

  onReceiptSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (images and PDFs)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      this.selectedReceipt.set(file);
    }
  }

  submitBankTransfer() {
    const abonnement = this.selectedAbonnement();
    const receipt = this.selectedReceipt();
    
    if (!abonnement || !receipt) {
      alert('Please select a receipt file');
      return;
    }

    const currentUser = this.currentUser();
    
    // Create payment with PENDING status
    const paymentRequest: PaymentRequest = {
      idUser: currentUser?.id_user,
      idAbonnement: abonnement.id_abonnement,
      nomClient: this.purchaseForm.nom_client,
      emailClient: this.purchaseForm.email_client,
      typeAbonnement: abonnement.nom,
      montant: this.billingCycle() === 'monthly' ? abonnement.prix : abonnement.prix * 10,
      methodePaiement: 'virement',
      referenceTransaction: `BANK-${Date.now()}`
    };

    // Create payment first
    this.paymentService.createPayment(paymentRequest).subscribe({
      next: (payment) => {
        // Then upload receipt
        this.paymentService.uploadReceipt(payment.id_payment!, receipt).subscribe({
          next: (updatedPayment) => {
            alert(`Bank transfer submitted successfully! Your payment is pending admin validation. Transaction: ${updatedPayment.referenceTransaction}`);
            this.closePurchaseModal();
          },
          error: (err) => {
            console.error('Error uploading receipt:', err);
            alert('Payment created but receipt upload failed. Please contact support.');
            this.closePurchaseModal();
          }
        });
      },
      error: (err) => {
        console.error('Error submitting bank transfer:', err);
        alert('Error submitting bank transfer. Please try again.');
      }
    });
  }

  cancelReceiptUpload() {
    this.showReceiptUpload.set(false);
    this.selectedReceipt.set(null);
  }

  private redirectToStudentPage() {
    const email = encodeURIComponent(this.currentUser()?.email || this.purchaseForm.email_client || '');
    const targetUrl = `${window.location.protocol}//${window.location.hostname}:8083/front-office/student.html${email ? `?email=${email}` : ''}`;
    window.location.href = targetUrl;
  }

  closeSuccessAndRedirectNow() {
    this.showPaymentSuccess.set(false);
    this.redirectToStudentPage();
  }

  private showPaymentSuccessExperience(transactionId: string) {
    this.paymentSuccessTransaction.set(transactionId || '');
    this.showPaymentSuccess.set(true);
    this.playPaymentSuccessSound();
    if (this.successRedirectTimer) clearTimeout(this.successRedirectTimer);
    this.successRedirectTimer = setTimeout(() => {
      this.closeSuccessAndRedirectNow();
    }, 3200);
  }

  private playPaymentSuccessSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = now + idx * 0.11;
        const stop = start + 0.22;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, stop);
        osc.start(start);
        osc.stop(stop);
      });
    } catch (_) {
      // no-op when audio is blocked by browser policy
    }
  }
}
