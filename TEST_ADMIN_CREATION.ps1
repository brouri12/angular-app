# Test admin creation with detailed error output

$adminData = @{
    username = "admin"
    email = "admin@wordly.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Admin"
    prenom = "System"
    telephone = "1234567890"
    poste = "System Administrator"
}

$json = $adminData | ConvertTo-Json

Write-Host "Request body:"
Write-Host $json
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/user-service/api/auth/register" -Method Post -Body $json -ContentType "application/json"
    Write-Host "Success!"
    Write-Host $response.Content
} catch {
    Write-Host "Error Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Server Response:"
        Write-Host $responseBody
    }
}
