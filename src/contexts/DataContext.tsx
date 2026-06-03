import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Owner, Pet, Appointment, Vet } from '../types';
import { NotificationContext } from './NotificationContext';
import { ownerService, petService, appointmentService } from '../services/api';

interface DataContextType {
  vets: Vet[];
  owners: Owner[];
  pets: Pet[];
  appointments: Appointment[];
  setOwners: React.Dispatch<React.SetStateAction<Owner[]>>;
  setVets: React.Dispatch<React.SetStateAction<Vet[]>>;
  addOwner: (owner: Omit<Owner, 'id'>) => Promise<void> | void;
  addPet: (pet: Omit<Pet, 'id'>) => Promise<void> | void;
  deletePet: (petId: string) => Promise<void> | void;
  addAppointment: (app: Omit<Appointment, 'id' | 'status'>) => Promise<void> | void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void> | void;
  deleteAppointment: (id: string) => Promise<void> | void;
  refreshData: () => Promise<void>;
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

  // Function to reload data from API
  const refreshData = useCallback(async () => {
    try {
      const [ownersData, petsData, appointmentsData] = await Promise.all([
        ownerService.getAll(),
        petService.getAll(),
        appointmentService.getAll(),
      ]);
      setOwners(ownersData);
      setPets(petsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Failed to refresh data from APIs:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [ownersData, petsData, appointmentsData] = await Promise.all([
          ownerService.getAll(),
          petService.getAll(),
          appointmentService.getAll(),
        ]);
        setOwners(ownersData);
        setPets(petsData);
        setAppointments(appointmentsData);
      } catch (err: any) {
        console.error('Failed to load initial data from backend APIs:', err);
        showNotification(err.message || 'Erro ao conectar com as APIs do servidor. Verifique se o backend está rodando.', 'error');
      }
    }
    loadData();
  }, [showNotification]);

  const addOwner = useCallback(async (owner: Omit<Owner, 'id'>) => {
    if (owners.some(o => o.cpf === owner.cpf)) {
      showNotification('Este CPF já está cadastrado!', 'error');
      return;
    }
    try {
      await ownerService.create(owner);
      await refreshData();
      showNotification('Dono cadastrado com sucesso!');
    } catch (err: any) {
      console.error('Failed to add owner:', err);
      showNotification(err.message || 'Erro ao cadastrar dono no servidor.', 'error');
    }
  }, [owners, refreshData, showNotification]);

  const addPet = useCallback(async (pet: Omit<Pet, 'id'>) => {
    try {
      await petService.create(pet);
      await refreshData();
      showNotification('Pet cadastrado com sucesso!');
    } catch (err: any) {
      console.error('Failed to add pet:', err);
      showNotification(err.message || 'Erro ao cadastrar pet no servidor.', 'error');
    }
  }, [refreshData, showNotification]);

  const deletePet = useCallback(async (petId: string) => {
    const hasFutureAppointments = appointments.some(app => {
      const appDate = new Date(`${app.date}T${app.time}`);
      return app.petId === petId && appDate > new Date() && app.status !== 'Cancelado';
    });

    if (hasFutureAppointments) {
      showNotification('Não é possível excluir um pet com consultas futuras!', 'error');
      return;
    }

    try {
      await petService.delete(petId);
      await refreshData();
      showNotification('Pet removido!');
    } catch (err: any) {
      console.error('Failed to delete pet:', err);
      showNotification(err.message || 'Erro ao remover pet do servidor.', 'error');
    }
  }, [appointments, refreshData, showNotification]);

  const addAppointment = useCallback(async (app: Omit<Appointment, 'id' | 'status'>) => {
    const [hours, minutes] = app.time.split(':').map(Number);
    if (minutes !== 0 && minutes !== 30) {
      showNotification('As consultas devem ser agendadas em intervalos de 30 minutos (ex: 10:00 ou 10:30).', 'error');
      return;
    }

    const hasConflict = appointments.some(a => a.date === app.date && a.time === app.time && a.vetId === app.vetId && a.status !== 'Cancelado');
    if (hasConflict) {
      showNotification('Já existe uma consulta para este veterinário neste horário!', 'error');
      return;
    }

    const pet = pets.find(p => p.id === app.petId);
    if (!pet) {
      showNotification('Pet não encontrado para realizar o agendamento!', 'error');
      return;
    }

    try {
      await appointmentService.create(app, pet.ownerId);
      await refreshData();
      showNotification('Consulta agendada!');
    } catch (err: any) {
      console.error('Failed to add appointment:', err);
      showNotification(err.message || 'Erro ao agendar consulta no servidor.', 'error');
    }
  }, [appointments, pets, refreshData, showNotification]);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']) => {
    try {
      if (status === 'Em Andamento') {
        await appointmentService.start(id);
      } else if (status === 'Concluído') {
        await appointmentService.complete(id);
      } else if (status === 'Cancelado') {
        await appointmentService.delete(id);
      }
      await refreshData();
      showNotification(`Status da consulta atualizado para: ${status}`);
    } catch (err: any) {
      console.error('Failed to update appointment status:', err);
      showNotification(err.message || 'Erro ao atualizar status da consulta no servidor.', 'error');
    }
  }, [refreshData, showNotification]);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      await appointmentService.delete(id);
      await refreshData();
      showNotification('Consulta cancelada!');
    } catch (err: any) {
      console.error('Failed to delete appointment:', err);
      showNotification(err.message || 'Erro ao cancelar consulta no servidor.', 'error');
    }
  }, [refreshData, showNotification]);

  return (
    <DataContext.Provider value={{
      vets, owners, pets, appointments,
      setOwners, setVets,
      addOwner, addPet, deletePet,
      addAppointment, updateAppointmentStatus, deleteAppointment,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}
