import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getData, getWorkspaces } from './storageService';

const CREATOR_EMAIL = 'josealarconv@gmail.com';
const CREATOR_DEFAULT_WS = 'WS-CREATOR';

// ============================================================
// WORKSPACE SESSION
// ============================================================
export function getActiveWorkspaceId() {
  return localStorage.getItem('cr24_active_workspace_id') || null;
}

export function setActiveWorkspace(wsId) {
  localStorage.setItem('cr24_active_workspace_id', wsId);
  window.dispatchEvent(new Event('workspace-changed'));
}

export function getActiveWorkspace() {
  const wsId = getActiveWorkspaceId();
  if (!wsId) return null;
  const workspaces = getWorkspaces();
  return workspaces.find(ws => ws.id === wsId) || null;
}

// Get all workspaces the current user can access
export function getUserWorkspaces() {
  const user = getActiveUser();
  if (!user) return [];
  const workspaces = getWorkspaces();
  if (isCreator()) return workspaces;
  if (!user.workspaceId) return workspaces;
  return workspaces.filter(ws => ws.id === user.workspaceId);
}

// ============================================================
// USER & ROLE CHECKS
// ============================================================
export function isCreator(email) {
  const checkEmail = email || getActiveUser()?.email;
  return checkEmail?.toLowerCase() === CREATOR_EMAIL.toLowerCase();
}

export function isWorkspaceAdmin(workspaceId) {
  const user = getActiveUser();
  if (!user) return false;
  if (isCreator()) return true;
  if (user.workspaceId !== workspaceId) return false;
  const profile = getUserProfile(user);
  return profile?.nombre === 'Administrador' || profile?.esProtegido === true;
}

export function getActiveUser() {
  const email = localStorage.getItem('cr24_session_user_email');
  if (!email) return null;

  const usuarios = getData('USUARIOS');
  const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !user.activo) {
    if (email.toLowerCase() === CREATOR_EMAIL.toLowerCase()) {
      return {
        email: CREATOR_EMAIL,
        nombre: 'José Alarcón',
        perfilId: 'PRF-SUPERADMIN',
        workspaceId: null,
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

// ============================================================
// LOGIN
// ============================================================
export function loginWithEmail(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
  }

  const usuarios = getData('USUARIOS');
  const user = usuarios.find(u => u.email.toLowerCase() === cleanEmail);

  // Creator always has access
  if (cleanEmail === CREATOR_EMAIL.toLowerCase()) {
    localStorage.setItem('cr24_session_user_email', CREATOR_EMAIL);
    localStorage.setItem('cr24_active_user_email', CREATOR_EMAIL);
    // Default to Creator workspace on login
    if (!getActiveWorkspaceId()) {
      setActiveWorkspace(CREATOR_DEFAULT_WS);
    }
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
  // Set workspace to user's assigned workspace
  if (user.workspaceId) {
    setActiveWorkspace(user.workspaceId);
  }
  window.dispatchEvent(new Event('auth-state-changed'));
  return { success: true, user };
}

// Native Firebase Google Auth Sign-In
export async function loginWithGoogle() {
  try {
    if (!auth) {
      throw new Error('Firebase Auth no está inicializado.');
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;
    const cleanEmail = (googleUser.email || '').trim().toLowerCase();

    return loginWithEmail(cleanEmail);
  } catch (error) {
    console.error('Error en Firebase Google Sign-In:', error);
    return {
      success: false,
      error: error.message || 'Ocurrió un error al autenticar con tu cuenta de Google en Firebase.'
    };
  }
}

export function logout() {
  localStorage.removeItem('cr24_session_user_email');
  localStorage.removeItem('cr24_active_workspace_id');
  window.dispatchEvent(new Event('auth-state-changed'));
}

// ============================================================
// PROFILE & PERMISSIONS
// ============================================================
export function getUserProfile(user) {
  if (!user) return null;
  const perfiles = getData('PERFILES');
  return perfiles.find(p => p.id === user.perfilId) || perfiles[0];
}

export function hasPermission(moduleName, action = 'ver') {
  const user = getActiveUser();
  if (!user || !user.activo) return false;

  // Creator has full access everywhere
  if (isCreator()) return true;

  const profile = getUserProfile(user);
  if (!profile || !profile.permisos) return false;

  const modulePermissions = profile.permisos[moduleName];
  if (!modulePermissions) return false;

  return !!modulePermissions[action];
}

export function getPermissionScope(moduleName) {
  const user = getActiveUser();
  if (!user || !user.activo) return 'propios';

  if (isCreator()) return 'todos';

  const profile = getUserProfile(user);
  if (!profile || !profile.permisos || !profile.permisos[moduleName]) return 'propios';

  return profile.permisos[moduleName].alcance || 'propios';
}
