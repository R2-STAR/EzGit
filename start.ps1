[CmdletBinding()]
param(
    [switch]$SkipDocker,
    [switch]$NoInstall
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$logDir = Join-Path $root ".logs"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Get-Running([string]$pidFile) {
    if (Test-Path $pidFile) {
        $old = Get-Content $pidFile -ErrorAction SilentlyContinue
        if ($old -and (Get-Process -Id $old -ErrorAction SilentlyContinue)) { return $true }
    }
    return $false
}

Write-Host "=== EzGit launcher ==="

# 1. Databases (Postgres + Redis)
if (-not $SkipDocker) {
    Write-Host "Starting Postgres + Redis via Docker..."
    docker compose up -d postgres redis
    Write-Host "Waiting for Postgres to become healthy..."
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 2
        $state = docker inspect -f "{{.State.Health.Status}}" ezGit_postgres 2>$null
        if ($state -eq "healthy") { $ready = $true; break }
    }
    if (-not $ready) { throw "Postgres did not become healthy. Check: docker compose logs postgres" }
} else {
    Write-Host "Skipping Docker (Postgres/Redis assumed already running)..."
}

# 2. Backend venv
$python = Join-Path $backend ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    if ($NoInstall) { throw "Backend venv not found. Run without -NoInstall or create it: python -m venv backend\.venv" }
    Write-Host "Creating backend venv..."
    Push-Location $backend
    try { python -m venv .venv } finally { Pop-Location }
}
if (-not $NoInstall) {
    Write-Host "Installing backend dependencies..."
    Push-Location $backend
    try {
        & $python -m pip install --upgrade pip | Out-Null
        & $python -m pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) { throw "pip install failed" }
    } finally { Pop-Location }
}

# 3. Frontend deps
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    if ($NoInstall) { throw "Frontend node_modules not found. Run without -NoInstall or run: cd frontend; npm install" }
    Write-Host "Installing frontend dependencies..."
    Push-Location $frontend
    try {
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    } finally { Pop-Location }
}

# 4. API server (uvicorn :8000)
$apiPid = Join-Path $logDir "api.pid"
if (Get-Running $apiPid) {
    Write-Host "API already running (pid $(Get-Content $apiPid)) - skipping"
} else {
    Write-Host "Starting API (uvicorn on :8000)..."
    $env:PYTHONPATH = $backend
    $p = Start-Process -FilePath $python -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload" `
        -WorkingDirectory $backend -RedirectStandardOutput (Join-Path $logDir "api.out.log") `
        -RedirectStandardError (Join-Path $logDir "api.err.log") -WindowStyle Hidden -PassThru
    Set-Content $apiPid $p.Id
}

# 5. Celery worker (--pool=solo required on Windows)
$workerPid = Join-Path $logDir "worker.pid"
if (Get-Running $workerPid) {
    Write-Host "Celery worker already running (pid $(Get-Content $workerPid)) - skipping"
} else {
    Write-Host "Starting Celery worker (--pool=solo)..."
    $env:PYTHONPATH = $backend
    $p = Start-Process -FilePath $python -ArgumentList "-m", "celery", "-A", "app.workers.tasks", "worker", "--loglevel=info", "--pool=solo" `
        -WorkingDirectory $backend -RedirectStandardOutput (Join-Path $logDir "worker.out.log") `
        -RedirectStandardError (Join-Path $logDir "worker.err.log") -WindowStyle Hidden -PassThru
    Set-Content $workerPid $p.Id
}

# 6. Frontend (vite :5173)
$frontPid = Join-Path $logDir "frontend.pid"
if (Get-Running $frontPid) {
    Write-Host "Frontend already running (pid $(Get-Content $frontPid)) - skipping"
} else {
    Write-Host "Starting frontend (vite on :5173)..."
    $vite = Join-Path $frontend "node_modules\vite\bin\vite.js"
    $node = (Get-Command node).Source
    $p = Start-Process -FilePath $node -ArgumentList $vite, "--host" `
        -WorkingDirectory $frontend -RedirectStandardOutput (Join-Path $logDir "frontend.out.log") `
        -RedirectStandardError (Join-Path $logDir "frontend.err.log") -WindowStyle Hidden -PassThru
    Set-Content $frontPid $p.Id
}

Write-Host ""
Write-Host "EzGit is starting..."
Write-Host "  Frontend  : http://localhost:5173"
Write-Host "  Backend   : http://localhost:8000"
Write-Host "  API Docs  : http://localhost:8000/docs"
Write-Host "  Logs      : $logDir"
Write-Host ""
Write-Host "NOTE: backend\.env must contain real API keys for features to work."
