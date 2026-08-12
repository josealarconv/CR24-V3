import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Users, Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  Badge, TextInput, TextArea, Field, PrimaryBtn, GhostBtn, IconBtn, Modal, useConfirm
} from '../ui/Components';
import UsuariosPerfilesView from '../usuarios/UsuariosPerfilesView';
import { isCreator, hasPermission } from '../../services/authService';

export default function ConfiguracionView({
  config = {},
  onSaveConfig,
  usuarios = [],
  perfiles = [],
  onSaveUsuario,
  onSavePerfil,
  onDeletePerfil,
  onToggleUsuarioActivo,
  onDeleteUsuario,
  activeWorkspace,
  allWorkspaces = [],
  onWorkspaceSwitch,
  onAddWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace
}) {
  const userIsCreator = isCreator();
  const canAccessUsuarios = hasPermission('usuarios', 'ver');
  const canAccessPerfiles = hasPermission('perfiles', 'ver');
  const showUsuariosTab = canAccessUsuarios || canAccessPerfiles;

  const [subTab, setSubTab] = useState('empresa'); // 'empresa' | 'usuarios' | 'workspaces'

  const getInitialValues = () => ({
    empresa: config.empresa ?? '',
    rut: config.rut ?? '',
    direccion: config.direccion ?? '',
    telefono: config.telefono ?? '',
    email: config.email ?? '',
    logoUrl: config.logoUrl ?? '',
    condiciones: config.condicionesCotizacionDefecto ?? ''
  });

  const [initials, setInitials] = useState(getInitialValues());
  const [empresa, setEmpresa] = useState(initials.empresa);
  const [rut, setRut] = useState(initials.rut);
  const [direccion, setDireccion] = useState(initials.direccion);
  const [telefono, setTelefono] = useState(initials.telefono);
  const [email, setEmail] = useState(initials.email);
  const [logoUrl, setLogoUrl] = useState(initials.logoUrl);
  const [condiciones, setCondiciones] = useState(initials.condiciones);
  const [saved, setSaved] = useState(false);

  // New Workspace Modal
  const [showWsModal, setShowWsModal] = useState(false);
  const [newWsNombre, setNewWsNombre] = useState('');
  const [newWsPlan, setNewWsPlan] = useState('basico');
  const confirmar = useConfirm();

  useEffect(() => {
    const updatedInit = getInitialValues();
    setInitials(updatedInit);
    setEmpresa(updatedInit.empresa);
    setRut(updatedInit.rut);
    setDireccion(updatedInit.direccion);
    setTelefono(updatedInit.telefono);
    setEmail(updatedInit.email);
    setLogoUrl(updatedInit.logoUrl);
    setCondiciones(updatedInit.condiciones);
  }, [config]);

  const isDirty =
    empresa !== initials.empresa ||
    rut !== initials.rut ||
    direccion !== initials.direccion ||
    telefono !== initials.telefono ||
    email !== initials.email ||
    logoUrl !== initials.logoUrl ||
    condiciones !== initials.condiciones;

  const handleCancel = () => {
    setEmpresa(initials.empresa);
    setRut(initials.rut);
    setDireccion(initials.direccion);
    setTelefono(initials.telefono);
    setEmail(initials.email);
    setLogoUrl(initials.logoUrl);
    setCondiciones(initials.condiciones);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...config,
      empresa,
      rut,
      direccion,
      telefono,
      email,
      logoUrl,
      condicionesCotizacionDefecto: condiciones
    };
    onSaveConfig(updatedData);
    setInitials({ empresa, rut, direccion, telefono, email, logoUrl, condiciones });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWsNombre.trim()) return;
    const wsId = 'WS-' + Date.now().toString(36).toUpperCase();
    onAddWorkspace({
      id: wsId,
      nombre: newWsNombre.trim(),
      plan: newWsPlan,
      maxUsuarios: newWsPlan === 'basico' ? 10 : 50,
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0],
      config: {
        empresa: newWsNombre.trim(),
        email: activeWorkspace?.config?.email || '',
        logoUrl: '',
        condicionesCotizacionDefecto: 'Precios cotizados en la moneda indicada.'
      }
    });
    setNewWsNombre('');
    setShowWsModal(false);
  };

  const handleDeleteWs = async (ws) => {
    if (ws.id === 'WS-CREATOR' || ws.id === 'WS-ORION') {
      await confirmar({
        titulo: "Espacio de trabajo protegido",
        mensaje: `El espacio ${ws.nombre} no se puede eliminar por ser un workspace base del sistema.`,
        textoConfirmar: "Entendido"
      });
      return;
    }
    const ok = await confirmar({
      titulo: "¿Eliminar espacio de trabajo?",
      mensaje: ws.nombre,
      detalle: "Se borrarán permanentemente sus licitaciones, clientes, proveedores y datos asociados."
    });
    if (ok && onDeleteWorkspace) {
      onDeleteWorkspace(ws.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EDEFF3] bg-white p-4 shadow-xs">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="flex items-center gap-2 text-lg font-bold text-[#131A2C]">
            <Settings className="h-5 w-5 text-[#2B3A67]" />
            <span>Configuración del Sistema</span>
          </h1>
          <p className="mt-0.5 text-xs text-[#8A93A6]">Parámetros globales de la organización, perfiles de usuario y espacios de trabajo.</p>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex gap-1 rounded-xl bg-[#F5F6F8] p-1 border border-[#EDEFF3]">
          <button
            type="button"
            onClick={() => setSubTab('empresa')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              subTab === 'empresa' ? "bg-[#2B3A67] text-white shadow-xs" : "text-[#5B6478] hover:text-[#131A2C]"
            }`}
          >
            Datos Empresa
          </button>
          {showUsuariosTab && (
            <button
              type="button"
              onClick={() => setSubTab('usuarios')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                subTab === 'usuarios' ? "bg-[#2B3A67] text-white shadow-xs" : "text-[#5B6478] hover:text-[#131A2C]"
              }`}
            >
              Usuarios y Permisos
            </button>
          )}
          {userIsCreator && (
            <button
              type="button"
              onClick={() => setSubTab('workspaces')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                subTab === 'workspaces' ? "bg-[#2B3A67] text-white shadow-xs" : "text-[#5B6478] hover:text-[#131A2C]"
              }`}
            >
              Workspaces (Creator)
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab 1: Empresa Form */}
      {subTab === 'empresa' && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#EDEFF3] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDEFF3] pb-3">
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-base font-bold text-[#131A2C]">
              Información de la Empresa Emisora
            </h2>
            {saved && <span className="font-mono text-xs font-semibold text-[#2F7D5A]">✓ Guardado exitosamente</span>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre Comercial / Razón Social *">
              <TextInput required value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Suministros Industriales SpA" />
            </Field>
            <Field label="RUT de Empresa">
              <TextInput value={rut} onChange={(e) => setRut(e.target.value)} placeholder="76.543.210-9" className="font-mono" />
            </Field>
            <Field label="Correo Oficial de Cotización">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contacto@empresa.cl" />
            </Field>
            <Field label="Teléfono Central">
              <TextInput value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 2 2987 6543" className="font-mono" />
            </Field>
            <Field label="Dirección Matriz" className="sm:col-span-2">
              <TextInput value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Industrial 1420, Santiago, Chile" />
            </Field>
            <Field label="URL del Logo Empresa" className="sm:col-span-2" hint="El logo se incluirá en las cotizaciones en PDF emitidas.">
              <TextInput value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Condiciones de Cotización por Defecto" className="sm:col-span-2">
              <TextArea rows={3} value={condiciones} onChange={(e) => setCondiciones(e.target.value)} placeholder="Validez de oferta, condiciones de pago y retiro..." />
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#EDEFF3] pt-4">
            {isDirty && <GhostBtn onClick={handleCancel}>Descartar</GhostBtn>}
            <PrimaryBtn type="submit" disabled={!isDirty}>
              <Save size={15} />
              <span>Guardar Cambios</span>
            </PrimaryBtn>
          </div>
        </form>
      )}

      {/* Sub-tab 2: Usuarios y Permisos */}
      {subTab === 'usuarios' && showUsuariosTab && (
        <UsuariosPerfilesView
          usuarios={usuarios}
          perfiles={perfiles}
          onSaveUsuario={onSaveUsuario}
          onSavePerfil={onSavePerfil}
          onDeletePerfil={onDeletePerfil}
          onToggleUsuarioActivo={onToggleUsuarioActivo}
          onDeleteUsuario={onDeleteUsuario}
        />
      )}

      {/* Sub-tab 3: Workspaces (Creator) */}
      {subTab === 'workspaces' && userIsCreator && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-[#EDEFF3] bg-white p-4 shadow-xs">
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-base font-bold text-[#131A2C]">
                Gestión de Espacios de Trabajo (Multi-Tenant Creator)
              </h2>
              <p className="text-xs text-[#8A93A6]">Administra las instancias operativas independientes y sus planes.</p>
            </div>
            <PrimaryBtn onClick={() => setShowWsModal(true)}>
              <Plus size={15} />
              <span>Nuevo Workspace</span>
            </PrimaryBtn>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {allWorkspaces.map((ws) => (
              <div key={ws.id} className={`rounded-xl border p-4 transition bg-white ${activeWorkspace?.id === ws.id ? "border-[#2B3A67]" : "border-[#EDEFF3]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="font-bold text-base text-[#131A2C]">{ws.nombre}</h3>
                    <p className="font-mono text-xs text-[#8A93A6]">{ws.id} · Plan {ws.plan}</p>
                  </div>
                  {activeWorkspace?.id === ws.id ? (
                    <Badge color="#2F7D5A" bg="#E4F3EC">Activo Ahora</Badge>
                  ) : (
                    <GhostBtn onClick={() => onWorkspaceSwitch(ws.id)} className="text-xs">Cambiar</GhostBtn>
                  )}
                </div>

                <div className="mt-3 space-y-1 text-xs text-[#5B6478] border-t border-[#EDEFF3] pt-2">
                  <p>Empresa: <span className="font-semibold text-[#131A2C]">{ws.config?.empresa || 'Sin configurar'}</span></p>
                  <p>Límite Usuarios: <span className="font-mono">{ws.maxUsuarios || 10}</span></p>
                </div>

                <div className="mt-3 flex justify-end gap-1 border-t border-[#EDEFF3] pt-2">
                  <IconBtn onClick={() => handleDeleteWs(ws)} title="Eliminar Workspace"><Trash2 size={14} /></IconBtn>
                </div>
              </div>
            ))}
          </div>

          {/* CREATE WORKSPACE MODAL */}
          <Modal isOpen={showWsModal} onClose={() => setShowWsModal(false)} title="Crear Nuevo Workspace">
            <form onSubmit={handleCreateWorkspace} className="space-y-3">
              <Field label="Nombre del Espacio de Trabajo *">
                <TextInput required value={newWsNombre} onChange={(e) => setNewWsNombre(e.target.value)} placeholder="Ej. Comercializadora Andina SpA" />
              </Field>
              <Field label="Plan Inicial">
                <select value={newWsPlan} onChange={(e) => setNewWsPlan(e.target.value)} className="w-full rounded-lg border border-[#DDE1E8] bg-white px-3 py-2 text-sm text-[#131A2C]">
                  <option value="basico">Básico (hasta 10 usuarios)</option>
                  <option value="pro">Pro (hasta 50 usuarios)</option>
                </select>
              </Field>
              <div className="flex justify-end gap-2 border-t border-[#EDEFF3] pt-3">
                <GhostBtn onClick={() => setShowWsModal(false)}>Cancelar</GhostBtn>
                <PrimaryBtn type="submit">Crear Workspace</PrimaryBtn>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
