import './globals.css';
import { Metadata } from 'next';
import React from 'react';
import { Archivo, Inter } from 'next/font/google';
import AuthContextProvider from '../context/AuthContextProvider';
import RouteLoader from '../components/ui/RouterLoader';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Castpoint – Find Your Contract',
  description: 'A platform for artists to find international jobs and share experience',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="bg-paper text-ink font-sans">
        <RouteLoader />
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
