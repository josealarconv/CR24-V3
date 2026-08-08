import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, MapPin } from 'lucide-react';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';

export default function ClientesList({ clientes = [], licitaciones = [], onAddCliente }) {
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !rut) return;
    onAddCliente({
      id: `CLI-${Date.now().toString().slice(-4)}`,
      nombre,
      rut,
      contacto,
      email,
      direccion: 'Santiago, Chile',
      direccionDespacho: 'Bodega Principal',
      telefono: '+56 2 2999 0000',
      notas: ''
    });
    setShowModal(false);
    setNombre('');
    setRut('');
    setContacto('');
    setEmail('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Directorio Maestro de Clientes</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Gestión de clientes y licitaciones históricas asociadas.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map(c => {
          const licsCount = licitaciones.filter(l => l.clienteId === c.id).length;
          return (
            <Card key={c.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">{c.nombre}</h3>
                  <p className="text-[11px] text-zinc-500 font-mono">RUT: {c.rut}</p>
                </div>
                <Badge variant="default">
                  {licsCount} Licitaciones
                </Badge>
              </div>

              <div className="text-xs text-zinc-400 space-y-1.5 pt-2.5 border-t border-zinc-800/80">
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{c.contacto || 'Sin contacto directo'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{c.email || 'Sin correo'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">{c.direccionDespacho || c.direccion}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Nuevo Cliente"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Razón Social del Cliente"
            required
          />
          <Input
            type="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="RUT (Ej: 96.852.140-5)"
            required
          />
          <Input
            type="text"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            placeholder="Persona de Contacto"
          />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo Electrónico"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar Cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
