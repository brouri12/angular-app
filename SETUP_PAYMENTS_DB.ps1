# PowerShell script to set up the payments table in MySQL
# Run this script to create the payments table automatically

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Payment System Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
Write-Host "Checking if MySQL is running..." -ForegroundColor Yellow
$mysqlProcess = Get-Process mysqld -ErrorAction SilentlyContinue
if ($null -eq $mysqlProcess) {
    Write-Host "ERROR: MySQL is not running!" -ForegroundColor Red
    Write-Host "Please start XAMPP and start MySQL service" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}
Write-Host "OK: MySQL is running" -ForegroundColor Green
Write-Host ""

# MySQL connection details
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$host = "localhost"
$port = "3307"
$user = "root"
$password = ""
$database = "user_db"

# Check if mysql.exe exists
if (-not (Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL executable not found at: $mysqlPath" -ForegroundColor Red
    Write-Host "Please update the mysqlPath variable in this script" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Creating payments table..." -ForegroundColor Yellow
Write-Host ""

# Check if CREATE_PAYMENTS_TABLE.sql exists
if (-not (Test-Path "CREATE_PAYMENTS_TABLE.sql")) {
    Write-Host "ERROR: CREATE_PAYMENTS_TABLE.sql not found!" -ForegroundColor Red
    Write-Host "Please make sure the SQL file is in the same directory" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

# Execute SQL file
try {
    $result = & $mysqlPath --host=$host --port=$port --user=$user $database -e "source CREATE_PAYMENTS_TABLE.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  SUCCESS!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Payments table created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Create uploads directory:" -ForegroundColor White
        Write-Host "   New-Item -ItemType Directory -Path 'UserService\uploads\receipts' -Force" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Restart UserService backend" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Test payment system:" -ForegroundColor White
        Write-Host "   Frontend: http://localhost:4200/pricing" -ForegroundColor Gray
        Write-Host "   Back-Office: http://localhost:4201/payments" -ForegroundColor Gray
        Write-Host ""
    } else {
        throw "MySQL command failed with exit code: $LASTEXITCODE"
    }
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed to create payments table" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "- MySQL is running on port 3307" -ForegroundColor White
    Write-Host "- user_db database exists" -ForegroundColor White
    Write-Host "- users table exists (for foreign key)" -ForegroundColor White
    Write-Host ""
    Write-Host "You can also create the table manually:" -ForegroundColor Yellow
    Write-Host "1. Open phpMyAdmin (http://localhost/phpmyadmin)" -ForegroundColor White
    Write-Host "2. Select 'user_db' database" -ForegroundColor White
    Write-Host "3. Go to SQL tab" -ForegroundColor White
    Write-Host "4. Copy content from CREATE_PAYMENTS_TABLE.sql" -ForegroundColor White
    Write-Host "5. Click 'Go'" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to exit"
