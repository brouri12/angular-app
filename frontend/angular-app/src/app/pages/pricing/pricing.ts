import { Component, signal, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AbonnementService } from '../../services/abonnement.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService, PaymentRequest } from '../../services/payment.service';
import { StripeService } from '../../services/stripe.service';
import { Abonnement, HistoriqueAbonnement } from '../../models/abonnement.model';
import { User } from '../../models/user.model';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

/** Devise affichée : dinar tunisien */
const CURRENCY_TND = 'TND';
const CURRENCY_LABEL = 'DT';

const DEFAULT_ABONNEMENTS: Abonnement[] = [
  { nom: 'Gratuit', description: 'Essai gratuit pour découvrir le niveau créé par les professeurs', prix: 0, duree_jours: 30, niveau_acces: 'Débutant', acces_illimite: false, support_prioritaire: false, statut: 'Actif' },
  { nom: 'Pro', description: 'Pour progresser avec les cours de niveau intermédiaire', prix: 90, duree_jours: 30, niveau_acces: 'Intermédiaire', acces_illimite: false, support_prioritaire: true, statut: 'Actif' },
  { nom: 'Complet', description: 'Accès illimité à tous les niveaux et support prioritaire', prix: 300, duree_jours: 365, niveau_acces: 'Tous niveaux', acces_illimite: true, support_prioritaire: true, statut: 'Actif' },
];

@Component({
  selector: 'app-pricing',
  imports: [CommonModule, FormsModule],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css'
})
export class Pricing implements OnInit, OnDestroy {
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
      q: 'Les niveaux correspondent-ils aux cours des professeurs ?',
      a: 'Oui. Les niveaux (Débutant, Intermédiaire, Tous niveaux) sont ceux créés par les professeurs. En essai gratuit vous pouvez voir un aperçu du niveau avant d’acheter.',
    },
    {
      q: 'Comment fonctionne l’essai gratuit ?',
      a: 'Le plan Gratuit vous permet de découvrir les cours du niveau Débutant sans engagement. Cliquez sur « Voir un aperçu » pour avoir une idée avant d’acheter un niveau.',
    },
    {
      q: 'Quels moyens de paiement acceptez-vous ?',
      a: 'Carte bancaire, PayPal et virement. Les tarifs sont en dinars tunisiens (DT).',
    },
    {
      q: 'Puis-je changer de formule plus tard ?',
      a: 'Oui. Vous pouvez passer à une formule supérieure ou inférieure à tout moment.',
    },
  ];

  ngOnInit() {
    this.recoverTokenFromUrl();
    this.loadAbonnements();
    this.loadCurrentUser();
  }

  private recoverTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      this.authService.saveToken(token);
      (this.authService as any).isAuthenticatedSubject?.next(true);
      this.authService.loadUser();
      const cleanUrl = window.location.pathname + (window.location.hash || '');
      window.history.replaceState({}, '', cleanUrl);
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
        const list = Array.isArray(data) ? data.filter((a: Abonnement) => a.statut === 'Actif') : [];
        this.abonnements.set(list.length > 0 ? list : DEFAULT_ABONNEMENTS);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading abonnements:', err);
        this.abonnements.set(DEFAULT_ABONNEMENTS);
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
      : Math.round(abonnement.prix * 10); // Annuel = 10 mois
    if (prix === 0) return '0 ' + CURRENCY_LABEL;
    return `${prix} ${CURRENCY_LABEL}`;
  }

  getSavings(): string {
    return this.billingCycle() === 'annual' ? 'Économisez 17 %' : '';
  }

  /** Ouvre l’aperçu gratuit (page étudiant ou cours) pour voir le niveau avant d’acheter */
  openApercuGratuit(niveauAcces: string) {
    const base = 'http://localhost:8083/front-office/student.html';
    const params = new URLSearchParams();
    params.set('apercu', '1');
    params.set('niveau', (niveauAcces || 'Débutant').trim());
    window.open(base + '?' + params.toString(), '_blank');
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
    if (this.card) return;
    try {
      this.stripe = await this.stripeService.getStripe();
      if (!this.stripe) {
        alert('Stripe is not loaded. Check your connection and Stripe keys.');
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

      const cardEl = document.getElementById('card-element');
      if (cardEl && !cardEl.hasChildNodes()) {
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
      const amountTND = this.billingCycle() === 'monthly' ? abonnement.prix : Math.round(abonnement.prix * 10);
      // Stripe TND : montant en millimes (1 TND = 1000 millimes)
      const amountMillimes = amountTND * 1000;
      
      const intentResponse = await this.stripeService.createPaymentIntent(amountMillimes, 'tnd').toPromise();
      
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
        // Resolve idUser: use current user or fetch by email so backend can save and create subscription
        let idUser: number | undefined = this.currentUser()?.id_user;
        if (idUser == null && this.purchaseForm.email_client) {
          try {
            const user = await firstValueFrom(this.authService.getUserByEmail(this.purchaseForm.email_client));
            idUser = user?.id_user;
            if (user) this.currentUser.set(user);
          } catch (_) {
            // keep idUser undefined; backend will still save payment (subscription skipped if null)
          }
        }

        const paymentRequest: PaymentRequest = {
          idUser: idUser ?? undefined,
          idAbonnement: abonnement.id_abonnement ?? undefined,
          nomClient: this.purchaseForm.nom_client,
          emailClient: this.purchaseForm.email_client,
          typeAbonnement: abonnement.nom,
          montant: amountTND,
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
            const status = err?.status;
            const msg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : err?.error?.error) ?? err?.message ?? err?.statusText ?? 'Unknown error';
            console.error('Error saving payment:', err?.error || err);
            // Paiement Stripe réussi : on redirige quand même vers l'interface student (le prélèvement est fait)
            this.closePurchaseModal();
            this.paymentSuccessTransaction.set(paymentIntent.id);
            this.showPaymentSuccess.set(true);
            this.playPaymentSuccessSound();
            if (this.successRedirectTimer) clearTimeout(this.successRedirectTimer);
            this.successRedirectTimer = setTimeout(() => this.closeSuccessAndRedirectNow(), 3200);
            /* Pas d'alert : l'overlay animé suffit */
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

  /** Redirection vers l'interface étudiant (port 8083). */
  private redirectToStudentPage() {
    const params = new URLSearchParams();
    const email = this.currentUser()?.email || this.purchaseForm.email_client || '';
    const token = this.authService.getToken();
    if (email) params.set('email', email);
    if (token) params.set('token', token);
    const qs = params.toString();
    const targetUrl = `http://localhost:8083/front-office/student.html${qs ? `?${qs}` : ''}`;
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

  ngOnDestroy() {
    if (this.successRedirectTimer) {
      clearTimeout(this.successRedirectTimer);
      this.successRedirectTimer = null;
    }
    if (this.card && this.card.unmount) {
      try { this.card.unmount(); } catch (_) {}
      this.card = null;
    }
    this.elements = null;
    this.stripe = null;
  }
}
