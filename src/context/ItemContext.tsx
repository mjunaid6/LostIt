
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
    photoDataUri?: string | null;
    imageFile?: File | null;
};

interface ItemContextType {
  items: Item[];
  addItem: (item: NewItemData) => Promise<void>;
  updateItemStatus: (itemId: string, status: 'reunited') => void;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

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
    if (!user || !db || !storage) return; 

    let generatedTags: string[] = [];
    try {
        const result = await generateTags({
            description: itemData.description,
            photoDataUri: itemData.photoDataUri || undefined,
        });
        generatedTags = result.tags;
    } catch(e) {
        console.error("Failed to generate tags", e);
        // We can proceed without tags, or throw an error to be caught by the form
        throw new Error("AI tag generation failed.");
    }
    
    let finalImageUrl = "https://placehold.co/600x400.png";

    if (itemData.imageFile) {
        const file = itemData.imageFile;
        const storageRef = ref(storage, `items/${Date.now()}-${file.name}`);
        try {
            const uploadResult = await uploadBytes(storageRef, file);
            finalImageUrl = await getDownloadURL(uploadResult.ref);
        } catch (e: any) {
             // Firebase Storage throws 'storage/unauthorized' for CORS errors.
            if (e.code === 'storage/unauthorized') {
                console.error("CORS issue detected:", e);
                throw new Error("CORS: Image upload failed due to a permission issue. Please check your Firebase Storage CORS configuration.");
            }
            // Re-throw other errors to be handled by the form.
            throw e;
        }
    }

    const newItemForFirestore = {
      ...itemData,
      reportedBy: user.email,
      createdAt: new Date(), // Firestore will convert this to a Timestamp
      tags: generatedTags,
      imageUrl: finalImageUrl,
    };
    
    // Clean up properties that shouldn't be in the database
    delete (newItemForFirestore as any).photoDataUri;
    delete (newItemForFirestore as any).imageFile;

    await addDoc(collection(db, "items"), newItemForFirestore);
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
