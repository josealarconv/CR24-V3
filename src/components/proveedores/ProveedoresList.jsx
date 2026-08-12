import React, { useState } from 'react';
import { Building2, Plus, Mail, Phone, Globe, Edit2, Trash2 } from 'lucide-react';
import {
  Badge, Modal, TextInput, TextArea, Field, PrimaryBtn, GhostBtn, IconBtn, Empty, useConfirm
} from '../ui/Components';

export default function ProveedoresList({ proveedores = [], consultas = [], onAddProveedor, onEditProveedor, onDeleteProveedor }) {
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const confirmar = useConfirm();

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [condiciones, setCondiciones] = useState('');
  const [notas, setNotas] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDelete = async (p) => {
    const consultasCount = consultas.filter(c => c.proveedorId === p.id).length;
    if (consultasCount > 0) {
      await confirmar({
        titulo: "No se puede eliminar este proveedor",
        mensaje: `${p.nombre} tiene ${consultasCount} cotización(es) o consulta(s) asociada(s).`,
        detalle: "Debes eliminar las consultas del proveedor en sus licitaciones correspondientes.",
        textoConfirmar: "Entendido"
      });
      return;
    }
    const ok = await confirmar({
      titulo: "¿Eliminar proveedor?",
      mensaje: p.nombre,
      detalle: "Esta acción quitará el registro del directorio de proveedores."
    });
    if (ok && onDeleteProveedor) {
      onDeleteProveedor(p.id);
    }
  };

  const filteredProveedores = proveedores.filter(p =>
    `${p.nombre} ${p.rut} ${p.contacto} ${p.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EDEFF3] bg-white p-4 shadow-xs">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="flex items-center gap-2 text-lg font-bold text-[#131A2C]">
            <Building2 className="h-5 w-5 text-[#2B3A67]" />
            <span>Directorio Maestro de Proveedores</span>
            <span className="rounded-full bg-[#EEF0F7] px-2 py-0.5 font-mono text-xs text-[#2B3A67]">{proveedores.length}</span>
          </h1>
          <p className="mt-0.5 text-xs text-[#8A93A6]">Gestión de fabricantes, distribuidores y contactos de ventas.</p>
        </div>
        <div className="flex items-center gap-2">
          <TextInput
            placeholder="Buscar proveedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-64"
          />
          <PrimaryBtn onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Proveedor</span>
          </PrimaryBtn>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredProveedores.length === 0 ? (
        <Empty icon={Building2}>No se encontraron proveedores en este workspace.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProveedores.map((p) => {
            const consultasCount = consultas.filter((c) => c.proveedorId === p.id).length;
            return (
              <div key={p.id} className="flex flex-col justify-between rounded-xl border border-[#EDEFF3] bg-white p-4 shadow-xs hover:border-[#DDE1E8] transition">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="truncate text-base font-bold text-[#131A2C]">{p.nombre}</h3>
                      <p className="font-mono text-xs text-[#8A93A6]">{p.rut ? `RUT: ${p.rut}` : p.id}</p>
                    </div>
                    <Badge color="#0F6E8C" bg="#E1F1F5">{consultasCount} Consultas</Badge>
                  </div>

                  <div className="space-y-1.5 border-t border-[#EDEFF3] pt-2.5 text-xs text-[#5B6478]">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#8A93A6]" />
                      <span className="truncate">{p.contacto || 'Sin contacto asignado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#8A93A6]" />
                      <span className="truncate">{p.email || 'Sin correo registrado'}</span>
                    </div>
                    {p.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-[#8A93A6]" />
                        <span className="font-mono">{p.telefono}</span>
                      </div>
                    )}
                    {p.sitioWeb && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-[#8A93A6]" />
                        <a href={p.sitioWeb.startsWith('http') ? p.sitioWeb : `https://${p.sitioWeb}`} target="_blank" rel="noreferrer" className="truncate text-[#2B3A67] underline">
                          {p.sitioWeb}
                        </a>
                      </div>
                    )}
                  </div>

                  {(p.condicionesComerciales || p.condiciones) && (
                    <div className="rounded-lg bg-[#FAFAFC] p-2 text-[11px] text-[#5B6478] border border-[#EDEFF3]">
                      <span className="font-semibold text-[#131A2C]">Condiciones: </span>
                      {p.condicionesComerciales || p.condiciones}
                    </div>
                  )}
                  {p.notas && (
                    <p className="text-[11px] text-[#8A93A6]">
                      {p.notas}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-end gap-1 border-t border-[#EDEFF3] pt-2">
                  <IconBtn onClick={() => handleOpenEdit(p)} title="Editar proveedor"><Edit2 size={14} /></IconBtn>
                  <IconBtn onClick={() => handleDelete(p)} title="Eliminar proveedor"><Trash2 size={14} /></IconBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProveedor(null); }}
        title={editingProveedor ? `Editar: ${editingProveedor.nombre}` : 'Registrar Nuevo Proveedor'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Razón Social *" className="sm:col-span-2">
              <TextInput required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Soluciones Industriales SpA" />
            </Field>
            <Field label="RUT / Identificación">
              <TextInput value={rut} onChange={(e) => setRut(e.target.value)} placeholder="77.516.671-2" className="font-mono" />
            </Field>
            <Field label="Contacto Comercial">
              <TextInput value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Ej. Felipe Silva (+56 9 9123 4567)" />
            </Field>
            <Field label="Correo Electrónico">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ventas@proveedor.cl" />
            </Field>
            <Field label="Teléfono">
              <TextInput value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 2 2987 6543" className="font-mono" />
            </Field>
            <Field label="Sitio Web" className="sm:col-span-2">
              <TextInput value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} placeholder="www.proveedor.cl" />
            </Field>
            <Field label="Condiciones Comerciales" className="sm:col-span-2">
              <TextInput value={condiciones} onChange={(e) => setCondiciones(e.target.value)} placeholder="Ej. Crédito 15 días, descuento 5% por volumen" />
            </Field>
            <Field label="Notas e Insumos" className="sm:col-span-2">
              <TextArea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Tipos de productos que ofrece, marcas principales..." />
            </Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#EDEFF3] pt-3">
            <GhostBtn onClick={() => setShowModal(false)}>Cancelar</GhostBtn>
            <PrimaryBtn type="submit">{editingProveedor ? 'Guardar Cambios' : 'Registrar Proveedor'}</PrimaryBtn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
