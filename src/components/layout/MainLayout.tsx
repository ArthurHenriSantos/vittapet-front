import React from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Notification } from '../ui/Notification';
import { useAuth } from '../../hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { activeTab } = useAuth();

  return (
    <div className="min-h-screen flex bg-vittabg">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8 relative">
        <Notification />

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
