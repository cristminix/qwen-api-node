# Load environment variables from .env.kimi file
if (Test-Path ".env.kimi") {
    Get-Content .env.kimi | ForEach-Object {
        if ($_ -notmatch "^#.*" -and $_ -ne "") {
            $name, $value = $_.split("=", 2)
            # Remove surrounding quotes from the value if present
            $value = $value -replace '^"|"$', ''
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "Loaded environment variables from .env.kimi"
} else {
    Write-Host "Error: .env.kimi file not found"
    exit 1
}

# Start the application based on argument
if ($args.Count -eq 0) {
    $mode = "dev"
} else {
    $mode = $args[0].ToLower()
}

if ($mode -eq "dist") {
    Write-Host "Starting Kimi service from build on port $env:PORT..."
    node build/index.js
} elseif ($mode -eq "dev") {
    Write-Host "Starting Kimi service in development mode on port $env:PORT..."
    pnpm dev
} else {
    Write-Host "Invalid argument: $mode"
    Write-Host "Usage: .\start-kimi.ps1 [dev|dist]"
    Write-Host "  dev (default) - Run with 'pnpm dev'"
    Write-Host "  dist          - Run with 'node build/index.js'"
    exit 1
}