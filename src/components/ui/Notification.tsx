import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../hooks/useNotification';

export function Notification() {
  const { notification } = useNotification();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-8 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'error' && <AlertCircle size={16} />}
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
