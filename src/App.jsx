import React, { useState, useEffect } from 'react';
import AppSheetNavbar from './components/appsheet/AppSheetNavbar';
import LicitacionesTableView from './components/appsheet/LicitacionesTableView';
import LicitacionMasterDetail from './components/appsheet/LicitacionMasterDetail';
import ConsultasTableView from './components/appsheet/ConsultasTableView';
import CotizacionesTableView from './components/appsheet/CotizacionesTableView';
import AnexosTableView from './components/appsheet/AnexosTableView';
import ClientesList from './components/clientes/ClientesList';
import ProveedoresList from './components/proveedores/ProveedoresList';
import GeminiAssistantModal from './components/ai/GeminiAssistantModal';
import ConfiguracionView from './components/configuracion/ConfiguracionView';
import {
  initStorage,
  getData,
  saveData,
  addItem
} from './services/storageService';

export default function App() {
  const [activeView, setActiveView] = useState('licitaciones'); // 'licitaciones', 'clientes', 'proveedores', 'consultas', 'cotizaciones', 'anexos', 'configuracion'
  const [selectedLicitacion, setSelectedLicitacion] = useState(null);

  // Filters state (Bloque IV)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-01');

  // AI Modal state (Bloque VIII)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  // Storage State
  const [licitaciones, setLicitaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [configuracion, setConfiguracion] = useState({});

  useEffect(() => {
    initStorage();
    loadAllData();

    const handleStorageUpdate = () => loadAllData();
    window.addEventListener('storage-update', handleStorageUpdate);
    return () => window.removeEventListener('storage-update', handleStorageUpdate);
  }, []);

  const loadAllData = () => {
    setLicitaciones(getData('LICITACIONES'));
    setClientes(getData('CLIENTES'));
    setProveedores(getData('PROVEEDORES'));
    setDetalles(getData('DETALLES'));
    setConsultas(getData('CONSULTAS'));
    setCotizaciones(getData('COTIZACIONES'));
    setAnexos(getData('ANEXOS'));
    setConfiguracion(getData('CONFIGURACION'));
  };

  // Monthly filtering (Bloque IV punto 30)
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
    const updated = addItem('LICITACIONES', newLic);
    setLicitaciones(updated);
    setSelectedLicitacion(newLic);
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

  const openAiWithQuery = (prompt) => {
    setAiQuery(prompt);
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* AppSheet Header & Tabbed Navbar */}
      <AppSheetNavbar
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          setSelectedLicitacion(null);
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        openAiModal={() => openAiWithQuery('Analizar estado general de licitaciones y proveedores')}
        counts={{
          licitaciones: filteredLicitaciones.length,
          clientes: clientes.length,
          proveedores: proveedores.length,
          consultas: consultas.length,
          cotizaciones: cotizaciones.length,
          anexos: anexos.length
        }}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'licitaciones' && (
          selectedLicitacion ? (
            <LicitacionMasterDetail
              licitacion={selectedLicitacion}
              cliente={clientes.find(c => c.id === selectedLicitacion.clienteId)}
              detalles={detalles.filter(d => d.licitacionId === selectedLicitacion.id)}
              consultas={consultas.filter(c => detalles.some(d => d.id === c.detalleId && d.licitacionId === selectedLicitacion.id))}
              proveedores={proveedores}
              anexos={anexos.filter(a => a.entidadId === selectedLicitacion.id)}
              onBack={() => setSelectedLicitacion(null)}
              onAddDetalle={handleAddDetalle}
              onAddConsulta={handleAddConsulta}
              onAddAnexo={handleAddAnexo}
              openAiAssistant={openAiWithQuery}
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

        {activeView === 'configuracion' && (
          <ConfiguracionView
            config={configuracion}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>

      {/* Gemini AI Modal */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialQuery={aiQuery}
        contextData={{
          totalLicitaciones: licitaciones.length,
          totalClientes: clientes.length,
          totalProveedores: proveedores.length,
          licitacionActual: selectedLicitacion
        }}
      />
    </div>
  );
}
