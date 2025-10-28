# Complete startup script for Next.js development
# This script:
# 1. Kills processes on port 3000
# 2. Starts Next.js on port 3000
#
# Usage: .\dev.ps1

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host " Next.js Development Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill processes on port 3000
Write-Host "[1/2] Checking port 3000..." -ForegroundColor Yellow

try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        Write-Host "      Found process(es): $processes" -ForegroundColor Gray
        Write-Host "      Killing..." -ForegroundColor Red
        
        foreach ($proc in $processes) {
            Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
        }
        
        Start-Sleep -Milliseconds 500
        Write-Host "      Port 3000 freed!" -ForegroundColor Green
    } else {
        Write-Host "      Port 3000 is free" -ForegroundColor Green
    }
} catch {
    Write-Host "      Continuing..." -ForegroundColor Gray
}

Write-Host ""

# Step 2: Start Next.js
Write-Host "[2/2] Starting Next.js server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "      Server will be available at:" -ForegroundColor Gray
Write-Host "      http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "      Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Change directory
Set-Location "C:\PROYECTS\DXC_PoC_Nirvana\apps\control-center-ui"

# Set port and start
$env:PORT = "3000"
npm run dev
