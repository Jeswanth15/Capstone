@echo off
setlocal enabledelayedexpansion

:: ============================================================================
::                AI-POWERED EDUCATION MANAGEMENT SYSTEM
::                     SERVICES ORCHESTRATION SCRIPT
:: ============================================================================
:: Description: Production-ready Windows Batch script to launch Frontend,
::              Backend, and AI Service in separate dedicated Command Prompt
::              windows with single double-click execution.
:: ============================================================================

:: ----------------------------------------------------------------------------
:: CONFIGURATION SECTION (EDIT PATHS AND ENTRY POINTS HERE)
:: ----------------------------------------------------------------------------
set FRONTEND_PATH=.\edu-repo-main\my-app
set BACKEND_PATH=.\edu-repo-main\edu
set PYTHON_PATH=.\edu-repo-main\python_service
set PYTHON_ENTRY=rag_service.py
set VENV_DIR=venv

:: Ensure working directory is set to the folder containing this batch script
cd /d "%~dp0"

:: ----------------------------------------------------------------------------
:: ROUTER / ENTRY DISPATCHER
:: ----------------------------------------------------------------------------
if "%~1"=="--frontend" goto :run_frontend
if "%~1"=="--backend"  goto :run_backend
if "%~1"=="--python"   goto :run_python

:: ============================================================================
:: SECTION 1: ORCHESTRATOR MODE (LAUNCHES ALL SERVICES)
:: ============================================================================
title EDU SYSTEM LAUNCHER
color 0B

echo ============================================================================
echo           AI-POWERED EDUCATION MANAGEMENT SYSTEM - LAUNCHER
echo ============================================================================
echo.
echo Launching all required microservices in separate windows...
echo.

:: 1. Launch React Frontend
echo [LAUNCHING] Spawning EDU FRONTEND window...
start "EDU FRONTEND" cmd /k ""%~f0" --frontend"

:: 2. Launch Spring Boot Backend
echo [LAUNCHING] Spawning EDU BACKEND window...
start "EDU BACKEND" cmd /k ""%~f0" --backend"

:: 3. Launch Python AI Service
echo [LAUNCHING] Spawning EDU AI SERVICE window...
start "EDU AI SERVICE" cmd /k ""%~f0" --python"

echo.
echo ============================================================================
echo All services have been dispatched. Check individual windows for status.
echo ============================================================================
echo.
exit /b 0


:: ============================================================================
:: SECTION 2: FRONTEND SERVICE EXECUTION
:: ============================================================================
:run_frontend
title EDU FRONTEND
color 0B

echo.
echo Starting Frontend...
echo ============================================================================
echo Service: React Frontend
echo Path:    %FRONTEND_PATH%
echo ============================================================================
echo.

:: Step 1: Validate Frontend directory existence
if not exist "%FRONTEND_PATH%" goto :err_frontend_path

:: Step 2: Navigate to Frontend directory
cd /d "%FRONTEND_PATH%"

:: Step 3: Check dependencies (node_modules) and install if missing
if not exist "node_modules\" (
    echo [INFO] node_modules directory not found.
    echo [INFO] Installing NPM dependencies...
    call npm install
    if !errorlevel! neq 0 (
        color 0C
        echo.
        echo [ERROR] npm install failed with error code !errorlevel!.
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed successfully.
    echo.
) else (
    echo [INFO] node_modules directory found. Skipping npm install.
    echo.
)

:: Step 4: Start Frontend application
echo [STARTING] Executing npm start...
call npm start
if !errorlevel! neq 0 (
    color 0C
    echo.
    echo [ERROR] Frontend service stopped unexpectedly with exit code !errorlevel!.
)
exit /b %errorlevel%

:err_frontend_path
color 0C
echo [ERROR] Frontend directory does not exist at: "%FRONTEND_PATH%"
echo Please verify the FRONTEND_PATH variable at the top of the batch file.
exit /b 1


:: ============================================================================
:: SECTION 3: BACKEND SERVICE EXECUTION
:: ============================================================================
:run_backend
title EDU BACKEND
color 0E

echo.
echo Starting Backend...
echo ============================================================================
echo Service: Spring Boot Backend
echo Path:    %BACKEND_PATH%
echo ============================================================================
echo.

:: Step 1: Validate Backend directory existence
if not exist "%BACKEND_PATH%" goto :err_backend_path

