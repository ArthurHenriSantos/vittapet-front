import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
// 1. Importe o PNG (ajuste o caminho ../../assets/ se você colocou em outra pasta)
import logoImg from '../../components/vittapet_logo.png'; 

export default function Login() {
  const { handleLogin, registerAndLogin } = useAuth();
  const { owners, vets } = useData();

  const [role, setRole] = useState<'vet' | 'owner'>('owner');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regData, setRegData] = useState({ name: '', cpf: '', email: '', phone: '', password: '', specialty: '', crmv: '' });
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = role === 'vet' 
      ? 'http://localhost:5289/Veterinarian/login' 
      : 'http://localhost:5290/Owner/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const user = await res.json();
        if (role === 'vet') {
          handleLogin({ id: user.id, role: 'vet', name: user.fullName });
        } else {
          handleLogin({ id: user.id, role: 'owner', name: user.fullName, ownerId: user.id });
        }
      } else {
        const text = await res.text();
        setError(text || 'E-mail ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro ao se conectar ao servidor de autenticação.');
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
          {/* 2. Tag img substituindo o componente Logo */}
          <img 
            src={logoImg} 
            alt="Vittapet" 
            className="h-24 w-auto object-contain mb-2" 
          />
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

            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className="w-full text-vittagreen text-sm font-semibold hover:underline"
            >
              Não tem conta? Cadastre-se aqui
            </button>
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
              {role === 'owner' ? (
                <input
                  type="text" placeholder="CPF"
                  className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
                  value={regData.cpf} onChange={e => setRegData({ ...regData, cpf: e.target.value })}
                  required
                />
              ) : (
                <input
                  type="text" placeholder="CRMV"
                  className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
                  value={regData.crmv} onChange={e => setRegData({ ...regData, crmv: e.target.value })}
                  required
                />
              )}
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
            {role === 'owner' ? (
              <input
                type="text" placeholder="Telefone"
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
                value={regData.phone} onChange={e => setRegData({ ...regData, phone: e.target.value })}
              />
            ) : (
              <input
                type="text" placeholder="Especialidade (ex: Cardiologia)"
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-vittagreen text-sm"
                value={regData.specialty} onChange={e => setRegData({ ...regData, specialty: e.target.value })}
              />
            )}
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