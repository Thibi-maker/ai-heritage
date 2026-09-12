param($Port=3000)
Write-Host "Starting server on port $Port..."
cd E:\nn
$env:PORT=$Port
$process = Start-Process node -ArgumentList "server.js" -PassThru -NoNewWindow
Start-Sleep -Seconds 2
Write-Host "Testing auth/google route..."
try {
    $result = Invoke-WebRequest "http://localhost:$Port/auth/google" -UseBasicParsing
    Write-Host "Response status: $($result.StatusCode)"
    Write-Host "Response: $($result.Content.Substring(0, 200))"
} catch {
    Write-Host "Error: $_"
}