:: Step 2: Navigate to Backend directory
cd /d "%BACKEND_PATH%"

:: Step 3: Determine Maven command (mvnw.cmd or global mvn)
set MAVEN_CMD=
if exist "mvnw.cmd" (
    set MAVEN_CMD=mvnw.cmd
    echo [INFO] Found Maven Wrapper script: mvnw.cmd
) else (
    where mvn >nul 2>&1
    if !errorlevel! equ 0 (
        set MAVEN_CMD=mvn
        echo [INFO] Found global Maven installation in PATH.
    )
)

if "%MAVEN_CMD%"=="" goto :err_no_maven

:: Step 4: Start Spring Boot application via Maven
echo [STARTING] Executing %MAVEN_CMD% clean spring-boot:run...
echo.
call %MAVEN_CMD% clean spring-boot:run
if !errorlevel! neq 0 (
    color 0C
    echo.
    echo [ERROR] Backend service stopped unexpectedly with exit code !errorlevel!.
)
exit /b %errorlevel%

:err_backend_path
color 0C
echo [ERROR] Backend directory does not exist at: "%BACKEND_PATH%"
echo Please verify the BACKEND_PATH variable at the top of the batch file.
exit /b 1

:err_no_maven
color 0C
echo [ERROR] Maven executable was not found! Neither mvnw.cmd nor global mvn is available.
echo Please install Apache Maven or include mvnw in the backend directory.
exit /b 1


:: ============================================================================
:: SECTION 4: PYTHON AI SERVICE EXECUTION
:: ============================================================================
:run_python
title EDU AI SERVICE
color 0A

echo.
echo Starting AI Service...
echo ============================================================================
echo Service: Python AI/ML Service
echo Path:    %PYTHON_PATH%
echo Entry:   %PYTHON_ENTRY%
echo ============================================================================
echo.

:: Step 1: Validate Python Service directory existence
if not exist "%PYTHON_PATH%" goto :err_python_path

:: Step 2: Navigate to Python Service directory
cd /d "%PYTHON_PATH%"

:: Step 3: Check for Python executable
python --version >nul 2>&1
if !errorlevel! neq 0 goto :err_no_python

:: Step 4: Check / Repair Virtual Environment
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo [INFO] Virtual environment missing or incomplete in "%VENV_DIR%".
    echo [INFO] Creating virtual environment...
    if exist "%VENV_DIR%" rmdir /s /q "%VENV_DIR%"
    python -m venv "%VENV_DIR%"
    if !errorlevel! neq 0 goto :err_venv_failed
    echo [SUCCESS] Virtual environment created successfully.
    echo.
) else (
    echo [INFO] Virtual environment "%VENV_DIR%" found.
    echo.
)

:: Step 5: Activate Virtual Environment
echo [INFO] Activating virtual environment...
call "%VENV_DIR%\Scripts\activate.bat"

:: Step 6: Install dependencies from requirements.txt if present
if exist "requirements.txt" (
    echo [INFO] Checking and installing dependencies from requirements.txt...
    pip install -r requirements.txt
    if !errorlevel! neq 0 (
        echo [WARNING] Some dependencies had installation warnings. Continuing...
    )
    echo.
) else (
    echo [INFO] No requirements.txt file found. Skipping pip install.
    echo.
)

:: Step 7: Start Python AI Service
if not exist "%PYTHON_ENTRY%" goto :err_no_entry

echo [STARTING] Executing python %PYTHON_ENTRY%...
echo.
python "%PYTHON_ENTRY%"
if !errorlevel! neq 0 (
    color 0C
    echo.
    echo [ERROR] Python AI Service stopped unexpectedly with exit code !errorlevel!.
)
exit /b %errorlevel%

:err_python_path
color 0C
echo [ERROR] Python service directory does not exist at: "%PYTHON_PATH%"
echo Please verify the PYTHON_PATH variable at the top of the batch file.
exit /b 1

:err_no_python
color 0C
echo [ERROR] Python is not installed or not added to system PATH!
exit /b 1

:err_venv_failed
color 0C
echo [ERROR] Failed to create Python virtual environment!
exit /b 1

:err_no_entry
color 0C
echo [ERROR] Python entry file "%PYTHON_ENTRY%" was not found in: "%PYTHON_PATH%"
exit /b 1
