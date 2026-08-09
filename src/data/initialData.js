// CR24 V4 - Multi-Tenant Workspace Seed Data

// ============================================================
// WORKSPACES
// ============================================================
export const INITIAL_WORKSPACES = [
  {
    id: 'WS-CREATOR',
    nombre: 'Sala de Operación',
    plan: 'creator',
    maxUsuarios: 999,
    activo: true,
    fechaCreacion: '2026-08-01',
    config: {
      empresa: 'CR24 — Sala de Operación',
      rut: '',
      direccion: '',
      telefono: '',
      email: 'josealarconv@gmail.com',
      contacto: 'José Alarcón — Creator',
      logoUrl: 'https://i.postimg.cc/GttJ57k1/FAB34803-3D79-40A2-B2DE-874DF03EAD98.png',
      condicionesCotizacionDefecto: 'Workspace de desarrollo y pruebas del Creator.'
    }
  },
  {
    id: 'WS-ORION',
    nombre: 'Suministros Industriales Orión',
    plan: 'basico',
    maxUsuarios: 10,
    activo: true,
    fechaCreacion: '2026-06-01',
    config: {
      empresa: 'Suministros Industriales Orión',
      rut: '76.543.210-9',
      direccion: 'Av. Industrial 1420, Pudahuel, Santiago, Chile',
      telefono: '+56 2 2987 6543',
      email: 'contacto@suministrosorion.cl',
      contacto: 'Juan Arredondo - Gerente de Operaciones',
      logoUrl: 'https://i.postimg.cc/jq6ZKKFw/logo-suministros-industriales-orion.png',
      condicionesCotizacionDefecto: 'Precios cotizados en la moneda indicada. Crédito 15 días tras recepción de factura. Validez de cotización: 5 días hábiles.'
    }
  }
];

// Legacy compat: INITIAL_CONFIGURACION maps to WS-ORION config
export const INITIAL_CONFIGURACION = INITIAL_WORKSPACES[1].config;

// ============================================================
// PERFILES (workspace-scoped, except PRF-SUPERADMIN)
// ============================================================
export const INITIAL_PERFILES = [
  // Global Creator profile (no workspaceId)
  {
    id: 'PRF-SUPERADMIN',
    nombre: 'SuperAdmin Creator',
    descripcion: 'Acceso total absoluto inmutable, creador y gestor master del sistema y todos los workspaces.',
    esProtegido: true,
    workspaceId: null,
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      clientes: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      cotizaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      anexos: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      usuarios: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      perfiles: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      configuracion: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      workspaces: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' }
    }
  },

  // --- WS-CREATOR workspace profiles ---
  {
    id: 'PRF-ADMIN-CREATOR',
    nombre: 'Administrador',
    descripcion: 'Acceso total a la gestión del workspace, usuarios, perfiles y configuración.',
    esProtegido: true,
    workspaceId: 'WS-CREATOR',
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      clientes: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      cotizaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      anexos: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      usuarios: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      perfiles: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      configuracion: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' }
    }
  },

  // --- WS-ORION workspace profiles ---
  {
    id: 'PRF-ADMIN-ORION',
    nombre: 'Administrador',
    descripcion: 'Acceso total a la gestión del workspace, usuarios, perfiles y configuración.',
    esProtegido: true,
    workspaceId: 'WS-ORION',
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      clientes: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      cotizaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      anexos: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      usuarios: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      perfiles: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      configuracion: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' }
    }
  },
  {
    id: 'PRF-SUPERVISOR-ORION',
    nombre: 'Supervisor',
    descripcion: 'Supervisión completa sin acceso a configuración, usuarios ni perfiles.',
    esProtegido: false,
    workspaceId: 'WS-ORION',
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      clientes: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      cotizaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      anexos: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      usuarios: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      perfiles: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      configuracion: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' }
    }
  },
  {
    id: 'PRF-ANALISTA-ORION',
    nombre: 'Analista',
    descripcion: 'Registro y consulta de datos propios. No puede eliminar registros.',
    esProtegido: false,
    workspaceId: 'WS-ORION',
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'propios' },
      clientes: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'propios' },
      cotizaciones: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'propios' },
      anexos: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'propios' },
      usuarios: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      perfiles: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      configuracion: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' }
    }
  }
];

