import { getData } from './storageService';

const MASTER_DEV_EMAIL = 'josealarconv@gmail.com';
const ADMIN_PROFILE_ID = 'PRF-ADMIN';

export function getActiveUser() {
  const email = localStorage.getItem('cr24_session_user_email');
  if (!email) return null;

  const usuarios = getData('USUARIOS');
  const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || !user.activo) {
    // If master dev email, always allow
    if (email.toLowerCase() === MASTER_DEV_EMAIL.toLowerCase()) {
      return {
        email: MASTER_DEV_EMAIL,
        nombre: 'José Alarcón',
        perfilId: ADMIN_PROFILE_ID,
        activo: true
      };
    }
    return null;
  }
  return user;
}

export function isAuthenticated() {
  return !!getActiveUser();
}

export function loginWithEmail(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
  }

  const usuarios = getData('USUARIOS');
  const user = usuarios.find(u => u.email.toLowerCase() === cleanEmail);

  // Master Developer Bypass
  if (cleanEmail === MASTER_DEV_EMAIL.toLowerCase()) {
    localStorage.setItem('cr24_session_user_email', MASTER_DEV_EMAIL);
    localStorage.setItem('cr24_active_user_email', MASTER_DEV_EMAIL);
    window.dispatchEvent(new Event('auth-state-changed'));
    return { success: true, user: getActiveUser() };
  }

  if (!user) {
    return {
      success: false,
      error: `Acceso Denegado: El correo (${cleanEmail}) no se encuentra registrado en la Lista Blanca.`
    };
  }

  if (!user.activo) {
    return {
      success: false,
      error: `Acceso Bloqueado: La cuenta (${cleanEmail}) se encuentra desactivada por el administrador.`
    };
  }

  localStorage.setItem('cr24_session_user_email', user.email);
  localStorage.setItem('cr24_active_user_email', user.email);
  window.dispatchEvent(new Event('auth-state-changed'));
  return { success: true, user };
}

export function logout() {
  localStorage.removeItem('cr24_session_user_email');
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
