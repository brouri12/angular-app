@echo off
echo ========================================
echo Starting PlanificationService
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if MySQL is running
echo [1/3] Checking MySQL...
netstat -an | findstr ":3306" >nul
if %errorlevel% equ 0 (
    echo ✓ MySQL is running on port 3306
) else (
    echo ✗ MySQL is NOT running!
    echo Please start XAMPP MySQL first
    pause
    exit /b 1
)
echo.

REM Check if EurekaServer is running
echo [2/3] Checking EurekaServer...
netstat -an | findstr ":8761" >nul
if %errorlevel% equ 0 (
    echo ✓ EurekaServer is running on port 8761
) else (
    echo ✗ EurekaServer is NOT running!
    echo Please start EurekaServer first
    pause
    exit /b 1
)
echo.

REM Check if port 8086 is available
echo [3/3] Checking port 8086...
netstat -an | findstr ":8086" >nul
if %errorlevel% equ 0 (
    echo ✗ Port 8086 is already in use!
    echo Please stop the service using that port
    pause
    exit /b 1
) else (
    echo ✓ Port 8086 is available
)
echo.

echo All prerequisites met!
echo.
echo Starting PlanificationService on port 8086...
echo This will take 30-60 seconds...
echo.
echo ========================================
echo.

REM Start the service
mvnw.cmd spring-boot:run

pause
