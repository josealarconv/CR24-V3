import React from 'react';
import { Loader2, AlertTriangle, FileQuestion, Search, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-sm focus:ring-blue-500",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 focus:ring-zinc-500",
    outline: "bg-transparent hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 focus:ring-zinc-500",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus:ring-rose-500",
    ghost: "bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100"
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-xs gap-2",
    lg: "px-4 py-2.5 text-sm gap-2"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ icon: Icon, className = '', ...props }) {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors ${
          Icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2'
        } ${className}`}
        {...props}
      />
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    info: "bg-blue-950/80 text-blue-300 border-blue-800/60",
    warning: "bg-amber-950/80 text-amber-300 border-amber-800/60",
    success: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
    danger: "bg-rose-950/80 text-rose-300 border-rose-800/60"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 shadow-sm hover:border-zinc-700/80 transition-all ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-4">
          <div>
            {title && <h3 className="font-bold text-zinc-100 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
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
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      <span className="text-xs text-zinc-400 font-medium">{message}</span>
    </div>
  );
}

export function EmptyState({ title = 'No hay información', description = 'No se encontraron registros para mostrar.', icon: Icon = FileQuestion, action }) {
  return (
    <div className="p-12 text-center bg-zinc-900/40 rounded-xl border border-zinc-800/80 space-y-3">
      <Icon className="w-10 h-10 text-zinc-600 mx-auto" />
      <h4 className="text-sm font-semibold text-zinc-200">{title}</h4>
      <p className="text-xs text-zinc-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Error al cargar', description = 'Ocurrió un problema inesperado.', onRetry }) {
  return (
    <div className="p-8 text-center bg-rose-950/20 rounded-xl border border-rose-900/40 space-y-3">
      <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
      <h4 className="text-sm font-semibold text-rose-200">{title}</h4>
      <p className="text-xs text-rose-300/70">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
      <div className={`bg-zinc-900 border border-zinc-800 rounded-xl w-full ${maxWidth} p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150`}>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
