# Quick Start - Dashboard with Charts

## Installation Complete! ✅

Chart.js has been installed successfully (version 4.5.1).

## Start the Back-Office

### Option 1: Use the script
```bash
.\START_BACKOFFICE.ps1
```

### Option 2: Manual start
```bash
cd back-office
npm start
```

## View the Dashboard

1. Open your browser: http://localhost:4201
2. Login with admin credentials
3. View the dashboard

## What You'll See

### 4 Stat Cards (Top)
- Total Subscriptions
- Active Plans
- Average Price
- Revenue Potential

### 4 Chart Sections (Below)

**Top Left - Subscription Distribution (Doughnut Chart)**
- Shows distribution by access level
- Colors: Green (Basic), Orange (Premium), Blue (Enterprise)
- Interactive tooltips with percentages

**Top Right - Status Overview (Pie Chart)**
- Shows Active vs Inactive subscriptions
- Colors: Green (Active), Red (Inactive)
- Percentage breakdown

**Bottom Left - Subscription Popularity (Bar Chart)**
- Shows count by subscription name
- Green gradient bars
- Hover for exact counts

**Bottom Right - Features Overview (Cards)**
- Priority Support count
- Unlimited Access count
- Average Price

## Data Source

All data comes from real database queries:
- Database: `abonnement_db.abonnements`
- Endpoint: `GET /api/abonnements/analytics`
- Queries: 9 methods in `AbonnementRepository`

## Troubleshooting

### Charts not showing?
1. Check browser console for errors (F12)
2. Verify services are running:
   - AbonnementService: http://localhost:8084
   - API Gateway: http://localhost:8888
3. Check network tab for `/analytics` API call

### No data in charts?
1. Verify database has subscriptions
2. Check that subscriptions have `statut = 'Active'`
3. Run this SQL to check:
   ```sql
   SELECT * FROM abonnement_db.abonnements;
   ```

### npm vulnerabilities warning?
This is normal. To fix:
```bash
cd back-office
npm audit fix
```

## Next Steps

The dashboard is now ready with:
- ✅ Real analytics from database
- ✅ Interactive charts
- ✅ Professional UI
- ✅ Responsive design

Enjoy your new analytics dashboard!
