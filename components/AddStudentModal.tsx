"use client";

import React, { useState } from 'react';
import { Button } from './Button';
import { User } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (studentData: { name: string; email: string; password: string; avatarUrl?: string; role: 'student' | 'coordinator' }) => Promise<void>;
  isLoading: boolean;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onAddStudent, isLoading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState<'student' | 'coordinator'>('student');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Nome, E-mail e Senha Temporária são obrigatórios.');
      return;
    }
    await onAddStudent({ name, email, password, avatarUrl, role });
    // Limpar formulário após adicionar
    setName('');
    setEmail('');
    setPassword('');
    setAvatarUrl('');
    setRole('student');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl my-8 border border-slate-200 dark:border-slate-700 animate-scale-in">
        <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Cadastrar Novo Usuário</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1" htmlFor="student-name">Nome Completo</label>
            <input
              id="student-name"
              type="text"
              className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1" htmlFor="student-email">E-mail</label>
              <input
                id="student-email"
                type="email"
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1" htmlFor="user-role">Cargo / Nível de Acesso</label>
              <select
                id="user-role"
                className="w-full border rounded-lg px-3 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'coordinator')}
              >
                <option value="student">Aluno</option>
                <option value="coordinator">Coordenador (Admin)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1" htmlFor="student-password">Senha Temporária</label>
            <input
              id="student-password"
              type="password"
              className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">O usuário poderá alterar esta senha após o primeiro login.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1" htmlFor="student-avatar">URL do Avatar (Opcional)</label>
            <input
              id="student-avatar"
              type="url"
              className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
            />
          </div>

          <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};