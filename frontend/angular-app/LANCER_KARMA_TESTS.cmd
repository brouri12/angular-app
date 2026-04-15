@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Tests Karma (Jasmine + Chrome) ===
echo 1. Laissez cette fenêtre ouverte pendant les tests.
echo 2. Ne pas ouvrir http://localhost:9876 avant la ligne "Karma ... server started".
echo 3. Chrome s'ouvre souvent tout seul ; sinon rechargez http://localhost:9876 une fois Karma démarré.
echo.
call npm test
pause
