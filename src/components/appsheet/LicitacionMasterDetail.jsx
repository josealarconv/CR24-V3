import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Download,
  Sparkles,
  Paperclip,
  Share2,
  Send,
  MessageSquare,
  ExternalLink,
  DollarSign,
  FileText,
  Upload,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  Printer,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { generateCotizacionPDF, generateWhatsAppShareLink, generateSMSShareLink, generateEmailShareLink } from '../../services/pdfService';
import { uploadFileToStorage } from '../../services/firebaseStorageService';
import { investigarProductoConGemini } from '../../services/geminiService';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';
import { ASSETS } from '../../config/assets';

export default function LicitacionMasterDetail({
  licitacion,
  cliente,
  detalles = [],
  consultas = [],
  proveedores = [],
  anexos = [],
  notasLicitacion = [],
  investigacionesIa = [],
  cotizaciones = [],
  currentUser,
  onBack,
  onAddDetalle,
  onAddConsulta,
  onAddAnexo,
  onDeleteAnexo,
  onAddNotaLicitacion,
  onAddInvestigacionIa,
  onAddCotizacionVersion,
  onUpdateEstatus
}) {
  const [activeTab, setActiveTab] = useState('detalles'); // 'detalles' | 'consultas' | 'cotizacion' | 'anexos' | 'notas' | 'ia_history'

  // New Line Item Form State
  const [newDesc, setNewDesc] = useState('');
  const [newCantReq, setNewCantReq] = useState(1);
  const [newNotasItem, setNewNotasItem] = useState('');

  // New Price Inquiry State (Costing Structure)
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [selectedDetalle, setSelectedDetalle] = useState(null);
  const [selectedProveedorId, setSelectedProveedorId] = useState('');
  const [cantADespacharInput, setCantADespacharInput] = useState(1);
  const [precioBaseInput, setPrecioBaseInput] = useState('');
  const [costoFleteInput, setCostoFleteInput] = useState('0');
  const [costoInternacionInput, setCostoInternacionInput] = useState('0');
  const [costoAfexInput, setCostoAfexInput] = useState('0');

  // New Note State
  const [newNotaText, setNewNotaText] = useState('');

  // Gemini Research Loading State
  const [loadingAiDetalleId, setLoadingAiDetalleId] = useState(null);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [viewingAnexoDetail, setViewingAnexoDetail] = useState(null);
  const [deletingAnexoDetail, setDeletingAnexoDetail] = useState(null);

  const isImageAnexo = (anexo) => {
    if (!anexo) return false;
    const type = (anexo.tipo || '').toLowerCase();
    const url = (anexo.url || '').toLowerCase();
    const name = (anexo.nombre || '').toLowerCase();
    return (
      type.startsWith('image/') ||
      url.startsWith('data:image/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp') ||
      name.endsWith('.gif') ||
      name.endsWith('.svg')
    );
  };

  const handlePrintAnexo = () => {
    if (!viewingAnexoDetail) return;
    const printWindow = window.open(viewingAnexoDetail.url, '_blank');
    if (printWindow) {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDownloadAnexo = (anexo) => {
    if (!anexo) return;
    const link = document.createElement('a');
    link.href = anexo.url;
    link.download = anexo.nombre || 'anexo_adjunto';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDeleteAnexo = () => {
    if (!deletingAnexoDetail || !onDeleteAnexo) return;
    onDeleteAnexo(deletingAnexoDetail.id);
    if (viewingAnexoDetail && viewingAnexoDetail.id === deletingAnexoDetail.id) {
      setViewingAnexoDetail(null);
    }
    setDeletingAnexoDetail(null);
  };

  // Status Enum Options
  const estatusList = [
    'Abierto',
    'Consultando proveedores',
    'Cotizado al cliente',
    'Aprobado',
    'No aprobado',
    'A la espera de despacho',
    'Despacho enviado',
    'Esperando cobro',
    'Cobrado',
    'Pagado',
    'Cerrado'
  ];

  const getProveedorNombre = (id) => {
    const prov = proveedores.find(p => p.id === id);
    return prov ? prov.nombre : 'Proveedor Genérico';
  };

  const formatMoney = (amount, currency = 'CLP') => {
    const num = Number(amount) || 0;
    if (currency === 'USD') {
      return `USD $${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `CLP $${Math.round(num).toLocaleString('es-CL')}`;
  };

  // Compute Multi-Supplier Weighted Cost for a Detalle Item
  const computeItemCosting = (detalleId) => {
    const itemConsultas = consultas.filter(c => c.detalleId === detalleId && c.estado === 'Aceptada');
    if (itemConsultas.length === 0) {
      return { totalQtyDespachable: 0, totalCostoCompuesto: 0, costoPromedioPonderado: 0 };
    }

    const totalQtyDespachable = itemConsultas.reduce((acc, c) => acc + (c.cantidadADespachar || 0), 0);
    const totalCostoCompuesto = itemConsultas.reduce((acc, c) => acc + (c.subtotalCosto || 0), 0);
    const costoPromedioPonderado = totalQtyDespachable > 0 ? totalCostoCompuesto / totalQtyDespachable : 0;

    return { totalQtyDespachable, totalCostoCompuesto, costoPromedioPonderado };
  };

  // Grand Total Calculations across all items
  const grandTotalCost = detalles.reduce((acc, det) => {
    const { totalCostoCompuesto } = computeItemCosting(det.id);
    return acc + totalCostoCompuesto;
  }, 0);

  // Assuming 25% default margin over total composite cost
  const subtotalCotizado = Math.round(grandTotalCost * 1.25);
  const ivaTotal = licitacion.moneda === 'CLP' ? Math.round(subtotalCotizado * 0.19) : 0; // IVA usually applies to domestic CLP
  const totalCotizacion = subtotalCotizado + ivaTotal;

  const handleCreateDetalle = (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    onAddDetalle({
      id: `DET-${Date.now().toString().slice(-4)}`,
      licitacionId: licitacion.id,
      descripcion: newDesc.trim(),
      cantidadRequerida: parseInt(newCantReq) || 1,
      cantidadACotizar: parseInt(newCantReq) || 1,
      notas: newNotasItem.trim()
    });

    setNewDesc('');
    setNewCantReq(1);
    setNewNotasItem('');
  };

  const handleCreateConsulta = (e) => {
    e.preventDefault();
    if (!selectedDetalle || !selectedProveedorId || !precioBaseInput) return;

    const base = parseFloat(precioBaseInput) || 0;
    const flete = parseFloat(costoFleteInput) || 0;
    const internacion = parseFloat(costoInternacionInput) || 0;
    const afex = parseFloat(costoAfexInput) || 0;
    const qty = parseInt(cantADespacharInput) || 1;

    const costoUnitarioCompuesto = base + flete + internacion + afex;
    const subtotalCosto = qty * costoUnitarioCompuesto;

    onAddConsulta({
      id: `CNS-${Date.now().toString().slice(-4)}`,
      detalleId: selectedDetalle.id,
      proveedorId: selectedProveedorId,
      cantidadADespachar: qty,
      precioBase: base,
      costoFlete: flete,
      costoInternacion: internacion,
      costoAfex: afex,
      costoUnitarioCompuesto,
      subtotalCosto,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Aceptada'
    });

    setShowConsultaModal(false);
    setPrecioBaseInput('');
    setCostoFleteInput('0');
    setCostoInternacionInput('0');
    setCostoAfexInput('0');
  };

  const handleAddNotaSubmit = (e) => {
    e.preventDefault();
    if (!newNotaText.trim()) return;

    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    onAddNotaLicitacion({
      id: `NTA-${Date.now().toString().slice(-4)}`,
      licitacionId: licitacion.id,
      fechaHora: dateStr,
      usuario: currentUser?.nombre || 'Usuario Operador',
      texto: newNotaText.trim()
    });

    setNewNotaText('');
  };

  // Gemini Research protocol with AI history (does not overwrite previous entries)
  const handleTriggerAiResearch = async (detalle) => {
    setLoadingAiDetalleId(detalle.id);
    const res = await investigarProductoConGemini(detalle.descripcion, detalle.notas);
    setLoadingAiDetalleId(null);

    if (res.success) {
      const now = new Date();
      const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

      onAddInvestigacionIa({
        id: `INV-${Date.now().toString().slice(-4)}`,
        detalleId: detalle.id,
        fechaHora: dateStr,
        usuario: currentUser?.nombre || 'Usuario Operador',
        resultadoJSON: res.data
      });

      setActiveTab('ia_history');
    }
  };

  // PDF Generation with versioning (never overwrites previous PDFs)
  const handleGenerateVersionedPDF = () => {
    const existingVersions = cotizaciones.filter(c => c.licitacionId === licitacion.id);
    const nextVersionNum = existingVersions.length + 1;

    const doc = generateCotizacionPDF(
      { id: `COT-${licitacion.numeroLicitacion}-V${nextVersionNum}`, fecha: new Date().toISOString().split('T')[0] },
      licitacion,
      cliente,
      detalles,
      consultas
    );

    doc.save(`Cotizacion_${licitacion.numeroLicitacion || licitacion.id}_v${nextVersionNum}.pdf`);

    // Add versioned record to Cotizaciones table
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    onAddCotizacionVersion({
      id: `COT-${licitacion.id.replace('LIC-', '')}-V${nextVersionNum}`,
      licitacionId: licitacion.id,
      clienteId: licitacion.clienteId,
      numeroCotizacion: `COT-2025-${nextVersionNum.toString().padStart(3, '0')}`,
      version: nextVersionNum,
      fechaHora: dateStr,
      usuario: currentUser?.nombre || 'Usuario Operador',
      moneda: licitacion.moneda || 'CLP',
      subtotalNeto: subtotalCotizado,
      iva: ivaTotal,
      total: totalCotizacion,
      pdfUrl: '#',
      notasCotizacion: licitacion.notasCotizacion || 'Cotización formal Suministros Industriales Orión'
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const res = await uploadFileToStorage(file, 'anexos');
    setUploading(false);

    if (res.success) {
      onAddAnexo({
        id: `ANX-${Date.now().toString().slice(-4)}`,
        licitacionId: licitacion.id,
        nombre: res.nombre,
        url: res.url,
        tipo: res.tipo,
        fecha: new Date().toISOString().split('T')[0]
      });
    }
  };

  const itemInvestigaciones = investigacionesIa.filter(inv => detalles.some(d => d.id === inv.detalleId));

  return (
    <div className="space-y-5 pb-12 w-full">
      {/* Master Licitacion Header Card (100% Screen Width) */}
      <div className="bg-zinc-900/80 p-5 rounded-xl border border-zinc-800/80 space-y-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Volver a la tabla de licitaciones"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg font-bold text-zinc-100 font-mono">
                  {licitacion.numeroLicitacion || licitacion.id}
                </h1>
                <Badge variant="info">{licitacion.estatus}</Badge>
                <Badge variant="default">{licitacion.moneda || 'CLP'}</Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cliente: <strong className="text-zinc-200">{cliente?.nombre || 'N/A'}</strong> (RUT: {cliente?.rut || 'N/A'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Change Selector */}
            <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Estatus:</span>
              <select
                value={licitacion.estatus}
                onChange={(e) => onUpdateEstatus(licitacion.id, e.target.value)}
                className="bg-transparent text-xs text-zinc-100 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {estatusList.map(st => (
                  <option key={st} value={st} className="bg-zinc-900">{st}</option>
                ))}
              </select>
            </div>

            {/* Versioned PDF Generation Action */}
            <Button variant="primary" size="sm" onClick={handleGenerateVersionedPDF}>
              <FileCheck className="w-3.5 h-3.5" />
              <span>Cotizar</span>
            </Button>
          </div>
        </div>

        {/* Licitacion Metadata Grid (Full Width) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full">
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Fecha Ingreso</span>
            <span className="font-semibold text-zinc-200 font-mono">{licitacion.fecha}</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Fecha Límite Cotizar</span>
            <span className="font-semibold text-zinc-200 font-mono">{licitacion.fechaCotizacion || 'N/A'}</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Moneda Operación</span>
            <span className="font-bold text-blue-400 font-mono">{licitacion.moneda || 'CLP'}</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Total Cotización Calculada</span>
            <span className="font-bold text-emerald-400 font-mono">{formatMoney(totalCotizacion, licitacion.moneda)}</span>
          </div>
        </div>

        {licitacion.notas && (
          <p className="text-xs text-zinc-400 bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-800/60">
            <strong className="text-zinc-300">Notas de la Licitación:</strong> {licitacion.notas}
          </p>
        )}
      </div>

      {/* Tab Navigation for Sub-tables (Clean Simplified Labels) */}
      <div className="flex border-b border-zinc-800 space-x-4 w-full">
        {[
          { id: 'detalles', label: `Productos (${detalles.length})` },
          { id: 'consultas', label: `Consultas (${consultas.length})` },
          { id: 'cotizacion', label: `Cotizaciones (${cotizaciones.length})` },
          { id: 'notas', label: `Notas (${notasLicitacion.length})` },
          { id: 'ia_history', label: `Consulta IA (${itemInvestigaciones.length})` },
          { id: 'anexos', label: `Anexos (${anexos.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-500 text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TABLE 1: DETALLES DE LICITACIÓN (PRODUCTOS REDISEÑADOS CON LOOK PREMIUM) */}
      {activeTab === 'detalles' && (
        <div className="space-y-4 w-full">
          {/* Header Action & Form Panel */}
          <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/90 shadow-lg space-y-3 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>Registro de Productos y Requerimientos</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Ingresa los insumos requeridos para solicitar precios a proveedores y calcular costos compuestos.</p>
              </div>

              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2.5 py-1 rounded-lg">
                {detalles.length} Ítem(s) en Lista
              </span>
            </div>

            <form onSubmit={handleCreateDetalle} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <div className="sm:col-span-8">
                <Input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ej: Multímetro Digital Fluke 87V TRMS / Válvula Mariposa 6 pulgadas..."
                  className="w-full bg-zinc-950 border-zinc-800 text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  value={newCantReq}
                  onChange={(e) => setNewCantReq(e.target.value)}
                  placeholder="Cantidad"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none text-center font-mono font-bold"
                  title="Cantidad requerida en la licitación"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" variant="primary" size="md" className="w-full justify-center">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Ítem</span>
                </Button>
              </div>
            </form>
          </div>

          {/* List of Products (Executive High-End Product Cards) */}
          {detalles.length === 0 ? (
            <EmptyState
              title="Sin productos en esta licitación"
              description="Utiliza el formulario superior para ingresar los requerimientos del cliente."
              icon={FileText}
            />
          ) : (
            <div className="space-y-3.5 w-full">
              {detalles.map((item, idx) => {
                const { totalQtyDespachable, totalCostoCompuesto, costoPromedioPonderado } = computeItemCosting(item.id);
                const itemConsultas = consultas.filter(c => c.detalleId === item.id);
                const isAiLoading = loadingAiDetalleId === item.id;
                const reqQty = item.cantidadRequerida || 1;
                const coveragePercent = Math.min(100, Math.round((totalQtyDespachable / reqQty) * 100));
                const isFullyCovered = totalQtyDespachable >= reqQty;
                const isPartiallyCovered = totalQtyDespachable > 0 && totalQtyDespachable < reqQty;

                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700/80 rounded-xl p-4 space-y-3.5 shadow-xl transition-all backdrop-blur-md"
                  >
                    {/* Top Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/70 pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/90 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-zinc-100 tracking-wide">{item.descripcion}</h3>
                            
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-300 border border-zinc-800">
                              📦 Requerido: {reqQty} u.
                            </span>

                            {isFullyCovered && (
                              <span className="text-[10px] font-medium font-sans px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Cobertura 100% ({totalQtyDespachable}/{reqQty} u.)</span>
                              </span>
                            )}

                            {isPartiallyCovered && (
                              <span className="text-[10px] font-medium font-sans px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Cobertura Parcial ({totalQtyDespachable}/{reqQty} u.)</span>
                              </span>
                            )}

                            {!totalQtyDespachable && (
                              <span className="text-[10px] font-medium font-sans px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500">
                                ⚪ Sin Proveedor Asignado
                              </span>
                            )}
                          </div>

                          {item.notas && <p className="text-xs text-zinc-400 mt-1 italic">{item.notas}</p>}
                        </div>
                      </div>

                      {/* Action Buttons Deck */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          disabled={isAiLoading}
                          onClick={() => handleTriggerAiResearch(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-950 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 border border-blue-800/80 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
                          title="Investigar distribuidores y precio referencial mercado con Gemini IA"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isAiLoading ? 'Investigando IA...' : 'Investigar IA'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDetalle(item);
                            setCantADespacharInput(reqQty);
                            setShowConsultaModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Asignar Proveedor</span>
                        </button>
                      </div>
                    </div>

                    {/* 3-KPI Financial Costing Summary Deck */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
                      <div>
                        <span className="text-zinc-500 text-[10px] font-mono uppercase block">Unidades Ofertadas Proveedores:</span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="font-bold text-zinc-100 font-mono text-xs">
                            {totalQtyDespachable} / {reqQty} u.
                          </span>
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${isFullyCovered ? 'bg-emerald-400' : 'bg-blue-400'}`}
                              style={{ width: `${coveragePercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-500 text-[10px] font-mono uppercase block">Costo Unitario Ponderado:</span>
                        <span className="font-bold text-zinc-200 font-mono text-xs mt-0.5 block">
                          {formatMoney(costoPromedioPonderado, licitacion.moneda)} / u.
                        </span>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-zinc-500 text-[10px] font-mono uppercase block">Costo Total Compuesto Ítem:</span>
                        <span className="font-bold text-emerald-400 font-mono text-sm mt-0.5 block">
                          {formatMoney(totalCostoCompuesto, licitacion.moneda)}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Suppliers Sub-Table / Mini List */}
                    {itemConsultas.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-zinc-400 text-[11px] font-semibold block flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Proveedores Asignados ({itemConsultas.length}):</span>
                        </span>

                        <div className="space-y-1 bg-zinc-950/40 rounded-lg p-2 border border-zinc-800/60 divide-y divide-zinc-800/50">
                          {itemConsultas.map(c => (
                            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 text-xs gap-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-zinc-200">{getProveedorNombre(c.proveedorId)}</span>
                                <Badge variant="success" size="xs">{c.cantidadADespachar} u.</Badge>
                              </div>

                              <div className="font-mono text-zinc-400 text-[11px]">
                                Base: <span className="text-zinc-300">{formatMoney(c.precioBase, licitacion.moneda)}</span> + (Flete: {c.costoFlete} + Internación: {c.costoInternacion} + AFEX: {c.costoAfex}) = <strong className="text-emerald-400 font-bold">{formatMoney(c.costoUnitarioCompuesto, licitacion.moneda)}/u</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TABLE 2: CONSULTAS DE PRECIOS */}
      {activeTab === 'consultas' && (
        <Card title="Consultas de Precios Aceptadas a Proveedores">
          {consultas.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No hay consultas de precios registradas.</p>
          ) : (
            <div className="divide-y divide-zinc-800/80 w-full">
              {consultas.map(c => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-zinc-100">{getProveedorNombre(c.proveedorId)}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      Cantidad despachable: {c.cantidadADespachar} u. • Fecha: {c.fecha}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-emerald-400">{formatMoney(c.subtotalCosto, licitacion.moneda)}</p>
                    <p className="text-[10px] text-zinc-500">Unitario Compuesto: {formatMoney(c.costoUnitarioCompuesto, licitacion.moneda)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SUB-TABLE 3: COTIZACIONES PDF VERSIONADAS */}
      {activeTab === 'cotizacion' && (
        <Card title="Historial de Cotizaciones PDF Emitidas (Versionadas)">
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <p className="text-xs text-zinc-400">Cada emisión genera un nuevo archivo PDF versionado sin eliminar versiones previas.</p>
              <Button variant="primary" size="sm" onClick={handleGenerateVersionedPDF}>
                <Download className="w-3.5 h-3.5" />
                <span>Generar Nueva Versión PDF</span>
              </Button>
            </div>

            {cotizaciones.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No se ha emitido ninguna cotización PDF aún.</p>
            ) : (
              <div className="space-y-2.5 w-full">
                {cotizaciones.map((cot) => (
                  <div key={cot.id} className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-zinc-100 font-mono">{cot.numeroCotizacion || cot.id}</span>
                        <Badge variant="info">Versión {cot.version}</Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        Emitido por: {cot.usuario} • {cot.fechaHora}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-emerald-400 font-mono">{formatMoney(cot.total, cot.moneda)}</span>
                      <Button variant="secondary" size="xs" onClick={handleGenerateVersionedPDF}>
                        <Download className="w-3 h-3" />
                        <span>Descargar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sharing Tools */}
            <div className="pt-3 border-t border-zinc-800">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">Opciones de Envio Directo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={generateWhatsAppShareLink({ id: licitacion.id, total: totalCotizacion }, cliente)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 p-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </a>

                <a
                  href={generateEmailShareLink({ id: licitacion.id, total: totalCotizacion }, cliente)}
                  className="flex items-center justify-center space-x-2 p-2.5 bg-blue-950/30 hover:bg-blue-950/50 text-blue-300 border border-blue-800/60 rounded-lg text-xs font-medium transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por Correo</span>
                </a>

                <a
                  href={generateSMSShareLink({ id: licitacion.id, total: totalCotizacion }, cliente)}
                  className="flex items-center justify-center space-x-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-medium transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar por SMS</span>
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUB-TABLE 4: NOTAS DE SEGUIMIENTO */}
      {activeTab === 'notas' && (
        <Card title="Notas de Seguimiento con Marca de Tiempo">
          <div className="space-y-4 w-full">
            <form onSubmit={handleAddNotaSubmit} className="flex gap-2">
              <Input
                value={newNotaText}
                onChange={(e) => setNewNotaText(e.target.value)}
                placeholder="Escribe una nota de seguimiento interno..."
                className="flex-1"
                required
              />
              <Button type="submit" variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Nota</span>
              </Button>
            </form>

            {notasLicitacion.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No hay notas de seguimiento registradas.</p>
            ) : (
              <div className="space-y-2 w-full">
                {notasLicitacion.map(n => (
                  <div key={n.id} className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                      <span>{n.usuario}</span>
                      <span>{n.fechaHora}</span>
                    </div>
                    <p className="text-zinc-200">{n.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* SUB-TABLE 5: HISTÓRICO DE INVESTIGACIÓN IA GEMINI */}
      {activeTab === 'ia_history' && (
        <Card title="Histórico de Investigaciones Gemini IA (Indexado por Ítem)">
          {itemInvestigaciones.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No se han realizado investigaciones de IA en esta licitación.</p>
          ) : (
            <div className="space-y-4 w-full">
              {itemInvestigaciones.map(inv => (
                <div key={inv.id} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-zinc-100 font-mono">Investigación IA - {inv.fechaHora}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Solicitado por: {inv.usuario}</span>
                  </div>

                  {inv.resultadoJSON && (
                    <div className="space-y-2 text-zinc-300">
                      <p><strong className="text-zinc-100">Resumen del Producto:</strong> {inv.resultadoJSON.resumenProducto}</p>
                      
                      <div>
                        <strong className="text-zinc-100 block mb-1">Especificaciones Técnicas:</strong>
                        <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                          {inv.resultadoJSON.especificacionesTecnicas?.map((spec, i) => (
                            <li key={i}>{spec}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60">
                        <div>
                          <strong className="text-zinc-200 block text-[11px]">Proveedores Locales (Chile):</strong>
                          <ul className="text-zinc-400 font-mono text-[11px] mt-0.5">
                            {inv.resultadoJSON.proveedoresLocalesChilenos?.map((p, i) => (
                              <li key={i}>• {p}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-zinc-200 block text-[11px]">Proveedores Internacionales:</strong>
                          <ul className="text-zinc-400 font-mono text-[11px] mt-0.5">
                            {inv.resultadoJSON.proveedoresInternacionales?.map((p, i) => (
                              <li key={i}>• {p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <p className="pt-2 font-mono text-emerald-400">
                        <strong>Rango Estimado Mercado:</strong> {inv.resultadoJSON.precioRangoMercado}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SUB-TABLE 6: ANEXOS Y ARCHIVOS */}
      {activeTab === 'anexos' && (
        <Card title="Anexos y Documentos Adjuntos">
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <p className="text-xs text-zinc-400">Documentos y fotografías adjuntas a esta licitación.</p>
              <label className="flex items-center space-x-2 px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-100 rounded-lg text-xs font-semibold cursor-pointer border border-blue-700/80 shadow-xs transition-all">
                <Plus className="w-3.5 h-3.5" />
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Subiendo...' : 'Agregar Anexo'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="application/pdf,image/*"
                  disabled={uploading}
                />
              </label>
            </div>

            {anexos.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Sin anexos adjuntos.</p>
            ) : (
              <div className="space-y-2 w-full">
                {anexos.map(a => {
                  const imageFile = isImageAnexo(a);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 text-xs">
                      <div className="flex items-center space-x-2.5">
                        {imageFile ? (
                          <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Paperclip className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-zinc-200">{a.nombre}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{a.fecha}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => setViewingAnexoDetail(a)}
                          className="px-2 py-1 rounded-lg bg-blue-950/60 border border-blue-800/80 text-blue-400 hover:bg-blue-900/80 flex items-center space-x-1 text-xs font-semibold cursor-pointer transition-all"
                          title="Visualizar en pantalla"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadAnexo(a)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Descargar archivo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {onDeleteAnexo && (
                          <button
                            type="button"
                            onClick={() => setDeletingAnexoDetail(a)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Eliminar anexo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal Visualizador Maximizador Sin Cabecera Redundante (92vw x 83vh) */}
      <Modal
        isOpen={!!viewingAnexoDetail}
        onClose={() => setViewingAnexoDetail(null)}
        title={viewingAnexoDetail?.nombre || 'Visualizador de Anexo'}
        maxWidth="max-w-[92vw]"
      >
        <div className="w-full">
          {viewingAnexoDetail && (
            isImageAnexo(viewingAnexoDetail) ? (
              <div className="h-[83vh] flex items-center justify-center bg-zinc-950 p-2 rounded-xl border border-zinc-800 overflow-auto">
                <img
                  src={viewingAnexoDetail.url}
                  alt={viewingAnexoDetail.nombre}
                  className="max-h-[81vh] max-w-full object-contain rounded-lg shadow-2xl"
                />
              </div>
            ) : (
              <iframe
                src={viewingAnexoDetail.url}
                className="w-full h-[83vh] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
                title="Visualizador de Documento"
              />
            )
          )}
        </div>
      </Modal>

      {/* Modal Borrado Anexo */}
      <Modal
        isOpen={!!deletingAnexoDetail}
        onClose={() => setDeletingAnexoDetail(null)}
        title={`Eliminar Anexo: ${deletingAnexoDetail?.nombre || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            ¿Está seguro que desea eliminar permanentemente el archivo adjunto <strong className="text-zinc-100">{deletingAnexoDetail?.nombre}</strong>?
          </p>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" onClick={() => setDeletingAnexoDetail(null)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDeleteAnexo}>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmar Eliminar</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Consulta de Precio (Costo Compuesto) */}
      <Modal
        isOpen={showConsultaModal}
        onClose={() => setShowConsultaModal(false)}
        title="Registrar Consulta de Precio a Proveedor"
      >
        <form onSubmit={handleCreateConsulta} className="space-y-3">
          <p className="text-xs text-zinc-400">Producto: <strong className="text-zinc-200">{selectedDetalle?.descripcion}</strong></p>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Proveedor Consultado</label>
            <select
              value={selectedProveedorId}
              onChange={(e) => setSelectedProveedorId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
              required
            >
              <option value="">-- Seleccionar Proveedor --</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Cant. a Despachar</label>
              <Input
                type="number"
                min="1"
                value={cantADespacharInput}
                onChange={(e) => setCantADespacharInput(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Precio Base Unitario ({licitacion.moneda})</label>
              <Input
                type="number"
                value={precioBaseInput}
                onChange={(e) => setPrecioBaseInput(e.target.value)}
                placeholder="Ej: 380000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 pt-2 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Flete</label>
              <Input
                type="number"
                value={costoFleteInput}
                onChange={(e) => setCostoFleteInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Internación</label>
              <Input
                type="number"
                value={costoInternacionInput}
                onChange={(e) => setCostoInternacionInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">AFEX (Admin)</label>
              <Input
                type="number"
                value={costoAfexInput}
                onChange={(e) => setCostoAfexInput(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowConsultaModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar Consulta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
