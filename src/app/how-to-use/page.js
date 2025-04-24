'use client';

import Link from 'next/link';
import Header from '../../components/Header';

export default function HowToUse() {
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-start">
      {/* 🔹 Updated Header (without How to Use) */}
      <Header />

      {/* 🔹 How to Use Title */}
      <h1 className="text-2xl font-bold mt-6">How to Use</h1>

      {/* 🔹 Step-by-Step Instructions */}
      <div className="mt-4 max-w-2xl text-lg text-white">
        <p>1. Click "Scan for BLE Devices" to find available devices.</p>
        <p>2. Pair with your BLE-enabled shoe from the list.</p>
        <p>3. Click on the paired device to proceed to gesture setup.</p>
        <p>4. Select and record gestures (e.g., front tilt, back tilt, etc.).</p>
        <p>5. Assign a name to each recorded gesture for easy identification.</p>
        <p>6. Once setup is complete, you are ready to use the gestures!</p>
      </div>

      {/* 🔹 Back to Home Button */}
      <Link href="/">
        <button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded">
          Back to Home
        </button>
      </Link>
    </div>
  );
}
