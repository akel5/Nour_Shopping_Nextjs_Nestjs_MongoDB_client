'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddCategoryModal from '../components/AddCategoryModal';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

const initialCategories: Category[] = [
  { id: 1, name: 'לבית ולגינה', imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&q=80' },
  { id: 2, name: 'אופנה ולבוש', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80' },
  { id: 3, name: 'כלי מטבח', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80' },
];

// 1. שימוש בפונט ובצבע ברירת מחדל
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
      <h3 className="mt-4 text-center text-xl font-semibold text-gray-900 p-4">{category.name}</h3>
    </div>
  </Link>
);

export default function HomePage() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const isMainAdmin = user?.role === 'admin';
  const canManageContent = user?.role === 'admin' || user?.role === 'subadmin';

  const handleAddCategory = (newCategory: { name: string; logoUrl: string }) => {
    const categoryToAdd: Category = {
      id: Date.now(),
      name: newCategory.name,
      imageUrl: newCategory.logoUrl,
    };
    setCategories((prev) => [...prev, categoryToAdd]);
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && <AddCategoryModal onClose={() => setIsModalOpen(false)} onAdd={handleAddCategory} />}
      
      <main>
        {/* 2. התאמת פונטים וכפתורים */}
        <section className="relative h-[70vh] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070')" }}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h2 className="text-5xl md:text-7xl font-light">Timeless Collections</h2>
            <p className="mt-4 max-w-xl text-lg">פריטים נבחרים עם סיפור, שמחכים להתחיל פרק חדש.</p>
            <Link href="/collection">
              <button className="mt-8 bg-white text-gray-900 px-8 py-3 rounded-md font-bold hover:bg-gray-200 transition-colors">
                לצפייה בקולקציה
              </button>
            </Link>
          </div>
        </section>

        {/* 3. התאמת פונטים וכפתורים */}
        <section className="container mx-auto py-16 px-4">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-semibold text-gray-900">Shop by Category</h3>
                {canManageContent && (
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700">
                    <Plus size={18} />
                    <span>הוסף קטגוריה</span>
                  </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
        </section>
      </main>
    </>
  );
}