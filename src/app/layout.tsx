// src/app/layout.tsx
'use client';

import './globals.css';
import React from 'react';
import { Space_Mono } from 'next/font/google';
import AuthContextProvider from '../context/AuthContextProvider';

const space = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${space.className} border-primary/20`}>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
