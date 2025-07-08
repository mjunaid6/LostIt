
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { categories, getCategoryIcon } from "@/lib/icons"
import { useItems } from "@/context/ItemContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

// Zod schema doesn't include the file input, as it's handled separately.
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  contact: z.string().min(5, {
    message: "Please provide valid contact information.",
  }),
  university: z.string(),
  type: z.enum(['lost', 'found']),
})

type ReportItemFormProps = {
  type: 'lost' | 'found';
  university: string;
}

export function ReportItemForm({ type, university }: ReportItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, isUploading, uploadError } = useItems();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      contact: "",
      university: university,
      type: type,
    },
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        await addItem({
            ...values,
            status: type,
            imageFile: imageFile,
        });

        toast({
        title: `Item ${type === 'lost' ? 'Lost' : 'Found'} Reported!`,
        description: "Your report has been submitted and tagged with AI.",
        });
        router.push('/dashboard');
    } catch (error: any) {
        console.error("Error adding item:", error);
        toast({
            variant: "destructive",
            title: "Submission Error",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {uploadError && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>
                   {uploadError}
                </AlertDescription>
            </Alert>
        )}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Black Leather Wallet" {...field} />
              </FormControl>
              <FormDescription>
                A short, descriptive title for the item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide as many details as possible: brand, color, distinguishing marks, etc."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => {
                      const Icon = getCategoryIcon(category);
                      return (
                         <SelectItem key={category} value={category}>
                            <div className="flex items-center">
                                <Icon className="w-4 h-4 mr-2" />
                                <span>{category}</span>
                            </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location {type === 'lost' ? 'Lost' : 'Found'}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Library, 2nd Floor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
                <FormItem>
                <FormLabel>University</FormLabel>
                <FormControl>
                    <Input disabled {...field} />
                </FormControl>
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                        <Input placeholder="Phone number or email" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormItem>
            <FormLabel>Item Photo (Optional)</FormLabel>
            <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
            </FormControl>
            <FormDescription>
                A clear photo helps others identify the item.
            </FormDescription>
            {imagePreview && (
                <div className="mt-4">
                    <img src={imagePreview} alt="Item preview" className="rounded-md max-h-48" />
                </div>
            )}
            <FormMessage>{form.formState.errors.root?.message}</FormMessage>
        </FormItem>
        
        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Submitting..." : "Submit Report"}
        </Button>
      </form>
    </Form>
  )
}
