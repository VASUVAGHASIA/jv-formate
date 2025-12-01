# 🔐 OAuth 2.0 PKCE Flow - Complete Implementation Guide

## 📖 Overview

This Word Add-in now uses **OAuth 2.0 Authorization Code Flow with PKCE** to authenticate users with Google. The authentication happens in the **system's default browser (Chrome)**, not in the WebView2 popup, allowing users to use their already-logged-in Google accounts.

---

## 🎯 How It Works

### **Flow Diagram**

```
1. User clicks "Sign in with Google"
   ↓
2. Add-in generates PKCE parameters (code_verifier, code_challenge)
   ↓
3. Add-in stores parameters in sessionStorage
   ↓
4. Add-in builds Google OAuth URL with PKCE challenge
   ↓
5. Add-in opens URL in SYSTEM BROWSER (Chrome) using Office.context.ui.displayDialogAsync
   ↓
6. User sees their Chrome logged-in accounts (no manual login!)
   ↓
7. User selects account and grants permissions
   ↓
8. Google redirects to: https://localhost:3000/oauth2callback.html?code=xxx&state=xxx
   ↓
9. oauth2callback.html receives authorization code
   ↓
10. Callback page validates state (CSRF protection)
   ↓
11. Callback sends code to parent window via postMessage
   ↓
12. Add-in receives code
   ↓
13. Add-in exchanges code + code_verifier for access_token
   ↓
14. Add-in gets user info from Google
   ↓
15. Add-in stores access_token in sessionStorage
   ↓
16. Add-in sets token for Gemini API calls
   ↓
17. ✅ User is authenticated and ready to use AI features!
```

---

## 📂 Files Changed/Created

### **1. `/src/utils/oauth-pkce.ts` (NEW)**
**Purpose**: PKCE utilities for secure OAuth flow

**Key Functions**:
- `createPKCEParams()` - Generates code_verifier, code_challenge, state
- `storePKCEParams()` - Stores PKCE params in sessionStorage
- `retrievePKCEParams()` - Retrieves stored params for verification
- `buildAuthorizationUrl()` - Constructs Google OAuth URL
- `exchangeCodeForToken()` - Exchanges auth code for access token
- `getUserInfo()` - Gets user profile from Google
- `storeAccessToken()` - Stores token with expiration
- `getStoredAccessToken()` - Retrieves valid token (checks expiration)

**Security Features**:
- SHA-256 hashing for code challenge
- Cryptographically random string generation
- CSRF protection via state parameter
- Token expiration checking

---

### **2. `/public/oauth2callback.html` (NEW)**
**Purpose**: OAuth redirect handler page

**What it does**:
1. Receives authorization code from Google
2. Validates state parameter (CSRF protection)
3. Sends code to parent window via `postMessage`
4. Also uses `Office.context.ui.messageParent` for Office dialogs
5. Stores result in localStorage as fallback
6. Closes window automatically after 2 seconds

**Security**:
- Origin validation
- State parameter verification
- Multiple communication methods (postMessage, Office API, localStorage)

---

### **3. `/src/components/LoginButton.tsx` (UPDATED)**
**Purpose**: Login button component with OAuth flow

**Major Changes**:
- Removed Google Identity Services (GIS) popup
- Implemented OAuth 2.0 PKCE flow
- Opens system browser instead of WebView2
- Listens for messages from redirect page
- Handles token exchange and storage
- Shows status messages during authentication

**Key Methods**:
- `handleLogin()` - Initiates OAuth flow
- `openInSystemBrowser()` - Opens auth URL in Chrome
- `handleOAuthMessage()` - Receives code from redirect
- `handleAuthorizationCode()` - Exchanges code for token

**User Experience**:
- Shows status: "Preparing login...", "Opening browser...", "Waiting for login..."
- Displays user name after successful login
- Shows errors if authentication fails

---

### **4. `/manifest.xml` (UPDATED)**
**Changes**:
- Added OAuth domains to `<AppDomains>`:
  - `https://oauth2.googleapis.com`
  - `https://www.googleapis.com`
  - `https://localhost:3000`
- Added OAuth callback URL to resources

---

### **5. `/vite.config.ts` (UPDATED)**
**Changes**:
- Added `oauth2callback.html` to build inputs
- Ensures callback page is bundled in production build

---

## 🔧 Google Cloud Console Setup

### **Step 1: Update OAuth Client**

Go to: [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)

### **Step 2: Configure URLs**

**Authorized JavaScript origins:**
```
https://localhost:3000
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://localhost:3000/oauth2callback.html
http://localhost:3000/oauth2callback.html
```

