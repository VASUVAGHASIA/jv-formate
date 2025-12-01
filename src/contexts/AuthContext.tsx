import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getStoredToken, 
  getUserInfo, 
  clearToken, 
  getStoredUserInfo,
  type UserInfo 
} from '../utils/device-auth';

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    refreshAuth();
  }, []);

  const refreshAuth = async () => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUserInfo();
    
    if (storedToken && storedUser) {
      try {
        // Token exists and hasn't expired, use stored user info
        setAccessToken(storedToken);
        setUser(storedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        // Token is invalid, clear it
        clearToken();
        setAccessToken(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    } else if (storedToken && !storedUser) {
      try {
        // Have token but no user info, fetch it
        const userInfo = await getUserInfo(storedToken);
        setAccessToken(storedToken);
        setUser(userInfo);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        clearToken();
        setAccessToken(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setAccessToken(null);
    }
  };

  const login = (token: string, userInfo: UserInfo) => {
    setAccessToken(token);
    setUser(userInfo);
    setIsLoggedIn(true);
  };

  const logout = () => {
    clearToken();
    setAccessToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        accessToken,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
