@echo off
echo ========================================
echo DEMARRAGE DU MICROSERVICE ABONNEMENT
echo ========================================
echo.

echo [1/3] Verification de Java...
java -version
if errorlevel 1 (
    echo ERREUR: Java n'est pas installe ou pas dans le PATH
    pause
    exit /b 1
)
echo.

echo [2/3] Compilation du projet...
call mvn clean install
if errorlevel 1 (
    echo ERREUR: La compilation a echoue
    pause
    exit /b 1
)
echo.

echo [3/3] Demarrage de l'application...
echo.
echo ========================================
echo Service demarre sur: http://localhost:8084
echo Endpoint test: http://localhost:8084/api/abonnements/hello
echo ========================================
echo.

call mvn spring-boot:run
