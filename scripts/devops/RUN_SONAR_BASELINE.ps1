param(
  [string]$SonarHost = "http://localhost:9000",
  [string]$SonarToken = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if ([string]::IsNullOrWhiteSpace($SonarToken)) {
  $SonarToken = $env:SONAR_TOKEN
}

if ([string]::IsNullOrWhiteSpace($SonarToken)) {
  Write-Host "Usage: .\RUN_SONAR_BASELINE.ps1 -SonarToken <token>  (ou definir SONAR_TOKEN)" -ForegroundColor Yellow
  exit 1
}

Write-Host "== SonarQube baseline scan ==" -ForegroundColor Cyan
Set-Location $root

$services = @(
  @{ Name = "api-gateway"; Path = "api-gateway" },
  @{ Name = "eureka-server"; Path = "eureka-server" },
  @{ Name = "formation-service"; Path = "formation-service" },
  @{ Name = "quiz-badge-service"; Path = "quiz-badge-service" }
)

foreach ($svc in $services) {
  Write-Host "Scan baseline: $($svc.Name)" -ForegroundColor Green
  $svcDir = Join-Path $root $svc.Path
  Push-Location $svcDir
  $mvnw = Join-Path $svcDir "mvnw.cmd"
  $mvnArgs = @(
    "-B", "clean", "verify", "org.jacoco:jacoco-maven-plugin:report", "sonar:sonar",
    "-Dsonar.host.url=$SonarHost",
    "-Dsonar.token=$SonarToken",
    "-Dsonar.projectKey=baseline-$($svc.Name)",
    "-Dsonar.projectName=baseline-$($svc.Name)",
    "-Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml"
  )
  if (Test-Path $mvnw) {
    & $mvnw @mvnArgs
  } else {
    & mvn @mvnArgs
  }
  Pop-Location
}

Write-Host "Baseline termine. Prendre captures Sonar maintenant." -ForegroundColor Cyan
