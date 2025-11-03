'use client';

import { useState } from 'react';
import Link from 'next/link';
// 1. הוספנו את אייקון 'Package' עבור "ההזמנות שלי"
import { ShoppingBag, LogOut, Menu, X, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const isMainAdmin = user?.role === 'admin';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // פונקציה להתנתקות וניתוב לדף הבית
  const handleLogout = () => {
    logout();
    closeMobileMenu();
    router.push('/');
  };

  return (
    <>
      {/* תפריט ראשי (דסקטופ) - שכבה 30 */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4 border-b border-gray-200">
          
          <Link href="/"><h1 className="text-3xl font-bold tracking-wider text-gray-900">NOR</h1></Link>
          
          <nav className="hidden md:flex gap-6 text-gray-700">
            <Link href="/collection" className="hover:text-blue-600">Collection</Link>
            <Link href="/about" className="hover:text-blue-600">About</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative cursor-pointer">
              <ShoppingBag className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* כפתורי משתמש למחשב */}
            <div className="hidden md:flex items-center gap-4">
              {isLoading ? (
                <div className="h-8 w-24 rounded-md bg-gray-200 animate-pulse"></div>
              ) : user ? (
                <>
                  {/* 2. הוספת אייקון "ההזמנות שלי" למשתמש מחובר בדסקטופ */}
                  <Link href="/my-orders" className="text-gray-700 hover:text-blue-600" title="ההזמנות שלי">
                    <Package size={22} />
                  </Link>
                  
                  {isMainAdmin && (
                    <>
                      <Link href="/admin/users" className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600">
                        ניהול משתמשים
                      </Link>
                      <Link href="/admin/orders" className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600">
                        ניהול הזמנות
                      </Link>
                    </>
                  )}
                  <span className="text-sm text-gray-700">שלום, {user.email}</span>
                  <button onClick={handleLogout} className="text-gray-700 hover:text-red-600" title="התנתק">
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">התחברות</Link>
                  <Link href="/register" className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700">הרשמה</Link>
                </>
              )}
            </div>

            {/* כפתור המבורגר לנייד */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* תפריט הנייד (המבורגר) - שכבה 40 ורקע אטום */}
      <div
        className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out bg-white md:hidden text-left ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        dir="ltr"
      >
        <div className="container mx-auto p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
            <button
              className="text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-6 text-xl text-gray-900">
            <Link href="/" onClick={closeMobileMenu} className="hover:text-blue-600">Home</Link>
            <Link href="/collection" onClick={closeMobileMenu} className="hover:text-blue-600">Collection</Link>
            <Link href="/about" onClick={closeMobileMenu} className="hover:text-blue-600">About</Link>
          </nav>

          <hr className="my-8 border-gray-300" />

          {/* כפתורי משתמש לנייד */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="h-10 w-full rounded-md bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <>
                <div className="text-left text-gray-700">Hello, {user.email}</div>
                <Link 
                  href="/my-orders" 
                  onClick={closeMobileMenu} 
                  className="w-full text-center bg-blue-600 text-white px-4 py-3 rounded-md font-medium hover:bg-blue-700"
                >
                  ההזמנות שלי
                </Link>
                {isMainAdmin && (
                  <>
                    <Link 
                      href="/admin/users" 
                      onClick={closeMobileMenu} 
                      className="w-full text-center bg-yellow-500 text-white px-4 py-3 rounded-md font-medium hover:bg-yellow-600"
                    >
                      Admin Panel
                    </Link>
                    <Link 
                      href="/admin/orders" 
                      onClick={closeMobileMenu} 
                      className="w-full text-center bg-orange-500 text-white px-4 py-3 rounded-md font-medium hover:bg-orange-600"
                    >
                      ניהול הזמנות
                    </Link>
                  </>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full text-center bg-gray-200 text-red-600 px-4 py-3 rounded-md font-medium hover:bg-gray-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={closeMobileMenu} 
                  className="w-full text-center bg-blue-600 text-white px-4 py-3 rounded-md font-medium hover:bg-blue-700"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  onClick={closeMobileMenu} 
                  className="w-full text-center bg-gray-900 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}