import {
  INITIAL_CONFIGURACION,
  INITIAL_CLIENTES,
  INITIAL_PROVEEDORES,
  INITIAL_LICITACIONES,
  INITIAL_DETALLES,
  INITIAL_CONSULTAS,
  INITIAL_COTIZACIONES,
  INITIAL_ANEXOS,
  INITIAL_PERFILES,
  INITIAL_USUARIOS,
  INITIAL_NOTAS_LICITACION,
  INITIAL_INVESTIGACIONES_IA,
  INITIAL_WORKSPACES
} from '../data/initialData';

const KEYS = {
  WORKSPACES: 'cr24_workspaces',
  CONFIGURACION: 'cr24_configuracion',
  CLIENTES: 'cr24_clientes',
  PROVEEDORES: 'cr24_proveedores',
  LICITACIONES: 'cr24_licitaciones',
  DETALLES: 'cr24_detalles',
  CONSULTAS: 'cr24_consultas',
  COTIZACIONES: 'cr24_cotizaciones',
  ANEXOS: 'cr24_anexos',
  PERFILES: 'cr24_perfiles',
  USUARIOS: 'cr24_usuarios',
  NOTAS_LICITACION: 'cr24_notas_licitacion',
  INVESTIGACIONES_IA: 'cr24_investigaciones_ia',
  OFFLINE_QUEUE: 'cr24_offline_queue'
};

// Tables that carry workspaceId and need migration/filtering
const WORKSPACE_SCOPED_KEYS = [
  'CLIENTES', 'PROVEEDORES', 'LICITACIONES', 'DETALLES',
  'CONSULTAS', 'COTIZACIONES', 'ANEXOS', 'NOTAS_LICITACION', 'INVESTIGACIONES_IA'
];

