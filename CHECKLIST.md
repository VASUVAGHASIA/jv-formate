# Developer Checklist - Before First Run

## ✅ Prerequisites Setup

### 1. Google Cloud Setup
- [ ] Create Google Cloud Project at https://console.cloud.google.com/
- [ ] Enable "Generative Language API"
- [ ] Create OAuth 2.0 Client ID
- [ ] Add `https://localhost:3000` to authorized JavaScript origins
- [ ] Copy Client ID

### 2. Project Configuration
- [ ] Navigate to project folder: `cd Add-in-TWO`
- [ ] Install dependencies: `npm install`
- [ ] Open `src/components/LoginButton.tsx`
- [ ] Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
- [ ] Save the file

### 3. SSL Certificate (Development)
- [ ] Accept HTTPS certificate warning in browser
- [ ] Trust self-signed certificate (if prompted)
- [ ] Ensure `https://localhost:3000` is accessible

### 4. Office Add-in Setup
- [ ] Ensure Microsoft Word is installed
- [ ] Enable Developer Mode in Word (if required)
- [ ] Prepare to sideload add-in

## 🚀 First Run Steps

### 1. Start Development Server
```powershell
npm run dev
```
Expected output:
```
VITE v5.x.x ready in xxx ms
➜ Local: https://localhost:3000/
```

### 2. Verify Server
- [ ] Open browser to `https://localhost:3000/src/taskpane/taskpane.html`
- [ ] Accept certificate warning (if any)
- [ ] Confirm page loads (may show blank if not in Word context)

### 3. Sideload Add-in

**Option A - Automatic (Recommended)**
```powershell
npx office-addin-debugging start manifest.xml desktop
```

**Option B - Manual**
1. Open Word Desktop
2. Go to **Insert** > **Get Add-ins** > **My Add-ins**
3. Click **Upload My Add-in**
4. Select `manifest.xml` from project folder
5. Click **Upload**

### 4. Test Add-in
- [ ] Look for "AI Assistant" button in Word ribbon (Home tab)
- [ ] Click "AI Assistant" button
- [ ] Taskpane opens on the right side
- [ ] UI loads with "Sign in with Google" button

### 5. Test Authentication
- [ ] Click "Sign in with Google"
- [ ] Google OAuth popup appears
- [ ] Sign in with Google account
- [ ] Grant permissions for Generative Language API
- [ ] Taskpane shows authenticated state
- [ ] User name appears (if provided)

### 6. Test AI Features
- [ ] Go to **Ask** tab
- [ ] Type a prompt (e.g., "Write a short paragraph about AI")
- [ ] Click send button or press Enter
- [ ] AI response appears in chat
- [ ] Click "Insert into Word" button
- [ ] Text inserted at cursor position in document

### 7. Test Quick Actions
- [ ] Select some text in Word document
- [ ] Go to **Agent** tab in add-in
- [ ] Click "Improve Writing"
- [ ] Wait for AI processing
- [ ] Result appears in preview
- [ ] Click "Replace" button
- [ ] Selected text is replaced

### 8. Test Formatting
- [ ] Go to **Format** tab
- [ ] Click "Auto Format Document"
- [ ] Verify document margins, fonts, and headings are updated
- [ ] Test individual formatting buttons

### 9. Test Context Menu
- [ ] Select text in Word
- [ ] Right-click selected text
- [ ] Look for "Improve Writing", "Summarize", "Format Section"
- [ ] Click one of the options
- [ ] Verify it works correctly

## 🐛 Troubleshooting

### Add-in Not Loading
- [ ] Check dev server is running (`npm run dev`)
- [ ] Verify URL in manifest.xml matches server URL
- [ ] Clear Office cache: Delete `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef`
- [ ] Restart Word
- [ ] Re-sideload add-in

### OAuth Not Working
- [ ] Verify Client ID is correct in `LoginButton.tsx`
- [ ] Check browser console for errors (F12)
- [ ] Ensure `https://localhost:3000` is in authorized origins
- [ ] Try signing out and signing in again
- [ ] Check Google Cloud Console for API status

### Gemini API Errors
- [ ] Verify "Generative Language API" is enabled
- [ ] Check OAuth scope is granted: `https://www.googleapis.com/auth/generative-language`
- [ ] Look at Network tab in browser console
- [ ] Verify token is being sent in Authorization header
- [ ] Check API quota limits in Google Cloud Console

### TypeScript Errors
- [ ] Run `npm install` to ensure all dependencies installed
- [ ] Check `node_modules/@types/office-js` exists
- [ ] Run `npx tsc --noEmit` to check for type errors
- [ ] Some Office.js types may show warnings (can be ignored if functionality works)

### Build Errors
- [ ] Delete `node_modules` folder
- [ ] Delete `package-lock.json`
- [ ] Run `npm install` again
- [ ] Clear npm cache: `npm cache clean --force`

## ✅ Success Criteria

You know everything is working when:
- ✅ Add-in button appears in Word ribbon
- ✅ Taskpane opens without errors
- ✅ Google sign-in completes successfully
- ✅ AI chat responds to prompts
- ✅ Text can be inserted into Word
- ✅ Quick actions process selected text
- ✅ Formatting tools modify document
- ✅ Context menu commands work
- ✅ No console errors (except minor type warnings)

## 📝 Configuration Files to Review

1. **manifest.xml** - Add-in configuration
2. **package.json** - Dependencies and scripts
3. **vite.config.ts** - Build configuration
4. **src/components/LoginButton.tsx** - **MUST UPDATE CLIENT ID**
5. **src/utils/gemini.ts** - AI integration logic
6. **src/utils/wordUtils.ts** - Word automation functions

## 🎯 Next Steps After Success

1. [ ] Replace placeholder icons in `public/assets/` with real PNGs
2. [ ] Customize UI styling in components
3. [ ] Add more AI prompts/agents
4. [ ] Implement error logging
5. [ ] Test on Word Online
6. [ ] Test on Mac (if available)
7. [ ] Prepare for production deployment

## 📚 Helpful Resources

- **README.md** - Full documentation
- **QUICKSTART.md** - Quick setup guide
- **ARCHITECTURE.md** - System architecture
- **IMPLEMENTATION_SUMMARY.md** - Complete feature list

## 🆘 Getting Help

If stuck, check:
1. Browser console (F12) for JavaScript errors
2. Word Web Add-in errors (if any pop up)
3. Network tab to see API calls
4. This checklist again
5. README.md troubleshooting section

---

**Ready to start? Follow this checklist step by step! 🚀**
