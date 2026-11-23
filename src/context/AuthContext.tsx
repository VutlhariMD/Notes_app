import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import {
  clearSession, // helper function that is used to  clear the session = log out 
  getSessionUserId, // get the current user who is logged in
  getUsers, // get all the list of users
  saveUsers, // save the users into the save users list
  setSessionUserId, 
} from '../utils/storage';

type AuthResult = { success: boolean; error?: string };

// This  is everything that is inside the shared box
interface AuthContextType {
  user: User | null;  //This is someone who is logged in
  loading: boolean; //Loading the data
  register: (email: string, username: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app start: check if someone was already logged in
  useEffect(() => {
    async function restoreSession() {
      const id = await getSessionUserId();
      if (id) {
        const users = await getUsers();
        const found = users.find((u) => u.id === id);
        if (found) setUser(found);
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  async function register(email: string, username: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const users = await getUsers();

    if (users.some((u) => u.email === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: cleanEmail,
      username: username.trim(),
      password,
    };

    await saveUsers([...users, newUser]);
    await setSessionUserId(newUser.id);
    setUser(newUser);
    return { success: true };
  }

  async function login(email: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const users = await getUsers();
    const found = users.find((u) => u.email === cleanEmail && u.password === password);

    if (!found) {
      return { success: false, error: 'Incorrect email or password.' };
    }

    await setSessionUserId(found.id);
    setUser(found);
    return { success: true };
  }

  async function logout() {
    await clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}