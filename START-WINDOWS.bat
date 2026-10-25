@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel% equ 0 (
    py -3 -m neslab.launch
) else (
    python -m neslab.launch
)
if errorlevel 1 (
    echo.
    echo Wymagany Python 3.12 lub nowszy. Zainstaluj go z https://www.python.org/downloads/
    echo Podczas instalacji zaznacz Add Python to PATH.
)
pause
