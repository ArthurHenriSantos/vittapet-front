import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../hooks/useNotification';

export function Notification() {
  const { notification, clearNotification } = useNotification();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-8 z-50 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'error' && <AlertCircle size={16} />}
          <span>{notification.message}</span>
          <button 
            onClick={clearNotification}
            className="hover:bg-white/20 p-1 rounded-full transition-colors flex items-center justify-center cursor-pointer"
            title="Fechar"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
