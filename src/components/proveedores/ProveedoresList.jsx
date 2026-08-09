import React, { useState } from 'react';
import { Package, Plus, Mail, Phone, Globe, Edit2, Trash2, X, Save, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';

export default function ProveedoresList({ proveedores = [], consultas = [], onAddProveedor, onEditProveedor, onDeleteProveedor }) {
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [deletingProveedor, setDeletingProveedor] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [condiciones, setCondiciones] = useState('');
  const [notas, setNotas] = useState('');

  const resetForm = () => {
    setNombre('');
    setRut('');
    setContacto('');
    setEmail('');
    setTelefono('');
    setSitioWeb('');
    setCondiciones('');
    setNotas('');
  };

  const handleOpenCreate = () => {
    setEditingProveedor(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProveedor(p);
    setNombre(p.nombre || '');
    setRut(p.rut || '');
    setContacto(p.contacto || '');
    setEmail(p.email || '');
    setTelefono(p.telefono || '');
    setSitioWeb(p.sitioWeb || '');
    setCondiciones(p.condicionesComerciales || p.condiciones || '');
    setNotas(p.notas || '');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingProveedor) {
      onEditProveedor({
        ...editingProveedor,
        nombre: nombre.trim(),
        rut: rut.trim(),
        contacto: contacto.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        sitioWeb: sitioWeb.trim(),
        condicionesComerciales: condiciones.trim(),
        notas: notas.trim()
      });
    } else {
      const newId = 'PRV-' + Date.now().toString(36).toUpperCase();
      onAddProveedor({
        id: newId,
        nombre: nombre.trim(),
        rut: rut.trim(),
        contacto: contacto.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        sitioWeb: sitioWeb.trim(),
        condicionesComerciales: condiciones.trim(),
        notas: notas.trim()
      });
    }
    setShowModal(false);
    resetForm();
    setEditingProveedor(null);
  };

  const handleOpenDelete = (p) => {
    const consultasCount = consultas.filter(c => c.proveedorId === p.id).length;
    if (consultasCount > 0) {
      setDeleteError(`No se puede eliminar. Este proveedor tiene ${consultasCount} consulta(s) asociada(s). Debe eliminar las consultas primero.`);
    } else {
      setDeleteError(null);
    }
    setDeletingProveedor(p);
  };

  const handleConfirmDelete = () => {
    if (!deletingProveedor || deleteError) return;
    onDeleteProveedor(deletingProveedor.id);
    setDeletingProveedor(null);
  };

  const displayRut = (p) => p.rut ? `RUT: ${p.rut}` : p.id;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Directorio Maestro de Proveedores</span>
            <span className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{proveedores.length}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Gestión de proveedores y consultas de precios asociadas.</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreate}>
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
                  <p className="text-[11px] text-zinc-500 font-mono">{displayRut(p)}</p>
                </div>
                <Badge variant="info">
                  {consultasCount} Consultas
                </Badge>
              </div>

              <div className="text-xs text-zinc-400 space-y-1.5 pt-2.5 border-t border-zinc-800/80">
                <div className="flex items-center space-x-2">
                  <Package className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{p.contacto || 'Sin contacto directo'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{p.email || 'Sin correo'}</span>
                </div>
                {(p.telefono) && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{p.telefono}</span>
                  </div>
                )}
                {(p.sitioWeb) && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate">{p.sitioWeb}</span>
                  </div>
                )}
                {(p.condicionesComerciales || p.condiciones) && (
                  <p className="text-[11px] text-zinc-400 bg-zinc-950/50 p-2 rounded border border-zinc-800/80 mt-2">
                    <strong className="text-zinc-300">Condiciones:</strong> {p.condicionesComerciales || p.condiciones}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-1 pt-2 border-t border-zinc-800/80">
                {onEditProveedor && (
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Editar Proveedor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDeleteProveedor && (
                  <button
                    onClick={() => handleOpenDelete(p)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Eliminar Proveedor"
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
        onClose={() => { setShowModal(false); setEditingProveedor(null); }}
        title={editingProveedor ? `Editar: ${editingProveedor.nombre}` : 'Registrar Nuevo Proveedor'}
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
                placeholder="Ej: 76.123.456-7 (opcional)"
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
                placeholder="email@proveedor.cl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Teléfono</label>
              <Input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 ..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Sitio Web</label>
              <Input
                type="text"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                placeholder="www.proveedor.cl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Condiciones Comerciales</label>
            <Input
              type="text"
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
              placeholder="Ej: Crédito 30 días"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Notas Internas</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones sobre este proveedor..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => { setShowModal(false); setEditingProveedor(null); }}>
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </Button>
            <Button variant="primary" size="sm" type="submit">
              <Save className="w-3.5 h-3.5" />
              <span>{editingProveedor ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingProveedor}
        onClose={() => setDeletingProveedor(null)}
        title={`Eliminar: ${deletingProveedor?.nombre || ''}`}
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
                ¿Estás seguro de eliminar al proveedor <strong>{deletingProveedor?.nombre}</strong>?
                Esta acción es irreversible.
              </span>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" onClick={() => setDeletingProveedor(null)}>
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
