import React, { useState, useRef, useContext, createContext } from 'react';
import { Loader2, AlertTriangle, PackageSearch, Trash2, X } from 'lucide-react';
import { providerColor } from '../../services/calculationService';

/* ---------------- Confirm Context ---------------- */
const ConfirmContext = createContext(async () => false);
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }) {
  const [dialogo, setDialogo] = useState(null);
  const resolver = useRef(null);

  const pedir = (opts) =>
    new Promise((resolve) => {
      resolver.current = resolve;
      setDialogo({ titulo: "¿Eliminar?", textoConfirmar: "Eliminar", ...opts });
    });

  const cerrar = (valor) => {
    resolver.current?.(valor);
    resolver.current = null;
    setDialogo(null);
  };

  return (
    <ConfirmContext.Provider value={pedir}>
      {children}
      {dialogo && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4" onClick={() => cerrar(false)}>
          <div
            className="w-full rounded-t-2xl bg-white p-5 sm:max-w-sm sm:rounded-2xl"
            style={{ backgroundColor: "#FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="mb-2 flex items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#FBE7E6" }}>
                <AlertTriangle size={16} style={{ color: "#B3261E" }} />
              </span>
              <div className="min-w-0 flex-1">
                <p style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-base font-bold text-[#131A2C]">{dialogo.titulo}</p>
                {dialogo.mensaje && <p className="mt-1 text-sm text-[#5B6478]">{dialogo.mensaje}</p>}
                {dialogo.detalle && (
                  <p className="mt-2 rounded-lg px-2.5 py-1.5 text-xs" style={{ backgroundColor: "#FBEEDB", color: "#8A5A12" }}>
                    {dialogo.detalle}
                  </p>
                )}
              </div>
            </div>
            <p className="mb-3 text-xs text-[#A6ADBB]">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <GhostBtn onClick={() => cerrar(false)} className="flex-1">Cancelar</GhostBtn>
              <PrimaryBtn onClick={() => cerrar(true)} className="flex-1" style={{ backgroundColor: "#B3261E" }}>
                <Trash2 size={15} />{dialogo.textoConfirmar}
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/* ---------------- Prototype UI Atoms ---------------- */
export function Badge({ children, color, bg, variant = 'default', className = "" }) {
  if (color || bg) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`} style={{ color, backgroundColor: bg }}>
        {children}
      </span>
    );
  }

  const variants = {
    default: "bg-[#ECEEF2] text-[#5B6478]",
    info: "bg-[#E1F1F5] text-[#0F6E8C]",
    warning: "bg-[#FBEEDB] text-[#B45309]",
    success: "bg-[#E4F3EC] text-[#2F7D5A]",
    danger: "bg-[#FBE7E6] text-[#B3261E]"
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Field({ label, children, className = "", hint }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#8A93A6]">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-[11px] text-[#A6ADBB]">{hint}</span>}
    </label>
  );
}

const baseInput =
  "w-full rounded-lg border border-[#DDE1E8] bg-white px-3 py-2 text-sm text-[#131A2C] placeholder-[#A6ADBB] focus:outline-none focus:ring-2 focus:ring-[#2B3A67]/25 focus:border-[#2B3A67] transition";

export const TextInput = ({ className = "", ...p }) => <input {...p} className={`${baseInput} ${className}`} />;
export const TextArea = ({ className = "", ...p }) => <textarea {...p} className={`${baseInput} resize-y ${className}`} />;
export const Select = ({ className = "", ...p }) => <select {...p} className={`${baseInput} ${className}`} />;

export const PrimaryBtn = ({ children, className = "", style, ...p }) => {
  const bg = style?.backgroundColor || "#2B3A67";
  return (
    <button
      type="button"
      {...p}
      style={{ backgroundColor: bg, color: "#FFFFFF", minHeight: 42, border: 0, ...style }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};

export const GhostBtn = ({ children, className = "", style, ...p }) => {
  return (
    <button
      type="button"
      {...p}
      style={{ backgroundColor: "#FFFFFF", color: "#131A2C", borderColor: "#DDE1E8", minHeight: 38, ...style }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};

export const IconBtn = ({ children, className = "", style, ...p }) => {
  return (
    <button
      type="button"
      {...p}
      style={{ color: "#A6ADBB", ...style }}
      className={`rounded-md p-1.5 transition hover:text-[#131A2C] hover:bg-[#ECEEF2] cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};

export function Empty({ children, icon: Icon = PackageSearch }) {
  return (
    <div className="rounded-xl border border-dashed border-[#DDE1E8] bg-white px-4 py-7 text-center">
      <Icon size={20} className="mx-auto mb-2 text-[#C7CCD6]" />
      <p className="text-sm text-[#8A93A6]">{children}</p>
    </div>
  );
}

export function SourcingBar({ calcItem, compact = false }) {
  if (!calcItem) return null;
  const { cantidadSolicitada = 0, lineas = [], pendiente = 0, unidad = "und" } = calcItem;
  if (cantidadSolicitada <= 0) return null;
  const names = [...new Set(lineas.map((l) => l.proveedor))];
  const denom = Math.max(cantidadSolicitada, lineas.reduce((s, l) => s + l.cantidad, 0));

  return (
    <div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#ECEEF2]">
        {lineas.map((l, idx) => (
          <div key={idx} style={{ width: `${(l.cantidad / denom) * 100}%`, backgroundColor: providerColor(l.proveedor, names) }} title={`${l.proveedor}: ${l.cantidad}`} />
        ))}
        {pendiente > 0 && <div style={{ width: `${(pendiente / denom) * 100}%` }} className="bg-[#F2DCDA]" />}
      </div>
      {!compact && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#5B6478]">
          {lineas.map((l, idx) => (
            <span key={idx} className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: providerColor(l.proveedor, names) }} />
              {l.proveedor} · {l.cantidad} {unidad}
            </span>
          ))}
          {pendiente > 0 && <span className="font-semibold text-[#B3261E]">Sin asignar · {pendiente}</span>}
        </div>
      )}
    </div>
  );
}

/* ---------------- Legacy Compatibility Wrappers ---------------- */
export function Button({ children, variant = 'primary', className = '', ...props }) {
  if (variant === 'primary' || variant === 'danger') {
    const bg = variant === 'danger' ? '#B3261E' : '#2B3A67';
    return <PrimaryBtn style={{ backgroundColor: bg }} className={className} {...props}>{children}</PrimaryBtn>;
  }
  return <GhostBtn className={className} {...props}>{children}</GhostBtn>;
}

export function Input({ icon: Icon, className = '', ...props }) {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A6ADBB]">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <TextInput className={`${Icon ? 'pl-9 pr-3 py-2' : ''} ${className}`} {...props} />
    </div>
  );
}

export function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`bg-white border border-[#EDEFF3] rounded-xl p-5 shadow-sm hover:border-[#DDE1E8] transition-all ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between pb-3 border-b border-[#EDEFF3] mb-4">
          <div>
            {title && <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="font-bold text-[#131A2C] text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-[#8A93A6] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Loading({ message = 'Cargando datos...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className="w-6 h-6 text-[#2B3A67] animate-spin" />
      <span className="text-xs text-[#8A93A6] font-medium">{message}</span>
    </div>
  );
}

export function EmptyState({ title = 'No hay información', description = 'No se encontraron registros para mostrar.', icon: Icon = PackageSearch, action }) {
  return (
    <div className="p-12 text-center bg-white rounded-xl border border-dashed border-[#DDE1E8] space-y-3">
      <Icon className="w-10 h-10 text-[#C7CCD6] mx-auto" />
      <h4 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-sm font-semibold text-[#131A2C]">{title}</h4>
      <p className="text-xs text-[#8A93A6] max-w-sm mx-auto">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Error al cargar', description = 'Ocurrió un problema inesperado.', onRetry }) {
  return (
    <div className="p-8 text-center bg-[#FBE7E6] rounded-xl border border-[#F2DCDA] space-y-3">
      <AlertTriangle className="w-8 h-8 text-[#B3261E] mx-auto" />
      <h4 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-sm font-semibold text-[#B3261E]">{title}</h4>
      <p className="text-xs text-[#5B6478]">{description}</p>
      {onRetry && (
        <PrimaryBtn style={{ backgroundColor: "#B3261E" }} onClick={onRetry}>
          Reintentar
        </PrimaryBtn>
      )}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={onClose}>
      <div className={`bg-white border border-[#EDEFF3] rounded-xl w-full ${maxWidth} p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#EDEFF3] pb-3">
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-base font-bold text-[#131A2C]">{title}</h3>
          <IconBtn onClick={onClose}>
            <X className="w-4 h-4" />
          </IconBtn>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
