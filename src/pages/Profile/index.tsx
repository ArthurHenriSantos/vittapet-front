import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, Phone, Lock, Save, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useNotification } from '../../hooks/useNotification';

export default function Profile() {
  const { currentUser } = useAuth();
  const { owners, vets, updateOwnerProfile, updateVetProfile } = useData();
  const { showNotification } = useNotification();

  const isOwner = currentUser?.role === 'owner';
  const isVet = currentUser?.role === 'vet';

  // Find detailed user record from context list
  const ownerRecord = isOwner ? owners.find(o => o.id === currentUser?.id) : null;
  const vetRecord = isVet ? vets.find(v => v.id === currentUser?.id) : null;

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Populate form with current values
  useEffect(() => {
    if (isOwner && ownerRecord) {
      setEmail(ownerRecord.email || '');
      setPhone(ownerRecord.phone || '');
    } else if (isVet && vetRecord) {
      setEmail(vetRecord.email || '');
      setSpecialtiesText(vetRecord.specialty || '');
    }
  }, [isOwner, ownerRecord, isVet, vetRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      showNotification('As senhas digitadas não coincidem!', 'error');
      return;
    }

    try {
      if (isOwner && currentUser) {
        await updateOwnerProfile(currentUser.id, email, phone, password || undefined);
      } else if (isVet && currentUser) {
        // Veterinarian specialties are expected to be an array
        const specialties = specialtiesText
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        await updateVetProfile(currentUser.id, email, password || undefined, specialties);
      }
      
      // Clear password inputs on success
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      showNotification('Erro ao tentar atualizar as informações de perfil.', 'error');
    }
  };

  if (!currentUser) return null;

  const displayName = isOwner ? ownerRecord?.name : vetRecord?.name;
  const documentLabel = isOwner ? 'CPF' : 'CRMV';
  const documentValue = isOwner ? ownerRecord?.cpf : (vetRecord as any)?.crmv || '00000';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col items-center md:items-start md:flex-row gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-vittagreen flex items-center justify-center shadow-inner">
          {isVet ? <ShieldCheck size={40} /> : <User size={40} />}
        </div>
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">{displayName || currentUser.name}</h2>
          <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">{isVet ? 'Veterinário Parceiro' : 'Dono de Pet'}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
            <span className="font-bold text-slate-400">{documentLabel}:</span> {documentValue}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          Atualizar Meus Dados
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Mail size={12} /> E-mail de Contato
              </label>
              <input
                type="email"
                className="w-full p-3.5 border-2 border-slate-100 rounded-xl outline-none focus:border-vittagreen text-sm transition-all bg-slate-50 focus:bg-white"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>

            {isOwner && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  <Phone size={12} /> Telefone
                </label>
                <input
                  type="text"
                  className="w-full p-3.5 border-2 border-slate-100 rounded-xl outline-none focus:border-vittagreen text-sm transition-all bg-slate-50 focus:bg-white"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                />
              </div>
            )}

            {isVet && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  <Award size={12} /> Especialidades (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  className="w-full p-3.5 border-2 border-slate-100 rounded-xl outline-none focus:border-vittagreen text-sm transition-all bg-slate-50 focus:bg-white"
                  value={specialtiesText}
                  onChange={e => setSpecialtiesText(e.target.value)}
                  placeholder="Ex: Cardiologia, Dermatologia, Clínica Geral"
                />
              </div>
            )}

            <div className="border-t border-slate-100 md:col-span-2 my-2"></div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Lock size={12} /> Nova Senha (Opcional)
              </label>
              <input
                type="password"
                className="w-full p-3.5 border-2 border-slate-100 rounded-xl outline-none focus:border-vittagreen text-sm transition-all bg-slate-50 focus:bg-white"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Defina se deseja alterar..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Lock size={12} /> Confirmar Nova Senha
              </label>
              <input
                type="password"
                className="w-full p-3.5 border-2 border-slate-100 rounded-xl outline-none focus:border-vittagreen text-sm transition-all bg-slate-50 focus:bg-white"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha..."
                required={!!password}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3.5 bg-vittagreen hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-vittagreen/20 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
