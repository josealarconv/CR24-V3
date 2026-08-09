import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, MapPin, Edit2, Trash2, X, Save, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';

export default function ClientesList({ clientes = [], licitaciones = [], onAddCliente, onEditCliente, onDeleteCliente }) {
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [deletingCliente, setDeletingCliente] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [direccionDespacho, setDireccionDespacho] = useState('');
  const [notas, setNotas] = useState('');

  const resetForm = () => {
    setNombre('');
    setRut('');
    setContacto('');
    setEmail('');
    setTelefono('');
    setDireccion('');
    setDireccionDespacho('');
    setNotas('');
  };

  const handleOpenCreate = () => {
    setEditingCliente(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCliente(c);
    setNombre(c.nombre || '');
    setRut(c.rut || '');
    setContacto(c.contacto || '');
    setEmail(c.email || '');
    setTelefono(c.telefono || '');
    setDireccion(c.direccion || '');
    setDireccionDespacho(c.direccionDespacho || '');
    setNotas(c.notas || '');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingCliente) {
      // Edit mode
      onEditCliente({
        ...editingCliente,
        nombre: nombre.trim(),
        rut: rut.trim(),
        contacto: contacto.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        direccionDespacho: direccionDespacho.trim(),
        notas: notas.trim()
      });
    } else {
      // Create mode
      const newId = 'CLI-' + Date.now().toString(36).toUpperCase();
      onAddCliente({
        id: newId,
        nombre: nombre.trim(),
        rut: rut.trim(),
        contacto: contacto.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        direccionDespacho: direccionDespacho.trim(),
        notas: notas.trim()
      });
    }
    setShowModal(false);
    resetForm();
    setEditingCliente(null);
  };

  const handleOpenDelete = (c) => {
    const licsCount = licitaciones.filter(l => l.clienteId === c.id).length;
    if (licsCount > 0) {
      setDeleteError(`No se puede eliminar. Este cliente tiene ${licsCount} licitación(es) asociada(s). Debe eliminar las licitaciones primero.`);
    } else {
      setDeleteError(null);
    }
    setDeletingCliente(c);
  };

  const handleConfirmDelete = () => {
    if (!deletingCliente || deleteError) return;
    onDeleteCliente(deletingCliente.id);
    setDeletingCliente(null);
  };

  // Display RUT or ID fallback
  const displayRut = (c) => c.rut ? c.rut : c.id;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Directorio Maestro de Clientes</span>
            <span className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{clientes.length}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Gestión de clientes y licitaciones históricas asociadas.</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreate}>
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
                  <p className="text-[11px] text-zinc-500 font-mono">{c.rut ? `RUT: ${c.rut}` : c.id}</p>
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
                {(c.telefono) && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{c.telefono}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">{c.direccionDespacho || c.direccion || 'Sin dirección'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-1 pt-2 border-t border-zinc-800/80">
                {onEditCliente && (
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Editar Cliente"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDeleteCliente && (
                  <button
                    onClick={() => handleOpenDelete(c)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Eliminar Cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingCliente(null); }}
        title={editingCliente ? `Editar: ${editingCliente.nombre}` : 'Registrar Nuevo Cliente'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Razón Social <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre de la empresa"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">RUT</label>
              <Input
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="Ej: 96.852.140-5 (opcional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Persona de Contacto</label>
              <Input
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Correo Electrónico</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@empresa.cl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Teléfono</label>
            <Input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+56 9 ..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Dirección Comercial</label>
              <Input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección principal"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Dirección de Despacho</label>
              <Input
                type="text"
                value={direccionDespacho}
                onChange={(e) => setDireccionDespacho(e.target.value)}
                placeholder="Bodega / Faena"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Notas Internas</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones sobre este cliente..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => { setShowModal(false); setEditingCliente(null); }}>
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </Button>
            <Button variant="primary" size="sm" type="submit">
              <Save className="w-3.5 h-3.5" />
              <span>{editingCliente ? 'Guardar Cambios' : 'Registrar Cliente'}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingCliente}
        onClose={() => setDeletingCliente(null)}
        title={`Eliminar: ${deletingCliente?.nombre || ''}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          {deleteError ? (
            <div className="flex items-start space-x-2 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          ) : (
            <div className="flex items-start space-x-2 p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                ¿Estás seguro de eliminar al cliente <strong>{deletingCliente?.nombre}</strong>?
                Esta acción es irreversible.
              </span>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" onClick={() => setDeletingCliente(null)}>
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </Button>
            {!deleteError && (
              <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Eliminar</span>
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