### **Step 3: Enable APIs**

Enable these APIs in Google Cloud Console:
1. **Generative Language API** (for Gemini)
2. **Google OAuth 2.0**
3. **People API** (optional, for user info)

---

## 🚀 How to Use

### **1. Update `.env` file**

```env
VITE_GOOGLE_CLIENT_ID=157975980548-a6q2qe17ggumr8vvuq3c1i59ooogmpde.apps.googleusercontent.com
VITE_DEV_SERVER_URL=https://localhost:3000
```

### **2. Start Development Server**

```powershell
npm run dev
```

### **3. Sideload Add-in in Word**

```powershell
npx office-addin-debugging start manifest.xml desktop
```

### **4. Test Authentication**

1. Open Word add-in taskpane
2. Click "Sign in with Google"
3. A browser window opens (Chrome)
4. You see your Chrome logged-in accounts
5. Select account and grant permissions
6. Browser closes automatically
7. You're signed in! ✅

---

## 🔍 Debugging

### **Enable Console Logging**

The implementation includes detailed console logs:

```javascript
console.log('🚀 Starting OAuth 2.0 PKCE flow...');
console.log('🔗 Authorization URL:', authUrl);
console.log('🔑 Authorization code received');
console.log('✅ Access token received');
```

### **Check Browser Console**

- **Taskpane console**: Shows flow progress
- **Redirect page console**: Shows callback processing

### **Common Issues**

#### **1. "Popup blocked"**
- **Solution**: Allow popups for `https://localhost:3000`

#### **2. "State mismatch"**
- **Cause**: PKCE params not stored properly
- **Solution**: Check sessionStorage, clear and retry

#### **3. "redirect_uri_mismatch"**
- **Cause**: Redirect URI not in Google Cloud Console
- **Solution**: Add `https://localhost:3000/oauth2callback.html`

#### **4. Dialog doesn't open**
- **Cause**: Office.js not loaded or wrong context
- **Solution**: Falls back to window.open automatically

---

## 📊 Token Storage

### **Where tokens are stored**

1. **sessionStorage** (persists across page reloads in same tab)
   - `google_access_token`
   - `google_token_expires_at`
   - `google_refresh_token` (optional)
   - `oauth_code_verifier`
   - `oauth_state`

2. **In-memory** (via gemini.ts `setAccessToken`)

### **Token Expiration**

- Access tokens expire after ~1 hour
- Add-in checks expiration before using stored token
- User must re-authenticate when token expires

### **Future Enhancement: Refresh Tokens**

Currently not implemented, but can be added:
1. Store refresh token from token response
2. When access token expires, use refresh token
3. Get new access token without user interaction

---

## 🔒 Security Features

### **1. PKCE (Proof Key for Code Exchange)**
- Prevents authorization code interception
- Uses SHA-256 hashing
- No client secret needed

### **2. State Parameter**
- Prevents CSRF attacks
- Random 32-character string
- Validated on redirect

### **3. HTTPS Only**
- All communication over HTTPS
- Localhost development uses self-signed cert

### **4. Origin Validation**
- postMessage origin checking
- Only accepts messages from same origin

### **5. Token Expiration**
- Tokens expire after 1 hour
- Automatic expiration checking
- No stale tokens used

---

## 🎨 User Experience

### **Before (Old GIS Flow)**
❌ Popup opens inside WebView2  
❌ User must manually log in  
❌ No Chrome account picker  
❌ Cookies not shared  

### **After (New PKCE Flow)**
✅ Opens in system Chrome browser  
✅ Shows Chrome logged-in accounts  
✅ One-click account selection  
✅ Cookies shared with Chrome  
✅ Automatic window closing  

---

## 📈 Next Steps

### **Production Deployment**

1. Update redirect URIs to production domain:
   ```
   https://your-domain.com/oauth2callback.html
   ```

2. Update `.env` for production:
   ```env
   VITE_DEV_SERVER_URL=https://your-domain.com
   ```

3. Update `manifest.xml` URLs to production

4. Deploy to web server with HTTPS

### **Refresh Token Implementation**

Add refresh token logic to handle expired tokens:

```typescript
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await response.json();
  storeAccessToken(data.access_token, data.expires_in);
}
```

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Verify Google Cloud Console settings
3. Ensure redirect URIs match exactly
4. Check sessionStorage for PKCE params
5. Review Office.js console for dialog errors

---

**✨ You now have a production-ready OAuth 2.0 PKCE flow that opens in the system browser!**
