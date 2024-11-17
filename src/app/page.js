'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '../components/Header';

const shoeSections = [
  {
    name: 'Toe Studs',
    description: 'Provides traction for quick starts and acceleration',
    path: 'M80 10 Q110 0 140 10 Q160 20 160 40 Q140 50 110 50 Q80 50 60 40 Q60 20 80 10 Z',
  },
  {
    name: 'Lateral Studs',
    description: 'Enhances grip during side-to-side movements',
    path: 'M10 80 Q20 60 40 50 Q60 45 80 60 Q90 80 80 100 Q60 120 40 110 Q20 100 10 80 Z',
  },
  {
    name: 'Medial Studs',
    description: 'Improves stability and ball control on the inner foot',
    path: 'M190 70 Q210 60 230 70 Q250 85 250 110 Q240 135 220 140 Q200 140 190 120 Q180 100 190 70 Z',
  },
  {
    name: 'Heel Studs',
    description: 'Offers stability and braking control',
    path: 'M40 230 Q80 220 140 220 Q200 220 240 230 Q260 240 260 260 Q240 280 140 280 Q40 280 20 260 Q20 240 40 230 Z',
  },
];

export default function Component() {
  const [activeSection, setActiveSection] = useState(null);

  const ShoeOverlay = ({ flip = false }) => (
    <svg
      viewBox="0 0 280 300"
      className={`absolute top-0 left-0 w-full h-full ${flip ? 'scale-x-[-1]' : ''}`}
      style={{ filter: 'drop-shadow(0px 0px 2px rgba(59, 130, 246, 0.5))' }}
    >
      {shoeSections.map((section) => (
        <path
          key={section.name}
          d={section.path}
          fill={activeSection === section.name ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'}
          stroke={activeSection === section.name ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.5)'}
          strokeWidth="2"
          className="cursor-pointer transition-all duration-300"
          onMouseEnter={() => setActiveSection(section.name)}
          onMouseLeave={() => setActiveSection(null)}
        />
      ))}
    </svg>
  );

  return (
    <div className="min-h-screen bg-black p-8 flex flex-col items-center justify-start">
      {/* Header Component */}
      <Header />

      <div className="flex flex-col md:flex-row w-full max-w-4xl">
        <div className="relative w-full max-w-md mx-auto">
          <Image
            src="/left_shoe.png"
            alt="Left soccer cleat sole"
            width={500}
            height={1000}
            className="w-full h-auto"
          />
          <ShoeOverlay />
        </div>
        <div className="relative w-full max-w-md mx-auto">
          <Image
            src="/right_shoe.png"
            alt="Right soccer cleat sole"
            width={500}
            height={1000}
            className="w-full h-auto"
          />
          <ShoeOverlay flip />
        </div>
      </div>

      {activeSection && (
        <div className="absolute left-1/2 bottom-4 bg-blue-500 text-white p-3 rounded-md shadow-lg w-64 transform -translate-x-1/2">
          <h3 className="font-bold text-sm">{shoeSections.find((s) => s.name === activeSection)?.name}</h3>
          <p className="text-xs mt-1">{shoeSections.find((s) => s.name === activeSection)?.description}</p>
        </div>
      )}

      <div className="mt-8 text-white text-center">
        <p className="text-sm text-muted-foreground">
          Hover over different sections to learn more about the shoe components.
        </p>
      </div>
    </div>
  );
}
