import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Dog } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

export default function Pets() {
  const { currentUser } = useAuth();
  const { pets, owners, addPet, deletePet } = useData();

  const isOwner = currentUser?.role === 'owner';
  const currentOwnerId = currentUser?.ownerId;

  const filteredPets = isOwner ? pets.filter(p => p.ownerId === currentOwnerId) : pets;

  const [formData, setFormData] = useState({
    name: '',
    ownerId: currentOwnerId || '',
    species: '',
    breed: '',
    age: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ownerId) return;
    addPet(formData);
    setFormData({ name: '', ownerId: currentOwnerId || '', species: '', breed: '', age: 0 });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Gestão de Pets</h2>

      {isOwner && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus size={18} /> {currentOwnerId ? 'Cadastrar Meu Pet' : 'Novo Pet'}
          </h3>
          {owners.length === 0 && !currentOwnerId ? (
            <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> Cadastre um dono primeiro!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="text" placeholder="Nome do Pet"
                className="border p-2 rounded-lg text-sm outline-vittagreen"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {!currentOwnerId && (
                <select
                  className="border p-2 rounded-lg text-sm outline-vittagreen"
                  value={formData.ownerId} onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                  required
                >
                  <option value="">Selecione o Dono</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              )}
              <input
                type="text" placeholder="Espécie"
                className="border p-2 rounded-lg text-sm outline-vittagreen"
                value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })}
              />
              <input
                type="number" placeholder="Idade"
                className="border p-2 rounded-lg text-sm outline-vittagreen"
                value={formData.age === 0 ? '' : formData.age}
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
              />
              <button type="submit" className="bg-vittagreen text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors">
                Cadastrar
              </button>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPets.map(p => {
          const owner = owners.find(o => o.id === p.ownerId);
          return (
            <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 group relative">
              {isOwner && (
                <button
                  onClick={() => deletePet(p.id)}
                  className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-50 p-2 rounded-lg text-vittagreen">
                  <Dog size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{p.name}</h4>
                  <p className="text-xs text-slate-400 capitalize">{p.species} • {p.age} anos</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 pt-3 border-t border-slate-50">
                <span className="font-medium">Dono:</span> {owner?.name || 'Vazio'}
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
