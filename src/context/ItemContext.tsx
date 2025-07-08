
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Item } from '@/types';
import { useAuth } from './AuthContext';
import { generateTags } from '@/ai/flows/generate-tags-flow';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


type NewItemData = Omit<Item, 'id' | 'createdAt' | 'reportedBy' | 'tags' | 'imageUrl'> & {
    imageFile?: File | null;
};

interface ItemContextType {
  items: Item[];
  addItem: (item: NewItemData) => Promise<void>;
  updateItemStatus: (itemId: string, status: 'reunited') => void;
  isSubmitting: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);


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
    if (!user || !db) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to submit an item.",
        });
        return;
    };
    
    setIsSubmitting(true);

    try {
        let photoDataUri: string | undefined = undefined;
        let localImageUrl = 'https://placehold.co/600x400.png';

        if (itemData.imageFile) {
            photoDataUri = await fileToDataUri(itemData.imageFile);
            // Create a temporary URL for the image from the user's browser memory
            localImageUrl = URL.createObjectURL(itemData.imageFile);
        }

        const { tags } = await generateTags({
            description: itemData.description,
            photoDataUri: photoDataUri,
        });

        const { imageFile: _, ...restOfData } = itemData;

        // This object goes to Firestore, always with a placeholder image
        const newItemForFirestore = {
            ...restOfData,
            reportedBy: user.email,
            createdAt: new Date(),
            tags: tags,
            imageUrl: 'https://placehold.co/600x400.png',
        };

        const docRef = await addDoc(collection(db, "items"), newItemForFirestore);

        // This object is for the local state, using the temporary local image URL
        const newItemForLocalState: Item = {
            ...newItemForFirestore,
            id: docRef.id,
            imageUrl: localImageUrl, // Use the local blob/object URL
        };

        // Add to local state immediately for instant feedback.
        // This will be overwritten when Firestore syncs, which is the desired behavior.
        setItems(prevItems => [newItemForLocalState, ...prevItems]);

    } catch (error: any) {
      console.error("Error adding item:", error);
      toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "There was an error submitting your item. Please try again.",
      });
      throw error;
    } finally {
        setIsSubmitting(false);
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
    isSubmitting,
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
