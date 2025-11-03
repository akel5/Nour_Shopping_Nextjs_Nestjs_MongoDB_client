'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- הגדרת טיפוסים ---
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Completed';
  customerDetails: {
    email: string;
    phone: string;
  };
  paymentMethod: 'cash_on_delivery' | 'credit_card';
  createdAt: string;
}

// --- קומפוננטת כרטיס הזמנה ---
const OrderCard = ({ order }: { order: Order }) => {
  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <h3 className="font-semibold text-gray-600">הזמנה #{order._id.substring(0, 8)}...</h3>
          <p className="text-sm text-gray-500">
            בתאריך: {new Date(order.createdAt).toLocaleDateString('he-IL')}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full mt-2 sm:mt-0 ${getStatusClass(order.status)}`}
        >
          {order.status}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.productId} className="flex justify-between items-center text-sm">
            <span className="text-gray-700">{item.name} (x{item.quantity})</span>
            <span className="text-gray-900 font-medium">₪{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <span className="text-gray-600">פרטי תשלום: {order.paymentMethod === 'cash_on_delivery' ? 'מזומן' : 'אשראי'}</span>
        <span className="text-lg font-bold text-gray-900">
          סה"כ: ₪{order.totalAmount.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

// --- קומפוננטת העמוד ---
export default function MyOrdersPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. הגנה על העמוד: אם המשתמש לא מחובר, העבר להתחברות
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router]);

  // 2. שליפת ההזמנות מהשרת
  useEffect(() => {
    if (user && token) {
      const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch orders');
          const data = await response.json();
          setOrders(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, token]);

  if (isAuthLoading || isLoading) {
    return <div className="text-center p-10">טוען הזמנות...</div>;
  }
  
  if (!user) {
     return <div className="text-center p-10">יש להתחבר כדי לראות עמוד זה.</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">שגיאה: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">ההזמנות שלי</h1>
      {orders.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">עדיין לא ביצעת הזמנות.</p>
          <Link href="/collection">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700">
              התחל קניות
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}