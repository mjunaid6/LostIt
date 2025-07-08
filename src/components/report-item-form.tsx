"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"

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
  imageUrl: z.string().url().optional().or(z.literal('')),
  university: z.string(),
})

type ReportItemFormProps = {
  type: 'lost' | 'found';
  university: string;
}

export function ReportItemForm({ type, university }: ReportItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      contact: "",
      imageUrl: "",
      university: university,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values) // In a real app, this would submit to a backend.
    toast({
      title: `Item ${type === 'lost' ? 'Lost' : 'Found'} Reported!`,
      description: "Thank you! Your report has been submitted.",
    });
    router.push('/dashboard');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo (Optional)</FormLabel>
              <FormControl>
                <Input type="file" className="text-muted-foreground file:text-foreground" />
              </FormControl>
               <FormDescription>
                Uploading a photo greatly increases the chance of recovery.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full md:w-auto">Submit Report</Button>
      </form>
    </Form>
  )
}
