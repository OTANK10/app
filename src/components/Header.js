'use client';

export default function Header() {
  return (
    <header className="w-full py-4 flex items-center justify-between px-8 bg-black">
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 drop-shadow-lg">
        Bass Boots
      </h1>

      {/* Navigation Buttons */}
      <nav className="flex gap-4 ml-auto">
        <button
          onClick={() => document.getElementById('about-us').scrollIntoView({ behavior: 'smooth' })}
          className="px-4 py-2 text-lg text-blue-400 hover:text-teal-300 transition-all duration-200 rounded-lg"
        >
          About Us
        </button>
        <button
          onClick={() => document.getElementById('how-to-use').scrollIntoView({ behavior: 'smooth' })}
          className="px-4 py-2 text-lg text-blue-400 hover:text-teal-300 transition-all duration-200 rounded-lg"
        >
          How to Use
        </button>
      </nav>
    </header>
  );
}
