import React, { useState } from 'react';
import { Building2, Globe, Mail, Phone, Plus, FileSpreadsheet } from 'lucide-react';

export default function ProveedoresList({ proveedores = [], consultas = [], onAddProveedor }) {
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [condiciones, setCondiciones] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !rut) return;
    onAddProveedor({
      id: `PRV-${Date.now().toString().slice(-4)}`,
      nombre,
      rut,
      contacto,
      email,
      condicionesComerciales: condiciones || 'Contado / 15 días',
      sitioWeb: '',
      notas: ''
    });
    setShowModal(false);
    setNombre('');
    setRut('');
    setContacto('');
    setEmail('');
    setCondiciones('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Proveedores (Entidad Maestra)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Catálogo maestro recurrente para consultas de precios.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proveedores.map(p => {
          const consultasCount = consultas.filter(c => c.proveedorId === p.id).length;
          return (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{p.nombre}</h3>
                  <p className="text-xs text-slate-400 font-mono">RUT: {p.rut}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 font-mono border border-indigo-800">
                  {consultasCount} Consultas
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.email || 'Sin correo registrado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.contacto || 'Sin contacto directo'}</span>
                </div>
                {p.condicionesComerciales && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800/80 mt-2">
                    <strong className="text-slate-300">Condiciones:</strong> {p.condicionesComerciales}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Registrar Nuevo Proveedor</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre / Razón Social"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
                required
              />
              <input
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="RUT (Ej: 77.516.671-2)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
                required
              />
              <input
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Contacto / Teléfono"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo Electrónico"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
              />
              <input
                type="text"
                value={condiciones}
                onChange={(e) => setCondiciones(e.target.value)}
                placeholder="Condiciones Comerciales (Ej: Crédito 15 días)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
