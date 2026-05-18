import React from 'react';
import { User, Dog, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Appointment, Pet, Owner } from '../../types';

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { vets, owners, pets, appointments } = useData();

  if (!currentUser) return null;

  const role = currentUser.role;
  const now = new Date();

  const filteredPets = role === 'owner' ? pets.filter(p => p.ownerId === currentUser.ownerId) : pets;
  const filteredOwners = role === 'owner' ? owners.filter(o => o.id === currentUser.ownerId) : owners;
  const filteredAppointments = role === 'owner'
    ? appointments.filter(app => {
        const pet = pets.find(p => p.id === app.petId);
        return pet?.ownerId === currentUser.ownerId;
      })
    : appointments;

  const myAppointments = role === 'vet'
    ? filteredAppointments.filter(a => a.vetId === currentUser.id)
    : filteredAppointments;

  const sortedAppointments = [...myAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const upcoming = sortedAppointments.filter(a => {
    const isFuture = new Date(`${a.date}T${a.time}`) >= now;
    return isFuture && a.status !== 'Concluído' && a.status !== 'Cancelado';
  });

  const past = sortedAppointments.filter(a => {
    const isPast = new Date(`${a.date}T${a.time}`) < now;
    return isPast || a.status === 'Concluído' || a.status === 'Cancelado';
  }).reverse();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Olá, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="text-slate-500 mt-1">
          {role === 'vet'
            ? 'Aqui está o resumo da sua agenda e pacientes.'
            : 'Acompanhe a saúde e agendamentos dos seus pets.'}
        </p>
      </header>

      <div className={`grid grid-cols-1 ${role === 'vet' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        {role === 'vet' && (
          <StatCard title="Total de Donos" value={filteredOwners.length} icon={<User className="text-blue-500" />} />
        )}
        <StatCard title="Seus Pets" value={filteredPets.length} icon={<Dog className="text-vittagreen" />} />
        <StatCard title="Consultas Agendadas" value={filteredAppointments.length} icon={<Calendar className="text-vittablue" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-vittablue" /> Próximas Consultas
            </h2>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase">Agenda</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm italic">Nenhum agendamento futuro.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map(app => {
                const pet = filteredPets.find(p => p.id === app.petId);
                const owner = filteredOwners.find(o => o.id === pet?.ownerId);
                return (
                  <div key={app.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 group-hover:text-vittagreen transition-colors">{pet?.name}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter ${
                            app.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' :
                            app.status === 'Em Andamento' ? 'bg-amber-50 text-amber-600' :
                            app.status === 'Cancelado' ? 'bg-red-50 text-red-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {app.status || 'Pendente'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Dono(a): <span className="font-medium text-slate-700">{owner?.name || 'Não informado'}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-vittagreen">{new Date(app.date).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{app.time}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Motivo:</span>
                      <p className="text-xs text-slate-600 italic">"{app.reason || 'Consulta Geral'}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={20} className="text-slate-400" /> Consultas Realizadas
            </h2>
          </div>

          {past.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm italic">
              Nenhum histórico disponível.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {past.slice(0, 8).map(app => {
                const pet = filteredPets.find(p => p.id === app.petId);
                return (
                  <div key={app.id} className="py-3 flex justify-between items-center text-sm opacity-70 hover:opacity-100 transition-opacity">
                    <div>
                      <p className="font-bold text-slate-700">{pet?.name}</p>
                      <p className="text-[10px] text-slate-400">{app.reason || 'Check-up'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500">{new Date(app.date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-[10px] text-slate-400">{app.time}</p>
                    </div>
                  </div>
                );
              })}
              {past.length > 8 && (
                <p className="text-center text-[10px] text-slate-400 pt-4 cursor-pointer hover:text-vittagreen">Ver todo o histórico...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
