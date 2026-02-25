# Admin Payment Validation - Implementation Guide

## Overview
This document outlines how to implement the admin panel for validating bank transfer payments.

## Current Status
- ✅ Users can submit bank transfers with receipts
- ✅ Payments are created with status "En attente"
- ❌ No admin interface to validate payments yet
- ❌ Receipts not stored on server yet

## What Needs to Be Built

### 1. Backend: File Storage Service

**Create: `UserService/src/main/java/tn/esprit/user/service/FileStorageService.java`**

```java
@Service
public class FileStorageService {
    
    private final String uploadDir = "uploads/receipts/";
    
    public String storeFile(MultipartFile file) {
        // Generate unique filename
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        
        // Save file to disk
        Path path = Paths.get(uploadDir + filename);
        Files.copy(file.getInputStream(), path);
        
        // Return file URL
        return "/uploads/receipts/" + filename;
    }
    
    public Resource loadFile(String filename) {
        Path path = Paths.get(uploadDir + filename);
        return new UrlResource(path.toUri());
    }
}
```

### 2. Backend: Payment Entity

**Create: `UserService/src/main/java/tn/esprit/user/entity/Payment.java`**

```java
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_payment;
    
    private Long id_user;
    private Long id_abonnement;
    private String nom_client;
    private String email_client;
    private BigDecimal montant;
    private String methode_paiement; // carte, paypal, virement
    private String statut; // En attente, Validé, Rejeté
    private String reference_transaction;
    private String receipt_url; // For bank transfers
    private String stripe_payment_id; // For Stripe payments
    
    @Column(name = "date_paiement")
    private LocalDateTime date_paiement;
    
    @Column(name = "date_validation")
    private LocalDateTime date_validation;
    
    private Long validated_by; // Admin user ID
    
    @Column(columnDefinition = "TEXT")
    private String notes; // Admin notes
    
    // Getters and setters
}
```

### 3. Backend: Payment Controller

**Add to: `UserService/src/main/java/tn/esprit/user/controller/PaymentController.java`**

```java
@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    // Upload receipt
    @PostMapping("/upload-receipt")
    public ResponseEntity<String> uploadReceipt(
        @RequestParam("file") MultipartFile file,
        @RequestParam("paymentId") Long paymentId
    ) {
        String fileUrl = fileStorageService.storeFile(file);
        paymentService.updateReceiptUrl(paymentId, fileUrl);
        return ResponseEntity.ok(fileUrl);
    }
    
    // Get pending payments (admin only)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payment>> getPendingPayments() {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }
    
    // Validate payment (admin only)
    @PutMapping("/{id}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payment> validatePayment(
        @PathVariable Long id,
        @RequestBody ValidationRequest request
    ) {
        return ResponseEntity.ok(
            paymentService.validatePayment(id, request.getAdminId(), request.getNotes())
        );
    }
    
    // Reject payment (admin only)
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payment> rejectPayment(
        @PathVariable Long id,
        @RequestBody ValidationRequest request
    ) {
        return ResponseEntity.ok(
            paymentService.rejectPayment(id, request.getAdminId(), request.getNotes())
        );
    }
    
    // Download receipt
    @GetMapping("/receipt/{filename}")
    public ResponseEntity<Resource> downloadReceipt(@PathVariable String filename) {
        Resource file = fileStorageService.loadFile(filename);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .body(file);
    }
}
```

### 4. Frontend: Payment Service

**Create: `back-office/src/app/services/payment.service.ts`**

```typescript
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8888/user-service/api/payments';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPendingPayments(): Observable<Payment[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Payment[]>(`${this.apiUrl}/pending`, { headers });
  }

  validatePayment(paymentId: number, adminId: number, notes: string): Observable<Payment> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<Payment>(
      `${this.apiUrl}/${paymentId}/validate`,
      { adminId, notes },
      { headers }
    );
  }

  rejectPayment(paymentId: number, adminId: number, notes: string): Observable<Payment> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<Payment>(
      `${this.apiUrl}/${paymentId}/reject`,
      { adminId, notes },
      { headers }
    );
  }

  getReceiptUrl(filename: string): string {
    return `${this.apiUrl}/receipt/${filename}`;
  }
}
```

### 5. Frontend: Admin Payments Page

**Create: `back-office/src/app/pages/payments/payments.ts`**

