import React from 'react';
import { useData } from '../../hooks/useData';

export default function Owners() {
  const { owners } = useData();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Donos</h2>

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
