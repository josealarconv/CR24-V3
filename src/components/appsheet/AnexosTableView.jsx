import React, { useState } from 'react';
import { Paperclip, Eye, Download, Trash2, Image as ImageIcon, FileText } from 'lucide-react';
import { EmptyState, Modal, Button, Badge } from '../ui/Components';

export default function AnexosTableView({ anexos = [], onDeleteAnexo }) {
  const [viewingAnexo, setViewingAnexo] = useState(null);
  const [deletingAnexo, setDeletingAnexo] = useState(null);

  const isImage = (anexo) => {
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

  const handleDownload = (anexo) => {
    if (!anexo) return;
    const link = document.createElement('a');
    link.href = anexo.url;
    link.download = anexo.nombre || 'anexo_adjunto';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDelete = () => {
    if (!deletingAnexo || !onDeleteAnexo) return;
    onDeleteAnexo(deletingAnexo.id);
    if (viewingAnexo && viewingAnexo.id === deletingAnexo.id) {
      setViewingAnexo(null);
    }
    setDeletingAnexo(null);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-blue-400" />
          <span>Repositorio Maestro de Anexos y Documentos</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Archivos PDF, bases técnicas y fotografías adjuntas a las licitaciones con visor integrado.
        </p>
      </div>

      {anexos.length === 0 ? (
        <EmptyState
          title="Sin anexos adjuntos"
          description="No se han subido archivos adjuntos todavía."
          icon={Paperclip}
        />
      ) : (
        <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs w-full">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Nombre del Archivo</th>
                <th className="px-4 py-3">Referencia / Licitación</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {anexos.map((a) => {
                const imageFile = isImage(a);
                return (
                  <tr key={a.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-sans font-medium text-zinc-100">
                      <div className="flex items-center space-x-2">
                        {imageFile ? (
                          <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        <span>{a.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 uppercase font-sans">
                      {a.licitacionId || a.entidadId || 'General'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-sans">
                      <Badge variant={imageFile ? "success" : "info"}>
                        {imageFile ? 'Fotografía' : 'Documento PDF'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {a.fecha || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingAnexo(a)}
                          className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/80 text-blue-400 hover:bg-blue-900/80 flex items-center space-x-1 text-xs font-semibold cursor-pointer transition-all"
                          title="Visualizar en pantalla"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(a)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Descargar archivo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {onDeleteAnexo && (
                          <button
                            type="button"
                            onClick={() => setDeletingAnexo(a)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Eliminar anexo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Visualizador Maximizador Sin Cabeceras Redundantes (92vw x 83vh) */}
      <Modal
        isOpen={!!viewingAnexo}
        onClose={() => setViewingAnexo(null)}
        title={viewingAnexo?.nombre || 'Visualizador de Anexo'}
        maxWidth="max-w-[92vw]"
      >
        <div className="w-full">
          {viewingAnexo && (
            isImage(viewingAnexo) ? (
              <div className="h-[83vh] flex items-center justify-center bg-zinc-950 p-2 rounded-xl border border-zinc-800 overflow-auto">
                <img
                  src={viewingAnexo.url}
                  alt={viewingAnexo.nombre}
                  className="max-h-[81vh] max-w-full object-contain rounded-lg shadow-2xl"
                />
              </div>
            ) : (
              <iframe
                src={viewingAnexo.url}
                className="w-full h-[83vh] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
                title="Visualizador de Documento"
              />
            )
          )}
        </div>
      </Modal>

      {/* Modal Confirmación Borrado de Anexo */}
      <Modal
        isOpen={!!deletingAnexo}
        onClose={() => setDeletingAnexo(null)}
        title={`Eliminar Anexo: ${deletingAnexo?.nombre || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            ¿Está seguro que desea eliminar el archivo adjunto <strong className="text-zinc-100">{deletingAnexo?.nombre}</strong>? Esta acción no se podrá deshacer.
          </p>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" onClick={() => setDeletingAnexo(null)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmar Eliminar</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
