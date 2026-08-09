import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Download,
  Sparkles,
  Paperclip,
  Share2,
  Send,
  MessageSquare,
  ExternalLink,
  DollarSign,
  FileText,
  Upload,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  Printer,
  Trash2,
  Edit2,
  Image as ImageIcon
} from 'lucide-react';
import { generateCotizacionPDF, generateWhatsAppShareLink, generateSMSShareLink, generateEmailShareLink } from '../../services/pdfService';
import { uploadFileToStorage } from '../../services/firebaseStorageService';
import { investigarProductoConGemini } from '../../services/geminiService';
import { deleteItem, updateItem, addItem } from '../../services/storageService';
import { Button, Badge, Card, Modal, Input } from '../ui/Components';
import { ASSETS } from '../../config/assets';

export default function LicitacionMasterDetail({
  licitacion,
  cliente,
  detalles = [],
  consultas = [],
  proveedores = [],
  anexos = [],
  notasLicitacion = [],
  investigacionesIa = [],
  cotizaciones = [],
  currentUser,
  onBack,
  onAddDetalle,
  onEditDetalle,
  onDeleteDetalle,
  onAddConsulta,
  onEditConsulta,
  onAddAnexo,
  onDeleteAnexo,
  onAddNotaLicitacion,
  onAddInvestigacionIa,
  onAddCotizacionVersion,
  onUpdateEstatus
}) {
  const [activeTab, setActiveTab] = useState('detalles'); // 'detalles' | 'consultas' | 'cotizacion' | 'anexos' | 'notas' | 'ia_history'

  // Product Modal State (Create / Edit Item)
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [editingDetalle, setEditingDetalle] = useState(null);
  const [prodDesc, setProdDesc] = useState('');
  const [prodCantReq, setProdCantReq] = useState(1);
  const [prodCondiciones, setProdCondiciones] = useState('');
  const [prodNotas, setProdNotas] = useState('');
  const [prodAnexos, setProdAnexos] = useState([]);
  const [uploadingItemFile, setUploadingItemFile] = useState(false);

  // Price Inquiry Quote Modal State (Create / Edit Supplier Quote)
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState(null);
  const [selectedDetalle, setSelectedDetalle] = useState(null);
  const [selectedProveedorId, setSelectedProveedorId] = useState('');
  const [cantCotizadaInput, setCantCotizadaInput] = useState(1);
  const [cantADespacharInput, setCantADespacharInput] = useState(1);
  const [monedaProveedorInput, setMonedaProveedorInput] = useState('CLP');
  const [tasaCambioInput, setTasaCambioInput] = useState(950);
  const [precioBaseInput, setPrecioBaseInput] = useState('');
  const [costoFleteInput, setCostoFleteInput] = useState('0');
  const [costoInternacionInput, setCostoInternacionInput] = useState('0');
  const [costoAfexInput, setCostoAfexInput] = useState('0');
  const [porcentajeImpuestoInput, setPorcentajeImpuestoInput] = useState('0');
  const [porcentajeMargenInput, setPorcentajeMargenInput] = useState('25');

  // Follow-up Notes State
  const [newNotaText, setNewNotaText] = useState('');

  // Gemini Research Loading State
  const [loadingAiDetalleId, setLoadingAiDetalleId] = useState(null);

  // Global File Upload & Viewer State
  const [uploading, setUploading] = useState(false);
  const [viewingAnexoDetail, setViewingAnexoDetail] = useState(null);
  const [deletingAnexoDetail, setDeletingAnexoDetail] = useState(null);
  const [deletingItemDetail, setDeletingItemDetail] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const parseNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const str = String(val).replace(',', '.');
    const n = parseFloat(str);
    return isNaN(n) ? 0 : n;
  };

  const isImageAnexo = (anexo) => {
    if (!anexo) return false;
    const type = (anexo.tipo || '').toLowerCase();
    const url = (anexo.url || '').toLowerCase();
    const name = (anexo.nombre || '').toLowerCase();
    return (
      type.startsWith('image/') ||
      url.startsWith('data:image/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp') ||
      name.endsWith('.gif') ||
      name.endsWith('.svg')
    );
  };

  const handlePrintAnexo = () => {
    if (!viewingAnexoDetail) return;
    const printWindow = window.open(viewingAnexoDetail.url, '_blank');
    if (printWindow) {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDownloadAnexo = (anexo) => {
    if (!anexo) return;
    const link = document.createElement('a');
    link.href = anexo.url;
    link.download = anexo.nombre || 'anexo_adjunto';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDeleteAnexo = () => {
    if (!deletingAnexoDetail || !onDeleteAnexo) return;
    onDeleteAnexo(deletingAnexoDetail.id);
    if (viewingAnexoDetail && viewingAnexoDetail.id === deletingAnexoDetail.id) {
      setViewingAnexoDetail(null);
    }
    setDeletingAnexoDetail(null);
  };

  const handleConfirmDeleteItem = () => {
    const itemObj = deletingItemDetail?.item || deletingItemDetail;
    const targetId = itemObj?.id || itemObj?.detalleId;
    const itemDesc = itemObj?.descripcion || 'seleccionado';

    try {
      if (targetId) {
        if (onDeleteDetalle) {
          onDeleteDetalle(targetId);
        }
        deleteItem('DETALLES', 'id', targetId);
        deleteItem('CONSULTAS', 'detalleId', targetId);
        deleteItem('INVESTIGACIONES_IA', 'detalleId', targetId);
        window.dispatchEvent(new Event('storage-update'));
        setActionFeedback(`Producto "${itemDesc}" eliminado correctamente.`);
      }
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setActionFeedback(`Error al eliminar producto: ${err.message}`);
    } finally {
      setDeletingItemDetail(null);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Helper calculation for supplier quote with multi-currency exchange rates and margins
  const computeQuoteCosts = ({
    licitacionMoneda = 'CLP',
    monedaProveedor = 'CLP',
    tasaCambio = 950,
    precioBase = 0,
    costoFlete = 0,
    costoInternacion = 0,
    costoAfex = 0,
    porcentajeImpuesto = 0,
    porcentajeMargen = 25,
    cantidadADespachar = 0
  }) => {
    let factor = 1;
    const rate = parseNumber(tasaCambio) || 950;
    if (licitacionMoneda === 'CLP' && monedaProveedor === 'USD') {
      factor = rate;
    } else if (licitacionMoneda === 'USD' && monedaProveedor === 'CLP') {
      factor = rate > 0 ? 1 / rate : 1;
    }

    const baseLicit = parseNumber(precioBase) * factor;
    const fleteLicit = parseNumber(costoFlete) * factor;
    const internacionLicit = parseNumber(costoInternacion) * factor;
    const afexLicit = parseNumber(costoAfex) * factor;
    const impPct = parseNumber(porcentajeImpuesto);
    const mgnPct = parseNumber(porcentajeMargen);

    const impuestoMonto = baseLicit * (impPct / 100);
    const costoUnitarioCompuesto = baseLicit + fleteLicit + internacionLicit + afexLicit + impuestoMonto;
    const precioVentaUnitario = costoUnitarioCompuesto * (1 + (mgnPct / 100));
    const qty = parseNumber(cantidadADespachar);
    const subtotalCosto = costoUnitarioCompuesto * qty;
    const subtotalVenta = precioVentaUnitario * qty;

    return {
      conversionFactor: factor,
      baseLicit,
      impuestoMonto,
      costoUnitarioCompuesto,
      precioVentaUnitario,
      subtotalCosto,
      subtotalVenta
    };
  };

  // Status Enum Options
  const estatusList = [
    'Abierto',
    'Consultando proveedores',
    'Cotizado al cliente',
    'Aprobado',
    'No aprobado',
    'A la espera de despacho',
    'Despacho enviado',
    'Esperando cobro',
    'Cobrado',
    'Pagado',
    'Cerrado'
  ];

  const getProveedorNombre = (id) => {
    const prov = proveedores.find(p => p.id === id);
    return prov ? prov.nombre : 'Proveedor Genérico';
  };

  const formatMoney = (amount, currency = 'CLP') => {
    const num = Number(amount) || 0;
    if (currency === 'USD') {
      return `USD $${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `CLP $${Math.round(num).toLocaleString('es-CL')}`;
  };

  // Compute Multi-Supplier Costing & Pricing for a Detalle Item
  const computeItemCosting = (detalleId) => {
    const itemConsultas = consultas.filter(c => c.detalleId === detalleId && c.estado === 'Aceptada');
    if (itemConsultas.length === 0) {
      return { totalQtyDespachable: 0, totalCostoCompuesto: 0, totalVentaCompuesto: 0, costoPromedioPonderado: 0, ventaPromedioPonderado: 0 };
    }

    const totalQtyDespachable = itemConsultas.reduce((acc, c) => acc + (c.cantidadADespachar || 0), 0);
    
    // Sum composites using stored values or dynamic calculation
    let totalCostoCompuesto = 0;
    let totalVentaCompuesto = 0;

    itemConsultas.forEach(c => {
      if (c.subtotalVenta !== undefined && c.subtotalCosto !== undefined) {
        totalCostoCompuesto += c.subtotalCosto;
        totalVentaCompuesto += c.subtotalVenta;
      } else {
        const computed = computeQuoteCosts({
          licitacionMoneda: licitacion.moneda,
          monedaProveedor: c.monedaProveedor || licitacion.moneda,
          tasaCambio: c.tasaCambio || 950,
          precioBase: c.precioBase,
          costoFlete: c.costoFlete,
          costoInternacion: c.costoInternacion,
          costoAfex: c.costoAfex,
          porcentajeImpuesto: c.porcentajeImpuesto,
          porcentajeMargen: c.porcentajeMargen !== undefined ? c.porcentajeMargen : 25,
          cantidadADespachar: c.cantidadADespachar
        });
        totalCostoCompuesto += computed.subtotalCosto;
        totalVentaCompuesto += computed.subtotalVenta;
      }
    });

    const costoPromedioPonderado = totalQtyDespachable > 0 ? totalCostoCompuesto / totalQtyDespachable : 0;
    const ventaPromedioPonderado = totalQtyDespachable > 0 ? totalVentaCompuesto / totalQtyDespachable : 0;

    return { totalQtyDespachable, totalCostoCompuesto, totalVentaCompuesto, costoPromedioPonderado, ventaPromedioPonderado };
  };

  // Grand Total Cost & Sales Calculations across all items
  const grandTotalCost = detalles.reduce((acc, det) => {
    const { totalCostoCompuesto } = computeItemCosting(det.id);
    return acc + totalCostoCompuesto;
  }, 0);

  const grandTotalVenta = detalles.reduce((acc, det) => {
    const { totalVentaCompuesto, totalCostoCompuesto } = computeItemCosting(det.id);
    // If supplier quotes are assigned, use totalVentaCompuesto; otherwise default 25% margin over cost
    return acc + (totalVentaCompuesto > 0 ? totalVentaCompuesto : Math.round(totalCostoCompuesto * 1.25));
  }, 0);

  const subtotalCotizado = grandTotalVenta > 0 ? grandTotalVenta : Math.round(grandTotalCost * 1.25);
  const ivaTotal = licitacion.moneda === 'CLP' ? Math.round(subtotalCotizado * 0.19) : 0;
  const totalCotizacion = subtotalCotizado + ivaTotal;

  // --- Product Modal Open Handlers ---
  const handleOpenCreateProducto = () => {
    setEditingDetalle(null);
    setProdDesc('');
    setProdCantReq(1);
    setProdCondiciones('');
    setProdNotas('');
    setProdAnexos([]);
    setShowProductoModal(true);
  };

  const handleOpenEditProducto = (item) => {
    setEditingDetalle(item);
    setProdDesc(item.descripcion || '');
    setProdCantReq(item.cantidadRequerida || 1);
    setProdCondiciones(item.condicionesEspeciales || '');
    setProdNotas(item.notas || '');
    setProdAnexos(item.anexos || []);
    setShowProductoModal(true);
  };

  const handleItemFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingItemFile(true);

    try {
      const newAnxList = [];
      for (const file of files) {
        const url = await uploadFileToStorage(file, `detalles/${licitacion.id}`);
        newAnxList.push({
          id: `ANX-DET-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          nombre: file.name,
          url,
          fecha: new Date().toISOString().split('T')[0],
          tipo: file.type || 'Documento/Imagen',
          size: Math.round(file.size / 1024)
        });
      }
      setProdAnexos(prev => [...prev, ...newAnxList]);
    } catch (err) {
      console.error('Error al subir anexo del producto:', err);
    } finally {
      setUploadingItemFile(false);
    }
  };

  const handleRemoveItemAnexo = (anxId) => {
    setProdAnexos(prev => prev.filter(a => a.id !== anxId));
  };

  const handleSaveProductoSubmit = (e) => {
    e.preventDefault();
    if (!prodDesc.trim()) return;

    try {
      if (editingDetalle) {
        const updatedItem = {
          ...editingDetalle,
          licitacionId: licitacion.id,
          descripcion: prodDesc.trim(),
          cantidadRequerida: parseInt(prodCantReq) || 1,
          cantidadACotizar: parseInt(prodCantReq) || 1,
          condicionesEspeciales: prodCondiciones.trim(),
          notas: prodNotas.trim(),
          anexos: prodAnexos
        };

        if (onEditDetalle) {
          onEditDetalle(updatedItem);
        }
        updateItem('DETALLES', 'id', updatedItem.id, updatedItem);
        window.dispatchEvent(new Event('storage-update'));
        setActionFeedback(`Producto "${prodDesc.trim()}" actualizado correctamente.`);
      } else {
        const newItem = {
          id: `DET-${Date.now()}`,
          licitacionId: licitacion.id,
          descripcion: prodDesc.trim(),
          cantidadRequerida: parseInt(prodCantReq) || 1,
          cantidadACotizar: parseInt(prodCantReq) || 1,
          condicionesEspeciales: prodCondiciones.trim(),
          notas: prodNotas.trim(),
          anexos: prodAnexos
        };

        if (onAddDetalle) {
          onAddDetalle(newItem);
        }
        addItem('DETALLES', newItem);
        window.dispatchEvent(new Event('storage-update'));
        setActionFeedback(`Producto "${prodDesc.trim()}" creado correctamente.`);
      }
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setActionFeedback(`Error al guardar producto: ${err.message}`);
    } finally {
      setShowProductoModal(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // --- Supplier Quote Modal Handlers ---
  const handleOpenCreateConsulta = (item) => {
    setSelectedDetalle(item);
    setEditingConsulta(null);
    setSelectedProveedorId(proveedores[0]?.id || '');
    setCantCotizadaInput(item.cantidadRequerida || 1);
    setCantADespacharInput(0);
    setMonedaProveedorInput(licitacion.moneda || 'CLP');
    setTasaCambioInput(950);
    setPrecioBaseInput('');
    setCostoFleteInput('0');
    setCostoInternacionInput('0');
    setCostoAfexInput('0');
    setPorcentajeImpuestoInput('0');
    setPorcentajeMargenInput('25');
    setShowConsultaModal(true);
  };

  const handleOpenEditConsulta = (cns, item) => {
    setSelectedDetalle(item);
    setEditingConsulta(cns);
    setSelectedProveedorId(cns.proveedorId);
    setCantCotizadaInput(cns.cantidadCotizada || cns.cantidadADespachar || 1);
    setCantADespacharInput(cns.cantidadADespachar || 1);
    setMonedaProveedorInput(cns.monedaProveedor || licitacion.moneda || 'CLP');
    setTasaCambioInput(cns.tasaCambio || 950);
    setPrecioBaseInput(cns.precioBase || '');
    setCostoFleteInput(cns.costoFlete || 0);
    setCostoInternacionInput(cns.costoInternacion || 0);
    setCostoAfexInput(cns.costoAfex || 0);
    setPorcentajeImpuestoInput(cns.porcentajeImpuesto || 0);
    setPorcentajeMargenInput(cns.porcentajeMargen !== undefined ? cns.porcentajeMargen : 25);
    setShowConsultaModal(true);
  };

  const handleSaveConsultaSubmit = (e) => {
    e.preventDefault();
    if (!selectedDetalle || !selectedProveedorId || !precioBaseInput) return;

    const base = parseFloat(precioBaseInput) || 0;
    const flete = parseFloat(costoFleteInput) || 0;
    const internacion = parseFloat(costoInternacionInput) || 0;
    const afex = parseFloat(costoAfexInput) || 0;
    const impPct = parseFloat(porcentajeImpuestoInput) || 0;
    const mgnPct = parseFloat(porcentajeMargenInput) || 0;
    const qtyDesp = parseInt(cantADespacharInput) || 1;
    const qtyCot = parseInt(cantCotizadaInput) || qtyDesp;
    const tasa = parseFloat(tasaCambioInput) || 950;

    const computed = computeQuoteCosts({
      licitacionMoneda: licitacion.moneda,
      monedaProveedor: monedaProveedorInput,
      tasaCambio: tasa,
      precioBase: base,
      costoFlete: flete,
      costoInternacion: internacion,
      costoAfex: afex,
      porcentajeImpuesto: impPct,
      porcentajeMargen: mgnPct,
      cantidadADespachar: qtyDesp
    });

    const payload = {
      id: editingConsulta ? editingConsulta.id : `CNS-${Date.now().toString().slice(-4)}`,
      detalleId: selectedDetalle.id,
      proveedorId: selectedProveedorId,
      cantidadCotizada: qtyCot,
      cantidadADespachar: qtyDesp,
      monedaProveedor: monedaProveedorInput,
      tasaCambio: tasa,
      precioBase: base,
      costoFlete: flete,
      costoInternacion: internacion,
      costoAfex: afex,
      porcentajeImpuesto: impPct,
      porcentajeMargen: mgnPct,
      costoUnitarioCompuesto: computed.costoUnitarioCompuesto,
      precioVentaUnitario: computed.precioVentaUnitario,
      subtotalCosto: computed.subtotalCosto,
      subtotalVenta: computed.subtotalVenta,
      fecha: editingConsulta ? editingConsulta.fecha : new Date().toISOString().split('T')[0],
      estado: 'Aceptada'
    };

    if (editingConsulta) {
      if (onEditConsulta) onEditConsulta(payload);
    } else {
      onAddConsulta(payload);
    }

    setShowConsultaModal(false);
  };

  const handleAddNotaSubmit = (e) => {
    e.preventDefault();
    if (!newNotaText.trim()) return;

    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    onAddNotaLicitacion({
      id: `NTA-${Date.now().toString().slice(-4)}`,
      licitacionId: licitacion.id,
      fechaHora: dateStr,
      usuario: currentUser?.nombre || 'Usuario Operador',
      texto: newNotaText.trim()
    });

    setNewNotaText('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const url = await uploadFileToStorage(file, `licitaciones/${licitacion.id}`);
      onAddAnexo({
        id: `ANX-${Date.now().toString().slice(-4)}`,
        licitacionId: licitacion.id,
        nombre: file.name,
        url,
        fecha: new Date().toISOString().split('T')[0],
        tipo: file.type || 'Documento/Imagen'
      });
    } catch (err) {
      console.error('Error al subir archivo:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerAiResearch = async (detalleItem) => {
    setLoadingAiDetalleId(detalleItem.id);
    try {
      const resultJSON = await investigarProductoConGemini(detalleItem.descripcion, licitacion.moneda);
      const now = new Date();
      const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

      onAddInvestigacionIa({
        id: `INV-${Date.now().toString().slice(-4)}`,
        detalleId: detalleItem.id,
        fechaHora: dateStr,
        promptBusqueda: detalleItem.descripcion,
        resultadoJSON: resultJSON
      });
    } catch (err) {
      console.error('Error al ejecutar Gemini IA:', err);
    } finally {
      setLoadingAiDetalleId(null);
    }
  };

  const handleGenerateVersionedPDF = async () => {
    try {
      const nextVersion = cotizaciones.length + 1;

      // Map item costings with actual assigned supplier prices
      const itemsConCosteo = detalles.map(det => {
        const costing = computeItemCosting(det.id);
        const itemConsultas = consultas.filter(c => c.detalleId === det.id && c.estado === 'Aceptada');
        
        // Calculated unit selling price for PDF
        const precioVentaUnitarioFinal = costing.ventaPromedioPonderado > 0 
          ? costing.ventaPromedioPonderado 
          : Math.round((costing.costoPromedioPonderado || 100000) * 1.25);

        return {
          ...det,
          costing,
          itemConsultas,
          precioVentaUnitarioFinal
        };
      });

      const blob = await generateCotizacionPDF({
        licitacion,
        cliente,
        itemsConCosteo,
        totales: {
          subtotalCotizado,
          ivaTotal,
          totalCotizacion
        },
        version: nextVersion,
        currentUser
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cotizacion_${licitacion.numeroLicitacion || licitacion.id}_v${nextVersion}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const now = new Date();
      const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

      onAddCotizacionVersion({
        id: `COT-${Date.now().toString().slice(-4)}`,
        licitacionId: licitacion.id,
        numeroCotizacion: `COT-${licitacion.numeroLicitacion || licitacion.id}-v${nextVersion}`,
        version: nextVersion,
        fechaHora: dateStr,
        usuario: currentUser?.nombre || 'Operador Licitaciones',
        subtotal: subtotalCotizado,
        iva: ivaTotal,
        total: totalCotizacion,
        urlPDF: url
      });
    } catch (err) {
      console.error('Error generando PDF de Cotización:', err);
    }
  };

  const itemInvestigaciones = investigacionesIa.filter(i => detalles.some(d => d.id === i.detalleId));

  // Current Modal Calculation for Live Preview in Supplier Quote Modal
  const modalLiveCosting = computeQuoteCosts({
    licitacionMoneda: licitacion.moneda,
    monedaProveedor: monedaProveedorInput,
    tasaCambio: tasaCambioInput,
    precioBase: precioBaseInput,
    costoFlete: costoFleteInput,
    costoInternacion: costoInternacionInput,
    costoAfex: costoAfexInput,
    porcentajeImpuesto: porcentajeImpuestoInput,
    porcentajeMargen: porcentajeMargenInput,
    cantidadADespachar: cantADespacharInput
  });

  return (
    <div className="space-y-5 pb-12 w-full">
      {actionFeedback && (
        <div className="p-3 bg-blue-950/90 border border-blue-800 text-blue-200 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl animate-in fade-in">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-blue-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Master Licitacion Header Card (100% Screen Width) */}
      <div className="bg-zinc-900/80 p-5 rounded-xl border border-zinc-800/80 space-y-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Volver a la tabla de licitaciones"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg font-bold text-zinc-100 font-mono">
                  {licitacion.numeroLicitacion || licitacion.id}
                </h1>
                <Badge variant="info">{licitacion.estatus}</Badge>
                <Badge variant="default">{licitacion.moneda || 'CLP'}</Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cliente: <strong className="text-zinc-200">{cliente?.nombre || 'N/A'}</strong> (RUT: {cliente?.rut || 'N/A'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Selector */}
            <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Estatus:</span>
              <select
                value={licitacion.estatus}
                onChange={(e) => onUpdateEstatus(licitacion.id, e.target.value)}
                className="bg-transparent text-xs text-zinc-100 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {estatusList.map(st => (
                  <option key={st} value={st} className="bg-zinc-900">{st}</option>
                ))}
              </select>
            </div>

            {/* Versioned PDF Action */}
            <Button variant="primary" size="sm" onClick={handleGenerateVersionedPDF}>
              <FileCheck className="w-3.5 h-3.5" />
              <span>Cotizar</span>
            </Button>
          </div>
        </div>

        {/* Licitacion Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full">
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Fecha Ingreso</span>
            <span className="font-semibold text-zinc-200 font-mono">{licitacion.fecha}</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Fecha Límite Cotizar</span>
            <span className="font-semibold text-zinc-200 font-mono">{licitacion.fechaCotizacion || 'N/A'}</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Moneda Operación</span>
            <span className="font-bold text-blue-400 font-mono">{licitacion.moneda || 'CLP'}</span>
          </div>
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px] block font-mono uppercase">Total Cotización Calculada</span>
            <span className="font-bold text-emerald-400 font-mono">{formatMoney(totalCotizacion, licitacion.moneda)}</span>
          </div>
        </div>

        {licitacion.notas && (
          <p className="text-xs text-zinc-400 bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-800/60">
            <strong className="text-zinc-300">Notas de la Licitación:</strong> {licitacion.notas}
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800 space-x-4 w-full">
        {[
          { id: 'detalles', label: `Productos (${detalles.length})` },
          { id: 'consultas', label: `Consultas (${consultas.length})` },
          { id: 'cotizacion', label: `Cotizaciones (${cotizaciones.length})` },
          { id: 'notas', label: `Notas (${notasLicitacion.length})` },
          { id: 'ia_history', label: `Consulta IA (${itemInvestigaciones.length})` },
          { id: 'anexos', label: `Anexos (${anexos.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-500 text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TABLE 1: PRODUCTOS (NUEVO BOTÓN Y CARDS CON ANEXOS) */}
      {activeTab === 'detalles' && (
        <div className="space-y-4 w-full">
          {/* Top Banner Action */}
          <div className="flex items-center justify-between bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800/90 shadow-md">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span>Líneas de Productos y Suministros Requeridos</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Administra los productos del cliente, sube sus anexos técnicos y gestiona cotizaciones de proveedores.</p>
            </div>

            <Button variant="primary" size="sm" onClick={handleOpenCreateProducto}>
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </Button>
          </div>

          {/* List of Product Cards */}
          {detalles.length === 0 ? (
            <EmptyState
              title="Sin productos registrados"
              description="Haz clic en 'Nuevo Producto' para registrar los requerimientos de la licitación."
              icon={FileText}
            />
          ) : (
            <div className="space-y-4 w-full">
              {detalles.map((item, idx) => {
                const { totalQtyDespachable, totalCostoCompuesto, totalVentaCompuesto, costoPromedioPonderado, ventaPromedioPonderado } = computeItemCosting(item.id);
                const itemConsultas = consultas.filter(c => c.detalleId === item.id);
                const isAiLoading = loadingAiDetalleId === item.id;
                const reqQty = item.cantidadRequerida || 1;
                const coveragePercent = Math.min(100, Math.round((totalQtyDespachable / reqQty) * 100));
                const isFullyCovered = totalQtyDespachable >= reqQty;
                const isPartiallyCovered = totalQtyDespachable > 0 && totalQtyDespachable < reqQty;
                const itemAnexos = item.anexos || [];

                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700/80 rounded-xl p-4 space-y-3.5 shadow-xl transition-all backdrop-blur-md"
                  >
                    {/* Header Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/70 pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/90 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-zinc-100 tracking-wide">{item.descripcion}</h3>
                            
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-300 border border-zinc-800">
                              Requerido: {reqQty} u.
                            </span>

                            {isFullyCovered && (
                              <span className="text-[10px] font-medium font-sans px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Confirmadas {totalQtyDespachable}/{reqQty} u. (100%)</span>
                              </span>
                            )}

                            {isPartiallyCovered && (
                              <span className="text-[10px] font-medium font-sans px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Confirmadas {totalQtyDespachable}/{reqQty} u.</span>
                              </span>
                            )}

                            {!totalQtyDespachable && (
                              <span className="text-[10px] font-medium font-sans px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500">
                                Sin Confirmar Proveedor
                              </span>
                            )}
                          </div>

                          {item.condicionesEspeciales && (
                            <p className="text-xs text-blue-300/90 mt-1 font-mono">
                              <strong>Condiciones / Especificaciones:</strong> {item.condicionesEspeciales}
                            </p>
                          )}

                          {item.notas && <p className="text-xs text-zinc-400 mt-0.5 italic">{item.notas}</p>}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProducto(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all border border-zinc-700/80"
                          title="Editar información y anexos de este producto"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Editar</span>
                        </button>

                        {onDeleteDetalle && (
                          <button
                            type="button"
                            onClick={() => {
                              const countCns = itemConsultas.length;
                              const countAnx = itemAnexos.length;
                              setDeletingItemDetail({
                                item,
                                hasData: countCns > 0 || countAnx > 0,
                                countCns,
                                countAnx
                              });
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer border border-zinc-800"
                            title="Eliminar este producto de la licitación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isAiLoading}
                          onClick={() => handleTriggerAiResearch(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-950 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 border border-blue-800/80 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
                          title="Investigar distribuidores y precio referencial con Gemini IA"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isAiLoading ? 'Investigando...' : 'Investigar IA'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCreateConsulta(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Asignar Proveedor</span>
                        </button>
                      </div>
                    </div>

                    {/* Attached Item Files / Anexos (if any) */}
                    {itemAnexos.length > 0 && (
                      <div className="space-y-1.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/60 text-xs">
                        <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                          <span>Anexos del Producto ({itemAnexos.length}):</span>
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {itemAnexos.map(anx => (
                            <div key={anx.id} className="flex items-center space-x-2 px-2.5 py-1 bg-zinc-900 rounded-md border border-zinc-800 font-mono text-[11px]">
                              <span className="text-zinc-200 font-sans font-medium">{anx.nombre}</span>
                              <span className="text-zinc-500">({anx.size || 0} KB)</span>

                              <button
                                type="button"
                                onClick={() => setViewingAnexoDetail(anx)}
                                className="p-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                                title="Ver anexo"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3-KPI Financial Costing & Selling Summary Deck */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
                      <div>
                        <span className="text-zinc-500 text-[10px] font-mono uppercase block">Unidades Confirmadas:</span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="font-bold text-zinc-100 font-mono text-xs">
                            {totalQtyDespachable} / {reqQty} u.
                          </span>
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${isFullyCovered ? 'bg-emerald-400' : 'bg-blue-400'}`}
                              style={{ width: `${coveragePercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-500 text-[10px] font-mono uppercase block">Costo Unit. Compuesto / Venta Unit.:</span>
                        <span className="font-bold text-zinc-200 font-mono text-xs mt-0.5 block">
                          Costo: {formatMoney(costoPromedioPonderado, licitacion.moneda)} | Venta: <strong className="text-blue-400">{formatMoney(ventaPromedioPonderado, licitacion.moneda)}</strong>
                        </span>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-zinc-500 text-[10px] font-mono uppercase block">Subtotal Venta Sugerido Ítem:</span>
                        <span className="font-bold text-emerald-400 font-mono text-sm mt-0.5 block">
                          {formatMoney(totalVentaCompuesto, licitacion.moneda)}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Suppliers List */}
                    {itemConsultas.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-zinc-400 text-[11px] font-semibold block flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Proveedores Cotizados & Adjudicados ({itemConsultas.length}):</span>
                        </span>

                        <div className="space-y-1 bg-zinc-950/40 rounded-lg p-2 border border-zinc-800/60 divide-y divide-zinc-800/50">
                          {itemConsultas.map(c => {
                            const computed = computeQuoteCosts({
                              licitacionMoneda: licitacion.moneda,
                              monedaProveedor: c.monedaProveedor || licitacion.moneda,
                              tasaCambio: c.tasaCambio || 950,
                              precioBase: c.precioBase,
                              costoFlete: c.costoFlete,
                              costoInternacion: c.costoInternacion,
                              costoAfex: c.costoAfex,
                              porcentajeImpuesto: c.porcentajeImpuesto,
                              porcentajeMargen: c.porcentajeMargen !== undefined ? c.porcentajeMargen : 25,
                              cantidadADespachar: c.cantidadADespachar
                            });

                            return (
                              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 text-xs gap-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-zinc-200">{getProveedorNombre(c.proveedorId)}</span>
                                  <Badge variant="success" size="xs">
                                    Despacha {c.cantidadADespachar} u. (Cotizó {c.cantidadCotizada || c.cantidadADespachar} u.)
                                  </Badge>
                                  {c.monedaProveedor && c.monedaProveedor !== licitacion.moneda && (
                                    <Badge variant="info" size="xs">
                                      {c.monedaProveedor} @ {c.tasaCambio || 950}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center space-x-3">
                                  <div className="font-mono text-zinc-400 text-[11px] text-right">
                                    Costo Unit: <span className="text-zinc-300">{formatMoney(computed.costoUnitarioCompuesto, licitacion.moneda)}</span> | Margen: <span className="text-amber-400 font-bold">+{c.porcentajeMargen || 25}%</span> | Venta Unit: <strong className="text-emerald-400">{formatMoney(computed.precioVentaUnitario, licitacion.moneda)}</strong>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditConsulta(c, item)}
                                    className="p-1 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                    title="Editar cotización y cantidades a despachar de este proveedor"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TABLE 2: CONSULTAS DE PRECIOS */}
      {activeTab === 'consultas' && (
        <Card title="Consultas de Precios Aceptadas a Proveedores">
          {consultas.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No hay consultas de precios registradas.</p>
          ) : (
            <div className="divide-y divide-zinc-800/80 w-full">
              {consultas.map(c => {
                const det = detalles.find(d => d.id === c.detalleId);
                const computed = computeQuoteCosts({
                  licitacionMoneda: licitacion.moneda,
                  monedaProveedor: c.monedaProveedor || licitacion.moneda,
                  tasaCambio: c.tasaCambio || 950,
                  precioBase: c.precioBase,
                  costoFlete: c.costoFlete,
                  costoInternacion: c.costoInternacion,
                  costoAfex: c.costoAfex,
                  porcentajeImpuesto: c.porcentajeImpuesto,
                  porcentajeMargen: c.porcentajeMargen !== undefined ? c.porcentajeMargen : 25,
                  cantidadADespachar: c.cantidadADespachar
                });

                return (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-zinc-100">{getProveedorNombre(c.proveedorId)}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Ítem: <strong className="text-zinc-300">{det?.descripcion || 'Genérico'}</strong> • Despacha: {c.cantidadADespachar} u. (Cotizó {c.cantidadCotizada || c.cantidadADespachar} u.) • {c.fecha}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right font-mono">
                        <p className="font-bold text-emerald-400">Subtotal Venta: {formatMoney(computed.subtotalVenta, licitacion.moneda)}</p>
                        <p className="text-[10px] text-zinc-500">Costo Unit: {formatMoney(computed.costoUnitarioCompuesto, licitacion.moneda)} | Venta Unit: {formatMoney(computed.precioVentaUnitario, licitacion.moneda)} (+{c.porcentajeMargen || 25}%)</p>
                      </div>

                      {det && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditConsulta(c, det)}
                          className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          title="Editar cotización de proveedor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* SUB-TABLE 3: COTIZACIONES PDF VERSIONADAS */}
      {activeTab === 'cotizacion' && (
        <Card title="Historial de Cotizaciones PDF Emitidas (Versionadas)">
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <p className="text-xs text-zinc-400">Cada emisión genera un nuevo archivo PDF versionado sin eliminar versiones previas.</p>
              <Button variant="primary" size="sm" onClick={handleGenerateVersionedPDF}>
                <FileCheck className="w-3.5 h-3.5" />
                <span>Cotizar</span>
              </Button>
            </div>

            {cotizaciones.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No se ha emitido ninguna cotización PDF aún.</p>
            ) : (
              <div className="space-y-2.5 w-full">
                {cotizaciones.map((cot) => (
                  <div key={cot.id} className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-zinc-100 font-mono">{cot.numeroCotizacion || cot.id}</span>
                        <Badge variant="info">Versión {cot.version}</Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        Emitido por: {cot.usuario} • {cot.fechaHora}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-emerald-400 font-mono">{formatMoney(cot.total, licitacion.moneda)}</span>
                      {cot.urlPDF && (
                        <a
                          href={cot.urlPDF}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md"
                          title="Abrir PDF"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sharing Tools */}
            <div className="pt-3 border-t border-zinc-800">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">Opciones de Envío Directo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={generateWhatsAppShareLink({ id: licitacion.id, total: totalCotizacion }, cliente)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 p-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </a>

                <a
                  href={generateEmailShareLink({ id: licitacion.id, total: totalCotizacion }, cliente)}
                  className="flex items-center justify-center space-x-2 p-2.5 bg-blue-950/30 hover:bg-blue-950/50 text-blue-300 border border-blue-800/60 rounded-lg text-xs font-medium transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por Correo</span>
                </a>

                <a
                  href={generateSMSShareLink({ id: licitacion.id, total: totalCotizacion }, cliente)}
                  className="flex items-center justify-center space-x-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-medium transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar por SMS</span>
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUB-TABLE 4: NOTAS DE SEGUIMIENTO */}
      {activeTab === 'notas' && (
        <Card title="Notas de Seguimiento con Marca de Tiempo">
          <div className="space-y-4 w-full">
            <form onSubmit={handleAddNotaSubmit} className="flex gap-2">
              <Input
                value={newNotaText}
                onChange={(e) => setNewNotaText(e.target.value)}
                placeholder="Escribe una nota de seguimiento interno..."
                className="flex-1"
                required
              />
              <Button type="submit" variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Nota</span>
              </Button>
            </form>

            {notasLicitacion.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No hay notas de seguimiento registradas.</p>
            ) : (
              <div className="space-y-2 w-full">
                {notasLicitacion.map(n => (
                  <div key={n.id} className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                      <span>{n.usuario}</span>
                      <span>{n.fechaHora}</span>
                    </div>
                    <p className="text-zinc-200">{n.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* SUB-TABLE 5: HISTÓRICO DE INVESTIGACIÓN IA GEMINI */}
      {activeTab === 'ia_history' && (
        <Card title="Histórico de Investigaciones Gemini IA (Indexado por Ítem)">
          {itemInvestigaciones.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No se han realizado investigaciones de IA en esta licitación.</p>
          ) : (
            <div className="space-y-4 w-full">
              {itemInvestigaciones.map(inv => (
                <div key={inv.id} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-zinc-100 font-mono">Investigación IA - {inv.fechaHora}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Ítem: {inv.promptBusqueda}</span>
                  </div>

                  {inv.resultadoJSON && (
                    <div className="space-y-2 text-zinc-300">
                      <p><strong>Resumen Técnico:</strong> {inv.resultadoJSON.resumenTecnico}</p>
                      
                      <div>
                        <strong className="text-zinc-200 block text-[11px]">Especificaciones Sugeridas:</strong>
                        <ul className="list-disc list-inside text-zinc-400 font-mono text-[11px] mt-0.5">
                          {inv.resultadoJSON.especificacionesTecnicas?.map((spec, i) => (
                            <li key={i}>{spec}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60">
                        <div>
                          <strong className="text-zinc-200 block text-[11px]">Proveedores Locales (Chile):</strong>
                          <ul className="text-zinc-400 font-mono text-[11px] mt-0.5">
                            {inv.resultadoJSON.proveedoresLocalesChilenos?.map((p, i) => (
                              <li key={i}>• {p}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-zinc-200 block text-[11px]">Proveedores Internacionales:</strong>
                          <ul className="text-zinc-400 font-mono text-[11px] mt-0.5">
                            {inv.resultadoJSON.proveedoresInternacionales?.map((p, i) => (
                              <li key={i}>• {p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <p className="pt-2 font-mono text-emerald-400">
                        <strong>Rango Estimado Mercado:</strong> {inv.resultadoJSON.precioRangoMercado}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SUB-TABLE 6: ANEXOS Y ARCHIVOS */}
      {activeTab === 'anexos' && (
        <Card title="Anexos y Documentos Adjuntos de la Licitación">
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <p className="text-xs text-zinc-400">Documentos y fotografías adjuntas a esta licitación.</p>
              <label className="flex items-center space-x-2 px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-100 rounded-lg text-xs font-semibold cursor-pointer border border-blue-700/80 shadow-xs transition-all">
                <Plus className="w-3.5 h-3.5" />
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Subiendo...' : 'Agregar Anexo'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="application/pdf,image/*"
                  disabled={uploading}
                />
              </label>
            </div>

            {anexos.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Sin anexos adjuntos.</p>
            ) : (
              <div className="space-y-2 w-full">
                {anexos.map(a => {
                  const imageFile = isImageAnexo(a);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 text-xs">
                      <div className="flex items-center space-x-2.5">
                        {imageFile ? (
                          <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Paperclip className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-zinc-200">{a.nombre}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{a.fecha}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => setViewingAnexoDetail(a)}
                          className="px-2 py-1 rounded-lg bg-blue-950/60 border border-blue-800/80 text-blue-400 hover:bg-blue-900/80 flex items-center space-x-1 text-xs font-semibold cursor-pointer transition-all"
                          title="Visualizar en pantalla"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadAnexo(a)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Descargar archivo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {onDeleteAnexo && (
                          <button
                            type="button"
                            onClick={() => setDeletingAnexoDetail(a)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Eliminar anexo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal Visualizador de Anexos (PDF e Imágenes) */}
      <Modal
        isOpen={!!viewingAnexoDetail}
        onClose={() => setViewingAnexoDetail(null)}
        title={viewingAnexoDetail?.nombre || 'Visualizador de Anexo'}
        maxWidth="max-w-[92vw]"
      >
        <div className="w-full">
          {viewingAnexoDetail && (
            isImageAnexo(viewingAnexoDetail) ? (
              <div className="h-[83vh] flex items-center justify-center bg-zinc-950 p-2 rounded-xl border border-zinc-800 overflow-auto">
                <img
                  src={viewingAnexoDetail.url}
                  alt={viewingAnexoDetail.nombre}
                  className="max-h-[81vh] max-w-full object-contain rounded-lg shadow-2xl"
                />
              </div>
            ) : (
              <iframe
                src={viewingAnexoDetail.url}
                className="w-full h-[83vh] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
                title="Visualizador de Documento"
              />
            )
          )}
        </div>
      </Modal>

      {/* Modal Borrado Anexo */}
      <Modal
        isOpen={!!deletingAnexoDetail}
        onClose={() => setDeletingAnexoDetail(null)}
        title={`Eliminar Anexo: ${deletingAnexoDetail?.nombre || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            ¿Está seguro que desea eliminar permanentemente el archivo adjunto <strong className="text-zinc-100">{deletingAnexoDetail?.nombre}</strong>?
          </p>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" onClick={() => setDeletingAnexoDetail(null)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDeleteAnexo}>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmar Eliminar</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL CREAR / EDITAR PRODUCTO E ÍTEM CON ANEXOS */}
      <Modal
        isOpen={showProductoModal}
        onClose={() => setShowProductoModal(false)}
        title={editingDetalle ? `Editar Producto / Requerimiento` : `Registrar Nuevo Producto`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveProductoSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción del Producto / Insumo *</label>
            <Input
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              placeholder="Ej: Multímetro Digital Fluke 87V TRMS / Válvula Mariposa 6 pulgadas..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Cantidad Requerida *</label>
              <Input
                type="number"
                min="1"
                value={prodCantReq}
                onChange={(e) => setProdCantReq(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Condiciones / Espec. Técnicas</label>
              <Input
                value={prodCondiciones}
                onChange={(e) => setProdCondiciones(e.target.value)}
                placeholder="Ej: Norma DIN / Salida 4-20mA / Protocolo HART..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas u Observaciones del Ítem</label>
            <textarea
              value={prodNotas}
              onChange={(e) => setProdNotas(e.target.value)}
              rows="2"
              placeholder="Detalles sobre entrega, calibraciones o requisitos de empaque..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Upload Attachments inside Product Modal */}
          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                <span>Adjuntar Fichas Técnicas, Fotos o PDFs</span>
              </label>

              <label className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingItemFile ? 'Subiendo...' : 'Seleccionar Archivos'}</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleItemFileUpload}
                  accept="application/pdf,image/*"
                  disabled={uploadingItemFile}
                />
              </label>
            </div>

            {prodAnexos.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {prodAnexos.map((anx) => (
                  <div key={anx.id} className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg border border-zinc-800 font-mono text-[11px]">
                    <span className="font-sans font-medium text-zinc-200 truncate max-w-[240px]">{anx.nombre}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-zinc-500">{anx.size || 0} KB</span>
                      <button
                        type="button"
                        onClick={() => setViewingAnexoDetail(anx)}
                        className="p-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                        title="Previsualizar archivo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemAnexo(anx.id)}
                        className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                        title="Quitar de este producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowProductoModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingDetalle ? 'Guardar Cambios' : 'Registrar Producto'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL REGISTRAR / EDITAR CONSULTA Y PRECIO PROVEEDOR (MULTIMONEDA Y MÁRGENES) */}
      <Modal
        isOpen={showConsultaModal}
        onClose={() => setShowConsultaModal(false)}
        title={editingConsulta ? `Editar Cotización de Proveedor` : `Asignar Cotización de Proveedor`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveConsultaSubmit} className="space-y-3 text-xs">
          <p className="text-xs text-zinc-400 border-b border-zinc-800 pb-2">
            Ítem: <strong className="text-zinc-200">{selectedDetalle?.descripcion}</strong> (Req: {selectedDetalle?.cantidadRequerida || 1} u.)
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Proveedor Consultado *</label>
              <select
                value={selectedProveedorId}
                onChange={(e) => setSelectedProveedorId(e.target.value)}
                className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none"
                required
              >
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Moneda del Proveedor</label>
              <select
                value={monedaProveedorInput}
                onChange={(e) => setMonedaProveedorInput(e.target.value)}
                className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none font-semibold"
              >
                <option value="CLP">Pesos Chilenos (CLP)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
          </div>

          {/* Quantities: Cotizada (Obligatorio) vs A Despachar (Opcional) */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1">Cantidad Cotizada Proveedor *</label>
              <Input
                type="number"
                min="1"
                value={cantCotizadaInput}
                onChange={(e) => setCantCotizadaInput(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Cantidad a Despachar (Opcional)</label>
              <Input
                type="number"
                min="0"
                value={cantADespacharInput}
                onChange={(e) => setCantADespacharInput(e.target.value)}
                placeholder="0 (Asignar al comprar)"
                className="border-zinc-800 text-zinc-200"
              />
            </div>
          </div>

          {/* Exchange Rate (shown if provider currency differs from licitacion currency) */}
          {monedaProveedorInput !== licitacion.moneda && (
            <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/60 space-y-1">
              <label className="block text-xs font-semibold text-amber-300">
                Tasa de Cambio ({monedaProveedorInput} a {licitacion.moneda}) *
              </label>
              <Input
                type="number"
                step="any"
                value={tasaCambioInput}
                onChange={(e) => setTasaCambioInput(e.target.value)}
                placeholder="Ej: 950.00"
                className="border-amber-800 text-amber-200 font-mono font-bold"
                required
              />
              <p className="text-[10px] text-amber-400/80">
                {licitacion.moneda === 'CLP' && monedaProveedorInput === 'USD' ? `Multiplica USD por $${tasaCambioInput} CLP para llevar a pesos.` : `Divide CLP por $${tasaCambioInput} para llevar a USD.`}
              </p>
            </div>
          )}

          {/* Price breakdown in provider currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Precio Base Unitario ({monedaProveedorInput}) *</label>
              <Input
                type="number"
                step="any"
                value={precioBaseInput}
                onChange={(e) => setPrecioBaseInput(e.target.value)}
                placeholder="Ej: 380000 o 450.50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Flete / Despacho ({monedaProveedorInput})</label>
              <Input
                type="number"
                step="any"
                value={costoFleteInput}
                onChange={(e) => setCostoFleteInput(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Internación / Aduana ({monedaProveedorInput})</label>
              <Input
                type="number"
                step="any"
                value={costoInternacionInput}
                onChange={(e) => setCostoInternacionInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">AFEX / Admin ({monedaProveedorInput})</label>
              <Input
                type="number"
                step="any"
                value={costoAfexInput}
                onChange={(e) => setCostoAfexInput(e.target.value)}
              />
            </div>
          </div>

          {/* Taxes & Margin */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Impuesto / IVA / Arancel (%)</label>
              <Input
                type="number"
                step="any"
                value={porcentajeImpuestoInput}
                onChange={(e) => setPorcentajeImpuestoInput(e.target.value)}
                placeholder="Ej: 19 para IVA"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">Margen de Ganancia (%) *</label>
              <Input
                type="number"
                step="any"
                value={porcentajeMargenInput}
                onChange={(e) => setPorcentajeMargenInput(e.target.value)}
                placeholder="Ej: 25"
                className="border-amber-800 text-amber-300 font-bold"
                required
              />
            </div>
          </div>

          {/* Live Financial Cost & Sales Calculator Box */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Costo Unit. Compuesto ({licitacion.moneda}):</span>
              <span className="font-bold text-zinc-200">{formatMoney(modalLiveCosting.costoUnitarioCompuesto, licitacion.moneda)}</span>
            </div>
            <div className="flex justify-between text-amber-300">
              <span>Precio Venta Unit. Sugerido (+{porcentajeMargenInput || 0}%):</span>
              <span className="font-bold">{formatMoney(modalLiveCosting.precioVentaUnitario, licitacion.moneda)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 pt-1 border-t border-zinc-800 font-bold text-sm">
              <span>Subtotal Venta ({cantADespacharInput || 0} u.):</span>
              <span>{formatMoney(modalLiveCosting.subtotalVenta, licitacion.moneda)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowConsultaModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingConsulta ? 'Guardar Cambios' : 'Guardar Cotización Proveedor'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Borrado de Producto */}
      <Modal
        isOpen={!!deletingItemDetail}
        onClose={() => setDeletingItemDetail(null)}
        title={`Eliminar Producto: ${deletingItemDetail?.item?.descripcion || ''}`}
      >
        <div className="space-y-4">
          {deletingItemDetail?.hasData ? (
            <div className="p-3.5 bg-amber-950/50 border border-amber-800/80 rounded-xl space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>No se puede eliminar este producto</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Este producto contiene información vinculada en la base de datos:
              </p>
              <ul className="text-amber-300/90 list-disc list-inside font-mono space-y-1">
                {deletingItemDetail.countCns > 0 && <li>{deletingItemDetail.countCns} cotización(es) de proveedores</li>}
                {deletingItemDetail.countAnx > 0 && <li>{deletingItemDetail.countAnx} archivo(s) anexo(s) adjunto(s)</li>}
              </ul>
              <p className="text-zinc-400 pt-1">
                Para eliminar este producto, remueva primero sus cotizaciones de proveedores y anexos adjuntos.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 text-xs">
              <p className="text-zinc-200">
                ¿Está seguro que desea eliminar permanentemente el producto <strong className="text-zinc-100">{deletingItemDetail?.item?.descripcion}</strong>?
              </p>
              <p className="text-zinc-400">Esta licitación no tiene cotizaciones ni anexos asociados. Esta acción no se podrá deshacer.</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              onClick={() => setDeletingItemDetail(null)}
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!!deletingItemDetail?.hasData}
              onClick={handleConfirmDeleteItem}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmar Eliminar</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
