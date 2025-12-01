# 🔐 Credentials Setup Guide

This guide will help you set up the required credentials for the JV-ForMate Word Add-in using **VS Code-style Device Flow authentication**.

## Prerequisites

- A Google account
- Access to Google Cloud Console

---

## 📝 Step-by-Step Setup

### 1. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one:
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: `JV-ForMate` (or your preferred name)
   - Click "Create"

### 2. Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for and enable the following API:
   - **Generative Language API** (for Gemini AI)
3. Click "Enable" on the API page

### 3. Create OAuth 2.0 Credentials for Device Flow

1. Go to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: `JV-ForMate`
   - Add your email as support email
   - Add developer contact information
   - Click "Save and Continue"
   - Add scopes (optional for now)
   - Add test users if needed
   - Click "Save and Continue"

5. Back at "Create OAuth client ID":
   - Application type: **TVs and Limited Input devices** (CRITICAL!)
   - Name: `JV-ForMate Word Add-in`
   - Click **"Create"**

6. **Copy your Client ID** - it will look like:
   ```
   123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```

### ⚠️ CRITICAL: Use "TVs and Limited Input devices" Type

For device flow authentication, you MUST select **"TVs and Limited Input devices"** as the application type. Do NOT use "Web application" or "Desktop app".

**Why?**
- This is the ONLY type that supports OAuth 2.0 Device Authorization Flow (RFC 8628)
- No redirect URIs needed
- Works perfectly with VS Code-style authentication
- Opens in user's real browser with existing Google accounts
- Same flow used by: VS Code, GitHub CLI, Azure CLI, Google Cloud SDK

### 4. Configure Environment Variables

1. In the project root (`Add-in-TWO` folder), you'll find a `.env` file
2. Open `.env` in your text editor
3. Replace the placeholder with your actual Client ID:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

4. Save the file

---

## ✅ That's It!

No redirect URIs needed! No authorized JavaScript origins! Device flow is much simpler to set up.

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` file** to version control
2. ✅ **Keep credentials private** - don't share them publicly
3. ✅ **Use Desktop app type** for device flow
4. ✅ **Rotate credentials** periodically
5. ✅ **Monitor API usage** in Google Cloud Console

---

## 🧪 Testing Your Setup

After configuring your credentials:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Sideload the add-in in Word:
   ```bash
   npx office-addin-debugging start manifest.xml desktop
   ```

3. Click the "Sign in with Google" button
4. Your browser opens with Google's device verification page
5. You should see your Chrome logged-in accounts
6. After authorizing, the add-in automatically detects login completion
7. You're ready to use AI features! 🎉

---

## ❗ Troubleshooting

### "Invalid client_id"
- **Cause**: Incorrect Client ID in `.env` file
- **Solution**: Double-check your Client ID from Google Cloud Console

### "Browser doesn't open"
- **Cause**: Office.js dialog API not available
- **Solution**: Add-in automatically falls back to window.open()

### "Popup blocked"
- **Cause**: Browser blocking popups
- **Solution**: Allow popups for `https://localhost:3000`

### Cannot access Gemini API
- **Cause**: API not enabled or incorrect scopes
- **Solution**: 
  - Verify "Generative Language API" is enabled
  - Check OAuth scope includes: `https://www.googleapis.com/auth/generative-language.retriever`

---

## 📚 Additional Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Device Flow](https://developers.google.com/identity/protocols/oauth2/limited-input-device)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [OAuth 2.0 RFC 8628](https://tools.ietf.org/html/rfc8628)

---

## 📧 Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify credentials are correctly copied
3. Ensure "Generative Language API" is enabled
4. Check that you're using "Desktop app" type (not "Web application")
5. Review the [DEVICE_FLOW_GUIDE.md](./DEVICE_FLOW_GUIDE.md) for detailed flow documentation

---

**Last Updated**: November 24, 2025
