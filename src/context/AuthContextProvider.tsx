'use client';

import { AuthProvider } from './AuthContext';

export default function AuthContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
