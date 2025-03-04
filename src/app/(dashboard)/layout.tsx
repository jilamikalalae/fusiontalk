"use client";

import Link from 'next/link';
import {
  Package2,
  PanelLeft,
  CircleUserRound,
  Bell,
  MessageSquare
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Analytics } from '@vercel/analytics/react';
import Providers from './providers';
import { NavItem } from './nav-item';
import { Sidebar } from '@/components/Sidebar';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <Providers>
        <main className="flex min-h-screen w-full flex-col bg-muted/40">
          <div className="flex h-16 items-center border-b bg-background px-4 sm:hidden">
            <MobileNav />
            <div className="ml-auto flex items-center space-x-4">
              <Sidebar />
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
    </NotificationProvider>
  );
}

function DesktopNav() {
  const pathname = usePathname();
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <div className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
          <Link href="/" className="block">
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">FusionTalk</span>
          </Link>
        </div>
        
        <NavItemWithActive 
          href="/notification" 
          label="Notification Inbox" 
          isActive={pathname === '/notification'}
        >
          <MessageSquare className="h-5 w-5" />
        </NavItemWithActive>
        
        <NavItemWithActive 
          href="/line" 
          label="Line" 
          isActive={pathname === '/line'}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/640px-LINE_logo.svg.png" className="h-5 w-5" alt="Line logo" />
        </NavItemWithActive>

        <NavItemWithActive 
          href="/messenger" 
          label="Messenger" 
          isActive={pathname === '/messenger'}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/1200px-Facebook_Messenger_logo_2020.svg.png" className="h-5 w-5" alt="Messenger logo" />
        </NavItemWithActive>

        <NavItemWithActive 
          href="/account" 
          label="Account" 
          isActive={pathname === '/account'}
        >
          <CircleUserRound className="h-5 w-5" />
        </NavItemWithActive>
      </nav>
    </aside>
  );
}

function NavItemWithActive({ href, label, children, isActive }: { 
  href: string; 
  label: string; 
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <div className="relative group">
      <Link 
        href={href} 
        className={`flex items-center justify-center w-10 h-10 rounded-md ${
          isActive 
            ? 'bg-accent text-accent-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        {children}
      </Link>
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </div>
      {isActive && (
        <div className="absolute left-0 top-0 w-1 h-10 bg-primary rounded-r-md"></div>
      )}
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();
  
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
          <div className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
            <Link href="/" className="block">
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">FusionTalk</span>
            </Link>
          </div>
          
          <Link
            href="/notification"
            className={`flex items-center gap-4 px-2.5 py-2 rounded-md ${
              pathname === '/notification' 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Unified Inbox</span>
          </Link>
          
          <Link
            href="/line"
            className={`flex items-center gap-4 px-2.5 py-2 rounded-md ${
              pathname === '/line' 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/640px-LINE_logo.svg.png" className="h-5 w-5" alt="Line logo" />
            <span>Line</span>
          </Link>
          
          <Link
            href="/messenger"
            className={`flex items-center gap-4 px-2.5 py-2 rounded-md ${
              pathname === '/messenger' 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/1200px-Facebook_Messenger_logo_2020.svg.png" className="h-5 w-5" alt="Messenger logo" />
            <span>Messenger</span>
          </Link>
          
          <Link
            href="/account"
            className={`flex items-center gap-4 px-2.5 py-2 rounded-md ${
              pathname === '/account' 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CircleUserRound className="h-5 w-5" />
            <span>Account</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}