# Helper script to query Loki logs with correct timezone
# Usage: .\scripts\query-loki.ps1 -Service "auth-service" -Minutes 5

param(
    [Parameter(Mandatory=$true)]
    [string]$Service,
    
    [Parameter(Mandatory=$false)]
    [int]$Minutes = 5,
    
    [Parameter(Mandatory=$false)]
    [int]$Limit = 20
)

# Get Loki's timestamp (UTC) instead of Windows timestamp (IST)
$lokiTime = [int](docker exec loki date +%s)
$startTime = $lokiTime - ($Minutes * 60)

Write-Host "=== Querying Loki Logs ===" -ForegroundColor Cyan
Write-Host "Service: $Service"
Write-Host "Time Range: Last $Minutes minutes"
Write-Host "Loki Time (UTC): $(docker exec loki date)"
Write-Host ""

$result = Invoke-WebRequest `
    -Uri "http://localhost:3100/loki/api/v1/query_range?query={service=`"$Service`"}&start=${startTime}000000000&end=${lokiTime}000000000&limit=$Limit" `
    -UseBasicParsing | ConvertFrom-Json

$streamCount = $result.data.result.Count
Write-Host "Found: $streamCount stream(s)" -ForegroundColor $(if ($streamCount -gt 0) { "Green" } else { "Yellow" })

if ($streamCount -gt 0) {
    foreach ($stream in $result.data.result) {
        Write-Host "`nLabels: $($stream.stream | ConvertTo-Json -Compress)" -ForegroundColor Gray
        Write-Host "Entries: $($stream.values.Count)" -ForegroundColor Gray
        Write-Host "Latest logs:" -ForegroundColor White
        
        $stream.values | Select-Object -First 10 | ForEach-Object {
            $timestamp = [long]$_[0] / 1000000000
            $date = (Get-Date "1970-01-01 00:00:00").AddSeconds($timestamp).ToLocalTime()
            Write-Host "  [$($date.ToString('HH:mm:ss'))] $_[1]"
        }
    }
} else {
    Write-Host "`nNo logs found. Possible reasons:" -ForegroundColor Yellow
    Write-Host "  - Service hasn't started yet or hasn't generated logs"
    Write-Host "  - Grafana Alloy hasn't collected logs yet (wait ~10 seconds)"
    Write-Host "  - Check if containers are running: docker ps"
}
