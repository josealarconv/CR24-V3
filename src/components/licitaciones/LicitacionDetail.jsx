import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Building,
  Calendar,
  FileCheck,
  Share2,
  Download,
  Sparkles,
  Paperclip,
  DollarSign,
  MessageSquare,
  Send,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';
import { generateCotizacionPDF, generateWhatsAppShareLink, generateSMSShareLink, generateEmailShareLink } from '../../services/pdfService';
import { ASSETS } from '../../config/assets';

export default function LicitacionDetail({
  licitacion,
  cliente,
  detalles = [],
  consultas = [],
  proveedores = [],
  anexos = [],
  onBack,
  onAddDetalle,
  onAddConsulta,
  onAddAnexo,
  onUpdateStatus,
  openAiAssistant
}) {
  const [activeTab, setActiveTab] = useState('detalles'); // 'detalles', 'consultas', 'anexos', 'cotizacion'
  const [newDesc, setNewDesc] = useState('');
  const [newCant, setNewCant] = useState(1);
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [selectedDetalle, setSelectedDetalle] = useState(null);

  // Form states for consulta
  const [selectedProveedorId, setSelectedProveedorId] = useState('');
  const [precioInput, setPrecioInput] = useState('');

  const handleCreateDetalle = (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    onAddDetalle({
      id: `DET-${Date.now().toString().slice(-4)}`,
      licitacionId: licitacion.id,
      descripcion: newDesc,
      cantidad: parseInt(newCant) || 1,
      porcentajeEnvio: 3.0,
      notas: ''
    });
    setNewDesc('');
    setNewCant(1);
  };

  const handleCreateConsulta = (e) => {
    e.preventDefault();
    if (!selectedDetalle || !selectedProveedorId || !precioInput) return;
    const precio = parseFloat(precioInput) || 0;
    const cant = selectedDetalle.cantidad || 1;
    const sub = cant * precio;
    const iva = Math.round(sub * 0.19);
    const total = sub + iva;

    onAddConsulta({
      id: `CNS-${Date.now().toString().slice(-4)}`,
      detalleId: selectedDetalle.id,
      proveedorId: selectedProveedorId,
      cantidad: cant,
      precioUnitario: precio,
      subtotal: sub,
      iva: iva,
      total: total,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Recibido'
    });

    setShowConsultaModal(false);
    setPrecioInput('');
    setSelectedProveedorId('');
  };

  const handleDownloadPDF = () => {
    const doc = generateCotizacionPDF(
      { id: `COT-${licitacion.id.replace('LIC-', '')}`, fecha: new Date().toISOString().split('T')[0] },
      licitacion,
      cliente,
      detalles,
      consultas
    );
    doc.save(`Cotizacion_${licitacion.numeroLicitacion || licitacion.id}.pdf`);
  };

  const getProveedorNombre = (id) => {
    const prov = proveedores.find(p => p.id === id);
    return prov ? prov.nombre : 'Proveedor Generico';
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Volver a la lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">
                Licitación {licitacion.numeroLicitacion || licitacion.id}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
                {licitacion.estatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Cliente: <strong className="text-slate-200">{cliente?.nombre || 'N/A'}</strong></span>
              <span>•</span>
              <span>Ingreso: <span className="font-mono">{licitacion.fecha}</span></span>
            </p>
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openAiAssistant(`Analiza esta licitación ${licitacion.numeroLicitacion} para el cliente ${cliente?.nombre} y sugiere proveedores óptimos.`)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Investigar con Gemini</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 space-x-4">
        {[
          { id: 'detalles', label: `Productos / Detalles (${detalles.length})` },
          { id: 'consultas', label: `Consultas de Precios (${consultas.length})` },
          { id: 'anexos', label: `Anexos (${anexos.length})` },
          { id: 'cotizacion', label: 'Cotización & PDF' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DETALLES DE LICITACION */}
      {activeTab === 'detalles' && (
        <div className="space-y-4">
          {/* Add New Line Item Form */}
          <form onSubmit={handleCreateDetalle} className="flex gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descripción del producto o insumo..."
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="number"
              min="1"
              value={newCant}
              onChange={(e) => setNewCant(e.target.value)}
              placeholder="Cant."
              className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none text-center"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Ítem</span>
            </button>
          </form>

          {/* List of Details */}
          {detalles.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-sm">No hay ítems agregados a esta licitación.</p>
          ) : (
            <div className="space-y-3">
              {detalles.map((item, idx) => {
                const itemConsultas = consultas.filter(c => c.detalleId === item.id);
                return (
                  <div key={item.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-blue-400 font-mono font-bold">Ítem #{idx + 1}</span>
                        <h3 className="text-base font-semibold text-white mt-0.5">{item.descripcion}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Cantidad:</span>
                        <span className="block text-base font-bold text-white font-mono">{item.cantidad}</span>
                      </div>
                    </div>

                    {/* Associated Consultas Summary */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400">Precios Recibidos de Proveedores:</span>
                        <button
                          onClick={() => {
                            setSelectedDetalle(item);
                            setShowConsultaModal(true);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Consultar Proveedor</span>
                        </button>
                      </div>

                      {itemConsultas.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No hay consultas de precio registradas para este ítem.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {itemConsultas.map(c => (
                            <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-0">
                              <span className="text-slate-300 font-medium">{getProveedorNombre(c.proveedorId)}</span>
                              <span className="font-mono text-emerald-400 font-bold">${c.precioUnitario?.toLocaleString('es-CL')} / c/u</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONSULTAS DE PRECIOS */}
      {activeTab === 'consultas' && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Historial de Consultas de Precios de la Licitación</h2>
          {consultas.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Sin consultas registradas.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {consultas.map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{getProveedorNombre(c.proveedorId)}</p>
                    <p className="text-xs text-slate-400 font-mono">Fecha: {c.fecha} • Cantidad: {c.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400 font-mono">${c.total?.toLocaleString('es-CL')}</p>
                    <p className="text-[11px] text-slate-400">Neto: ${c.subtotal?.toLocaleString('es-CL')} + IVA</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANEXOS */}
      {activeTab === 'anexos' && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Documentos y Anexos Asociados</h2>
          </div>
          {anexos.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No hay anexos adjuntos a esta licitación.</p>
          ) : (
            <div className="space-y-2">
              {anexos.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Paperclip className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">{a.nombre}</p>
                      <p className="text-xs text-slate-400 font-mono">{a.fecha}</p>
                    </div>
                  </div>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COTIZACIÓN & COMPARTIR */}
      {activeTab === 'cotizacion' && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Resumen de Cotización PDF</h2>
              <p className="text-xs text-slate-400">Cotización formal con membrete de {ASSETS.COMPANY_NAME}</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Documento PDF</span>
            </button>
          </div>

          {/* Share Links (Bloque VII - Puntos 75-78) */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Compartir Cotización Directamente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={generateWhatsAppShareLink({ id: licitacion.id, total: 2558500 }, cliente)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 p-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </a>

              <a
                href={generateEmailShareLink({ id: licitacion.id, total: 2558500 }, cliente)}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Enviar por Correo</span>
              </a>

              <a
                href={generateSMSShareLink({ id: licitacion.id, total: 2558500 }, cliente)}
                className="flex items-center justify-center space-x-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar por SMS</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Consulta de Precio */}
      {showConsultaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Registrar Consulta de Precio</h3>
            <p className="text-xs text-slate-400">Ítem: <strong className="text-slate-200">{selectedDetalle?.descripcion}</strong></p>

            <form onSubmit={handleCreateConsulta} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Seleccionar Proveedor</label>
                <select
                  value={selectedProveedorId}
                  onChange={(e) => setSelectedProveedorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
                  required
                >
                  <option value="">-- Elige un proveedor --</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Precio Unitario Neto (CLP)</label>
                <input
                  type="number"
                  value={precioInput}
                  onChange={(e) => setPrecioInput(e.target.value)}
                  placeholder="Ej: 385000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConsultaModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
                >
                  Guardar Precio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
