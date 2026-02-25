# Script de test PowerShell pour le Microservice Abonnement
# Exécuter: .\test-api.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS API MICROSERVICE ABONNEMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8084/api/abonnements"
$testsPassed = 0
$testsFailed = 0

# Fonction pour afficher les résultats
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    Write-Host "Test: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Body $Body -ContentType "application/json" -ErrorAction Stop
        }
        
        Write-Host "✅ SUCCÈS - Status: $($response.StatusCode)" -ForegroundColor Green
        if ($response.Content.Length -lt 500) {
            Write-Host "Réponse: $($response.Content)" -ForegroundColor Gray
        } else {
            Write-Host "Réponse: [Trop longue, $($response.Content.Length) caractères]" -ForegroundColor Gray
        }
        $script:testsPassed++
        return $true
    }
    catch {
        Write-Host "❌ ÉCHEC - Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
    finally {
        Write-Host ""
    }
}

# TEST 1: Hello World
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS DE BASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Name "Hello World" -Url "$baseUrl/hello"

# TEST 2: Get All Abonnements
Test-Endpoint -Name "Récupérer tous les abonnements" -Url $baseUrl

# TEST 3: Get Abonnement By ID
Test-Endpoint -Name "Récupérer l'abonnement ID=1" -Url "$baseUrl/1"

# TEST 4: Get Abonnement By ID (inexistant)
Test-Endpoint -Name "Récupérer un abonnement inexistant (devrait échouer)" -Url "$baseUrl/999"

# TESTS RECHERCHE
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS DE RECHERCHE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Name "Rechercher par nom 'Premium'" -Url "$baseUrl/search/byNom?nom=Premium&page=0&size=10"
Test-Endpoint -Name "Rechercher par statut 'Actif'" -Url "$baseUrl/search/byStatut?statut=Actif"
Test-Endpoint -Name "Rechercher par prix max 50€" -Url "$baseUrl/search/byPrixMax?prix=50.00"

# TESTS CRUD
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS CRUD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# TEST 5: Create Abonnement
$newAbonnement = @{
    nom = "Test PowerShell"
    description = "Abonnement créé par le script de test"
    prix = 19.99
    duree_jours = 30
    niveau_acces = "Test"
    acces_illimite = $false
    support_prioritaire = $false
    statut = "Actif"
} | ConvertTo-Json

$created = Test-Endpoint -Name "Créer un nouvel abonnement" -Url $baseUrl -Method "POST" -Body $newAbonnement

if ($created) {
    # TEST 6: Update Statut
    Test-Endpoint -Name "Changer le statut en 'Inactif'" -Url "$baseUrl/4/statut?statut=Inactif" -Method "PATCH"
    
    # TEST 7: Delete
    Test-Endpoint -Name "Supprimer l'abonnement créé" -Url "$baseUrl/4" -Method "DELETE"
}

# TESTS PAIEMENTS
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS PAIEMENTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Name "Récupérer tous les paiements" -Url "$baseUrl/paiements"
Test-Endpoint -Name "Récupérer le paiement ID=1" -Url "$baseUrl/paiements/1"
Test-Endpoint -Name "Récupérer les paiements d'un client" -Url "$baseUrl/paiements/client/jean.dupont@email.com"

# TEST: Create Paiement
$newPaiement = @{
    nom_client = "Test PowerShell"
    email_client = "test.powershell@email.com"
    type_abonnement = "Premium"
    montant = 29.99
    methode_paiement = "Test"
    reference_transaction = "TXN-PS-TEST-001"
    statut = "Validé"
} | ConvertTo-Json

$paiementCreated = Test-Endpoint -Name "Créer un nouveau paiement" -Url "$baseUrl/paiements" -Method "POST" -Body $newPaiement

if ($paiementCreated) {
    Test-Endpoint -Name "Supprimer le paiement créé" -Url "$baseUrl/paiements/3" -Method "DELETE"
}

# RÉSUMÉ
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests réussis: $testsPassed" -ForegroundColor Green
Write-Host "Tests échoués: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 TOUS LES TESTS SONT PASSÉS!" -ForegroundColor Green
    Write-Host "Votre microservice fonctionne parfaitement!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Certains tests ont échoué." -ForegroundColor Yellow
    Write-Host "Vérifiez que:" -ForegroundColor Yellow
    Write-Host "  1. Le service est démarré (mvn spring-boot:run)" -ForegroundColor Yellow
    Write-Host "  2. MySQL est en cours d'exécution" -ForegroundColor Yellow
    Write-Host "  3. Le port 8084 est accessible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
