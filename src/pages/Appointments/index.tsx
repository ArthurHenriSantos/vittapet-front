import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Appointment } from '../../types';

function getStatusColor(status: Appointment['status']) {
  switch (status) {
    case 'Concluído': return 'text-emerald-600 bg-emerald-50';
    case 'Em Andamento': return 'text-amber-600 bg-amber-50';
    case 'Cancelado': return 'text-red-600 bg-red-50';
    default: return 'text-slate-600 bg-slate-100';
  }
}

function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 8; h <= 18; h++) {
    const hourStr = h.toString().padStart(2, '0');
    slots.push(`${hourStr}:00`);
    if (h < 18) slots.push(`${hourStr}:30`);
  }
  return slots;
}

const timeSlots = generateTimeSlots();

export default function Appointments() {
  const { currentUser } = useAuth();
  const { pets, vets, appointments, addAppointment, deleteAppointment, updateAppointmentStatus } = useData();

  const isOwner = currentUser?.role === 'owner';
  const isVet = currentUser?.role === 'vet';
  const currentOwnerId = currentUser?.ownerId;

  const filteredPets = isOwner ? pets.filter(p => p.ownerId === currentOwnerId) : pets;
  
  // Show only appointments where this veterinarian is selected
  const filteredAppointments = isOwner
    ? appointments.filter(app => {
        const pet = pets.find(p => p.id === app.petId);
        return pet?.ownerId === currentOwnerId;
      })
    : isVet
      ? appointments.filter(app => app.vetId === currentUser?.id)
      : appointments;

  const [formData, setFormData] = useState({ petId: '', vetId: '', date: '', time: '', reason: '' });

  // Get booked time slots for the selected vet and date (ignoring cancelled appointments)
  const bookedSlotsForSelectedVetAndDate = formData.vetId && formData.date
    ? appointments
        .filter(app => app.vetId === formData.vetId && app.date === formData.date && app.status !== 'Cancelado')
        .map(app => app.time)
    : [];

  const availableTimeSlots = timeSlots.filter(slot => !bookedSlotsForSelectedVetAndDate.includes(slot));

  // Reset selected time if it becomes unavailable due to changing the vet or date
  useEffect(() => {
    if (formData.time && !availableTimeSlots.includes(formData.time)) {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  }, [availableTimeSlots, formData.time]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petId || !formData.vetId || !formData.date || !formData.time) return;
    addAppointment(formData);
    setFormData({ petId: '', vetId: '', date: '', time: '', reason: '' });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Agendamento de Consultas</h2>

      {isOwner && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus size={18} /> Novo Agendamento
          </h3>
          {filteredPets.length === 0 ? (
            <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> Você precisa ter pelo menos um pet cadastrado!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Selecione o Pet</label>
                <select
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen"
                  value={formData.petId} onChange={e => setFormData({ ...formData, petId: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {filteredPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Selecione o Veterinário</label>
                <select
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen"
                  value={formData.vetId} onChange={e => setFormData({ ...formData, vetId: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {vets.map(v => <option key={v.id} value={v.id}>{v.name} ({v.specialty})</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Data</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen"
                  value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Horário (Janelas de 30min)</label>
                <select
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen"
                  value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                  required
                >
                  <option value="">Selecione o horário...</option>
                  {availableTimeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>

              <div className="lg:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Motivo da Consulta</label>
                <input
                  type="text" placeholder="Ex: Vacinação, Check-up"
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen"
                  value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <button type="submit" className="w-full bg-vittagreen text-white rounded-lg py-3 text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-600">Pet</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Veterinário</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Data/Hora</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Motivo</th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAppointments.map(a => {
              const pet = pets.find(p => p.id === a.petId);
              const vet = vets.find(v => v.id === a.vetId);
              return (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{pet?.name}</p>
                    <p className="text-[10px] text-slate-400">ID: {a.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{vet?.name}</p>
                    <p className="text-[10px] text-slate-400 italic">{vet?.specialty}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{new Date(a.date).toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-slate-400 font-mono">{a.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(a.status)}`}>
                      {a.status || 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">{a.reason || 'Consulta geral'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isVet && a.status !== 'Concluído' && a.status !== 'Cancelado' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateAppointmentStatus(a.id, 'Em Andamento')}
                            className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition-colors"
                          >
                            Iniciar
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(a.id, 'Concluído')}
                            className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 transition-colors"
                          >
                            Concluir
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(a.id, 'Cancelado')}
                            className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => deleteAppointment(a.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Cancelar Consulta"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredAppointments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar size={32} className="text-slate-200" />
                    <p>Nenhum agendamento encontrado.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
