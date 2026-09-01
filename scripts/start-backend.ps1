Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting Cooperative Gig FastAPI Backend" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$env:PYTHONPATH = "$PSScriptRoot\.."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
