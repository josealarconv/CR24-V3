import React, { useState } from 'react';
import { Plus, FileText, Calendar, Building, ChevronRight, Filter, Search } from 'lucide-react';

export default function LicitacionesList({
  licitaciones = [],
  clientes = [],
  onSelectLicitacion,
  onNewLicitacion,
  selectedMonth
}) {
  const [filterEstatus, setFilterEstatus] = useState('ALL');

  const getClienteNombre = (clienteId) => {
    const cli = clientes.find(c => c.id === clienteId);
    return cli ? cli.nombre : 'Cliente No Asignado';
  };

  const getEstatusColor = (estatus) => {
    switch (estatus) {
      case 'Abierto':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'En Proceso':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Cotizada':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Ganada':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Perdida':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const filtered = licitaciones.filter(lic => {
    if (filterEstatus !== 'ALL' && lic.estatus !== filterEstatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Gestión de Licitaciones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedMonth === 'ALL'
              ? 'Mostrando el historial completo de licitaciones.'
              : `Filtrando por período: ${selectedMonth}`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Estatus Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterEstatus}
              onChange={(e) => setFilterEstatus(e.target.value)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-slate-800">Todos los Estados</option>
              <option value="Abierto" className="bg-slate-800">Abiertas</option>
              <option value="En Proceso" className="bg-slate-800">En Proceso</option>
              <option value="Cotizada" className="bg-slate-800">Cotizadas</option>
              <option value="Ganada" className="bg-slate-800">Ganadas</option>
            </select>
          </div>

          <button
            onClick={onNewLicitacion}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Licitación</span>
          </button>
        </div>
      </div>

      {/* Licitaciones List / Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 rounded-xl border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No se encontraron licitaciones</p>
          <p className="text-xs text-slate-500 mt-1">Prueba cambiar el período o crear una nueva licitación.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden bg-slate-900/80 rounded-xl border border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-700/80">
                <tr>
                  <th className="px-4 py-3">No. Licitación</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha Ingreso</th>
                  <th className="px-4 py-3">Fecha Cotización</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((lic) => (
                  <tr
                    key={lic.id}
                    onClick={() => onSelectLicitacion(lic)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-white">
                      {lic.numeroLicitacion || lic.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span>{getClienteNombre(lic.clienteId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                      {lic.fecha}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                      {lic.fechaCotizacion || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstatusColor(
                          lic.estatus
                        )}`}
                      >
                        {lic.estatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLicitacion(lic);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (Bloque III punto 27) */}
          <div className="md:hidden space-y-3">
            {filtered.map((lic) => (
              <div
                key={lic.id}
                onClick={() => onSelectLicitacion(lic)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 cursor-pointer hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base">
                    {lic.numeroLicitacion || lic.id}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstatusColor(
                      lic.estatus
                    )}`}
                  >
                    {lic.estatus}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{getClienteNombre(lic.clienteId)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  <span className="font-mono">Ingreso: {lic.fecha}</span>
                  <span className="font-mono">Cotización: {lic.fechaCotizacion || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
