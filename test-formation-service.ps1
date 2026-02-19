# Script de test pour formation-service
Write-Host "🧪 TESTS FORMATION-SERVICE" -ForegroundColor Green

# Test 1: Health Check
Write-Host "1. Test Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri http://localhost:8081/actuator/health -UseBasicParsing
    Write-Host "✅ Health: $($health.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Lister les cours
Write-Host "2. Test GET /api/courses..." -ForegroundColor Yellow
try {
    $courses = Invoke-WebRequest -Uri http://localhost:8081/api/courses -UseBasicParsing | ConvertFrom-Json
    Write-Host "✅ Courses: $($courses.totalElements) cours trouvés" -ForegroundColor Green
} catch {
    Write-Host "❌ Courses: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Lister les inscriptions
Write-Host "3. Test GET /api/enrollments..." -ForegroundColor Yellow
try {
    $enrollments = Invoke-WebRequest -Uri http://localhost:8081/api/enrollments -UseBasicParsing | ConvertFrom-Json
    Write-Host "✅ Enrollments: $($enrollments.totalElements) inscriptions trouvées" -ForegroundColor Green
} catch {
    Write-Host "❌ Enrollments: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Créer un cours
Write-Host "4. Test POST /api/courses..." -ForegroundColor Yellow
try {
    $newCourse = @{
        title = "Cours de Test PowerShell"
        description = "Créé via script de test"
        courseCode = "PS001"
        duration = 20
        price = 79.99
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri http://localhost:8081/api/courses -Method POST -Body $newCourse -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Course créé: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Create course: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🏁 Tests terminés!" -ForegroundColor Green
