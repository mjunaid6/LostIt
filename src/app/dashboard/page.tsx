
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
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickCheckDialog } from '@/components/quick-check-dialog';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isQuickCheckOpen, setIsQuickCheckOpen] = useState(false);
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                Items at {user.university}
                </h1>
                <p className="text-muted-foreground mt-1 text-lg">
                Browse items reported by your university community.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:max-w-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, description, or tag..."
                        className="pl-10 h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button 
                  onClick={() => setIsQuickCheckOpen(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground h-11 font-semibold shadow-md group"
                >
                  <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  AI Quick Check
                </Button>
            </div>
          </div>

          <Tabs defaultValue="lost-items" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-96 mb-8">
              <TabsTrigger value="lost-items" className="text-base py-2">Lost Items</TabsTrigger>
              <TabsTrigger value="found-items" className="text-base py-2">Found Items</TabsTrigger>
            </TabsList>
            <TabsContent value="lost-items" className="mt-0">
              {lostItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {lostItems.map(item => (
                    <ItemCard key={item.id} item={item} onOpenDialog={setSelectedItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/20">
                  <h3 className="text-2xl font-semibold">No Lost Items Found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or check back later.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="found-items" className="mt-0">
              {foundItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {foundItems.map(item => (
                    <ItemCard key={item.id} item={item} onOpenDialog={setSelectedItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/20">
                  <h3 className="text-2xl font-semibold">No Found Items Found</h3>
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

      <QuickCheckDialog 
        isOpen={isQuickCheckOpen}
        onClose={() => setIsQuickCheckOpen(false)}
      />
    </div>
  );
}
