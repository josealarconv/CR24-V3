import {
  INITIAL_CONFIGURACION,
  INITIAL_CLIENTES,
  INITIAL_PROVEEDORES,
  INITIAL_LICITACIONES,
  INITIAL_DETALLES,
  INITIAL_CONSULTAS,
  INITIAL_COTIZACIONES,
  INITIAL_ANEXOS
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
  OFFLINE_QUEUE: 'cr24_offline_queue'
};

// Initialize default storage if empty
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
  if (!localStorage.getItem(KEYS.LICITACIONES)) {
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
  if (!localStorage.getItem(KEYS.OFFLINE_QUEUE)) {
    localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  }
}

export function getData(key) {
  try {
    const raw = localStorage.getItem(KEYS[key.toUpperCase()]);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return [];
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(KEYS[key.toUpperCase()], JSON.stringify(data));
    // Trigger storage event for UI reactive updates
    window.dispatchEvent(new Event('storage-update'));
  } catch (e) {
    console.error('Error writing to localStorage:', e);
  }
}

export function addItem(key, item) {
  const list = getData(key);
  const updated = [item, ...list];
  saveData(key, updated);
  
  if (!navigator.onLine) {
    enqueueOfflineChange({ action: 'CREATE', key, item, timestamp: new Date().toISOString() });
  }
  return updated;
}

export function updateItem(key, id, fields) {
  const list = getData(key);
  const updated = list.map(item => item.id === id ? { ...item, ...fields, updatedAt: new Date().toISOString() } : item);
  saveData(key, updated);

  if (!navigator.onLine) {
    enqueueOfflineChange({ action: 'UPDATE', key, id, fields, timestamp: new Date().toISOString() });
  }
  return updated;
}

export function removeItem(key, id) {
  const list = getData(key);
  const updated = list.filter(item => item.id !== id);
  saveData(key, updated);

  if (!navigator.onLine) {
    enqueueOfflineChange({ action: 'DELETE', key, id, timestamp: new Date().toISOString() });
  }
  return updated;
}

function enqueueOfflineChange(change) {
  try {
    const queue = JSON.parse(localStorage.getItem(KEYS.OFFLINE_QUEUE) || '[]');
    queue.push(change);
    localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Error enqueuing offline change:', e);
  }
}

export function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.OFFLINE_QUEUE) || '[]');
  } catch (e) {
    return [];
  }
}

export function clearOfflineQueue() {
  localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify([]));
}
