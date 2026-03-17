"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Listen to Firebase auth state
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Fallback: no Firebase → demo mode off (user must authenticate)
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  // Translate Firebase error codes to French
  function getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cet email.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect.';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez dans quelques minutes.';
      case 'auth/popup-closed-by-user':
        return 'Connexion annulée.';
      case 'auth/network-request-failed':
        return 'Erreur réseau. Vérifiez votre connexion internet.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth) {
      setError('Firebase non configuré. Contactez l\'administrateur.');
      return;
    }
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/discovery');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
      throw err;
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      setError('Firebase non configuré. Contactez l\'administrateur.');
      return;
    }
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name
      await updateProfile(userCredential.user, { displayName });
      router.push('/discovery');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      setError('Firebase non configuré. Contactez l\'administrateur.');
      return;
    }
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/discovery');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getFirebaseErrorMessage(err.code));
      }
      throw err;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (err: any) {
      setError('Erreur lors de la déconnexion.');
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      setError('Firebase non configuré.');
      return;
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      loading,
      login,
      signup,
      loginWithGoogle,
      logout,
      resetPassword,
      error,
      clearError,
    }}>
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
