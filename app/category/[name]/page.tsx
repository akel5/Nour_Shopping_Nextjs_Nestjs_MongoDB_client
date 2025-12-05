'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import ProductModal from '../../../components/ProductModal';

interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryName: string;
}

interface CartProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

const ProductCard = ({ 
  product, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onAddToCart 
}: { 
  product: Product, 
  isAdmin: boolean, 
  onEdit: (product: Product) => void, 
  onDelete: (productId: string) => void, 
  onAddToCart: (product: CartProduct) => void 
}) => {
  
  const productForCart: CartProduct = {
    _id: product._id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
  };

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden transition-shadow hover:shadow-xl">
      <img src={product.imageUrl} alt={product.name} className="h-56 w-full object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-600 truncate">{product.description}</p>
        <p className="mt-2 text-lg font-semibold text-gray-900">₪{product.price}</p>
        <button 
          onClick={() => onAddToCart(productForCart)} 
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          <ShoppingCart size={18} />
          <span>הוסף לסל</span>
        </button>
        {isAdmin && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(product)} className="rounded-full bg-yellow-500 p-2 text-white shadow-lg transition hover:bg-yellow-600"><Edit size={16} /></button>
            <button onClick={() => onDelete(product._id)} className="rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-700"><Trash2 size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CategoryPage({ params }: { params: { name: string } }) {
  // הוספנו את logout מה-AuthContext לטיפול ב-401
  const { user, token, logout } = useAuth();
  const { addToCart } = useCart();
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
  const categoryName = decodeURIComponent(params.name);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // פונקציית עזר לטיפול בשגיאות 401
  const handleAuthError = (status: number) => {
    if (status === 401) {
      alert('פג תוקף ההתחברות. אנא התחבר מחדש.');
      logout();
      return true;
    }
    return false;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/category/${encodeURIComponent(categoryName)}`);
        if (!response.ok) throw new Error('שליפת המוצרים נכשלה');
        const data = await response.json();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('אירעה שגיאה בטעינת המוצרים');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName]);

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = async (formData: Omit<Product, '_id' | 'categoryName'> & { categoryName: string }, productId: string | null) => {
    setIsModalLoading(true);
    setError(null);
    
    const isEditMode = productId !== null;
    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/products`;
      
    const method = isEditMode ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // בדיקת אימות
      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'הפעולה נכשלה');
      }

      const savedProduct = await response.json();

      if (isEditMode) {
        setProducts(products.map(p => p._id === productId ? savedProduct : p));
      } else {
        setProducts([...products, savedProduct]);
      }
      
      handleCloseModal();

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('אירעה שגיאה בשמירת המוצר');
      }
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        // בדיקת אימות
        if (handleAuthError(response.status)) return;

        if (!response.ok) throw new Error('המחיקה נכשלה');
        setProducts(products.filter(p => p._id !== productId));
        alert('המוצר נמחק בהצלחה');
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(`שגיאה במחיקה: ${err.message}`);
        } else {
          alert('שגיאה במחיקה: אירעה שגיאה לא צפויה');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isModalOpen && (
        <ProductModal
          productToEdit={productToEdit}
          categoryName={categoryName}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          isLoading={isModalLoading}
        />
      )}
    
      <main className="container mx-auto p-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{categoryName}</h1>
          {isAdmin ? (
            <button onClick={handleOpenAddModal} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-green-700">
              <Plus size={18} />
              <span>הוסף מוצר חדש</span>
            </button>
          ) : ( <div></div> )}
        </div>

        {isLoading && <p className="text-center">טוען מוצרים...</p>}
        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</p>}
        {!isLoading && !error && (
          products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isAdmin={isAdmin}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDelete}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">עדיין אין מוצרים בקטגוריה זו. {isAdmin && "אפשר להתחיל להוסיף!"}</p>
          )
        )}
      </main>
    </div>
  );
}