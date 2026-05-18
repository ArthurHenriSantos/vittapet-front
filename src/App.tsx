import React from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Pets from './pages/Pets';
import Appointments from './pages/Appointments';

function AppRoutes() {
  const { currentUser, activeTab } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <MainLayout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'owners' && currentUser.role === 'vet' && <Owners />}
      {activeTab === 'pets' && <Pets />}
      {activeTab === 'appointments' && <Appointments />}
    </MainLayout>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <DataProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </DataProvider>
    </NotificationProvider>
  );
}
