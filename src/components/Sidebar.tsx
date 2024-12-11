"use client";

import { useNotifications } from '@/contexts/NotificationContext';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <Link href="/notification">
        <div className="relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
} 