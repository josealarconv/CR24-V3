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
  Wifi,
  WifiOff,
  LogOut,
  Layers,
  ChevronDown,
  Pin,
  PinOff,
  Menu,
  ChevronUp
} from 'lucide-react';
import { ASSETS } from '../../config/assets';
import { getActiveUser, getUserProfile, isCreator } from '../../services/authService';

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

  // Nav collapsible & pin state
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('cr24_nav_pinned') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem('cr24_nav_pinned', String(next));
      return next;
    });
  };

  const navItems = [
    { id: 'licitaciones', label: 'Licitaciones', icon: FileText, count: counts.licitaciones },
    { id: 'clientes', label: 'Clientes', icon: Users, count: counts.clientes },
    { id: 'proveedores', label: 'Proveedores', icon: Building2, count: counts.proveedores },
    { id: 'consultas', label: 'Consultas de Precios', icon: DollarSign, count: counts.consultas },
    { id: 'cotizaciones', label: 'Cotizaciones PDF', icon: FileCheck, count: counts.cotizaciones },
    { id: 'anexos', label: 'Anexos', icon: Paperclip, count: counts.anexos },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  const workspaceName = activeWorkspace?.config?.empresa || activeWorkspace?.nombre || ASSETS.COMPANY_NAME;
  const userIsCreator = isCreator();
  const isExpanded = isPinned || isHovered;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EDEFF3] bg-white shadow-xs">
      {/* Upper Top Bar */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2.5">
        {/* Left: Brand & Workspace */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B3A67] text-white">
            <Layers size={18} />
          </div>
          <div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-base font-bold text-[#131A2C]">
              {ASSETS.APP_TITLE || 'Intermediar'}
            </span>
            {userIsCreator && allWorkspaces.length > 0 && (
              <div className="relative inline-block ml-2">
                <button
                  type="button"
                  onClick={() => setShowWsDropdown(!showWsDropdown)}
                  className="inline-flex items-center gap-1 rounded-md bg-[#EEF0F7] px-2 py-0.5 text-xs font-semibold text-[#2B3A67] transition hover:bg-[#E7EAF3]"
                >
                  {workspaceName}
                  <ChevronDown size={12} />
                </button>
                {showWsDropdown && (
                  <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-xl border border-[#EDEFF3] bg-white p-1.5 shadow-xl">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8A93A6]">Espacios de trabajo</p>
                    {allWorkspaces.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          onWorkspaceSwitch(ws.id);
                          setShowWsDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          activeWorkspace?.id === ws.id ? "bg-[#2B3A67] text-white" : "text-[#131A2C] hover:bg-[#F5F6F8]"
                        }`}
                      >
                        <span className="truncate">{ws.config?.empresa || ws.nombre}</span>
                        {activeWorkspace?.id === ws.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status, User & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 text-xs text-[#8A93A6] sm:flex">
            {isOnline ? <Wifi size={13} className="text-[#2F7D5A]" /> : <WifiOff size={13} className="text-[#B3261E]" />}
            <span>{syncStatus}</span>
          </div>

          <div className="hidden items-center gap-2 border-l border-[#EDEFF3] pl-3 text-xs sm:flex">
            <span className="font-semibold text-[#131A2C]">{activeUser?.nombre || activeUser?.email}</span>
            <button
              type="button"
              onClick={onLogout}
              title="Cerrar sesión"
              className="rounded-md p-1 text-[#8A93A6] transition hover:bg-[#FBE7E6] hover:text-[#B3261E]"
            >
              <LogOut size={15} />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md border border-[#DDE1E8] p-1.5 text-[#5B6478] md:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Collapsible / Expandable Navigation Bar */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`border-t border-[#EDEFF3] bg-[#FAFAFC] transition-all duration-200 ${
          isMobileMenuOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-1.5">
          {/* Navigation Items */}
          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  title={item.label}
                  className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#2B3A67] text-white shadow-xs"
                      : "text-[#5B6478] hover:bg-[#ECEEF2] hover:text-[#131A2C]"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  {isExpanded && (
                    <span className="whitespace-nowrap transition-all duration-150">
                      {item.label}
                    </span>
                  )}
                  {isExpanded && item.count != null && (
                    <span
                      className={`rounded-full px-1.5 text-[10px] ${
                        isActive ? "bg-white/20 text-white" : "bg-[#ECEEF2] text-[#5B6478]"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Pin / Expand Control Button */}
          <div className="hidden items-center gap-1 border-l border-[#EDEFF3] pl-2 md:flex">
            <button
              type="button"
              onClick={togglePin}
              title={isPinned ? "Desfijar menú (colapsar automáticamente)" : "Fijar menú desplegado"}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                isPinned
                  ? "bg-[#2B3A67] text-white"
                  : "bg-white border border-[#DDE1E8] text-[#5B6478] hover:border-[#2B3A67] hover:text-[#2B3A67]"
              }`}
            >
              {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
              <span>{isPinned ? "Fijo" : "Auto-colapsar"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
