import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Building2,
  DollarSign,
  FileCheck,
  Paperclip,
  Settings,
  Search,
  Calendar,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ASSETS } from '../../config/assets';

export default function AppSheetNavbar({
  activeView,
  setActiveView,
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  openAiModal,
  onPrimaryAction,
  counts = {}
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('Sincronizado');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('Sincronizando...');
      setTimeout(() => setSyncStatus('Sincronizado'), 1200);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'licitaciones', label: 'Licitaciones', icon: FileText, count: counts.licitaciones },
    { id: 'clientes', label: 'Clientes', icon: Users, count: counts.clientes },
    { id: 'proveedores', label: 'Proveedores', icon: Building2, count: counts.proveedores },
    { id: 'consultas', label: 'Consultas de Precios', icon: DollarSign, count: counts.consultas },
    { id: 'cotizaciones', label: 'Cotizaciones PDF', icon: FileCheck, count: counts.cotizaciones },
    { id: 'anexos', label: 'Anexos', icon: Paperclip, count: counts.anexos },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  return (
    <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-30 shadow-md">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & System Identification */}
          <div className="flex items-center space-x-3">
            <img
              src={ASSETS.APP_LOGO_URL}
              alt="CR24 Logo"
              className="w-8 h-8 object-contain bg-zinc-900 border border-zinc-800 p-1 rounded-lg shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-100">
                  {ASSETS.APP_NAME}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {ASSETS.APP_VERSION}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {ASSETS.COMPANY_NAME}
              </p>
            </div>
          </div>

          {/* Search & Period Selector (Bloque IV - Plan Spark Filter) */}
          <div className="flex-1 max-w-lg hidden md:flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar licitación, cliente, RUT, proveedor..."
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="2025-01" className="bg-zinc-900">Enero 2025 (Mes Actual)</option>
                <option value="2024-12" className="bg-zinc-900">Diciembre 2024</option>
                <option value="2024-11" className="bg-zinc-900">Noviembre 2024</option>
                <option value="ALL" className="bg-zinc-900">Histórico Completo (Explícito)</option>
              </select>
            </div>
          </div>

          {/* Right Status & Tools */}
          <div className="flex items-center space-x-2">
            {/* Gemini AI Trigger (Bloque VIII) */}
            <button
              onClick={openAiModal}
              disabled={!isOnline}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isOnline
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 cursor-pointer'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-900 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
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
                  {syncStatus.includes('Sincronizando') ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                  ) : (
                    <Wifi className="w-3 h-3 text-emerald-400" />
                  )}
                  <span className="hidden sm:inline">{syncStatus}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Orión Company Logo */}
            <img
              src={ASSETS.COMPANY_LOGO_URL}
              alt="Orión Logo"
              className="w-7 h-7 object-contain bg-white p-0.5 rounded shadow-xs hidden sm:block"
            />
          </div>

        </div>

        {/* Mobile Search input */}
        <div className="py-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar licitación, cliente..."
              className="block w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs placeholder-zinc-500 text-zinc-100"
            />
          </div>
        </div>
      </div>

      {/* AppSheet Tabbed Navigation Bar */}
      <div className="bg-zinc-900 border-t border-zinc-800/80 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 min-w-max py-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
