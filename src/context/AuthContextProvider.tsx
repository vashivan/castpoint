'use client';

import { AuthProvider } from './AuthContext';
import { EmployerAuthProvider } from './EmployerAuthContext';

export default function AuthContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EmployerAuthProvider>
        {children}
      </EmployerAuthProvider>
    </AuthProvider>
  );
}
