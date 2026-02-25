# Simple test to create admin with detailed error output

Write-Host "=== Testing Admin Creation ===" -ForegroundColor Cyan
Write-Host ""

# Use a unique username to avoid conflicts
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$username = "admin_$timestamp"

$adminData = @{
    username = $username
    email = "admin_${timestamp}@wordly.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Admin"
    prenom = "System"
    telephone = "1234567890"
    poste = "System Administrator"
} | ConvertTo-Json

Write-Host "Creating admin with username: $username" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/user-service/api/auth/register" -Method Post -Body $adminData -ContentType "application/json"
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host $response.Content
    
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Server Response:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
    
    Write-Host ""
    Write-Host "Check IntelliJ console for detailed error stack trace" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
