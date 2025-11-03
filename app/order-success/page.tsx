'use client'; 

import { useEffect } from 'react'; 
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext'; 

export default function OrderSuccessPage() {
  const { clearCart } = useCart(); 

  // אפקט שרץ פעם אחת כשהדף נטען
  useEffect(() => {
    // נקה את העגלה עכשיו, אחרי שהגענו לדף ההצלחה
    clearCart();
  }, [clearCart]); 

  return (
    <div className="container mx-auto max-w-2xl text-center py-20 px-6">
      <CheckCircle className="text-green-500 w-24 h-24 mx-auto mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        ההזמנה הושלמה בהצלחה!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        תודה שרכשת ב-NOR. הזמנתך התקבלה ואנו מתחילים לטפל בה.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/">
          <button className="w-full sm:w-auto bg-gray-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700">
            חזרה לדף הבית
          </button>
        </Link>
        <Link href="/my-orders">
          <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700">
            צפייה בהזמנות שלי
          </button>
        </Link>
      </div>
    </div>
  );
}