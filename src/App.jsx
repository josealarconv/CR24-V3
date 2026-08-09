import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import LoginScreen from './components/auth/LoginScreen';
import LicitacionesTableView from './components/appsheet/LicitacionesTableView';
import LicitacionMasterDetail from './components/appsheet/LicitacionMasterDetail';
import ConsultasTableView from './components/appsheet/ConsultasTableView';
import CotizacionesTableView from './components/appsheet/CotizacionesTableView';
import AnexosTableView from './components/appsheet/AnexosTableView';
import ClientesList from './components/clientes/ClientesList';
import ProveedoresList from './components/proveedores/ProveedoresList';
import UsuariosPerfilesView from './components/usuarios/UsuariosPerfilesView';
import ConfiguracionView from './components/configuracion/ConfiguracionView';
import {
  initStorage,
  getData,
  getWorkspaceData,
  saveData,
  addItem,
  updateItem,
  deleteItem,
  getWorkspaces,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace
} from './services/storageService';
import {
  getActiveUser,
  getActiveWorkspace,
  getActiveWorkspaceId,
  setActiveWorkspace,
  getUserWorkspaces,
  isCreator,
  logout
} from './services/authService';

export default function App() {
  const [activeView, setActiveView] = useState('licitaciones');
  const [selectedLicitacion, setSelectedLicitacion] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  // Auth State
  const [currentUser, setCurrentUser] = useState(null);

  // Workspace State
  const [activeWs, setActiveWs] = useState(null);
  const [allWorkspaces, setAllWorkspaces] = useState([]);

  // Data Store (filtered by active workspace)
  const [licitaciones, setLicitaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [notasLicitacion, setNotasLicitacion] = useState([]);
  const [investigacionesIa, setInvestigacionesIa] = useState([]);
  const [configuracion, setConfiguracion] = useState({});

  useEffect(() => {
    initStorage();
    setCurrentUser(getActiveUser());
    refreshWorkspace();

    const handleStorageUpdate = () => loadWorkspaceData();
    const handleAuthChange = () => {
      setCurrentUser(getActiveUser());
      refreshWorkspace();
    };
    const handleWorkspaceChange = () => {
      refreshWorkspace();
    };

    window.addEventListener('storage-update', handleStorageUpdate);
    window.addEventListener('auth-state-changed', handleAuthChange);
    window.addEventListener('workspace-changed', handleWorkspaceChange);

    return () => {
      window.removeEventListener('storage-update', handleStorageUpdate);
      window.removeEventListener('auth-state-changed', handleAuthChange);
      window.removeEventListener('workspace-changed', handleWorkspaceChange);
    };
  }, []);

  const refreshWorkspace = () => {
    const ws = getActiveWorkspace();
    setActiveWs(ws);
    setAllWorkspaces(getWorkspaces());
    loadWorkspaceData();
  };

  // Load data filtered by the active workspace
  const loadWorkspaceData = () => {
    const wsId = getActiveWorkspaceId();
    setAllWorkspaces(getWorkspaces());
    const ws = getActiveWorkspace();
    setActiveWs(ws);

    // Workspace-scoped data
    setLicitaciones(getWorkspaceData('LICITACIONES', wsId));
    setClientes(getWorkspaceData('CLIENTES', wsId));
    setProveedores(getWorkspaceData('PROVEEDORES', wsId));
    setDetalles(getWorkspaceData('DETALLES', wsId));
    setConsultas(getWorkspaceData('CONSULTAS', wsId));
    setCotizaciones(getWorkspaceData('COTIZACIONES', wsId));
    setAnexos(getWorkspaceData('ANEXOS', wsId));
    setNotasLicitacion(getWorkspaceData('NOTAS_LICITACION', wsId));
    setInvestigacionesIa(getWorkspaceData('INVESTIGACIONES_IA', wsId));

    // Perfiles and Usuarios: filter by workspace
    // PRF-SUPERADMIN (workspaceId: null) only visible in WS-CREATOR sandbox
    const allPerfiles = getData('PERFILES');
    const allUsuarios = getData('USUARIOS');
    const isCreatorWs = wsId === 'WS-CREATOR';

    if (isCreator() && wsId) {
      setPerfiles(allPerfiles.filter(p => p.workspaceId === wsId || (isCreatorWs && p.workspaceId === null)));
      setUsuarios(allUsuarios.filter(u => u.workspaceId === wsId || (isCreatorWs && u.workspaceId === null)));
    } else if (wsId) {
      setPerfiles(allPerfiles.filter(p => p.workspaceId === wsId));
      setUsuarios(allUsuarios.filter(u => u.workspaceId === wsId));
    } else {
      setPerfiles(allPerfiles);
      setUsuarios(allUsuarios);
    }

    // Configuration from workspace
    setConfiguracion(ws?.config || getData('CONFIGURACION') || {});
  };

  const handleWorkspaceSwitch = (wsId) => {
    setActiveWorkspace(wsId);
    setSelectedLicitacion(null);
    setActiveView('licitaciones');
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  // Monthly & Global Search Filtering
  const filteredLicitaciones = licitaciones.filter(lic => {
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      const cli = clientes.find(c => c.id === lic.clienteId);
      const cliNombre = cli ? cli.nombre.toLowerCase() : '';
      const numLic = (lic.numeroLicitacion || lic.id).toLowerCase();
      const notas = (lic.notas || '').toLowerCase();
      return numLic.includes(q) || cliNombre.includes(q) || notas.includes(q);
    }
    if (selectedMonth !== 'ALL') {
      if (lic.fecha && !lic.fecha.startsWith(selectedMonth)) return false;
    }
    return true;
  });

  // Get active workspaceId for injecting into new records
  const wsId = getActiveWorkspaceId();

  const handleAddLicitacion = (newLic) => {
    const updated = addItem('LICITACIONES', { ...newLic, workspaceId: wsId, createdBy: currentUser.email });
    setLicitaciones(updated.filter(l => l.workspaceId === wsId));
    setSelectedLicitacion(newLic);
  };

  const handleEditLicitacion = (updatedLic) => {
    const allData = getData('LICITACIONES');
    const updated = allData.map(l => l.id === updatedLic.id ? { ...l, ...updatedLic } : l);
    saveData('LICITACIONES', updated);
    setLicitaciones(updated.filter(l => l.workspaceId === wsId));
    if (selectedLicitacion && selectedLicitacion.id === updatedLic.id) {
      setSelectedLicitacion(prev => ({ ...prev, ...updatedLic }));
    }
  };

  const handleDeleteLicitacion = (licId) => {
    deleteItem('LICITACIONES', 'id', licId);
    setLicitaciones(prev => prev.filter(l => String(l.id).trim() !== String(licId).trim()));
    if (selectedLicitacion && selectedLicitacion.id === licId) {
      setSelectedLicitacion(null);
    }
  };

  const handleUpdateEstatusLicitacion = (licId, newEstatus) => {
    const allData = getData('LICITACIONES');
    const updated = allData.map(l => l.id === licId ? { ...l, estatus: newEstatus } : l);
    saveData('LICITACIONES', updated);
    setLicitaciones(updated.filter(l => l.workspaceId === wsId));
    if (selectedLicitacion && selectedLicitacion.id === licId) {
      setSelectedLicitacion(prev => ({ ...prev, estatus: newEstatus }));
    }
  };

  const handleAddDetalle = (newDetalle) => {
    const updated = addItem('DETALLES', { ...newDetalle, workspaceId: wsId });
    setDetalles(updated.filter(d => d.workspaceId === wsId));
  };

  const handleEditDetalle = (updatedDetalle) => {
    if (!updatedDetalle) return;
    const targetIdStr = String(updatedDetalle.id || updatedDetalle.detalleId || '').trim();
    updateItem('DETALLES', 'id', targetIdStr, updatedDetalle);
    setDetalles(prev => prev.map(d => String(d.id || d.detalleId || '').trim() === targetIdStr ? { ...d, ...updatedDetalle } : d));
  };

  const handleDeleteDetalle = (detalleId) => {
    if (!detalleId) return;
    const targetIdStr = String(detalleId).trim();
    deleteItem('DETALLES', 'id', targetIdStr);
    deleteItem('CONSULTAS', 'detalleId', targetIdStr);
    deleteItem('INVESTIGACIONES_IA', 'detalleId', targetIdStr);
    setDetalles(prev => prev.filter(d => String(d.id || d.detalleId || '').trim() !== targetIdStr));
    setConsultas(prev => prev.filter(c => String(c.detalleId || '').trim() !== targetIdStr));
    setInvestigacionesIa(prev => prev.filter(i => String(i.detalleId || '').trim() !== targetIdStr));
  };

  const handleAddConsulta = (newConsulta) => {
    const updated = addItem('CONSULTAS', { ...newConsulta, workspaceId: wsId });
    setConsultas(updated.filter(c => c.workspaceId === wsId));
  };

  const handleEditConsulta = (updatedConsulta) => {
    const updated = updateItem('CONSULTAS', updatedConsulta);
    setConsultas(updated.filter(c => c.workspaceId === wsId));
  };

  const handleAddAnexo = (newAnx) => {
    const updated = addItem('ANEXOS', { ...newAnx, workspaceId: wsId });
    setAnexos(updated.filter(a => a.workspaceId === wsId));
  };

  const handleDeleteAnexo = (anexoId) => {
    const targetIdStr = String(anexoId).trim();
    deleteItem('ANEXOS', 'id', targetIdStr);
    setAnexos(prev => prev.filter(a => String(a.id || '').trim() !== targetIdStr));
  };

  const handleAddNotaLicitacion = (newNota) => {
    const updated = addItem('NOTAS_LICITACION', { ...newNota, workspaceId: wsId });
    setNotasLicitacion(updated.filter(n => n.workspaceId === wsId));
  };

  const handleAddInvestigacionIa = (newInv) => {
    const updated = addItem('INVESTIGACIONES_IA', { ...newInv, workspaceId: wsId });
    setInvestigacionesIa(updated.filter(i => i.workspaceId === wsId));
  };

  const handleAddCotizacionVersion = (newCot) => {
    const updated = addItem('COTIZACIONES', { ...newCot, workspaceId: wsId });
    setCotizaciones(updated.filter(c => c.workspaceId === wsId));
  };

  const handleDeleteConsulta = (consultaId) => {
    if (!consultaId) return;
    const targetIdStr = String(consultaId).trim();
    deleteItem('CONSULTAS', 'id', targetIdStr);
    setConsultas(prev => prev.filter(c => String(c.id || '').trim() !== targetIdStr));
  };

  const handleDeleteNotaLicitacion = (notaId) => {
    if (!notaId) return;
    const targetIdStr = String(notaId).trim();
    deleteItem('NOTAS_LICITACION', 'id', targetIdStr);
    setNotasLicitacion(prev => prev.filter(n => String(n.id || '').trim() !== targetIdStr));
  };

  const handleDeleteInvestigacionIa = (invId) => {
    if (!invId) return;
    const targetIdStr = String(invId).trim();
    deleteItem('INVESTIGACIONES_IA', 'id', targetIdStr);
    setInvestigacionesIa(prev => prev.filter(i => String(i.id || '').trim() !== targetIdStr));
  };

  const handleDeleteCotizacion = (cotId) => {
    if (!cotId) return;
    const targetIdStr = String(cotId).trim();
    deleteItem('COTIZACIONES', 'id', targetIdStr);
    setCotizaciones(prev => prev.filter(c => String(c.id || '').trim() !== targetIdStr));
  };

  const handleSaveUsuario = (userObj) => {
    // Inject workspaceId if not present
    const userWithWs = userObj.workspaceId ? userObj : { ...userObj, workspaceId: wsId };
    const allUsuarios = getData('USUARIOS');
    const existingIndex = allUsuarios.findIndex(u => u.email.toLowerCase() === userWithWs.email.toLowerCase());
    let updated = [];
    if (existingIndex >= 0) {
      updated = [...allUsuarios];
      updated[existingIndex] = userWithWs;
    } else {
      updated = [...allUsuarios, userWithWs];
    }
    saveData('USUARIOS', updated);
    setUsuarios(updated.filter(u => u.workspaceId === wsId || u.workspaceId === null));
  };

  const handleToggleUsuarioActivo = (email) => {
    const allUsuarios = getData('USUARIOS');
    const updated = allUsuarios.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, activo: !u.activo } : u);
    saveData('USUARIOS', updated);
    setUsuarios(updated.filter(u => u.workspaceId === wsId || u.workspaceId === null));
  };

  const handleDeleteUsuario = (email) => {
    if (email.toLowerCase() === 'josealarconv@gmail.com') return;
    const allUsuarios = getData('USUARIOS');
    const updated = allUsuarios.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    saveData('USUARIOS', updated);
    setUsuarios(updated.filter(u => u.workspaceId === wsId || u.workspaceId === null));
  };

  const handleSavePerfil = (perfilObj) => {
    const perfilWithWs = perfilObj.workspaceId ? perfilObj : { ...perfilObj, workspaceId: wsId };
    const allPerfiles = getData('PERFILES');
    const existingIndex = allPerfiles.findIndex(p => p.id === perfilWithWs.id);
    let updated = [];
    if (existingIndex >= 0) {
      updated = [...allPerfiles];
      updated[existingIndex] = perfilWithWs;
    } else {
      updated = [...allPerfiles, perfilWithWs];
    }
    saveData('PERFILES', updated);
    setPerfiles(updated.filter(p => p.workspaceId === wsId || p.workspaceId === null));
  };

  const handleDeletePerfil = (perfilId) => {
    if (perfilId === 'PRF-SUPERADMIN') return;
    const allPerfiles = getData('PERFILES');
    const targetPerfil = allPerfiles.find(p => p.id === perfilId);
    if (targetPerfil?.esProtegido) return;
    const allUsuarios = getData('USUARIOS');
    if (allUsuarios.some(u => u.perfilId === perfilId)) return;
    const updated = allPerfiles.filter(p => p.id !== perfilId);
    saveData('PERFILES', updated);
    setPerfiles(updated.filter(p => p.workspaceId === wsId || p.workspaceId === null));
  };

  const handleAddCliente = (newCli) => {
    const updated = addItem('CLIENTES', { ...newCli, workspaceId: wsId });
    setClientes(updated.filter(c => c.workspaceId === wsId));
  };

  const handleAddProveedor = (newPrv) => {
    const updated = addItem('PROVEEDORES', { ...newPrv, workspaceId: wsId });
    setProveedores(updated.filter(p => p.workspaceId === wsId));
  };

  const handleSaveConfig = (newConfig) => {
    // Save config into the active workspace
    if (activeWs) {
      updateWorkspace(activeWs.id, { config: newConfig });
      setActiveWs(prev => prev ? { ...prev, config: newConfig } : prev);
    }
    // Legacy compat
    saveData('CONFIGURACION', newConfig);
    setConfiguracion(newConfig);
  };

  // ============================================================
  // WORKSPACE CRUD (Creator only)
  // ============================================================
  const handleAddWorkspace = (wsObj) => {
    addWorkspace(wsObj);
    refreshWorkspace();
  };

  const handleUpdateWorkspace = (wsId, updates) => {
    updateWorkspace(wsId, updates);
    refreshWorkspace();
  };

  const handleDeleteWorkspaceAction = (wsId) => {
    deleteWorkspace(wsId);
    // If we just deleted the active workspace, switch to creator's
    if (wsId === getActiveWorkspaceId()) {
      setActiveWorkspace('WS-CREATOR');
    }
    refreshWorkspace();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white w-full">
      {/* 100% Screen Width Header */}
      <Header
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          setSelectedLicitacion(null);
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        counts={{
          licitaciones: filteredLicitaciones.length,
          clientes: clientes.length,
          proveedores: proveedores.length,
          consultas: consultas.length,
          cotizaciones: cotizaciones.length,
          anexos: anexos.length,
          usuarios: usuarios.length
        }}
        activeWorkspace={activeWs}
        allWorkspaces={allWorkspaces}
        onWorkspaceSwitch={handleWorkspaceSwitch}
        onLogout={() => setCurrentUser(null)}
      />

      {/* 100% Screen Width Main Content Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'licitaciones' && (
          selectedLicitacion ? (
            <LicitacionMasterDetail
              licitacion={selectedLicitacion}
              cliente={clientes.find(c => c.id === selectedLicitacion.clienteId)}
              detalles={detalles.filter(d => d.licitacionId === selectedLicitacion.id)}
              consultas={consultas.filter(c => detalles.some(d => d.id === c.detalleId && d.licitacionId === selectedLicitacion.id))}
              proveedores={proveedores}
              anexos={anexos.filter(a => a.licitacionId === selectedLicitacion.id)}
              notasLicitacion={notasLicitacion.filter(n => n.licitacionId === selectedLicitacion.id)}
              investigacionesIa={investigacionesIa.filter(i => detalles.some(d => d.id === i.detalleId && d.licitacionId === selectedLicitacion.id))}
              cotizaciones={cotizaciones.filter(c => c.licitacionId === selectedLicitacion.id)}
              currentUser={currentUser}
              onBack={() => setSelectedLicitacion(null)}
              onAddDetalle={handleAddDetalle}
              onEditDetalle={handleEditDetalle}
              onDeleteDetalle={handleDeleteDetalle}
              onAddConsulta={handleAddConsulta}
              onEditConsulta={handleEditConsulta}
              onDeleteConsulta={handleDeleteConsulta}
              onAddAnexo={handleAddAnexo}
              onDeleteAnexo={handleDeleteAnexo}
              onAddNotaLicitacion={handleAddNotaLicitacion}
              onDeleteNotaLicitacion={handleDeleteNotaLicitacion}
              onAddInvestigacionIa={handleAddInvestigacionIa}
              onDeleteInvestigacionIa={handleDeleteInvestigacionIa}
              onAddCotizacionVersion={handleAddCotizacionVersion}
              onDeleteCotizacion={handleDeleteCotizacion}
              onUpdateEstatus={handleUpdateEstatusLicitacion}
            />
          ) : (
            <LicitacionesTableView
              licitaciones={filteredLicitaciones}
              clientes={clientes}
              detalles={detalles}
              anexos={anexos}
              cotizaciones={cotizaciones}
              notasLicitacion={notasLicitacion}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectLicitacion={(lic) => setSelectedLicitacion(lic)}
              onAddLicitacion={handleAddLicitacion}
              onEditLicitacion={handleEditLicitacion}
              onDeleteLicitacion={handleDeleteLicitacion}
              onAddAnexo={handleAddAnexo}
            />
          )
        )}

        {activeView === 'clientes' && (
          <ClientesList
            clientes={clientes}
            licitaciones={licitaciones}
            onAddCliente={handleAddCliente}
          />
        )}

        {activeView === 'proveedores' && (
          <ProveedoresList
            proveedores={proveedores}
            consultas={consultas}
            onAddProveedor={handleAddProveedor}
          />
        )}

        {activeView === 'consultas' && (
          <ConsultasTableView
            consultas={consultas}
            proveedores={proveedores}
            detalles={detalles}
          />
        )}

        {activeView === 'cotizaciones' && (
          <CotizacionesTableView
            cotizaciones={cotizaciones}
            clientes={clientes}
            licitaciones={licitaciones}
            detalles={detalles}
            consultas={consultas}
          />
        )}

        {activeView === 'anexos' && (
          <AnexosTableView
            anexos={anexos}
            onDeleteAnexo={handleDeleteAnexo}
          />
        )}

        {activeView === 'configuracion' && (
          <ConfiguracionView
            config={configuracion}
            onSaveConfig={handleSaveConfig}
            usuarios={usuarios}
            perfiles={perfiles}
            onSaveUsuario={handleSaveUsuario}
            onSavePerfil={handleSavePerfil}
            onDeletePerfil={handleDeletePerfil}
            onToggleUsuarioActivo={handleToggleUsuarioActivo}
            onDeleteUsuario={handleDeleteUsuario}
            activeWorkspace={activeWs}
            allWorkspaces={allWorkspaces}
            onWorkspaceSwitch={handleWorkspaceSwitch}
            onAddWorkspace={handleAddWorkspace}
            onUpdateWorkspace={handleUpdateWorkspace}
            onDeleteWorkspace={handleDeleteWorkspaceAction}
          />
        )}
      </main>
    </div>
  );
}
