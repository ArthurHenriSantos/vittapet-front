import { Owner, Pet, Appointment, MedicalRecord } from '../types';

const REGISTRATION_API = import.meta.env.VITE_REGISTRATION_API_URL || 'http://localhost:5290';
const APPOINTMENT_API = import.meta.env.VITE_APPOINTMENT_API_URL || 'http://localhost:5289';

// Fetch wrappers
async function request(url: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        const text = await response.text().catch(() => '');
        if (text) {
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Falha na conexão com o servidor. O backend está online?');
    }
    throw err;
  }
}

// Data mapping functions
export function mapOwnerToFrontend(apiOwner: any): Owner {
  return {
    id: apiOwner.id,
    name: apiOwner.fullName,
    cpf: apiOwner.cpf,
    email: apiOwner.email,
    phone: apiOwner.phone,
  };
}

export function mapOwnerToBackend(owner: Omit<Owner, 'id'> | Owner): any {
  return {
    fullName: owner.name,
    cpf: owner.cpf,
    email: owner.email,
    phone: owner.phone,
    password: (owner as any).password || 'senhaSegura123',
  };
}

const speciesMapToFrontend: Record<number, string> = {
  0: 'Cão',
  1: 'Gato',
  2: 'Ave',
  3: 'Peixe',
  4: 'Exótico',
};

const speciesMapToBackend: Record<string, number> = {
  'cão': 0,
  'cao': 0,
  'dog': 0,
  'cão/dog': 0,
  'cachorro': 0,
  'gato': 1,
  'cat': 1,
  'ave': 2,
  'bird': 2,
  'pássaro': 2,
  'passaro': 2,
  'peixe': 3,
  'fish': 3,
  'exótico': 4,
  'exotico': 4,
  'exotic': 4,
};

export function mapPetToFrontend(apiPet: any): Pet {
  const birthYear = apiPet.birthDate ? new Date(apiPet.birthDate).getFullYear() : new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - birthYear);

  return {
    id: apiPet.id,
    ownerId: apiPet.ownerId,
    name: apiPet.name,
    species: speciesMapToFrontend[apiPet.species] || 'Cão',
    breed: apiPet.breed || '',
    age: age,
  };
}

export function mapPetToBackend(pet: Omit<Pet, 'id'> | Pet): any {
  const speciesKey = (pet.species || '').toLowerCase().trim();
  const speciesCode = speciesMapToBackend[speciesKey] !== undefined ? speciesMapToBackend[speciesKey] : 0;
  
  const age = pet.age || 0;
  const birthYear = new Date().getFullYear() - age;
  const birthDate = new Date(birthYear, 0, 1).toISOString();

  return {
    ownerId: pet.ownerId,
    name: pet.name,
    species: speciesCode,
    breed: pet.breed || 'SRD',
    birthDate: birthDate,
    weightKg: 10.0,
    isActive: true,
  };
}

const statusMapToFrontend: Record<number, Appointment['status']> = {
  0: 'Pendente',
  1: 'Em Andamento',
  2: 'Concluído',
  3: 'Cancelado',
  4: 'Cancelado',
};

export function mapAppointmentToFrontend(apiApp: any): Appointment {
  let date = '';
  let time = '';
  if (apiApp.scheduledStart) {
    const parts = apiApp.scheduledStart.split('T');
    date = parts[0];
    if (parts[1]) {
      time = parts[1].slice(0, 5);
    }
  }
  return {
    id: apiApp.id,
    petId: apiApp.petId,
    vetId: apiApp.veterinarianId,
    date: date,
    time: time,
    reason: apiApp.reason || '',
    status: statusMapToFrontend[apiApp.status] || 'Pendente',
  };
}

export function mapAppointmentToBackend(app: Omit<Appointment, 'id' | 'status'> | Appointment, ownerId: string): any {
  const date = app.date;
  const time = app.time;
  const scheduledStart = new Date(`${date}T${time}:00`).toISOString();
  const endDate = new Date(new Date(`${date}T${time}:00`).getTime() + 30 * 60 * 1000);
  const scheduledEnd = endDate.toISOString();

  return {
    petId: app.petId,
    ownerId: ownerId,
    veterinarianId: app.vetId,
    scheduledStart: scheduledStart,
    scheduledEnd: scheduledEnd,
    reason: app.reason || 'Consulta',
    notes: 'Agendado via frontend VittaPet',
  };
}

