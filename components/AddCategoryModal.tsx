// nour-shop-client/components/AddCategoryModal.tsx
'use client';
import { useState } from 'react';

interface NewCategory { name: string; logoUrl: string; }
interface AddCategoryModalProps { onClose: () => void; onAdd: (category: NewCategory) => void; }

export default function AddCategoryModal({ onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logoUrl) { alert('יש למלא את כל השדות'); return; }
    onAdd({ name, logoUrl });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">הוספת קטגוריה חדשה</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="category-name" className="mb-2 block text-sm font-medium text-gray-600">שם הקטגוריה</label>
            <input id="category-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: דברים לבית ולגינה" className="w-full rounded-md border border-gray-300 p-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
          </div>
          <div className="mb-8">
            <label htmlFor="logo-url" className="mb-2 block text-sm font-medium text-gray-600">קישור לתמונה (אייקון)</label>
            <input id="logo-url" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="הדבק כאן קישור לתמונה" className="w-full rounded-md border border-gray-300 p-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={onClose} className="rounded-md px-6 py-2 font-semibold text-gray-600 transition hover:bg-gray-100">ביטול</button>
            <button type="submit" className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400" disabled={!name || !logoUrl}>הוספה</button>
          </div>
        </form>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}