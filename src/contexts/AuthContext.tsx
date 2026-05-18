import React, { createContext, useState, useContext, useCallback } from 'react';
import { User as AuthUser } from '../types';
import { NotificationContext } from './NotificationContext';
import { DataContext } from './DataContext';

interface AuthContextType {
  currentUser: AuthUser | null;
  activeTab: 'dashboard' | 'owners' | 'pets' | 'appointments';
  setActiveTab: React.Dispatch<React.SetStateAction<'dashboard' | 'owners' | 'pets' | 'appointments'>>;
  handleLogin: (user: AuthUser) => void;
  handleLogout: () => void;
  registerAndLogin: (data: any, role: 'vet' | 'owner') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const notifCtx = useContext(NotificationContext);
  const dataCtx = useContext(DataContext);
  const showNotification = notifCtx?.showNotification ?? (() => {});

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'owners' | 'pets' | 'appointments'>('dashboard');

  const handleLogin = useCallback((user: AuthUser) => {
    setCurrentUser(user);
    showNotification(`Bem-vindo, ${user.name}!`);
  }, [showNotification]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    showNotification('Sessão encerrada.');
  }, [showNotification]);

  const registerAndLogin = useCallback((data: any, role: 'vet' | 'owner') => {
    if (!dataCtx) return;
    const { owners, setOwners, vets, setVets } = dataCtx;

    if (role === 'owner') {
      if (owners.some(o => o.cpf === data.cpf)) {
        showNotification('Este CPF já está cadastrado!', 'error');
        return;
      }
      const newOwner = { ...data, id: crypto.randomUUID() };
      setOwners(prev => [...prev, newOwner]);
      handleLogin({ id: newOwner.id, role: 'owner', name: newOwner.name, ownerId: newOwner.id });
    } else {
      if (vets.some(v => v.email === data.email)) {
        showNotification('Este email já está cadastrado!', 'error');
        return;
      }
      const newVet = { ...data, id: crypto.randomUUID() };
      setVets(prev => [...prev, newVet]);
      handleLogin({ id: newVet.id, role: 'vet', name: newVet.name });
    }
  }, [dataCtx, showNotification, handleLogin]);

  return (
    <AuthContext.Provider value={{ currentUser, activeTab, setActiveTab, handleLogin, handleLogout, registerAndLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
