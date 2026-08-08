import React from 'react';
import {
  FileText,
  Users,
  Building2,
  FileCheck,
  Paperclip,
  Settings,
  X
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
      {/* Desktop Sidebar (Bloque III Punto 22) */}
      <aside className="hidden lg:flex flex-col w-60 bg-zinc-950 border-r border-zinc-900 shrink-0 min-h-[calc(100vh-3.5rem)] select-none">
        <div className="p-3 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Módulos CR24
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-xs'
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-auto p-3 border-t border-zinc-900">
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
            <p className="text-xs font-semibold text-zinc-200">{ASSETS.COMPANY_NAME}</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">RUT: {ASSETS.COMPANY_RUT}</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>{ASSETS.APP_NAME} {ASSETS.APP_VERSION}</span>
              <span className="text-emerald-400 font-medium">Cloud PWA</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Bloque III Punto 24) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-zinc-950 border-r border-zinc-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <img
                  src={ASSETS.APP_LOGO_URL}
                  alt="App Logo"
                  className="w-6 h-6 object-contain"
                />
                <span className="font-bold text-zinc-100 text-sm">{ASSETS.APP_NAME}</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                      isActive
                        ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                        : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-zinc-900">
              <p className="text-xs text-zinc-400">{ASSETS.COMPANY_NAME}</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{ASSETS.APP_VERSION}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
