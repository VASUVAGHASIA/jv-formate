# Word AI Assistant Add-in

A production-grade Microsoft Word Add-in featuring AI-powered writing assistance using Google OAuth and Gemini AI. Similar to VS Code Copilot, but designed specifically for Microsoft Word.

## 🎯 Features

### AI Chat Sidebar
- Interactive AI chat interface
- Generate content from prompts
- Insert AI-generated content into document
- Replace selected text with AI improvements

### Quick AI Actions
- **Improve Writing** - Make text clearer and more professional
- **Summarize** - Create concise summaries
- **Expand Content** - Add detail and depth
- **Make Formal** - Convert to professional tone
- **Simplify** - Make text easier to understand
- **Fix Grammar** - Correct errors

### Document Formatting
- Auto-format entire document
- Apply paragraph formatting (font, size, bold, italic, underline)
- Text alignment (left, center, right)
- Bullet and numbered lists
- Fix all headings
- Normalize fonts across document
- Set standard margins
- Center all images

### Headers & Footers
- Update all headers with same text
- Update all footers with same text

### Context Menu Integration
- Right-click selected text for quick actions:
  - Improve Writing
  - Summarize Selection
  - Format This Section

## 🧱 Tech Stack

- **React** - UI framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Office.js** - Word API integration
- **Google OAuth (GIS)** - Authentication
- **Gemini API** - AI content generation
- **Vite** - Fast build tool

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **pnpm**
- **Microsoft Word** (Desktop or Online)
- **Google Cloud Project** with OAuth 2.0 credentials
- **Gemini API access** (via Google Cloud)

## 🚀 Setup Instructions

### 1. Clone and Install

```powershell
cd d:\SGP\JV-formate\JV-ForMate\Add-in-TWO
npm install
```

### 2. Configure Environment Variables

1. A `.env` file has been created with placeholders
2. You need to add your Google OAuth credentials
3. See **[CREDENTIALS_SETUP.md](./CREDENTIALS_SETUP.md)** for detailed instructions

**Quick setup:**
- Open `.env` file in the project root
- Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID from Google Cloud Console
- Save the file

### 3. Set Up Google OAuth (First Time Only)

Follow the comprehensive guide in **[CREDENTIALS_SETUP.md](./CREDENTIALS_SETUP.md)** which covers:

1. Creating a Google Cloud Project
2. Enabling the Generative Language API
3. Setting up OAuth 2.0 credentials
4. Configuring authorized domains
5. Getting your Client ID

**Quick steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Generative Language API**
4. Navigate to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth 2.0 Client ID**
6. Configure OAuth consent screen
7. Add authorized JavaScript origins: `https://localhost:3000`
8. Copy the **Client ID** and add it to your `.env` file

### 4. Configure OAuth Scopes

The add-in requires the following OAuth scope:
```
https://www.googleapis.com/auth/generative-language
```

This is already configured in `src/utils/gemini.ts`.

### 5. Development Server

Run the development server with HTTPS (required for Office Add-ins):

```powershell
npm run dev
```

The add-in will be available at `https://localhost:3000`

### 6. Sideload the Add-in

#### For Word Desktop (Windows):

1. Open Word
2. Go to **File > Options > Trust Center > Trust Center Settings**
3. Select **Trusted Add-in Catalogs**
4. Add the folder containing `manifest.xml` to the catalog
5. Check **Show in Menu**
6. Restart Word
7. Go to **Insert > My Add-ins > Shared Folder**
8. Select **AI Assistant for Word**

#### For Word Online:

1. Open Word Online
2. Go to **Insert > Office Add-ins**
3. Click **Upload My Add-in**
4. Upload the `manifest.xml` file

#### Alternative - Office Developer Sideloading:

```powershell
# Install Office-Addin-Debugging tools
npm install -g office-addin-debugging

# Sideload the add-in
npx office-addin-debugging start manifest.xml desktop
```

## 🔧 How It Works

### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Google OAuth consent screen appears
3. User grants access to Generative Language API
4. Access token is stored in component state
5. Token is used for all Gemini API calls

### Gemini AI Integration

All AI requests use OAuth Bearer Token authentication:

```typescript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ]
}
```

### Office.js Word Automation

The add-in uses Office.js Word API to:

- **Read text**: `context.document.getSelection()`
- **Insert text**: `range.insertText(text, Word.InsertLocation.end)`
- **Replace text**: `range.insertText(text, Word.InsertLocation.replace)`
- **Format paragraphs**: `range.font`, `paragraph.alignment`
- **Update headers/footers**: `section.getHeader()`, `section.getFooter()`
- **Manipulate images**: `context.document.body.inlinePictures`
- **Apply styles**: `paragraph.style`, `font.name`, `font.size`

