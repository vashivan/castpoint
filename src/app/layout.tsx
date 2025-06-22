'use client';

import './globals.css';
import React, { useState } from 'react';
import { Space_Mono } from 'next/font/google'
import ProvidersWrapper from './ProvidersWrapper';
// import Navbar from '../components/layout/Navbar';
// import Sidebar from '../components/layout/Sidebar';
// import Footer from '../components/layout/Footer';
// import { AuthProvider } from '../context/AuthContext';

const space = Space_Mono({ subsets: ['latin'], weight: ["400", "700"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className={`${space.className} border-primary/20`}>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
