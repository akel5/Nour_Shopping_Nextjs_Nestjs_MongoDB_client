// nour-shop-client/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// ... (הגדרות טיפוסים נשארות זהות)
interface UserPayload {
  email: string;
  sub: string; // ID המשתמש
  role: 'admin' | 'subadmin' | 'user';
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

  useEffect(() => {
    // ... (אפקט הטעינה הראשוני נשאר זהה)
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        const decodedUser = jwtDecode<UserPayload>(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Failed to load token:', error);
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedUser = jwtDecode<UserPayload>(newToken);
      localStorage.setItem('access_token', newToken);
      setUser(decodedUser);
      setToken(newToken);
      
      // 1. --- שדרוג ---
      // אחרי התחברות, נקה את עגלת האורח הישנה
      // (בהמשך נמזג אותה, כרגע ננקה)
      localStorage.removeItem('guest_cart');
      
    } catch (error) {
      console.error('Failed to decode token on login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
    
    // 2. --- שדרוג ---
    // בהתנתקות, נקה גם את עגלת המשתמש השמורה
    // (ה-useEffect ב-CartContext יטען עכשיו את עגלת האורח הריקה)
    // אנו צריכים למצוא דרך לאפס את ה-cart ב-CartContext
    // הפתרון הפשוט: CartContext יקשיב ל-user ויטען מחדש
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