// ============================================================
// INITIALIZATION & MIGRATION
// ============================================================
export function initStorage() {
  // --- WORKSPACES ---
  if (!localStorage.getItem(KEYS.WORKSPACES)) {
    localStorage.setItem(KEYS.WORKSPACES, JSON.stringify(INITIAL_WORKSPACES));
  }

  // --- CONFIGURACION (legacy compat) ---
  if (!localStorage.getItem(KEYS.CONFIGURACION)) {
    localStorage.setItem(KEYS.CONFIGURACION, JSON.stringify(INITIAL_CONFIGURACION));
  }

  // --- MIGRATE EXISTING DATA: add workspaceId to records that lack it ---
  const needsMigration = !localStorage.getItem('cr24_workspace_migration_v4');
  if (needsMigration) {
    migrateToWorkspaces();
    localStorage.setItem('cr24_workspace_migration_v4', 'done');
  }

  // --- SEED TABLES (only if empty) ---
  const seedMap = {
    CLIENTES: INITIAL_CLIENTES,
    PROVEEDORES: INITIAL_PROVEEDORES,
    LICITACIONES: INITIAL_LICITACIONES,
    DETALLES: INITIAL_DETALLES,
    CONSULTAS: INITIAL_CONSULTAS,
    COTIZACIONES: INITIAL_COTIZACIONES,
    ANEXOS: INITIAL_ANEXOS,
    NOTAS_LICITACION: INITIAL_NOTAS_LICITACION,
    INVESTIGACIONES_IA: INITIAL_INVESTIGACIONES_IA
  };

  Object.entries(seedMap).forEach(([key, initialData]) => {
    if (!localStorage.getItem(KEYS[key])) {
      localStorage.setItem(KEYS[key], JSON.stringify(initialData));
    }
  });

  // --- PERFILES: Ensure PRF-SUPERADMIN exists ---
  const rawPerfiles = localStorage.getItem(KEYS.PERFILES);
  if (!rawPerfiles) {
    localStorage.setItem(KEYS.PERFILES, JSON.stringify(INITIAL_PERFILES));
  } else {
    try {
      let perfilesList = JSON.parse(rawPerfiles);
      if (!perfilesList.some(p => p.id === 'PRF-SUPERADMIN')) {
        perfilesList = [INITIAL_PERFILES[0], ...perfilesList];
        localStorage.setItem(KEYS.PERFILES, JSON.stringify(perfilesList));
      }
    } catch (e) {
      localStorage.setItem(KEYS.PERFILES, JSON.stringify(INITIAL_PERFILES));
    }
  }

  // --- USUARIOS: Ensure josealarconv@gmail.com with PRF-SUPERADMIN ---
  const rawUsers = localStorage.getItem(KEYS.USUARIOS);
  if (!rawUsers) {
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
  } else {
    try {
      let usersList = JSON.parse(rawUsers);
      let modified = false;

      usersList = usersList.map(u => {
        if (u.email.toLowerCase() === 'jalarconv@gmail.com' || u.email.toLowerCase() === 'josealarconv@gmail.com') {
          modified = true;
          return { ...u, email: 'josealarconv@gmail.com', perfilId: 'PRF-SUPERADMIN', workspaceId: null };
        }
        return u;
      });

      if (!usersList.some(u => u.email === 'josealarconv@gmail.com')) {
        usersList.push({
          email: 'josealarconv@gmail.com',
          nombre: 'José Alarcón',
          perfilId: 'PRF-SUPERADMIN',
          workspaceId: null,
          activo: true,
          fechaRegistro: '2025-01-01'
        });
        modified = true;
      }

      if (modified) {
        localStorage.setItem(KEYS.USUARIOS, JSON.stringify(usersList));
      }
    } catch (e) {
      localStorage.setItem(KEYS.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
    }
  }

  const activeEmail = localStorage.getItem('cr24_active_user_email');
  if (!activeEmail || activeEmail === 'jalarconv@gmail.com') {
    localStorage.setItem('cr24_active_user_email', 'josealarconv@gmail.com');
  }

  if (!localStorage.getItem(KEYS.OFFLINE_QUEUE)) {
    localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  }
}

// Migrate pre-v4 data: assign workspaceId to all records missing it
function migrateToWorkspaces() {
  const DEFAULT_WS = 'WS-ORION';

  WORKSPACE_SCOPED_KEYS.forEach(key => {
    const storageKey = KEYS[key];
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      let records = JSON.parse(raw);
      let modified = false;
      records = records.map(r => {
        if (!r.workspaceId) {
          modified = true;
          return { ...r, workspaceId: DEFAULT_WS };
        }
        return r;
      });
      if (modified) {
        localStorage.setItem(storageKey, JSON.stringify(records));
      }
    } catch (e) {
      console.error('Migration error for', key, e);
    }
  });

  // Migrate perfiles
  const rawPerfiles = localStorage.getItem(KEYS.PERFILES);
  if (rawPerfiles) {
    try {
      let perfiles = JSON.parse(rawPerfiles);
      let modified = false;
      perfiles = perfiles.map(p => {
        if (p.id === 'PRF-SUPERADMIN') return { ...p, workspaceId: null };
        if (!p.workspaceId) {
          modified = true;
          // Map old profile IDs to workspace-scoped ones
          if (p.id === 'PRF-ADMIN') return { ...p, id: 'PRF-ADMIN-ORION', workspaceId: DEFAULT_WS };
          if (p.id === 'PRF-SUPERVISOR') return { ...p, id: 'PRF-SUPERVISOR-ORION', workspaceId: DEFAULT_WS };
          if (p.id === 'PRF-ANALISTA') return { ...p, id: 'PRF-ANALISTA-ORION', workspaceId: DEFAULT_WS };
          return { ...p, workspaceId: DEFAULT_WS };
        }
        return p;
      });
      if (modified) localStorage.setItem(KEYS.PERFILES, JSON.stringify(perfiles));
    } catch (e) { /* skip */ }
  }

  // Migrate usuarios
  const rawUsers = localStorage.getItem(KEYS.USUARIOS);
  if (rawUsers) {
    try {
      let users = JSON.parse(rawUsers);
      let modified = false;
      users = users.map(u => {
        if (u.email.toLowerCase() === 'josealarconv@gmail.com') {
          return { ...u, workspaceId: null, perfilId: 'PRF-SUPERADMIN' };
        }
        if (!u.workspaceId) {
          modified = true;
          // Map old profile IDs
          let newPerfilId = u.perfilId;
          if (u.perfilId === 'PRF-ADMIN') newPerfilId = 'PRF-ADMIN-ORION';
          if (u.perfilId === 'PRF-SUPERVISOR') newPerfilId = 'PRF-SUPERVISOR-ORION';
          if (u.perfilId === 'PRF-ANALISTA') newPerfilId = 'PRF-ANALISTA-ORION';
          return { ...u, workspaceId: DEFAULT_WS, perfilId: newPerfilId };
        }
        return u;
      });
      if (modified) localStorage.setItem(KEYS.USUARIOS, JSON.stringify(users));
    } catch (e) { /* skip */ }
  }

  // Migrate config into workspace
  const rawConfig = localStorage.getItem(KEYS.CONFIGURACION);
  if (rawConfig) {
    try {
      const config = JSON.parse(rawConfig);
      const rawWs = localStorage.getItem(KEYS.WORKSPACES);
      if (rawWs) {
        let workspaces = JSON.parse(rawWs);
        const orion = workspaces.find(ws => ws.id === DEFAULT_WS);
        if (orion && config.empresa) {
          orion.config = { ...orion.config, ...config };
          localStorage.setItem(KEYS.WORKSPACES, JSON.stringify(workspaces));
        }
      }
    } catch (e) { /* skip */ }
  }
}

