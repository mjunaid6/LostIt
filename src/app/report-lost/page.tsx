import Header from "@/components/header";
import { ReportItemForm } from "@/components/report-item-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mockUser = {
  name: "Jane Doe",
  email: "jane@state-university.edu",
  university: "State University",
  avatar: "https://placehold.co/100x100.png"
};

export default function ReportLostPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={mockUser} />
      <main className="flex-1 bg-background/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">Report a Lost Item</CardTitle>
              <CardDescription>
                Fill out the form below with as much detail as possible to help others identify your item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportItemForm type="lost" university={mockUser.university} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
