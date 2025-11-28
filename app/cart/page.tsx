'use client';

import { useState, useEffect } from 'react';
// 1. ייבוא הטיפוס CartItem
import { useCart, CartItem } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

// הגדרת סוגי התשלום
enum PaymentMethod {
  CASH = 'cash_on_delivery',
  CARD = 'credit_card',
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  // הוספת הטיפוס : CartItem
  const totalPrice = cart.reduce((total, item: CartItem) => total + item.price * item.quantity, 0);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('עליך להתחבר כדי לבצע הזמנה.');
      router.push('/login');
      return;
    }
    
    if (cart.length === 0) {
      alert('העגלה שלך ריקה.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        customerDetails: { email, phone },
        paymentMethod: paymentMethod,
        cart: cart,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'יצירת ההזמנה נכשלה');
      }

      if (paymentMethod === PaymentMethod.CARD) {
        alert('ההזמנה נוצרה! (דף תשלום באשראי יופיע כאן)');
      } else {
        alert('ההזמנה נוצרה בהצלחה!');
      }

      // clearCart(); // <-- ⛔️ השורה הזו נמחקה מכאן ⛔️
      router.push('/order-success'); // העברה לדף אישור הזמנה

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
    <div className="container mx-auto p-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">עגלת הקניות שלך</h1>

      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">העגלה שלך ריקה.</p>
          <Link href="/collection">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700">
              התחל קניות
            </button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            {cart.map((item: CartItem) => ( // הוספנו טיפוס
              <div key={item._id} className="flex items-center bg-white p-4 rounded-lg shadow-md">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="flex-grow mx-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">₪{item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded-md text-center"
                  />
                  <button type="button" onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
              <h2 className="text-2xl font-semibold mb-4">סיכום הזמנה</h2>
              
              <div className="space-y-4 mb-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    כתובת אימייל
                  </label>
                  <input
                    id="email" type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון
                  </label>
                  <input
                    id="phone" type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    אמצעי תשלום
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value={PaymentMethod.CASH}>מזומן לשליח / נציג יחזור אליי</option>
                    <option value={PaymentMethod.CARD}>כרטיס אשראי (בקרוב)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">סה"כ פריטים:</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-xl font-bold mb-4">
                <span>סה"כ לתשלום:</span>
                <span>₪{totalPrice.toFixed(2)}</span>
              </div>
              
              {error && (
                <p className="mb-4 text-center text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoading ? 'מבצע הזמנה...' : 'בצע הזמנה'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}