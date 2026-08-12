import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, MapPin, Edit2, Trash2, Building2 } from 'lucide-react';
import {
  Badge, Modal, TextInput, TextArea, Field, PrimaryBtn, GhostBtn, IconBtn, Empty, useConfirm
} from '../ui/Components';

export default function ClientesList({ clientes = [], licitaciones = [], onAddCliente, onEditCliente, onDeleteCliente }) {
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const confirmar = useConfirm();

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [direccionDespacho, setDireccionDespacho] = useState('');
  const [notas, setNotas] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDelete = async (c) => {
    const licsCount = licitaciones.filter(l => l.clienteId === c.id).length;
    if (licsCount > 0) {
      await confirmar({
        titulo: "No se puede eliminar este cliente",
        mensaje: `${c.nombre} tiene ${licsCount} licitación(es) asociada(s).`,
        detalle: "Debes eliminar o reasignar sus licitaciones antes de poder borrarlo.",
        textoConfirmar: "Entendido"
      });
      return;
    }
    const ok = await confirmar({
      titulo: "¿Eliminar cliente?",
      mensaje: c.nombre,
      detalle: "Esta acción quitará el registro del directorio maestro."
    });
    if (ok && onDeleteCliente) {
      onDeleteCliente(c.id);
    }
  };

  const filteredClientes = clientes.filter(c =>
    `${c.nombre} ${c.rut} ${c.contacto} ${c.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EDEFF3] bg-white p-4 shadow-xs">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="flex items-center gap-2 text-lg font-bold text-[#131A2C]">
            <Users className="h-5 w-5 text-[#2B3A67]" />
            <span>Directorio Maestro de Clientes</span>
            <span className="rounded-full bg-[#EEF0F7] px-2 py-0.5 font-mono text-xs text-[#2B3A67]">{clientes.length}</span>
          </h1>
          <p className="mt-0.5 text-xs text-[#8A93A6]">Gestión centralizada de organizaciones que licitan y sus datos de contacto.</p>
        </div>
        <div className="flex items-center gap-2">
          <TextInput
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-64"
          />
          <PrimaryBtn onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Cliente</span>
          </PrimaryBtn>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredClientes.length === 0 ? (
        <Empty icon={Users}>No se encontraron clientes en este workspace.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClientes.map((c) => {
            const licsCount = licitaciones.filter((l) => l.clienteId === c.id).length;
            return (
              <div key={c.id} className="flex flex-col justify-between rounded-xl border border-[#EDEFF3] bg-white p-4 shadow-xs hover:border-[#DDE1E8] transition">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="truncate text-base font-bold text-[#131A2C]">{c.nombre}</h3>
                      <p className="font-mono text-xs text-[#8A93A6]">{c.rut ? `RUT: ${c.rut}` : c.id}</p>
                    </div>
                    <Badge color="#2B3A67" bg="#EEF0F7">{licsCount} Licitaciones</Badge>
                  </div>

                  <div className="space-y-1.5 border-t border-[#EDEFF3] pt-2.5 text-xs text-[#5B6478]">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#8A93A6]" />
                      <span className="truncate">{c.contacto || 'Sin contacto asignado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#8A93A6]" />
                      <span className="truncate">{c.email || 'Sin correo registrado'}</span>
                    </div>
                    {c.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-[#8A93A6]" />
                        <span className="font-mono">{c.telefono}</span>
                      </div>
                    )}
                    {(c.direccionDespacho || c.direccion) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A93A6]" />
                        <span className="line-clamp-1">{c.direccionDespacho || c.direccion}</span>
                      </div>
                    )}
                  </div>

                  {c.notas && (
                    <p className="rounded-lg bg-[#FAFAFC] p-2 text-[11px] text-[#8A93A6] border border-[#EDEFF3]">
                      {c.notas}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-end gap-1 border-t border-[#EDEFF3] pt-2">
                  <IconBtn onClick={() => handleOpenEdit(c)} title="Editar cliente"><Edit2 size={14} /></IconBtn>
                  <IconBtn onClick={() => handleDelete(c)} title="Eliminar cliente"><Trash2 size={14} /></IconBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingCliente(null); }}
        title={editingCliente ? `Editar: ${editingCliente.nombre}` : 'Registrar Nuevo Cliente'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Razón Social *" className="sm:col-span-2">
              <TextInput required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Codelco Chile" />
            </Field>
            <Field label="RUT / Identificación">
              <TextInput value={rut} onChange={(e) => setRut(e.target.value)} placeholder="61.704.000-K" className="font-mono" />
            </Field>
            <Field label="Persona de Contacto">
              <TextInput value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Nombre del encargado" />
            </Field>
            <Field label="Correo Electrónico">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contacto@empresa.com" />
            </Field>
            <Field label="Teléfono">
              <TextInput value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 1234 5678" className="font-mono" />
            </Field>
            <Field label="Dirección Facturación" className="sm:col-span-2">
              <TextInput value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Principal 123, Santiago" />
            </Field>
            <Field label="Dirección Despacho / Faena" className="sm:col-span-2">
              <TextInput value={direccionDespacho} onChange={(e) => setDireccionDespacho(e.target.value)} placeholder="Bodega Central Faena" />
            </Field>
            <Field label="Notas de Cuenta" className="sm:col-span-2">
              <TextArea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Condiciones especiales o notas..." />
            </Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#EDEFF3] pt-3">
            <GhostBtn onClick={() => setShowModal(false)}>Cancelar</GhostBtn>
            <PrimaryBtn type="submit">{editingCliente ? 'Guardar Cambios' : 'Registrar Cliente'}</PrimaryBtn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
