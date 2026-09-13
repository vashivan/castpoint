import './globals.css';
import { Metadata } from 'next';
import React from 'react';
import { Montserrat } from 'next/font/google';
import AuthContextProvider from '../context/AuthContextProvider';
import RouteLoader from '../components/ui/RouterLoader';
import { SpeedInsights } from "@vercel/speed-insights/next"

const space = Montserrat({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Castpoint – Find Your Contract',
  description: 'A platform for artists to find international jobs and share experience',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${space.className} border-primary/20`}>
        <RouteLoader />
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
