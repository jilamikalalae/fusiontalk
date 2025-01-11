"use client";

import React, { createContext, useContext, useState } from 'react';

type NotificationContextType = {
  unreadCount: number;
  addUnreadMessage: () => void;
  clearUnreadMessages: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const addUnreadMessage = () => {
    setUnreadCount((prev) => prev + 1);
  };

  const clearUnreadMessages = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        unreadCount, 
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