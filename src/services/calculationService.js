/* ===============================================================
   Calculation & Data Helpers Engine (LicitApp v2)
================================================================ */

export const uid = () => Math.random().toString(36).slice(2, 10);
export const nowISO = () => new Date().toISOString();
export const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const MONEDAS = ["USD", "EUR", "MXN", "COP", "PEN", "CLP", "ARS", "DOP", "GTQ", "PAB"];

export const fmtMoney = (n, currency = "USD") => {
  try {
    return num(n).toLocaleString("es-ES", { style: "currency", currency, minimumFractionDigits: 2 });
  } catch {
    return `${currency} ${num(n).toFixed(2)}`;
  }
};

export const ESTADOS = [
  { id: "nueva", label: "Nueva", color: "#5B6478", bg: "#EEF0F4" },
  { id: "analisis", label: "En análisis", color: "#2B3A67", bg: "#E7EAF3" },
  { id: "cotizando", label: "Cotizando", color: "#B45309", bg: "#FBEEDB" },
  { id: "aplicada", label: "Aplicada", color: "#0F6E8C", bg: "#E1F1F5" },
  { id: "ganada", label: "Ganada", color: "#2F7D5A", bg: "#E4F3EC" },
  { id: "perdida", label: "Perdida", color: "#B3261E", bg: "#FBE7E6" },
];

export const estadoInfo = (id) => ESTADOS.find((e) => e.id === id) || ESTADOS[0];

export const ESTADO_CONSULTA = [
  { id: "solicitada", label: "Solicitada", color: "#8A5A12", bg: "#FBEEDB" },
  { id: "recibida", label: "Recibida", color: "#2F7D5A", bg: "#E4F3EC" },
  { id: "descartada", label: "Descartada", color: "#B3261E", bg: "#FBE7E6" },
];

export const consultaInfo = (id) => ESTADO_CONSULTA.find((e) => e.id === id) || ESTADO_CONSULTA[0];

export const PALETTE = ["#2B3A67", "#C9A227", "#0F6E8C", "#7C5CBF", "#B45309", "#2F7D5A", "#9B2C5D", "#5B6478"];

export function providerColor(name, names) {
  if (!name || !Array.isArray(names)) return PALETTE[0];
  const i = names.indexOf(name);
  return PALETTE[(i < 0 ? 0 : i) % PALETTE.length];
}

export function emptyItem() {
  return {
    id: uid(),
    descripcion: "",
    cantidad: 1,
    unidad: "und",
    especificaciones: "",
    margenOverride: "",
    notas: [],
    investigaciones: [],
    adjuntos: [],
    consultas: [],      // cotizaciones recibidas de terceros
    asignaciones: [],   // [{consultaId, cantidad}]
  };
}

export function emptyLicitacion() {
  return {
    id: uid(),
    titulo: "",
    cliente: "",
    referencia: "",
    portalUrl: "",
    fechaPublicacion: "",
    fechaLimite: "",
    estado: "nueva",
    notasGenerales: "",
    createdAt: nowISO(),
    config: { margenGlobal: 20, moneda: "USD", iva: 0 },
    adjuntos: [],
    items: [emptyItem()],
    cotizacionesEmitidas: [],
  };
}

/* ===============================================================
   Cálculo central — por proveedor, por ítem, consolidado
================================================================ */
export function computeLicitacion(lic) {
  if (!lic) return {
    moneda: "USD", iva: 0, items: [], porProveedor: [],
    totalCosto: 0, subtotalVenta: 0, montoIva: 0, totalVenta: 0,
    ganancia: 0, margenEfectivo: 0, incompletos: [], excedidos: [], plazoGlobal: 0
  };

  const config = lic.config || { margenGlobal: 20, moneda: "USD", iva: 0 };
  const margenGlobal = num(config.margenGlobal);
  const moneda = config.moneda || "USD";
  const iva = num(config.iva);

  const licItems = lic.items || [];

  const items = licItems.map((item) => {
    const margen = item.margenOverride !== "" && item.margenOverride != null
      ? num(item.margenOverride)
      : margenGlobal;

    const consultas = item.consultas || [];
    const asignaciones = item.asignaciones || [];

    // una línea por proveedor asignado
    const lineas = asignaciones
      .map((a) => {
        const c = consultas.find((x) => x.id === a.consultaId);
        if (!c) return null;
        const cantidad = num(a.cantidad);
        const costo = cantidad * num(c.precioUnitario);
        const venta = costo * (1 + margen / 100);
        return {
          consultaId: c.id,
          proveedor: c.proveedor || "Sin nombre",
          cantidad,
          precioUnitario: num(c.precioUnitario),
          plazoDias: num(c.plazoDias),
          costo,
          venta,
          ganancia: venta - costo,
        };
      })
      .filter(Boolean);

    const cantidadSolicitada = num(item.cantidad);
    const cantidadAsignada = lineas.reduce((s, l) => s + l.cantidad, 0);
    const costo = lineas.reduce((s, l) => s + l.costo, 0);
    const venta = lineas.reduce((s, l) => s + l.venta, 0);
    const precioUnitarioVenta = cantidadAsignada > 0 ? venta / cantidadAsignada : 0;
    const plazoMax = lineas.length ? Math.max(...lineas.map((l) => l.plazoDias)) : 0;

    return {
      itemId: item.id,
      descripcion: item.descripcion,
      unidad: item.unidad,
      cantidadSolicitada,
      cantidadAsignada,
      pendiente: Math.max(cantidadSolicitada - cantidadAsignada, 0),
      exceso: Math.max(cantidadAsignada - cantidadSolicitada, 0),
      margen,
      lineas,
      costo,
      venta,
      precioUnitarioVenta,
      ganancia: venta - costo,
      plazoMax,
      mixta: new Set(lineas.map((l) => l.proveedor)).size > 1,
    };
  });

  const totalCosto = items.reduce((s, i) => s + i.costo, 0);
  const subtotalVenta = items.reduce((s, i) => s + i.venta, 0);
  const montoIva = subtotalVenta * (iva / 100);
  const totalVenta = subtotalVenta + montoIva;
  const ganancia = subtotalVenta - totalCosto;
  const margenEfectivo = subtotalVenta > 0 ? (ganancia / subtotalVenta) * 100 : 0;

  // consolidado de COMPRA por proveedor (órdenes de compra)
  const porProveedorMap = {};
  items.forEach((i) => {
    i.lineas.forEach((l) => {
      if (!porProveedorMap[l.proveedor]) {
        porProveedorMap[l.proveedor] = { proveedor: l.proveedor, lineas: [], costo: 0, plazoMax: 0 };
      }
      porProveedorMap[l.proveedor].lineas.push({
        descripcion: i.descripcion || "(sin descripción)",
        unidad: i.unidad,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        costo: l.costo,
      });
      porProveedorMap[l.proveedor].costo += l.costo;
      porProveedorMap[l.proveedor].plazoMax = Math.max(porProveedorMap[l.proveedor].plazoMax, l.plazoDias);
    });
  });
  const porProveedor = Object.values(porProveedorMap).sort((a, b) => b.costo - a.costo);

  const incompletos = items.filter((i) => i.pendiente > 0 || i.cantidadAsignada === 0);
  const excedidos = items.filter((i) => i.exceso > 0);

  return {
    moneda,
    iva,
    items,
    porProveedor,
    totalCosto,
    subtotalVenta,
    montoIva,
    totalVenta,
    ganancia,
    margenEfectivo,
    incompletos,
    excedidos,
    plazoGlobal: items.length ? Math.max(...items.map((i) => i.plazoMax)) : 0,
  };
}
