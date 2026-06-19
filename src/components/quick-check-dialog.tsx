
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useItems } from "@/context/ItemContext";
import { generateTags } from "@/ai/flows/generate-tags-flow";
import { Loader2, Search, Camera, X } from "lucide-react";
import { ItemCard } from "./item-card";
import { ScrollArea } from "./ui/scroll-area";
import { Item } from "@/types";
import { Badge } from "./ui/badge";

type QuickCheckDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function QuickCheckDialog({ isOpen, onClose }: QuickCheckDialogProps) {
  const { items } = useItems();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{ item: Item; score: number }[]>([]);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResults([]);
    setDetectedTags([]);
    setHasSearched(false);
  };

  const handleQuickCheck = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    try {
      // 1. Generate tags for the uploaded photo
      const { tags } = await generateTags({
        description: "Checking for matches based on visual content.",
        photoDataUri: imagePreview,
      });

      setDetectedTags(tags);

      // 2. Calculate match scores for all items
      const scoredItems = items
        .map((item) => {
          const itemTags = item.tags || [];
          const matchingTags = itemTags.filter((t) =>
            tags.includes(t.toLowerCase())
          );
          return {
            item,
            score: matchingTags.length,
          };
        })
        .filter((res) => res.score > 0)
        .sort((a, b) => b.score - a.score);

      setResults(scoredItems);
      setHasSearched(true);
    } catch (error) {
      console.error("Quick check error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold font-headline">Quick Match Check</DialogTitle>
          <DialogDescription>
            Upload a photo to instantly find items with matching AI-generated tags.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-4 flex flex-col gap-6">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center gap-4 bg-muted/30">
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 rounded-lg shadow-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 rounded-full h-8 w-8"
                    onClick={handleReset}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="bg-primary/10 p-6 rounded-full">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {imagePreview ? "Ready to Check" : "Select an Image"}
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  Our AI will analyze the photo and find the most relevant items reported on campus.
                </p>
              </div>

              {!imagePreview && (
                <Label
                  htmlFor="quick-check-upload"
                  className="cursor-pointer bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  Upload Photo
                  <Input
                    id="quick-check-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Label>
              )}

              {imagePreview && (
                <Button 
                  size="lg" 
                  onClick={handleQuickCheck} 
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Check for Matches
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Match Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Found {results.length} items matching your photo.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Check Another Photo
                </Button>
              </div>

              {detectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-medium text-muted-foreground">Detected:</span>
                  {detectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <ScrollArea className="flex-1 border rounded-lg bg-background p-4">
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map(({ item, score }) => (
                      <div key={item.id} className="relative group">
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-green-600 text-white shadow-sm">
                            {score} tag{score > 1 ? 's' : ''} match
                          </Badge>
                        </div>
                        <ItemCard item={item} onOpenDialog={() => {}} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <p className="text-muted-foreground">No close matches found. You might want to report this item!</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
