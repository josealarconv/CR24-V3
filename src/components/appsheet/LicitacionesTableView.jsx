import React, { useState } from 'react';
import { FileText, Plus, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button, Badge, Card, EmptyState, Modal, Input } from '../ui/Components';

export default function LicitacionesTableView({
  licitaciones = [],
  clientes = [],
  detalles = [],
  selectedMonth = '2026-08',
  setSelectedMonth,
  onSelectLicitacion,
  onAddLicitacion
}) {
  const [filterEstatus, setFilterEstatus] = useState('ALL');
  const [showNewModal, setShowNewModal] = useState(false);

  // Month Stepper List
  const monthsList = [
    { value: '2026-08', label: 'Agosto 2026 (Mes Actual)' },
    { value: '2026-07', label: 'Julio 2026' },
    { value: '2026-06', label: 'Junio 2026' },
    { value: 'ALL', label: 'Todos los Meses' }
  ];

  const handlePrevMonth = () => {
    if (!setSelectedMonth) return;
    const currentIndex = monthsList.findIndex(m => m.value === selectedMonth);
    if (currentIndex >= 0 && currentIndex < monthsList.length - 1) {
      setSelectedMonth(monthsList[currentIndex + 1].value);
    }
  };

  const handleNextMonth = () => {
    if (!setSelectedMonth) return;
    const currentIndex = monthsList.findIndex(m => m.value === selectedMonth);
    if (currentIndex > 0) {
      setSelectedMonth(monthsList[currentIndex - 1].value);
    }
  };

  // New Licitacion Form
  const [numLic, setNumLic] = useState('');
  const [clienteId, setClienteId] = useState(clientes[0]?.id || '');
  const [moneda, setMoneda] = useState('CLP');
  const [fecha, setFecha] = useState('2026-08-08');
  const [fechaCot, setFechaCot] = useState('2026-08-15');
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
      {/* Title & Action Bar (100% Width) with Contextual Month Stepper */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 w-full">
        <div>
          <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Licitaciones</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Listado de licitaciones realizadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Contextual Month Navigation Controls inside Licitaciones Context */}
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs text-zinc-300">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer disabled:opacity-40"
              title="Mes Anterior"
              disabled={selectedMonth === 'ALL'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1.5 px-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth && setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs text-zinc-100 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {monthsList.map(m => (
                  <option key={m.value} value={m.value} className="bg-zinc-900 font-sans text-zinc-100">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer disabled:opacity-40"
              title="Mes Siguiente"
              disabled={selectedMonth === '2026-08'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Status Filter */}
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

      {/* Main Table Canvas */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Sin licitaciones para este período"
          description={selectedMonth === 'ALL' ? "No hay licitaciones registradas." : `No se encontraron licitaciones para ${selectedMonth}. Utiliza las flechas para consultar otro mes.`}
          icon={FileText}
        />
      ) : (
        <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs w-full">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">No. Licitación</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha Apertura</th>
                <th className="px-4 py-3">Fecha Oferta</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3">Moneda</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filtered.map((lic) => (
                <tr
                  key={lic.id}
                  onClick={() => onSelectLicitacion(lic)}
                  className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 font-semibold text-zinc-100 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="group-hover:text-blue-400 transition-colors">{lic.numeroLicitacion || lic.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans text-zinc-300">
                    {getClienteNombre(lic.clienteId)}
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
                  <td className="px-4 py-3 font-bold text-zinc-300">
                    {lic.moneda || 'CLP'}
                  </td>
                  <td className="px-4 py-3 text-right font-sans">
                    <Button variant="ghost" size="xs">
                      <span>Ver Ficha</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva Licitación */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Registrar Nueva Licitación"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Número de Licitación / ID *</label>
            <Input
              type="text"
              value={numLic}
              onChange={(e) => setNumLic(e.target.value)}
              placeholder="Ej: LIC-2026-CDK-0899"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Cliente Solicitante *</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
            >
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Fecha Recepción</label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Fecha Límite Cotización</label>
              <Input
                type="date"
                value={fechaCot}
                onChange={(e) => setFechaCot(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Moneda de Cotización</label>
            <select
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
            >
              <option value="CLP">Pesos Chilenos (CLP)</option>
              <option value="USD">Dólares (USD)</option>
              <option value="UF">Unidades de Fomento (UF)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Observaciones / Descripción</label>
            <Input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalle rápido de la licitación..."
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
