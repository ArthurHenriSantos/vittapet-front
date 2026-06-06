export type UserRole = 'vet' | 'owner';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  ownerId?: string; // If role is 'owner', links to an Owner record
}

export interface Vet {
  id: string;
  name: string;
  specialty: string;
  email: string;
  password?: string;
}

export interface Owner {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password?: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  weightKg: number;
  isActive: boolean;
  age?: number;
}

export interface Appointment {
  id: string;
  petId: string;
  vetId: string;
  date: string;
  time: string;
  reason: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  followUpDate?: string;
  recordedAt: string;
}

