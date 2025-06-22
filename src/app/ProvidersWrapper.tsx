'use client';
import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../context/AuthContext';

export default function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlerLogOut = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST"});
      if (!response.ok) throw new Error("Error while logout");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Error while logout", error);
    }
  }

  return (
    <AuthProvider>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isOpen={sidebarOpen} handlerLogOut={handlerLogOut} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} handlerLogOut={handlerLogOut} />

      <main>
        {children}
      </main>

      <Footer />
    </AuthProvider>
  );
}
