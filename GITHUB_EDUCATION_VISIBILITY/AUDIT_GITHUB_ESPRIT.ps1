param(
    [Parameter(Mandatory = $true)]
    [string]$Org,

    [Parameter(Mandatory = $true)]
    [string]$PI,

    [Parameter(Mandatory = $true)]
    [string]$AcademicYear,

    [string]$OutputDir = ".\GITHUB_EDUCATION_VISIBILITY\reports"
)

$ErrorActionPreference = "Stop"

function Get-GhExe {
    $candidates = @(
        "gh",
        "C:\Program Files\GitHub CLI\gh.exe",
        "C:\Program Files (x86)\GitHub CLI\gh.exe"
    )
    foreach ($c in $candidates) {
        try {
            if ($c -eq "gh") {
                $null = & $c --version 2>$null
                if ($LASTEXITCODE -eq 0) { return $c }
            } else {
                if (Test-Path $c) { return $c }
            }
        } catch { }
    }
    throw "GitHub CLI non trouve. Installez-le puis relancez ce script."
}

function Invoke-GhJson {
    param(
        [string]$Gh,
        [string]$ApiPath,
        [switch]$Paginate,
        [switch]$Raw
    )

    if ($Raw) {
        if ($Paginate) {
            $out = & $Gh api --paginate $ApiPath --header "Accept: application/vnd.github.raw+json" 2>$null
            if ($LASTEXITCODE -ne 0) { throw "gh api failed: $ApiPath" }
            return $out
        }
        $out = & $Gh api $ApiPath --header "Accept: application/vnd.github.raw+json" 2>$null
        if ($LASTEXITCODE -ne 0) { throw "gh api failed: $ApiPath" }
        return $out
    }

    if ($Paginate) {
        $out = & $Gh api --paginate $ApiPath 2>$null
        if ($LASTEXITCODE -ne 0) { throw "gh api failed: $ApiPath" }
        return $out | ConvertFrom-Json
    }
    $out = & $Gh api $ApiPath 2>$null
    if ($LASTEXITCODE -ne 0) { throw "gh api failed: $ApiPath" }
    return $out | ConvertFrom-Json
}

function Test-ReadmeSections {
    param([string]$Content)
    $required = @(
        "(?im)^#\s+Project Title\s*$",
        "(?im)^##\s+Overview\s*$",
        "(?im)^##\s+Features\s*$",
        "(?im)^##\s+Tech Stack\s*$",
        "(?im)^###\s+Frontend\s*$",
        "(?im)^###\s+Backend\s*$",
        "(?im)^##\s+Architecture\s*$",
        "(?im)^##\s+Contributors\s*$",
        "(?im)^##\s+Academic Context\s*$",
        "(?im)^##\s+Getting Started\s*$",
        "(?im)^##\s+Acknowledgments\s*$"
    )
    foreach ($r in $required) {
        if ($Content -notmatch $r) { return $false }
    }
    return $true
}

