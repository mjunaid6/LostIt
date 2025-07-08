
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Item } from '@/types';
import { mockItems } from '@/lib/data';
import { useAuth } from './AuthContext';

interface ItemContextType {
  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'reportedBy'>) => void;
  updateItemStatus: (itemId: string, status: 'reunited') => void;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>(mockItems);
  const { user } = useAuth();

  const addItem = (itemData: Omit<Item, 'id' | 'createdAt' | 'reportedBy'>) => {
    if (!user) return; 

    const newItem: Item = {
      ...itemData,
      id: new Date().getTime().toString(), // Use timestamp for a unique enough ID
      createdAt: new Date(),
      reportedBy: user.email,
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
