"use client";

import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client'; // Corrected path
import { showSuccess, showError } from '../utils/toast';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  useEffect(() => {
    if (!supabase) {
      showError("Supabase client not initialized. Check your .env variables.");
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        showSuccess("Login realizado com sucesso!");
        onLoginSuccess();
      } else if (event === 'SIGNED_OUT') {
        showSuccess("Você foi desconectado.");
      } else if (event === 'USER_UPDATED') {
        showSuccess("Seu perfil foi atualizado.");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onLoginSuccess]);

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Erro de Configuração</h1>
          <p className="text-slate-700 dark:text-slate-300">
            O cliente Supabase não foi inicializado. Por favor, verifique se as variáveis de ambiente 
            <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded text-sm">VITE_SUPABASE_URL</code> e 
            <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded text-sm">VITE_SUPABASE_ANON_KEY</code> 
            estão corretamente definidas no seu arquivo <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded text-sm">.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-200 dark:shadow-none">
            <span className="text-3xl text-white font-bold">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bem-vindo ao Quantum</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Plataforma de ensino consciente.</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          providers={[]} // No third-party providers unless specified
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(255 80% 50%)', // brand-600
                  brandAccent: 'hsl(255 80% 60%)', // brand-500
                },
              },
            },
          }}
          theme="light" // Default to light theme
          localization={{
            variables: {
              sign_in: {
                email_label: 'Seu e-mail',
                password_label: 'Sua senha',
                email_input_placeholder: 'email@exemplo.com',
                password_input_placeholder: '••••••••',
                button_label: 'Entrar',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entrar',
              },
              sign_up: {
                email_label: 'Seu e-mail',
                password_label: 'Crie uma senha',
                email_input_placeholder: 'email@exemplo.com',
                password_input_placeholder: '••••••••',
                button_label: 'Cadastrar',
                social_provider_text: 'Cadastrar com {{provider}}',
                link_text: 'Não tem uma conta? Cadastrar',
              },
              forgotten_password: {
                email_label: 'Seu e-mail',
                email_input_placeholder: 'email@exemplo.com',
                button_label: 'Enviar instruções de recuperação',
                link_text: 'Esqueceu sua senha?',
              },
              update_password: {
                password_label: 'Nova senha',
                password_input_placeholder: '••••••••',
                button_label: 'Atualizar senha',
              },
              magic_link: {
                email_input_placeholder: 'email@exemplo.com',
                button_label: 'Enviar link mágico',
                link_text: 'Enviar um link mágico por e-mail',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;