import React, { createContext, useState, useContext, useCallback } from 'react';
import { Owner, Pet, Appointment, Vet } from '../types';
import { NotificationContext } from './NotificationContext';

interface DataContextType {
  vets: Vet[];
  owners: Owner[];
  pets: Pet[];
  appointments: Appointment[];
  setOwners: React.Dispatch<React.SetStateAction<Owner[]>>;
  setVets: React.Dispatch<React.SetStateAction<Vet[]>>;
  addOwner: (owner: Omit<Owner, 'id'>) => void;
  addPet: (pet: Omit<Pet, 'id'>) => void;
  deletePet: (petId: string) => void;
  addAppointment: (app: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  deleteAppointment: (id: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const notifCtx = useContext(NotificationContext);
  const showNotification = notifCtx?.showNotification ?? (() => {});

  const [vets, setVets] = useState<Vet[]>([
    { id: 'v1', name: 'Dr. Arthur', specialty: 'Clínica Geral', email: 'teste@gmail.com', password: '123' },
    { id: 'v2', name: 'Dra. Ana Silva', specialty: 'Neurologia', email: 'ana@vittapet.com', password: '123' },
    { id: 'v3', name: 'Dr. Marcos Souza', specialty: 'Cirurgia', email: 'marcos@vittapet.com', password: '123' },
  ]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const addOwner = useCallback((owner: Omit<Owner, 'id'>) => {
    if (owners.some(o => o.cpf === owner.cpf)) {
      showNotification('Este CPF já está cadastrado!', 'error');
      return;
    }
    const newOwner = { ...owner, id: crypto.randomUUID() };
    setOwners(prev => [...prev, newOwner]);
    showNotification('Dono cadastrado com sucesso!');
  }, [owners, showNotification]);

  const addPet = useCallback((pet: Omit<Pet, 'id'>) => {
    const newPet = { ...pet, id: crypto.randomUUID() };
    setPets(prev => [...prev, newPet]);
    showNotification('Pet cadastrado com sucesso!');
  }, [showNotification]);

  const deletePet = useCallback((petId: string) => {
    const hasFutureAppointments = appointments.some(app => {
      const appDate = new Date(`${app.date}T${app.time}`);
      return app.petId === petId && appDate > new Date();
    });

    if (hasFutureAppointments) {
      showNotification('Não é possível excluir um pet com consultas futuras!', 'error');
      return;
    }

    setPets(prev => prev.filter(p => p.id !== petId));
    setAppointments(prev => prev.filter(app => app.petId !== petId));
    showNotification('Pet removido!');
  }, [appointments, showNotification]);

  const addAppointment = useCallback((app: Omit<Appointment, 'id' | 'status'>) => {
    const [hours, minutes] = app.time.split(':').map(Number);
    if (minutes !== 0 && minutes !== 30) {
      showNotification('As consultas devem ser agendadas em intervalos de 30 minutos (ex: 10:00 ou 10:30).', 'error');
      return;
    }

    const hasConflict = appointments.some(a => a.date === app.date && a.time === app.time && a.vetId === app.vetId);
    if (hasConflict) {
      showNotification('Já existe uma consulta para este veterinário neste horário!', 'error');
      return;
    }

    const newApp: Appointment = { ...app, id: crypto.randomUUID(), status: 'Pendente' };
    setAppointments(prev => [...prev, newApp]);
    showNotification('Consulta agendada!');
  }, [appointments, showNotification]);

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    showNotification(`Status da consulta atualizado para: ${status}`);
  }, [showNotification]);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    showNotification('Consulta cancelada!');
  }, [showNotification]);

  return (
    <DataContext.Provider value={{
      vets, owners, pets, appointments,
      setOwners, setVets,
      addOwner, addPet, deletePet,
      addAppointment, updateAppointmentStatus, deleteAppointment,
    }}>
      {children}
    </DataContext.Provider>
  );
}
