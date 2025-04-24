// src/app/layout.js
'use client';

import { NeelyProvider } from './context/NeelyContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NeelyProvider>
          {children}
        </NeelyProvider>
      </body>
    </html>
  );
}