# SSL Certificate Setup for Development

Office Add-ins **require HTTPS** for security. This guide will help you create self-signed SSL certificates for local development.

## Quick Setup (Windows PowerShell)

### Option 1: Using OpenSSL (Recommended)

1. **Install OpenSSL** (if not already installed):
   - Download from: https://slproweb.com/products/Win32OpenSSL.html
   - Or install via Chocolatey: `choco install openssl`

2. **Generate SSL Certificate**:

```powershell
# Navigate to project directory
cd d:\SGP\JV-formate\JV-ForMate\Add-in-TWO

# Generate private key
openssl genrsa -out localhost.key 2048

# Generate certificate
openssl req -new -x509 -key localhost.key -out localhost.crt -days 365 -subj "/CN=localhost"
```

### Option 2: Using mkcert (Easiest)

```powershell
# Install mkcert
choco install mkcert

# Install local CA
mkcert -install

# Navigate to project directory
cd d:\SGP\JV-formate\JV-ForMate\Add-in-TWO

# Generate certificate for localhost
mkcert localhost 127.0.0.1 ::1
```

This will create:
- `localhost.key` - Private key
- `localhost.crt` (or `localhost+2.pem`) - Certificate

### Option 3: Manual PowerShell Script

```powershell
# Navigate to project directory
cd d:\SGP\JV-formate\JV-ForMate\Add-in-TWO

# Create self-signed certificate
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1)

# Export certificate
$certPath = ".\localhost.crt"
$keyPath = ".\localhost.key"

# Export to PFX first
$pfxPath = ".\localhost.pfx"
$password = ConvertTo-SecureString -String "password" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password

# Convert PFX to PEM format using OpenSSL (if installed)
openssl pkcs12 -in localhost.pfx -nocerts -out localhost.key -nodes -password pass:password
openssl pkcs12 -in localhost.pfx -clcerts -nokeys -out localhost.crt -password pass:password
```

## Trust the Certificate

### Windows

1. **Open Certificate Manager**:
   ```powershell
   certmgr.msc
   ```

2. **Import Certificate**:
   - Right-click **Trusted Root Certification Authorities > Certificates**
   - Select **All Tasks > Import**
   - Browse to `localhost.crt`
   - Click **Next**, then **Finish**

### Alternative: Double-click Method

1. Double-click `localhost.crt`
2. Click **Install Certificate**
3. Select **Local Machine**
4. Choose **Place all certificates in the following store**
5. Browse and select **Trusted Root Certification Authorities**
6. Click **Finish**

## Verify Certificate Files

Your project should now have:

```
Add-in-TWO/
├── localhost.key    ✓ Private key
├── localhost.crt    ✓ Certificate
├── vite.config.ts   ✓ References these files
└── ...
```

## Test HTTPS Server

```powershell
npm run dev
```

Visit: https://localhost:3000

You should see:
- ✅ **Secure** (green padlock) in browser
- ✅ No certificate warnings
- ✅ Add-in loads in Word

## Troubleshooting

### Certificate Error in Browser

**Problem**: "Your connection is not private" warning

**Solution**:
1. Make sure certificate is installed in **Trusted Root Certification Authorities**
2. Restart browser
3. Clear SSL state: `Settings > Privacy > Clear browsing data > Cached images and files`

### Vite Can't Find Certificate Files

**Problem**: `Error: ENOENT: no such file or directory, open 'localhost.key'`

**Solution**:
1. Verify files exist: `ls localhost.key`, `ls localhost.crt`
2. Check paths in `vite.config.ts`:
   ```typescript
   https: {
     key: fs.readFileSync(path.resolve(__dirname, "localhost.key")),
     cert: fs.readFileSync(path.resolve(__dirname, "localhost.crt")),
   }
   ```

### Office Add-in Not Loading

**Problem**: Add-in shows blank or error

**Solution**:
1. Clear Office cache:
   ```powershell
   Remove-Item "$env:LOCALAPPDATA\Microsoft\Office\16.0\Wef\*" -Recurse -Force
   ```
2. Restart Word
3. Verify manifest.xml points to `https://localhost:3000`
4. Check browser console for errors

### Certificate Expired

**Problem**: Certificate worked before but now shows error

**Solution**:
- Regenerate certificate (valid for 365 days by default)
- Or extend validity when creating:
  ```powershell
  openssl req -new -x509 -key localhost.key -out localhost.crt -days 3650
  ```

## Production Deployment

For production, use:
- **Real SSL certificate** from Let's Encrypt or commercial CA
- **Environment variables** for certificate paths
- **Different domain** (not localhost)
- Update `manifest.xml` URLs to production domain

## Security Notes

⚠️ **Important**:
- Self-signed certificates are for **development only**
- Never use in production
- Keep `localhost.key` secure and private
- Add to `.gitignore`:
  ```
  localhost.key
  localhost.crt
  localhost.pfx
  *.pem
  ```

## Quick Reference

```powershell
# Check if certificate exists
Test-Path localhost.key
Test-Path localhost.crt

# View certificate details
openssl x509 -in localhost.crt -text -noout

# Start dev server
npm run dev

# Clear Office cache
Remove-Item "$env:LOCALAPPDATA\Microsoft\Office\16.0\Wef\*" -Recurse -Force
```

## Next Steps

After setting up SSL:

1. ✅ Generate certificates (this guide)
2. 📝 Configure `.env` with Google Client ID
3. ▶️ Run `npm run dev`
4. 📥 Sideload add-in in Word
5. 🔐 Sign in with Google
6. 🚀 Start using AI features!

---

**Need Help?**
- Check the main [README.md](./README.md) for full setup instructions
- See [CREDENTIALS_SETUP.md](./CREDENTIALS_SETUP.md) for Google OAuth setup
