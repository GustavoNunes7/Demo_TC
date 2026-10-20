
@echo off
setlocal
title TechCampus - AAPM
cd /d "%~dp0"

set "URL=http://localhost:3022/"
set "PORTA=3022"

echo ========================================
echo          TECHCAMPUS - AAPM
echo ========================================
echo.

REM Verifica se o Node.js esta instalado
where node >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado.
    echo Instale o Node.js antes de iniciar o projeto.
    pause
    exit /b 1
)

REM Verifica se o npm esta disponivel
where npm >nul 2>&1
if errorlevel 1 (
    echo ERRO: npm nao encontrado.
    pause
    exit /b 1
)

REM Verifica se o arquivo .env existe
if not exist ".env" (
    echo ERRO: Arquivo .env nao encontrado!
    echo.
    echo Crie o arquivo .env com as configuracoes do projeto.
    pause
    exit /b 1
)

REM Instala as dependencias se necessario
if not exist "node_modules" (
    echo Instalando dependencias do TechCampus...
    echo Aguarde...
    call npm install

    if errorlevel 1 (
        echo.
        echo ERRO: Nao foi possivel instalar as dependencias.
        pause
        exit /b 1
    )

    echo.
    echo Dependencias instaladas com sucesso!
    echo.
)

REM Verifica se o servidor ja esta respondendo
curl -fsS "%URL%" -o nul >nul 2>&1
if not errorlevel 1 (
    echo TechCampus ja esta funcionando!
    echo Abrindo a Landing Page...
    start "" "%URL%"
    exit /b 0
)

REM Verifica se a porta esta ocupada
netstat -ano | findstr /R /C:":3022 .*LISTENING" >nul
if not errorlevel 1 (
    echo ERRO: A porta %PORTA% esta ocupada,
    echo mas a Landing Page nao respondeu.
    echo.
    echo Verifique a janela do servidor.
    pause
    exit /b 1
)

REM Inicia o servidor em uma janela separada
echo Iniciando o servidor do TechCampus...
start "TechCampus - Servidor" cmd /k "cd /d ""%~dp0"" && npm start"

REM Aguarda o servidor responder
echo Aguardando o servidor iniciar...

powershell -NoProfile -Command "$u='%URL%'; for($i=0;$i -lt 30;$i++){try{$r=Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 1; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 400){Start-Process $u; exit 0}}catch{}; Start-Sleep -Seconds 1}; exit 1"

if errorlevel 1 (
    echo.
    echo ERRO: O servidor nao respondeu em 30 segundos.
    echo Confira a janela do servidor para verificar o motivo.
    pause
    exit /b 1
)

echo.
echo TechCampus iniciado com sucesso!

endlocal
