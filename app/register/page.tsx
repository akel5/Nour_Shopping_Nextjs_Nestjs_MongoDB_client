// nour-shop-client/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // מונע מהדף להיטען מחדש
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL} /auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // אם השרת החזיר שגיאה (למשל, 409 - משתמש קיים)
        const errorData = await response.json();
        throw new Error(errorData.message || 'הרשמה נכשלה');
      }

      // אם ההרשמה הצליחה
      alert('ההרשמה הצליחה! אנא התחבר.');
      router.push('/login'); // מעביר לעמוד ההתחברות

    } catch (err: unknown) { // 1. משנים ל-unknown
  if (err instanceof Error) { // 2. בודקים שזו אכן שגיאה
    setError(err.message);
  } else {
    setError('אירעה שגיאה לא צפויה'); // 3. גיבוי למקרה קיצון
  }
} finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          יצירת חשבון חדש
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              כתובת אימייל
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 p-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-md border border-gray-300 p-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <p className="mt-1 text-xs text-gray-500">מינימום 6 תווים</p>
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? 'יוצר חשבון...' : 'הרשמה'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          כבר יש לך חשבון?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            התחבר כאן
          </Link>
        </p>
      </div>
    </div>
  );
}