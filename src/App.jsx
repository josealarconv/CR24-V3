import React, { useState, useEffect, useRef } from 'react';
import Header from './components/common/Header';
import LoginScreen from './components/auth/LoginScreen';
import LicitacionMasterDetail from './components/licitaciones/LicitacionMasterDetail';
import ConsultasTableView from './components/appsheet/ConsultasTableView';
import CotizacionesTableView from './components/appsheet/CotizacionesTableView';
import AnexosTableView from './components/appsheet/AnexosTableView';
import ClientesList from './components/clientes/ClientesList';
import ProveedoresList from './components/proveedores/ProveedoresList';
import ConfiguracionView from './components/configuracion/ConfiguracionView';
import {
  ConfirmProvider, useConfirm, Badge, TextInput, PrimaryBtn, Empty
} from './components/ui/Components';
import {
  initStorage,
  getData,
  getWorkspaceData,
  getNormalizedLicitaciones,
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
  isCreator,
} from './services/authService';
import {
  estadoInfo, emptyLicitacion, fmtMoney, num
} from './services/calculationService';
import {
  Search, Plus, PackageSearch, Building2, Clock
} from 'lucide-react';

/* Sidebar Tender List Item Card */
function Tarjeta({ lic, activa, onClick }) {
  const info = estadoInfo(lic.estado);
  const dias = lic.fechaLimite ? Math.ceil((new Date(lic.fechaLimite) - new Date()) / 86400000) : null;
  const cotizaciones = lic.cotizacionesEmitidas || [];
  const ultima = [...cotizaciones].sort((a, b) => b.version - a.version)[0];
  const itemsCount = (lic.items || []).length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-3.5 py-3 text-left transition cursor-pointer ${
        activa ? "border-[#2B3A67] bg-[#EEF0F7]" : "border-[#EDEFF3] bg-white hover:border-[#C7CCD6]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#131A2C]">{lic.titulo || "Sin título"}</p>
        <Badge color={info.color} bg={info.bg}>{info.label}</Badge>
      </div>
      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#8A93A6]">
        <Building2 size={11} />{lic.cliente || "Cliente sin definir"}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[#A6ADBB]">
        <span className="flex items-center gap-1"><PackageSearch size={11} />{itemsCount} ítem(s)</span>
        {ultima && <span className="font-mono text-[#131A2C]">v{ultima.version} · {fmtMoney(ultima.totalVenta, ultima.moneda)}</span>}
        {dias != null && (
          <span className={dias < 0 ? "font-semibold text-[#B3261E]" : dias <= 3 ? "font-semibold text-[#B45309]" : ""}>
            {dias < 0 ? "Vencida" : `${dias}d`}
          </span>
        )}
      </div>
    </button>
  );
}

function MainAppContent() {
  const [activeView, setActiveView] = useState('licitaciones');
  const [selectedLicitacionId, setSelectedLicitacionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeWs, setActiveWs] = useState(null);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [mobileVista, setMobileVista] = useState('lista'); // 'lista' | 'detalle'

  const confirming = useConfirm();

  useEffect(() => {
    initStorage();
    setCurrentUser(getActiveUser());
    refreshWorkspace();

    const handleStorageUpdate = () => setDataVersion((v) => v + 1);
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
    setDataVersion((v) => v + 1);
  };

  const wsId = getActiveWorkspaceId();

  // Load normalized workspace-scoped licitaciones
  const licitaciones = getNormalizedLicitaciones(wsId);
  const clientes = getWorkspaceData('CLIENTES', wsId);
  const proveedores = getWorkspaceData('PROVEEDORES', wsId);
  const detalles = getWorkspaceData('DETALLES', wsId);
  const consultas = getWorkspaceData('CONSULTAS', wsId);
  const cotizaciones = getWorkspaceData('COTIZACIONES', wsId);
  const anexos = getWorkspaceData('ANEXOS', wsId);
  const usuarios = getData('USUARIOS').filter(u => u.workspaceId === wsId || (wsId === 'WS-CREATOR' && u.workspaceId === null));
  const perfiles = getData('PERFILES').filter(p => p.workspaceId === wsId || (wsId === 'WS-CREATOR' && p.workspaceId === null));
  const configuracion = activeWs?.config || getData('CONFIGURACION') || {};

  // Default selection
  useEffect(() => {
    if (licitaciones.length > 0 && !selectedLicitacionId) {
      setSelectedLicitacionId(licitaciones[0].id);
    }
  }, [licitaciones, selectedLicitacionId]);

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  const handleWorkspaceSwitch = (newWsId) => {
    setActiveWorkspace(newWsId);
    setSelectedLicitacionId(null);
    setActiveView('licitaciones');
  };

  const filteredLicitaciones = licitaciones.filter((l) => {
    const q = searchTerm.trim().toLowerCase();
    const queryMatch = `${l.titulo} ${l.cliente} ${l.referencia} ${l.notasGenerales}`.toLowerCase().includes(q);
    if (!queryMatch) return false;
    if (selectedMonth !== 'ALL' && l.fechaPublicacion && !l.fechaPublicacion.startsWith(selectedMonth)) {
      return false;
    }
    return true;
  });

  const selectedLicitacion = licitaciones.find((l) => l.id === selectedLicitacionId) || filteredLicitaciones[0] || null;

  const updateSelectedLicitacion = (nextLic) => {
    const allLics = getData('LICITACIONES');
    const updated = allLics.map((l) => (l.id === nextLic.id ? { ...l, ...nextLic } : l));
    saveData('LICITACIONES', updated);
    setDataVersion((v) => v + 1);
  };

  const crearLicitacion = () => {
    const l = { ...emptyLicitacion(), workspaceId: wsId, createdBy: currentUser.email };
    const allLics = getData('LICITACIONES');
    saveData('LICITACIONES', [l, ...allLics]);
    setSelectedLicitacionId(l.id);
    setMobileVista('detalle');
    setDataVersion((v) => v + 1);
  };

  const eliminarLicitacion = async () => {
    if (!selectedLicitacion) return;
    const itemsCount = (selectedLicitacion.items || []).length;
    const ok = await confirming({
      titulo: "¿Eliminar la licitación completa?",
      mensaje: selectedLicitacion.titulo || "Sin título",
      detalle: `Se borrarán sus ${itemsCount} ítem(s) junto con sus notas, investigaciones y adjuntos.`,
      textoConfirmar: "Eliminar todo",
    });
    if (!ok) return;

    deleteItem('LICITACIONES', 'id', selectedLicitacion.id);
    const remaining = licitaciones.filter((l) => l.id !== selectedLicitacion.id);
    setSelectedLicitacionId(remaining[0]?.id ?? null);
    setMobileVista('lista');
    setDataVersion((v) => v + 1);
  };

  const handleAddCliente = (newCli) => {
    const updated = addItem('CLIENTES', { ...newCli, workspaceId: wsId });
    setDataVersion((v) => v + 1);
  };

  const handleEditCliente = (updatedCliente) => {
    if (!updatedCliente) return;
    const allData = getData('CLIENTES');
    const updated = allData.map(c => c.id === updatedCliente.id ? { ...c, ...updatedCliente } : c);
    saveData('CLIENTES', updated);
    setDataVersion((v) => v + 1);
  };

  const handleDeleteCliente = (clienteId) => {
    if (!clienteId) return;
    deleteItem('CLIENTES', 'id', clienteId);
    setDataVersion((v) => v + 1);
  };

  const handleAddProveedor = (newPrv) => {
    const updated = addItem('PROVEEDORES', { ...newPrv, workspaceId: wsId });
    setDataVersion((v) => v + 1);
  };

  const handleEditProveedor = (updatedProveedor) => {
    if (!updatedProveedor) return;
    const allData = getData('PROVEEDORES');
    const updated = allData.map(p => p.id === updatedProveedor.id ? { ...p, ...updatedProveedor } : p);
    saveData('PROVEEDORES', updated);
    setDataVersion((v) => v + 1);
  };

  const handleDeleteProveedor = (proveedorId) => {
    if (!proveedorId) return;
    deleteItem('PROVEEDORES', 'id', proveedorId);
    setDataVersion((v) => v + 1);
  };

  const handleDeleteAnexo = (anexoId) => {
    deleteItem('ANEXOS', 'id', String(anexoId).trim());
    setDataVersion((v) => v + 1);
  };

  const handleSaveConfig = (newConfig) => {
    if (activeWs) {
      updateWorkspace(activeWs.id, { config: newConfig });
      setActiveWs((prev) => (prev ? { ...prev, config: newConfig } : prev));
    }
    saveData('CONFIGURACION', newConfig);
    setDataVersion((v) => v + 1);
  };

  const handleSaveUsuario = (userObj) => {
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
    setDataVersion((v) => v + 1);
  };

  const handleToggleUsuarioActivo = (email) => {
    const allUsuarios = getData('USUARIOS');
    const updated = allUsuarios.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, activo: !u.activo } : u);
    saveData('USUARIOS', updated);
    setDataVersion((v) => v + 1);
  };

  const handleDeleteUsuario = (email) => {
    if (email.toLowerCase() === 'josealarconv@gmail.com') return;
    const allUsuarios = getData('USUARIOS');
    const updated = allUsuarios.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    saveData('USUARIOS', updated);
    setDataVersion((v) => v + 1);
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
    setDataVersion((v) => v + 1);
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
    setDataVersion((v) => v + 1);
  };

  const handleAddWorkspace = (wsObj) => {
    addWorkspace(wsObj);
    refreshWorkspace();
  };

  const handleUpdateWorkspace = (wsId, updates) => {
    updateWorkspace(wsId, updates);
    refreshWorkspace();
  };

  const handleDeleteWorkspaceAction = (wsIdToDelete) => {
    deleteWorkspace(wsIdToDelete);
    if (wsIdToDelete === getActiveWorkspaceId()) {
      setActiveWorkspace('WS-CREATOR');
    }
    refreshWorkspace();
  };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }} className="min-h-screen bg-[#F5F6F8] text-[#131A2C] flex flex-col w-full">
      <Header
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          setMobileVista('lista');
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

      <main className="mx-auto flex-1 w-full max-w-[1400px] px-4 py-4">
        {activeView === 'licitaciones' && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[330px_1fr]">
            {/* Left Sidebar: Search + Cards List */}
            <aside className={`space-y-3 ${mobileVista === "detalle" ? "hidden md:block" : ""}`}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A6ADBB]" />
                  <TextInput placeholder="Buscar licitación…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
                <PrimaryBtn onClick={crearLicitacion} className="whitespace-nowrap">
                  <Plus size={16} strokeWidth={2.5} />Nueva
                </PrimaryBtn>
              </div>

              {filteredLicitaciones.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#DDE1E8] bg-white px-4 py-7 text-center">
                  <PackageSearch size={20} className="mx-auto mb-2 text-[#C7CCD6]" />
                  <p className="mb-3 text-sm text-[#8A93A6]">
                    {licitaciones.length === 0 ? "No hay licitaciones aún." : "Ningún resultado."}
                  </p>
                  {licitaciones.length === 0 && (
                    <PrimaryBtn onClick={crearLicitacion} className="mx-auto">
                      <Plus size={16} strokeWidth={2.5} />Crear primera licitación
                    </PrimaryBtn>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLicitaciones.map((l) => (
                    <Tarjeta
                      key={l.id}
                      lic={l}
                      activa={selectedLicitacion?.id === l.id}
                      onClick={() => {
                        setSelectedLicitacionId(l.id);
                        setMobileVista('detalle');
                      }}
                    />
                  ))}
                </div>
              )}
            </aside>

            {/* Right Main Section: Master-Detail view */}
            <section className={mobileVista === "lista" ? "hidden md:block" : ""}>
              {selectedLicitacion ? (
                <LicitacionMasterDetail
                  licitacion={selectedLicitacion}
                  onChange={updateSelectedLicitacion}
                  onDelete={eliminarLicitacion}
                  onBack={() => setMobileVista('lista')}
                />
              ) : (
                <Empty>Selecciona o crea una licitación para comenzar.</Empty>
              )}
            </section>
          </div>
        )}

        {activeView === 'clientes' && (
          <ClientesList
            clientes={clientes}
            licitaciones={licitaciones}
            onAddCliente={handleAddCliente}
            onEditCliente={handleEditCliente}
            onDeleteCliente={handleDeleteCliente}
          />
        )}

        {activeView === 'proveedores' && (
          <ProveedoresList
            proveedores={proveedores}
            consultas={consultas}
            onAddProveedor={handleAddProveedor}
            onEditProveedor={handleEditProveedor}
            onDeleteProveedor={handleDeleteProveedor}
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

export default function App() {
  return (
    <ConfirmProvider>
      <MainAppContent />
    </ConfirmProvider>
  );
}
