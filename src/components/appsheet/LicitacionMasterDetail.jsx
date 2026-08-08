import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Building,
  Download,
  Sparkles,
  Paperclip,
  Share2,
  Send,
  MessageSquare,
  ExternalLink,
  DollarSign,
  FileText,
  Upload
} from 'lucide-react';
import { generateCotizacionPDF, generateWhatsAppShareLink, generateSMSShareLink, generateEmailShareLink } from '../../services/pdfService';
import { uploadFileToStorage } from '../../services/firebaseStorageService';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';
import { ASSETS } from '../../config/assets';

export default function LicitacionMasterDetail({
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
  const [activeTab, setActiveTab] = useState('detalles'); // 'detalles', 'consultas', 'cotizacion', 'anexos'

  // New Detalle Form
  const [newDesc, setNewDesc] = useState('');
  const [newCant, setNewCant] = useState(1);
  const [newPorcentaje, setNewPorcentaje] = useState(3.0);

  // New Consulta Modal
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [selectedDetalle, setSelectedDetalle] = useState(null);
  const [selectedProveedorId, setSelectedProveedorId] = useState('');
  const [precioInput, setPrecioInput] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);

  const handleCreateDetalle = (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    onAddDetalle({
      id: `DET-${Date.now().toString().slice(-4)}`,
      licitacionId: licitacion.id,
      descripcion: newDesc,
      cantidad: parseInt(newCant) || 1,
      porcentajeEnvio: parseFloat(newPorcentaje) || 0,
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const res = await uploadFileToStorage(file, 'anexos');
    setUploading(false);

    if (res.success) {
      onAddAnexo({
        id: `ANX-${Date.now().toString().slice(-4)}`,
        entidad: 'licitacion',
        entidadId: licitacion.id,
        nombre: res.nombre,
        url: res.url,
        tipo: res.tipo,
        fecha: new Date().toISOString().split('T')[0]
      });
    }
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
    return prov ? prov.nombre : 'Proveedor Genérico';
  };

  // Compute live cotización totals
  const subtotalTotal = detalles.reduce((acc, det) => {
    const cns = consultas.find(c => c.detalleId === det.id);
    const price = cns ? cns.precioUnitario : 0;
    return acc + (det.cantidad || 1) * price;
  }, 0);
  const ivaTotal = Math.round(subtotalTotal * 0.19);
  const grandTotal = subtotalTotal + ivaTotal;

  return (
    <div className="space-y-5 pb-12">
      {/* Master Licitacion Header Card */}
      <div className="bg-zinc-900/80 p-5 rounded-xl border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
              title="Volver a la tabla de licitaciones"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg font-bold text-zinc-100 font-mono">
                  Licitación {licitacion.numeroLicitacion || licitacion.id}
                </h1>
                <Badge variant="info">{licitacion.estatus}</Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cliente: <strong className="text-zinc-200">{cliente?.nombre || 'N/A'}</strong> (RUT: {cliente?.rut || 'N/A'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openAiAssistant(`Investiga la licitación ${licitacion.numeroLicitacion} del cliente ${cliente?.nombre} y sugiere proveedores.`)}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Gemini AI</span>
            </Button>

            {/* SINGLE PRIMARY ACTION BUTTON (Bloque III Punto 26) */}
            <Button variant="primary" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Cotización PDF</span>
            </Button>
          </div>
        </div>

        {/* Licitacion Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Fecha Ingreso</span>
            <span className="font-semibold text-zinc-200 font-mono">{licitacion.fecha}</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Fecha Limite Cotizar</span>
            <span className="font-semibold text-zinc-200 font-mono">{licitacion.fechaCotizacion || 'N/A'}</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Líneas de Productos</span>
            <span className="font-semibold text-zinc-200 font-mono">{detalles.length} Ítems</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Monto Cotizado (CLP)</span>
            <span className="font-bold text-emerald-400 font-mono">${grandTotal.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {licitacion.notas && (
          <p className="text-xs text-zinc-400 bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-800/60 italic">
            <strong className="not-italic text-zinc-300">Notas de Licitación:</strong> {licitacion.notas}
          </p>
        )}
      </div>

      {/* AppSheet Tab Navigation for Sub-tables */}
      <div className="flex border-b border-zinc-800 space-x-4">
        {[
          { id: 'detalles', label: `Líneas de Productos (${detalles.length})` },
          { id: 'consultas', label: `Consultas a Proveedores (${consultas.length})` },
          { id: 'cotizacion', label: 'Cotización Final & PDF' },
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

      {/* SUB-TABLE 1: DETALLES DE LICITACIÓN (LINE ITEMS) */}
      {activeTab === 'detalles' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateDetalle} className="flex gap-2 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descripción del producto o insumo..."
              className="flex-1"
            />
            <input
              type="number"
              min="1"
              value={newCant}
              onChange={(e) => setNewCant(e.target.value)}
              placeholder="Cant."
              className="w-20 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none text-center font-mono"
            />
            <input
              type="number"
              step="0.5"
              value={newPorcentaje}
              onChange={(e) => setNewPorcentaje(e.target.value)}
              placeholder="% Envío"
              className="w-20 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none text-center font-mono"
              title="Porcentaje de Envío"
            />
            <Button type="submit" variant="secondary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar</span>
            </Button>
          </form>

          {detalles.length === 0 ? (
            <p className="text-center py-8 text-zinc-500 text-xs">No hay ítems registrados en esta licitación.</p>
          ) : (
            <div className="space-y-3">
              {detalles.map((item, idx) => {
                const itemConsultas = consultas.filter(c => c.detalleId === item.id);
                return (
                  <Card key={item.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] text-blue-400 font-mono font-bold">Línea #{idx + 1}</span>
                        <h3 className="text-sm font-semibold text-zinc-100 mt-0.5">{item.descripcion}</h3>
                        {item.porcentajeEnvio > 0 && (
                          <span className="text-[10px] text-zinc-500 font-mono">% Envío: {item.porcentajeEnvio}%</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500">Requerido:</span>
                        <span className="block text-sm font-bold text-zinc-100 font-mono">{item.cantidad} u.</span>
                      </div>
                    </div>

                    {/* Associated Consultas */}
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-400">Precios Recibidos:</span>
                        <button
                          onClick={() => {
                            setSelectedDetalle(item);
                            setShowConsultaModal(true);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Registrar Precio Proveedor</span>
                        </button>
                      </div>

                      {itemConsultas.length === 0 ? (
                        <p className="text-[11px] text-zinc-500 italic">No se han registrado consultas de precios para este ítem.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {itemConsultas.map(c => (
                            <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/50 last:border-0">
                              <span className="text-zinc-300 font-medium">{getProveedorNombre(c.proveedorId)}</span>
                              <span className="font-mono text-emerald-400 font-bold">${c.precioUnitario?.toLocaleString('es-CL')} / c/u</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TABLE 2: CONSULTAS DE PRECIOS */}
      {activeTab === 'consultas' && (
        <Card title="Consultas de Precios Registradas a Proveedores">
          {consultas.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No hay consultas asociadas a esta licitación.</p>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {consultas.map(c => (
                <div key={c.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-100">{getProveedorNombre(c.proveedorId)}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">Fecha: {c.fecha} • Cantidad: {c.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400 font-mono">${c.total?.toLocaleString('es-CL')}</p>
                    <p className="text-[10px] text-zinc-500">Neto: ${c.subtotal?.toLocaleString('es-CL')} + 19% IVA</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SUB-TABLE 3: COTIZACIÓN & GENERADOR PDF */}
      {activeTab === 'cotizacion' && (
        <Card title="Cotización Final PDF & Envíos">
          <div className="space-y-5">
            <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80 space-y-2">
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Subtotal Neto:</span>
                <span>${subtotalTotal.toLocaleString('es-CL')} CLP</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>IVA (19%):</span>
                <span>${ivaTotal.toLocaleString('es-CL')} CLP</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-100 border-t border-zinc-800 pt-2 font-mono">
                <span>TOTAL COTIZACIÓN:</span>
                <span className="text-emerald-400">${grandTotal.toLocaleString('es-CL')} CLP</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-400">Documento formal con membrete de {ASSETS.COMPANY_NAME}</p>
              <Button variant="primary" size="md" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4" />
                <span>Descargar PDF</span>
              </Button>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">Opciones de Envío</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={generateWhatsAppShareLink({ id: licitacion.id, total: grandTotal }, cliente)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 p-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </a>

                <a
                  href={generateEmailShareLink({ id: licitacion.id, total: grandTotal }, cliente)}
                  className="flex items-center justify-center space-x-2 p-2.5 bg-blue-950/30 hover:bg-blue-950/50 text-blue-300 border border-blue-800/60 rounded-lg text-xs font-medium transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por Correo</span>
                </a>

                <a
                  href={generateSMSShareLink({ id: licitacion.id, total: grandTotal }, cliente)}
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

      {/* SUB-TABLE 4: ANEXOS Y ARCHIVOS */}
      {activeTab === 'anexos' && (
        <Card title="Anexos y Archivos Adjuntos">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <label className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Subiendo...' : 'Adjuntar Archivo (PDF / Imagen)'}</span>
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
              <p className="text-xs text-zinc-500 py-4 text-center">Sin archivos adjuntos en esta licitación.</p>
            ) : (
              <div className="space-y-2">
                {anexos.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                    <div className="flex items-center space-x-2.5">
                      <Paperclip className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs font-medium text-zinc-200">{a.nombre}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{a.fecha}</p>
                      </div>
                    </div>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal Consulta */}
      <Modal
        isOpen={showConsultaModal}
        onClose={() => setShowConsultaModal(false)}
        title="Registrar Consulta de Precio a Proveedor"
      >
        <form onSubmit={handleCreateConsulta} className="space-y-3">
          <p className="text-xs text-zinc-400">Línea de Producto: <strong className="text-zinc-200">{selectedDetalle?.descripcion}</strong></p>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Proveedor Consultado</label>
            <select
              value={selectedProveedorId}
              onChange={(e) => setSelectedProveedorId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
              required
            >
              <option value="">-- Elige un proveedor --</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Precio Unitario Cotizado (CLP)</label>
            <Input
              type="number"
              value={precioInput}
              onChange={(e) => setPrecioInput(e.target.value)}
              placeholder="Ej: 385000"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowConsultaModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar Precio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
