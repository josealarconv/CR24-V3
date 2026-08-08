import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Building2,
  DollarSign,
  FileCheck,
  Paperclip,
  Settings,
  ShieldCheck,
  Search,
  Calendar,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { ASSETS } from '../../config/assets';
import { getActiveUser, getUserProfile, logout } from '../../services/authService';

export default function Header({
  activeView,
  setActiveView,
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  counts = {},
  onLogout
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('Sincronizado');
  const [activeUser, setActiveUser] = useState(getActiveUser());
  const [userProfile, setUserProfile] = useState(getUserProfile(activeUser));

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

    const handleAuthChange = () => {
      const u = getActiveUser();
      setActiveUser(u);
      setUserProfile(getUserProfile(u));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('auth-state-changed', handleAuthChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  const navItems = [
    { id: 'licitaciones', label: 'Licitaciones', icon: FileText, count: counts.licitaciones, module: 'licitaciones' },
    { id: 'clientes', label: 'Clientes', icon: Users, count: counts.clientes, module: 'clientes' },
    { id: 'proveedores', label: 'Proveedores', icon: Building2, count: counts.proveedores, module: 'proveedores' },
    { id: 'consultas', label: 'Consultas de Precios', icon: DollarSign, count: counts.consultas, module: 'consultas' },
    { id: 'cotizaciones', label: 'Cotizaciones PDF', icon: FileCheck, count: counts.cotizaciones, module: 'cotizaciones' },
    { id: 'anexos', label: 'Anexos', icon: Paperclip, count: counts.anexos, module: 'anexos' },
    { id: 'usuarios', label: 'Usuarios y Acceso', icon: ShieldCheck, count: counts.usuarios, module: 'usuarios' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, module: 'configuracion' }
  ];

  return (
    <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-30 shadow-md w-full">
      {/* 100% Width Container */}
      <div className="w-full px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Enterprise Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <img
              src={ASSETS.APP_LOGO_URL}
              alt="CR24 Logo"
              className="w-8 h-8 object-contain bg-zinc-900 border border-zinc-800 p-1 rounded-lg shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-100 font-mono">
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

          {/* Search & Month Period Filter */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center space-x-2">
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

            <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
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

          {/* Network Status, Active User Badge & Logout (Right Justified, No Company Logo) */}
          <div className="flex items-center space-x-3 justify-end shrink-0">
            {/* Connection Status Badge */}
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

            {/* Active User Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-left hidden sm:block">
                <span className="block font-semibold text-zinc-100 text-[11px] leading-tight">
                  {activeUser?.nombre || 'Usuario'}
                </span>
                <span className="block text-[9px] text-zinc-400 font-mono leading-tight">
                  {userProfile?.nombre} • {activeUser?.email}
                </span>
              </div>
            </div>

            {/* Logout Action Button */}
            <button
              onClick={() => {
                logout();
                if (onLogout) onLogout();
              }}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
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

      {/* 100% Width Tabbed Navigation Bar */}
      <div className="bg-zinc-900 border-t border-zinc-800/80 overflow-x-auto scrollbar-none w-full">
        <div className="w-full px-4 sm:px-6 flex space-x-1 min-w-max py-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
