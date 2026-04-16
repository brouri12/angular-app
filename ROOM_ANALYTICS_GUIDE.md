# Room Utilization Dashboard - Implementation Guide

## Overview
The Room Utilization Dashboard provides comprehensive analytics on how rooms are being used in your language school. It helps admins optimize room scheduling and identify underutilized or overutilized spaces.

---

## Features

### 📊 Key Metrics
- **Total Rooms**: Number of rooms in the system
- **Active Rooms**: Rooms with at least one schedule this week
- **Underutilized Rooms**: Rooms with < 30% utilization
- **Average Utilization**: Overall utilization percentage across all rooms

### 📈 Analytics
1. **Room Utilization Table**
   - Room name and location
   - Capacity
   - Number of schedules
   - Hours per week
   - Utilization percentage (visual bar)
   - Peak day and time slot
   - Status (UNDERUTILIZED, OPTIMAL, OVERUTILIZED)

2. **Schedules by Day Chart**
   - Bar chart showing schedule distribution across weekdays
   - Identifies busiest days

3. **Schedules by Time Slot Chart**
   - Morning (8-12), Afternoon (12-17), Evening (17-20)
   - Shows peak usage times

4. **Smart Recommendations**
   - Suggests rooms for more scheduling
   - Warns about overutilized rooms
   - Identifies unused rooms
   - Provides actionable insights

---

## How It Works

### Backend Logic

**Utilization Calculation:**
```
Utilization % = (Total Hours Used / 40 Working Hours) × 100

Working Hours = 8 hours/day × 5 days = 40 hours/week
```

**Status Classification:**
- **UNDERUTILIZED**: < 30% utilization
- **OPTIMAL**: 30-80% utilization
- **OVERUTILIZED**: > 80% utilization

**Peak Analysis:**
- Analyzes schedules by day of week
- Groups schedules by time slots
- Identifies most used days and times per room

### Data Source
- Analyzes current week's schedules (Monday to Sunday)
- Pulls data from `planifications` table
- Joins with `salles` (rooms) table

---

## API Endpoint

**GET** `/api/analytics/rooms`

**Response:**
```json
{
  "totalRooms": 5,
  "activeRooms": 4,
  "underutilizedRooms": 1,
  "averageUtilization": 62.5,
  "roomUtilizations": [
    {
      "roomId": 1,
      "roomName": "A-101",
      "location": "Building A, Floor 1",
      "capacity": 30,
      "totalSchedules": 12,
      "hoursPerWeek": 25.0,
      "utilizationPercentage": 62.5,
      "peakDay": "MONDAY",
      "peakTimeSlot": "Morning (8-12)",
      "status": "OPTIMAL"
    }
  ],
  "schedulesByDay": {
    "MONDAY": 15,
    "TUESDAY": 12,
    "WEDNESDAY": 18,
    "THURSDAY": 10,
    "FRIDAY": 8
  },
  "schedulesByTimeSlot": {
    "Morning (8-12)": 35,
    "Afternoon (12-17)": 20,
    "Evening (17-20)": 8
  },
  "recommendations": [
    "Room utilization is well balanced at 63%.",
    "You have 1 underutilized room(s). Consider scheduling more classes in: B-202"
  ]
}
```

---

## Usage

### Access the Dashboard
1. Login to back-office: http://localhost:4201
2. Click "Room Analytics" in the sidebar
3. View real-time analytics

### Interpreting the Data

**Underutilized Rooms (Yellow):**
- Less than 30% usage
- Action: Schedule more classes here
- Benefit: Better space utilization

**Optimal Rooms (Green):**
- 30-80% usage
- Action: Maintain current scheduling
- Status: Well balanced

**Overutilized Rooms (Red):**
- More than 80% usage
- Action: Redistribute some classes to other rooms
- Risk: No flexibility for changes

### Example Scenarios

