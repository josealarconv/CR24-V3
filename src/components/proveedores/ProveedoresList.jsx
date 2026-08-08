import React, { useState } from 'react';
import { Building2, Mail, Phone, Plus } from 'lucide-react';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';

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
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Proveedores (Entidad Maestra)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Catálogo maestro recurrente para consultas de precios.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proveedores.map(p => {
          const consultasCount = consultas.filter(c => c.proveedorId === p.id).length;
          return (
            <Card key={p.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">{p.nombre}</h3>
                  <p className="text-[11px] text-zinc-500 font-mono">RUT: {p.rut}</p>
                </div>
                <Badge variant="info">
                  {consultasCount} Consultas
                </Badge>
              </div>

              <div className="text-xs text-zinc-400 space-y-1.5 pt-2.5 border-t border-zinc-800/80">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{p.email || 'Sin correo registrado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{p.contacto || 'Sin contacto directo'}</span>
                </div>
                {p.condicionesComerciales && (
                  <p className="text-[11px] text-zinc-400 bg-zinc-950/50 p-2 rounded border border-zinc-800/80 mt-2">
                    <strong className="text-zinc-300">Condiciones:</strong> {p.condicionesComerciales}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Nuevo Proveedor"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre / Razón Social"
            required
          />
          <Input
            type="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="RUT (Ej: 77.516.671-2)"
            required
          />
          <Input
            type="text"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            placeholder="Contacto / Teléfono"
          />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo Electrónico"
          />
          <Input
            type="text"
            value={condiciones}
            onChange={(e) => setCondiciones(e.target.value)}
            placeholder="Condiciones Comerciales (Ej: Crédito 15 días)"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar Proveedor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
