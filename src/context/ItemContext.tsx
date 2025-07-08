
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Item } from '@/types';
import { mockItems } from '@/lib/data';
import { useAuth } from './AuthContext';
import { generateTags } from '@/ai/flows/generate-tags-flow';

type NewItemData = Omit<Item, 'id' | 'createdAt' | 'reportedBy' | 'tags'> & {
    photoDataUri?: string | null;
};

interface ItemContextType {
  items: Item[];
  addItem: (item: NewItemData) => Promise<void>;
  updateItemStatus: (itemId: string, status: 'reunited') => void;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>(mockItems);
  const { user } = useAuth();

  const addItem = async (itemData: NewItemData) => {
    if (!user) return; 

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

    const newItem: Item = {
      ...itemData,
      id: new Date().getTime().toString(), // Use timestamp for a unique enough ID
      createdAt: new Date(),
      reportedBy: user.email,
      tags: generatedTags,
    };
    setItems(prevItems => [newItem, ...prevItems]);
  };
  
  const updateItemStatus = (itemId: string, status: 'reunited') => {
      setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, status } : item
      )
    );
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
