@echo off
REM Starts the inbox execute-bridge in this terminal.
REM Reads tools\.env from this folder. Logs to tools\bridge.log.

cd /d "%~dp0"

if not exist ".env" (
  echo [bridge] tools\.env not found. Copy tools\.env.example to tools\.env first.
  pause
  exit /b 1
)

echo [bridge] Starting from %CD%
echo [bridge] Press Ctrl+C to stop.
echo.

node execute-bridge.js

echo.
echo [bridge] Stopped.
pause
