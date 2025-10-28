# PowerShell script to start Next.js dev server on port 3000
# Kills any existing process on port 3000 first

Write-Host "Checking for processes on port 3000..." -ForegroundColor Cyan

# Find and kill processes on port 3000
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        Write-Host "Found process(es) on port 3000" -ForegroundColor Yellow
        Write-Host "Killing process(es)..." -ForegroundColor Red
        
        foreach ($proc in $processes) {
            Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
        }
        
        Start-Sleep -Seconds 1
        Write-Host "Port 3000 is now free" -ForegroundColor Green
    } else {
        Write-Host "Port 3000 is already free" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not check port status, continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Next.js development server on port 3000..." -ForegroundColor Cyan
Write-Host ""

# Change to the correct directory
Set-Location "C:\PROYECTS\DXC_PoC_Nirvana\apps\control-center-ui"

# Set environment variable and start Next.js
$env:PORT = "3000"
npm run dev
