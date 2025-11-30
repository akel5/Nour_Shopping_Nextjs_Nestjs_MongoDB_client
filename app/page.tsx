'use client';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AddCategoryModal from '../components/AddCategoryModal';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

// 1. הגדרת טיפוס אחיד (תואם ל-MongoDB)
interface Category {
  _id: string; // שינינו מ-id ל-_id (מחרוזת)
  name: string;
  imageUrl: string;
}

// 2. קטגוריות ברירת המחדל (המרנו ל-_id מחרוזת)
const initialCategories: Category[] = [
  { _id: '1', name: 'לבית ולגינה', imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&q=80' },
  { _id: '2', name: 'אופנה ולבוש', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80' },
  { _id: '3', name: 'כלי מטבח', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80' },
];

const CategoryCard = ({ category }: { category: Category }) => (
  <Link href={`/category/${encodeURIComponent(category.name)}`}>
    <div className="group cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden">
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

export default function HomePage() {
  // מתחילים עם הקטגוריות הקבועות
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();

  const canManageContent = user?.role === 'admin' || user?.role === 'subadmin';

  // 3. שליפת קטגוריות מהשרת ומיזוג עם הקבועות
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch');
        const serverCategories = await res.json();
        
        // כאן אנחנו מחברים: קטגוריות קבועות + קטגוריות מהשרת
        setCategories([...initialCategories, ...serverCategories]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 4. הוספת קטגוריה חדשה (שמירה בשרת ועדכון מקומי)
  const handleAddCategory = async (newCategory: { name: string; logoUrl: string }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategory.name,
          imageUrl: newCategory.logoUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to create category');
      
      const savedCategory = await res.json();
      
      // הוספה לרשימה הקיימת
      setCategories((prev) => [...prev, savedCategory]);
      setIsModalOpen(false);
      alert('הקטגוריה נוספה בהצלחה!');

    } catch (err) {
      alert('שגיאה בהוספת קטגוריה');
      console.error(err);
    }
  };

  return (
    <>
      {isModalOpen && <AddCategoryModal onClose={() => setIsModalOpen(false)} onAdd={handleAddCategory} />}
      
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
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700">
                    <Plus size={18} />
                    <span>הוסף קטגוריה</span>
                  </button>
                )}
            </div>
            
            {/* מציגים את הקטגוריות (תמיד יהיו לפחות ה-3 הקבועות) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => (
                  <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>
        </section>
      </main>
    </>
  );
}