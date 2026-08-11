import React, { useState } from 'react';
import { Layers, AlertCircle, LogIn } from 'lucide-react';
import { ASSETS } from '../../config/assets';
import { loginWithGoogle } from '../../services/authService';

export default function LoginScreen({ onLoginSuccess }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div style={{ fontFamily: "'Inter',sans-serif" }} className="min-h-screen bg-[#F5F6F8] text-[#131A2C] flex items-center justify-center p-4 w-full">
      <div className="max-w-sm w-full space-y-6 text-center">
        
        {/* Clean Header Branding */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2B3A67] shadow-md text-white">
              <Layers size={28} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center space-x-2">
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-2xl font-extrabold tracking-tight text-[#131A2C]">
                {ASSETS.APP_TITLE || 'Intermediar'}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#EEF0F7] border border-[#DDE1E8] text-[#2B3A67] font-semibold">
                {ASSETS.APP_VERSION || 'v2.0'}
              </span>
            </div>
            <p className="text-xs text-[#8A93A6] mt-1">
              Licitaciones · Cotización mixta por proveedor
            </p>
          </div>
        </div>

        {/* Minimalist Login Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#EDEFF3] shadow-lg space-y-4">
          {errorMessage && (
            <div className="p-3 bg-[#FBE7E6] border border-[#F2DCDA] text-[#B3261E] text-xs rounded-xl flex items-start space-x-2 text-left">
              <AlertCircle className="w-4 h-4 text-[#B3261E] shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ backgroundColor: '#2B3A67', color: '#FFFFFF' }}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Verificando con Google...' : 'Ingresar con Google'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
