# Quick Reference - Notification System

## 🚀 Quick Start (2 Minutes)

```powershell
# 1. Stop both apps (Ctrl+C in terminals)

# 2. Restart Frontend
cd frontend/angular-app
npm start

# 3. Restart Back-Office (new terminal)
cd back-office
npm start

# 4. Clear cache: Ctrl+Shift+Delete → Clear data

# 5. Test: http://localhost:4200/test-notifications
```

## 📝 Usage in Code

```typescript
// Import
import { NotificationService } from '../../services/notification.service';

// Inject
private notificationService = inject(NotificationService);

// Success (green)
this.notificationService.success('Title', 'Message');

// Error (red)
this.notificationService.error('Title', 'Message');

// Warning (yellow)
this.notificationService.warning('Title', 'Message');

// Info (blue)
this.notificationService.info('Title', 'Message');

// Confirm (green gradient)
this.notificationService.confirm(
  'Title',
  'Message',
  () => { /* on confirm */ },
  () => { /* on cancel (optional) */ }
);
```

## 🎨 Notification Types

| Type | Color | Icon | Use For |
|------|-------|------|---------|
| Success | Green | ✓ | Successful operations |
| Error | Red | ✗ | Failed operations |
| Warning | Yellow | ⚠ | Validation errors |
| Info | Blue | ℹ | Information |
| Confirm | Green Gradient | ? | Confirmations |

## 📍 Test Pages

### Frontend
- **Test Page**: http://localhost:4200/test-notifications
- **Pricing**: http://localhost:4200/pricing
- **Subscription**: http://localhost:4200/subscription

### Back-Office
- **Users**: http://localhost:4201/users
- **Payments**: http://localhost:4201/payments
- **Subscriptions**: http://localhost:4201/subscriptions

## ✅ What's Updated

### Frontend
- ✅ Pricing page (8 alerts)
- ✅ Subscription page (4 alerts)

### Back-Office
- ✅ Users page (5 alerts)
- ✅ Payments page (4 alerts)
- ✅ Subscriptions page (6 alerts)

**Total: 27+ replacements**

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Still seeing browser alerts | Restart apps + clear cache |
| Notifications not showing | Check console (F12) for errors |
| "Cannot find module" error | Restart dev server |
| Template errors | Verify files exist |

## 📚 Documentation

- `ALL_ALERTS_REPLACED.md` - Complete overview
- `ACTION_REQUIRED.md` - What to do now
- `NOTIFICATION_SYSTEM_READY.md` - Full guide
- `SUBSCRIPTIONS_PAGE_UPDATED.md` - Latest changes

## 🎯 Expected Behavior

### ✅ Working
- Styled modal appears
- Colored icon shows
- Smooth animation
- Green gradient buttons
- Backdrop blur
- No browser alerts

### ❌ Not Working
- Browser alert() still shows
- No modal appears
- Console errors

## 💡 Quick Tips

1. **Always restart** after adding new components
2. **Clear cache** to see changes
3. **Check console** (F12) for errors
4. **Use test page** to verify it works
5. **Hard refresh** with Ctrl+F5

## 🎉 Features

- 5 notification types
- Smooth animations
- Color-coded
- Green gradient theme
- Dark mode support
- Responsive
- Accessible
- Type-safe
- Zero dependencies

---

**Remember:** Restart both apps to activate! 🚀
