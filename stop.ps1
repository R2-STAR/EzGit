[CmdletBinding()]
param(
    [switch]$AlsoDocker
)

$ErrorActionPreference = "SilentlyContinue"
$root = $PSScriptRoot
$logDir = Join-Path $root ".logs"

Write-Host "=== EzGit stopper ==="

$map = [ordered]@{
    "api.pid"      = "API (uvicorn)"
    "worker.pid"   = "Celery worker"
    "frontend.pid" = "Frontend (vite)"
}

foreach ($file in $map.Keys) {
    $pidFile = Join-Path $logDir $file
    if (Test-Path $pidFile) {
        $toKill = Get-Content $pidFile
        if ($toKill) {
            if (Get-Process -Id $toKill -ErrorAction SilentlyContinue) {
                Stop-Process -Id $toKill -Force
                Write-Host "Stopped $($map[$file]) (pid $toKill)"
            } else {
                Write-Host "$($map[$file]) not running (stale pid file)"
            }
        }
        Remove-Item $pidFile -Force
    } else {
        Write-Host "$($map[$file]) pid file not found - nothing to stop"
    }
}

# Safety net: kill any stray python process from this project's venv
Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like "*EzGit*backend\.venv*" } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
    Write-Host "Cleaned up stray backend process pid $($_.ProcessId)"
}

if ($AlsoDocker) {
    Write-Host "Stopping Docker containers (postgres + redis)..."
    docker compose down
} else {
    Write-Host ""
    Write-Host "App stopped. Postgres + Redis left running (Docker)."
    Write-Host "To stop the databases too:  .\stop.ps1 -AlsoDocker"
}
