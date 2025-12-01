# 🔐 VS Code-Style Device Flow Authentication

## Overview

This Word Add-in now uses **Google OAuth 2.0 Device Authorization Flow** - the same secure method used by VS Code, GitHub CLI, and Azure CLI.

## ✨ Key Benefits

✅ **Opens in REAL system browser** (Chrome/Edge with your existing accounts)  
✅ **Shows logged-in Google accounts** (no manual login needed)  
✅ **No WebView2 popups** (better UX)  
✅ **No redirect URIs needed** (simpler setup)  
✅ **Works like VS Code** (familiar flow)  

---

## 🎯 How It Works

### Flow Diagram

```
1. User clicks "Sign in with Google" in Word Add-in
   ↓
2. Add-in requests device code from Google
   POST: https://oauth2.googleapis.com/device/code
   ↓
3. Google returns:
   - device_code (for polling)
   - user_code (shown to user)
   - verification_url (Google login page)
   ↓
4. Add-in opens verification URL in REAL system browser
   Uses: Office.context.ui.displayDialogAsync({ displayInIframe: false })
   ↓
5. Browser shows Google's account chooser
   User sees their Chrome logged-in accounts
   ↓
6. User selects account and grants permissions
   ↓
7. Add-in polls Google token endpoint every 5 seconds
   POST: https://oauth2.googleapis.com/token
   ↓
8. When user completes login, Google returns access_token
   ↓
9. Add-in stores token in localStorage
   ↓
10. Add-in uses token for Gemini API calls
   Authorization: Bearer <access_token>
```

---

## 📂 Implementation Files

### 1. `/src/utils/device-auth.ts`
**Complete device flow implementation**

**Key Functions:**
- `requestDeviceCode()` - Get device code from Google
- `openVerificationUrlInBrowser()` - Open system browser
- `pollForToken()` - Poll until user completes login
- `getUserInfo()` - Get user profile
- `executeDeviceFlow()` - Complete flow orchestration
- `storeToken()` / `getStoredToken()` - Token storage
- `storeUserInfo()` / `getStoredUserInfo()` - User info storage

### 2. `/src/components/LoginButton.tsx`
**React component with VS Code-style UX**

**Features:**
- Shows login status in real-time
- Displays user code during login
- Handles sign in/sign out
- Checks for existing tokens on mount
- Shows user name after login

---

## 🔧 Google Cloud Console Setup

### Step 1: Create OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth 2.0 Client ID"**
4. Choose application type: **"TVs and Limited Input devices"** ⚠️ CRITICAL!
5. Give it a name: `JV-ForMate Word Add-in`
6. Click **"Create"**
7. Copy your **Client ID**

**IMPORTANT**: You MUST select **"TVs and Limited Input devices"** type. This is the ONLY type that supports OAuth 2.0 Device Authorization Flow (RFC 8628). Do NOT use "Desktop app" or "Web application".

### Step 2: Enable APIs

Enable these APIs:
- ✅ **Generative Language API** (for Gemini)
- ✅ **Google OAuth 2.0**

### Step 3: Update .env

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### ⚠️ Important Notes

**NO redirect URIs needed!** This is a huge advantage of device flow.

The client type should be:
- **Desktop app** (recommended)
- OR **TVs and Limited Input devices**

Do NOT use "Web application" type for device flow.

---

## 🚀 Usage

### Starting the Add-in

```powershell
npm run dev
npx office-addin-debugging start manifest.xml desktop
```

### Testing Login

1. Open Word with sideloaded add-in
2. Click **"Sign in with Google"**
3. Browser opens automatically
4. Select your Google account
5. Grant permissions
6. Browser can be closed manually
7. Word Add-in detects login completion
8. Shows "✅ Signed in as [Your Name]"

---

## 🔍 Technical Details

### Device Code Request

```javascript
POST https://oauth2.googleapis.com/device/code
Content-Type: application/x-www-form-urlencoded

client_id=YOUR_CLIENT_ID&
scope=openid email profile https://www.googleapis.com/auth/generative-language.retriever
```

**Response:**
```json
{
  "device_code": "AH-1Ng2gcXs...",
  "user_code": "GQVQ-JKEC",
  "verification_url": "https://www.google.com/device",
  "verification_url_complete": "https://www.google.com/device?user_code=GQVQ-JKEC",
  "expires_in": 1800,
  "interval": 5
}
```

### Token Polling

```javascript
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

client_id=YOUR_CLIENT_ID&
device_code=AH-1Ng2gcXs...&
grant_type=urn:ietf:params:oauth:grant-type:device_code
```

**Responses:**

**Pending:**
```json
{
  "error": "authorization_pending"
}
```

**Success:**
```json
{
  "access_token": "ya29.a0AfH6SMC...",
  "token_type": "Bearer",
  "expires_in": 3599,
  "scope": "openid email profile...",
  "refresh_token": "1//0gQE7R..."
}
```

### Opening System Browser

```javascript
Office.context.ui.displayDialogAsync(
  verificationUrl,
  {
    height: 70,
    width: 60,
    displayInIframe: false,  // CRITICAL: Forces system browser
    promptBeforeOpen: false,
  },
  (result) => {
    // Handle result
  }
);
```