// ============================================================
// USUARIOS (workspace-scoped; Creator has no fixed workspaceId)
// ============================================================
export const INITIAL_USUARIOS = [
  {
    email: 'josealarconv@gmail.com',
    nombre: 'José Alarcón',
    perfilId: 'PRF-SUPERADMIN',
    workspaceId: null,
    activo: true,
    fechaRegistro: '2026-06-01'
  },
  {
    email: 'gerencia@suministrosorion.cl',
    nombre: 'Juan Arredondo',
    perfilId: 'PRF-ADMIN-ORION',
    workspaceId: 'WS-ORION',
    activo: true,
    fechaRegistro: '2026-06-01'
  },
  {
    email: 'compras@suministrosorion.cl',
    nombre: 'Analista de Adquisiciones',
    perfilId: 'PRF-ANALISTA-ORION',
    workspaceId: 'WS-ORION',
    activo: true,
    fechaRegistro: '2026-06-05'
  }
];

// ============================================================
// CLIENTES (workspace-scoped)
// ============================================================
export const INITIAL_CLIENTES = [
  {
    id: 'CLI-CODELCO',
    workspaceId: 'WS-ORION',
    rut: '61.704.000-K',
    nombre: 'Codelco Chile - División El Teniente',
    direccion: 'Av. Millán 1020, Rancagua, VI Región',
    direccionDespacho: 'Bodega Central Mina El Teniente, Sewell',
    email: 'licitaciones.alteniente@codelco.cl',
    telefono: '+56 72 229 2000',
    contacto: 'Ignacio Fuentealba - Jefatura de Adquisiciones',
    notas: 'Cliente principal. Licitaciones de alta frecuencia. Exige cumplimiento estricto de fechas de cotización.',
    logo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&auto=format&fit=crop'
  },
  {
    id: 'CLI-PELAMBRES',
    workspaceId: 'WS-ORION',
    rut: '96.852.140-5',
    nombre: 'Minera Los Pelambres S.A.',
    direccion: 'Av. Apoquindo 4001, Piso 12, Las Condes',
    direccionDespacho: 'Faena Los Pelambres, Salamanca, IV Región',
    email: 'adquisiciones@pelambres.cl',
    telefono: '+56 53 267 8900',
    contacto: 'Carlos Mendoza',
    notas: 'Crédito 30 días autorizado.',
    logo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&auto=format&fit=crop'
  },
  {
    id: 'CLI-SKY',
    workspaceId: 'WS-ORION',
    rut: '76.123.456-7',
    nombre: 'Sky Airline S.A.',
    direccion: 'Av. del Valle 725, Ciudad Empresarial, Huechuraba',
    direccionDespacho: 'Base Mantenimiento Hangar 2, Aeropuerto Pudahuel',
    email: 'compras.mantenimiento@skyairline.com',
    telefono: '+56 2 2456 7800',
    contacto: 'Andrea Morales',
    notas: 'Insumos aeronáuticos e instrumental técnico.',
    logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop'
  },
  // Demo data for Creator workspace
  {
    id: 'CLI-DEMO-001',
    workspaceId: 'WS-CREATOR',
    rut: '11.111.111-1',
    nombre: 'Cliente Demo Alpha',
    direccion: 'Dirección de prueba 123',
    direccionDespacho: 'Bodega Demo',
    email: 'demo@test.cl',
    telefono: '+56 9 0000 0000',
    contacto: 'Contacto Demo',
    notas: 'Cliente de pruebas del Creator.'
  }
];

