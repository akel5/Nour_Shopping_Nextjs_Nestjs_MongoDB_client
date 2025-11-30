import { Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    // 1. הוספת bg-gray-950 לרקע כהה דרמטי, ו-dir="ltr"
    <div className="min-h-screen bg-gray-950" dir="ltr">
      <div className="container mx-auto max-w-4xl py-16 px-6 text-left">
        
        {/* --- Part 1: About --- */}
        <section className="mb-16">
          {/* שינוי ל-text-white כדי לבלוט על הרקע השחור */}
          <h1 className="font-serif text-5xl font-bold text-white mb-6 text-center">
            About NOR
          </h1>
          {/* שינוי ל-text-gray-300 לקריאות טובה על רקע כהה */}
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            Welcome to NOR, your vintage destination for items with a soul. 
            We believe every piece has a story, and our mission is to find you the most timeless, high-quality items. 
            Each piece in our collection is hand-picked with a love for aesthetics, history, and sustainability.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            From apparel that tells a story to home decor that adds warm, unique character, NOR is your destination for professional, quality vintage.
          </p>
        </section>

        {/* --- Separator (בהיר יותר) --- */}
        <hr className="border-gray-700 my-16" />

        {/* --- Part 2: Contact Us --- */}
        <section>
          {/* שינוי ל-text-white */}
          <h2 className="font-serif text-4xl font-bold text-white mb-6 text-center">
            Get in Touch
          </h2>
          {/* שינוי ל-text-gray-300 */}
          <p className="text-lg text-gray-300 text-center mb-8">
            {/* שימוש ב-&apos; למניעת שגיאות */}
            For any questions, inquiries, styling advice, or just to say hello – we&apos;re here.
          </p>
          
          {/* הכרטיס נשאר לבן כדי ליצור ניגודיות יפה */}
          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto border border-gray-200">
            <div className="flex items-center mb-4">
              <User className="text-blue-600 mr-3" size={20} />
              <span className="text-lg text-gray-900 font-medium">Nour Fares</span>
            </div>
            <div className="flex items-center">
              <Mail className="text-blue-600 mr-3" size={20} />
              <Link 
                href="mailto:nourhadi12@icloud.com" 
                className="text-lg text-blue-600 hover:underline"
              >
                nourhadi12@icloud.com
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}