// Owners API Service
export const ownerService = {
  async getAll(): Promise<Owner[]> {
    const data = await request(`${REGISTRATION_API}/Owner`);
    return Array.isArray(data) ? data.map(mapOwnerToFrontend) : [];
  },

  async getById(id: string): Promise<Owner> {
    const data = await request(`${REGISTRATION_API}/Owner/${id}`);
    return mapOwnerToFrontend(data);
  },

  async create(owner: Omit<Owner, 'id'>): Promise<string> {
    const body = mapOwnerToBackend(owner);
    const id = await request(`${REGISTRATION_API}/Owner`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return id.replace(/"/g, '');
  },

  async update(id: string, email: string, phone: string, password?: string): Promise<void> {
    await request(`${REGISTRATION_API}/Owner/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ email, phone, password: password || 'senhaSegura123' }),
    });
  },

  async delete(id: string): Promise<void> {
    await request(`${REGISTRATION_API}/Owner/${id}`, {
      method: 'DELETE',
    });
  },
};

// Pets API Service
export const petService = {
  async getAll(): Promise<Pet[]> {
    const data = await request(`${REGISTRATION_API}/Pet`);
    return Array.isArray(data) ? data.map(mapPetToFrontend) : [];
  },

  async getById(id: string): Promise<Pet> {
    const data = await request(`${REGISTRATION_API}/Pet/${id}`);
    return mapPetToFrontend(data);
  },

  async create(pet: Omit<Pet, 'id'>): Promise<string> {
    const body = mapPetToBackend(pet);
    const id = await request(`${REGISTRATION_API}/Pet`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return id.replace(/"/g, '');
  },

  async update(id: string, name: string, weightKg: number, isActive: boolean): Promise<void> {
    await request(`${REGISTRATION_API}/Pet/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, weightKg, isActive }),
    });
  },

  async delete(id: string): Promise<void> {
    await request(`${REGISTRATION_API}/Pet/${id}`, {
      method: 'DELETE',
    });
  },
};

// Appointments API Service
export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const data = await request(`${APPOINTMENT_API}/Appointment`);
    return Array.isArray(data) ? data.map(mapAppointmentToFrontend) : [];
  },

  async getById(id: string): Promise<Appointment> {
    const data = await request(`${APPOINTMENT_API}/Appointment/${id}`);
    return mapAppointmentToFrontend(data);
  },

  async create(app: Omit<Appointment, 'id' | 'status'>, ownerId: string): Promise<string> {
    const body = mapAppointmentToBackend(app, ownerId);
    const id = await request(`${APPOINTMENT_API}/Appointment`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return id.replace(/"/g, '');
  },

  async start(id: string): Promise<void> {
    await request(`${APPOINTMENT_API}/Appointment/${id}/start`, {
      method: 'PATCH',
    });
  },

  async complete(id: string): Promise<void> {
    await request(`${APPOINTMENT_API}/Appointment/${id}/complete`, {
      method: 'PATCH',
    });
  },

  async delete(id: string): Promise<void> {
    await request(`${APPOINTMENT_API}/Appointment/${id}`, {
      method: 'DELETE',
    });
  },
};

// Medical Records API Service
export const medicalRecordService = {
  async getAll(): Promise<MedicalRecord[]> {
    const data = await request(`${APPOINTMENT_API}/GetAllMedicalRecord`);
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<MedicalRecord> {
    return await request(`${APPOINTMENT_API}/GetMedicalRecord/${id}`);
  },

  async create(record: Omit<MedicalRecord, 'id'>): Promise<string> {
    const id = await request(`${APPOINTMENT_API}/CreateMedicalRecord`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
    return id.replace(/"/g, '');
  },

  async update(record: MedicalRecord): Promise<void> {
    await request(`${APPOINTMENT_API}/UpdateMedicalRecord`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  },

  async delete(id: string): Promise<void> {
    await request(`${APPOINTMENT_API}/DeleteMedicalRecord/${id}`, {
      method: 'DELETE',
    });
  },
};
