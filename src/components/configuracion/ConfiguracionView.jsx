import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, X, Image as ImageIcon, Users, ShieldCheck, Layers } from 'lucide-react';
import { Button, Card, Input } from '../ui/Components';
import { ASSETS } from '../../config/assets';
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
  onWorkspaceSwitch
}) {
  const userIsCreator = isCreator();
  const canAccessUsuarios = hasPermission('usuarios', 'ver');
  const canAccessPerfiles = hasPermission('perfiles', 'ver');
  const showUsuariosTab = canAccessUsuarios || canAccessPerfiles;

  const [subTab, setSubTab] = useState('empresa'); // 'empresa' | 'usuarios' | 'workspaces'

  const getInitialValues = () => ({
    empresa: config.empresa || ASSETS.COMPANY_NAME,
    rut: config.rut || ASSETS.COMPANY_RUT,
    direccion: config.direccion || ASSETS.COMPANY_ADDRESS,
    telefono: config.telefono || ASSETS.COMPANY_PHONE,
    email: config.email || ASSETS.COMPANY_EMAIL,
    logoUrl: config.logoUrl || ASSETS.COMPANY_LOGO_URL,
    condiciones: config.condicionesCotizacionDefecto || ASSETS.condicionesCotizacionDefecto
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
  const [imageError, setImageError] = useState(false);

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
    setImageError(false);
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

    const newInitials = { empresa, rut, direccion, telefono, email, logoUrl, condiciones };
    setInitials(newInitials);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Sub-tab definitions
  const subTabs = [
    { id: 'empresa', label: 'Datos de Empresa', icon: Settings },
    ...(showUsuariosTab ? [{ id: 'usuarios', label: 'Usuarios y Perfiles', icon: Users }] : []),
    ...(userIsCreator ? [{ id: 'workspaces', label: 'Espacios de Trabajo', icon: Layers }] : [])
  ];

  return (
    <div className="space-y-5 w-full">
      {/* Header with Workspace context */}
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <span>Configuración</span>
              {activeWorkspace && (
                <span className="text-xs font-normal text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                  {activeWorkspace.nombre}
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Administración del espacio de trabajo, empresa, usuarios y perfiles de acceso.
            </p>
          </div>

          {/* Creator: Workspace Selector */}
          {userIsCreator && allWorkspaces.length > 1 && (
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400 shrink-0" />
              <select
                value={activeWorkspace?.id || ''}
                onChange={(e) => onWorkspaceSwitch && onWorkspaceSwitch(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {allWorkspaces.map(ws => (
                  <option key={ws.id} value={ws.id}>{ws.nombre} ({ws.plan})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sub-Tabs */}
        <div className="flex space-x-1 mt-3 border-t border-zinc-800 pt-3">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB: Datos de Empresa */}
      {subTab === 'empresa' && (
        <Card className="w-full">
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Razón Social</label>
                <Input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">RUT Empresa</label>
                <Input type="text" value={rut} onChange={(e) => setRut(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Teléfono de Contacto</label>
                <Input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Email Comercial</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Dirección Comercial</label>
              <Input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>

            {/* Logo URL & Live Visual Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium text-zinc-400 mb-1">URL del Logotipo de la Empresa (Membrete PDF)</label>
                <Input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => { setLogoUrl(e.target.value); setImageError(false); }}
                  placeholder="https://..."
                />
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  Esta imagen se imprime automáticamente en la cabecera de las cotizaciones PDF oficiales.
                </p>
              </div>

              {/* Live Preview Box */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Previsualización del Logotipo</label>
                <div className="bg-white p-3 rounded-xl border border-zinc-800 min-h-[96px] max-h-28 flex items-center justify-center shadow-xs">
                  {logoUrl && !imageError ? (
                    <img
                      src={logoUrl}
                      alt="Logotipo de la empresa"
                      onError={() => setImageError(true)}
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-zinc-400 space-y-1">
                      <ImageIcon className="w-5 h-5 mx-auto text-zinc-400" />
                      <span className="block text-[10px]">Sin imagen o URL no válida</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Condiciones Predeterminadas para Cotizaciones PDF</label>
              <textarea
                rows={3}
                value={condiciones}
                onChange={(e) => setCondiciones(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Action Buttons: ONLY visible if form has changes */}
            {isDirty && (
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2 animate-fadeIn">
                <Button type="button" variant="ghost" size="md" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </Button>
                <Button type="submit" variant="primary" size="md">
                  {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                  <span>{saved ? 'Guardado' : 'Guardar Cambios'}</span>
                </Button>
              </div>
            )}
          </form>
        </Card>
      )}

      {/* SUB-TAB: Usuarios y Perfiles (embedded) */}
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

      {/* SUB-TAB: Workspaces Manager (Creator only) */}
      {subTab === 'workspaces' && userIsCreator && (
        <Card className="w-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Espacios de Trabajo Registrados</span>
              </h2>
            </div>

            <div className="space-y-3">
              {allWorkspaces.map(ws => {
                const wsUsuarios = (usuarios || []).filter(u => u.workspaceId === ws.id);
                return (
                  <div
                    key={ws.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      ws.id === activeWorkspace?.id
                        ? 'bg-zinc-800/50 border-blue-800/60'
                        : 'bg-zinc-950/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-bold text-zinc-100">{ws.nombre}</span>
                        <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{ws.id}</span>
                        {ws.id === activeWorkspace?.id && (
                          <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded">Activo</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-zinc-400 font-mono text-[11px]">
                        <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          Plan: <strong className="text-zinc-200">{ws.plan}</strong>
                        </span>
                        <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          Usuarios: <strong className="text-zinc-200">{wsUsuarios.length}</strong> / {ws.maxUsuarios}
                        </span>
                      </div>
                    </div>
                    {ws.config?.empresa && (
                      <p className="text-zinc-400 text-[11px] font-mono pl-6">
                        Empresa: {ws.config.empresa} • Creado: {ws.fechaCreacion}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-zinc-500 italic pt-2 border-t border-zinc-800">
              La gestión avanzada de espacios de trabajo (crear, editar planes, eliminar) estará disponible próximamente.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
