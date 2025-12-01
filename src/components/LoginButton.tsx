import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { env, isEnvConfigured } from '../utils/env';
import {
  startOAuthLogin,
  getStoredToken,
  getStoredUserInfo,
} from '../utils/oauth-redirect';

// Google OAuth Client ID from environment variables
const GOOGLE_CLIENT_ID = env.googleClientId;
// Web Application uses popup redirect to callback page
const REDIRECT_URI = `${window.location.origin}/oauth-callback.html`;

const LoginButton: React.FC = () => {
  const { isLoggedIn, user, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  
  // Listen for OAuth success message from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth-success') {
        // Refresh auth state
        const token = getStoredToken();
        const userInfo = getStoredUserInfo();
        
        if (token && userInfo) {
          login(token, userInfo);
          setStatus(`Successfully signed in as ${userInfo.name}`);
          setError(null);
          setIsLoading(false);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login]);
  
  // Update status when login state changes
  useEffect(() => {
    if (isLoggedIn && user) {
      setStatus(`Signed in as ${user.name}`);
    }
  }, [isLoggedIn, user]);

  /**
   * Start OAuth login for Web Application
   * Opens popup which redirects to callback page automatically
   */
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setStatus('Opening Google login popup...');

    try {
      // Store client ID for refresh token usage
      localStorage.setItem('google_client_id', GOOGLE_CLIENT_ID);
      
      // Start OAuth flow - opens popup with automatic redirect
      await startOAuthLogin(GOOGLE_CLIENT_ID, REDIRECT_URI);
      
      setStatus('Please complete login in the popup window...');
      // The popup will handle the callback and send a message back
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setStatus('Login failed');
      setIsLoading(false);
    }
  };

  /**
   * Sign out
   */
  const handleLogout = () => {
    logout();
    setStatus('Signed out');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Main Action Button */}
      {!isLoggedIn ? (
        <button
          onClick={handleLogin}
          disabled={isLoading || !isEnvConfigured()}
          className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">✅ Signed in as {user?.name || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Status Messages */}
      {status && !error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold">Status</p>
          <p>{status}</p>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold">Authentication Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Setup Instructions */}
      {!isEnvConfigured() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <p className="font-semibold mb-1">⚠️ Setup Required</p>
          <p>
            Add your <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to
            the <code className="bg-amber-100 px-1 rounded">.env</code> file.
          </p>
          <p className="mt-1">
            Get credentials from:{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google Cloud Console
            </a>
          </p>
        </div>
      )}

      {/* How It Works */}
      {isEnvConfigured() && !isLoggedIn && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <p className="font-semibold mb-1">ℹ️ Web Application OAuth</p>
          <p>Click "Sign in" to authenticate with your Google account in a popup window.</p>
          <p className="mt-2">
            <strong>✨ Features:</strong>
          </p>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>Automatic popup-based authentication</li>
            <li>Secure Web Application OAuth flow</li>
            <li>Access to Gemini AI via your Google account</li>
            <li>PKCE security for client-side apps</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoginButton;