```typescript
@Component({
  selector: 'app-payments',
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments implements OnInit {
  payments = signal<Payment[]>([]);
  loading = signal(true);
  selectedPayment = signal<Payment | null>(null);
  showValidationModal = signal(false);
  validationNotes = '';

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPendingPayments();
  }

  loadPendingPayments() {
    this.loading.set(true);
    this.paymentService.getPendingPayments().subscribe({
      next: (data) => {
        this.payments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.loading.set(false);
      }
    });
  }

  openValidationModal(payment: Payment) {
    this.selectedPayment.set(payment);
    this.showValidationModal.set(true);
  }

  validatePayment() {
    const payment = this.selectedPayment();
    const currentUser = this.authService.getCurrentUserValue();
    
    if (!payment || !currentUser) return;

    this.paymentService.validatePayment(
      payment.id_payment,
      currentUser.id_user!,
      this.validationNotes
    ).subscribe({
      next: () => {
        alert('Payment validated successfully!');
        this.closeModal();
        this.loadPendingPayments();
      },
      error: (err) => {
        console.error('Error validating payment:', err);
        alert('Error validating payment');
      }
    });
  }

  rejectPayment() {
    const payment = this.selectedPayment();
    const currentUser = this.authService.getCurrentUserValue();
    
    if (!payment || !currentUser) return;

    this.paymentService.rejectPayment(
      payment.id_payment,
      currentUser.id_user!,
      this.validationNotes
    ).subscribe({
      next: () => {
        alert('Payment rejected');
        this.closeModal();
        this.loadPendingPayments();
      },
      error: (err) => {
        console.error('Error rejecting payment:', err);
        alert('Error rejecting payment');
      }
    });
  }

  viewReceipt(payment: Payment) {
    if (payment.receipt_url) {
      window.open(this.paymentService.getReceiptUrl(payment.receipt_url), '_blank');
    }
  }

  closeModal() {
    this.showValidationModal.set(false);
    this.selectedPayment.set(null);
    this.validationNotes = '';
  }
}
```

### 6. Frontend: Admin Payments HTML

**Create: `back-office/src/app/pages/payments/payments.html`**

```html
<div class="p-6">
  <h1 class="text-3xl font-bold mb-6">Pending Payments</h1>

  @if (loading()) {
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(0,200,151)]"></div>
    </div>
  } @else if (payments().length === 0) {
    <div class="text-center py-12 text-gray-500">
      No pending payments
    </div>
  } @else {
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          @for (payment of payments(); track payment.id_payment) {
            <tr>
              <td class="px-6 py-4">
                <div class="font-medium">{{ payment.nom_client }}</div>
                <div class="text-sm text-gray-500">{{ payment.email_client }}</div>
              </td>
              <td class="px-6 py-4">{{ payment.type_abonnement }}</td>
              <td class="px-6 py-4">${{ payment.montant }}</td>
              <td class="px-6 py-4">{{ payment.date_paiement | date }}</td>
              <td class="px-6 py-4">
                <button
                  (click)="viewReceipt(payment)"
                  class="text-[rgb(0,200,151)] hover:underline">
                  View Receipt
                </button>
              </td>
              <td class="px-6 py-4">
                <button
                  (click)="openValidationModal(payment)"
                  class="px-4 py-2 bg-[rgb(0,200,151)] text-white rounded hover:opacity-90">
                  Review
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>

<!-- Validation Modal -->
@if (showValidationModal()) {
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">Review Payment</h2>
      
      @if (selectedPayment()) {
        <div class="space-y-4">
          <div>
            <strong>Client:</strong> {{ selectedPayment()!.nom_client }}
          </div>
          <div>
            <strong>Email:</strong> {{ selectedPayment()!.email_client }}
          </div>
          <div>
            <strong>Amount:</strong> ${{ selectedPayment()!.montant }}
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Notes</label>
            <textarea
              [(ngModel)]="validationNotes"
              rows="3"
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="Add notes (optional)"></textarea>
          </div>

          <div class="flex gap-3">
            <button
              (click)="closeModal()"
              class="flex-1 px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button
              (click)="rejectPayment()"
              class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg">
              Reject
            </button>
            <button
              (click)="validatePayment()"
              class="flex-1 px-4 py-2 bg-[rgb(0,200,151)] text-white rounded-lg">
              Approve
            </button>
          </div>
        </div>
      }
    </div>
  </div>
}
```

### 7. Add Route to Back-Office

**Update: `back-office/src/app/app.routes.ts`**

```typescript
{
  path: 'payments',
  component: Payments,
  canActivate: [AuthGuard]
}
```

### 8. Add Menu Item to Sidebar

**Update: `back-office/src/app/components/sidebar/sidebar.html`**

```html
<a routerLink="/payments" routerLinkActive="active">
  <svg><!-- Payment icon --></svg>
  Payments
</a>
```

## Implementation Priority

1. **High Priority:**
   - Backend file storage
   - Payment entity and repository
   - Admin payments list page

2. **Medium Priority:**
   - Payment validation/rejection
   - Receipt viewing
   - Admin notes

3. **Low Priority:**
   - Email notifications
   - Payment analytics
   - Export functionality

## Testing Checklist

- [ ] Upload receipt file from frontend
- [ ] File is stored on server
- [ ] Admin can see pending payments
- [ ] Admin can view receipt
- [ ] Admin can approve payment
- [ ] Admin can reject payment
- [ ] Status updates correctly
- [ ] User receives notification (future)

