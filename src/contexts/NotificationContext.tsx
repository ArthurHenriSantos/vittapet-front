import React, { createContext, useState, useCallback, useRef } from 'react';

interface Notification {
  message: string;
  type: 'success' | 'error';
}

interface NotificationContextType {
  notification: Notification | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  clearNotification: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setNotification(null);
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setNotification({ message, type });
    
    // Sucesso: 3.5 segundos. Erro: 10 segundos.
    const duration = type === 'error' ? 10000 : 3500;
    timeoutRef.current = setTimeout(() => {
      setNotification(null);
      timeoutRef.current = null;
    }, duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
