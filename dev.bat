@echo off
REM dev.bat - Script to run both server and client for Gemini Multimodal Live Demo
REM Usage: dev.bat [setup|dev|client|server]

IF "%1"=="" GOTO help
IF "%1"=="setup" GOTO setup
IF "%1"=="server" GOTO server
IF "%1"=="client" GOTO client
IF "%1"=="dev" GOTO dev
GOTO help

:check_python
WHERE python --version 2>NUL | FIND "3.1" >NUL
IF %ERRORLEVEL% NEQ 0 (
    echo Python 3.10+ not found. Please install Python 3.10, 3.11, or 3.12.
    echo Download from https://www.python.org/downloads/
    exit /B 1
)
exit /B 0

:setup_server
echo Setting up server environment...
cd server

IF NOT EXIST venv (
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt
python sesame.py init

cd ..
exit /B 0

:setup_client
echo Setting up client environment...
cd client
call npm install
cd ..

cd server
call venv\Scripts\activate.bat
python sesame.py init-client
cd ..
exit /B 0

:setup
call :check_python
IF %ERRORLEVEL% NEQ 0 exit /B 1

call :setup_server
call :setup_client
echo Setup complete! Run 'dev.bat dev' to start the application.
exit /B 0

:server
echo Starting server...
cd server
call venv\Scripts\activate.bat
python sesame.py run
exit /B 0

:client
echo Starting client...
cd client
call npm run dev
exit /B 0

:dev
WHERE npm >NUL 2>NUL
IF %ERRORLEVEL% NEQ 0 (
    echo npm not found. Please install Node.js.
    exit /B 1
)

echo Starting both server and client...
call npm run dev
exit /B 0

:help
echo Gemini Multimodal Live Demo Development Script
echo Usage: dev.bat [setup^|dev^|client^|server]
echo.
echo Commands:
echo   setup  - Install dependencies and set up environment
echo   dev    - Run both client and server concurrently
echo   server - Run only the server
echo   client - Run only the client
exit /B 0 