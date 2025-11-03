// nour-shop-client/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Header from '../components/Header';
import React from 'react'; // <-- הוספתי ייבוא מפורש של React

export const metadata = {
  title: 'NOR | Home & Style',
  description: 'Curated collections for a beautiful life.',
};

export default function RootLayout({
  children,
}: {
  // --- התיקון כאן ---
  children: React.ReactNode; 
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-100">
        <AuthProvider>
          <CartProvider>
            {/* Header יושב בשכבה 30 ו-40 */}
            <Header />
            {/* התוכן הראשי יושב בשכבה 10 */}
            <main className="relative z-10">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}