import React, { createContext, useState, useContext, useCallback } from 'react';
import { User as AuthUser } from '../types';
import { NotificationContext } from './NotificationContext';
import { DataContext } from './DataContext';

interface AuthContextType {
  currentUser: AuthUser | null;
  activeTab: 'dashboard' | 'owners' | 'pets' | 'appointments' | 'profile';
  setActiveTab: React.Dispatch<React.SetStateAction<'dashboard' | 'owners' | 'pets' | 'appointments' | 'profile'>>;
  handleLogin: (user: AuthUser) => void;
  handleLogout: () => void;
  registerAndLogin: (data: any, role: 'vet' | 'owner') => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const notifCtx = useContext(NotificationContext);
  const dataCtx = useContext(DataContext);
  const showNotification = notifCtx?.showNotification ?? (() => {});

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'owners' | 'pets' | 'appointments' | 'profile'>('dashboard');

  const handleLogin = useCallback((user: AuthUser) => {
    setCurrentUser(user);
    showNotification(`Bem-vindo, ${user.name}!`);
  }, [showNotification]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    showNotification('Sessão encerrada.');
  }, [showNotification]);

  const registerAndLogin = useCallback(async (data: any, role: 'vet' | 'owner') => {
    if (!dataCtx) return;
    const { loadAllData } = dataCtx;

    if (role === 'owner') {
      try {
        const res = await fetch('http://localhost:5290/Owner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: data.name,
            cpf: data.cpf,
            email: data.email,
            password: data.password,
            phone: data.phone,
          }),
        });

        if (res.ok) {
          const ownerId = await res.json(); // GUID gerado
          await loadAllData();
          handleLogin({ id: ownerId, role: 'owner', name: data.name, ownerId: ownerId });
        } else {
          const errMsg = await res.text();
          showNotification(errMsg || 'Erro ao realizar cadastro.', 'error');
        }
      } catch (error) {
        showNotification('Erro de rede ao cadastrar dono.', 'error');
      }
    } else {
      try {
        const res = await fetch('http://localhost:5289/Veterinarian', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: data.name,
            crmv: data.crmv || '00000',
            email: data.email,
            password: data.password,
            specialties: data.specialty ? [data.specialty] : [],
          }),
        });

        if (res.ok) {
          const vetId = await res.json(); // GUID gerado
          await loadAllData();
          handleLogin({ id: vetId, role: 'vet', name: data.name });
        } else {
          const errMsg = await res.text();
          showNotification(errMsg || 'Erro ao realizar cadastro.', 'error');
        }
      } catch (error) {
        showNotification('Erro de rede ao cadastrar veterinário.', 'error');
      }
    }
  }, [dataCtx, showNotification, handleLogin]);

  return (
    <AuthContext.Provider value={{ currentUser, activeTab, setActiveTab, handleLogin, handleLogout, registerAndLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
