import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Calendar, FileText, ClipboardList } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Appointment, MedicalRecord } from '../../types';

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
  const { pets, vets, appointments, medicalRecords, addAppointment, deleteAppointment, updateAppointmentStatus, addMedicalRecord } = useData();

  const isOwner = currentUser?.role === 'owner';
  const isVet = currentUser?.role === 'vet';
  const currentOwnerId = currentUser?.ownerId;

  const filteredPets = isOwner ? pets.filter(p => p.ownerId === currentOwnerId) : pets;
  
  const filteredAppointments = isOwner
    ? appointments.filter(app => {
        const pet = pets.find(p => p.id === app.petId);
        return pet?.ownerId === currentOwnerId;
      })
    : isVet
      ? appointments.filter(app => app.vetId === currentUser?.id)
      : appointments;

  const [formData, setFormData] = useState({ petId: '', vetId: '', date: '', time: '', reason: '', notes: '' });

  // States for MedicalRecord Modals
  const [showRecordModal, setShowRecordModal] = useState<string | null>(null); // appointmentId
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Form states for Medical Record
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescriptionsText, setPrescriptionsText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

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
    setFormData({ petId: '', vetId: '', date: '', time: '', reason: '', notes: '' });
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRecordModal) return;

    const prescriptions = prescriptionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Salvar o prontuário no microsserviço de agendamento
    await addMedicalRecord({
      appointmentId: showRecordModal,
      diagnosis,
      treatment,
      prescriptions,
      followUpDate: followUpDate || undefined,
    });

    // Concluir a consulta no microsserviço
    await updateAppointmentStatus(showRecordModal, 'Concluído');

    // Fechar modal e resetar form
    setShowRecordModal(null);
    setDiagnosis('');
    setTreatment('');
    setPrescriptionsText('');
    setFollowUpDate('');
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
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen bg-white"
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
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen bg-white"
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
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen bg-white"
                  value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                  required
                >
                  <option value="">Selecione o horário...</option>
                  {availableTimeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Motivo da Consulta</label>
                <input
                  type="text" placeholder="Ex: Vacinação, Check-up"
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen"
                  value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Observações (Notes)</label>
                <input
                  type="text" placeholder="Instruções ou sintomas adicionais..."
                  className="w-full border p-2 rounded-lg text-sm outline-vittagreen"
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <button type="submit" className="w-full md:w-auto px-6 bg-vittagreen text-white rounded-lg py-3 text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-600">Pet</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Veterinário</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Data/Hora</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Motivo / Notas</th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAppointments.map(a => {
              const pet = pets.find(p => p.id === a.petId);
              const vet = vets.find(v => v.id === a.vetId);
              const hasRecord = medicalRecords.some(r => r.appointmentId === a.id);
              const record = medicalRecords.find(r => r.appointmentId === a.id);

              return (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{pet?.name || 'Pet Excluído'}</p>
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
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-slate-700 font-medium truncate">{a.reason || 'Consulta geral'}</p>
                    {a.notes && <p className="text-xs text-slate-400 italic truncate">Obs: {a.notes}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isVet && a.status !== 'Concluído' && a.status !== 'Cancelado' && (
                        <div className="flex gap-1">
                          {a.status !== 'Em Andamento' && (
                            <button
                              onClick={() => updateAppointmentStatus(a.id, 'Em Andamento')}
                              className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1.5 rounded hover:bg-amber-200 transition-colors"
                            >
                              Iniciar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Abre formulário para registrar prontuário
                              setShowRecordModal(a.id);
                            }}
                            className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1.5 rounded hover:bg-emerald-200 transition-colors"
                          >
                            Concluir
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(a.id, 'Cancelado')}
                            className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-1.5 rounded hover:bg-red-200 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {/* Botão para Visualizar Prontuário */}
                      {a.status === 'Concluído' && hasRecord && (
                        <button
                          onClick={() => setSelectedRecord(record || null)}
                          className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-vittagreen px-2.5 py-1.5 rounded border border-emerald-200/50 hover:bg-emerald-100 transition-colors"
                          title="Visualizar Prontuário Médico"
                        >
                          <FileText size={12} /> Prontuário
                        </button>
                      )}

                      {isOwner && a.status === 'Pendente' && (
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

      {/* Modal: Registrar Prontuário Médico */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardList className="text-vittagreen" /> Registrar Prontuário Médico
            </h3>
            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Diagnóstico</label>
                <input
                  type="text"
                  className="w-full border p-2.5 rounded-lg text-sm outline-vittagreen"
                  placeholder="Ex: Otite canina bilateral"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tratamento</label>
                <textarea
                  className="w-full border p-2.5 rounded-lg text-sm outline-vittagreen h-20 resize-none"
                  placeholder="Ex: Limpeza diária e aplicação de gotas otológicas"
                  value={treatment}
                  onChange={e => setTreatment(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prescrições (Uma por linha)</label>
                <textarea
                  className="w-full border p-2.5 rounded-lg text-sm outline-vittagreen h-24"
                  placeholder="Ex: Otoguard 5 gotas a cada 12h por 7 dias&#10;Prediderm 5mg 1 cp por dia por 5 dias"
                  value={prescriptionsText}
                  onChange={e => setPrescriptionsText(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data de Retorno</label>
                <input
                  type="date"
                  className="w-full border p-2.5 rounded-lg text-sm outline-vittagreen"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(null)}
                  className="flex-1 border border-slate-300 text-slate-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-vittagreen text-white rounded-lg py-2.5 text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  Salvar e Concluir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Prontuário Médico */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="text-vittagreen" /> Prontuário Médico
            </h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Diagnóstico</span>
                <p className="mt-1 text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedRecord.diagnosis}</p>
              </div>
              {selectedRecord.treatment && (
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Tratamento</span>
                  <p className="mt-1 text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedRecord.treatment}</p>
                </div>
              )}
              {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Prescrição / Medicamentos</span>
                  <ul className="mt-1 list-disc list-inside space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedRecord.prescriptions.map((p, idx) => (
                      <li key={idx} className="text-slate-800">{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedRecord.followUpDate && (
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Data de Retorno</span>
                  <p className="mt-1 text-slate-800 font-medium">
                    {new Date(selectedRecord.followUpDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              <div className="pt-2 text-right text-[10px] text-slate-400 border-t border-slate-100">
                Registrado em: {new Date(selectedRecord.recordedAt).toLocaleString('pt-BR')}
              </div>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-6 w-full py-3 bg-vittagreen text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-vittagreen/20"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
