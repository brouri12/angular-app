# Script to create an ADMIN account via API
# Run this script to create an admin user

Write-Host "=== Creating ADMIN Account ===" -ForegroundColor Cyan
Write-Host ""

# Admin details - MODIFY THESE VALUES
$adminData = @{
    username = "admin"
    email = "admin@wordly.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Admin"
    prenom = "System"
    telephone = "1234567890"
} | ConvertTo-Json

Write-Host "Admin details:" -ForegroundColor Yellow
Write-Host "Username: admin"
Write-Host "Email: admin@wordly.com"
Write-Host "Password: Admin123!"
Write-Host "Role: ADMIN"
Write-Host ""

# API endpoint (via Gateway)
$apiUrl = "http://localhost:8888/user-service/api/auth/register"

Write-Host "Sending request to: $apiUrl" -ForegroundColor Yellow
Write-Host ""

try {
    # Make the API call
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $adminData -ContentType "application/json"
    
    Write-Host "SUCCESS! Admin account created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Admin Details:" -ForegroundColor Cyan
    Write-Host "  ID: $($response.user.id_user)"
    Write-Host "  Username: $($response.user.username)"
    Write-Host "  Email: $($response.user.email)"
    Write-Host "  Role: $($response.user.role)"
    Write-Host "  Nom: $($response.user.nom)"
    Write-Host "  Prenom: $($response.user.prenom)"
    Write-Host ""
    Write-Host "You can now login with:" -ForegroundColor Yellow
    Write-Host "  Email: admin@wordly.com"
    Write-Host "  Password: Admin123!"
    Write-Host ""
    
} catch {
    Write-Host "ERROR creating admin account!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Server response:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "1. Make sure UserService is running (port 8085)"
    Write-Host "2. Make sure API Gateway is running (port 8888)"
    Write-Host "3. Make sure Keycloak is running (port 9090)"
    Write-Host "4. Check if username/email already exists"
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
