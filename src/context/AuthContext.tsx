'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (name: string, email: string, pass:string, university: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if the auth object is valid before using it.
    // auth.app will be undefined if Firebase fails to initialize.
    if (!auth.app) {
        setLoading(false);
        console.error("Firebase not initialized. Auth features are disabled.");
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // In a real app, university would be stored/fetched from Firestore.
        // For now, we'll try to get it from a temporary source or default it.
        const userPayload: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Anonymous User',
          email: firebaseUser.email!,
          university: (firebaseUser as any).university || 'State University', 
          avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png`
        };
        setUser(userPayload);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => {
    if (!auth.app) return Promise.reject(new Error("Firebase not initialized."));
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (name: string, email: string, pass: string, university: string) => {
    if (!auth.app) return Promise.reject(new Error("Firebase not initialized."));
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    
    // This is a workaround because custom claims require a backend.
    // We'll set the user object on the client side after signup.
    const userPayload: User = {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        university: university,
        avatar: `https://placehold.co/100x100.png`
    };
    setUser(userPayload);
    return userCredential;
  };


  const logout = async () => {
    if (!auth.app) {
      router.push('/login');
      return;
    };
    await signOut(auth);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
