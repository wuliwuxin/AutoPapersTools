/**
 * Auth Context
 * Manages global authentication state
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data, isLoading: queryLoading, refetch: queryRefetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (!queryLoading) {
      console.log('[AuthContext] User data updated:', data);
      setUser(data || null);
      setIsLoading(false);
    }
  }, [data, queryLoading]);

  const refetch = async () => {
    console.log('[AuthContext] Refetching user data...');
    const result = await queryRefetch();
    if (result.data) {
      console.log('[AuthContext] Refetch successful:', result.data);
      setUser(result.data);
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
