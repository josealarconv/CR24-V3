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
  INITIAL_INVESTIGACIONES_IA
} from '../data/initialData';

const KEYS = {
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

// Initialize default storage if empty or migrate stale user keys
export function initStorage() {
  if (!localStorage.getItem(KEYS.CONFIGURACION)) {
    localStorage.setItem(KEYS.CONFIGURACION, JSON.stringify(INITIAL_CONFIGURACION));
  }
  if (!localStorage.getItem(KEYS.CLIENTES)) {
    localStorage.setItem(KEYS.CLIENTES, JSON.stringify(INITIAL_CLIENTES));
  }
  if (!localStorage.getItem(KEYS.PROVEEDORES)) {
    localStorage.setItem(KEYS.PROVEEDORES, JSON.stringify(INITIAL_PROVEEDORES));
  }
  const rawLicitaciones = localStorage.getItem(KEYS.LICITACIONES);
  if (!rawLicitaciones || rawLicitaciones.includes('LIC-CODELCO-990') || rawLicitaciones.includes('2025-01')) {
    localStorage.setItem(KEYS.LICITACIONES, JSON.stringify(INITIAL_LICITACIONES));
  }
  if (!localStorage.getItem(KEYS.DETALLES)) {
    localStorage.setItem(KEYS.DETALLES, JSON.stringify(INITIAL_DETALLES));
  }
  if (!localStorage.getItem(KEYS.CONSULTAS)) {
    localStorage.setItem(KEYS.CONSULTAS, JSON.stringify(INITIAL_CONSULTAS));
  }
  if (!localStorage.getItem(KEYS.COTIZACIONES)) {
    localStorage.setItem(KEYS.COTIZACIONES, JSON.stringify(INITIAL_COTIZACIONES));
  }
  if (!localStorage.getItem(KEYS.ANEXOS)) {
    localStorage.setItem(KEYS.ANEXOS, JSON.stringify(INITIAL_ANEXOS));
  }

  // Ensure PERFILES contains PRF-SUPERADMIN
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

  // Migrate or initialize Usuarios to ensure josealarconv@gmail.com has PRF-SUPERADMIN
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
          return { ...u, email: 'josealarconv@gmail.com', perfilId: 'PRF-SUPERADMIN' };
        }
        return u;
      });

      if (!usersList.some(u => u.email === 'josealarconv@gmail.com')) {
        usersList.push({
          email: 'josealarconv@gmail.com',
          nombre: 'José Alarcón',
          perfilId: 'PRF-SUPERADMIN',
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

  if (!localStorage.getItem(KEYS.NOTAS_LICITACION)) {
    localStorage.setItem(KEYS.NOTAS_LICITACION, JSON.stringify(INITIAL_NOTAS_LICITACION));
  }
  if (!localStorage.getItem(KEYS.INVESTIGACIONES_IA)) {
    localStorage.setItem(KEYS.INVESTIGACIONES_IA, JSON.stringify(INITIAL_INVESTIGACIONES_IA));
  }
  if (!localStorage.getItem(KEYS.OFFLINE_QUEUE)) {
    localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  }
}

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
    idValue = param1.id;
    newFields = param1;
  }

  const updated = current.map(item =>
    item[idField] === idValue ? { ...item, ...newFields } : item
  );
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

  const updated = current.filter(item => item[field] !== val);
  saveData(key, updated);
  return updated;
}

function addToOfflineQueue(item) {
  try {
    const queue = JSON.parse(localStorage.getItem(KEYS.OFFLINE_QUEUE) || '[]');
    queue.push(item);
    localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Error updating offline queue:', e);
  }
}
