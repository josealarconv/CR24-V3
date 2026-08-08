import { jsPDF } from 'jspdf';
import { ASSETS } from '../config/assets';

export function generateCotizacionPDF(cotizacion, licitacion, cliente, detalles = [], consultas = []) {
  const doc = new jsPDF();

  // Header Colors & Styling
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 38, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(ASSETS.COMPANY_NAME, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUT: ${ASSETS.COMPANY_RUT} | Tel: ${ASSETS.COMPANY_PHONE}`, 14, 26);
  doc.text(`Email: ${ASSETS.COMPANY_EMAIL} | ${ASSETS.COMPANY_ADDRESS}`, 14, 32);

  // Cotizacion Metadata Box
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(130, 10, 66, 24, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(130, 10, 66, 24, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`COTIZACIÓN`, 134, 17);
  doc.text(`${cotizacion.id || 'COT-2025'}`, 134, 23);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${cotizacion.fecha || new Date().toISOString().split('T')[0]}`, 134, 30);

  // Client Info Section
  let y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DATOS DEL CLIENTE', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Cliente: ${cliente?.nombre || 'N/A'}`, 14, y);
  doc.text(`RUT: ${cliente?.rut || 'N/A'}`, 120, y);
  y += 5;
  doc.text(`Contacto: ${cliente?.contacto || 'N/A'}`, 14, y);
  doc.text(`Teléfono: ${cliente?.telefono || 'N/A'}`, 120, y);
  y += 5;
  doc.text(`Despacho: ${cliente?.direccionDespacho || cliente?.direccion || 'N/A'}`, 14, y);
  y += 5;
  doc.text(`Licitación Ref: ${licitacion?.numeroLicitacion || licitacion?.id || 'N/A'}`, 14, y);

  // Items Table Header
  y += 10;
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM / DESCRIPCIÓN', 18, y + 5.5);
  doc.text('CANT.', 125, y + 5.5);
  doc.text('P. UNIT', 145, y + 5.5);
  doc.text('TOTAL (CLP)', 175, y + 5.5);

  y += 8;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');

  let subtotalSum = 0;

  if (detalles.length === 0) {
    y += 6;
    doc.text('No hay ítems registrados en esta cotización.', 18, y);
    y += 4;
  } else {
    detalles.forEach((det, idx) => {
      y += 6;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      const consulta = consultas.find(c => c.detalleId === det.id);
      const precioUnit = consulta ? consulta.precioUnitario : 10000;
      const subtotalItem = (det.cantidad || 1) * precioUnit;
      subtotalSum += subtotalItem;

      const desc = det.descripcion.length > 55 ? det.descripcion.substring(0, 52) + '...' : det.descripcion;
      doc.text(`${idx + 1}. ${desc}`, 18, y);
      doc.text(`${det.cantidad || 1}`, 127, y);
      doc.text(`$${precioUnit.toLocaleString('es-CL')}`, 145, y);
      doc.text(`$${subtotalItem.toLocaleString('es-CL')}`, 175, y);
    });
  }

  // Totals Summary
  y += 10;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  const iva = Math.round(subtotalSum * 0.19);
  const total = subtotalSum + iva;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Neto Subtotal:', 135, y);
  doc.text(`$${subtotalSum.toLocaleString('es-CL')}`, 175, y);
  y += 5;
  doc.text('IVA (19%):', 135, y);
  doc.text(`$${iva.toLocaleString('es-CL')}`, 175, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL FINAL:', 135, y);
  doc.text(`$${total.toLocaleString('es-CL')}`, 175, y);

  // Notes Section (Bloque VII - punto 71)
  y += 14;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 24, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONDICIONES COMERCIALES Y NOTAS:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const notaText = licitacion?.notasCotizacion || cotizacion?.notas || ASSETS.condicionesCotizacionDefecto;
  const splitNotes = doc.splitTextToSize(notaText, 174);
  doc.text(splitNotes, 18, y + 12);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generado automáticamente por ${ASSETS.APP_NAME} ${ASSETS.APP_VERSION} - Suministros Industriales Orión`, 14, 287);

  return doc;
}

export function generateWhatsAppShareLink(cotizacion, cliente) {
  const text = encodeURIComponent(
    `Hola ${cliente?.contacto || 'estimado(a)'}, adjunto la cotización ${cotizacion.id} de Suministros Industriales Orión por un total de $${(cotizacion.total || 0).toLocaleString('es-CL')}. ¡Quedamos atentos a sus comentarios!`
  );
  return `https://wa.me/?text=${text}`;
}

export function generateSMSShareLink(cotizacion, cliente) {
  const text = encodeURIComponent(
    `Cotización ${cotizacion.id} Suministros Orión Total: $${(cotizacion.total || 0).toLocaleString('es-CL')}`
  );
  return `sms:?body=${text}`;
}

export function generateEmailShareLink(cotizacion, cliente) {
  const subject = encodeURIComponent(`Cotización ${cotizacion.id} - Suministros Industriales Orión`);
  const body = encodeURIComponent(
    `Estimado/a ${cliente?.contacto || 'Cliente'},\n\nLe enviamos la cotización ${cotizacion.id} correspondiente a su requerimiento.\n\nTotal: $${(cotizacion.total || 0).toLocaleString('es-CL')}\n\nAtentamente,\nSuministros Industriales Orión`
  );
  return `mailto:${cliente?.email || ''}?subject=${subject}&body=${body}`;
}
