import React, { useState } from 'react';
import { FileCheck, Download, Eye, FileText, X } from 'lucide-react';
import { Badge, Card, EmptyState, Button, Modal } from '../ui/Components';
import { generateCotizacionPDF } from '../../services/pdfService';

export default function CotizacionesTableView({
  cotizaciones = [],
  clientes = [],
  licitaciones = [],
  detalles = [],
  consultas = []
}) {
  const [viewingPdfModal, setViewingPdfModal] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
  const [currentCotizacionTitle, setCurrentCotizacionTitle] = useState('');
  const [currentDocInstance, setCurrentDocInstance] = useState(null);

  const getClienteObj = (clienteId) => {
    return clientes.find(cli => cli.id === clienteId);
  };

  const getClienteNombre = (clienteId) => {
    const c = getClienteObj(clienteId);
    return c ? c.nombre : 'Cliente Desconocido';
  };

  const handleOpenPdfViewer = (cot) => {
    const cliente = getClienteObj(cot.clienteId);
    const licitacion = licitaciones.find(l => l.id === cot.licitacionId);
    const licDetalles = detalles.filter(d => d.licitacionId === cot.licitacionId);

    const doc = generateCotizacionPDF(cot, licitacion, cliente, licDetalles, consultas);
    const blobUrl = doc.output('bloburl');

    setCurrentDocInstance(doc);
    setCurrentPdfUrl(blobUrl);
    setCurrentCotizacionTitle(`Cotización ${cot.id || 'N/A'} - v${cot.version || 1}`);
    setViewingPdfModal(true);
  };

  const handleDownloadPdfDirect = (cot) => {
    const cliente = getClienteObj(cot.clienteId);
    const licitacion = licitaciones.find(l => l.id === cot.licitacionId);
    const licDetalles = detalles.filter(d => d.licitacionId === cot.licitacionId);

    const doc = generateCotizacionPDF(cot, licitacion, cliente, licDetalles, consultas);
    doc.save(`Cotizacion_${cot.id || 'N/A'}_v${cot.version || 1}.pdf`);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>Cotizaciones PDF Emitidas</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Histórico y visualizador de documentos PDF de cotización emitidos a clientes.
          </p>
        </div>
      </div>

      {cotizaciones.length === 0 ? (
        <EmptyState
          title="Sin cotizaciones emitidas"
          description="No se han generado documentos de cotización formal aún."
          icon={FileCheck}
        />
      ) : (
        <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs w-full">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">No. Cotización</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Versión</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total (CLP)</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {cotizaciones.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-100 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{c.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans text-zinc-300">
                    {getClienteNombre(c.clienteId)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {c.fecha || '2025-01-10'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-bold">
                    v{c.version || 1}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <Badge variant="success">{c.estado || 'Emitida'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">
                    ${c.total ? c.total.toLocaleString('es-CL') : '0'}
                  </td>
                  <td className="px-4 py-3 text-right font-sans">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenPdfViewer(c)}
                        className="px-2 py-1 rounded-lg bg-blue-950/60 border border-blue-800/80 text-blue-400 hover:bg-blue-900/80 flex items-center space-x-1 text-xs font-semibold cursor-pointer transition-all"
                        title="Visualizar PDF en pantalla"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPdfDirect(c)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Descargar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Visualizador Integrado de PDF */}
      <Modal
        isOpen={viewingPdfModal}
        onClose={() => {
          setViewingPdfModal(false);
          setCurrentPdfUrl(null);
        }}
        title={currentCotizacionTitle || 'Visualizador de Cotización PDF'}
      >
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 text-xs">
            <span className="text-zinc-400 font-mono">Documento interactivo generado oficialmente.</span>
            {currentDocInstance && (
              <Button
                variant="primary"
                size="xs"
                onClick={() => currentDocInstance.save(`${currentCotizacionTitle}.pdf`)}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Archivo PDF</span>
              </Button>
            )}
          </div>

          {currentPdfUrl ? (
            <iframe
              src={currentPdfUrl}
              className="w-full h-[70vh] rounded-xl border border-zinc-800 bg-zinc-900 shadow-inner"
              title="Visualizador de PDF en Tiempo Real"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-zinc-500 text-xs">
              Cargando documento PDF...
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
