import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, AlertCircle, Building2 } from 'lucide-react';
import { ASSETS } from '../../config/assets';
import { loginWithEmail } from '../../services/authService';
import { Button, Input } from '../ui/Components';

export default function LoginScreen({ onLoginSuccess }) {
  const [emailInput, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const res = loginWithEmail(emailInput);
      setLoading(false);

      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error);
      }
    }, 400);
  };

  const handleQuickDemoFill = (email) => {
    setEmailInput(email);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 w-full font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img
              src={ASSETS.APP_LOGO_URL}
              alt="CR24 Logo"
              className="w-14 h-14 object-contain bg-zinc-900 border border-zinc-800 p-2 rounded-2xl shadow-md"
            />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100 font-mono">
              {ASSETS.APP_NAME}
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {ASSETS.APP_VERSION}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {ASSETS.COMPANY_NAME} • Santiago de Chile
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800/80 shadow-xl space-y-4">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Acceso Restringido</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Lista Blanca Activa</span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Correo Electrónico Registrado
              </label>
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ejemplo@suministrosorion.cl o josealarconv@gmail.com"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              disabled={loading}
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Verificando Lista Blanca...' : 'Ingresar al Sistema'}</span>
            </Button>
          </form>

          <div className="pt-3 border-t border-zinc-800 space-y-2 text-[11px] text-zinc-500">
            <p className="font-mono">Usuarios autorizados en Lista Blanca:</p>
            <div className="space-y-1">
              <button
                onClick={() => handleQuickDemoFill('josealarconv@gmail.com')}
                className="block text-left text-blue-400 hover:underline font-mono text-[11px]"
              >
                • josealarconv@gmail.com (Administrador Master)
              </button>
              <button
                onClick={() => handleQuickDemoFill('gerencia@suministrosorion.cl')}
                className="block text-left text-zinc-400 hover:underline font-mono text-[11px]"
              >
                • gerencia@suministrosorion.cl (Gerencia)
              </button>
              <button
                onClick={() => handleQuickDemoFill('compras@suministrosorion.cl')}
                className="block text-left text-zinc-400 hover:underline font-mono text-[11px]"
              >
                • compras@suministrosorion.cl (Analista Cotizador)
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-zinc-600 text-center font-mono">
          Sistema de Gestión de Licitaciones • Suministros Industriales Orión SpA
        </p>
      </div>
    </div>
  );
}
