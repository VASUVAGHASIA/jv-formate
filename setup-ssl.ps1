#!/usr/bin/env pwsh
# SSL Certificate Setup Script for Office Add-in Development
# This script creates self-signed SSL certificates for local HTTPS development

Write-Host "🔒 SSL Certificate Setup for Office Add-in" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$keyPath = Join-Path $projectRoot "localhost.key"
$certPath = Join-Path $projectRoot "localhost.crt"

# Check if certificates already exist
if ((Test-Path $keyPath) -and (Test-Path $certPath)) {
    Write-Host "⚠️  SSL certificates already exist!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Existing files:"
    Write-Host "  • $keyPath" -ForegroundColor Gray
    Write-Host "  • $certPath" -ForegroundColor Gray
    Write-Host ""
    
    $overwrite = Read-Host "Do you want to regenerate them? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "✅ Using existing certificates" -ForegroundColor Green
        exit 0
    }
    
    Write-Host ""
    Write-Host "🗑️  Removing old certificates..." -ForegroundColor Yellow
    Remove-Item $keyPath -Force -ErrorAction SilentlyContinue
    Remove-Item $certPath -Force -ErrorAction SilentlyContinue
}

Write-Host "📋 Checking for OpenSSL..." -ForegroundColor Cyan

# Check if OpenSSL is available
$opensslCmd = Get-Command openssl -ErrorAction SilentlyContinue

if ($null -eq $opensslCmd) {
    Write-Host "❌ OpenSSL not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "OpenSSL is required to generate SSL certificates." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation options:" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor White
    Write-Host "  2. Or install via Chocolatey: choco install openssl" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Use mkcert (easier):" -ForegroundColor Cyan
    Write-Host "  choco install mkcert" -ForegroundColor White
    Write-Host "  mkcert -install" -ForegroundColor White
    Write-Host "  mkcert localhost 127.0.0.1 ::1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ OpenSSL found: $($opensslCmd.Source)" -ForegroundColor Green
Write-Host ""

# Generate private key
Write-Host "🔑 Generating private key..." -ForegroundColor Cyan
try {
    & openssl genrsa -out $keyPath 2048 2>&1 | Out-Null
    if (Test-Path $keyPath) {
        Write-Host "✅ Private key created: localhost.key" -ForegroundColor Green
    } else {
        throw "Failed to create private key"
    }
} catch {
    Write-Host "❌ Failed to generate private key: $_" -ForegroundColor Red
    exit 1
}

# Generate certificate
Write-Host "📜 Generating certificate..." -ForegroundColor Cyan
try {
    & openssl req -new -x509 -key $keyPath -out $certPath -days 365 -subj "/CN=localhost" 2>&1 | Out-Null
    if (Test-Path $certPath) {
        Write-Host "✅ Certificate created: localhost.crt" -ForegroundColor Green
    } else {
        throw "Failed to create certificate"
    }
} catch {
    Write-Host "❌ Failed to generate certificate: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
Write-Host ""

# Offer to install certificate
Write-Host "📌 Next step: Trust the certificate" -ForegroundColor Cyan
Write-Host ""
Write-Host "To avoid browser warnings, you need to trust this certificate." -ForegroundColor Yellow
Write-Host ""

$install = Read-Host "Would you like to open Certificate Manager to install it? (Y/n)"
if ($install -ne "n" -and $install -ne "N") {
    Write-Host ""
    Write-Host "Opening Certificate Manager..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Instructions:" -ForegroundColor Cyan
    Write-Host "  1. Right-click 'Trusted Root Certification Authorities > Certificates'" -ForegroundColor White
    Write-Host "  2. Select 'All Tasks > Import'" -ForegroundColor White
    Write-Host "  3. Browse to: $certPath" -ForegroundColor White
    Write-Host "  4. Click 'Next', then 'Finish'" -ForegroundColor White
    Write-Host ""
    
    Start-Process certmgr.msc
    Read-Host "Press Enter when certificate is installed..."
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Configure .env with your Google Client ID" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Visit: https://localhost:3000" -ForegroundColor White
Write-Host "  4. Sideload the add-in in Word" -ForegroundColor White
Write-Host ""
Write-Host "For more details, see:" -ForegroundColor Cyan
Write-Host "  • SSL_SETUP.md" -ForegroundColor White
Write-Host "  • README.md" -ForegroundColor White
Write-Host ""
