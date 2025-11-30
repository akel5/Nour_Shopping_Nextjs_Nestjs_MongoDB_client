'use client';

import { useState, useEffect } from 'react';

interface CategoryFormData {
  name: string;
  imageUrl: string;
}

interface Category extends CategoryFormData {
  _id: string;
}

interface CategoryModalProps {
  categoryToEdit: Category | null; // null להוספה, אובייקט לעריכה
  onClose: () => void;
  onSave: (categoryData: CategoryFormData, categoryId: string | null) => void;
  isLoading: boolean;
}

export default function CategoryModal({
  categoryToEdit,
  onClose,
  onSave,
  isLoading,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name,
        imageUrl: categoryToEdit.imageUrl,
      });
    }
  }, [categoryToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, categoryToEdit ? categoryToEdit._id : null);
  };

  const isEditMode = categoryToEdit !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {isEditMode ? 'עריכת קטגוריה' : 'הוספת קטגוריה חדשה'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-600">שם הקטגוריה</label>
            <input
              id="name" name="name" type="text"
              value={formData.name} onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-gray-600">קישור לתמונה (אייקון)</label>
            <input
              id="imageUrl" name="imageUrl" type="url"
              value={formData.imageUrl} onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              type="button" onClick={onClose}
              className="rounded-md px-6 py-2 font-semibold text-gray-600 transition hover:bg-gray-100"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? (isEditMode ? 'מעדכן...' : 'שומר...') : (isEditMode ? 'עדכן' : 'הוספה')}
            </button>
          </div>
        </form>

        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}