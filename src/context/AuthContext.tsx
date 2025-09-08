import { createContext, useContext, useEffect, useState } from "react";
// import { useRouter } from "next/navigation"
import { User } from "../utils/Types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLogged: boolean;
  updateUser: (updatedUserData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  // const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth", { credentials: 'include' });
      if (!res.ok) throw new Error("Not authenticated");

      const data = await res.json();
      setUser(data.user);
      setIsLogged(true);
    } catch (error: unknown) {
      console.error("Error fetching user:", error)
      setUser(null);
      setIsLogged(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateUser = (updatedUserData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUserData } : null));
  };

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isLogged, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для використання контексту
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