function Get-DefaultBranchName {
    param([object]$Repo)
    if ($Repo.default_branch) { return [string]$Repo.default_branch }
    if ($Repo.defaultBranchRef -and $Repo.defaultBranchRef.name) { return [string]$Repo.defaultBranchRef.name }
    return "main"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$gh = Get-GhExe

Write-Host "Verification auth GitHub..."
& $gh auth status | Out-Null

$repos = & $gh repo list $Org --limit 200 --json name,nameWithOwner,description,isPrivate,stargazerCount,forkCount,url,defaultBranchRef | ConvertFrom-Json
if ($repos -isnot [System.Array]) { $repos = @($repos) }

$piLower = $PI.ToLowerInvariant()
$requiredTopics = @(
    "esprit-school-of-engineering",
    "academic-project",
    "esprit-$piLower",
    $AcademicYear
)

$nameRegex = "^Esprit-$PI-[^-]+-$AcademicYear-.+"

$rows = New-Object System.Collections.Generic.List[object]

foreach ($repo in $repos) {
    $fullName = [string]$repo.nameWithOwner
    $repoName = [string]$repo.name
    $defaultBranch = Get-DefaultBranchName -Repo $repo

    $nameOk = ($repoName -match $nameRegex)

    $desc = [string]$repo.description
    $descBrandOk = ($desc -match "Esprit School of Engineering")
    $descYearOk = ($desc -match [regex]::Escape($AcademicYear))
    $descOk = $descBrandOk -and $descYearOk

    $topics = @()
    try {
        $topicsObj = Invoke-GhJson -Gh $gh -ApiPath "repos/$fullName/topics"
        if ($topicsObj.names) { $topics = @($topicsObj.names) }
    } catch { }

    $missingTopics = @()
    foreach ($t in $requiredTopics) {
        if (-not ($topics -contains $t)) { $missingTopics += $t }
    }
    $topicsOk = ($missingTopics.Count -eq 0) -and ($topics.Count -ge 5)

    $readmeRaw = ""
    $readmeExists = $false
    $readmeStructured = $false
    $readmeBrandOk = $false
    try {
        $readmeObj = Invoke-GhJson -Gh $gh -ApiPath "repos/$fullName/readme" -Raw
        $readmeRaw = [string]($readmeObj -join "`n")
        if ($readmeRaw) {
            $readmeExists = $true
            $readmeStructured = Test-ReadmeSections -Content $readmeRaw
            $readmeBrandOk = [bool]($readmeRaw -match "Esprit School of Engineering")
        }
    } catch { }

    $commitsCount = 0
    try {
        $commits = Invoke-GhJson -Gh $gh -ApiPath "repos/$fullName/commits?sha=$defaultBranch&per_page=100" -Paginate
        if ($commits -is [System.Array]) { $commitsCount = $commits.Count }
        elseif ($commits) { $commitsCount = 1 }
    } catch { }

    $stars = [int]$repo.stargazerCount
    $forks = [int]$repo.forkCount

    $score = 0.0
    if ($nameOk) { $score += 0.5 }
    if ($descOk) { $score += 0.5 }
    if ($topicsOk) { $score += 0.5 }
    if ($readmeStructured -and $readmeBrandOk) { $score += 0.5 }

    $rows.Add([pscustomobject]@{
        repository           = $fullName
        private              = [bool]$repo.isPrivate
        naming_ok            = $nameOk
        description_ok       = $descOk
        topics_ok            = $topicsOk
        readme_exists        = $readmeExists
        readme_structured_ok = $readmeStructured
        readme_brand_ok      = $readmeBrandOk
        missing_topics       = ($missingTopics -join ";")
        commits_count        = $commitsCount
        stars                = $stars
        forks                = $forks
        score_on_2           = [math]::Round($score, 2)
        html_url             = [string]$repo.url
    }) | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$csvPath = Join-Path $OutputDir "github-audit-$Org-$PI-$AcademicYear-$timestamp.csv"
$mdPath  = Join-Path $OutputDir "github-audit-summary-$Org-$PI-$AcademicYear-$timestamp.md"

$rows | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $csvPath

$total = $rows.Count
$namingOkCount = ($rows | Where-Object { $_.naming_ok }).Count
$descOkCount = ($rows | Where-Object { $_.description_ok }).Count
$topicsOkCount = ($rows | Where-Object { $_.topics_ok }).Count
$readmeOkCount = ($rows | Where-Object { $_.readme_structured_ok -and $_.readme_brand_ok }).Count
$totalStars = ($rows | Measure-Object -Property stars -Sum).Sum
$totalForks = ($rows | Measure-Object -Property forks -Sum).Sum
$avgCommits = if ($total -gt 0) { [math]::Round((($rows | Measure-Object -Property commits_count -Sum).Sum / $total), 2) } else { 0 }

$summary = @"
# GitHub Audit Summary

- Organization: $Org
- PI: $PI
- Academic Year: $AcademicYear
- Total public repos audited: $total

## Conformite
- Naming conforme: $namingOkCount / $total
- Description conforme: $descOkCount / $total
- Topics conformes: $topicsOkCount / $total
- README conforme (structure + branding): $readmeOkCount / $total

## Impact
- Total stars: $totalStars
- Total forks: $totalForks
- Commits moyens par projet: $avgCommits

## Fichiers generes
- CSV detail: $csvPath
- Ce resume: $mdPath
"@

Set-Content -Path $mdPath -Value $summary -Encoding UTF8

Write-Host ""
Write-Host "Audit termine."
Write-Host "CSV : $csvPath"
Write-Host "Summary : $mdPath"
