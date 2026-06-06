import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Dog, Edit3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

export default function Pets() {
  const { currentUser } = useAuth();
  const { pets, owners, addPet, updatePet, deletePet } = useData();

  const isOwner = currentUser?.role === 'owner';
  const currentOwnerId = currentUser?.ownerId;

  const filteredPets = isOwner ? pets.filter(p => p.ownerId === currentOwnerId) : pets;

  const [editingPetId, setEditingPetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    ownerId: currentOwnerId || '',
    species: 'Cão',
    breed: '',
    birthDate: '',
    weightKg: '',
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ownerId) return;

    if (editingPetId) {
      updatePet(editingPetId, formData.name, Number(formData.weightKg), formData.isActive);
      setEditingPetId(null);
    } else {
      addPet({
        ownerId: formData.ownerId,
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        birthDate: formData.birthDate,
        weightKg: Number(formData.weightKg),
        isActive: formData.isActive,
      });
    }

    setFormData({
      name: '',
      ownerId: currentOwnerId || '',
      species: 'Cão',
      breed: '',
      birthDate: '',
      weightKg: '',
      isActive: true,
    });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Gestão de Pets</h2>

      {isOwner && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            {editingPetId ? <Edit3 size={18} /> : <Plus size={18} />} 
            {editingPetId ? 'Editar Informações do Pet' : (currentOwnerId ? 'Cadastrar Meu Pet' : 'Novo Pet')}
          </h3>
          {owners.length === 0 && !currentOwnerId ? (
            <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> Cadastre um dono primeiro!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Nome do Pet</label>
                <input
                  type="text" placeholder="Nome"
                  className="border p-2.5 rounded-lg text-sm outline-vittagreen"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {!currentOwnerId && (
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-slate-400 ml-1">Dono</label>
                  <select
                    className="border p-2.5 rounded-lg text-sm outline-vittagreen bg-white"
                    value={formData.ownerId} onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                    required
                    disabled={!!editingPetId}
                  >
                    <option value="">Selecione...</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Espécie</label>
                <select
                  className="border p-2.5 rounded-lg text-sm outline-vittagreen bg-white"
                  value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })}
                  required
                  disabled={!!editingPetId}
                >
                  <option value="Cão">Cão</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Peixe">Peixe</option>
                  <option value="Exótico">Exótico</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Raça</label>
                <input
                  type="text" placeholder="Ex: Poodle, Persa"
                  className="border p-2.5 rounded-lg text-sm outline-vittagreen"
                  value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })}
                  required
                  disabled={!!editingPetId}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Data de Nascimento</label>
                <input
                  type="date"
                  className="border p-2.5 rounded-lg text-sm outline-vittagreen"
                  value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  required
                  disabled={!!editingPetId}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Peso (Kg)</label>
                <input
                  type="number" step="0.1" placeholder="Ex: 5.4"
                  className="border p-2.5 rounded-lg text-sm outline-vittagreen"
                  value={formData.weightKg} onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox" id="isActive"
                  className="rounded text-vittagreen focus:ring-vittagreen h-4 w-4"
                  checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-600 select-none">Pet Ativo</label>
              </div>

              <div className="flex items-end gap-2 md:col-span-3 lg:col-span-1">
                <button type="submit" className="flex-1 bg-vittagreen text-white rounded-lg py-3 text-sm font-bold hover:bg-emerald-700 transition-colors">
                  {editingPetId ? 'Salvar' : 'Cadastrar'}
                </button>
                {editingPetId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPetId(null);
                      setFormData({ name: '', ownerId: currentOwnerId || '', species: 'Cão', breed: '', birthDate: '', weightKg: '', isActive: true });
                    }}
                    className="border border-slate-300 text-slate-600 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPets.map(p => {
          const owner = owners.find(o => o.id === p.ownerId);
          return (
            <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 group relative shadow-sm">
              {isOwner && (
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingPetId(p.id);
                      setFormData({
                        name: p.name,
                        ownerId: p.ownerId,
                        species: p.species,
                        breed: p.breed,
                        birthDate: p.birthDate || '',
                        weightKg: String(p.weightKg || ''),
                        isActive: p.isActive,
                      });
                    }}
                    className="text-slate-400 hover:text-vittagreen transition-colors"
                    title="Editar Pet"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => deletePet(p.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Remover Pet"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-50 p-2.5 rounded-lg text-vittagreen">
                  <Dog size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800">{p.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {p.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 capitalize">{p.species} • {p.breed}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-3 border-t border-slate-50">
                <div>
                  <span className="font-medium text-slate-400">Idade:</span> {p.age} {p.age === 1 ? 'ano' : 'anos'}
                </div>
                <div>
                  <span className="font-medium text-slate-400">Peso:</span> {p.weightKg} kg
                </div>
                {p.birthDate && (
                  <div className="col-span-2">
                    <span className="font-medium text-slate-400">Nascimento:</span> {new Date(p.birthDate).toLocaleDateString('pt-BR')}
                  </div>
                )}
                {!currentOwnerId && (
                  <div className="col-span-2 pt-1">
                    <span className="font-medium text-slate-400">Dono:</span> {owner?.name || 'Não cadastrado'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredPets.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            Nenhum pet cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
