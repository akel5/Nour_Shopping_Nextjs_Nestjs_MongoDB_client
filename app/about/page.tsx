import { Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    // 1. הוספת dir="ltr" ו-text-left כדי להבטיח יישור לשמאל
    <div className="min-h-screen" dir="ltr">
      <div className="container mx-auto max-w-4xl py-16 px-6 text-left">
        
        {/* --- Part 1: About --- */}
        <section className="mb-16">
          {/* תיקון צבעים: החלפנו text-charcoal ב-text-gray-900 */}
          <h1 className="font-serif text-5xl font-bold text-gray-900 mb-6 text-center">
            About NOR
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Welcome to NOR, your vintage destination for items with a soul. 
            We believe every piece has a story, and our mission is to find you the most timeless, high-quality items. 
            Each piece in our collection is hand-picked with a love for aesthetics, history, and sustainability.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            From apparel that tells a story to home decor that adds warm, unique character, NOR is your destination for professional, quality vintage.
          </p>
        </section>

        {/* --- Separator --- */}
        <hr className="border-gray-300 my-16" />

        {/* --- Part 2: Contact Us --- */}
        <section>
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6 text-center">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-700 text-center mb-8">
            {/* שימוש ב-&apos; למניעת שגיאות */}
            For any questions, inquiries, styling advice, or just to say hello – we&apos;re here.
          </p>
          
          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto border border-gray-200">
            <div className="flex items-center mb-4">
              {/* תיקון צבעים: החלפנו text-accent ב-text-blue-600 */}
              <User className="text-blue-600 mr-3" size={20} />
              {/* תיקון צבעים: החלפנו text-charcoal ב-text-gray-900 */}
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