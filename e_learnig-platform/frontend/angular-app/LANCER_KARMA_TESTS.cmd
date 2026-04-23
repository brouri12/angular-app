@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Tests Karma (Jasmine + Chrome) — e-learning frontend ===
echo 1. Laissez cette fenêtre ouverte pendant les tests.
echo 2. Ne pas ouvrir http://localhost:9876 avant "Karma ... server started".
echo.
call npm test
pause
