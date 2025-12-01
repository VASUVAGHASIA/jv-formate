# Deployment Guide: How to Share Your Add-in

To let your friends use your add-in without running a local server, you need to **deploy the web app** and **share the manifest file**.

## Step 1: Deploy the Web App (Using Vercel)
The "brain" of your add-in (the React app) needs to be on the internet. Vercel is free and easy.

1.  **Push your code to GitHub** (if you haven't already).
2.  **Go to [Vercel.com](https://vercel.com)** and sign up/login.
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your GitHub repository.
5.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `./` (default)
    *   **Environment Variables**: Add the variables from your `.env` file:
        *   `VITE_GOOGLE_CLIENT_ID`: (Your Google Client ID)
        *   `VITE_GEMINI_API_KEY`: (Your Gemini API Key)
6.  Click **Deploy**.
7.  Once deployed, copy the **Domain** (e.g., `https://your-app-name.vercel.app`).

## Step 2: Update the Manifest
I have created a new file called `manifest.prod.xml` for you.

1.  Open `manifest.prod.xml`.
2.  Find and Replace (Ctrl+H) the placeholder:
    *   **Find**: `https://YOUR_APP_URL.vercel.app`
    *   **Replace**: Your actual Vercel URL (e.g., `https://jv-formate.vercel.app`)
    *   *Note: Make sure to include `https://` and no trailing slash.*
3.  Save the file.

## Step 3: Share with Friends
Your friends do **not** need to run any code. They just need the `manifest.prod.xml` file.

1.  Send the updated `manifest.prod.xml` file to your friend.
2.  **Instructions for your friend**:
    *   Save the file to a folder on their computer (e.g., `C:\MyAddins`).
    *   Open Word (Desktop).
    *   Go to **File** > **Options** > **Trust Center** > **Trust Center Settings** > **Trusted Add-in Catalogs**.
    *   Click **Add Catalog** and select the folder (`C:\MyAddins`).
    *   Check **"Show in Menu"** and click **OK**.
    *   Restart Word.
    *   Go to **Insert** > **My Add-ins** > **Shared Folder**.
    *   Select **AI Assistant** and click **Add**.

## Important Notes
*   **Google OAuth**: You need to update your Google Cloud Console to allow the new Vercel domain.
    *   Go to **APIs & Services** > **Credentials**.
    *   Edit your OAuth Client ID.
    *   Add your Vercel URL to **Authorized JavaScript origins**.
    *   Add `https://your-app-name.vercel.app/oauth-callback.html` to **Authorized redirect URIs**.
