# Test Notification System

## Quick Test Steps

### Frontend (localhost:4200)

1. **Open Browser Console** (F12)
2. **Go to Pricing Page** (`/pricing`)
3. **Test Payment Flow**:
   - Click "Get Started" on any plan
   - Fill in the form
   - Select "Bank Transfer" as payment method
   - Try to submit without selecting a file → Should show warning notification
   - Select a large file (>5MB) → Should show warning notification
   - Select a valid file and submit → Should show success notification

4. **Go to Subscription Page** (`/subscription`)
   - If you have an active subscription:
     - Toggle auto-renewal → Should show success notification
     - Click "Cancel Subscription" → Should show confirm dialog
     - Provide reason and confirm → Should show success notification

### Back-Office (localhost:4201)

1. **Open Browser Console** (F12)
2. **Go to Users Page** (`/users`)
3. **Test User Actions**:
   - Click "Edit" on any user → Should show info notification
   - Click toggle status → Should show confirm dialog
   - Confirm → Should show success notification
   - Click delete → Should show confirm dialog
   - Confirm → Should show success notification

4. **Go to Payments Page** (`/payments`)
   - Click "Validate" on a pending payment
   - Click "Validate Payment" → Should show success notification
   - Click "Reject Payment" without notes → Should show warning notification

## Debug Steps if Not Working

### Check 1: Component is Loaded
Open browser console and type:
```javascript
document.querySelector('app-notification')
```
Should return an element, not null.

### Check 2: Service is Available
In browser console:
```javascript
// This won't work directly, but check for errors in console
```

### Check 3: Check for Errors
Look in browser console for:
- Red error messages
- Failed imports
- Template errors

### Check 4: Verify Files Exist
Run in PowerShell:
```powershell
# Frontend
Test-Path "frontend/angular-app/src/app/components/notification/notification.ts"
Test-Path "frontend/angular-app/src/app/components/notification/notification.html"
Test-Path "frontend/angular-app/src/app/components/notification/notification.css"
Test-Path "frontend/angular-app/src/app/services/notification.service.ts"

# Back-office
Test-Path "back-office/src/app/components/notification/notification.ts"
Test-Path "back-office/src/app/components/notification/notification.html"
Test-Path "back-office/src/app/components/notification/notification.css"
Test-Path "back-office/src/app/services/notification.service.ts"
```

All should return `True`.

### Check 5: Restart Dev Servers
Sometimes Angular needs a restart to pick up new components:

```powershell
# Stop both servers (Ctrl+C in their terminals)
# Then restart:

# Frontend
cd frontend/angular-app
npm start

# Back-office (in another terminal)
cd back-office
npm start
```

## Manual Test in Browser Console

Once the app is loaded, you can manually trigger notifications:

### Frontend Test
1. Open `http://localhost:4200`
2. Open browser console (F12)
3. In console, find the Angular component and inject the service (this is tricky in production mode)

### Alternative: Add Test Button

Add this to any component temporarily:

```typescript
testNotification() {
  this.notificationService.success('Test', 'This is a test notification!');
}
```

Then add a button in the HTML:
```html
<button (click)="testNotification()">Test Notification</button>
```

## Common Issues

### Issue 1: "Cannot find module"
- Solution: Restart dev server

### Issue 2: Notifications not showing
- Check if `<app-notification>` is in app.html
- Check browser console for errors
- Verify service is injected correctly

### Issue 3: Old alerts still showing
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check if you're looking at the right file (not cached version)

### Issue 4: Styling issues
- Check if Tailwind CSS is working
- Verify notification.css is loaded
- Check for CSS conflicts
