// nour-shop-client/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, ShieldCheck, Shield, User } from 'lucide-react';


// הגדרת טיפוס למשתמש כפי שהוא מגיע מה-API
interface ApiUser {
  _id: string;
  email: string;
  role: 'admin' | 'subadmin' | 'user';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1. הגנה על העמוד
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/'); // החזר הביתה אם אינו אדמין
    }
  }, [user, isLoading, router]);

  // 2. שליפת רשימת המשתמשים מהשרת
  useEffect(() => {
    if (user?.role === 'admin' && token) {
      const fetchUsers = async () => {
        try {
          setError(null);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            headers: {
              'Authorization': `Bearer ${token}`, // שליחת הטוקן
            },
          });
          if (!response.ok) throw new Error('Failed to fetch users');
          const data = await response.json();
          setUsers(data);
        } catch (err: unknown) { // 1. משנים ל-unknown
  if (err instanceof Error) { // 2. בודקים שזו אכן שגיאה
    setError(err.message);
  } else {
    setError('אירעה שגיאה לא צפויה'); // 3. גיבוי למקרה קיצון
  }
}
      };
      fetchUsers();
    }
  }, [user, token]);

  // 3. פונקציה למחיקת משתמש
  const handleDelete = async (userId: string) => {
    if (userId === user?.sub) {
      alert("אתה לא יכול למחוק את עצמך.");
      return;
    }
    if (confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        // רענון הרשימה
        setUsers(users.filter(u => u._id !== userId));
      } catch (err) {
        alert('מחיקה נכשלה');
      }
    }
  };

  // 4. פונקציה לעריכת הרשאה (בפשטות, שדרוג/שנמוך)
  const handleRoleChange = async (userId: string, currentRole: ApiUser['role']) => {
    // לוגיקה פשוטה: אם הוא משתמש הפוך ל-subadmin, אם הוא subadmin הפוך למשתמש
    // אנו מונעים שינוי הרשאות לאדמינים אחרים כרגע
    if (currentRole === 'admin') {
        alert("לא ניתן לשנות הרשאה של אדמין.");
        return;
    }

    const newRole = currentRole === 'user' ? 'subadmin' : 'user';

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: newRole }),
        });
        if (!response.ok) throw new Error('Role update failed');
        const updatedUser = await response.json();
        // עדכון הרשימה המקומית
        setUsers(users.map(u => u._id === userId ? updatedUser : u));
    } catch (err) {
        alert('עדכון נכשל');
    }
  };


  if (isLoading || !user) {
    return <div className="p-8">טוען נתונים...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; חזרה לדף הבית</Link>
      <h1 className="text-3xl font-bold mb-6">ניהול משתמשים</h1>
      {error && <p className="text-red-500 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">משתמש</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">הרשאה</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך הצטרפות</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{u.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    u.role === 'admin' ? 'bg-red-100 text-red-800' :
                    u.role === 'subadmin' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString('he-IL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => handleRoleChange(u._id, u.role)}
                    className={`p-1 rounded-md transition ${
                      u.role === 'admin' ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600 hover:bg-yellow-100'
                    }`}
                    title="שנה הרשאה"
                    disabled={u.role === 'admin'}
                  >
                    {u.role === 'subadmin' ? <ShieldCheck size={18} /> : <Shield size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className={`ml-4 p-1 rounded-md transition ${
                      u._id === user.sub ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'
                    }`}
                    title="מחק משתמש"
                    disabled={u._id === user.sub}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}