# Install Chart.js in Back-Office

## Installation Command

Run this command in the `back-office` directory:

```bash
cd back-office
npm install chart.js
```

## What Was Changed

### 1. Dashboard HTML (`back-office/src/app/pages/dashboard/dashboard.html`)

Replaced the "Recent Payments" table with 4 chart sections:

1. **Subscription Distribution** (Doughnut Chart)
   - Shows distribution by access level (Basic, Premium, Enterprise)
   
2. **Status Overview** (Pie Chart)
   - Shows Active vs Inactive subscriptions
   
3. **Subscription Popularity** (Bar Chart)
   - Shows count by subscription name
   
4. **Features Overview** (Cards)
   - Priority Support count
   - Unlimited Access count
   - Average Price

### 2. Dashboard TypeScript (`back-office/src/app/pages/dashboard/dashboard.ts`)

Added:
- Chart.js imports and registration
- ViewChild references for canvas elements
- `createCharts()` method to render all charts
- `ngAfterViewInit()` lifecycle hook
- `ngOnDestroy()` to cleanup charts
- Chart instances array for management

### 3. Charts Created

**Doughnut Chart (Access Level)**:
- Colors: Green, Orange, Blue, Yellow
- Shows percentage distribution
- Interactive tooltips

**Pie Chart (Status)**:
- Colors: Green (Active), Red (Inactive)
- Shows percentage distribution
- Interactive tooltips

**Bar Chart (Popularity)**:
- Color: Green gradient
- Shows subscription counts
- Rounded corners
- Clean grid

## After Installation

1. Install Chart.js:
   ```bash
   cd back-office
   npm install chart.js
   ```

2. Restart the development server:
   ```bash
   npm start
   ```

3. Open http://localhost:4201

4. Login and view the dashboard

## Expected Result

You should see:
- 4 stat cards at the top (unchanged)
- 4 chart/card sections below:
  - Top left: Doughnut chart (Access Level Distribution)
  - Top right: Pie chart (Active vs Inactive)
  - Bottom left: Bar chart (Subscription Popularity)
  - Bottom right: Feature cards (Priority Support, Unlimited Access, Average Price)

## Data Source

All charts use real data from the analytics API:
- `GET /api/abonnements/analytics`
- Data comes from AbonnementRepository queries
- Updates automatically when subscriptions change

## Customization

To customize charts, edit the `createCharts()` method in `dashboard.ts`:

```typescript
// Change colors
backgroundColor: ['rgb(0, 200, 151)', 'rgb(255, 127, 80)', ...]

// Change chart type
type: 'doughnut' | 'pie' | 'bar' | 'line' | 'radar' | 'polarArea'

// Adjust options
options: {
  responsive: true,
  plugins: { ... },
  scales: { ... }
}
```

## Troubleshooting

If charts don't appear:

1. Check console for errors
2. Verify Chart.js is installed: `npm list chart.js`
3. Ensure analytics data is loading: Check network tab for `/analytics` call
4. Verify canvas elements exist: Check HTML for `#accessLevelChart`, etc.
5. Check that `createCharts()` is being called after data loads

## Benefits

- Visual representation of subscription data
- Interactive tooltips with percentages
- Responsive design
- Real-time data from backend
- Professional dashboard appearance
- Easy to understand at a glance
