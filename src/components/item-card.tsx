import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from '@/lib/icons';
import type { Item } from "@/types";

type ItemCardProps = {
  item: Item;
  onOpenDialog: (item: Item) => void;
};

export function ItemCard({ item, onOpenDialog }: ItemCardProps) {
  const Icon = getCategoryIcon(item.category);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            data-ai-hint="lost item"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <Badge variant="secondary" className="mb-2">
            <Icon className="w-3 h-3 mr-1" />
            {item.category}
          </Badge>
          <CardTitle className="text-lg font-bold leading-tight mb-2 font-headline">{item.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
        <Button className="w-full mt-4" variant="outline" onClick={() => onOpenDialog(item)}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
