import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import type { User } from "@/types";

type HeaderProps = {
  user: User;
};

export default function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 12v6"/><path d="M12 12h-1a2 2 0 0 0-2 2v2"/></svg>
            <span className="font-bold">LostIt</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button asChild variant="ghost">
              <Link href="/report-lost">Report Lost</Link>
            </Button>
            <Button asChild>
              <Link href="/report-found">Report Found</Link>
            </Button>
            <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
