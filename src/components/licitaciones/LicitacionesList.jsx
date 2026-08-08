import React, { useState } from 'react';
import { Plus, FileText, Calendar, Building, ChevronRight, Filter } from 'lucide-react';
import { Button, Badge, Card, EmptyState } from '../ui/Components';

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

  const getEstatusVariant = (estatus) => {
    switch (estatus) {
      case 'Abierto': return 'info';
      case 'En Proceso': return 'warning';
      case 'Cotizada': return 'default';
      case 'Ganada': return 'success';
      case 'Perdida': return 'danger';
      default: return 'default';
    }
  };

  const filtered = licitaciones.filter(lic => {
    if (filterEstatus !== 'ALL' && lic.estatus !== filterEstatus) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header & Primary Action Bar (Bloque III Punto 26) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Gestión de Licitaciones</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {selectedMonth === 'ALL'
              ? 'Mostrando el historial completo de licitaciones.'
              : `Filtrando por período: ${selectedMonth}`}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Subordinated Secondary Filter */}
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterEstatus}
              onChange={(e) => setFilterEstatus(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-zinc-900">Todos los Estados</option>
              <option value="Abierto" className="bg-zinc-900">Abiertas</option>
              <option value="En Proceso" className="bg-zinc-900">En Proceso</option>
              <option value="Cotizada" className="bg-zinc-900">Cotizadas</option>
              <option value="Ganada" className="bg-zinc-900">Ganadas</option>
            </select>
          </div>

          {/* SINGLE PRIMARY ACTION BUTTON (Bloque III Punto 26) */}
          <Button variant="primary" size="md" onClick={onNewLicitacion}>
            <Plus className="w-4 h-4" />
            <span>Nueva Licitación</span>
          </Button>
        </div>
      </div>

      {/* Content Display */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No hay licitaciones registradas"
          description="No se encontraron licitaciones para el período seleccionado. Prueba cambiando los filtros o crea una nueva licitación."
          icon={FileText}
          action={
            <Button variant="secondary" size="sm" onClick={onNewLicitacion}>
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Licitación</span>
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View (Bloque III Punto 27) */}
          <div className="hidden md:block overflow-hidden bg-zinc-900/40 rounded-xl border border-zinc-800/80 shadow-xs">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">No. Licitación</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha Ingreso</th>
                  <th className="px-4 py-3">Fecha Cotización</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((lic) => (
                  <tr
                    key={lic.id}
                    onClick={() => onSelectLicitacion(lic)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-100">
                      {lic.numeroLicitacion || lic.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2 text-zinc-300">
                        <Building className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{getClienteNombre(lic.clienteId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-mono">
                      {lic.fecha}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-mono">
                      {lic.fechaCotizacion || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getEstatusVariant(lic.estatus)}>
                        {lic.estatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLicitacion(lic);
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (Bloque III Punto 27) */}
          <div className="md:hidden space-y-3">
            {filtered.map((lic) => (
              <Card
                key={lic.id}
                onClick={() => onSelectLicitacion(lic)}
                className="cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-100 text-sm">
                    {lic.numeroLicitacion || lic.id}
                  </span>
                  <Badge variant={getEstatusVariant(lic.estatus)}>
                    {lic.estatus}
                  </Badge>
                </div>

                <div className="text-xs text-zinc-300 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{getClienteNombre(lic.clienteId)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-2 font-mono">
                  <span>Ingreso: {lic.fecha}</span>
                  <span>Cotización: {lic.fechaCotizacion || 'N/A'}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
