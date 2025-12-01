# 🔐 Google OAuth Web Application Setup Guide

**Updated**: November 24, 2025  
**OAuth Type**: Web Application (with PKCE)

---

## 📋 Overview

This add-in now uses **Web Application** OAuth flow instead of Desktop app. This provides:
- ✅ Automatic popup-based authentication (no manual code entry)
- ✅ Better user experience
- ✅ Proper access to user's Gemini AI via Google account
- ✅ PKCE security for client-side applications

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter project name: `JV-ForMate` (or your choice)
4. Click **Create**

### Step 2: Enable Generative Language API

1. In your project, go to **APIs & Services** → **Library**
2. Search for: **Generative Language API**
3. Click on it, then click **Enable**
4. Wait for activation (usually instant)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**

3. **If prompted to configure consent screen**:
   - Click **Configure Consent Screen**
   - Select **External** (unless you have a Google Workspace)
   - Click **Create**
   
   **Fill in OAuth consent screen**:
   - App name: `JV-ForMate Word AI Assistant`
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   
   **Scopes** (Click "Add or Remove Scopes"):
   - Search and add: `https://www.googleapis.com/auth/cloud-platform`
   - The following are auto-added: `openid`, `email`, `profile`
   - Click **Update** → **Save and Continue**
   
   **Test users** (for development):
   - Click **Add Users**
   - Add your Google account email
   - Click **Save and Continue**
   
   **Summary**:
   - Click **Back to Dashboard**

4. **Back to Credentials**:
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `JV-ForMate Web Client`

5. **Configure Authorized URIs**:
   
   **Authorized JavaScript origins**:
   ```
   https://localhost:3000
   ```
   
   **Authorized redirect URIs**:
   ```
   https://localhost:3000/oauth-callback.html
   ```
   
   > ⚠️ **Important**: 
   > - Use `https` (not `http`)
   > - Port must be `3000` (or update in code)
   > - Include `/oauth-callback.html` exactly

6. Click **Create**

7. **Copy Your Client ID**:
   - A popup will show your credentials
   - Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)
   - Click **OK**

### Step 4: Update .env File

1. Open `.env` file in the project root
2. Find this line:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
   ```
3. Replace with your actual Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
   ```
4. Save the file

### Step 5: Restart Dev Server

```powershell
# Stop current server (Ctrl+C)
# Start fresh
npm run dev
```

---

## ✅ Testing the OAuth Flow

1. **Start dev server**: `npm run dev`
2. **Open Word** and load the add-in
3. **Click "Sign in with Google"**
4. **Popup opens** with Google login
5. **Sign in** with your Google account
6. **Grant permissions** when prompted
7. **Popup closes automatically**
8. **You're signed in!** ✅

---

## 🔧 For Production Deployment

When deploying to production (not localhost):

### Update Google Cloud Console

1. Go to **APIs & Services** → **Credentials**
2. Click on your **Web Application** client
3. **Add Production URLs**:

   **Authorized JavaScript origins**:
   ```
   https://your-production-domain.com
   ```
   
   **Authorized redirect URIs**:
   ```
   https://your-production-domain.com/oauth-callback.html
   ```

4. Click **Save**

### Update .env for Production

```env
VITE_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
VITE_DEV_SERVER_URL=https://your-production-domain.com
```

---

## 🆚 Web App vs Desktop App

### Previous (Desktop App) ❌
- User had to manually copy/paste authorization code
- More steps, confusing UX
- Used `urn:ietf:wg:oauth:2.0:oob` redirect

### Current (Web Application) ✅
- Automatic popup-based authentication
- Single click sign-in
- Uses proper redirect URI: `https://localhost:3000/oauth-callback.html`
- Better user experience

---

## 🐛 Troubleshooting

### Error: "Redirect URI mismatch"

**Problem**: The redirect URI in your OAuth request doesn't match what's configured in Google Cloud Console.

**Solution**:
1. Verify in Google Cloud Console → Credentials → Your OAuth Client
2. Make sure this exact URL is in **Authorized redirect URIs**:
   ```
   https://localhost:3000/oauth-callback.html
   ```
3. No trailing slashes, exact match required
4. Restart dev server after changes

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not properly configured.

**Solution**:
1. Go to **APIs & Services** → **OAuth consent screen**
2. Make sure app is not in "Testing" mode or add yourself as a test user
3. Verify all required fields are filled
4. Make sure **Generative Language API** scope is added

### Error: "The OAuth client was not found"

**Problem**: Client ID is incorrect or credentials deleted.

**Solution**:
1. Double-check Client ID in `.env` file
2. Verify it matches exactly what's in Google Cloud Console
3. Make sure you copied the Web Application client ID (not Desktop app)

### Popup blocked by browser

**Problem**: Browser is blocking the OAuth popup.

**Solution**:
1. Allow popups for `localhost:3000` in your browser
2. Try clicking the sign-in button again
3. Look for popup blocker icon in address bar

### SSL Certificate warnings

**Problem**: Browser doesn't trust the localhost SSL certificate.

**Solution**:
1. Make sure you've generated SSL certificates: `.\setup-ssl.ps1`
2. Trust the certificate in Windows: 
   - Run `certmgr.msc`
   - Import `localhost.crt` into **Trusted Root Certification Authorities**
3. Restart browser after trusting certificate

---

## 📝 Important Notes

### Development URLs
- ✅ `https://localhost:3000` - Correct
- ❌ `http://localhost:3000` - Wrong (must use HTTPS)
- ❌ `https://127.0.0.1:3000` - Won't work (use localhost)
- ❌ `https://localhost:3000/` - Trailing slash may cause issues

### Scopes Required
The add-in requests these OAuth scopes:
- `openid` - Basic OpenID Connect
- `email` - User's email address
- `profile` - User's profile information
- `https://www.googleapis.com/auth/cloud-platform` - **Google Cloud Platform access (includes Gemini API)**

### Token Expiration
- Access tokens expire after **1 hour**
- Refresh tokens are stored for auto-renewal
- User needs to re-authenticate if refresh token expires

---

## 🎯 Quick Checklist

Before testing:

- [ ] Google Cloud project created
- [ ] Generative Language API enabled
- [ ] OAuth consent screen configured
- [ ] Web Application OAuth client created
- [ ] Authorized JavaScript origin: `https://localhost:3000`
- [ ] Authorized redirect URI: `https://localhost:3000/oauth-callback.html`
- [ ] Client ID copied to `.env` file
- [ ] SSL certificates generated and trusted
- [ ] Dev server running (`npm run dev`)
- [ ] Browser allows popups for localhost:3000

---

## 📚 Additional Resources

- [Google OAuth 2.0 Web Server Flow](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12) for error messages
2. **Check terminal** for server errors
3. **Clear browser cache** and localStorage
4. **Try incognito mode** to rule out extensions
5. **Verify all URLs** match exactly (case-sensitive)
6. **Check firewall** isn't blocking localhost:3000

---

**Need more help?** Check the main [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md)
