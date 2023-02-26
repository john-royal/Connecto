import { createContext, useContext } from 'react';
import useSWR from 'swr';

export interface User {
  id: number;
  name: string;
  email: string;
}

interface Auth {
  user?: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createAccount: (user: { name: string; email: string; password: string }) => Promise<void>;
}

const AuthContext = createContext({} as Auth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, mutate } = useSWR<User | null>('/auth/session', async (url) => {
    const response = await fetch(url);
    if (response.ok) {
      const body = await response.json();
      return body.user as User;
    } else {
      return null;
    }
  });

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    if (json.success) {
      await mutate();
    } else {
      throw new Error(json.message);
    }
  };

  const signOut = async () => {
    await fetch('/auth/logout', { method: 'GET' });
    await mutate();
  };

  const createAccount = async (user: { name: string; email: string; password: string }) => {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    const json = await response.json();
    if (json.success) {
      await mutate();
    } else {
      throw new Error(json.message);
    }
  };

  const state = {
    user,
    signIn,
    signOut,
    createAccount,
  };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  return useContext(AuthContext);
}
