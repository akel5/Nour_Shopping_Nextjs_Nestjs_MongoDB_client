'use client';

import { useState, useEffect } from 'react';

// טיפוסים
interface ProductFormData {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryName: string;
}

interface Product extends ProductFormData {
  _id: string | null;
}

// טיפוס לקטגוריה (עבור ה-Dropdown)
interface Category {
  _id: string;
  name: string;
}

interface ProductModalProps {
  productToEdit: Product | null;
  categoryName: string; // קטגוריית ברירת המחדל
  onClose: () => void;
  onSave: (productData: ProductFormData, productId: string | null) => void;
  isLoading: boolean;
}

export default function ProductModal({
  productToEdit,
  categoryName,
  onClose,
  onSave,
  isLoading,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    categoryName: categoryName,
  });

  // משתנה לשמירת רשימת הקטגוריות
  const [categories, setCategories] = useState<Category[]>([]);

  // 1. שליפת רשימת הקטגוריות בטעינת המודל
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // מילוי הטופס בעת עריכה
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description,
        imageUrl: productToEdit.imageUrl,
        price: productToEdit.price,
        categoryName: productToEdit.categoryName,
      });
    } else {
      // אם זה מוצר חדש, וודא שהקטגוריה ההתחלתית מוגדרת
      setFormData(prev => ({ ...prev, categoryName: categoryName }));
    }
  }, [productToEdit, categoryName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, productToEdit ? productToEdit._id : null);
  };

  const isEditMode = productToEdit !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {isEditMode ? 'עריכת מוצר' : 'הוספת מוצר חדש'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* --- בחירת קטגוריה (חדש) --- */}
          <div className="mb-4">
            <label htmlFor="categoryName" className="mb-2 block text-sm font-medium text-gray-600">קטגוריה</label>
            <select
              id="categoryName"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 p-3 bg-white"
            >
              <option value="" disabled>בחר קטגוריה</option>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              ) : (
                // במקרה שהקטגוריות לא נטענו, נציג לפחות את הקטגוריה הנוכחית כאופציה
                <option value={categoryName}>{categoryName}</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-600">שם המוצר</label>
            <input
              id="name" name="name" type="text"
              value={formData.name} onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-600">תיאור</label>
            <textarea
              id="description" name="description" rows={3}
              value={formData.description} onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-gray-600">קישור לתמונה</label>
            <input
              id="imageUrl" name="imageUrl" type="url"
              value={formData.imageUrl} onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-600">מחיר (בש&quot;ח)</label>
            <input
              id="price" name="price" type="number"
              value={formData.price} onChange={handleChange}
              required min="0" step="0.01"
              className="w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div className="mt-8 flex items-center justify-between">
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
              {isLoading ? (isEditMode ? 'מעדכן...' : 'שומר...') : 'שמור שינויים'}
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