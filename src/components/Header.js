// src/components/Header.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ links = [] }) {
  const pathname = usePathname();
  
  // Map link names to URLs
  const linkUrls = {
    'HID': '/hid',
    'Home': '/'
  };

  return (
    <header className="w-full py-4 flex items-center justify-between px-8 bg-black mb-4">
      {/* Title */}
      <Link href="/">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 drop-shadow-lg cursor-pointer">
          NEELY AIR 33
        </h1>
      </Link>
      
      {/* Navigation Buttons */}
      <nav className="flex gap-4 ml-auto">
        {links.map((link, index) => (
          pathname !== linkUrls[link] && (
            <Link key={index} href={linkUrls[link] || '/'}>
              <button className="px-4 py-2 text-lg text-blue-400 hover:text-teal-300 transition-all duration-200 rounded-lg">
                {link}
              </button>
            </Link>
          )
        ))}
      </nav>
    </header>
  );
}