import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import LicitacionesList from './components/licitaciones/LicitacionesList';
import LicitacionDetail from './components/licitaciones/LicitacionDetail';
import ClientesList from './components/clientes/ClientesList';
import ProveedoresList from './components/proveedores/ProveedoresList';
import GeminiAssistantModal from './components/ai/GeminiAssistantModal';
import ConfiguracionView from './components/configuracion/ConfiguracionView';
import {
  initStorage,
  getData,
  saveData,
  addItem,
  updateItem,
  getOfflineQueue
} from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState('licitaciones'); // 'licitaciones', 'clientes', 'proveedores', 'cotizaciones', 'anexos', 'configuracion'
  const [selectedLicitacion, setSelectedLicitacion] = useState(null);

  // Filters state (Bloque IV)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-01');

  // AI Modal state (Bloque VIII)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');

  // Mobile menu state (Bloque III)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Storage Data
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

  const handleAddLicitacion = () => {
    const newLic = {
      id: `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      numeroLicitacion: `ID-${Math.floor(100 + Math.random() * 900)}`,
      fecha: new Date().toISOString().split('T')[0],
      fechaCotizacion: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      clienteId: clientes[0]?.id || 'eb1b1ad7',
      estatus: 'Abierto',
      notas: 'Nueva licitación registrada.',
      notasCotizacion: 'Validez 5 días hábiles.',
      contador: 1
    };
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

  const openAiWithQuery = (queryText) => {
    setAiInitialQuery(queryText);
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        openAiModal={() => openAiWithQuery('Analizar estado general de licitaciones')}
        toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedLicitacion(null);
          }}
          isMobileOpen={isMobileMenuOpen}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
          counts={{
            licitaciones: filteredLicitaciones.length,
            clientes: clientes.length,
            proveedores: proveedores.length,
            cotizaciones: cotizaciones.length,
            anexos: anexos.length
          }}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'licitaciones' && (
            selectedLicitacion ? (
              <LicitacionDetail
                licitacion={selectedLicitacion}
                cliente={clientes.find(c => c.id === selectedLicitacion.clienteId)}
                detalles={detalles.filter(d => d.licitacionId === selectedLicitacion.id)}
                consultas={consultas.filter(c => detalles.some(d => d.id === c.detalleId && d.licitacionId === selectedLicitacion.id))}
                proveedores={proveedores}
                anexos={anexos.filter(a => a.entidadId === selectedLicitacion.id)}
                onBack={() => setSelectedLicitacion(null)}
                onAddDetalle={handleAddDetalle}
                onAddConsulta={handleAddConsulta}
                openAiAssistant={openAiWithQuery}
              />
            ) : (
              <LicitacionesList
                licitaciones={filteredLicitaciones}
                clientes={clientes}
                selectedMonth={selectedMonth}
                onSelectLicitacion={(lic) => setSelectedLicitacion(lic)}
                onNewLicitacion={handleAddLicitacion}
              />
            )
          )}

          {activeTab === 'clientes' && (
            <ClientesList
              clientes={clientes}
              licitaciones={licitaciones}
              onAddCliente={handleAddCliente}
            />
          )}

          {activeTab === 'proveedores' && (
            <ProveedoresList
              proveedores={proveedores}
              consultas={consultas}
              onAddProveedor={handleAddProveedor}
            />
          )}

          {activeTab === 'cotizaciones' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h1 className="text-xl font-bold text-white">Histórico de Cotizaciones Emitidas</h1>
              <div className="divide-y divide-slate-800">
                {cotizaciones.map(cot => (
                  <div key={cot.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{cot.id}</span>
                      <p className="text-xs text-slate-400 font-mono">Fecha: {cot.fecha} • Versión {cot.version}</p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">${cot.total?.toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'anexos' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h1 className="text-xl font-bold text-white">Repositorio de Anexos & Archivos</h1>
              <div className="space-y-2">
                {anexos.map(anx => (
                  <div key={anx.id} className="p-3 bg-slate-800/60 rounded-lg flex items-center justify-between border border-slate-700">
                    <span className="text-sm font-medium text-white">{anx.nombre}</span>
                    <span className="text-xs font-mono text-slate-400">{anx.fecha}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'configuracion' && (
            <ConfiguracionView
              config={configuracion}
              onSaveConfig={handleSaveConfig}
            />
          )}
        </main>
      </div>

      {/* Gemini AI Modal */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialQuery={aiInitialQuery}
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
