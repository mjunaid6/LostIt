"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCategoryIcon } from "@/lib/icons";
import { MapPin, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Item } from "@/types";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/context/AuthContext";

type ItemDetailsDialogProps = {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
};

export function ItemDetailsDialog({ item, isOpen, onClose }: ItemDetailsDialogProps) {
  const [isReunited, setIsReunited] = useState(item.status === 'reunited');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    setIsReunited(item.status === 'reunited');
  }, [item]);

  if (!currentUser) {
    // Or a loading state, but parent should handle this
    return null;
  }

  const handleReuniteClick = () => {
    setIsReunited(true);
    toast({
        title: "Item Reunited!",
        description: `"${item.title}" has been marked as reunited.`,
    });
    // In a real app, you would also make an API call here to update the item's status in the database.
  };

  const isOwner = currentUser.email === item.reportedBy;
  const CategoryIcon = getCategoryIcon(item.category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative aspect-video w-full rounded-t-lg overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint="found item"
            />
          </div>
          <div className="p-6">
            <DialogHeader className="text-left">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold font-headline mb-2">{item.title}</DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary"><CategoryIcon className="w-3 h-3 mr-1.5" />{item.category}</Badge>
                      <div className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {item.location}</div>
                  </div>
                </div>
                <Badge 
                    variant={isReunited ? "default" : "outline"} 
                    className={`transition-all duration-300 ${isReunited ? 'bg-green-500 text-white' : ''}`}
                >
                    {isReunited ? 'Reunited' : item.type === 'lost' ? 'Lost' : 'Found'}
                </Badge>
              </div>
              <Separator className="my-4" />
              <DialogDescription className="text-base text-foreground">
                {item.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-6 flex-col sm:flex-col sm:space-x-0 items-stretch gap-4">
                <Card className="bg-secondary/50 p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-sm text-muted-foreground space-y-2">
                        <div className="flex items-center"><User className="w-4 h-4 mr-2" /> Reported by user at {item.university}</div>
                        <div className="flex items-center"><Phone className="w-4 h-4 mr-2" /> {item.contact}</div>
                    </CardContent>
                </Card>

                {isOwner && !isReunited && (
                    <Button onClick={handleReuniteClick} size="lg" className="bg-green-600 hover:bg-green-700">
                        Mark as Reunited
                    </Button>
                )}
                {isOwner && isReunited && (
                    <Button size="lg" disabled>
                        Item Reunited
                    </Button>
                )}
                {!isOwner && (
                    <Button size="lg" className="bg-accent hover:bg-accent/90">
                        Contact Finder/Owner
                    </Button>
                )}
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
