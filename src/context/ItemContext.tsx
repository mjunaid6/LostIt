
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Item } from '@/types';
import { useAuth } from './AuthContext';
import { generateTags } from '@/ai/flows/generate-tags-flow';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';


type NewItemData = Omit<Item, 'id' | 'createdAt' | 'reportedBy' | 'tags' | 'imageUrl'> & {
    imageFile?: File | null;
};

interface ItemContextType {
  items: Item[];
  addItem: (item: NewItemData) => Promise<void>;
  updateItemStatus: (itemId: string, status: 'reunited') => void;
  isUploading: boolean;
  uploadError: string | null;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

// Helper function to convert file to Data URI
const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


export const ItemProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);


  useEffect(() => {
    if (!db || !db.app) {
        console.error("Firestore not initialized. Item features are disabled.");
        return;
    }

    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const itemsFromFirestore: Item[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            itemsFromFirestore.push({
                ...data,
                id: doc.id,
                // Make sure to convert Firestore Timestamp to JS Date
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as Item);
        });
        setItems(itemsFromFirestore);
      },
      (error) => {
        console.error("Firestore subscription error:", error);
        toast({
            variant: "destructive",
            title: "Database Connection Error",
            description: "Could not connect to the items database. Please check your setup and refresh the page.",
        });
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const addItem = async (itemData: NewItemData) => {
    if (!user || !db || !storage) {
        setUploadError("Firebase is not configured correctly. Cannot submit item.");
        return;
    };
    if (!itemData.imageFile) {
        setUploadError("An image is required to report an item.");
        return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
        const imageFile = itemData.imageFile;
        const storageRef = ref(storage, `items/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        const photoDataUri = await fileToDataUri(imageFile);

        const { tags } = await generateTags({
            description: itemData.description,
            photoDataUri: photoDataUri,
        });

        const { imageFile: _, ...restOfData } = itemData;

        const newItemForFirestore = {
            ...restOfData,
            reportedBy: user.email,
            createdAt: new Date(),
            tags: tags,
            imageUrl: imageUrl,
        };

        await addDoc(collection(db, "items"), newItemForFirestore);

    } catch (error: any) {
      console.error("Error adding item:", error);
       if (error.code === 'storage/unauthorized') {
           const origin = new URL(window.location.href).origin;
           const errorMessage = `Permission denied. Your app's origin (${origin}) is not allowed by your Firebase Storage security rules. Please check your CORS configuration.`;
           setUploadError(errorMessage);
           throw new Error(errorMessage);
       }
       throw error;
    } finally {
        setIsUploading(false);
    }
  };

  const updateItemStatus = (itemId: string, status: 'reunited') => {
    if (!db) return;
    const itemRef = doc(db, "items", itemId);
    updateDoc(itemRef, {
        status: status
    });
  }

  const value = {
    items,
    addItem,
    updateItemStatus,
    isUploading,
    uploadError,
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};

export const useItems = () => {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
};
