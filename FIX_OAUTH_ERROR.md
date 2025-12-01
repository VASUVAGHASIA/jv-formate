# ⚠️ URGENT: Fix OAuth Client Type Error

## The Problem

You're getting this error:
```
Authentication Error

Failed to request device code: 401 - { "error": "invalid_client", 
"error_description": "Only clients of type 'TVs and Limited Input devices' 
can use the OAuth 2.0 flow for TV and Limited-Input Device Applications..." }
```

## The Root Cause

Your Google OAuth client is the **WRONG TYPE**. Device flow ONLY works with **"TVs and Limited Input devices"** type.

---

## ✅ How to Fix (5 minutes)

### Step 1: Delete Old OAuth Client

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth client (the one with ID ending in `...ooogmpde.apps.googleusercontent.com`)
3. Click the **trash icon** to delete it

### Step 2: Create NEW OAuth Client with Correct Type

1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. **Application type**: Select **"TVs and Limited Input devices"** ⚠️ THIS IS CRITICAL!
   - Do NOT select "Desktop app"
   - Do NOT select "Web application"
   - ONLY "TVs and Limited Input devices" works!
4. **Name**: `JV-ForMate Word Add-in`
5. Click **"Create"**
6. **Copy the Client ID** (will look like: `123456-abc...xyz.apps.googleusercontent.com`)

### Step 3: Update Your .env File

1. Open: `d:\SGP\JV-formate\JV-ForMate\Add-in-TWO\.env`
2. Replace the old Client ID with the new one:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR-NEW-CLIENT-ID-HERE.apps.googleusercontent.com
   ```
3. Save the file

### Step 4: Restart Dev Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test Login

1. Refresh the Word Add-in
2. Click "Sign in with Google"
3. Should now work! ✅

---

## Why This Specific Type?

From [Google's official docs](https://developers.google.com/identity/protocols/oauth2/limited-input-device#creatingcred):

> "The OAuth 2.0 flow for TV and Limited-Input Device Applications requires 
> an OAuth 2.0 client ID with an application type of 'TVs and Limited Input devices'."

This is the SAME flow used by:
- ✅ VS Code (for GitHub login)
- ✅ GitHub CLI
- ✅ Azure CLI
- ✅ Google Cloud SDK

All use **"TVs and Limited Input devices"** type!

---

## Visual Guide

In Google Cloud Console, you should see:

```
Create OAuth client ID
┌─────────────────────────────────────────┐
│ Application type                        │
│                                         │
│ ○ Web application                       │
│ ○ Android                               │
│ ○ Chrome app                            │
│ ○ iOS                                   │
│ ○ Universal Windows Platform (UWP)     │
│ ● TVs and Limited Input devices  ← SELECT THIS! │
│                                         │
│ Name                                    │
│ JV-ForMate Word Add-in                  │
└─────────────────────────────────────────┘
     [CREATE]  [CANCEL]
```

---

## After Fixing

You should see:
1. Browser opens with Google account chooser
2. Your Chrome logged-in accounts appear
3. Select account
4. Grant permissions
5. Add-in shows "✅ Signed in as [Your Name]"

---

## Need More Help?

- **Full Setup Guide**: `CREDENTIALS_SETUP.md`
- **Device Flow Details**: `DEVICE_FLOW_GUIDE.md`
- **Troubleshooting**: See "🐛 Troubleshooting" section in DEVICE_FLOW_GUIDE.md

---

**Updated**: November 24, 2025
