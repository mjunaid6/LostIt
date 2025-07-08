
"use client"
import React, { useState } from 'react';
import Header from "@/components/header";
import { ItemCard } from "@/components/item-card";
import { Item } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemDetailsDialog } from "@/components/item-details-dialog";
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useItems } from '@/context/ItemContext';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { user } = useAuth();
  const { items } = useItems();
  const [searchQuery, setSearchQuery] = useState('');

  // ProtectedRoute should prevent user from being null, but this is a safeguard
  if (!user) return null;

  const universityItems = items.filter(item => item.university === user.university);

  const filteredItems = universityItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const inTitle = item.title.toLowerCase().includes(query);
    const inDescription = item.description.toLowerCase().includes(query);
    const inCategory = item.category.toLowerCase().includes(query);
    const inTags = item.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
    return inTitle || inDescription || inCategory || inTags;
  });

  const lostItems = filteredItems.filter(item => item.type === 'lost' && item.status === 'lost');
  const foundItems = filteredItems.filter(item => item.type === 'found' && item.status === 'found');
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-1 bg-background/50">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                Items at {user.university}
                </h1>
                <p className="text-muted-foreground mt-1">
                Browse items reported by your university community.
                </p>
            </div>
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by title, description, or tag..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>

          <Tabs defaultValue="lost-items">
            <TabsList className="grid w-full grid-cols-2 md:w-96">
              <TabsTrigger value="lost-items">Lost Items</TabsTrigger>
              <TabsTrigger value="found-items">Found Items</TabsTrigger>
            </TabsList>
            <TabsContent value="lost-items" className="mt-6">
              {lostItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {lostItems.map(item => (
                    <ItemCard key={item.id} item={item} onOpenDialog={setSelectedItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <h3 className="text-xl font-semibold">No Lost Items Found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or check back later.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="found-items" className="mt-6">
              {foundItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {foundItems.map(item => (
                    <ItemCard key={item.id} item={item} onOpenDialog={setSelectedItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <h3 className="text-xl font-semibold">No Found Items Found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or report an item you found!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      {selectedItem && (
        <ItemDetailsDialog
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