**Why `displayInIframe: false` is critical:**
- ✅ Opens in user's default browser (Chrome/Edge)
- ✅ Uses existing browser profile
- ✅ Shows logged-in Google accounts
- ❌ Without it: Opens in isolated WebView with no cookies

---

## 💾 Token Storage

**Where:**
- `localStorage` (persists across Word sessions)

**What:**
- `google_access_token` - Access token for API calls
- `google_token_expires_at` - Expiration timestamp
- `google_refresh_token` - Refresh token (optional)
- `google_user_info` - User name, email, picture

**Expiration:**
- Access tokens expire after ~1 hour
- Add-in automatically checks expiration
- User must re-authenticate when expired

---

## 🛡️ Security Features

1. **No Client Secret** - Device flow doesn't require it
2. **No Redirect URIs** - Eliminates redirect URI attacks
3. **Limited Scope** - Only requests needed permissions
4. **Token Expiration** - Automatic checking
5. **HTTPS Only** - All communication encrypted
6. **Origin Validation** - (not applicable for device flow)

---

## 🎨 User Experience

### Login Flow

```
1. [User clicks "Sign in with Google"]
   ↓
2. Status: "Requesting authorization..."
   ↓
3. Status: "Login code: GQVQ-JKEC - Browser opened"
   ↓
4. [Browser opens with Google account chooser]
   ↓
5. Status: "Waiting for you to complete login in browser... (1)"
   Status: "Waiting for you to complete login in browser... (2)"
   ...
   ↓
6. [User selects account in browser]
   ↓
7. Status: "Getting user information..."
   ↓
8. Status: "Successfully signed in as John Doe"
   ↓
9. [Shows green success box with user name]
   [Shows "Sign Out" button]
```

### Already Signed In

```
1. [User opens Word Add-in]
   ↓
2. Add-in checks localStorage for token
   ↓
3. Found valid token → Auto-signed in
   ↓
4. [Shows "✅ Signed in as John Doe"]
```

---

## 🐛 Troubleshooting

### "invalid_client" Error

**Full Error Message:**
```
Failed to request device code: 401 - { "error": "invalid_client", 
"error_description": "Only clients of type 'TVs and Limited Input devices' 
can use the OAuth 2.0 flow for TV and Limited-Input Device Applications..." }
```

**Cause:** Wrong OAuth client type selected in Google Cloud Console

**Solution:**
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your existing OAuth client
3. **Delete it** (or create a new one)
4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. Select application type: **"TVs and Limited Input devices"** ⚠️
6. Name: `JV-ForMate Word Add-in`
7. Click **"Create"**
8. Copy the new Client ID
9. Update your `.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=new-client-id-here.apps.googleusercontent.com
   ```
10. Restart dev server: `npm run dev`

**Note:** "Desktop app" type does NOT work for device flow! You must use "TVs and Limited Input devices".

### Browser Doesn't Open

**Cause:** Office.js not available or dialog API failed

**Solution:** Add-in automatically falls back to `window.open()`

### Popup Blocked

**Cause:** Browser blocking popups

**Solution:** Allow popups for `https://localhost:3000`

### "Device code expired"

**Cause:** User took too long (>30 minutes)

**Solution:** Click "Sign in" again to get new code

### Token Expired

**Cause:** Token expired after 1 hour

**Solution:** Click "Sign Out" then "Sign in" again

---

## 📊 Comparison: Device Flow vs PKCE Flow

| Feature | Device Flow | PKCE Flow |
|---------|------------|-----------|
| Opens in system browser | ✅ Yes | ⚠️ Depends |
| Shows Chrome accounts | ✅ Yes | ⚠️ Maybe |
| Needs redirect URI | ❌ No | ✅ Yes |
| Setup complexity | ⭐⭐ Easy | ⭐⭐⭐⭐ Complex |
| Used by VS Code | ✅ Yes | ❌ No |
| Works offline | ❌ No | ❌ No |
| Polling required | ✅ Yes | ❌ No |

**Winner:** Device Flow for desktop apps! ✨

---

## 🎯 Next Steps

### Production Deployment

1. **Update OAuth Client:**
   - Change type from "Desktop" to "Web" if deploying to web
   - OR keep "Desktop" if staying as Office Add-in

2. **Update .env:**
   ```env
   VITE_GOOGLE_CLIENT_ID=production-client-id-here
   VITE_DEV_SERVER_URL=https://your-production-domain.com
   ```

3. **Deploy:**
   - Build: `npm run build`
   - Upload `dist/` to web server
   - Update `manifest.xml` URLs

### Refresh Token Implementation

Currently not implemented. To add:

```typescript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('google_refresh_token');
  if (!refreshToken) throw new Error('No refresh token');
  
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
  storeToken(data);
  return data.access_token;
}
```

---

## 📚 References

- [Google OAuth 2.0 Device Flow](https://developers.google.com/identity/protocols/oauth2/limited-input-device)
- [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://tools.ietf.org/html/rfc8628)
- [Office.js Dialog API](https://docs.microsoft.com/en-us/office/dev/add-ins/develop/dialog-api-in-office-add-ins)
- [VS Code Authentication](https://code.visualstudio.com/api/references/vscode-api#authentication)

---

**✨ You now have a production-ready VS Code-style authentication system!**
