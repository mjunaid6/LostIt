'use client';
import Header from "@/components/header";
import { ReportItemForm } from "@/components/report-item-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";


export default function ReportFoundPage() {
  return (
    <ProtectedRoute>
      <ReportFoundContent />
    </ProtectedRoute>
  )
}

function ReportFoundContent() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-1 bg-background/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">Report a Found Item</CardTitle>
              <CardDescription>
                Thank you for being a good samaritan! Please provide details about the item you found.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportItemForm type="found" university={user.university} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
