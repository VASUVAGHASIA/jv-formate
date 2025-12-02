/**
 * Google OAuth 2.0 Device Authorization Flow
 * Used by VS Code, GitHub CLI, and other desktop applications
 * Opens login in user's REAL system browser with existing cookies/accounts
 */

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  verification_url_complete?: string;
  expires_in: number;
  interval: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface UserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const DEVICE_CODE_ENDPOINT = 'https://oauth2.googleapis.com/device/code';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const USER_INFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

// Scopes for device flow
// Note: Gemini API scopes are NOT supported in device flow
// We'll use the token with Gemini API directly (it works with any valid Google OAuth token)
const SCOPES = [
  'openid',
  'email',
  'profile'
].join(' ');

/**
 * Step 1: Request device code from Google
 */
export async function requestDeviceCode(clientId: string): Promise<DeviceCodeResponse> {
  console.log('📱 Requesting device code from Google...');

  const response = await fetch(DEVICE_CODE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      scope: SCOPES,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to request device code: ${response.status} - ${error}`);
  }

  const data: DeviceCodeResponse = await response.json();

  console.log('✅ Device code received');
  console.log('👤 User code:', data.user_code);
  console.log('🔗 Verification URL:', data.verification_url_complete || data.verification_url);
  console.log('⏱️ Expires in:', data.expires_in, 'seconds');
  console.log('🔄 Poll interval:', data.interval, 'seconds');

  return data;
}

/**
 * Step 2: Open verification URL in user's REAL system browser
 * Uses Office dialog API with displayInIframe: false to ensure system browser
 */
export function openVerificationUrlInBrowser(verificationUrl: string): Promise<void> {
  return new Promise((resolve, _reject) => {
    console.log('🌐 Opening verification URL in system browser...');

    // Try Office.js dialog API first (preferred for Office Add-ins)
    if (typeof Office !== 'undefined' && Office.context && Office.context.ui) {
      console.log('📱 Using Office.context.ui.displayDialogAsync');

      Office.context.ui.displayDialogAsync(
        verificationUrl,
        {
          height: 70,
          width: 60,
          displayInIframe: false, // CRITICAL: Forces system browser, not WebView
          promptBeforeOpen: false, // No confirmation dialog
        },
        (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            console.warn('⚠️ Office dialog failed, trying fallback:', result.error.message);
            fallbackBrowserOpen(verificationUrl);
            resolve();
          } else {
            console.log('✅ Browser opened successfully');
            const dialog = result.value;

            // User might close the dialog manually
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dialog.addEventHandler(Office.EventType.DialogEventReceived, (_arg: any) => {
              console.log('📪 Dialog closed by user');
              dialog.close();
            });

            resolve();
          }
        }
      );
    } else {
      // Fallback: Use window.open (opens in system browser on most platforms)
      console.log('🪟 Office.js not available, using window.open');
      fallbackBrowserOpen(verificationUrl);
      resolve();
    }
  });
}

/**
 * Fallback method to open browser
 */
function fallbackBrowserOpen(url: string): void {
  // Create a temporary link and click it
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log('✅ Browser opened via fallback method');
}

/**
 * Step 3: Poll Google token endpoint until user completes login
 */
export async function pollForToken(
  clientId: string,
  deviceCode: string,
  interval: number,
  onStatusUpdate?: (status: string) => void
): Promise<TokenResponse> {
  console.log('🔄 Starting token polling...');

  const pollInterval = (interval || 5) * 1000; // Convert to milliseconds
  let attempts = 0;
  const maxAttempts = 120; // 10 minutes max (120 * 5 seconds)

  return new Promise((resolve, reject) => {
    const poll = async () => {
      attempts++;

      if (attempts > maxAttempts) {
        reject(new Error('Polling timeout: User did not complete login in time'));
        return;
      }

      try {
        console.log(`🔄 Polling attempt ${attempts}...`);
        onStatusUpdate?.(`Waiting for login... (${attempts})`);

        const response = await fetch(TOKEN_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Success! User completed login
          console.log('✅ Token received! User login complete.');
          clearInterval(intervalId);
          resolve(data as TokenResponse);
        } else if (data.error === 'authorization_pending') {
          // User hasn't completed login yet, keep polling
          console.log('⏳ Authorization pending, continuing to poll...');
        } else if (data.error === 'slow_down') {
          // Google asks us to slow down
          console.log('🐢 Slowing down polling interval...');
          clearInterval(intervalId);
          setTimeout(() => {
            intervalId = setInterval(poll, pollInterval + 1000);
          }, pollInterval + 1000);
        } else if (data.error === 'expired_token') {
          // Device code expired
          console.error('❌ Device code expired');
          clearInterval(intervalId);
          reject(new Error('Device code expired. Please try logging in again.'));
        } else if (data.error === 'access_denied') {
          // User denied access
          console.error('❌ User denied access');
          clearInterval(intervalId);
          reject(new Error('Access denied by user'));
        } else {
          // Unknown error
          console.error('❌ Unknown error:', data);
          clearInterval(intervalId);
          reject(new Error(`Authentication error: ${data.error}`));
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
        // Don't stop polling on network errors, keep trying
      }
    };

    // Start polling
    let intervalId = setInterval(poll, pollInterval);
    poll(); // First poll immediately
  });
}

/**
 * Get user information using access token
 */
export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  console.log('👤 Fetching user information...');

  const response = await fetch(USER_INFO_ENDPOINT, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status}`);
  }

  const userInfo: UserInfo = await response.json();
  console.log('✅ User info retrieved:', userInfo.email);

  return userInfo;
}