**Scenario 1: Underutilized Room**
```
Room B-202: 25% utilization (10 hours/week)
Recommendation: Schedule 2-3 more classes here
Benefit: Save costs by potentially closing another room
```

**Scenario 2: Overutilized Room**
```
Room A-101: 90% utilization (36 hours/week)
Recommendation: Move some classes to Room B-202
Benefit: More flexibility for schedule changes
```

**Scenario 3: Unused Room**
```
Room C-301: 0% utilization (0 hours/week)
Recommendation: Either schedule classes or consider closing
Benefit: Reduce maintenance costs
```

---

## Technical Implementation

### Backend Files Created:
1. `RoomUtilizationDTO.java` - Room metrics data structure
2. `RoomAnalyticsSummaryDTO.java` - Overall analytics data structure
3. `RoomAnalyticsService.java` - Analytics calculation logic
4. `RoomAnalyticsController.java` - REST API endpoint

### Frontend Files Created:
1. `room-analytics.component.ts` - Component logic
2. `room-analytics.component.html` - UI template
3. `room-analytics.component.css` - Styling

### Modified Files:
1. `planification.service.ts` - Added `getRoomAnalytics()` method
2. `app.routes.ts` - Added route for `/room-analytics`
3. `sidebar.ts` - Added navigation menu item

---

## Testing

### Test the Feature:

1. **Restart PlanificationService** (to load new code)
   - Stop service in IntelliJ
   - Click green play button to restart

2. **Create Test Data** (if needed)
   - Add some rooms in Rooms page
   - Create schedules in Schedules page
   - Assign schedules to different rooms

3. **View Analytics**
   - Go to back-office: http://localhost:4201
   - Click "Room Analytics" in sidebar
   - Should see dashboard with metrics

4. **Verify Calculations**
   - Check utilization percentages
   - Verify peak days/times
   - Read recommendations

### Expected Results:
- ✅ Dashboard loads without errors
- ✅ Metrics display correctly
- ✅ Charts show schedule distribution
- ✅ Table shows all rooms with utilization
- ✅ Recommendations are relevant
- ✅ Status colors match utilization levels

---

## Benefits

### For Admins:
- **Data-Driven Decisions**: Make scheduling decisions based on real data
- **Cost Optimization**: Identify rooms that can be closed or consolidated
- **Better Planning**: See peak times and plan accordingly
- **Quick Insights**: Visual dashboard shows status at a glance

### For the School:
- **Resource Optimization**: Use rooms more efficiently
- **Cost Savings**: Reduce maintenance on unused rooms
- **Better Scheduling**: Avoid overloading specific rooms
- **Capacity Planning**: Know when to add or remove rooms

---

## Future Enhancements

Potential improvements:
1. **Historical Trends**: Track utilization over months
2. **Predictive Analytics**: Forecast future room needs
3. **Export Reports**: Download PDF/Excel reports
4. **Email Alerts**: Notify when rooms are underutilized
5. **Room Comparison**: Compare multiple rooms side-by-side
6. **Custom Time Ranges**: Analyze specific date ranges
7. **Equipment Tracking**: Track room equipment usage
8. **Maintenance Scheduling**: Schedule maintenance during low-usage periods

---

## Troubleshooting

### Dashboard shows no data:
- Check if rooms exist in database
- Verify schedules are created for current week
- Check browser console for errors
- Verify PlanificationService is running

### Utilization seems wrong:
- Verify schedule times are correct
- Check if schedules are in current week
- Ensure room assignments are correct

### Backend errors:
- Check IntelliJ console for exceptions
- Verify database connection
- Ensure all DTOs are properly imported

---

## Summary

The Room Utilization Dashboard is a powerful tool for optimizing room usage in your language school. It provides:
- Real-time analytics on room usage
- Visual charts and metrics
- Smart recommendations
- Easy-to-understand status indicators

Use it regularly to make informed decisions about room scheduling and resource allocation!

---

**End of Guide**
