import React, { useState, useEffect } from 'react';
import { Search, Wifi, WifiOff, RefreshCw, Calendar, Menu, Sparkles, UserCheck } from 'lucide-react';
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
  const [syncState, setSyncState] = useState('Sincronizado'); // 'Online', 'Offline', 'Sincronizando', 'Sincronizado'

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
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Mobile Drawer Trigger + App Logo & Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Menu Mobile"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3">
              <img
                src={ASSETS.APP_LOGO_URL}
                alt="CR24 Logo"
                className="w-9 h-9 object-contain rounded-lg bg-slate-800 p-1 border border-slate-700 shadow-sm"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    {ASSETS.APP_NAME}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    {ASSETS.APP_VERSION}
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden md:block">
                  {ASSETS.COMPANY_NAME}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Search & Month Selector (Bloque IV) */}
          <div className="flex-1 max-w-xl hidden md:flex items-center space-x-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar licitación, cliente, RUT, proveedor..."
                className="block w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm placeholder-slate-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Selector Mensual por defecto (Bloque IV punto 30-31) */}
            <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-400 ml-1" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="2025-01" className="bg-slate-800">Enero 2025 (Mes Actual)</option>
                <option value="2024-12" className="bg-slate-800">Diciembre 2024</option>
                <option value="2024-11" className="bg-slate-800">Noviembre 2024</option>
                <option value="ALL" className="bg-slate-800">Histórico Completo (Explícito)</option>
              </select>
            </div>
          </div>

          {/* Right: Network Status + Gemini AI Trigger + Company Logo */}
          <div className="flex items-center space-x-3">
            
            {/* Gemini AI Floating Button (Bloque VIII) */}
            <button
              onClick={openAiModal}
              disabled={!isOnline}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                isOnline
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
              title={isOnline ? 'Consultar Asistente Gemini AI' : 'Gemini no disponible offline'}
            >
              <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
              <span className="hidden sm:inline">IA Gemini</span>
            </button>

            {/* Network Status Badge (Bloque IX punto 88) */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-800 text-amber-300'
              }`}
            >
              {isOnline ? (
                <>
                  {syncState === 'Sincronizando' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="hidden sm:inline">{syncState}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Company Logo Header */}
            <img
              src={ASSETS.COMPANY_LOGO_URL}
              alt="Orión Logo"
              className="w-8 h-8 object-contain rounded-md bg-white p-0.5 hidden sm:block shadow-sm"
            />
          </div>

        </div>

        {/* Mobile Search input bar */}
        <div className="py-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar licitación, cliente..."
              className="block w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs placeholder-slate-400 text-slate-100"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
