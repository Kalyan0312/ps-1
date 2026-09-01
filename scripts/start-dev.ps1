Write-Host "=========================================" -ForegroundColor Yellow
Write-Host " Starting Cooperative Gig Full-Stack Dev " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-frontend.ps1"