// ============================================================
// CORE CRUD
// ============================================================
export function getData(key) {
  try {
    const storageKey = KEYS[key.toUpperCase()];
    if (!storageKey) return [];
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading localStorage for key:', key, e);
    return [];
  }
}

// Get data filtered by workspace
export function getWorkspaceData(key, workspaceId) {
  const all = getData(key);
  if (!workspaceId) return all;
  return all.filter(item => item.workspaceId === workspaceId);
}

export function saveData(key, data) {
  try {
    const storageKey = KEYS[key.toUpperCase()];
    if (!storageKey) {
      console.error('Invalid storage key:', key);
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(data));
    window.dispatchEvent(new Event('storage-update'));

    if (!navigator.onLine) {
      addToOfflineQueue({ action: 'SAVE', key, data, timestamp: new Date().toISOString() });
    }
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function addItem(key, item) {
  const current = getData(key);
  const updated = [item, ...current];
  saveData(key, updated);
  return updated;
}

// Add item with automatic workspaceId injection
export function addItemToWorkspace(key, item, workspaceId) {
  return addItem(key, { ...item, workspaceId });
}

export function updateItem(key, param1, param2, param3) {
  const current = getData(key);
  let idField = 'id';
  let idValue = param1;
  let newFields = param2;

  if (param3 !== undefined) {
    idField = param1;
    idValue = param2;
    newFields = param3;
  } else if (typeof param1 === 'object' && param1 !== null) {
    idValue = param1.id || param1.detalleId || param1.licitacionId;
    newFields = param1;
  }

  const targetStr = String(idValue || '').trim();

  const updated = current.map(item => {
    const itemVal = String(item[idField] || item.id || '').trim();
    return itemVal === targetStr ? { ...item, ...newFields } : item;
  });

  saveData(key, updated);
  return updated;
}

export function deleteItem(key, idField, idValue) {
  const current = getData(key);
  let field = idField;
  let val = idValue;

  if (val === undefined) {
    field = 'id';
    val = idField;
  }

  const targetStr = String(val || '').trim();
  const updated = current.filter(item => {
    const primary = String(item[field] || '').trim();
    const fallbackId = String(item.id || '').trim();
    const fallbackDetalleId = String(item.detalleId || '').trim();
    return primary !== targetStr && fallbackId !== targetStr && fallbackDetalleId !== targetStr;
  });
  saveData(key, updated);
  return updated;
}

// ============================================================
// WORKSPACE CRUD (Creator only)
// ============================================================
export function getWorkspaces() {
  return getData('WORKSPACES');
}

export function getWorkspaceById(wsId) {
  const workspaces = getWorkspaces();
  return workspaces.find(ws => ws.id === wsId) || null;
}

export function addWorkspace(workspace) {
  return addItem('WORKSPACES', workspace);
}

export function updateWorkspace(wsId, updates) {
  return updateItem('WORKSPACES', 'id', wsId, updates);
}

export function deleteWorkspace(wsId) {
  // Delete the workspace itself
  deleteItem('WORKSPACES', 'id', wsId);
  // Also clean up all workspace-scoped data
  WORKSPACE_SCOPED_KEYS.forEach(key => {
    const records = getData(key);
    const filtered = records.filter(r => r.workspaceId !== wsId);
    saveData(key, filtered);
  });
  // Clean up perfiles and usuarios
  const perfiles = getData('PERFILES').filter(p => p.workspaceId !== wsId);
  saveData('PERFILES', perfiles);
  const usuarios = getData('USUARIOS').filter(u => u.workspaceId !== wsId);
  saveData('USUARIOS', usuarios);
}

// ============================================================
// OFFLINE QUEUE
// ============================================================
function addToOfflineQueue(item) {
  try {
    const queue = JSON.parse(localStorage.getItem(KEYS.OFFLINE_QUEUE) || '[]');
    queue.push(item);
    localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Error updating offline queue:', e);
  }
}
