import { getData } from './storageService';

const MASTER_DEV_EMAIL = 'josealarconv@gmail.com';
const ADMIN_PROFILE_ID = 'PRF-ADMIN';

export function getActiveUser() {
  const email = localStorage.getItem('cr24_active_user_email') || MASTER_DEV_EMAIL;
  const usuarios = getData('USUARIOS');
  const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || !user.activo) {
    return usuarios.find(u => u.email.toLowerCase() === MASTER_DEV_EMAIL.toLowerCase()) || {
      email: MASTER_DEV_EMAIL,
      nombre: 'José Alarcón',
      perfilId: ADMIN_PROFILE_ID,
      activo: true
    };
  }
  return user;
}

export function setActiveUserEmail(email) {
  localStorage.setItem('cr24_active_user_email', email);
  window.dispatchEvent(new Event('auth-state-changed'));
}

export function getUserProfile(user) {
  if (!user) return null;
  const perfiles = getData('PERFILES');
  return perfiles.find(p => p.id === user.perfilId) || perfiles[0];
}

export function hasPermission(moduleName, action = 'ver') {
  const user = getActiveUser();
  if (!user || !user.activo) return false;

  // Master Developer & Administrator Profile always have full access
  if (user.email.toLowerCase() === MASTER_DEV_EMAIL.toLowerCase() || user.perfilId === ADMIN_PROFILE_ID) {
    return true;
  }

  const profile = getUserProfile(user);
  if (!profile || !profile.permisos) return false;

  const modulePermissions = profile.permisos[moduleName];
  if (!modulePermissions) return false;

  return !!modulePermissions[action];
}

export function getPermissionScope(moduleName) {
  const user = getActiveUser();
  if (!user || !user.activo) return 'propios';

  if (user.email.toLowerCase() === MASTER_DEV_EMAIL.toLowerCase() || user.perfilId === ADMIN_PROFILE_ID) {
    return 'todos';
  }

  const profile = getUserProfile(user);
  if (!profile || !profile.permisos || !profile.permisos[moduleName]) return 'propios';

  return profile.permisos[moduleName].alcance || 'propios';
}
