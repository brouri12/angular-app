# Payment UI Flow - Visual Guide

## Screen 1: Pricing Page
```
┌─────────────────────────────────────────────────────────┐
│  Choose Your Perfect Plan                               │
│  Flexible pricing options to fit your learning journey  │
│                                                          │
│  [Monthly] [Annual - Save 17%]                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Free    │  │  Pro     │  │ Premium  │             │
│  │  $0/mo   │  │  $29/mo  │  │  $99/mo  │             │
│  │          │  │          │  │          │             │
│  │[Get      │  │[Subscribe│  │[Subscribe│             │
│  │ Started] │  │  Now]    │  │  Now]    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## Screen 2: Purchase Modal (Credit Card/PayPal)
```
┌─────────────────────────────────────────────┐
│  Complete Purchase                      [X] │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Pro Plan                            │   │
│  │ $29 /month                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Full Name                                  │
│  ┌─────────────────────────────────────┐   │
│  │ John Doe                  (auto)    │   │ ← Auto-filled!
│  └─────────────────────────────────────┘   │
│                                             │
│  Email                                      │
│  ┌─────────────────────────────────────┐   │
│  │ john@example.com          (auto)    │   │ ← Auto-filled!
│  └─────────────────────────────────────┘   │
│                                             │
│  Payment Method                             │
│  ┌─────────────────────────────────────┐   │
│  │ Credit Card            ▼            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Cancel]              [Purchase]           │
└─────────────────────────────────────────────┘
```

## Screen 3: Purchase Modal (Bank Transfer Selected)
```
┌─────────────────────────────────────────────┐
│  Complete Purchase                      [X] │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Pro Plan                            │   │
│  │ $29 /month                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Full Name                                  │
│  ┌─────────────────────────────────────┐   │
│  │ John Doe                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Email                                      │
│  ┌─────────────────────────────────────┐   │
│  │ john@example.com                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Payment Method                             │
│  ┌─────────────────────────────────────┐   │
│  │ Bank Transfer          ▼            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ℹ Bank Transfer Instructions:       │   │
│  │ After clicking "Continue", you'll   │   │
│  │ be asked to upload your bank        │   │
│  │ transfer receipt. Your payment will │   │
│  │ be pending until an admin validates │   │
│  │ it.                                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Cancel]              [Continue]           │ ← Changed button!
└─────────────────────────────────────────────┘
```

## Screen 4: Receipt Upload Modal
```
┌─────────────────────────────────────────────┐
│  Upload Bank Receipt                    [X] │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Pro Plan                            │   │
│  │ $29 /month                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠ Important: Please upload a clear  │   │
│  │ image or PDF of your bank transfer  │   │
│  │ receipt. Your subscription will be  │   │
│  │ activated after admin validation.   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Upload Receipt                             │
│  ┌─────────────────────────────────────┐   │
│  │         ⬆                           │   │
│  │    Click to upload                  │   │
│  │  JPG, PNG or PDF (max 5MB)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Back]                    [Submit]         │
└─────────────────────────────────────────────┘
```

## Screen 5: Receipt Selected
```
┌─────────────────────────────────────────────┐
│  Upload Bank Receipt                    [X] │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Pro Plan                            │   │
│  │ $29 /month                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠ Important: Please upload a clear  │   │
│  │ image or PDF of your bank transfer  │   │
│  │ receipt. Your subscription will be  │   │
│  │ activated after admin validation.   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Upload Receipt                             │
│  ┌─────────────────────────────────────┐   │
│  │    ✓ bank_receipt.jpg               │   │ ← File selected!
│  │       Change file                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Back]                    [Submit]         │ ← Now enabled!
└─────────────────────────────────────────────┘
```

## Success Messages

### Credit Card/PayPal Success:
```
┌─────────────────────────────────────────────┐
│  ✓ Payment successful!                      │
│  Transaction: STRIPE-1234567890             │
└─────────────────────────────────────────────┘
```

### Bank Transfer Success:
```
┌─────────────────────────────────────────────┐
│  ✓ Bank transfer submitted successfully!    │
│  Your payment is pending admin validation.  │
│  Transaction: BANK-1234567890               │
└─────────────────────────────────────────────┘
```

## File Validation Errors

### Invalid File Type:
```
┌─────────────────────────────────────────────┐
│  ✗ Please upload a valid image (JPG, PNG)   │
│    or PDF file                              │
└─────────────────────────────────────────────┘
```

### File Too Large:
```
┌─────────────────────────────────────────────┐
│  ✗ File size must be less than 5MB          │
└─────────────────────────────────────────────┘
```

## Key Features Highlighted

1. **Auto-Fill** - Name and email automatically populated
2. **Smart Button** - Changes from "Purchase" to "Continue" for bank transfer
3. **Instructions** - Clear guidance for bank transfer users
4. **File Validation** - Real-time feedback on file selection
5. **Status Messages** - Different messages for different payment methods
6. **Back Navigation** - Users can go back from receipt upload

## Color Scheme

- Primary: `rgb(0,200,151)` - Green (success, buttons)
- Accent: `rgb(255,127,80)` - Orange (highlights, badges)
- Info: Blue (bank transfer instructions)
- Warning: Yellow (important notices)
- Success: Green (checkmarks, success messages)

