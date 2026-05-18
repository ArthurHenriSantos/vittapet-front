import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { User as AuthUser } from '../../types';

export default function Login() {
  const { handleLogin, registerAndLogin } = useAuth();
  const { owners, vets } = useData();

  const [role, setRole] = useState<'vet' | 'owner'>('owner');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regData, setRegData] = useState({ name: '', cpf: '', email: '', phone: '', password: '', specialty: '' });
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'vet') {
      const vet = vets.find(v => v.email === email && v.password === password);
      if (vet) {
        handleLogin({ id: vet.id, role: 'vet', name: vet.name });
      } else {
        setError('Email ou senha inválidos para Veterinário.');
      }
    } else {
      const owner = owners.find(o => o.email === email && o.password === password);
      if (owner) {
        handleLogin({ id: owner.id, role: 'owner', name: owner.name, ownerId: owner.id });
      } else {
        setError('Email ou senha inválidos para Dono.');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerAndLogin(regData, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
      >
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" showSlogan className="items-center text-center" />
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => { setRole('owner'); setIsRegistering(false); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'owner' ? 'bg-white text-vittagreen shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Dono
          </button>
          <button
            onClick={() => { setRole('vet'); setIsRegistering(false); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'vet' ? 'bg-white text-vittagreen shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Veterinário
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase">Email</label>
              <input
                type="email"
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm transition-all bg-slate-50 focus:bg-white"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase">Senha</label>
              <input
                type="password"
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm transition-all bg-slate-50 focus:bg-white"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-vittagreen text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-vittagreen/20"
            >
              Entrar como {role === 'vet' ? 'Veterinário' : 'Dono'}
            </button>

            {role === 'owner' && (
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="w-full text-vittagreen text-sm font-semibold hover:underline"
              >
                Não tem conta? Cadastre-se aqui
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text" placeholder="Nome"
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
                value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })}
                required
              />
              <input
                type="text" placeholder="CPF"
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
                value={regData.cpf} onChange={e => setRegData({ ...regData, cpf: e.target.value })}
                required
              />
            </div>
            <input
              type="email" placeholder="Email"
              className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
              value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })}
              required
            />
            <input
              type="password" placeholder="Definir sua senha"
              className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
              value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })}
              required
            />
            <input
              type="text" placeholder="Telefone"
              className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
              value={regData.phone} onChange={e => setRegData({ ...regData, phone: e.target.value })}
            />
            <button
              type="submit"
              className="w-full py-4 bg-vittagreen text-white rounded-xl font-bold hover:bg-emerald-700 transition-all font-sans shadow-lg shadow-vittagreen/20"
            >
              Finalizar Cadastro
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="w-full text-slate-500 text-sm font-semibold hover:underline"
            >
              Já tenho conta, ir para login
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
