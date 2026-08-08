import React, { useState, useEffect } from 'react';
import { Search, Wifi, WifiOff, RefreshCw, Calendar, Menu, Sparkles } from 'lucide-react';
import { ASSETS } from '../../config/assets';

export default function Header({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  openAiModal,
  toggleMobileMenu
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState('Sincronizado');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncState('Sincronizando');
      setTimeout(() => setSyncState('Sincronizado'), 1200);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-zinc-950/90 backdrop-blur-md text-zinc-100 border-b border-zinc-800/80 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Left: Mobile Trigger + App Logo & Name */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5">
              <img
                src={ASSETS.APP_LOGO_URL}
                alt="CR24 Logo"
                className="w-8 h-8 object-contain rounded-lg bg-zinc-900 border border-zinc-800 p-1 shadow-sm"
              />
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-100">
                  {ASSETS.APP_NAME}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {ASSETS.APP_VERSION}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Search & Month Selector (Bloque IV Puntos 30-32) */}
          <div className="flex-1 max-w-lg hidden md:flex items-center space-x-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar licitaciones, clientes, RUT, proveedores..."
                className="block w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            {/* Monthly Filter Selector */}
            <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value="2025-01" className="bg-zinc-900 text-zinc-200">Enero 2025 (Mes Actual)</option>
                <option value="2024-12" className="bg-zinc-900 text-zinc-200">Diciembre 2024</option>
                <option value="2024-11" className="bg-zinc-900 text-zinc-200">Noviembre 2024</option>
                <option value="ALL" className="bg-zinc-900 text-zinc-200">Histórico Completo (Explícito)</option>
              </select>
            </div>
          </div>

          {/* Right: Network Status + Gemini AI + Company Logo */}
          <div className="flex items-center space-x-2.5">
            
            {/* Gemini AI Trigger Button */}
            <button
              onClick={openAiModal}
              disabled={!isOnline}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isOnline
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 cursor-pointer shadow-sm'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
              title={isOnline ? 'Consultar Asistente Gemini AI' : 'Gemini no disponible offline'}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">IA Gemini</span>
            </button>

            {/* Network Status Badge (Bloque IX Punto 88) */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-400'
              }`}
            >
              {isOnline ? (
                <>
                  {syncState === 'Sincronizando' ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                  ) : (
                    <Wifi className="w-3 h-3 text-emerald-400" />
                  )}
                  <span className="hidden sm:inline">{syncState}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Company Logo Header */}
            <img
              src={ASSETS.COMPANY_LOGO_URL}
              alt="Orión Logo"
              className="w-7 h-7 object-contain rounded bg-white p-0.5 hidden sm:block shadow-sm"
            />
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="py-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar licitaciones, clientes..."
              className="block w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs placeholder-zinc-500 text-zinc-100"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
