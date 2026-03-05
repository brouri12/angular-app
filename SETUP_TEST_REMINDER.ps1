# Setup Test Reminder for User 33
Write-Host "=== Setup Test Reminder Data ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "Current Date: 2026-03-05" -ForegroundColor Yellow
Write-Host "User: 33 (admin@wordly.com)" -ForegroundColor Yellow
Write-Host "Payment Date: 2026-02-08" -ForegroundColor Yellow
Write-Host ""

Write-Host "Choose a test scenario:" -ForegroundColor Cyan
Write-Host "1. EXPIRED - Already expired (RED alert)" -ForegroundColor Red
Write-Host "   Duration: 20 days -> Expires 2026-02-28 (5 days ago)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. EXPIRING_TODAY - Expires today (ORANGE alert)" -ForegroundColor Yellow
Write-Host "   Duration: 25 days -> Expires 2026-03-05 (today)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. EXPIRING_SOON - Expires in 3 days (YELLOW alert)" -ForegroundColor Yellow
Write-Host "   Duration: 28 days -> Expires 2026-03-08 (3 days)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. EXPIRING_SOON - Expires in 7 days (YELLOW alert)" -ForegroundColor Yellow
Write-Host "   Duration: 32 days -> Expires 2026-03-12 (7 days)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. NO REMINDER - Expires in 17 days" -ForegroundColor Green
Write-Host "   Duration: 42 days -> Expires 2026-03-22 (17 days)" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

$duration = switch ($choice) {
    "1" { 20 }
    "2" { 25 }
    "3" { 28 }
    "4" { 32 }
    "5" { 42 }
    default { 
        Write-Host "Invalid choice. Using option 3 (expires in 3 days)" -ForegroundColor Red
        28 
    }
}

Write-Host ""
Write-Host "Updating database..." -ForegroundColor Yellow

# SQL command
$sql = @"
UPDATE abonnements 
SET duree_jours = $duration 
WHERE id_abonnement = (
    SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1
);

SELECT 
    p.id_user,
    p.date_paiement,
    a.duree_jours,
    DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY) as expiration_date,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) as days_until_expiration
FROM payments p
JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33;
"@

Write-Host "SQL Command:" -ForegroundColor Gray
Write-Host $sql -ForegroundColor DarkGray
Write-Host ""

Write-Host "To execute this SQL:" -ForegroundColor Yellow
Write-Host "1. Open MySQL Workbench or command line" -ForegroundColor White
Write-Host "2. Connect to database on port 3307" -ForegroundColor White
Write-Host "3. Select 'user_db' database" -ForegroundColor White
Write-Host "4. Run the SQL command above" -ForegroundColor White
Write-Host ""

Write-Host "Or use this command:" -ForegroundColor Yellow
Write-Host "mysql -u root -P 3307 -h localhost user_db -e `"UPDATE abonnements SET duree_jours = $duration WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);`"" -ForegroundColor Gray
Write-Host ""

Write-Host "After updating:" -ForegroundColor Cyan
Write-Host "1. Trigger manual check:" -ForegroundColor White
Write-Host "   curl -X POST http://localhost:8888/abonnement-service/api/subscription-reminders/check-now" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Or restart AbonnementService" -ForegroundColor White
Write-Host ""
Write-Host "3. Login to frontend and check bell icon" -ForegroundColor White
Write-Host ""
Write-Host "4. Check browser console (F12) for reminder messages" -ForegroundColor White
