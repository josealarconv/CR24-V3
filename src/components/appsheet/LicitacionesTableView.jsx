import React, { useState } from 'react';
import { FileText, Plus, Filter, ChevronLeft, ChevronRight, Calendar, Search, Edit2, Trash2, Paperclip, X, Upload, Image as ImageIcon, AlertTriangle, UserPlus, AlertCircle, Sparkles, FileCheck, Loader2 } from 'lucide-react';
import { Button, Badge, Card, EmptyState, Modal, Input } from '../ui/Components';
import { analizarDocumentoLicitacion } from '../../services/aiRegistrationService';

export default function LicitacionesTableView({
  licitaciones = [],
  clientes = [],
  detalles = [],
  anexos = [],
  cotizaciones = [],
  notasLicitacion = [],
  selectedMonth = '2026-08',
  setSelectedMonth,
  searchTerm = '',
  setSearchTerm,
  onSelectLicitacion,
  onAddLicitacion,
  onEditLicitacion,
  onDeleteLicitacion,
  onAddAnexo,
  onAddCliente,
  onAddDetalle
}) {
  const [filterEstatus, setFilterEstatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingLic, setEditingLic] = useState(null); // null = Creating, Obj = Editing

  // Delete Integrity Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingLic, setDeletingLic] = useState(null);

  // Month Stepper List
  const monthsList = [
    { value: '2026-08', label: 'Agosto 2026' },
    { value: '2026-07', label: 'Julio 2026' },
    { value: '2026-06', label: 'Junio 2026' }
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

  // Form Fields
  const [numLic, setNumLic] = useState('');
  const [clienteId, setClienteId] = useState(clientes[0]?.id || '');
  const [moneda, setMoneda] = useState('CLP');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [fechaCot, setFechaCot] = useState('');
  const [notas, setNotas] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Inline client creation
  const [showNewClienteModal, setShowNewClienteModal] = useState(false);
  const [newClienteNombre, setNewClienteNombre] = useState('');
  const [newClienteRut, setNewClienteRut] = useState('');
  const [newClienteError, setNewClienteError] = useState('');

  // AI Registration
  const [aiFile, setAiFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');

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

  const handleOpenCreateModal = () => {
    setEditingLic(null);
    setNumLic('');
    setClienteId(clientes[0]?.id || '');
    setMoneda('CLP');
    setFecha(new Date().toISOString().split('T')[0]);
    setFechaCot('');
    setNotas('');
    setAttachedFiles([]);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (e, lic) => {
    e.stopPropagation(); // Prevents navigating to Detail view
    setEditingLic(lic);
    setNumLic(lic.numeroLicitacion || '');
    setClienteId(lic.clienteId || clientes[0]?.id);
    setMoneda(lic.moneda || 'CLP');
    setFecha(lic.fecha || new Date().toISOString().split('T')[0]);
    setFechaCot(lic.fechaCotizacion || '');
    setNotas(lic.notas || '');
    setAttachedFiles([]);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenDeleteModal = (e, lic) => {
    e.stopPropagation(); // Prevents navigating to Detail view
    setDeletingLic(lic);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingLic || !onDeleteLicitacion) return;
    onDeleteLicitacion(deletingLic.id);
    setShowDeleteModal(false);
    setDeletingLic(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles(prev => [
          ...prev,
          {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            dataUrl: event.target.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachedFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!clienteId) {
      setErrorMsg('Debe seleccionar el Cliente Solicitante (*).');
      return;
    }
    if (!fecha) {
      setErrorMsg('Debe indicar la Fecha de Recepción (*).');
      return;
    }
    if (!moneda) {
      setErrorMsg('Debe seleccionar la Moneda de Cotización (*).');
      return;
    }

    if (editingLic) {
      // Editing existing Licitacion
      const updatedData = {
        id: editingLic.id,
        numeroLicitacion: numLic.trim() || editingLic.id,
        clienteId,
        fecha,
        fechaCotizacion: fechaCot || 'N/A',
        moneda,
        notas
      };
      onEditLicitacion(updatedData);

      // Save attached files
      if (attachedFiles.length && onAddAnexo) {
        attachedFiles.forEach(f => {
          onAddAnexo({
            id: `ANX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            licitacionId: editingLic.id,
            nombre: f.name,
            url: f.dataUrl,
            tipo: f.type,
            fecha: new Date().toISOString().split('T')[0]
          });
        });
      }
    } else {
      // Creating new Licitacion
      const generatedId = `LIC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newLic = {
        id: generatedId,
        numeroLicitacion: numLic.trim() ? numLic.trim() : generatedId,
        fecha,
        fechaCotizacion: fechaCot || 'N/A',
        clienteId,
        moneda,
        estatus: 'Abierto',
        notas,
        notasCotizacion: `Precios cotizados en ${moneda}. Despacho según acuerdo.`,
        contador: 1
      };

      onAddLicitacion(newLic);

      // Save attached files
      if (attachedFiles.length && onAddAnexo) {
        attachedFiles.forEach(f => {
          onAddAnexo({
            id: `ANX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            licitacionId: generatedId,
            nombre: f.name,
            url: f.dataUrl,
            tipo: f.type,
            fecha: new Date().toISOString().split('T')[0]
          });
        });
      }

      // Auto-create items from AI analysis
      if (aiResult?.items?.length > 0 && onAddDetalle) {
        aiResult.items.forEach((item, idx) => {
          onAddDetalle({
            id: `DET-${Date.now().toString(36).toUpperCase()}-${idx}`,
            licitacionId: generatedId,
            descripcion: item.descripcion || `Producto ${idx + 1}`,
            cantidadRequerida: item.cantidad || 1,
            unidad: item.unidad || 'unidad',
            condiciones: item.especificaciones || '',
            notas: '',
            anexos: []
          });
        });
      }
      setAiResult(null);
      setAiFile(null);
    }

    setShowModal(false);
  };

  const isSearchingGlobal = searchTerm.trim().length > 0;
  const currentMonthIndex = monthsList.findIndex(m => m.value === selectedMonth);

  // Deletion Integrity Checks for selected licitación
  const countDetalles = deletingLic ? detalles.filter(d => d.licitacionId === deletingLic.id).length : 0;
  const countCotizaciones = deletingLic ? cotizaciones.filter(c => c.licitacionId === deletingLic.id).length : 0;
  const countAnexos = deletingLic ? anexos.filter(a => a.licitacionId === deletingLic.id).length : 0;
  const countNotas = deletingLic ? notasLicitacion.filter(n => n.licitacionId === deletingLic.id).length : 0;
  const totalAssociatedRecords = countDetalles + countCotizaciones + countAnexos + countNotas;
  const hasAssociatedData = totalAssociatedRecords > 0;

  return (
    <div className="space-y-3 w-full">
      {/* Ultra-Compact 1-Line Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 w-full">
        <div className="shrink-0">
          <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Licitaciones</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Listado de licitaciones realizadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Contextual Search Input Box */}
          <div className="relative min-w-[180px] sm:min-w-[240px] flex-1">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
              placeholder="Buscar por licitación, cliente..."
              className="w-full pl-8 pr-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans shadow-inner"
            />
          </div>

          {/* Contextual Month Navigation Controls */}
          <div className={`flex items-center space-x-1 bg-zinc-900 border ${isSearchingGlobal ? 'border-amber-800/60 bg-amber-950/20' : 'border-zinc-800'} rounded-lg p-0.5 text-xs text-zinc-300 transition-colors`}>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer disabled:opacity-40"
              title="Mes Anterior"
              disabled={currentMonthIndex >= monthsList.length - 1 || isSearchingGlobal}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center space-x-1 px-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth && setSelectedMonth(e.target.value)}
                disabled={isSearchingGlobal}
                className="bg-transparent text-xs text-zinc-100 font-semibold focus:outline-none cursor-pointer pr-0.5 disabled:opacity-50"
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
              disabled={currentMonthIndex <= 0 || isSearchingGlobal}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Global Search Indicator */}
          {isSearchingGlobal && (
            <span className="text-[11px] font-medium text-amber-400 bg-amber-950/40 px-2 py-1 rounded-md border border-amber-800/60 flex items-center gap-1">
              <span>Búsqueda Global</span>
            </span>
          )}

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-400">
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

          {/* Compact "Nuevo" Button on Far Right */}
          <Button variant="primary" size="sm" className="px-3 py-1.5 text-xs shrink-0" onClick={handleOpenCreateModal}>
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Main Table Canvas */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Sin licitaciones para este período"
          description={isSearchingGlobal ? `No se encontraron licitaciones que coincidan con "${searchTerm}".` : `No se encontraron licitaciones para ${selectedMonth}. Utiliza las flechas para consultar otro mes.`}
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
                <th className="px-4 py-3 text-right">Acciones</th>
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
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(e, lic)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-950/40 transition-colors cursor-pointer"
                        title="Editar Licitación"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenDeleteModal(e, lic)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Eliminar Licitación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar Licitación con Adjuntos y Validación Estricta */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLic ? `Editar Licitación (${editingLic.numeroLicitacion || editingLic.id})` : "Registrar Nueva Licitación"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cliente Solicitante (*) - Obligatorio */}
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">
              Cliente Solicitante <span className="text-red-400 font-bold">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
              >
                <option value="" disabled>Seleccione un cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.rut || c.id})</option>
                ))}
              </select>
              {onAddCliente && (
                <button
                  type="button"
                  onClick={() => {
                    setNewClienteNombre('');
                    setNewClienteRut('');
                    setNewClienteError('');
                    setShowNewClienteModal(true);
                  }}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shrink-0"
                  title="Crear Cliente Rápido"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              )}
            </div>
            {clientes.length === 0 && (
              <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                No hay clientes registrados. Crea uno con el botón <UserPlus className="w-3 h-3 inline" />.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Fecha Recepción (*) - Obligatorio */}
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1">
                Fecha Recepción <span className="text-red-400 font-bold">*</span>
              </label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            {/* Moneda de Cotización (*) - Obligatorio */}
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1">
                Moneda de Cotización <span className="text-red-400 font-bold">*</span>
              </label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                required
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
              >
                <option value="CLP">Pesos Chilenos (CLP)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="UF">Unidades de Fomento (UF)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Número de Licitación / ID - Opcional */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                No. Licitación / Ref. <span className="text-zinc-500 text-[10px]">(Opcional)</span>
              </label>
              <Input
                type="text"
                value={numLic}
                onChange={(e) => setNumLic(e.target.value)}
                placeholder="Ej: LIC-2026-CDK-0899"
              />
            </div>

            {/* Fecha Límite Cotización - Opcional */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Fecha Límite Oferta <span className="text-zinc-500 text-[10px]">(Opcional)</span>
              </label>
              <Input
                type="date"
                value={fechaCot}
                onChange={(e) => setFechaCot(e.target.value)}
              />
            </div>
          </div>

          {/* Observaciones / Notas - Opcional */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Observaciones / Requerimiento <span className="text-zinc-500 text-[10px]">(Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles técnicos, condiciones de entrega o notas generales..."
              className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* AI Registration Zone */}
          {!editingLic && (
            <div className="border border-indigo-800/50 rounded-xl p-3 bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Registrar con AI</span>
                  <span className="text-zinc-500 text-[10px] font-normal">(Sube bases técnicas y la IA creará la licitación)</span>
                </label>
              </div>

              {!aiResult ? (
                <div>
                  <div
                    className="border-2 border-dashed border-indigo-800/50 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-600/70 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500'); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('border-indigo-500'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-indigo-500');
                      const f = e.dataTransfer.files[0];
                      if (f) setAiFile(f);
                    }}
                    onClick={() => document.getElementById('ai-file-input')?.click()}
                  >
                    <input
                      id="ai-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                      className="hidden"
                      onChange={(e) => { if (e.target.files[0]) setAiFile(e.target.files[0]); }}
                    />
                    {aiFile ? (
                      <div className="flex items-center justify-center gap-2 text-indigo-300 text-xs">
                        <FileCheck className="w-4 h-4" />
                        <span className="font-medium">{aiFile.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setAiFile(null); }} className="text-zinc-400 hover:text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-indigo-400 mx-auto" />
                        <p className="text-[11px] text-zinc-400">Arrastra o haz clic para subir un documento</p>
                        <p className="text-[10px] text-zinc-600">Word, PDF, Excel o imágenes</p>
                      </div>
                    )}
                  </div>

                  {aiFile && (
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={async () => {
                        setAiLoading(true);
                        setAiError('');
                        try {
                          const result = await analizarDocumentoLicitacion(aiFile);
                          if (result.success && result.data) {
                            const d = result.data;
                            // Pre-fill form fields
                            if (d.numeroLicitacion) setNumLic(d.numeroLicitacion);
                            if (d.moneda) setMoneda(d.moneda);
                            if (d.fechaRecepcion) setFecha(d.fechaRecepcion);
                            if (d.fechaLimite) setFechaCot(d.fechaLimite);
                            if (d.observaciones) setNotas(d.observaciones);
                            // Match client by name if possible
                            if (d.clienteNombre) {
                              const matchedClient = clientes.find(c => c.nombre.toLowerCase().includes(d.clienteNombre.toLowerCase()));
                              if (matchedClient) setClienteId(matchedClient.id);
                            }
                            setAiResult(d);
                          }
                        } catch (err) {
                          setAiError('Error al analizar el documento.');
                        } finally {
                          setAiLoading(false);
                        }
                      }}
                      className="w-full mt-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Analizando documento...</span></>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5" /><span>Analizar con AI</span></>
                      )}
                    </button>
                  )}

                  {aiError && (
                    <p className="text-[11px] text-red-400 mt-1">{aiError}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Datos extraídos exitosamente
                    </span>
                    <button
                      type="button"
                      onClick={() => { setAiResult(null); setAiFile(null); }}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      Reiniciar
                    </button>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 text-[11px] text-zinc-300 space-y-1 border border-zinc-800">
                    <p>✅ Formulario pre-llenado con datos del documento</p>
                    {aiResult.items && aiResult.items.length > 0 && (
                      <p className="text-indigo-300">
                        ✨ {aiResult.items.length} producto(s) detectados — se crearán automáticamente al guardar
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Carga y Adjunto de Archivos y Fotografías (Opcional) */}
          <div className="border border-zinc-800/80 rounded-xl p-3 bg-zinc-950/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                <span>Adjuntar Archivos y Fotografías</span>
                <span className="text-zinc-500 text-[10px] font-normal">(Opcional)</span>
              </label>

              <label className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer transition-colors flex items-center space-x-1">
                <Upload className="w-3 h-3 text-blue-400" />
                <span>Examinar</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {attachedFiles.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Paperclip className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                      <span className="text-zinc-200 font-medium truncate">{file.name}</span>
                      <span className="text-zinc-500 text-[10px] font-mono">({file.size})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachedFile(idx)}
                      className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                      title="Quitar archivo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 italic">
                Bases técnicas, PDFs o fotografías adjuntas a esta licitación.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingLic ? "Guardar Cambios" : "Crear Licitación"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminación con Verificación de Integridad Referencial */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingLic(null);
        }}
        title={`Eliminar Licitación: ${deletingLic ? (deletingLic.numeroLicitacion || deletingLic.id) : ''}`}
      >
        <div className="space-y-4">
          {hasAssociatedData ? (
            <div className="p-3.5 bg-amber-950/50 border border-amber-800/80 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>No se puede eliminar esta licitación</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Esta licitación no se encuentra vacía. Contiene información asociada en la base de datos:
              </p>

              <ul className="text-xs text-amber-300/90 list-disc list-inside space-y-1 font-mono pl-1">
                {countDetalles > 0 && <li>{countDetalles} ítem(s) de productos o consultas a proveedores</li>}
                {countCotizaciones > 0 && <li>{countCotizaciones} cotización(es) PDF emitida(s)</li>}
                {countAnexos > 0 && <li>{countAnexos} archivo(s) anexo(s) adjunto(s)</li>}
                {countNotas > 0 && <li>{countNotas} nota(s) en la bitácora interna</li>}
              </ul>

              <p className="text-[11px] text-zinc-400 pt-1">
                Para eliminar esta licitación, primero debe ingresar a su ficha y remover todos los elementos vinculados.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
              <p className="text-xs text-zinc-200">
                ¿Está seguro que desea eliminar permanentemente la licitación <strong className="text-zinc-100">{deletingLic?.numeroLicitacion || deletingLic?.id}</strong>?
              </p>
              <p className="text-xs text-zinc-400">
                Esta licitación se encuentra completamente limpia sin registros asociados. Esta acción no se podrá deshacer.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingLic(null);
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="danger"
              size="sm"
              disabled={hasAssociatedData}
              onClick={handleConfirmDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmar Eliminar</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* QUICK CLIENT CREATION MODAL */}
      <Modal
        isOpen={showNewClienteModal}
        onClose={() => setShowNewClienteModal(false)}
        title="Crear Cliente Rápido"
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">
              Nombre / Razón Social <span className="text-red-400 font-bold">*</span>
            </label>
            <Input
              type="text"
              value={newClienteNombre}
              onChange={(e) => setNewClienteNombre(e.target.value)}
              placeholder="Ej: Empresa ABC S.A."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">
              RUT <span className="text-zinc-500 text-[10px]">(opcional)</span>
            </label>
            <Input
              type="text"
              value={newClienteRut}
              onChange={(e) => setNewClienteRut(e.target.value)}
              placeholder="Ej: 76.123.456-7"
            />
          </div>

          {newClienteError && (
            <div className="flex items-start space-x-2 p-2 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{newClienteError}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" onClick={() => setShowNewClienteModal(false)}>
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const nombre = newClienteNombre.trim();
                const rut = newClienteRut.trim();
                if (!nombre) {
                  setNewClienteError('El nombre del cliente es obligatorio.');
                  return;
                }
                // Check RUT duplicates only if provided
                if (rut && clientes.some(c => c.rut && c.rut.toLowerCase() === rut.toLowerCase())) {
                  setNewClienteError('Ya existe un cliente con ese RUT.');
                  return;
                }
                const newId = 'CLI-' + Date.now().toString(36).toUpperCase();
                const newCliente = {
                  id: newId,
                  nombre,
                  rut,
                  direccion: '',
                  telefono: '',
                  email: '',
                  contacto: ''
                };
                onAddCliente(newCliente);
                setClienteId(newId);
                setShowNewClienteModal(false);
              }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear y Seleccionar</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
