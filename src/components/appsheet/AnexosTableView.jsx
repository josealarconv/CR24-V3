import React from 'react';
import { Paperclip, ExternalLink } from 'lucide-react';
import { EmptyState } from '../ui/Components';

export default function AnexosTableView({ anexos = [] }) {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-blue-400" />
          <span>Repositorio Maestro de Anexos y Documentos</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">Todos los archivos PDF y fotografías adjuntas a las licitaciones.</p>
      </div>

      {anexos.length === 0 ? (
        <EmptyState
          title="Sin anexos adjuntos"
          description="No se han subido archivos adjuntos todavía."
          icon={Paperclip}
        />
      ) : (
        <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Nombre del Archivo</th>
                <th className="px-4 py-3">Entidad Asoc.</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Abrir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {anexos.map((a) => (
                <tr key={a.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-sans font-medium text-zinc-100">
                    {a.nombre}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 uppercase font-sans">
                    {a.entidad} ({a.entidadId})
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {a.tipo || 'PDF/Imagen'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {a.fecha}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 inline-flex items-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
