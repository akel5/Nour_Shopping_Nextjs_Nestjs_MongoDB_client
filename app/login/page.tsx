// nour-shop-client/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext'; // 1. ייבוא ה-Hook שלנו

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth(); // 2. שימוש ב-Hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ההתחברות נכשלה');
      }

      const data = await response.json();
      
      // 3. קריאה לפונקציית ההתחברות הגלובלית
      auth.login(data.access_token);
      
      alert('התחברת בהצלחה!');
      router.push('/'); // העברה לדף הבית

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (שאר הקוד של הטופס נשאר זהה)
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          התחברות לחשבון
        </h1>
        <form onSubmit={handleSubmit}>
          {/* ... שדות הטופס ... */}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">כתובת אימייל</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-md border border-gray-300 p-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">סיסמה</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-md border border-gray-300 p-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
          </div>
          {error && (<p className="mb-4 text-center text-sm text-red-600">{error}</p>)}
          <button type="submit" disabled={isLoading} className="w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400">
            {isLoading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          אין לך חשבון?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            הירשם כאן
          </Link>
        </p>
      </div>
    </div>
  );
}