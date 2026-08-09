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
  LogOut,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ASSETS } from '../../config/assets';
import { getActiveUser, getUserProfile, isCreator, logout } from '../../services/authService';

export default function Header({
  activeView,
  setActiveView,
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  counts = {},
  activeWorkspace,
  allWorkspaces = [],
  onWorkspaceSwitch,
  onLogout
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('Sincronizado');
  const [activeUser, setActiveUser] = useState(getActiveUser());
  const [userProfile, setUserProfile] = useState(getUserProfile(activeUser));
  const [showWsDropdown, setShowWsDropdown] = useState(false);

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
    window.addEventListener('workspace-changed', handleAuthChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('auth-state-changed', handleAuthChange);
      window.removeEventListener('workspace-changed', handleAuthChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowWsDropdown(false);
    if (showWsDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showWsDropdown]);

  // Navigation items — "Usuarios y Acceso" removed, merged into Configuración
  const navItems = [
    { id: 'licitaciones', label: 'Licitaciones', icon: FileText, count: counts.licitaciones, module: 'licitaciones' },
    { id: 'clientes', label: 'Clientes', icon: Users, count: counts.clientes, module: 'clientes' },
    { id: 'proveedores', label: 'Proveedores', icon: Building2, count: counts.proveedores, module: 'proveedores' },
    { id: 'consultas', label: 'Consultas de Precios', icon: DollarSign, count: counts.consultas, module: 'consultas' },
    { id: 'cotizaciones', label: 'Cotizaciones PDF', icon: FileCheck, count: counts.cotizaciones, module: 'cotizaciones' },
    { id: 'anexos', label: 'Anexos', icon: Paperclip, count: counts.anexos, module: 'anexos' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, module: 'configuracion' }
  ];

  const workspaceName = activeWorkspace?.config?.empresa || activeWorkspace?.nombre || ASSETS.COMPANY_NAME;
  const userIsCreator = isCreator();

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
              <p className="text-[11px] text-zinc-400 hidden sm:block truncate max-w-[300px]">
                {workspaceName}
              </p>
            </div>
          </div>

          {/* Right Side: Workspace Selector + Network + User + Logout */}
          <div className="flex items-center space-x-3 justify-end shrink-0">

            {/* Workspace Selector (Creator only, multiple workspaces) */}
            {userIsCreator && allWorkspaces.length > 1 && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWsDropdown(!showWsDropdown);
                  }}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Cambiar Espacio de Trabajo"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline font-semibold truncate max-w-[160px]">
                    {activeWorkspace?.nombre || 'Workspace'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {showWsDropdown && (
                  <div className="absolute right-0 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    <div className="px-3 py-2 border-b border-zinc-800">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Espacios de Trabajo</span>
                    </div>
                    {allWorkspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onWorkspaceSwitch(ws.id);
                          setShowWsDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-between ${
                          ws.id === activeWorkspace?.id ? 'bg-zinc-800/60 border-l-2 border-blue-400' : ''
                        }`}
                      >
                        <div>
                          <span className={`font-semibold block ${ws.id === activeWorkspace?.id ? 'text-blue-400' : 'text-zinc-200'}`}>
                            {ws.nombre}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {ws.plan} • {ws.id}
                          </span>
                        </div>
                        {ws.id === activeWorkspace?.id && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