// ============================================================
// PROVEEDORES (workspace-scoped)
// ============================================================
export const INITIAL_PROVEEDORES = [
  {
    id: 'PRV-ELECTRICA',
    workspaceId: 'WS-ORION',
    rut: '77.516.671-2',
    nombre: 'Electrónica e Industria 2000 SpA',
    contacto: 'Felipe Silva (+56 9 9123 4567)',
    email: 'ventas@electrica2000.cl',
    sitioWeb: 'www.electrica2000.cl',
    condicionesComerciales: 'Pago contado / Transferencia. Descuento 5% por volumen.',
    notas: 'Proveedor de instrumentos Fluke, Bahco y sensores industriales.'
  },
  {
    id: 'PRV-USACOMP',
    workspaceId: 'WS-ORION',
    rut: '76.677.322-2',
    nombre: 'USA Computers & Industrial Tools',
    contacto: 'Marcela Reyes (+56 9 8234 5678)',
    email: 'contacto@usacomputers.cl',
    sitioWeb: 'www.usacomputers.cl',
    condicionesComerciales: 'Crédito 15 días tras aprobación.',
    notas: 'Equipos de cómputo rudo y medición electrónica.'
  },
  {
    id: 'PRV-OFIMANÍA',
    workspaceId: 'WS-ORION',
    rut: '78.112.443-8',
    nombre: 'Ofimanía Industrial SpA',
    contacto: 'Lorena Díaz (+56 9 7654 3210)',
    email: 'cotizaciones@ofimania.cl',
    sitioWeb: 'www.ofimania.cl',
    condicionesComerciales: 'Facturación mensual.',
    notas: 'Insumos generales e imprenta.'
  },
  {
    id: 'PRV-DEMO-001',
    workspaceId: 'WS-CREATOR',
    rut: '22.222.222-2',
    nombre: 'Proveedor Demo Beta',
    contacto: 'Demo (+56 9 0000 0000)',
    email: 'demo@proveedor.cl',
    condicionesComerciales: 'Pruebas.',
    notas: 'Proveedor de pruebas del Creator.'
  }
];

