// Seed Data for CR24 (Suministros Industriales Orión)

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
  condicionesCotizacionDefecto: 'Precio cotizado en CLP, Crédito 15 días, Validez de cotización: 5 días hábiles.',
};

export const INITIAL_CLIENTES = [
  {
    id: 'eb1b1ad7',
    rut: '96.852.140-5',
    nombre: 'Minera Los Pelambres S.A.',
    direccion: 'Av. Apoquindo 4001, Piso 12, Las Condes',
    direccionDespacho: 'Faena Los Pelambres, Salamanca, IV Región',
    email: 'adquisiciones@pelambres.cl',
    telefono: '+56 53 267 8900',
    contacto: 'Carlos Mendoza',
    notas: 'Cliente VIP - Crédito 30 días autorizado.',
    logo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&auto=format&fit=crop'
  },
  {
    id: 'ab5a163d',
    rut: '76.123.456-7',
    nombre: 'Sky Airline S.A.',
    direccion: 'Av. del Valle 725, Ciudad Empresarial, Huechuraba',
    direccionDespacho: 'Base Mantenimiento Hangar 2, Aeropuerto Pudahuel',
    email: 'compras.mantenimiento@skyairline.com',
    telefono: '+56 2 2456 7800',
    contacto: 'Andrea Morales',
    notas: 'Licitaciones recurrentes de insumos aeronáuticos y herramientas.',
    logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop'
  },
  {
    id: 'ee03349d',
    rut: '88.990.110-2',
    nombre: 'Constructora Valko S.A.',
    direccion: 'Av. Providencia 2653, Of. 802, Providencia',
    direccionDespacho: 'Obra Autopista Vallenar, Atacama',
    email: 'licitaciones@valko.cl',
    telefono: '+56 2 2334 9000',
    contacto: 'Roberto Gómez',
    notas: 'Requiere certificados de calidad en todos los materiales.',
    logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop'
  }
];

export const INITIAL_PROVEEDORES = [
  {
    id: '7aa2ede0',
    rut: '77.516.671-2',
    nombre: 'Electrónica e Industria 2000 SpA',
    contacto: 'Felipe Silva (+56 9 9123 4567)',
    email: 'ventas@electrica2000.cl',
    sitioWeb: 'www.electrica2000.cl',
    condicionesComerciales: 'Pago contado / Transferencia. Descuento 5% por volumen.',
    notas: 'Proveedor confiable de componentes eléctricos e instrumentos.',
    logo: ''
  },
  {
    id: '35823124',
    rut: '76.677.322-2',
    nombre: 'USA Computers & Industrial Tools',
    contacto: 'Marcela Reyes (+56 9 8234 5678)',
    email: 'contacto@usacomputers.cl',
    sitioWeb: 'www.usacomputers.cl',
    condicionesComerciales: 'Crédito 15 días tras aprobación.',
    notas: 'Especialista en licitaciones de equipos de medición y cómputo rudo.',
    logo: ''
  },
  {
    id: '7a1cece1',
    rut: '96.554.332-1',
    nombre: 'Ofimática y Suministros Santiago',
    contacto: 'Gonzalo Pérez (+56 2 2776 5432)',
    email: 'ventas@ofimatica.cl',
    sitioWeb: 'www.ofimatica.cl',
    condicionesComerciales: 'Entrega en 48 hrs en RM.',
    notas: 'Materiales generales de oficina e insumos.',
    logo: ''
  },
  {
    id: 'df2c33b3',
    rut: '78.112.443-8',
    nombre: 'Ofimanía Industrial SpA',
    contacto: 'Lorena Díaz (+56 9 7654 3210)',
    email: 'cotizaciones@ofimania.cl',
    sitioWeb: 'www.ofimania.cl',
    condicionesComerciales: 'Facturación mensual.',
    notas: 'Insumos de papelería técnica e imprenta.',
    logo: ''
  },
  {
    id: '834ad65c',
    rut: '76.000.111-9',
    nombre: 'Mercado Libre / Proveedores Directos Web',
    contacto: 'Soporte Empresas',
    email: 'empresas@mercadolibre.cl',
    sitioWeb: 'www.mercadolibre.cl',
    condicionesComerciales: 'Pago inmediato con tarjeta o transferencia.',
    notas: 'Plataforma para adquisición rápida de repuestos urgentes.',
    logo: ''
  }
];

