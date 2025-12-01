#!/usr/bin/env pwsh
# Complete Setup Script for JV-ForMate Word AI Assistant
# This script automates the entire setup process

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  JV-ForMate Word AI Assistant - Complete Setup Wizard    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$keyPath = Join-Path $projectRoot "localhost.key"
$certPath = Join-Path $projectRoot "localhost.crt"
$envPath = Join-Path $projectRoot ".env"

# Check Node.js
Write-Host "📋 Step 1: Checking Prerequisites..." -ForegroundColor Cyan
Write-Host ""

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $nodeCmd) {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = & node --version
Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green

# Check npm
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if ($null -eq $npmCmd) {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

$npmVersion = & npm --version
Write-Host "✅ npm installed: v$npmVersion" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Step 2: Installing Dependencies..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "node_modules") {
    Write-Host "⏭️  Dependencies already installed (skipping)" -ForegroundColor Yellow
} else {
    Write-Host "   Installing packages (this may take 2-3 minutes)..." -ForegroundColor Gray
    try {
        & npm install --silent
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Check SSL certificates
Write-Host "🔒 Step 3: Setting up SSL Certificates..." -ForegroundColor Cyan
Write-Host ""

if ((Test-Path $keyPath) -and (Test-Path $certPath)) {
    Write-Host "✅ SSL certificates already exist" -ForegroundColor Green
    Write-Host "   • $keyPath" -ForegroundColor Gray
    Write-Host "   • $certPath" -ForegroundColor Gray
} else {
    Write-Host "⚠️  SSL certificates not found. Generating..." -ForegroundColor Yellow
    Write-Host ""
    
    $opensslCmd = Get-Command openssl -ErrorAction SilentlyContinue
    
    if ($null -eq $opensslCmd) {
        Write-Host "❌ OpenSSL not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install OpenSSL to generate certificates:" -ForegroundColor Yellow
        Write-Host "  Option 1: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor White
        Write-Host "  Option 2: choco install openssl" -ForegroundColor White
        Write-Host "  Option 3: Use mkcert (easier)" -ForegroundColor White
        Write-Host ""
        Write-Host "Then run this script again." -ForegroundColor Yellow
        exit 1
    }
    
    # Generate certificates
    try {
        & openssl genrsa -out $keyPath 2048 2>&1 | Out-Null
        & openssl req -new -x509 -key $keyPath -out $certPath -days 365 -subj "/CN=localhost" 2>&1 | Out-Null
        
        if ((Test-Path $keyPath) -and (Test-Path $certPath)) {
            Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "⚠️  Important: You need to trust this certificate!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Quick trust method:" -ForegroundColor Cyan
            Write-Host "  1. Run: certmgr.msc" -ForegroundColor White
            Write-Host "  2. Right-click 'Trusted Root Certification Authorities > Certificates'" -ForegroundColor White
            Write-Host "  3. All Tasks > Import" -ForegroundColor White
            Write-Host "  4. Browse to: $certPath" -ForegroundColor White
            Write-Host "  5. Click Next > Finish" -ForegroundColor White
            Write-Host ""
            
            $trustNow = Read-Host "Open Certificate Manager now? (Y/n)"
            if ($trustNow -ne "n" -and $trustNow -ne "N") {
                Start-Process certmgr.msc
                Read-Host "Press Enter after trusting the certificate..."
            }
        }
    } catch {
        Write-Host "❌ Failed to generate certificates: $_" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Check environment variables
Write-Host "⚙️  Step 4: Checking Environment Configuration..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "VITE_GOOGLE_CLIENT_ID=([^\r\n]+)") {
        $clientId = $matches[1]
        
        if ($clientId -match "YOUR_GOOGLE_CLIENT_ID|YOUR_.*_HERE") {
            Write-Host "⚠️  Google Client ID not configured!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "You need to:" -ForegroundColor Yellow
            Write-Host "  1. Open .env file" -ForegroundColor White
            Write-Host "  2. Replace VITE_GOOGLE_CLIENT_ID with your actual Client ID" -ForegroundColor White
            Write-Host ""
            Write-Host "Don't have a Client ID?" -ForegroundColor Cyan
            Write-Host "  See CREDENTIALS_SETUP.md for detailed instructions" -ForegroundColor White
            Write-Host ""
            
            $openEnv = Read-Host "Open .env file now? (Y/n)"
            if ($openEnv -ne "n" -and $openEnv -ne "N") {
                Start-Process notepad $envPath
                Write-Host ""
                Write-Host "After updating .env, press Enter to continue..." -ForegroundColor Yellow
                Read-Host
            }
        } else {
            Write-Host "✅ Google Client ID configured" -ForegroundColor Green
            Write-Host "   Client ID: $($clientId.Substring(0, 20))..." -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Please create .env from .env.example" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Summary
Write-Host "📊 Setup Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$setupComplete = $true

# Check all requirements
$checks = @(
    @{
        Name = "Node.js installed"
        Status = ($null -ne $nodeCmd)
    },
    @{
        Name = "Dependencies installed"
        Status = (Test-Path "node_modules")
    },
    @{
        Name = "SSL certificates created"
        Status = ((Test-Path $keyPath) -and (Test-Path $certPath))
    },
    @{
        Name = "Environment configured"
        Status = (Test-Path $envPath)
    }
)

foreach ($check in $checks) {
    if ($check.Status) {
        Write-Host "✅" -NoNewline -ForegroundColor Green
    } else {
        Write-Host "❌" -NoNewline -ForegroundColor Red
        $setupComplete = $false
    }
    Write-Host " $($check.Name)" -ForegroundColor White
}

Write-Host ""

if ($setupComplete) {
    Write-Host "🎉 Setup Complete! You're ready to start developing!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. npm run dev              # Start development server" -ForegroundColor White
    Write-Host "  2. Visit https://localhost:3000 in browser" -ForegroundColor White
    Write-Host "  3. Sideload add-in in Word" -ForegroundColor White
    Write-Host ""
    Write-Host "Quick commands:" -ForegroundColor Cyan
    Write-Host "  npm run dev                 # Start dev server" -ForegroundColor White
    Write-Host "  npm run build               # Build for production" -ForegroundColor White
    Write-Host "  npm run lint                # Check code quality" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentation:" -ForegroundColor Cyan
    Write-Host "  README.md                   # Full documentation" -ForegroundColor White
    Write-Host "  QUICKSTART.md               # 5-minute setup guide" -ForegroundColor White
    Write-Host "  SSL_SETUP.md                # SSL certificate help" -ForegroundColor White
    Write-Host "  CREDENTIALS_SETUP.md        # OAuth configuration" -ForegroundColor White
    Write-Host ""
    
    $startNow = Read-Host "Start development server now? (Y/n)"
    if ($startNow -ne "n" -and $startNow -ne "N") {
        Write-Host ""
        Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
        Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        & npm run dev
    }
} else {
    Write-Host "⚠️  Setup incomplete. Please resolve the issues above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Need help?" -ForegroundColor Cyan
    Write-Host "  • Check README.md for detailed instructions" -ForegroundColor White
    Write-Host "  • See QUICKSTART.md for step-by-step setup" -ForegroundColor White
    Write-Host "  • Review SSL_SETUP.md for certificate issues" -ForegroundColor White
    Write-Host ""
}
