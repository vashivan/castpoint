'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20); // при скролі >20px вмикається фон
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlerLogOut = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Error while logout');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      console.error('Error while logout', error);
    }
  };

  return (
    <>
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isOpen={sidebarOpen}
        handlerLogOut={handlerLogOut}
        isScrolled={isScrolled}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        handlerLogOut={handlerLogOut}
        isScrolled={isScrolled}
      />
        <main>{children}</main>
      <Footer />
    </>
  );
}
