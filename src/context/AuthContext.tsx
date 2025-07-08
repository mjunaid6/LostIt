
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (name: string, email: string, pass:string, university: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { name?: string; university?: string; phone?: string; imageFile?: File | null; }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.app || !db.app) {
        setLoading(false);
        console.error("Firebase not initialized. Auth features are disabled.");
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'userProfiles', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          const userPayload: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || profileData.name,
            email: firebaseUser.email!,
            avatar: firebaseUser.photoURL || profileData.avatar,
            university: profileData.university,
            phone: profileData.phone,
          };
          setUser(userPayload);
        } else {
            // This case handles users who signed up before the userProfiles collection was introduced.
            // We create a profile for them.
            const userPayload: User = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Anonymous User',
                email: firebaseUser.email!,
                university: 'Jamia Milia Islamia(JMI)',
                avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png`,
                phone: '',
            };
            await setDoc(userDocRef, { 
                name: userPayload.name, 
                email: userPayload.email, 
                university: userPayload.university,
                avatar: userPayload.avatar,
                phone: userPayload.phone,
            });
            setUser(userPayload);
        }

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
    
    const userDocRef = doc(db, 'userProfiles', userCredential.user.uid);
    const userPayload: Omit<User, 'uid'> = {
        name: name,
        email: email,
        university: university,
        avatar: `https://placehold.co/100x100.png`,
        phone: '',
    };
    await setDoc(userDocRef, userPayload);
    
    setUser({ ...userPayload, uid: userCredential.user.uid });
    return userCredential;
  };

  const updateUserProfile = async (data: { name?: string; university?: string; phone?: string; imageFile?: File | null; }) => {
    if (!user || !auth.currentUser) throw new Error("User not logged in");
    
    const authUpdates: { displayName?: string; photoURL?: string } = {};
    const firestoreUpdates: Partial<User> = {};

    if (data.imageFile) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, data.imageFile);
        const newAvatarUrl = await getDownloadURL(storageRef);
        authUpdates.photoURL = newAvatarUrl;
        firestoreUpdates.avatar = newAvatarUrl;
    }

    if (data.name && data.name !== user.name) {
        authUpdates.displayName = data.name;
        firestoreUpdates.name = data.name;
    }
    
    if (data.university && data.university !== user.university) {
        firestoreUpdates.university = data.university;
    }

    if (data.phone !== undefined && data.phone !== user.phone) {
        firestoreUpdates.phone = data.phone;
    }

    if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser, authUpdates);
    }

    if (Object.keys(firestoreUpdates).length > 0) {
        const userDocRef = doc(db, 'userProfiles', user.uid);
        await updateDoc(userDocRef, firestoreUpdates);
    }

    setUser(prevUser => prevUser ? { ...prevUser, ...firestoreUpdates } : null);
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
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
