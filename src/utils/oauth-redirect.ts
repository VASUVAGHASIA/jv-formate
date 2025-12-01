/**
 * Simple OAuth 2.0 Redirect Flow (PKCE)
 * Traditional redirect-based authentication - much simpler!
 */

export interface UserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const USER_INFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

// OAuth scopes for Gemini API access
// Note: Gemini API uses cloud-platform scope for OAuth authentication
const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/cloud-platform'
].join(' ');

/**
 * Generate random string for PKCE
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Generate SHA-256 hash (for PKCE challenge)
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Start OAuth login - opens popup with Google login
 * For Web Application type, uses popup redirect flow
 */
export async function startOAuthLogin(clientId: string, redirectUri: string): Promise<void> {
  // Generate PKCE verifier and challenge
  const codeVerifier = generateRandomString(128);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);
  
  // Store verifier for later (popup will use it)
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_redirect_uri', redirectUri);
  sessionStorage.setItem('oauth_client_id', clientId);
  
  // Build authorization URL for web application
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
    state: generateRandomString(32) // CSRF protection
  });
  
  const authUrl = `${AUTH_ENDPOINT}?${params.toString()}`;
  
  // Open popup for web application OAuth
  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  window.open(
    authUrl,
    'Google Login',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=yes`
  );
}

/**
 * Handle OAuth callback
 * For Web Application: code comes from URL parameters after redirect
 */
export async function handleOAuthCallback(
  clientId?: string,
  redirectUri?: string
): Promise<{ token: TokenResponse; userInfo: UserInfo }> {
  // Get authorization code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  
  if (error) {
    const errorDesc = urlParams.get('error_description') || error;
    throw new Error(`OAuth error: ${errorDesc}`);
  }
  
  if (!code) {
    throw new Error('No authorization code received');
  }
  
  // Get stored values from session
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  const storedClientId = clientId || sessionStorage.getItem('oauth_client_id');
  const storedRedirectUri = redirectUri || sessionStorage.getItem('oauth_redirect_uri');
  
  if (!codeVerifier) {
    throw new Error('No code verifier found - session may have expired');
  }
  
  if (!storedClientId || !storedRedirectUri) {
    throw new Error('Missing OAuth configuration');
  }
  
  // Exchange code for token
  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: storedClientId,
      code: code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: storedRedirectUri,
    }),
  });
  
  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    console.error('Token exchange error:', errorData);
    throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorData}`);
  }
  
  const token: TokenResponse = await tokenResponse.json();
  
  // Get user info
  const userInfo = await getUserInfo(token.access_token);
  
  // Clean up session storage
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_redirect_uri');
  sessionStorage.removeItem('oauth_client_id');
  
  return { token, userInfo };
}

/**
 * Get user information
 */
export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  const response = await fetch(USER_INFO_ENDPOINT, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Token storage
 */
export function storeToken(token: TokenResponse): void {
  const expiresAt = Date.now() + token.expires_in * 1000;
  
  localStorage.setItem('google_access_token', token.access_token);
  localStorage.setItem('google_token_expires_at', expiresAt.toString());
  localStorage.setItem('google_token_scope', token.scope);
  
  if (token.refresh_token) {
    localStorage.setItem('google_refresh_token', token.refresh_token);
  }
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem('google_access_token');
  const expiresAt = localStorage.getItem('google_token_expires_at');
  
  if (!token || !expiresAt) {
    return null;
  }
  
  if (Date.now() >= parseInt(expiresAt)) {
    clearToken();
    return null;
  }
  
  return token;
}

export function clearToken(): void {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_token_expires_at');
  localStorage.removeItem('google_token_scope');
  localStorage.removeItem('google_refresh_token');
  localStorage.removeItem('google_user_info');
}

export function storeUserInfo(userInfo: UserInfo): void {
  localStorage.setItem('google_user_info', JSON.stringify(userInfo));
}

export function getStoredUserInfo(): UserInfo | null {
  const data = localStorage.getItem('google_user_info');
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Compatibility exports for gemini.ts
export function getAccessToken(): string | null {
  return getStoredToken();
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('google_refresh_token');
}

export function storeTokens(tokenResponse: TokenResponse): void {
  storeToken(tokenResponse);
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = localStorage.getItem('google_client_id') || '';
  
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} - ${error}`);
  }

  return await response.json();
}
