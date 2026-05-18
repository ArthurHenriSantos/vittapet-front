import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Owner } from '../../types';

export default function Owners() {
  const { currentUser } = useAuth();
  const { owners, addOwner } = useData();
  const [formData, setFormData] = useState({ name: '', cpf: '', email: '', phone: '', password: '123' });

  const isVet = currentUser?.role === 'vet';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cpf) return;
    addOwner(formData);
    setFormData({ name: '', cpf: '', email: '', phone: '', password: '123' });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Donos</h2>

      {isVet && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus size={18} /> Novo Dono
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text" placeholder="Nome"
              className="border p-2 rounded-lg text-sm"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="text" placeholder="CPF"
              className="border p-2 rounded-lg text-sm"
              value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })}
              required
            />
            <input
              type="email" placeholder="Email"
              className="border p-2 rounded-lg text-sm"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password" placeholder="Senha"
              className="border p-2 rounded-lg text-sm"
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button type="submit" className="bg-vittagreen text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors">
              Cadastrar
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-600">Nome</th>
              <th className="px-6 py-3 font-semibold text-slate-600">CPF</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {owners.map(o => (
              <tr key={o.id}>
                <td className="px-6 py-4">{o.name}</td>
                <td className="px-6 py-4 font-mono">{o.cpf}</td>
                <td className="px-6 py-4 text-slate-500">{o.email}</td>
              </tr>
            ))}
            {owners.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Nenhum dono cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
