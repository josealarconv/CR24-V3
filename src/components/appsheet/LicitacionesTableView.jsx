import React, { useState } from 'react';
import { FileText, Plus, Filter, Building2, ChevronRight, Calendar, DollarSign } from 'lucide-react';
import { Button, Badge, Card, EmptyState, Modal, Input } from '../ui/Components';

export default function LicitacionesTableView({
  licitaciones = [],
  clientes = [],
  detalles = [],
  selectedMonth,
  onSelectLicitacion,
  onAddLicitacion
}) {
  const [filterEstatus, setFilterEstatus] = useState('ALL');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Licitacion Form
  const [numLic, setNumLic] = useState('');
  const [clienteId, setClienteId] = useState(clientes[0]?.id || '');
  const [moneda, setMoneda] = useState('CLP');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [fechaCot, setFechaCot] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [notas, setNotas] = useState('');

  const getClienteNombre = (id) => {
    const cli = clientes.find(c => c.id === id);
    return cli ? cli.nombre : 'Cliente Desconocido';
  };

  const getEstatusBadge = (estatus) => {
    switch (estatus) {
      case 'Abierto': return <Badge variant="info">Abierto</Badge>;
      case 'Consultando proveedores': return <Badge variant="warning">Consultando proveedores</Badge>;
      case 'Cotizado al cliente': return <Badge variant="default">Cotizado al cliente</Badge>;
      case 'Aprobado': return <Badge variant="success">Aprobado</Badge>;
      case 'No aprobado': return <Badge variant="danger">No aprobado</Badge>;
      case 'Despacho enviado': return <Badge variant="info">Despacho enviado</Badge>;
      case 'Cobrado': return <Badge variant="success">Cobrado</Badge>;
      case 'Pagado': return <Badge variant="success">Pagado</Badge>;
      case 'Cerrado': return <Badge variant="default">Cerrado</Badge>;
      default: return <Badge variant="default">{estatus}</Badge>;
    }
  };

  const filtered = licitaciones.filter(lic => {
    if (filterEstatus !== 'ALL' && lic.estatus !== filterEstatus) return false;
    return true;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!numLic.trim()) return;

    onAddLicitacion({
      id: `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      numeroLicitacion: numLic,
      fecha,
      fechaCotizacion: fechaCot,
      clienteId: clienteId || clientes[0]?.id,
      moneda,
      estatus: 'Abierto',
      notas,
      notasCotizacion: `Precios cotizados en ${moneda}. Despacho según acuerdo.`,
      contador: 1
    });

    setShowNewModal(false);
    setNumLic('');
    setNotas('');
  };

  return (
    <div className="space-y-4 w-full">
      {/* Title & Action Bar (100% Width) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 w-full">
        <div>
          <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Tabla Operativa: Licitaciones</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {selectedMonth === 'ALL'
              ? 'Mostrando historial completo.'
              : `Filtrado por período: ${selectedMonth}`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterEstatus}
              onChange={(e) => setFilterEstatus(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-zinc-900">Todos los Estados</option>
              <option value="Abierto" className="bg-zinc-900">Abiertas</option>
              <option value="Consultando proveedores" className="bg-zinc-900">Consultando proveedores</option>
              <option value="Cotizado al cliente" className="bg-zinc-900">Cotizado al cliente</option>
              <option value="Aprobado" className="bg-zinc-900">Aprobadas</option>
              <option value="No aprobado" className="bg-zinc-900">No aprobadas</option>
              <option value="Cobrado" className="bg-zinc-900">Cobradas</option>
              <option value="Cerrado" className="bg-zinc-900">Cerradas</option>
            </select>
          </div>

          <Button variant="primary" size="md" onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" />
            <span>Nueva Licitación</span>
          </Button>
        </div>
      </div>

      {/* Main Table (100% Width) */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Sin licitaciones registradas"
          description="No se encontraron licitaciones para los filtros aplicados."
          icon={FileText}
          action={
            <Button variant="secondary" size="sm" onClick={() => setShowNewModal(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Licitación</span>
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden bg-zinc-900/40 rounded-xl border border-zinc-800/80 shadow-xs w-full">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">No. Licitación</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Moneda</th>
                  <th className="px-4 py-3">Insumos</th>
                  <th className="px-4 py-3">Fecha Ingreso</th>
                  <th className="px-4 py-3">Límite Cotización</th>
                  <th className="px-4 py-3">Estatus</th>
                  <th className="px-4 py-3 text-right">Abrir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filtered.map((lic) => {
                  const detCount = detalles.filter(d => d.licitacionId === lic.id).length;
                  return (
                    <tr
                      key={lic.id}
                      onClick={() => onSelectLicitacion(lic)}
                      className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-zinc-100 font-mono">
                        {lic.numeroLicitacion || lic.id}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="flex items-center space-x-2 text-zinc-300">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{getClienteNombre(lic.clienteId)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-400">
                        {lic.moneda || 'CLP'}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {detCount} ítems
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {lic.fecha}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {lic.fechaCotizacion || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        {getEstatusBadge(lic.estatus)}
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3 w-full">
            {filtered.map((lic) => {
              const detCount = detalles.filter(d => d.licitacionId === lic.id).length;
              return (
                <Card
                  key={lic.id}
                  onClick={() => onSelectLicitacion(lic)}
                  className="cursor-pointer space-y-2.5 w-full"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-100 text-sm font-mono">
                      {lic.numeroLicitacion || lic.id}
                    </span>
                    {getEstatusBadge(lic.estatus)}
                  </div>

                  <div className="text-xs text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      {getClienteNombre(lic.clienteId)}
                    </span>
                    <Badge variant="default">{lic.moneda || 'CLP'}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-2 font-mono">
                    <span>Ingreso: {lic.fecha}</span>
                    <span>Cotizar: {lic.fechaCotizacion || 'N/A'}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Modal Nueva Licitación */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Registrar Nueva Licitación"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Número / Identificador Licitación</label>
            <Input
              type="text"
              value={numLic}
              onChange={(e) => setNumLic(e.target.value)}
              placeholder="Ej: LIC-2025-CDK-0990"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Cliente Solicitante</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
                required
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Moneda Operación</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
              >
                <option value="CLP">CLP - Pesos Chilenos</option>
                <option value="USD">USD - Dólares US</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Fecha Ingreso</label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Fecha Límite Cotizar</label>
              <Input
                type="date"
                value={fechaCot}
                onChange={(e) => setFechaCot(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Notas Internas de Licitación</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas de uso interno..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowNewModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Crear Licitación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
