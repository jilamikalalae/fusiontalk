"use client";

import React, { createContext, useContext, useState } from 'react';

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  addUnreadMessage: () => void;
  clearUnreadMessages: (contactId: string, source?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const addUnreadMessage = () => {
    setUnreadCount(prev => prev + 1);
  };

  const clearUnreadMessages = (contactId: string, source?: string) => {
    // You can use contactId and source if needed for more specific logic
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        unreadCount, 
        setUnreadCount, 
        addUnreadMessage, 
        clearUnreadMessages 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 