# Quick Start Guide

Get up and running in 5 minutes! ⚡

## 1. Install Dependencies

```powershell
npm install
```

## 2. Configure Environment Variables

### Step 2.1: Add Your Google Client ID to `.env`

A `.env` file has been created with placeholders. You need to add your Google OAuth credentials:

1. Open the `.env` file in the project root
2. Find this line:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
   ```
3. Replace with your actual Client ID (see next step if you don't have one)
4. Save the file

### Step 2.2: Get Google OAuth Client ID (First Time Setup)

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **"Generative Language API"**
4. Go to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID** (Web application)
6. Add authorized JavaScript origin: `https://localhost:3000`
7. Copy your Client ID
8. Paste it into the `.env` file (replace the placeholder)

**📚 Need detailed instructions?** See [CREDENTIALS_SETUP.md](./CREDENTIALS_SETUP.md)

**🔒 Security Note**: Never commit your `.env` file to version control (it's already in `.gitignore`)

## 3. Start Development Server

```powershell
npm run dev
```

Server runs at: `https://localhost:3000`

## 4. Sideload Add-in

### Option A: Word Desktop (Recommended for Development)

```powershell
npx office-addin-debugging start manifest.xml desktop
```

### Option B: Manual Sideload

1. Open Word
2. Go to **Insert > Get Add-ins > My Add-ins**
3. Click **Upload My Add-in**
4. Select `manifest.xml`

## 5. Test the Add-in

1. Click "AI Assistant" button in Word ribbon
2. Sign in with Google
3. Grant API permissions
4. Start using AI features!

## Common Commands

```powershell
# Development
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

**Add-in not loading?**
- Ensure dev server is running
- Check HTTPS certificate is trusted
- Clear Office cache: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef`

**OAuth not working?**
- Verify Client ID in `.env` is correct
- Restart dev server after changing `.env`
- Check browser console for errors
- Ensure API is enabled in Google Cloud
- Verify authorized origins include `https://localhost:3000`

**"Setup Required" warning appears?**
- Make sure you've replaced the placeholder in `.env`
- Client ID should end with `.apps.googleusercontent.com`
- Restart the dev server (`npm run dev`)

**Need help?**
- Check README.md for detailed documentation
- Review Office.js documentation
- Check browser console for errors

---

Happy coding! 🚀
