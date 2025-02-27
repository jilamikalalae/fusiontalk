import Link from 'next/link';
import {
  Package2,
  PanelLeft,
  CircleUserRound
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Analytics } from '@vercel/analytics/react';
import Providers from './providers';
import { NavItem } from './nav-item';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex h-16 items-center border-b bg-background px-4 sm:hidden">
          <MobileNav />
          <div className="ml-auto flex items-center space-x-4">
            <Link href="/account">
              <CircleUserRound className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
  
        <NavItem href="/line" label="Line">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/640px-LINE_logo.svg.png" className="h-5 w-5" alt="Line logo" />
        </NavItem>

        <NavItem href="/messenger" label="Messenger">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/1200px-Facebook_Messenger_logo_2020.svg.png" className="h-5 w-5" alt="Messenger logo" />
        </NavItem>

        <NavItem href="/account" label="Account">
          <CircleUserRound className="h-5 w-5" />
        </NavItem>
      </nav>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <SheetTitle>Navigation Menu</SheetTitle>
        <SheetDescription>
          Access your messaging platforms and account settings.
        </SheetDescription>
        <nav className="grid gap-6 text-lg font-medium mt-6">
          <Link
            href="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">FusionTalk</span>
          </Link>
          
          <Link
            href="/line"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/640px-LINE_logo.svg.png" className="h-5 w-5" alt="Line logo" />
            Line
          </Link>
          
          <Link
            href="/messenger"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/1200px-Facebook_Messenger_logo_2020.svg.png" className="h-5 w-5" alt="Messenger logo" />
            Messenger
          </Link>
          
          <Link
            href="/account"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <CircleUserRound className="h-5 w-5" />
            Account
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}