## 📁 Project Structure

```
Add-in-TWO/
├── manifest.xml                 # Add-in manifest
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite bundler config
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── public/
│   └── assets/                 # Icon files
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-64.png
│       └── icon-80.png
└── src/
    ├── App.tsx                 # Main app component
    ├── taskpane/
    │   ├── taskpane.html       # Entry HTML
    │   └── taskpane.tsx        # React entry point
    ├── commands/
    │   ├── commands.html       # Commands entry HTML
    │   ├── commands.ts         # Commands entry point
    │   └── functions.ts        # Context menu handlers
    ├── components/
    │   ├── ChatWindow.tsx      # AI chat interface
    │   ├── LoginButton.tsx     # Google OAuth login
    │   ├── SidebarAgents.tsx   # Quick AI actions
    │   └── FormattingPanel.tsx # Document formatting tools
    ├── utils/
    │   ├── gemini.ts           # Gemini API integration
    │   └── wordUtils.ts        # Office.js helpers
    ├── types/
    │   └── google-oauth.d.ts   # TypeScript declarations
    └── styles/
        └── app.css             # Global styles
```

## 🎨 UI Components

### Ask Tab
- AI chat interface
- Send prompts to Gemini
- Insert or replace text in Word

### Agent Tab
- Document statistics
- Quick action buttons
- Preview AI results before applying

### Format Tab
- Auto-format document
- Text formatting controls
- Alignment tools
- Lists (bullets/numbers)
- Document-wide actions
- Headers & footers editor

## 🔒 Security & Privacy

- **Environment Variables** - Credentials stored in `.env` file (never committed to git)
- **No backend server** - Everything runs client-side
- **OAuth tokens** are stored in React state (not persisted)
- **No API keys** in code - Uses OAuth Bearer tokens from environment
- **HTTPS required** for production
- **`.env` protection** - Automatically excluded from version control via `.gitignore`
- Follows Office Add-in security best practices

**Important**: Never commit your `.env` file or share your credentials publicly.

## 🚧 Limitations

1. **Token Expiration**: OAuth tokens expire after 1 hour. Users need to re-authenticate.
2. **Gemini API Quotas**: Subject to Google Cloud API quotas and rate limits.
3. **Office.js Constraints**: 
   - Some Word features require specific Office versions
   - Advanced image wrapping requires floating pictures (not inline)
4. **Browser Compatibility**: Requires modern browsers supporting ES2020+
5. **HTTPS Required**: Must be served over HTTPS for production

## 🛠️ Development

### Build for Production

```powershell
npm run build
```

Output will be in `dist/` folder.

### Linting

```powershell
npm run lint
```

### Type Checking

```powershell
npx tsc --noEmit
```

## 📝 Supported Office.js Features

- ✅ Read/Write document text
- ✅ Selection manipulation
- ✅ Paragraph formatting
- ✅ Font styling
- ✅ Headings and styles
- ✅ Headers and footers
- ✅ Lists (bullets/numbers)
- ✅ Document margins
- ✅ Image alignment
- ✅ Context menu commands
- ✅ Ribbon buttons
- ⚠️ Track changes (limited support)
- ⚠️ Comments (limited support)

## 🐛 Troubleshooting

### Add-in not loading
- Ensure HTTPS is enabled (`npm run dev`)
- Check console for CORS errors
- Verify manifest.xml paths are correct
- Clear Office cache: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef`

### OAuth not working
- Verify Client ID is correct
- Check authorized origins in Google Cloud Console
- Ensure `https://localhost:3000` is allowed
- Check browser console for OAuth errors

### Gemini API errors
- Verify OAuth token is valid
- Check API is enabled in Google Cloud
- Verify quota hasn't been exceeded
- Ensure correct scope is granted

### Office.js errors
- Check Office version compatibility
- Verify Word is fully loaded before operations
- Use `Word.run()` for all Word API calls
- Check for proper error handling

## 🌟 Best Practices

1. **Always authenticate** before making AI requests
2. **Handle errors gracefully** - Show user-friendly messages
3. **Use Word.run()** for all Office.js operations
4. **Test on multiple platforms** (Desktop, Online, Mac)
5. **Validate user input** before sending to AI
6. **Rate limit API calls** to avoid quota issues
7. **Clear sensitive data** on logout

## 📚 Resources

- [Office Add-ins Documentation](https://docs.microsoft.com/en-us/office/dev/add-ins/)
- [Word JavaScript API Reference](https://docs.microsoft.com/en-us/javascript/api/word)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🤝 Contributing

Contributions welcome! Please follow best practices and maintain code quality.

---

**Built with ❤️ using React, TypeScript, Office.js, and Gemini AI**
