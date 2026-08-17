/**
 * Nolyvatix Client - Firebase Auth React Hook
 */

import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, signInAnonymously, User } from '../lib/firebase.ts';

export interface AuthState {
  user: User | null;
  loading: boolean;
  token: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
        } catch {
          setToken(null);
        }
        setLoading(false);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
          const idToken = await cred.user.getIdToken();
          setToken(idToken);
        } catch (err) {
          console.warn('Anonymous sign-in failed:', err);
          setUser(null);
          setToken(null);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      setUser(cred.user);
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setToken(null);
  };

  return {
    user,
    loading,
    token,
    signIn,
    signOut,
  };
}
