import React, { createContext, useState, useCallback } from 'react';

interface Notification {
  message: string;
  type: 'success' | 'error';
}

interface NotificationContextType {
  notification: Notification | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
