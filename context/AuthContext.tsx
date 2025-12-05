'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface UserPayload {
  email: string;
  sub: string;
  role: 'admin' | 'subadmin' | 'user';
  exp?: number; // שדה התוקף של הטוקן (Unix timestamp)
}

interface AuthContextType {
  user: UserPayload | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // פונקציית התנתקות נקייה
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('guest_cart'); 
    // אנו לא מוחקים את user_cart כדי שיחכה לו כשיחזור
    setUser(null);
    setToken(null);
    router.push('/login'); // העברה לדף התחברות
  }, [router]);

  // פונקציה לבדיקה אם הטוקן פג תוקף
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<UserPayload>(token);
      if (!decoded.exp) return false;
      
      const currentTime = Date.now() / 1000; // זמן נוכחי בשניות
      return decoded.exp < currentTime; // אם זמן התפוגה קטן מהזמן הנוכחי - הוא פג
    } catch (error) {
      return true; // אם אי אפשר לפענח - הוא פגום
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        
        if (storedToken) {
          // 1. בדיקת תוקף קריטית
          if (isTokenExpired(storedToken)) {
            console.warn('Session expired. Logging out.');
            logout(); // הטוקן פג - נתק את המשתמש מיד
          } else {
            // 2. הטוקן תקין - שחזר את המשתמש
            const decodedUser = jwtDecode<UserPayload>(storedToken);
            setUser(decodedUser);
            setToken(storedToken);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  const login = (newToken: string) => {
    try {
      const decodedUser = jwtDecode<UserPayload>(newToken);
      localStorage.setItem('access_token', newToken);
      localStorage.removeItem('guest_cart'); // ניקוי עגלת אורח
      setUser(decodedUser);
      setToken(newToken);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const value = { user, token, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};