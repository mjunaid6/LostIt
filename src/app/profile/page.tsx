'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link';

import Header from '@/components/header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Mail, Building, Phone, Loader2, Edit, X, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  university: z.string().min(1, 'Please select a university.'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getInitials(name: string) {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 0) return '';
    const firstInitial = names[0]?.[0] || '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      university: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        university: user.university,
        phone: user.phone || '',
      });
    }
  }, [user, form, isEditing]);

  if (!user) {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-2xl">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <Skeleton className="h-8 w-48" />
                         <Skeleton className="h-10 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-5 w-52" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
      </div>
    );
  }

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

  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
  };
  
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      await updateUserProfile({ ...data, imageFile });
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => (
    <div className="flex items-center gap-4 text-sm">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
            <p className="font-medium">{label}</p>
            <p className="text-muted-foreground">{value || 'Not provided'}</p>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <Header user={user} />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="mb-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back to Dashboard
              </Link>
            </Button>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-headline">Your Profile</CardTitle>
                <CardDescription>View and edit your personal information.</CardDescription>
              </div>
              {!isEditing ? (
                 <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleCancel}><X className="mr-2 h-4 w-4"/>Cancel</Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Changes
                    </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={imagePreview || user.avatar} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        {isEditing ? (
                             <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="picture">Profile Photo</Label>
                                <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} />
                            </div>
                        ) : (
                            <div className="text-left">
                                <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {isEditing ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" {...form.register('name')} />
                                    {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={user.email} disabled />
                                </div>
                                <div className="space-y-2">
                                     <Label htmlFor="university">University</Label>
                                    <Select onValueChange={(value) => form.setValue('university', value)} defaultValue={user.university}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your university" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Jamia Milia Islamia(JMI)">Jamia Milia Islamia (JMI)</SelectItem>
                                            <SelectItem value="Delhi Technological University(DTU)">Delhi Technological University (DTU)</SelectItem>
                                            <SelectItem value="Netaji Subhash University of technology(NSUT)">Netaji Subhash University of technology (NSUT)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                     {form.formState.errors.university && <p className="text-sm text-destructive">{form.formState.errors.university.message}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                                    <Input id="phone" {...form.register('phone')} />
                                </div>
                            </>
                        ) : (
                            <>
                                <InfoRow icon={UserIcon} label="Name" value={user.name} />
                                <InfoRow icon={Mail} label="Email" value={user.email} />
                                <InfoRow icon={Building} label="University" value={user.university} />
                                <InfoRow icon={Phone} label="Phone Number" value={user.phone} />
                            </>
                        )}
                    </div>
                </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
