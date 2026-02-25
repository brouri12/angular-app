# Test user registration to see the actual error

Write-Host "=== Testing User Registration ===" -ForegroundColor Cyan
Write-Host ""

# Test data - use unique values
$timestamp = Get-Date -Format "HHmmss"
$testUser = @{
    username = "testuser$timestamp"
    email = "test$timestamp@example.com"
    password = "Test123!"
    role = "STUDENT"
    nom = "Test"
    prenom = "User"
    telephone = "1234567890"
    date_naissance = "2000-01-01"
    niveau_actuel = "Beginner"
    statut_etudiant = "Inscrit"
} | ConvertTo-Json

Write-Host "Test user data:" -ForegroundColor Yellow
Write-Host "Username: testuser$timestamp"
Write-Host "Email: test$timestamp@example.com"
Write-Host "Role: STUDENT"
Write-Host ""

Write-Host "Sending registration request..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" -Method Post -Body $testUser -ContentType "application/json"
    
    Write-Host "✓ SUCCESS! User registered" -ForegroundColor Green
    Write-Host ""
    Write-Host "User details:" -ForegroundColor Cyan
    Write-Host "  ID: $($response.user.id_user)"
    Write-Host "  Username: $($response.user.username)"
    Write-Host "  Email: $($response.user.email)"
    Write-Host "  Role: $($response.user.role)"
    Write-Host ""
    
} catch {
    Write-Host "✗ REGISTRATION FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Error details from server:" -ForegroundColor Yellow
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "  Error: $($errorObj.error)" -ForegroundColor Red
            if ($errorObj.details) {
                Write-Host "  Details: $($errorObj.details)" -ForegroundColor Red
            }
            if ($errorObj.type) {
                Write-Host "  Type: $($errorObj.type)" -ForegroundColor Red
            }
        } catch {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Full error:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Troubleshooting steps:" -ForegroundColor Cyan
    Write-Host "1. Check UserService logs in IntelliJ console" -ForegroundColor Gray
    Write-Host "2. Check if Keycloak is running: http://localhost:9090" -ForegroundColor Gray
    Write-Host "3. Run: .\CHECK_SYSTEM_STATUS.ps1" -ForegroundColor Gray
    Write-Host "4. If Keycloak has errors, run: .\FORCE_CLEAN_KEYCLOAK_H2.ps1" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
