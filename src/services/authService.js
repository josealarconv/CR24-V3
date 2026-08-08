import { getData } from './storageService';

export function getActiveUser() {
  const email = localStorage.getItem('cr24_active_user_email') || 'jalarconv@gmail.com';
  const usuarios = getData('USUARIOS');
  const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || !user.activo) {
    // Fallback to primary admin if not set or inactive
    return usuarios.find(u => u.email === 'jalarconv@gmail.com') || {
      email: 'jalarconv@gmail.com',
      nombre: 'José Alarcón',
      perfilId: 'PRF-ADMIN',
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

  const profile = getUserProfile(user);
  if (!profile || !profile.permisos) return false;

  const modulePermissions = profile.permisos[moduleName];
  if (!modulePermissions) return false;

  return !!modulePermissions[action];
}

export function getPermissionScope(moduleName) {
  const user = getActiveUser();
  if (!user || !user.activo) return 'propios';

  const profile = getUserProfile(user);
  if (!profile || !profile.permisos || !profile.permisos[moduleName]) return 'propios';

  return profile.permisos[moduleName].alcance || 'propios';
}
