# ============================================================
#  Update Docker Hub Username in All Kubernetes Files
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerUsername
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Updating Docker Hub Username" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$placeholder = "marwenazouzi1"
$filesUpdated = 0

# Get all YAML files in k8s directory
$yamlFiles = Get-ChildItem -Path "k8s" -Filter "*.yml" -Recurse

Write-Host "Found $($yamlFiles.Count) YAML files" -ForegroundColor Blue
Write-Host ""

foreach ($file in $yamlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match $placeholder) {
        Write-Host "[UPDATE] $($file.Name)" -ForegroundColor Yellow
        $newContent = $content -replace $placeholder, $DockerUsername
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $filesUpdated++
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Update Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Updated $filesUpdated files" -ForegroundColor Green
Write-Host "Docker Hub username: $DockerUsername" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Build and push your Docker images:" -ForegroundColor White
Write-Host "   docker build -t ${DockerUsername}/user-service:latest ./UserService" -ForegroundColor Gray
Write-Host "   docker push ${DockerUsername}/user-service:latest" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Or deploy using local images (for testing):" -ForegroundColor White
Write-Host "   Update imagePullPolicy to 'Never' in YAML files" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy to Kubernetes:" -ForegroundColor White
Write-Host "   cd k8s" -ForegroundColor Gray
Write-Host "   .\deploy-all-services.ps1" -ForegroundColor Gray
Write-Host ""
