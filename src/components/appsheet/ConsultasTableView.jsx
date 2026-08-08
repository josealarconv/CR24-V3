import React from 'react';
import { DollarSign, Building } from 'lucide-react';
import { Badge, Card, EmptyState } from '../ui/Components';

export default function ConsultasTableView({ consultas = [], proveedores = [], detalles = [] }) {
  const getProveedorNombre = (id) => {
    const p = proveedores.find(prv => prv.id === id);
    return p ? p.nombre : 'Proveedor Genérico';
  };

  const getDetalleDesc = (detalleId) => {
    const d = detalles.find(det => det.id === detalleId);
    return d ? d.descripcion : 'Insumo Genérico';
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Tabla Operativa: Consultas de Precios</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">Historial maestro de cotizaciones recibidas de proveedores.</p>
      </div>

      {consultas.length === 0 ? (
        <EmptyState
          title="Sin consultas de precios"
          description="No se han registrado consultas de precios todavía."
          icon={DollarSign}
        />
      ) : (
        <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Ítem / Insumo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">P. Unitario</th>
                <th className="px-4 py-3 text-right">Total Final (CLP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {consultas.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-sans font-semibold text-zinc-100">
                    <div className="flex items-center space-x-2">
                      <Building className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{getProveedorNombre(c.proveedorId)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans text-zinc-300">
                    {getDetalleDesc(c.detalleId)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {c.fecha}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {c.cantidad} u.
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    ${c.precioUnitario?.toLocaleString('es-CL')}
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