// ============================================================
// LICITACIONES (workspace-scoped, 3-Month Seed)
// ============================================================
export const INITIAL_LICITACIONES = [
  // --- AGOSTO 2026 ---
  { id: 'LIC-2026-CDK-0801', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-CDK-0801', fecha: '2026-08-02', fechaCotizacion: '2026-08-10', clienteId: 'CLI-CODELCO', moneda: 'CLP', estatus: 'Consultando proveedores', notas: 'Instrumentación de calibración de campo para Planta Chancado Secundario en Sewell.', notasCotizacion: 'Precios cotizados en CLP. Entrega en Bodega Central El Teniente.', contador: 2, createdBy: 'josealarconv@gmail.com' },
  { id: 'LIC-2026-PEL-0805', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-PEL-0805', fecha: '2026-08-05', fechaCotizacion: '2026-08-12', clienteId: 'CLI-PELAMBRES', moneda: 'CLP', estatus: 'Abierto', notas: 'Kits de sellos y repuestos para bombas centrífugas de alta presión.', notasCotizacion: 'Crédito 30 días. Despacho Faena Salamanca.', contador: 1, createdBy: 'gerencia@suministrosorion.cl' },
  { id: 'LIC-2026-SKY-0808', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-SKY-0808', fecha: '2026-08-08', fechaCotizacion: '2026-08-15', clienteId: 'CLI-SKY', moneda: 'USD', estatus: 'Cotizado al cliente', notas: 'Insumos de prueba electromecánica para Hangar 2 Aeropuerto Pudahuel.', notasCotizacion: 'Validez de oferta 15 días en USD.', contador: 1, createdBy: 'compras@suministrosorion.cl' },
  { id: 'LIC-2026-CDK-0812', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-CDK-0812', fecha: '2026-08-12', fechaCotizacion: '2026-08-18', clienteId: 'CLI-CODELCO', moneda: 'CLP', estatus: 'Abierto', notas: 'Sensores de temperatura PT100 y transmisores inteligentes de 4-20mA.', notasCotizacion: 'Incluye certificado de calibración ISO 17025.', contador: 1, createdBy: 'gerencia@suministrosorion.cl' },
  { id: 'LIC-2026-PEL-0815', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-PEL-0815', fecha: '2026-08-15', fechaCotizacion: '2026-08-22', clienteId: 'CLI-PELAMBRES', moneda: 'CLP', estatus: 'Aprobado', notas: 'Juegos de herramientas aisladas 1000V con certificación VDE.', notasCotizacion: 'Entrega prioritaria 48 horas.', contador: 1, createdBy: 'josealarconv@gmail.com' },
  { id: 'LIC-2026-SKY-0820', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-SKY-0820', fecha: '2026-08-20', fechaCotizacion: '2026-08-27', clienteId: 'CLI-SKY', moneda: 'USD', estatus: 'Consultando proveedores', notas: 'Multímetros digitales resistentes a impactos para mantención en línea.', notasCotizacion: 'Precios en USD CIF Santiago.', contador: 1, createdBy: 'compras@suministrosorion.cl' },
  // --- JULIO 2026 ---
  { id: 'LIC-2026-CDK-0703', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-CDK-0703', fecha: '2026-07-03', fechaCotizacion: '2026-07-10', clienteId: 'CLI-CODELCO', moneda: 'CLP', estatus: 'Cobrado', notas: 'Válvulas de mariposa tipo wafer 6 pulgadas cuerpo de acero inoxidable.', notasCotizacion: 'Entregado y facturado satisfactoriamente.', contador: 1, createdBy: 'gerencia@suministrosorion.cl' },
  { id: 'LIC-2026-PEL-0709', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-PEL-0709', fecha: '2026-07-09', fechaCotizacion: '2026-07-16', clienteId: 'CLI-PELAMBRES', moneda: 'CLP', estatus: 'Aprobado', notas: 'Manómetros llenos de glicerina dial 4 pulgadas 0-100 BAR conexión 1/2 NPT.', notasCotizacion: 'Despachado a faena Los Pelambres.', contador: 1, createdBy: 'compras@suministrosorion.cl' },
  { id: 'LIC-2026-SKY-0715', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-SKY-0715', fecha: '2026-07-15', fechaCotizacion: '2026-07-22', clienteId: 'CLI-SKY', moneda: 'USD', estatus: 'Cotizado al cliente', notas: 'Analizadores de baterías aeronáuticas de alta capacidad.', notasCotizacion: 'Oferta enviada a departamento de compras.', contador: 1, createdBy: 'josealarconv@gmail.com' },
  { id: 'LIC-2026-CDK-0720', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-CDK-0720', fecha: '2026-07-20', fechaCotizacion: '2026-07-27', clienteId: 'CLI-CODELCO', moneda: 'CLP', estatus: 'Despacho enviado', notas: 'Actuadores neumáticos doble efecto y cajas finales de carrera.', notasCotizacion: 'Despachado con guía de remisión.', contador: 1, createdBy: 'gerencia@suministrosorion.cl' },
  { id: 'LIC-2026-PEL-0725', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-PEL-0725', fecha: '2026-07-25', fechaCotizacion: '2026-07-30', clienteId: 'CLI-PELAMBRES', moneda: 'CLP', estatus: 'Cerrado', notas: 'Conjunto puestas a tierra portátiles media tensión.', notasCotizacion: 'Concluida sin observaciones.', contador: 1, createdBy: 'compras@suministrosorion.cl' },
  { id: 'LIC-2026-SKY-0728', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-SKY-0728', fecha: '2026-07-28', fechaCotizacion: '2026-08-03', clienteId: 'CLI-SKY', moneda: 'USD', estatus: 'Cotizado al cliente', notas: 'Kits de conectores herméticos de aviación.', notasCotizacion: 'Precios cotizados en USD.', contador: 1, createdBy: 'josealarconv@gmail.com' },
  // --- JUNIO 2026 ---
  { id: 'LIC-2026-CDK-0604', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-CDK-0604', fecha: '2026-06-04', fechaCotizacion: '2026-06-11', clienteId: 'CLI-CODELCO', moneda: 'CLP', estatus: 'Pagado', notas: 'Variadores de frecuencia industrial Schneider 75kW 380V.', notasCotizacion: 'Pago recibido por transferencia bancaria.', contador: 1, createdBy: 'gerencia@suministrosorion.cl' },
  { id: 'LIC-2026-PEL-0610', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-PEL-0610', fecha: '2026-06-10', fechaCotizacion: '2026-06-17', clienteId: 'CLI-PELAMBRES', moneda: 'CLP', estatus: 'Cobrado', notas: 'Proyectores LED antiexplosivos 200W para zona minera clasificada.', notasCotizacion: 'Factura pagada en plazo de 30 días.', contador: 1, createdBy: 'josealarconv@gmail.com' },
  { id: 'LIC-2026-SKY-0618', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-SKY-0618', fecha: '2026-06-18', fechaCotizacion: '2026-06-25', clienteId: 'CLI-SKY', moneda: 'USD', estatus: 'Aprobado', notas: 'Equipos computacionales de uso rudo Toughbook para diagnóstico de rampa.', notasCotizacion: 'Equipos entregados en base mantenimiento.', contador: 1, createdBy: 'compras@suministrosorion.cl' },
  { id: 'LIC-2026-CDK-0622', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-CDK-0622', fecha: '2026-06-22', fechaCotizacion: '2026-06-29', clienteId: 'CLI-CODELCO', moneda: 'CLP', estatus: 'Cerrado', notas: 'Empaquetaduras espirometélicas Flexitallic ASME 150#.', notasCotizacion: 'Proceso cerrado.', contador: 1, createdBy: 'gerencia@suministrosorion.cl' },
  { id: 'LIC-2026-PEL-0627', workspaceId: 'WS-ORION', numeroLicitacion: 'LIC-2026-PEL-0627', fecha: '2026-06-27', fechaCotizacion: '2026-07-04', clienteId: 'CLI-PELAMBRES', moneda: 'CLP', estatus: 'Pagado', notas: 'Acoplamientos flexibles y cadenas de transmisión doble 80-2.', notasCotizacion: 'Operación finalizada.', contador: 1, createdBy: 'josealarconv@gmail.com' },
  // --- Creator Demo ---
  { id: 'LIC-DEMO-001', workspaceId: 'WS-CREATOR', numeroLicitacion: 'LIC-DEMO-001', fecha: '2026-08-09', fechaCotizacion: '2026-08-20', clienteId: 'CLI-DEMO-001', moneda: 'CLP', estatus: 'Abierto', notas: 'Licitación de prueba del workspace Creator.', notasCotizacion: 'Demo.', contador: 1, createdBy: 'josealarconv@gmail.com' }
];

// ============================================================
// DETALLES (workspace-scoped via licitacion relationship)
// ============================================================
export const INITIAL_DETALLES = [
  { id: 'DET-001', workspaceId: 'WS-ORION', licitacionId: 'LIC-2026-CDK-0801', descripcion: 'Multímetro Digital Industrial Fluke 87V TRMS', cantidadRequerida: 10, cantidadACotizar: 10, notas: 'Debe incluir certificado de calibración con trazabilidad ISO 17025.' },
  { id: 'DET-002', workspaceId: 'WS-ORION', licitacionId: 'LIC-2026-CDK-0801', descripcion: 'Calibrador de Procesos Multifunción Fluke 754', cantidadRequerida: 2, cantidadACotizar: 2, notas: 'Protocolo Hart activado.' }
];

// ============================================================
// CONSULTAS (workspace-scoped)
// ============================================================
export const INITIAL_CONSULTAS = [
  { id: 'CNS-001', workspaceId: 'WS-ORION', detalleId: 'DET-001', proveedorId: 'PRV-ELECTRICA', cantidadADespachar: 3, precioBase: 380000, costoFlete: 15000, costoInternacion: 0, costoAfex: 5000, costoUnitarioCompuesto: 400000, subtotalCosto: 1200000, fecha: '2026-08-03', estado: 'Aceptada' },
  { id: 'CNS-002', workspaceId: 'WS-ORION', detalleId: 'DET-001', proveedorId: 'PRV-USACOMP', cantidadADespachar: 7, precioBase: 390000, costoFlete: 10000, costoInternacion: 0, costoAfex: 5000, costoUnitarioCompuesto: 405000, subtotalCosto: 2835000, fecha: '2026-08-03', estado: 'Aceptada' }
];

// ============================================================
// NOTAS DE LICITACION (workspace-scoped)
// ============================================================
export const INITIAL_NOTAS_LICITACION = [
  { id: 'NTA-001', workspaceId: 'WS-ORION', licitacionId: 'LIC-2026-CDK-0801', fechaHora: '2026-08-02 10:30', usuario: 'Juan Arredondo', texto: 'Se revisó el portal de Codelco. Requerimiento prioritario.' },
  { id: 'NTA-002', workspaceId: 'WS-ORION', licitacionId: 'LIC-2026-CDK-0801', fechaHora: '2026-08-03 15:45', usuario: 'José Alarcón', texto: 'Electrónica 2000 ofreció 3 unidades y USA Computers las 7 restantes para completar las 10 unidades requeridas.' }
];

// ============================================================
// INVESTIGACIONES IA (workspace-scoped)
// ============================================================
export const INITIAL_INVESTIGACIONES_IA = [
  { id: 'INV-001', workspaceId: 'WS-ORION', detalleId: 'DET-001', fechaHora: '2026-08-02 11:00', usuario: 'Juan Arredondo', resultadoJSON: { resumenTecnico: 'El Fluke 87V es un multímetro digital industrial TRMS diseñado para sistemas de alta resolución y precisión en entornos mineros exigentes.', especificacionesTecnicas: ['Tensión AC/DC hasta 1000V', 'Filtro pasa bajo para variadores de velocidad', 'Categoría de seguridad CAT IV 600V / CAT III 1000V'], proveedoresLocalesChilenos: ['Electrónica e Industria 2000 SpA', 'Intronica Chile S.A.', 'Electro Global SpA'], proveedoresInternacionales: ['Grainger USA', 'Mouser Electronics', 'DigiKey'], precioRangoMercado: 'CLP $380.000 - $430.000 + IVA' } }
];

// ============================================================
// COTIZACIONES (workspace-scoped)
// ============================================================
export const INITIAL_COTIZACIONES = [
  { id: 'COT-2026-0808-V1', workspaceId: 'WS-ORION', licitacionId: 'LIC-2026-SKY-0808', clienteId: 'CLI-SKY', numeroCotizacion: 'COT-2026-001', version: 1, fecha: '2026-08-08', fechaHora: '2026-08-08 16:00', usuario: 'Juan Arredondo', moneda: 'CLP', subtotalNeto: 2150000, iva: 408500, total: 2558500, pdfUrl: '#', notasCotizacion: 'Precios cotizados en CLP. Despacho incluido Hangar 2 Pudahuel.' }
];

// ============================================================
// ANEXOS (workspace-scoped)
// ============================================================
export const INITIAL_ANEXOS = [
  { id: 'ANX-001', workspaceId: 'WS-ORION', licitacionId: 'LIC-2026-CDK-0801', nombre: 'Bases_Tecnicas_Codelco_ElTeniente.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', tipo: 'application/pdf', fecha: '2026-08-02' }
];

// ============================================================
// PLAN DEFINITIONS (for workspace creation)
// ============================================================
export const WORKSPACE_PLANS = {
  creator: { nombre: 'Creator', maxUsuarios: 999, descripcion: 'Workspace del Creator del sistema' },
  basico: { nombre: 'Básico', maxUsuarios: 10, descripcion: 'Incluye hasta 10 usuarios' },
  profesional: { nombre: 'Profesional', maxUsuarios: 25, descripcion: 'Incluye hasta 25 usuarios' },
  enterprise: { nombre: 'Enterprise', maxUsuarios: 100, descripcion: 'Incluye hasta 100 usuarios' }
};

// Default profiles template for new workspaces
export const DEFAULT_WORKSPACE_PROFILES = (wsId) => [
  {
    id: `PRF-ADMIN-${wsId}`,
    nombre: 'Administrador',
    descripcion: 'Acceso total a la gestión del workspace, usuarios, perfiles y configuración.',
    esProtegido: true,
    workspaceId: wsId,
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      clientes: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      cotizaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      anexos: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      usuarios: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      perfiles: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      configuracion: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' }
    }
  },
  {
    id: `PRF-SUPERVISOR-${wsId}`,
    nombre: 'Supervisor',
    descripcion: 'Supervisión completa sin acceso a configuración, usuarios ni perfiles.',
    esProtegido: false,
    workspaceId: wsId,
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      clientes: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      cotizaciones: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      anexos: { ver: true, agregar: true, editar: true, eliminar: true, alcance: 'todos' },
      usuarios: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      perfiles: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      configuracion: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' }
    }
  },
  {
    id: `PRF-ANALISTA-${wsId}`,
    nombre: 'Analista',
    descripcion: 'Registro y consulta de datos propios. No puede eliminar registros.',
    esProtegido: false,
    workspaceId: wsId,
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'propios' },
      clientes: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'propios' },
      cotizaciones: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'propios' },
      anexos: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'propios' },
      usuarios: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      perfiles: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      configuracion: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' }
    }
  }
];
