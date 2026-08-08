import React, { useState } from 'react';
import { LogIn, Globe, AlertCircle } from 'lucide-react';
import { ASSETS } from '../../config/assets';
import { loginWithEmail, loginWithGoogle } from '../../services/authService';
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
    }, 300);
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);

    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 w-full font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-sm w-full space-y-6 text-center">
        
        {/* Clean Header Branding */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <img
              src={ASSETS.APP_LOGO_URL}
              alt="CR24 Logo"
              className="w-14 h-14 object-contain bg-zinc-900 border border-zinc-800 p-2 rounded-2xl shadow-lg"
            />
          </div>
          <div>
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100 font-mono">
                {ASSETS.APP_NAME}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                {ASSETS.APP_VERSION}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {ASSETS.COMPANY_NAME}
            </p>
          </div>
        </div>

        {/* Minimalist Card */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80 shadow-2xl space-y-4 backdrop-blur-sm text-left">
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 text-red-300 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Primary Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Ingresar con Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800/80"></div>
            <span className="flex-shrink mx-3 text-[10px] text-zinc-500 font-mono uppercase">o por correo</span>
            <div className="flex-grow border-t border-zinc-800/80"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="correo@suministrosorion.cl"
                required
                className="w-full text-center"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="md"
              className="w-full justify-center"
              disabled={loading}
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Verificando...' : 'Ingresar'}</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
