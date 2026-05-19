import React from 'react';
import { User, Dog, Calendar, LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import logoImg from '../vittapet_logo_sidebar.png';
import { useAuth } from '../../hooks/useAuth';

function SidebarLink({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
        active
          ? 'bg-vittagreen/10 text-vittagreen font-semibold'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function Sidebar() {
  const { currentUser, activeTab, setActiveTab, handleLogout } = useAuth();

  if (!currentUser) return null;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6">
        <img 
          src={logoImg} 
          alt="VittaPet" 
          className="h-12 w-auto object-contain" 
        />
        <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-1.5 ml-0.5 leading-tight uppercase font-sans">
          Cuidado que conecta. Amor que permanece.
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <SidebarLink
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
          icon={<User size={20} />}
          label="Geral"
        />
        {currentUser.role === 'vet' && (
          <SidebarLink
            active={activeTab === 'owners'}
            onClick={() => setActiveTab('owners')}
            icon={<User size={20} />}
            label="Donos"
          />
        )}
        <SidebarLink
          active={activeTab === 'pets'}
          onClick={() => setActiveTab('pets')}
          icon={<Dog size={20} />}
          label="Pets"
        />
        <SidebarLink
          active={activeTab === 'appointments'}
          onClick={() => setActiveTab('appointments')}
          icon={<Calendar size={20} />}
          label="Consultas"
        />
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            {currentUser.role === 'vet' ? <ShieldCheck size={18} /> : <UserCircle size={18} />}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-700 truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-400 capitalize">{currentUser.role === 'vet' ? 'Veterinário' : 'Dono'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}
