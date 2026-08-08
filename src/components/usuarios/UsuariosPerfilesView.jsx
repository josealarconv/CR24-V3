import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Check, X, Plus, Edit2, Lock, Trash2 } from 'lucide-react';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';

export default function UsuariosPerfilesView({
  usuarios = [],
  perfiles = [],
  onSaveUsuario,
  onSavePerfil,
  onToggleUsuarioActivo,
  onDeleteUsuario
}) {
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'perfiles'

  // New User Form State
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userNombre, setUserNombre] = useState('');
  const [userPerfilId, setUserPerfilId] = useState(perfiles[0]?.id || 'PRF-ADMIN');

  // Delete User State
  const [deletingUserEmail, setDeletingUserEmail] = useState(null);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [profileNombre, setProfileNombre] = useState('');
  const [profileDesc, setProfileDesc] = useState('');

  const modulesList = [
    { id: 'licitaciones', name: 'Licitaciones' },
    { id: 'clientes', name: 'Clientes' },
    { id: 'proveedores', name: 'Proveedores' },
    { id: 'consultas', name: 'Consultas de Precios' },
    { id: 'cotizaciones', name: 'Cotizaciones PDF' },
    { id: 'anexos', name: 'Anexos' },
    { id: 'usuarios', name: 'Usuarios y Acceso' },
    { id: 'perfiles', name: 'Perfiles de Acceso' },
    { id: 'configuracion', name: 'Configuración de Empresa' }
  ];

  const createDefaultPermissions = () => {
    const p = {};
    modulesList.forEach(m => {
      p[m.id] = { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'todos' };
    });
    return p;
  };

  const [permissionsMatrix, setPermissionsMatrix] = useState(createDefaultPermissions());

  const getPerfilNombre = (perfilId) => {
    const p = perfiles.find(item => item.id === perfilId);
    return p ? p.nombre : perfilId;
  };

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!userEmail.trim() || !userNombre.trim()) return;

    onSaveUsuario({
      email: userEmail.trim().toLowerCase(),
      nombre: userNombre.trim(),
      perfilId: userPerfilId || perfiles[0]?.id || 'PRF-ADMIN',
      activo: true,
      fechaRegistro: new Date().toISOString().split('T')[0]
    });

    setShowNewUserModal(false);
    setUserEmail('');
    setUserNombre('');
  };

  const confirmDeleteUser = () => {
    if (deletingUserEmail && onDeleteUsuario) {
      onDeleteUsuario(deletingUserEmail);
    }
    setDeletingUserEmail(null);
  };

  const handleOpenEditProfile = (profile) => {
    setEditingProfile(profile);
    setProfileNombre(profile ? profile.nombre : '');
    setProfileDesc(profile ? profile.descripcion || '' : '');

    const base = createDefaultPermissions();
    if (profile && profile.permisos) {
      Object.keys(base).forEach(modId => {
        if (profile.permisos[modId]) {
          base[modId] = { ...base[modId], ...profile.permisos[modId] };
        }
      });
    }
    setPermissionsMatrix(base);
    setShowProfileModal(true);
  };

  const handleSaveProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileNombre.trim()) return;

    let finalPermissions = { ...permissionsMatrix };
    if (editingProfile && editingProfile.id === 'PRF-ADMIN') {
      finalPermissions.usuarios = { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' };
      finalPermissions.perfiles = { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' };
      finalPermissions.configuracion = { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' };
    }

    onSavePerfil({
      id: editingProfile ? editingProfile.id : `PRF-${Date.now().toString().slice(-4)}`,
      nombre: profileNombre.trim(),
      descripcion: profileDesc.trim(),
      permisos: finalPermissions,
      esProtegido: editingProfile?.id === 'PRF-ADMIN'
    });

    setShowProfileModal(false);
    setEditingProfile(null);
    setProfileNombre('');
    setProfileDesc('');
  };

  const updateMatrixField = (moduleId, action, value) => {
    if (editingProfile?.id === 'PRF-ADMIN' && ['usuarios', 'perfiles', 'configuracion'].includes(moduleId)) {
      return;
    }

    setPermissionsMatrix(prev => {
      const currentModuleObj = prev[moduleId] || { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'todos' };
      return {
        ...prev,
        [moduleId]: {
          ...currentModuleObj,
          [action]: value
        }
      };
    });
  };

  return (
    <div className="space-y-4 w-full">
      {/* Action Header Banner (100% Screen Width) */}
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Gestión de Seguridad y Lista Blanca de Acceso</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Administración de usuarios autorizados y matriz de perfiles de acceso.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'usuarios' ? (
            <Button variant="primary" size="sm" onClick={() => setShowNewUserModal(true)}>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrar Usuario</span>
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => handleOpenEditProfile(null)}>
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Nuevo Perfil</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-800 space-x-4 w-full">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`pb-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'usuarios'
              ? 'border-blue-500 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Usuarios Autorizados ({usuarios.length})
        </button>
        <button
          onClick={() => setActiveTab('perfiles')}
          className={`pb-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'perfiles'
              ? 'border-blue-500 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Matriz de Perfiles ({perfiles.length})
        </button>
      </div>

      {/* TAB 1: LISTA BLANCA DE USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs w-full">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Correo Electrónico</th>
                <th className="px-4 py-3">Nombre Completo</th>
                <th className="px-4 py-3">Perfil Asignado</th>
                <th className="px-4 py-3">Fecha Registro</th>
                <th className="px-4 py-3">Estado Acceso</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {usuarios.map((u) => {
                const isMasterUser = u.email.toLowerCase() === 'josealarconv@gmail.com';
                const isAdminUser = u.perfilId === 'PRF-ADMIN';
                const isProtectedUser = isMasterUser || isAdminUser;

                return (
                  <tr key={u.email} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-zinc-100 font-mono">
                      {u.email}
                      {isMasterUser && (
                        <span className="ml-2 text-[10px] text-amber-400 font-sans font-normal bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/60">
                          Master
                        </span>
                      )}
                      {!isMasterUser && isAdminUser && (
                        <span className="ml-2 text-[10px] text-blue-400 font-sans font-normal bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-800/60">
                          Admin Protegido
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-sans text-zinc-200">
                      {u.nombre}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <Badge variant={isAdminUser ? 'warning' : 'info'}>{getPerfilNombre(u.perfilId)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {u.fechaRegistro || '2025-01-01'}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {u.activo ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Activo (Lista Blanca)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-red-400 font-medium">
                          <X className="w-3.5 h-3.5" />
                          <span>Bloqueado</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant={u.activo ? 'danger' : 'secondary'}
                          size="xs"
                          disabled={isProtectedUser}
                          onClick={() => onToggleUsuarioActivo(u.email)}
                        >
                          {u.activo ? 'Desactivar' : 'Activar Acceso'}
                        </Button>

                        {!isProtectedUser ? (
                          <button
                            type="button"
                            onClick={() => setDeletingUserEmail(u.email)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Eliminar de Lista Blanca"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-amber-400/80" title="Usuario Administrador Protegido por el Sistema" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: MATRIZ DE PERFILES CONFIGURABLE */}
      {activeTab === 'perfiles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {perfiles.map((p) => {
            const isProtected = p.id === 'PRF-ADMIN' || p.esProtegido;
            return (
              <Card key={p.id} className="space-y-3 flex flex-col justify-between w-full">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-bold text-zinc-100 font-mono">{p.nombre}</h3>
                      {isProtected && <Lock className="w-3.5 h-3.5 text-amber-400" title="Perfil protegido del sistema" />}
                    </div>
                    <Badge variant={isProtected ? 'warning' : 'default'}>{p.id}</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{p.descripcion}</p>

                  {isProtected && (
                    <p className="text-[10px] text-amber-400/90 font-mono mt-1.5 bg-amber-950/30 p-1.5 rounded border border-amber-800/40">
                      Perfil protegido del sistema. Los permisos de administración permanecen activos por seguridad.
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5 text-[11px]">
                    <span className="text-zinc-500 block font-mono font-semibold uppercase">Permisos resumidos:</span>
                    {Object.entries(p.permisos || {}).slice(0, 5).map(([mod, perm]) => (
                      <div key={mod} className="flex items-center justify-between text-zinc-300">
                        <span className="capitalize">{mod}:</span>
                        <span className="font-mono text-zinc-400">
                          {perm?.ver ? 'Ver ' : ''}{perm?.agregar ? 'C ' : ''}{perm?.editar ? 'E ' : ''}{perm?.eliminar ? 'D ' : ''}
                          ({perm?.alcance || 'todos'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex justify-end">
                  <Button variant="secondary" size="xs" onClick={() => handleOpenEditProfile(p)}>
                    <Edit2 className="w-3 h-3" />
                    <span>Configurar Permisos</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Confirmar Eliminación de Usuario */}
      <Modal
        isOpen={!!deletingUserEmail}
        onClose={() => setDeletingUserEmail(null)}
        title="Eliminar Usuario de Lista Blanca"
      >
        <div className="space-y-3">
          <p className="text-xs text-zinc-300">
            ¿Estás seguro de que deseas eliminar permanentemente a <span className="font-mono font-bold text-zinc-100">{deletingUserEmail}</span> de la Lista Blanca?
          </p>
          <p className="text-xs text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50">
            Este usuario ya no podrá ingresar a la aplicación ni autenticarse con su cuenta de Google.
          </p>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeletingUserEmail(null)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDeleteUser}>
              Eliminar Definitivamente
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        title="Autorizar Usuario en Lista Blanca"
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Correo Electrónico</label>
            <Input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="ejemplo@suministrosorion.cl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre Completo</label>
            <Input
              type="text"
              value={userNombre}
              onChange={(e) => setUserNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Perfil de Acceso Asignado</label>
            <select
              value={userPerfilId}
              onChange={(e) => setUserPerfilId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
            >
              {perfiles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowNewUserModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar Usuario
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Perfil & Matriz Permisos */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title={editingProfile ? `Configurar Perfil: ${editingProfile.nombre}` : 'Crear Perfil de Acceso'}
      >
        <form onSubmit={handleSaveProfileSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre del Perfil</label>
            <Input
              type="text"
              value={profileNombre}
              onChange={(e) => setProfileNombre(e.target.value)}
              placeholder="Ej: Analista de Compras"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Descripción del Perfil</label>
            <Input
              type="text"
              value={profileDesc}
              onChange={(e) => setProfileDesc(e.target.value)}
              placeholder="Descripción breve de responsabilidades..."
            />
          </div>

          {editingProfile?.id === 'PRF-ADMIN' && (
            <p className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/60 font-mono">
              Los permisos de los módulos de seguridad (Usuarios, Perfiles y Configuración) permanecen bloqueados en este perfil para garantizar el acceso continuo del administrador.
            </p>
          )}

          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase font-mono mb-2">Matriz de Acciones por Módulo</h4>
            <div className="space-y-2.5 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              {modulesList.map(mod => {
                const p = permissionsMatrix[mod.id] || { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'todos' };
                const isLockedAdminMod = editingProfile?.id === 'PRF-ADMIN' && ['usuarios', 'perfiles', 'configuracion'].includes(mod.id);

                return (
                  <div key={mod.id} className="p-2 bg-zinc-900/60 rounded border border-zinc-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-zinc-200">{mod.name}</span>
                        {isLockedAdminMod && <Lock className="w-3 h-3 text-amber-400" title="Protegido por el sistema" />}
                      </div>
                      <select
                        value={p.alcance || 'todos'}
                        disabled={isLockedAdminMod}
                        onChange={(e) => updateMatrixField(mod.id, 'alcance', e.target.value)}
                        className="bg-zinc-950 text-[11px] text-zinc-400 border border-zinc-800 rounded px-1.5 py-0.5 disabled:opacity-60"
                      >
                        <option value="todos">Ver Todos</option>
                        <option value="propios">Solo Propios</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-[11px] text-zinc-400 font-mono">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLockedAdminMod ? true : !!p.ver}
                          disabled={isLockedAdminMod}
                          onChange={(e) => updateMatrixField(mod.id, 'ver', e.target.checked)}
                          className="rounded border-zinc-800 text-blue-600 focus:ring-0"
                        />
                        <span>Ver</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLockedAdminMod ? true : !!p.agregar}
                          disabled={isLockedAdminMod}
                          onChange={(e) => updateMatrixField(mod.id, 'agregar', e.target.checked)}
                          className="rounded border-zinc-800 text-blue-600 focus:ring-0"
                        />
                        <span>Agregar</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLockedAdminMod ? true : !!p.editar}
                          disabled={isLockedAdminMod}
                          onChange={(e) => updateMatrixField(mod.id, 'editar', e.target.checked)}
                          className="rounded border-zinc-800 text-blue-600 focus:ring-0"
                        />
                        <span>Editar</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLockedAdminMod ? true : !!p.eliminar}
                          disabled={isLockedAdminMod}
                          onChange={(e) => updateMatrixField(mod.id, 'eliminar', e.target.checked)}
                          className="rounded border-zinc-800 text-blue-600 focus:ring-0"
                        />
                        <span>Eliminar</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowProfileModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar Perfil
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
