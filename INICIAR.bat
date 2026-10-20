
@echo off
title TechCampus - AAPM
cd /d "%~dp0"

set "URL=http://localhost:3022/"

echo ========================================
echo          TECHCAMPUS - AAPM
echo ========================================
echo.

REM Verifica se o servidor ja esta respondendo
curl -fsS "%URL%" -o nul >nul 2>&1
if not errorlevel 1 (
    echo TechCampus ja esta funcionando!
    start "" "%URL%"
    exit /b 0
)

REM Verifica se a porta esta ocupada
netstat -ano | findstr /R /C:":3022 .*LISTENING" >nul
if not errorlevel 1 (
    echo A porta 3022 esta ocupada, mas o TechCampus nao respondeu.
    echo Verifique qual processo esta usando a porta.
    pause
    exit /b 1
)

REM Inicia o servidor em uma janela separada
echo Iniciando o TechCampus...
start "TechCampus - Servidor" cmd /k "cd /d ""%~dp0"" && npm start"

REM Aguarda o servidor responder antes de abrir o navegador
powershell -NoProfile -Command "$u='%URL%'; for($i=0;$i -lt 30;$i++){try{$r=Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 1; if($r.StatusCode -eq 200){Start-Process $u; exit 0}}catch{}; Start-Sleep -Seconds 1}; exit 1"

if errorlevel 1 (
    echo.
    echo O servidor nao respondeu no tempo esperado.
    echo Confira a janela do servidor para ver o erro.
    pause
)
