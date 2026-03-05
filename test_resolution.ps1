# Test API Resolution Action

# 1. Lister les réclamations pour avoir un ID valide
Write-Host "=== Liste des reclamations ===" -ForegroundColor Cyan
$reclamations = Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations" -Method Get
$reclamations | Select-Object -First 3 id, objet | Format-Table

if ($reclamations.Count -gt 0) {
    $firstId = $reclamations[0].id
    Write-Host "`n=== Creation resolution action pour reclamation ID: $firstId ===" -ForegroundColor Green
    
    $body = @{
        reclamationId = $firstId
        action = "Contacté l'étudiant"
        responsable = "Admin"
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8082/api/resolutions" -Method Post -ContentType "application/json" -Body $body
        Write-Host "Succes! Resolution action creee: $($result | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Aucune reclamation trouvee!" -ForegroundColor Yellow
}
