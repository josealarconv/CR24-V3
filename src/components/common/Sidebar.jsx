import React from 'react';
import {
  FileText,
  Users,
  Building2,
  FileCheck,
  Paperclip,
  Settings,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { ASSETS } from '../../config/assets';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  closeMobileMenu,
  counts = {}
}) {
  const menuItems = [
    { id: 'licitaciones', label: 'Licitaciones', icon: FileText, count: counts.licitaciones || 0 },
    { id: 'clientes', label: 'Clientes', icon: Users, count: counts.clientes || 0 },
    { id: 'proveedores', label: 'Proveedores', icon: Building2, count: counts.proveedores || 0 },
    { id: 'cotizaciones', label: 'Cotizaciones PDF', icon: FileCheck, count: counts.cotizaciones || 0 },
    { id: 'anexos', label: 'Anexos & Archivos', icon: Paperclip, count: counts.anexos || 0 },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  return (
    <>
      {/* Desktop Sidebar (Bloque III punto 22) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 min-h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navegación Principal
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Company Info */}
        <div className="mt-auto p-4 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <p className="text-xs font-semibold text-slate-200">{ASSETS.COMPANY_NAME}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">RUT: {ASSETS.COMPANY_RUT}</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{ASSETS.APP_NAME} {ASSETS.APP_VERSION}</span>
              <span className="text-emerald-400 font-semibold">Ready</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Bloque III punto 24) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <img
                  src={ASSETS.APP_LOGO_URL}
                  alt="App Logo"
                  className="w-7 h-7 object-contain"
                />
                <span className="font-bold text-white text-base">{ASSETS.APP_NAME}</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      closeMobileMenu();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400">{ASSETS.COMPANY_NAME}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{ASSETS.APP_VERSION}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
