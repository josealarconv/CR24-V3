import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Building2,
  Settings,
  Wifi,
  WifiOff,
  LogOut,
  Layers,
  ChevronDown,
  Pin,
  PinOff,
  Menu,
  X
} from 'lucide-react';
import { ASSETS } from '../../config/assets';
import { getActiveUser, getUserProfile, isCreator } from '../../services/authService';

export default function Header({
  activeView,
  setActiveView,
  counts = {},
  activeWorkspace,
  allWorkspaces = [],
  onWorkspaceSwitch,
  onLogout,
  isPinned = false,
  onTogglePin
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('Sincronizado');
  const [activeUser, setActiveUser] = useState(getActiveUser());
  const [userProfile, setUserProfile] = useState(getUserProfile(activeUser));
  const [showWsDropdown, setShowWsDropdown] = useState(false);

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

  const navItems = [
    { id: 'licitaciones', label: 'Licitaciones', icon: FileText, count: counts.licitaciones },
    { id: 'clientes', label: 'Clientes', icon: Users, count: counts.clientes },
    { id: 'proveedores', label: 'Proveedores', icon: Building2, count: counts.proveedores },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  const workspaceName = activeWorkspace?.config?.empresa || activeWorkspace?.nombre || ASSETS.COMPANY_NAME;
  const userIsCreator = isCreator();
  const isExpanded = isPinned || isHovered;

  return (
    <>
      {/* Top Header Bar (Full width across screen) */}
      <header className="sticky top-0 z-40 w-full border-b border-[#EDEFF3] bg-white shadow-xs">
        <div className="flex w-full items-center justify-between px-4 py-2.5">
          {/* Left: Brand Logo & Title & Workspace Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B3A67] text-white shadow-xs">
              <Layers size={18} />
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-base font-bold text-[#131A2C]">
                {ASSETS.APP_TITLE || 'Intermediar'}
              </span>

              {userIsCreator && allWorkspaces.length > 0 && (
                <div className="relative inline-block ml-1">
                  <button
                    type="button"
                    onClick={() => setShowWsDropdown(!showWsDropdown)}
                    className="inline-flex items-center gap-1 rounded-md bg-[#EEF0F7] px-2 py-0.5 text-xs font-semibold text-[#2B3A67] transition hover:bg-[#E7EAF3] cursor-pointer"
                  >
                    <span className="max-w-[180px] truncate">{workspaceName}</span>
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
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
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

          {/* Right: Online Status, User Profile & Mobile Hamburger Menu */}
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
                className="rounded-md p-1 text-[#8A93A6] transition hover:bg-[#FBE7E6] hover:text-[#B3261E] cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md border border-[#DDE1E8] p-1.5 text-[#5B6478] md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (only visible when hamburger menu is toggled) */}
        {isMobileMenuOpen && (
          <div className="border-t border-[#EDEFF3] bg-[#FAFAFC] px-4 py-3 md:hidden space-y-1">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8A93A6]">Navegación</p>
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
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-[#2B3A67] text-white" : "text-[#5B6478] hover:bg-[#ECEEF2] hover:text-[#131A2C]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.count != null && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/20 text-white" : "bg-[#ECEEF2] text-[#5B6478]"}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Web Vertical Left Sidebar Navigation */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-[49px] bottom-0 z-30 hidden md:flex flex-col justify-between border-r border-[#EDEFF3] bg-[#FAFAFC] transition-all duration-300 ${
          isExpanded ? "w-56 shadow-lg" : "w-16"
        }`}
      >
        {/* Navigation Section Buttons */}
        <div className="p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                title={!isExpanded ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[#2B3A67] text-white shadow-xs"
                    : "text-[#5B6478] hover:bg-[#ECEEF2] hover:text-[#131A2C]"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {isExpanded && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}
                {isExpanded && item.count != null && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-[#ECEEF2] text-[#5B6478]"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Pin Toggle Button (Web Mode only) */}
        <div className="p-2 border-t border-[#EDEFF3]">
          <button
            type="button"
            onClick={onTogglePin}
            title={isPinned ? "Desfijar menú lateral (auto-colapsar solo iconos)" : "Fijar menú lateral expandido"}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
              isPinned
                ? "bg-[#2B3A67] text-white"
                : "border border-[#DDE1E8] bg-white text-[#5B6478] hover:border-[#2B3A67] hover:text-[#2B3A67]"
            }`}
          >
            {isPinned ? <PinOff size={16} className="shrink-0" /> : <Pin size={16} className="shrink-0" />}
            {isExpanded && <span className="truncate">{isPinned ? "Fijo" : "Fijar menú"}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
