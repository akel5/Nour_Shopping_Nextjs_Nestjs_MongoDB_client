'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CategoryModal from '../components/CategoryModal'; // 1. שימוש במודל החדש
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  imageUrl: string;
}

// 2. קטגוריות קבועות (עם IDs מיוחדים כדי שנדע לא למחוק אותן מהשרת)
const initialCategories: Category[] = [
  { _id: 'fixed-1', name: 'לבית ולגינה', imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&q=80' },
  { _id: 'fixed-2', name: 'אופנה ולבוש', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80' },
  { _id: 'fixed-3', name: 'כלי מטבח', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80' },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null); // לניהול עריכה
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user, token } = useAuth();

  const isMainAdmin = user?.role === 'admin';
  const canManageContent = user?.role === 'admin' || user?.role === 'subadmin';

  // שליפת קטגוריות
  useEffect(() => {
    const fetchCategories = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/categories`);
        if (res.ok) {
          const serverCategories = await res.json();
          // מציגים קודם את הקבועות ואז את הדינמיות
          setCategories([...initialCategories, ...serverCategories]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // --- פתיחת מודל הוספה ---
  const handleOpenAdd = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  // --- פתיחת מודל עריכה ---
  const handleOpenEdit = (e: React.MouseEvent, category: Category) => {
    e.preventDefault(); // מניעת מעבר לדף הקטגוריה
    e.stopPropagation();
    
    // מניעת עריכה של קטגוריות קבועות
    if (category._id.startsWith('fixed-')) {
      alert('לא ניתן לערוך קטגוריות מערכת קבועות.');
      return;
    }
    
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  // --- שמירה (הוספה/עריכה) ---
  const handleSaveCategory = async (categoryData: { name: string; imageUrl: string }, categoryId: string | null) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    setIsSaving(true);
    try {
      const isEditMode = categoryId !== null;
      const url = isEditMode 
        ? `${apiUrl}/categories/${categoryId}` 
        : `${apiUrl}/categories`;
      
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!res.ok) throw new Error('Failed to save category');
      
      const savedCategory = await res.json();
      
      if (isEditMode) {
        setCategories(prev => prev.map(c => c._id === categoryId ? savedCategory : c));
      } else {
        setCategories(prev => [...prev, savedCategory]);
      }
      
      setIsModalOpen(false);
      setCategoryToEdit(null);

    } catch (err) {
      alert('שגיאה בשמירת הקטגוריה');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- מחיקה ---
  const handleDelete = async (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (categoryId.startsWith('fixed-')) {
      alert('לא ניתן למחוק קטגוריות מערכת קבועות.');
      return;
    }

    if (!confirm('האם למחוק קטגוריה זו?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setCategories(prev => prev.filter(c => c._id !== categoryId));
      
    } catch (err) {
      alert('שגיאה במחיקת הקטגוריה');
      console.error(err);
    }
  };

  // --- קומפוננטת כרטיס (פנימית) ---
  const CategoryCard = ({ category }: { category: Category }) => (
    <Link href={`/category/${encodeURIComponent(category.name)}`}>
      <div className="group relative cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        
        {/* כפתורי עריכה/מחיקה (צפים מעל התמונה) - רק לאדמין */}
        {canManageContent && !category._id.startsWith('fixed-') && (
          <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => handleOpenEdit(e, category)}
              className="bg-white p-2 rounded-full shadow hover:bg-gray-100 text-yellow-600"
              title="ערוך"
            >
              <Edit size={16} />
            </button>
            {isMainAdmin && (
              <button 
                onClick={(e) => handleDelete(e, category._id)}
                className="bg-white p-2 rounded-full shadow hover:bg-gray-100 text-red-600"
                title="מחק"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}

        <div className="overflow-hidden">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover aspect-square transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>
        <h3 className="mt-4 text-center text-xl font-serif text-gray-900 p-4">{category.name}</h3>
      </div>
    </Link>
  );

  return (
    <>
      {isModalOpen && (
        <CategoryModal 
          categoryToEdit={categoryToEdit}
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveCategory}
          isLoading={isSaving}
        />
      )}
      
      <main>
        <section className="relative h-[70vh] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070')" }}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h2 className="font-serif text-5xl md:text-7xl font-light">Timeless Collections</h2>
            <p className="mt-4 max-w-xl text-lg">פריטים נבחרים עם סיפור, שמחכים להתחיל פרק חדש.</p>
            <Link href="/collection">
              <button className="mt-8 bg-white text-gray-900 px-8 py-3 rounded-md font-bold hover:bg-gray-200 transition-colors">
                לצפייה בקולקציה
              </button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto py-16 px-4">
            <div className="flex justify-between items-center mb-10">
                <h3 className="font-serif text-4xl text-gray-900">Shop by Category</h3>
                {canManageContent && (
                  <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700">
                    <Plus size={18} />
                    <span>הוסף קטגוריה</span>
                  </button>
                )}
            </div>
            
            {isLoading ? (
              <p className="text-center">טוען קטגוריות...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat) => (
                    <CategoryCard key={cat._id} category={cat} />
                ))}
              </div>
            )}
        </section>
      </main>
    </>
  );
}