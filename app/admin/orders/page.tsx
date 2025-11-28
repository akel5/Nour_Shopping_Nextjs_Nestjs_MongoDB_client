'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- הגדרת טיפוסים ---
enum OrderStatus {
  PENDING = 'Pending',
  SHIPPED = 'Shipped',
  COMPLETED = 'Completed',
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface ApiOrder {
  _id: string;
  userId: {
    _id: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  customerDetails: {
    email: string;
    phone: string;
  };
  paymentMethod: 'cash_on_delivery' | 'credit_card';
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      const fetchAllOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Failed to fetch orders');
          const data = await response.json();
          setOrders(data);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('אירעה שגיאה לא צפויה');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllOrders();
    }
  }, [user, token]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updatedOrder = await response.json();
      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
    } catch (err) {
      alert('עדכון הסטטוס נכשל');
      console.error(err);
    }
  };

  if (isAuthLoading || isLoading) return <div className="p-8 text-center">טוען נתונים...</div>;
  if (user?.role !== 'admin') return <div className="p-8 text-center">אין לך הרשאת גישה.</div>;
  if (error) return <div className="text-center text-red-500 p-10">שגיאה: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; חזרה לדף הבית</Link>
      <h1 className="text-3xl font-bold mb-6">ניהול הזמנות (סה&quot;כ: {orders.length})</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מספר הזמנה</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">לקוח</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך</th>
              {/* תיקון: החלפת " ל- &quot; */}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סה&quot;כ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פריטים</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {order._id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.customerDetails.email}</div>
                  <div className="text-sm text-gray-500">{order.customerDetails.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('he-IL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ₪{order.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                    className={`p-1 rounded-md border text-sm ${
                      order.status === OrderStatus.PENDING ? 'border-yellow-300 bg-yellow-100 text-yellow-800' :
                      order.status === OrderStatus.SHIPPED ? 'border-blue-300 bg-blue-100 text-blue-800' :
                      'border-green-300 bg-green-100 text-green-800'
                    }`}
                  >
                    <option value={OrderStatus.PENDING}>ממתין</option>
                    <option value={OrderStatus.SHIPPED}>נשלח</option>
                    <option value={OrderStatus.COMPLETED}>הושלם</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.items.map((item, index) => (
                    <div key={index}>{item.name} (x{item.quantity})</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}