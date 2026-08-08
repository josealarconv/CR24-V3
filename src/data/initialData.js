// CR24 V3 - Real Initial Seed Data for Suministros Industriales Orión (Chile)

export const INITIAL_CONFIGURACION = {
  id: 'CFG-001',
  empresa: 'Suministros Industriales Orión',
  rut: '76.543.210-9',
  direccion: 'Av. Industrial 1420, Pudahuel, Santiago, Chile',
  telefono: '+56 2 2987 6543',
  email: 'contacto@suministrosorion.cl',
  contacto: 'Juan Arredondo - Gerente de Operaciones',
  logoUrl: 'https://i.postimg.cc/jq6ZKKFw/logo-suministros-industriales-orion.png',
  appLogoUrl: 'https://i.postimg.cc/GttJ57k1/FAB34803-3D79-40A2-B2DE-874DF03EAD98.png',
  condicionesCotizacionDefecto: 'Precios cotizados en la moneda indicada. Crédito 15 días tras recepción de factura. Validez de cotización: 5 días hábiles.',
};

export const INITIAL_PERFILES = [
  {
    id: 'PRF-SUPERADMIN',
    nombre: 'SuperAdmin Master',
    descripcion: 'Acceso total absoluto inmutable, creador y gestor master del sistema.',
    esProtegido: true,
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
    id: 'PRF-ADMIN',
    nombre: 'Administrador',
    descripcion: 'Acceso total a la gestión del sistema, usuarios, perfiles, márgenes y finanzas.',
    esProtegido: true,
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
    id: 'PRF-SUPERVISOR',
    nombre: 'Supervisor de Operaciones',
    descripcion: 'Supervisión de cotizaciones, consulta de proveedores y aprobación de márgenes.',
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'todos' },
      clientes: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'todos' },
      proveedores: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'todos' },
      consultas: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'todos' },
      cotizaciones: { ver: true, agregar: true, editar: false, eliminar: false, alcance: 'todos' },
      anexos: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'todos' },
      usuarios: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      perfiles: { ver: false, agregar: false, editar: false, eliminar: false, alcance: 'propios' },
      configuracion: { ver: true, agregar: false, editar: false, eliminar: false, alcance: 'todos' }
    }
  },
  {
    id: 'PRF-ANALISTA',
    nombre: 'Analista Cotizador',
    descripcion: 'Búsqueda de proveedores, registro de consultas e investigación por ítem.',
    permisos: {
      licitaciones: { ver: true, agregar: true, editar: true, eliminar: false, alcance: 'todos' },
      clientes: { ver: true, agregar: false, editar: false, eliminar: false, alcance: 'todos' },
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

export const INITIAL_USUARIOS = [
  {
    email: 'josealarconv@gmail.com',
    nombre: 'José Alarcón',
    perfilId: 'PRF-SUPERADMIN',
    activo: true,
    fechaRegistro: '2025-01-01'
  },
  {
    email: 'gerencia@suministrosorion.cl',
    nombre: 'Juan Arredondo',
    perfilId: 'PRF-ADMIN',
    activo: true,
    fechaRegistro: '2025-01-01'
  },
  {
    email: 'compras@suministrosorion.cl',
    nombre: 'Analista de Adquisiciones',
    perfilId: 'PRF-ANALISTA',
    activo: true,
    fechaRegistro: '2025-01-05'
  }
];

export const INITIAL_CLIENTES = [
  {
    id: 'CLI-CODELCO',
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
    rut: '76.123.456-7',
    nombre: 'Sky Airline S.A.',
    direccion: 'Av. del Valle 725, Ciudad Empresarial, Huechuraba',
    direccionDespacho: 'Base Mantenimiento Hangar 2, Aeropuerto Pudahuel',
    email: 'compras.mantenimiento@skyairline.com',
    telefono: '+56 2 2456 7800',
    contacto: 'Andrea Morales',
    notas: 'Insumos aeronáuticos e instrumental técnico.',
    logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop'
  }
];

export const INITIAL_PROVEEDORES = [
  {
    id: 'PRV-ELECTRICA',
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
    rut: '78.112.443-8',
    nombre: 'Ofimanía Industrial SpA',
    contacto: 'Lorena Díaz (+56 9 7654 3210)',
    email: 'cotizaciones@ofimania.cl',
    sitioWeb: 'www.ofimania.cl',
    condicionesComerciales: 'Facturación mensual.',
    notas: 'Insumos generales e imprenta.'
  }
];

export const INITIAL_LICITACIONES = [
  {
    id: 'LIC-CODELCO-990',
    numeroLicitacion: 'LIC-2025-CDK-0990',
    fecha: '2025-01-08',
    fechaCotizacion: '2025-01-14',
    clienteId: 'CLI-CODELCO',
    moneda: 'CLP',
    estatus: 'Consultando proveedores',
    notas: 'Licitación urgente para suministro de instrumentos de calibración en Sewell.',
    notasCotizacion: 'Precios cotizados en CLP. Despacho incluido en Bodega Central Mina El Teniente.',
    contador: 2,
    createdBy: 'gerencia@suministrosorion.cl'
  },
  {
    id: 'LIC-SKY-943',
    numeroLicitacion: 'ID-943 (Sky Airline)',
    fecha: '2025-01-06',
    fechaCotizacion: '2025-01-10',
    clienteId: 'CLI-SKY',
    moneda: 'USD',
    estatus: 'Cotizado al cliente',
    notas: 'Repuestos de prueba para Hangar 2 Pudahuel.',
    notasCotizacion: 'Validez de oferta 7 días en USD.',
    contador: 1,
    createdBy: 'compras@suministrosorion.cl'
  }
];

export const INITIAL_DETALLES = [
  {
    id: 'DET-001',
    licitacionId: 'LIC-CODELCO-990',
    descripcion: 'Multímetro Digital Industrial Fluke 87V TRMS',
    cantidadRequerida: 10,
    cantidadACotizar: 10,
    notas: 'Debe incluir certificado de calibración con trazabilidad ISO 17025.'
  },
  {
    id: 'DET-002',
    licitacionId: 'LIC-CODELCO-990',
    descripcion: 'Calibrador de Procesos Multifunción Fluke 754',
    cantidadRequerida: 2,
    cantidadACotizar: 2,
    notas: 'Protocolo Hart activado.'
  }
];

export const INITIAL_CONSULTAS = [
  {
    id: 'CNS-001',
    detalleId: 'DET-001',
    proveedorId: 'PRV-ELECTRICA',
    cantidadADespachar: 3,
    precioBase: 380000,
    costoFlete: 15000,
    costoInternacion: 0,
    costoAfex: 5000,
    costoUnitarioCompuesto: 400000,
    subtotalCosto: 1200000,
    fecha: '2025-01-09',
    estado: 'Aceptada'
  },
  {
    id: 'CNS-002',
    detalleId: 'DET-001',
    proveedorId: 'PRV-USACOMP',
    cantidadADespachar: 7,
    precioBase: 390000,
    costoFlete: 10000,
    costoInternacion: 0,
    costoAfex: 5000,
    costoUnitarioCompuesto: 405000,
    subtotalCosto: 2835000,
    fecha: '2025-01-09',
    estado: 'Aceptada'
  }
];

export const INITIAL_NOTAS_LICITACION = [
  {
    id: 'NTA-001',
    licitacionId: 'LIC-CODELCO-990',
    fechaHora: '2025-01-08 10:30',
    usuario: 'Juan Arredondo',
    texto: 'Se revisó el portal de Codelco. Requerimiento prioritario.'
  },
  {
    id: 'NTA-002',
    licitacionId: 'LIC-CODELCO-990',
    fechaHora: '2025-01-09 15:45',
    usuario: 'José Alarcón',
    texto: 'Electrónica 2000 ofreció 3 unidades y USA Computers las 7 restantes para completar las 10 unidades requeridas.'
  }
];

export const INITIAL_INVESTIGACIONES_IA = [
  {
    id: 'INV-001',
    detalleId: 'DET-001',
    fechaHora: '2025-01-08 11:00',
    usuario: 'Juan Arredondo',
    resultadoJSON: {
      resumenProducto: 'El Fluke 87V es un multímetro digital industrial TRMS diseñado para sistemas de alta resolución y precisión en entornos mineros exigentes.',
      especificacionesTecnicas: ['Tensión AC/DC hasta 1000V', 'Filtro pasa bajo para variadores de velocidad', 'Categoría de seguridad CAT IV 600V / CAT III 1000V'],
      proveedoresLocalesChilenos: ['Electrónica e Industria 2000 SpA', 'Intronica Chile S.A.', 'Electro Global SpA'],
      proveedoresInternacionales: ['Grainger USA', 'Mouser Electronics', 'DigiKey'],
      precioRangoMercado: 'CLP $380.000 - $430.000 + IVA'
    }
  }
];

export const INITIAL_COTIZACIONES = [
  {
    id: 'COT-CDK-0990-V1',
    licitacionId: 'LIC-CODELCO-990',
    clienteId: 'CLI-CODELCO',
    numeroCotizacion: 'COT-2025-001',
    version: 1,
    fechaHora: '2025-01-10 16:00',
    usuario: 'Juan Arredondo',
    moneda: 'CLP',
    subtotalNeto: 4800000,
    iva: 912000,
    total: 5712000,
    pdfUrl: '#',
    notasCotizacion: 'Precios cotizados en CLP. Despacho incluido en Bodega Central Mina El Teniente.'
  }
];

export const INITIAL_ANEXOS = [
  {
    id: 'ANX-001',
    licitacionId: 'LIC-CODELCO-990',
    nombre: 'Bases_Tecnicas_Codelco_ElTeniente.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tipo: 'application/pdf',
    fecha: '2025-01-08'
  }
];
