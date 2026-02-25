# Script to push code to GitHub branch 'marwen'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Push to GitHub - Branch: marwen" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$repoUrl = "https://github.com/brouri12/angular-app.git"
$branchName = "marwen"

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Git is installed" -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "This is not a Git repository. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
    Write-Host ""
}

# Check current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Check if remote exists
$remotes = git remote -v
if ($remotes -match "origin") {
    Write-Host "Remote 'origin' already exists" -ForegroundColor Yellow
    Write-Host "Current remote:" -ForegroundColor Cyan
    git remote -v
    Write-Host ""
    
    $updateRemote = Read-Host "Do you want to update the remote URL? (y/n)"
    if ($updateRemote -eq "y") {
        git remote set-url origin $repoUrl
        Write-Host "Remote URL updated" -ForegroundColor Green
    }
} else {
    Write-Host "Adding remote 'origin'..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    Write-Host "Remote added successfully" -ForegroundColor Green
}

Write-Host ""

# Check if branch exists locally
$branches = git branch
if ($branches -match $branchName) {
    Write-Host "Branch '$branchName' exists locally" -ForegroundColor Green
    
    if ($currentBranch -ne $branchName) {
        Write-Host "Switching to branch '$branchName'..." -ForegroundColor Yellow
        git checkout $branchName
    }
} else {
    Write-Host "Creating new branch '$branchName'..." -ForegroundColor Yellow
    git checkout -b $branchName
    Write-Host "Branch created and switched" -ForegroundColor Green
}

Write-Host ""

# Show status
Write-Host "Git Status:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Ask for confirmation
Write-Host "Files to be committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

$confirm = Read-Host "Do you want to add all files and commit? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

# Add all files
Write-Host ""
Write-Host "Adding all files..." -ForegroundColor Yellow
git add .
Write-Host "Files added" -ForegroundColor Green

# Get commit message
Write-Host ""
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# Commit
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "$commitMessage"
Write-Host "Changes committed" -ForegroundColor Green

# Push
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Branch: $branchName" -ForegroundColor Cyan
Write-Host "Remote: $repoUrl" -ForegroundColor Cyan
Write-Host ""

try {
    # Try to push
    git push -u origin $branchName
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Code pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Branch: $branchName" -ForegroundColor Cyan
    Write-Host "Repository: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "View your code at:" -ForegroundColor Yellow
    Write-Host "https://github.com/brouri12/angular-app/tree/$branchName" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Failed to push to GitHub" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Authentication required - You need to login to GitHub" -ForegroundColor White
    Write-Host "2. No permission - Check if you have write access to the repository" -ForegroundColor White
    Write-Host "3. Branch protection - The branch might be protected" -ForegroundColor White
    Write-Host ""
    Write-Host "To authenticate:" -ForegroundColor Cyan
    Write-Host "1. Use GitHub Desktop (recommended)" -ForegroundColor White
    Write-Host "2. Or configure Git credentials:" -ForegroundColor White
    Write-Host "   git config --global user.name 'Your Name'" -ForegroundColor Gray
    Write-Host "   git config --global user.email 'your.email@example.com'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"
