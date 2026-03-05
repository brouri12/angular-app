# Test the /validated endpoint directly
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING /validated ENDPOINT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$url = "http://localhost:8085/api/payments/validated"

Write-Host "`nCalling: $url" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Found $($response.Count) validated payments" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "`nFirst payment details:" -ForegroundColor Cyan
        $response[0] | ConvertTo-Json -Depth 3
    }
    
} catch {
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