/**
 * Complete device flow: Request code, open browser, poll for token
 */
export async function executeDeviceFlow(
  clientId: string,
  onStatusUpdate?: (status: string) => void,
  onUserCodeReceived?: (userCode: string, verificationUrl: string) => void
): Promise<{ token: TokenResponse; userInfo: UserInfo }> {
  try {
    // Step 1: Request device code
    onStatusUpdate?.('Requesting authorization...');
    const deviceCodeData = await requestDeviceCode(clientId);

    // Notify UI about user code (optional: show it to user)
    onUserCodeReceived?.(
      deviceCodeData.user_code,
      deviceCodeData.verification_url_complete || deviceCodeData.verification_url
    );

    // Step 2: Open browser for user to login
    onStatusUpdate?.('Opening browser for login...');
    const verificationUrl = deviceCodeData.verification_url_complete ||
      `${deviceCodeData.verification_url}?user_code=${deviceCodeData.user_code}`;

    await openVerificationUrlInBrowser(verificationUrl);

    // Step 3: Poll for token
    onStatusUpdate?.('Waiting for you to complete login in browser...');
    const token = await pollForToken(
      clientId,
      deviceCodeData.device_code,
      deviceCodeData.interval,
      onStatusUpdate
    );

    // Step 4: Get user info
    onStatusUpdate?.('Getting user information...');
    const userInfo = await getUserInfo(token.access_token);

    return { token, userInfo };

  } catch (error) {
    console.error('❌ Device flow failed:', error);
    throw error;
  }
}

/**
 * Storage helpers
 */

export function storeToken(token: TokenResponse): void {
  const expiresAt = Date.now() + token.expires_in * 1000;

  localStorage.setItem('google_access_token', token.access_token);
  localStorage.setItem('google_token_expires_at', expiresAt.toString());
  localStorage.setItem('google_token_type', token.token_type);
  localStorage.setItem('google_token_scope', token.scope);

  if (token.refresh_token) {
    localStorage.setItem('google_refresh_token', token.refresh_token);
  }

  console.log('💾 Token stored in localStorage');
  console.log(`⏱️ Token expires at: ${new Date(expiresAt).toLocaleString()}`);
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem('google_access_token');
  const expiresAt = localStorage.getItem('google_token_expires_at');

  if (!token || !expiresAt) {
    return null;
  }

  // Check if token is expired
  if (Date.now() >= parseInt(expiresAt)) {
    console.warn('⚠️ Stored token has expired');
    clearToken();
    return null;
  }

  return token;
}

export function clearToken(): void {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_token_expires_at');
  localStorage.removeItem('google_token_type');
  localStorage.removeItem('google_token_scope');
  localStorage.removeItem('google_refresh_token');
  localStorage.removeItem('google_user_info');

  console.log('🗑️ Token cleared from storage');
}

export function storeUserInfo(userInfo: UserInfo): void {
  localStorage.setItem('google_user_info', JSON.stringify(userInfo));
  console.log('💾 User info stored');
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

/**
 * Get access token directly (for gemini.ts compatibility)
 */
export function getAccessToken(): string | null {
  return getStoredToken();
}

/**
 * Get refresh token if available
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('google_refresh_token');
}

/**
 * Store tokens (for gemini.ts compatibility)
 */
export function storeTokens(tokenResponse: TokenResponse): void {
  storeToken(tokenResponse);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  console.log('🔄 Refreshing access token...');

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: localStorage.getItem('google_client_id') || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} - ${error}`);
  }

  const data: TokenResponse = await response.json();
  console.log('✅ Token refreshed');

  return data;
}
