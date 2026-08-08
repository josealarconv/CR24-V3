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
  ExternalLink
} from 'lucide-react';
import { generateCotizacionPDF, generateWhatsAppShareLink, generateSMSShareLink, generateEmailShareLink } from '../../services/pdfService';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';
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
  openAiAssistant
}) {
  const [activeTab, setActiveTab] = useState('detalles');
  const [newDesc, setNewDesc] = useState('');
  const [newCant, setNewCant] = useState(1);
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [selectedDetalle, setSelectedDetalle] = useState(null);

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
    return prov ? prov.nombre : 'Proveedor Genérico';
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-zinc-100">
                Licitación {licitacion.numeroLicitacion || licitacion.id}
              </h1>
              <Badge variant="info">{licitacion.estatus}</Badge>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>Cliente: <strong className="text-zinc-200">{cliente?.nombre || 'N/A'}</strong></span>
              <span>•</span>
              <span>Ingreso: <span className="font-mono">{licitacion.fecha}</span></span>
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openAiAssistant(`Analiza esta licitación ${licitacion.numeroLicitacion} para el cliente ${cliente?.nombre} y sugiere proveedores.`)}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Investigar con Gemini</span>
          </Button>

          {/* SINGLE PRIMARY ACTION BUTTON (Bloque III Punto 26) */}
          <Button variant="primary" size="sm" onClick={handleDownloadPDF}>
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </Button>
        </div>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex border-b border-zinc-800 space-x-4">
        {[
          { id: 'detalles', label: `Productos / Detalles (${detalles.length})` },
          { id: 'consultas', label: `Consultas de Precios (${consultas.length})` },
          { id: 'anexos', label: `Anexos (${anexos.length})` },
          { id: 'cotizacion', label: 'Cotización & PDF' }
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

      {/* TAB 1: DETALLES DE LICITACIÓN */}
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
            <Button type="submit" variant="secondary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Ítem</span>
            </Button>
          </form>

          {detalles.length === 0 ? (
            <p className="text-center py-8 text-zinc-500 text-xs">No hay ítems agregados a esta licitación.</p>
          ) : (
            <div className="space-y-3">
              {detalles.map((item, idx) => {
                const itemConsultas = consultas.filter(c => c.detalleId === item.id);
                return (
                  <Card key={item.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] text-blue-400 font-mono font-bold">Ítem #{idx + 1}</span>
                        <h3 className="text-sm font-semibold text-zinc-100 mt-0.5">{item.descripcion}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500">Cantidad:</span>
                        <span className="block text-sm font-bold text-zinc-100 font-mono">{item.cantidad}</span>
                      </div>
                    </div>

                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-400">Precios Recibidos de Proveedores:</span>
                        <button
                          onClick={() => {
                            setSelectedDetalle(item);
                            setShowConsultaModal(true);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Consultar Proveedor</span>
                        </button>
                      </div>

                      {itemConsultas.length === 0 ? (
                        <p className="text-[11px] text-zinc-500 italic">No hay consultas registradas para este ítem.</p>
                      ) : (
                        <div className="space-y-1">
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

      {/* TAB 2: CONSULTAS DE PRECIOS */}
      {activeTab === 'consultas' && (
        <Card title="Historial de Consultas de Precios de la Licitación">
          {consultas.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">Sin consultas registradas.</p>
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
                    <p className="text-[10px] text-zinc-500">Neto: ${c.subtotal?.toLocaleString('es-CL')} + IVA</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: ANEXOS */}
      {activeTab === 'anexos' && (
        <Card title="Documentos y Anexos Asociados">
          {anexos.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No hay anexos adjuntos a esta licitación.</p>
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
                    className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: COTIZACIÓN & PDF */}
      {activeTab === 'cotizacion' && (
        <Card title="Cotización PDF & Envíos Directos">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <p className="text-xs text-zinc-400">Cotización formal lista con membrete de {ASSETS.COMPANY_NAME}</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </Button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">Compartir Cotización</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={generateWhatsAppShareLink({ id: licitacion.id, total: 2558500 }, cliente)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 p-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar WhatsApp</span>
                </a>

                <a
                  href={generateEmailShareLink({ id: licitacion.id, total: 2558500 }, cliente)}
                  className="flex items-center justify-center space-x-2 p-2.5 bg-blue-950/30 hover:bg-blue-950/50 text-blue-300 border border-blue-800/60 rounded-lg text-xs font-medium transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Correo</span>
                </a>

                <a
                  href={generateSMSShareLink({ id: licitacion.id, total: 2558500 }, cliente)}
                  className="flex items-center justify-center space-x-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-medium transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar SMS</span>
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal Consulta */}
      <Modal
        isOpen={showConsultaModal}
        onClose={() => setShowConsultaModal(false)}
        title="Registrar Consulta de Precio"
      >
        <form onSubmit={handleCreateConsulta} className="space-y-3">
          <p className="text-xs text-zinc-400">Ítem: <strong className="text-zinc-200">{selectedDetalle?.descripcion}</strong></p>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Seleccionar Proveedor</label>
            <select
              value={selectedProveedorId}
              onChange={(e) => setSelectedProveedorId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
              required
            >
              <option value="">-- Seleccionar proveedor --</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Precio Unitario Neto (CLP)</label>
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
