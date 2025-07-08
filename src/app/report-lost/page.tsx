'use client';
import Header from "@/components/header";
import { ReportItemForm } from "@/components/report-item-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReportLostPage() {
  return (
    <ProtectedRoute>
      <ReportLostContent />
    </ProtectedRoute>
  )
}

function ReportLostContent() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-1 bg-background/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back to Dashboard
                </Link>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-headline">Report a Lost Item</CardTitle>
                <CardDescription>
                  Fill out the form below with as much detail as possible to help others identify your item.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportItemForm type="lost" university={user.university} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
