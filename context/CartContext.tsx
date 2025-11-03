// nour-shop-client/context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

// --- הגדרת טיפוסים ---
interface CartProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface ServerCartItem {
  productId: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- קומפוננטת הספק (Provider) ---
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // זהו isLoading של העגלה
  
  // --- התיקון כאן ---
  // אנו קוראים למשתנה הטעינה של האימות 'isAuthLoading'
  const { user, token, isLoading: isAuthLoading } = useAuth();

  // פונקציה לשליפת עגלת אורח
  const loadGuestCart = useCallback(() => {
    setIsLoading(true);
    try {
      const storedCart = localStorage.getItem('guest_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('loadGuestCart Error:', error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback עם תלות ריקה

  // אפקט ראשי: מחליט איזו עגלה לטעון
  useEffect(() => {
    // המתן שטעינת האימות תסתיים
    if (!isAuthLoading) {
      if (user) {
        // אם המשתמש מחובר, טען עגלה מה-localStorage שלו (פתרון ביניים)
        const userCartKey = `user_cart_${user.sub}`;
        const storedCart = localStorage.getItem(userCartKey);
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        } else {
          setCart([]);
        }
        setIsLoading(false);
      } else {
        // אם הוא אורח, טען עגלת אורח
        loadGuestCart();
      }
    }
  }, [user, isAuthLoading, loadGuestCart]); // הוספנו את loadGuestCart לתלויות

  // אפקט משני: שמירת העגלה וחישוב סה"כ
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(`user_cart_${user.sub}`, JSON.stringify(cart));
      } else {
        localStorage.setItem('guest_cart', JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Failed to save cart:', error);
    }

    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(count);
  }, [cart, user]);
  
  // --- פונקציות לניהול העגלה (עטופות ב-useCallback) ---

  const addToCart = useCallback((product: CartProduct) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert(`${product.name} הוסף לעגלה!`);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item._id === productId ? { ...item, quantity: quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);
  
  const value = { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, isLoading };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook מותאם אישית
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};