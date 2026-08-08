import React from 'react';
import { FileCheck, Download } from 'lucide-react';
import { Badge, Card, EmptyState, Button } from '../ui/Components';

export default function CotizacionesTableView({ cotizaciones = [], clientes = [] }) {
  const getClienteNombre = (id) => {
    const c = clientes.find(cli => cli.id === id);
    return c ? c.nombre : 'Cliente Desconocido';
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-400" />
          <span>Tabla Operativa: Cotizaciones PDF Emitidas</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">Histórico de documentos PDF de cotización emitidos a clientes.</p>
      </div>

      {cotizaciones.length === 0 ? (
        <EmptyState
          title="Sin cotizaciones emitidas"
          description="No se han generado documentos de cotización formal aún."
          icon={FileCheck}
        />
      ) : (
        <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">No. Cotización</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Versión</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total (CLP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {cotizaciones.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-100 font-mono">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 font-sans text-zinc-300">
                    {getClienteNombre(c.clienteId)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {c.fecha}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    v{c.version || 1}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <Badge variant="success">{c.estado || 'Emitida'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">
                    ${c.total?.toLocaleString('es-CL')}
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
