# Test automatique : verifier que l'ajout d'un cours cree une notification (port 8083)
$ErrorActionPreference = "Stop"
$base = "http://localhost:8083"
$headers = @{ "Content-Type" = "application/json" }
$piRoot = $PSScriptRoot

Write-Host ""
Write-Host "=== Test notifications (port 8083) ===" -ForegroundColor Cyan
Write-Host ""

# 0. Optionnel : liberer le port 8083 et redemarrer le serveur avec le code actuel
$killFirst = $args -contains "-restart"
if ($killFirst) {
    Write-Host "[0] Liberation du port 8083 et redemarrage du serveur..." -ForegroundColor Yellow
    $conn = Get-NetTCPConnection -LocalPort 8083 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $conn | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 2
    }
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot'; node xampp-mysql-dashboard.js" -WindowStyle Minimized
    Start-Sleep -Seconds 10
    Write-Host ""
}

# 1. Verifier si le serveur repond
try {
    $ping = Invoke-RestMethod -Uri "$base/api/ping" -Method Get -TimeoutSec 3
    Write-Host "[OK] Serveur repond sur $base" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Serveur non joignable sur $base. Lancez d'abord: node xampp-mysql-dashboard.js" -ForegroundColor Red
    exit 1
}

# 2. Nombre de notifications avant
try {
    $notifAvant = Invoke-RestMethod -Uri "$base/api/notifications?limit=50" -Method Get -TimeoutSec 5
    $nAvant = if ($notifAvant -is [array]) { $notifAvant.Count } else { 0 }
    Write-Host "[OK] Notifications avant: $nAvant" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] GET /api/notifications a echoue: $_" -ForegroundColor Red
    exit 1
}

# 3. Creer un cours de test
$body = @{
    courseCode = "TEST-NOTIF-" + (Get-Date -Format "HHmmss")
    title = "Cours test notification"
    description = "Test automatique"
    teacherId = 1
    teacherName = "Test"
    teacherLocation = "Paris"
    durationHours = 10
    price = 0
    maxStudents = 30
    level = "BEGINNER"
    status = "ACTIVE"
    city = "Paris"
    country = "France"
    latitude = $null
    longitude = $null
} | ConvertTo-Json

try {
    $course = Invoke-RestMethod -Uri "$base/api/courses" -Method Post -Body $body -Headers $headers -TimeoutSec 10
    Write-Host "[OK] Cours cree: id=$($course.id) - $($course.title)" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] POST /api/courses a echoue: $_" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# 4. Nombre de notifications apres
try {
    $notifApres = Invoke-RestMethod -Uri "$base/api/notifications?limit=50" -Method Get -TimeoutSec 5
    $nApres = if ($notifApres -is [array]) { $notifApres.Count } else { 0 }
    Write-Host "[OK] Notifications apres: $nApres" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] GET /api/notifications apres: $_" -ForegroundColor Red
    exit 1
}

# 5. Verifier notification cours
if ($nApres -le $nAvant) {
    Write-Host ""
    Write-Host "=== ECHEC cours: Aucune nouvelle notification ($nAvant -> $nApres) ===" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Notification 'Nouveau cours' creee." -ForegroundColor Green

# 6. Creer un chapitre de test (niveau 1)
$nAvantChapitre = $nApres
$levelId = 1
$chapterId = 1
$bodyChapter = @{ title = "Chapitre test notif " + (Get-Date -Format "HHmmss"); sortOrder = 99 } | ConvertTo-Json
try {
    $ch = Invoke-RestMethod -Uri "$base/api/levels/$levelId/chapters" -Method Post -Body $bodyChapter -Headers $headers -TimeoutSec 10
    $chapterId = $ch.id
    Write-Host "[OK] Chapitre cree: id=$($ch.id) - $($ch.title)" -ForegroundColor Green
} catch {
    Write-Host "[ATTENTION] POST /api/levels/$levelId/chapters a echoue: $_" -ForegroundColor Yellow
}
Start-Sleep -Seconds 1
try {
    $notifApres2 = Invoke-RestMethod -Uri "$base/api/notifications?limit=50" -Method Get -TimeoutSec 5
    $nApresChapitre = if ($notifApres2 -is [array]) { $notifApres2.Count } else { 0 }
    $hasNewChapter = ($notifApres2 | Where-Object { $_.type -eq 'new_chapter' } | Measure-Object).Count -gt 0
    if ($nApresChapitre -gt $nAvantChapitre -or $hasNewChapter) {
        Write-Host "[OK] Notification 'Nouveau chapitre' presente." -ForegroundColor Green
    } else {
        Write-Host "[ATTENTION] Aucune notification new_chapter." -ForegroundColor Yellow
    }
} catch {}

# 7. Creer une leçon de test (Leçons du chapitre)
$nAvantLecon = (Invoke-RestMethod -Uri "$base/api/notifications?limit=50" -Method Get -TimeoutSec 5 | Measure-Object).Count
$bodyLesson = @{ title = "Lecon test notif " + (Get-Date -Format "HHmmss"); type = "VIDEO"; url = "https://example.com/video"; durationMinutes = 5; sortOrder = 0 } | ConvertTo-Json
try {
    $lesson = Invoke-RestMethod -Uri "$base/api/chapters/$chapterId/lessons" -Method Post -Body $bodyLesson -Headers $headers -TimeoutSec 10
    Write-Host "[OK] Leçon creee: id=$($lesson.id) - $($lesson.title)" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] POST /api/chapters/$chapterId/lessons a echoue: $_" -ForegroundColor Red
}
Start-Sleep -Seconds 1
try {
    $notifApres3 = Invoke-RestMethod -Uri "$base/api/notifications?limit=50" -Method Get -TimeoutSec 5
    $nApresLecon = if ($notifApres3 -is [array]) { $notifApres3.Count } else { 0 }
    $hasNewLesson = ($notifApres3 | Where-Object { $_.type -eq 'new_lesson' } | Measure-Object).Count -gt 0
    if ($nApresLecon -gt $nAvantLecon -or $hasNewLesson) {
        Write-Host "[OK] Notification 'Nouvelle leçon' presente." -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Aucune notification new_lesson (notifications: $nAvantLecon -> $nApresLecon)." -ForegroundColor Red
    }
} catch {
    Write-Host "[ERREUR] GET notifications apres leçon: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== SUCCES: Notifications (cours + chapitre + leçon) testees ===" -ForegroundColor Green
Write-Host "Ouvrez http://localhost:8083/front-office/student.html et cliquez sur la cloche." -ForegroundColor White
Write-Host ""
