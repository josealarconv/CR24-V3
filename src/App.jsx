import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
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
  saveData,
  addItem
} from './services/storageService';
import { getActiveUser, hasPermission } from './services/authService';

export default function App() {
  const [activeView, setActiveView] = useState('licitaciones');
  const [selectedLicitacion, setSelectedLicitacion] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-01');

  // RBAC State
  const [currentUser, setCurrentUser] = useState(getActiveUser());

  // Data Store
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
    loadAllData();

    const handleStorageUpdate = () => loadAllData();
    const handleAuthChange = () => setCurrentUser(getActiveUser());

    window.addEventListener('storage-update', handleStorageUpdate);
    window.addEventListener('auth-state-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage-update', handleStorageUpdate);
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  const loadAllData = () => {
    setLicitaciones(getData('LICITACIONES'));
    setClientes(getData('CLIENTES'));
    setProveedores(getData('PROVEEDORES'));
    setDetalles(getData('DETALLES'));
    setConsultas(getData('CONSULTAS'));
    setCotizaciones(getData('COTIZACIONES'));
    setAnexos(getData('ANEXOS'));
    setUsuarios(getData('USUARIOS'));
    setPerfiles(getData('PERFILES'));
    setNotasLicitacion(getData('NOTAS_LICITACION'));
    setInvestigacionesIa(getData('INVESTIGACIONES_IA'));
    setConfiguracion(getData('CONFIGURACION'));
  };

  // Monthly & Search Filtering
  const filteredLicitaciones = licitaciones.filter(lic => {
    if (selectedMonth !== 'ALL') {
      if (lic.fecha && !lic.fecha.startsWith(selectedMonth)) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const cli = clientes.find(c => c.id === lic.clienteId);
      const cliNombre = cli ? cli.nombre.toLowerCase() : '';
      const numLic = (lic.numeroLicitacion || lic.id).toLowerCase();
      const notas = (lic.notas || '').toLowerCase();
      return numLic.includes(q) || cliNombre.includes(q) || notas.includes(q);
    }
    return true;
  });

  const handleAddLicitacion = (newLic) => {
    const updated = addItem('LICITACIONES', { ...newLic, createdBy: currentUser.email });
    setLicitaciones(updated);
    setSelectedLicitacion(newLic);
  };

  const handleUpdateEstatusLicitacion = (licId, newEstatus) => {
    const updated = licitaciones.map(l => l.id === licId ? { ...l, estatus: newEstatus } : l);
    saveData('LICITACIONES', updated);
    setLicitaciones(updated);
    if (selectedLicitacion && selectedLicitacion.id === licId) {
      setSelectedLicitacion(prev => ({ ...prev, estatus: newEstatus }));
    }
  };

  const handleAddDetalle = (newDet) => {
    const updated = addItem('DETALLES', newDet);
    setDetalles(updated);
  };

  const handleAddConsulta = (newCns) => {
    const updated = addItem('CONSULTAS', newCns);
    setConsultas(updated);
  };

  const handleAddAnexo = (newAnx) => {
    const updated = addItem('ANEXOS', newAnx);
    setAnexos(updated);
  };

  const handleAddNotaLicitacion = (newNota) => {
    const updated = addItem('NOTAS_LICITACION', newNota);
    setNotasLicitacion(updated);
  };

  const handleAddInvestigacionIa = (newInv) => {
    const updated = addItem('INVESTIGACIONES_IA', newInv);
    setInvestigacionesIa(updated);
  };

  const handleAddCotizacionVersion = (newCot) => {
    const updated = addItem('COTIZACIONES', newCot);
    setCotizaciones(updated);
  };

  const handleSaveUsuario = (userObj) => {
    const existingIndex = usuarios.findIndex(u => u.email.toLowerCase() === userObj.email.toLowerCase());
    let updated = [];
    if (existingIndex >= 0) {
      updated = [...usuarios];
      updated[existingIndex] = userObj;
    } else {
      updated = [...usuarios, userObj];
    }
    saveData('USUARIOS', updated);
    setUsuarios(updated);
  };

  const handleToggleUsuarioActivo = (email) => {
    const updated = usuarios.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, activo: !u.activo } : u);
    saveData('USUARIOS', updated);
    setUsuarios(updated);
  };

  const handleSavePerfil = (perfilObj) => {
    const existingIndex = perfiles.findIndex(p => p.id === perfilObj.id);
    let updated = [];
    if (existingIndex >= 0) {
      updated = [...perfiles];
      updated[existingIndex] = perfilObj;
    } else {
      updated = [...perfiles, perfilObj];
    }
    saveData('PERFILES', updated);
    setPerfiles(updated);
  };

  const handleAddCliente = (newCli) => {
    const updated = addItem('CLIENTES', newCli);
    setClientes(updated);
  };

  const handleAddProveedor = (newPrv) => {
    const updated = addItem('PROVEEDORES', newPrv);
    setProveedores(updated);
  };

  const handleSaveConfig = (newConfig) => {
    saveData('CONFIGURACION', newConfig);
    setConfiguracion(newConfig);
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
              onAddConsulta={handleAddConsulta}
              onAddAnexo={handleAddAnexo}
              onAddNotaLicitacion={handleAddNotaLicitacion}
              onAddInvestigacionIa={handleAddInvestigacionIa}
              onAddCotizacionVersion={handleAddCotizacionVersion}
              onUpdateEstatus={handleUpdateEstatusLicitacion}
            />
          ) : (
            <LicitacionesTableView
              licitaciones={filteredLicitaciones}
              clientes={clientes}
              detalles={detalles}
              selectedMonth={selectedMonth}
              onSelectLicitacion={(lic) => setSelectedLicitacion(lic)}
              onAddLicitacion={handleAddLicitacion}
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
          />
        )}

        {activeView === 'anexos' && (
          <AnexosTableView
            anexos={anexos}
          />
        )}

        {activeView === 'usuarios' && (
          <UsuariosPerfilesView
            usuarios={usuarios}
            perfiles={perfiles}
            onSaveUsuario={handleSaveUsuario}
            onSavePerfil={handleSavePerfil}
            onToggleUsuarioActivo={handleToggleUsuarioActivo}
          />
        )}

        {activeView === 'configuracion' && (
          <ConfiguracionView
            config={configuracion}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>
    </div>
  );
}
