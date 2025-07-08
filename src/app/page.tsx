import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KeyRound, BookOpen, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center font-bold" prefetch={false}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 12v6"/><path d="M12 12h-1a2 2 0 0 0-2 2v2"/></svg>
          <span className="ml-2">LostIt</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <Link href="/login" prefetch={false}>
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/signup" prefetch={false}>
              Sign Up
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Lost Something on Campus?
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    LostIt helps you reconnect with your lost belongings. Report lost or found items in your university community.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup" prefetch={false}>
                      Report an Item
                    </Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="campus life students"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">How it Works</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Simple Way to Find Your Things</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is designed to make the process of finding lost items on campus as simple as possible.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="bg-primary/20 p-4 rounded-full">
                        <KeyRound className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Report Lost Item</h3>
                <p className="text-muted-foreground">
                  Quickly fill out a form with details about your lost item.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="bg-primary/20 p-4 rounded-full">
                        <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Browse Found Items</h3>
                <p className="text-muted-foreground">
                  Check the feed for items found by others in your university.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="bg-primary/20 p-4 rounded-full">
                        <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Get Notified</h3>
                <p className="text-muted-foreground">
                  Connect with the finder or owner to retrieve your item safely.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 LostIt. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