export const INITIAL_LICITACIONES = [
  {
    id: 'LIC-493D19A8',
    numeroLicitacion: 'ID-912',
    fecha: '2025-01-04',
    fechaCotizacion: '2025-01-06',
    clienteId: 'eb1b1ad7',
    estatus: 'Cotizada',
    notas: 'Esta nota es de uso interno para la licitación Minera Pelambres.',
    notasCotizacion: 'Precio cotizado en CLP, Crédito 15 días, Esta cotización vence en 5 días.',
    contador: 7
  },
  {
    id: 'LIC-E3BBAF8E',
    numeroLicitacion: 'ID-943 (Sky Airline)',
    fecha: '2025-01-06',
    fechaCotizacion: '2025-01-10',
    clienteId: 'ab5a163d',
    estatus: 'En Proceso',
    notas: 'Insumos de mantención aeronáutica Hangar 2.',
    notasCotizacion: 'Despacho directo en bodega del aeropuerto.',
    contador: 2
  },
  {
    id: 'LIC-6E5DE4F5',
    numeroLicitacion: 'ID-983 (Sky Airline)',
    fecha: '2025-01-13',
    fechaCotizacion: '2025-01-15',
    clienteId: 'ab5a163d',
    estatus: 'Abierto',
    notas: 'Requiere revisión urgente de stock de filtros.',
    notasCotizacion: 'Validez 7 días.',
    contador: 1
  },
  {
    id: 'LIC-8B76E3CB',
    numeroLicitacion: '6001014304',
    fecha: '2025-01-13',
    fechaCotizacion: '2025-01-16',
    clienteId: 'ee03349d',
    estatus: 'Abierto',
    notas: 'Materiales varios de ferretería y seguridad vial.',
    notasCotizacion: 'Despacho a faena Vallenar.',
    contador: 4
  },
  {
    id: 'LIC-E0554E43',
    numeroLicitacion: '6001013303',
    fecha: '2025-01-14',
    fechaCotizacion: '2025-01-18',
    clienteId: 'ee03349d',
    estatus: 'Ganada',
    notas: 'Licitación adjudicada. En proceso de orden de compra.',
    notasCotizacion: 'Forma de pago 30 días fecha factura.',
    contador: 3
  }
];

export const INITIAL_DETALLES = [
  {
    id: 'DET-001',
    licitacionId: 'LIC-493D19A8',
    descripcion: 'Tester Multímetro Digital Industrial Fluke 87V TRMS',
    cantidad: 5,
    porcentajeEnvio: 3.5,
    notas: 'Debe incluir certificado de calibración de fábrica.'
  },
  {
    id: 'DET-002',
    licitacionId: 'LIC-493D19A8',
    descripcion: 'Set de Destornilladores Aislados 1000V 12 Piezas Bahco',
    cantidad: 10,
    porcentajeEnvio: 2.0,
    notas: 'Norma IEC 60900'
  },
  {
    id: 'DET-003',
    licitacionId: 'LIC-E3BBAF8E',
    descripcion: 'Limpiador de Contactos Eléctricos WD-40 Specialist 360ml',
    cantidad: 48,
    porcentajeEnvio: 5.0,
    notas: 'Uso aeronáutico certificado.'
  },
  {
    id: 'DET-004',
    licitacionId: 'LIC-8B76E3CB',
    descripcion: 'Casco de Seguridad Dielectrico Clase E Blanco con Portalámpara',
    cantidad: 100,
    porcentajeEnvio: 4.0,
    notas: 'Certificación ANSI Z89.1'
  }
];

export const INITIAL_CONSULTAS = [
  {
    id: 'CNS-001',
    detalleId: 'DET-001',
    proveedorId: '7aa2ede0',
    cantidad: 5,
    precioUnitario: 385000,
    subtotal: 1925000,
    iva: 365750,
    total: 2290750,
    fecha: '2025-01-05',
    estado: 'Recibido'
  },
  {
    id: 'CNS-002',
    detalleId: 'DET-001',
    proveedorId: '35823124',
    cantidad: 5,
    precioUnitario: 395000,
    subtotal: 1975000,
    iva: 375250,
    total: 2350250,
    fecha: '2025-01-05',
    estado: 'Recibido'
  },
  {
    id: 'CNS-003',
    detalleId: 'DET-003',
    proveedorId: '7a1cece1',
    cantidad: 48,
    precioUnitario: 8900,
    subtotal: 427200,
    iva: 81168,
    total: 508368,
    fecha: '2025-01-07',
    estado: 'Pendiente'
  }
];

export const INITIAL_COTIZACIONES = [
  {
    id: 'COT-2025-001',
    licitacionId: 'LIC-493D19A8',
    clienteId: 'eb1b1ad7',
    fecha: '2025-01-06',
    version: 1,
    subtotal: 2150000,
    iva: 408500,
    total: 2558500,
    estado: 'Emitida',
    notas: 'Precio cotizado en CLP, Crédito 15 días, Validez 5 días.'
  }
];

export const INITIAL_ANEXOS = [
  {
    id: 'ANX-001',
    entidad: 'licitacion',
    entidadId: 'LIC-493D19A8',
    nombre: 'Bases_Tecnicas_Pelambres_2025.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tipo: 'application/pdf',
    fecha: '2025-01-04'
  }
];

export const INITIAL_PRODUCTOS_OPCIONALES = [
  {
    id: 'PRD-001',
    sku: 'FLK-87V',
    nombre: 'Multímetro Fluke 87V',
    categoria: 'Instrumentos de Medición',
    proveedorHabitualId: '7aa2ede0'
  },
  {
    id: 'PRD-002',
    sku: 'WD40-SPEC-360',
    nombre: 'Limpiador de Contactos WD-40 Specialist',
    categoria: 'Químicos y Mantención',
    proveedorHabitualId: '7a1cece1'
  }
];
