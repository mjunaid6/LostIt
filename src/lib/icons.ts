import { BookOpen, KeyRound, Smartphone, Shirt, Package, LucideIcon } from 'lucide-react';

export const categories = [
    "Electronics",
    "Keys",
    "Books",
    "Clothing",
    "Other"
] as const;

export type Category = typeof categories[number];

const categoryIconMap: Record<Category, LucideIcon> = {
  "Books": BookOpen,
  "Keys": KeyRound,
  "Electronics": Smartphone,
  "Clothing": Shirt,
  "Other": Package
};

export const getCategoryIcon = (category: string): LucideIcon => {
    return categoryIconMap[category as Category] || Package;
};
