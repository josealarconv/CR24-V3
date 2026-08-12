import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  Badge, Modal, TextInput, Field, PrimaryBtn, GhostBtn, IconBtn, Empty, useConfirm
} from '../ui/Components';
import { getActiveUser } from '../../services/authService';

export default function UsuariosPerfilesView({
  usuarios = [],
  perfiles = [],
  onSaveUsuario,
  onSavePerfil,
  onDeletePerfil,
  onToggleUsuarioActivo,
  onDeleteUsuario
}) {
  const activeUser = getActiveUser();

  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'perfiles'

  const assignableProfiles = perfiles.filter(p => p.id !== 'PRF-SUPERADMIN');

  // New / Edit User Form State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userNombre, setUserNombre] = useState('');
  const [userPerfilId, setUserPerfilId] = useState(assignableProfiles[0]?.id || 'PRF-ADMIN');
  const [userValidationError, setUserValidationError] = useState(null);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [profileNombre, setProfileNombre] = useState('');
  const [profileDesc, setProfileDesc] = useState('');

  const confirmar = useConfirm();

  const getPerfilNombre = (perfilId) => {
    const p = perfiles.find(item => item.id === perfilId);
    return p ? p.nombre : perfilId;
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserEmail('');
    setUserNombre('');
    setUserPerfilId(assignableProfiles[0]?.id || 'PRF-ADMIN');
    setUserValidationError(null);
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setUserEmail(user.email);
    setUserNombre(user.nombre);
    setUserPerfilId(user.perfilId === 'PRF-SUPERADMIN' ? assignableProfiles[0]?.id || 'PRF-ADMIN' : user.perfilId);
    setUserValidationError(null);
    setShowUserModal(true);
  };

  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    setUserValidationError(null);

    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanNombre = userNombre.trim();

    if (!cleanEmail || !cleanNombre || !userPerfilId) {
      setUserValidationError('Todos los campos son obligatorios.');
      return;
    }

    onSaveUsuario({
      email: cleanEmail,
      nombre: cleanNombre,
      perfilId: userPerfilId,
      activo: editingUser ? editingUser.activo : true,
      fechaRegistro: editingUser ? editingUser.fechaRegistro : new Date().toISOString().split('T')[0]
    });

    setShowUserModal(false);
  };

  const handleDeleteUserClick = async (u) => {
    if (u.email.toLowerCase() === 'josealarconv@gmail.com') return;
    const ok = await confirmar({
      titulo: "¿Eliminar usuario?",
      mensaje: u.nombre || u.email,
      detalle: "Se quitarán los permisos de acceso de este usuario."
    });
    if (ok && onDeleteUsuario) {
      onDeleteUsuario(u.email);
    }
  };

  const handleOpenCreateProfile = () => {
    setEditingProfile(null);
    setProfileNombre('');
    setProfileDesc('');
    setShowProfileModal(true);
  };

  const handleOpenEditProfile = (perfil) => {
    setEditingProfile(perfil);
    setProfileNombre(perfil.nombre);
    setProfileDesc(perfil.descripcion || '');
    setShowProfileModal(true);
  };

  const handleProfileFormSubmit = (e) => {
    e.preventDefault();
    if (!profileNombre.trim()) return;

    const perfilId = editingProfile ? editingProfile.id : 'PRF-' + Date.now().toString(36).toUpperCase();
    onSavePerfil({
      id: perfilId,
      nombre: profileNombre.trim(),
      descripcion: profileDesc.trim(),
      esProtegido: editingProfile ? editingProfile.esProtegido : false,
      permisos: editingProfile ? editingProfile.permisos : {}
    });

    setShowProfileModal(false);
  };

  const handleDeleteProfileClick = async (perfil) => {
    if (perfil.id === 'PRF-SUPERADMIN' || perfil.esProtegido) {
      await confirmar({
        titulo: "Perfil protegido",
        mensaje: "Este perfil no puede ser eliminado por ser base del sistema.",
        textoConfirmar: "Entendido"
      });
      return;
    }
    const hasUsers = usuarios.some(u => u.perfilId === perfil.id);
    if (hasUsers) {
      await confirmar({
        titulo: "Perfil en uso",
        mensaje: "Hay usuarios asignados a este perfil. Reasígnalos antes de eliminarlo.",
        textoConfirmar: "Entendido"
      });
      return;
    }
    const ok = await confirmar({
      titulo: "¿Eliminar perfil?",
      mensaje: perfil.nombre,
      detalle: "Se borrará la definición de permisos para este perfil."
    });
    if (ok && onDeletePerfil) {
      onDeletePerfil(perfil.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Selector Header */}
      <div className="flex items-center justify-between border-b border-[#EDEFF3] pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'usuarios' ? "bg-[#2B3A67] text-white" : "border border-[#DDE1E8] bg-white text-[#5B6478]"
            }`}
          >
            Usuarios ({usuarios.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('perfiles')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'perfiles' ? "bg-[#2B3A67] text-white" : "border border-[#DDE1E8] bg-white text-[#5B6478]"
            }`}
          >
            Perfiles ({perfiles.length})
          </button>
        </div>

        {activeTab === 'usuarios' ? (
          <PrimaryBtn onClick={handleOpenCreateUser}>
            <UserPlus size={15} />
            <span>Nuevo Usuario</span>
          </PrimaryBtn>
        ) : (
          <PrimaryBtn onClick={handleOpenCreateProfile}>
            <Plus size={15} />
            <span>Nuevo Perfil</span>
          </PrimaryBtn>
        )}
      </div>

      {/* Tab 1: Usuarios List */}
      {activeTab === 'usuarios' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {usuarios.map((u) => (
            <div key={u.email} className="rounded-xl border border-[#EDEFF3] bg-white p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="font-bold text-sm text-[#131A2C]">{u.nombre}</h3>
                    <p className="font-mono text-xs text-[#8A93A6]">{u.email}</p>
                  </div>
                  <Badge color={u.activo ? "#2F7D5A" : "#B3261E"} bg={u.activo ? "#E4F3EC" : "#FBE7E6"}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-[#5B6478]">
                  Perfil: <span className="font-semibold text-[#131A2C]">{getPerfilNombre(u.perfilId)}</span>
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#EDEFF3] pt-2">
                <button
                  type="button"
                  onClick={() => onToggleUsuarioActivo(u.email)}
                  className="text-[11px] font-semibold text-[#2B3A67] hover:underline cursor-pointer"
                >
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
                <div className="flex gap-1">
                  <IconBtn onClick={() => handleOpenEditUser(u)} title="Editar usuario"><Edit2 size={14} /></IconBtn>
                  {u.email.toLowerCase() !== 'josealarconv@gmail.com' && (
                    <IconBtn onClick={() => handleDeleteUserClick(u)} title="Eliminar usuario"><Trash2 size={14} /></IconBtn>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Perfiles List */}
      {activeTab === 'perfiles' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {perfiles.map((p) => (
            <div key={p.id} className="rounded-xl border border-[#EDEFF3] bg-white p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="font-bold text-sm text-[#131A2C]">{p.nombre}</h3>
                    <p className="font-mono text-xs text-[#8A93A6]">{p.id}</p>
                  </div>
                  {p.esProtegido && <Badge color="#2B3A67" bg="#EEF0F7">Sistema</Badge>}
                </div>
                <p className="mt-2 text-xs text-[#5B6478]">{p.descripcion || 'Sin descripción'}</p>
              </div>

              {!p.esProtegido && (
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-[#EDEFF3] pt-2">
                  <IconBtn onClick={() => handleOpenEditProfile(p)} title="Editar perfil"><Edit2 size={14} /></IconBtn>
                  <IconBtn onClick={() => handleDeleteProfileClick(p)} title="Eliminar perfil"><Trash2 size={14} /></IconBtn>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* USER MODAL */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? "Editar Usuario" : "Crear Usuario"}>
        <form onSubmit={handleUserFormSubmit} className="space-y-3">
          {userValidationError && <p className="text-xs text-[#B3261E]">{userValidationError}</p>}
          <Field label="Nombre Completo *">
            <TextInput required value={userNombre} onChange={(e) => setUserNombre(e.target.value)} placeholder="Ej. Juan Pérez" />
          </Field>
          <Field label="Correo Electrónico *">
            <TextInput type="email" required disabled={!!editingUser} value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="juan@empresa.com" />
          </Field>
          <Field label="Perfil de Permisos *">
            <select value={userPerfilId} onChange={(e) => setUserPerfilId(e.target.value)} className="w-full rounded-lg border border-[#DDE1E8] bg-white px-3 py-2 text-sm text-[#131A2C]">
              {assignableProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2 border-t border-[#EDEFF3] pt-3">
            <GhostBtn onClick={() => setShowUserModal(false)}>Cancelar</GhostBtn>
            <PrimaryBtn type="submit">{editingUser ? "Guardar" : "Crear Usuario"}</PrimaryBtn>
          </div>
        </form>
      </Modal>

      {/* PROFILE MODAL */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title={editingProfile ? "Editar Perfil" : "Crear Perfil"}>
        <form onSubmit={handleProfileFormSubmit} className="space-y-3">
          <Field label="Nombre del Perfil *">
            <TextInput required value={profileNombre} onChange={(e) => setProfileNombre(e.target.value)} placeholder="Ej. Supervisor de Compras" />
          </Field>
          <Field label="Descripción">
            <TextInput value={profileDesc} onChange={(e) => setProfileDesc(e.target.value)} placeholder="Descripción breve del alcance" />
          </Field>
          <div className="flex justify-end gap-2 border-t border-[#EDEFF3] pt-3">
            <GhostBtn onClick={() => setShowProfileModal(false)}>Cancelar</GhostBtn>
            <PrimaryBtn type="submit">{editingProfile ? "Guardar" : "Crear Perfil"}</PrimaryBtn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
