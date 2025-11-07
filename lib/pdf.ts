import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Receta, Patient } from '@/types/pacientes';

const loadLogoBase64 = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = '/logo.jpg';
  });
};

export const generatePrescriptionPDF = async (receta: Receta, patient: Patient) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  let logoBase64 = '';
  try {
    logoBase64 = await loadLogoBase64();
  } catch (error) {
    console.error('Error al cargar el logo:', error);
  }

  const colors = {
    primary: { r: 37, g: 99, b: 235 },
    border: { r: 200, g: 200, b: 200 },
    lightGray: { r: 245, g: 245, b: 245 },
    text: { r: 0, g: 0, b: 0 },
    textSecondary: { r: 100, g: 100, b: 100 }
  };

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 12, 30, 15);
    } catch (error) {
      console.error('Error al agregar logo al PDF:', error);
    }
  }
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('ÓPTICA OMEGA', margin + 35, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textSecondary.r, colors.textSecondary.g, colors.textSecondary.b);
  doc.text('Especialistas en Salud Visual', margin + 35, 24);
  
  doc.setFontSize(8);
  doc.text('Sonora #2515, Nuevo Laredo, Tamps.', margin + 35, 30);
  doc.text('Tel: (867) 712-2210', margin + 35, 35);

  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.5);
  doc.line(margin, 40, pageWidth - margin, 40);

  let yPos = 50;
  
  // Título de sección
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('DATOS DEL PACIENTE', margin, yPos);
  
  // Línea decorativa simple
  doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos + 1, margin + 50, yPos + 1);
  
  yPos += 8;
  
  // Caja de información del paciente (solo con borde, sin relleno)
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos, contentWidth, 25, 'S');
  
  // Datos del paciente
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  
  const nombreCompleto = `${patient.primer_nombre} ${patient.primer_apellido} ${patient.segundo_apellido || ''}`.trim();
  
  yPos += 6;
  doc.text('Nombre:', margin + 3, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(nombreCompleto, margin + 22, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('F. Nacimiento:', margin + 3, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.fecha_nacimiento ? format(new Date(patient.fecha_nacimiento), 'dd/MM/yyyy') : 'No especificado', margin + 28, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Teléfono:', margin + 85, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.telefono || 'No especificado', margin + 105, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', margin + 3, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.direccion || 'No especificada', margin + 22, yPos, { maxWidth: contentWidth - 25 });

  // ============================================
  // PRESCRIPCIÓN ÓPTICA
  // ============================================
  
  yPos += 13;
  
  // Título de sección
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('PRESCRIPCIÓN ÓPTICA', margin, yPos);
  
  // Línea decorativa simple
  doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos + 1, margin + 55, yPos + 1);
  
  yPos += 8;

  // Tabla profesional
  interface DetalleReceta {
    ojo: string;
    esfera?: number | string;
    cilindro?: number | string;
    eje?: number | string;
    adicion?: number | string;
    distancia_pupilar?: number | string;
    altura?: number | string;
  }
  
  const ojoDerecho = (receta.detalles?.find(d => d.ojo === 'derecho') || {}) as DetalleReceta;
  const ojoIzquierdo = (receta.detalles?.find(d => d.ojo === 'izquierdo') || {}) as DetalleReceta;

  // Configuración de la tabla
  const tableStartY = yPos;
  const colWidths = [20, 25, 25, 20, 20, 25, 25];
  const rowHeight = 10;
  const headers = ['Ojo', 'Esfera', 'Cilindro', 'Eje', 'ADD', 'D.P.', 'Altura'];
  
  // Header de tabla (con fondo gris claro en lugar de azul)
  doc.setFillColor(colors.lightGray.r, colors.lightGray.g, colors.lightGray.b);
  doc.rect(margin, tableStartY, contentWidth, rowHeight, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  
  let xPos = margin;
  headers.forEach((header, i) => {
    doc.text(header, xPos + colWidths[i] / 2, tableStartY + 6.5, { align: 'center' });
    xPos += colWidths[i];
  });
  
  // Filas de datos (sin fondo de color)
  const rows = [
    { label: 'OD', data: ojoDerecho },
    { label: 'OI', data: ojoIzquierdo }
  ];
  
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  
  rows.forEach((row, rowIndex) => {
    const rowY = tableStartY + ((rowIndex + 1) * rowHeight);
    
    // Contenido
    doc.setFont('helvetica', 'bold');
    doc.text(row.label, margin + colWidths[0] / 2, rowY + 6.5, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    const values = [
      String(row.data.esfera || '-'),
      String(row.data.cilindro || '-'),
      String(row.data.eje || '-'),
      String(row.data.adicion || '-'),
      String(row.data.distancia_pupilar || '-'),
      String(row.data.altura || '-')
    ];
    
    xPos = margin + colWidths[0];
    values.forEach((value, i) => {
      doc.text(value, xPos + colWidths[i + 1] / 2, rowY + 6.5, { align: 'center' });
      xPos += colWidths[i + 1];
    });
  });
  
  // Borde de tabla
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.3);
  doc.rect(margin, tableStartY, contentWidth, rowHeight * 3);
  
  // Líneas horizontales
  for (let i = 1; i <= 2; i++) {
    doc.line(margin, tableStartY + (rowHeight * i), pageWidth - margin, tableStartY + (rowHeight * i));
  }
  
  // Líneas verticales
  xPos = margin;
  colWidths.forEach(width => {
    xPos += width;
    doc.line(xPos, tableStartY, xPos, tableStartY + (rowHeight * 3));
  });

  // ============================================
  // NOTAS Y RECOMENDACIONES
  // ============================================
  
  yPos = tableStartY + (rowHeight * 3) + 12;
  
  // Título de sección
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('NOTAS Y RECOMENDACIONES', margin, yPos);
  
  // Línea decorativa simple
  doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos + 1, margin + 75, yPos + 1);
  
  yPos += 6;
  
  // Caja de notas (solo con borde)
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos, contentWidth, 25, 'S');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  
  const notasText = receta.notas || 'Sin notas adicionales.';
  doc.text(notasText, margin + 3, yPos + 5, { maxWidth: contentWidth - 6 });

  // ============================================
  // VALIDEZ Y FIRMA
  // ============================================
  
  yPos += 35;
  
  // Sección de validez (solo con borde)
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos, 75, 15, 'S');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('Fecha de Emisión:', margin + 3, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(receta.fecha_emision), 'dd/MM/yyyy'), margin + 35, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Válida hasta:', margin + 3, yPos + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(
    receta.fecha_vencimiento 
      ? format(new Date(receta.fecha_vencimiento), 'dd/MM/yyyy')
      : 'No especificada',
    margin + 25, 
    yPos + 11
  );
  
  // Firma
  const firmaX = pageWidth - margin - 60;
  doc.setDrawColor(colors.text.r, colors.text.g, colors.text.b);
  doc.setLineWidth(0.5);
  doc.line(firmaX, yPos + 8, firmaX + 55, yPos + 8);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textSecondary.r, colors.textSecondary.g, colors.textSecondary.b);
  doc.text('Firma del Optometrista', firmaX + 27.5, yPos + 12, { align: 'center' });

  // ============================================
  // FOOTER
  // ============================================
  
  const footerY = pageHeight - 18;
  
  // Línea separadora simple
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  // Texto del footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textSecondary.r, colors.textSecondary.g, colors.textSecondary.b);
  doc.text('Este documento es una prescripción médica válida.', pageWidth / 2, footerY + 4, { align: 'center' });
  doc.text('Óptica Omega © 2025 - Todos los derechos reservados', pageWidth / 2, footerY + 8, { align: 'center' });
  
  doc.setFontSize(6);
  doc.text(
    `Generado el ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`,
    pageWidth / 2,
    footerY + 12,
    { align: 'center' }
  );

  // ============================================
  // GUARDAR PDF
  // ============================================
  
  const fileName = `Receta_${patient.primer_apellido}_${format(new Date(receta.fecha_emision), 'ddMMyyyy')}.pdf`;
  doc.save(fileName);
};

// ============================================
// GENERAR PDF DE FACTURA
// ============================================

interface FacturaData {
  id: string;
  folio: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  estado: string;
  aplicar_iva: boolean;
  porcentaje_iva: number | null;
  aplicar_descuento: boolean;
  tipo_descuento: 'porcentaje' | 'fijo' | null;
  valor_descuento: number | null;
  notas_descuento: string | null;
  notas: string | null;
  paciente?: {
    primer_nombre: string;
    primer_apellido: string;
    segundo_apellido?: string;
    telefono: string;
    email?: string;
    direccion?: string;
  };
  items?: Array<{
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
  pagos?: Array<{
    fecha_pago: string;
    monto: number;
    metodo_pago: string;
  }>;
}

export const generateFacturaPDF = async (factura: FacturaData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  let logoBase64 = '';
  try {
    logoBase64 = await loadLogoBase64();
  } catch (error) {
    console.error('Error al cargar el logo:', error);
  }

  const colors = {
    primary: { r: 37, g: 99, b: 235 },
    success: { r: 34, g: 197, b: 94 },
    warning: { r: 251, g: 191, b: 36 },
    danger: { r: 239, g: 68, b: 68 },
    border: { r: 200, g: 200, b: 200 },
    lightGray: { r: 245, g: 245, b: 245 },
    text: { r: 0, g: 0, b: 0 },
    textSecondary: { r: 100, g: 100, b: 100 }
  };

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // ============================================
  // HEADER
  // ============================================
  
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 12, 30, 15);
    } catch (error) {
      console.error('Error al agregar logo al PDF:', error);
    }
  }
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('ÓPTICA OMEGA', margin + 35, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textSecondary.r, colors.textSecondary.g, colors.textSecondary.b);
  doc.text('Especialistas en Salud Visual', margin + 35, 24);
  doc.text('Sonora #2515, Nuevo Laredo, Tamps.', margin + 35, 30);
  doc.text('Tel: (867) 712-2210', margin + 35, 35);

  // Info de factura en la derecha
  const rightX = pageWidth - margin - 55;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.text('FACTURA', rightX, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('Folio:', rightX, 25);
  doc.setFont('helvetica', 'normal');
  doc.text(factura.folio, rightX + 15, 25);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', rightX, 30);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(factura.fecha_emision), 'dd/MM/yyyy'), rightX + 15, 30);

  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.5);
  doc.line(margin, 40, pageWidth - margin, 40);

  let yPos = 50;

  // ============================================
  // DATOS DEL CLIENTE
  // ============================================
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('DATOS DEL CLIENTE', margin, yPos);
  
  doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos + 1, margin + 50, yPos + 1);
  
  yPos += 8;
  
  if (factura.paciente) {
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPos, contentWidth, 20, 'S');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    yPos += 6;
    doc.text('Cliente:', margin + 3, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${factura.paciente.primer_nombre} ${factura.paciente.primer_apellido} ${factura.paciente.segundo_apellido || ''}`.trim(),
      margin + 18,
      yPos
    );
    
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Teléfono:', margin + 3, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(factura.paciente.telefono, margin + 20, yPos);
    
    if (factura.paciente.email) {
      doc.setFont('helvetica', 'bold');
      doc.text('Email:', margin + 70, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(factura.paciente.email, margin + 83, yPos);
    }
    
    if (factura.paciente.direccion) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Dirección:', margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(factura.paciente.direccion, margin + 22, yPos, { maxWidth: contentWidth - 25 });
    }
    
    yPos += 8;
  }

  // ============================================
  // DETALLES DE LA FACTURA
  // ============================================
  
  yPos += 5;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.text('DETALLES', margin, yPos);
  
  doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos + 1, margin + 30, yPos + 1);
  
  yPos += 8;

  // Tabla de items
  const tableStartY = yPos;
  const colWidths = [15, 95, 30, 30];
  const rowHeight = 8;
  const headers = ['Cant.', 'Descripción', 'P. Unit.', 'Subtotal'];
  
  // Header de tabla
  doc.setFillColor(colors.lightGray.r, colors.lightGray.g, colors.lightGray.b);
  doc.rect(margin, tableStartY, contentWidth, rowHeight, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  
  let xPos = margin;
  headers.forEach((header, i) => {
    const textX = i === 1 ? xPos + 2 : xPos + colWidths[i] / 2;
    const align: 'left' | 'center' = i === 1 ? 'left' : 'center';
    doc.text(header, textX, tableStartY + 5.5, { align });
    xPos += colWidths[i];
  });
  
  // Filas de items
  doc.setFont('helvetica', 'normal');
  let currentY = tableStartY + rowHeight;
  
  if (factura.items && factura.items.length > 0) {
    factura.items.forEach((item) => {
      xPos = margin;
      
      // Cantidad
      doc.text(String(item.cantidad), xPos + colWidths[0] / 2, currentY + 5.5, { align: 'center' });
      xPos += colWidths[0];
      
      // Descripción
      doc.text(item.descripcion, xPos + 2, currentY + 5.5);
      xPos += colWidths[1];
      
      // Precio Unitario
      doc.text(`$${item.precio_unitario.toFixed(2)}`, xPos + colWidths[2] / 2, currentY + 5.5, { align: 'center' });
      xPos += colWidths[2];
      
      // Subtotal
      doc.text(`$${item.subtotal.toFixed(2)}`, xPos + colWidths[3] / 2, currentY + 5.5, { align: 'center' });
      
      currentY += rowHeight;
    });
  }
  
  // Bordes de tabla
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.3);
  const tableHeight = (factura.items?.length || 1) * rowHeight + rowHeight;
  doc.rect(margin, tableStartY, contentWidth, tableHeight);
  
  // Líneas horizontales
  for (let i = 1; i <= (factura.items?.length || 0) + 1; i++) {
    doc.line(margin, tableStartY + (rowHeight * i), pageWidth - margin, tableStartY + (rowHeight * i));
  }
  
  // Líneas verticales
  xPos = margin;
  colWidths.forEach(width => {
    xPos += width;
    doc.line(xPos, tableStartY, xPos, tableStartY + tableHeight);
  });

  // ============================================
  // TOTALES
  // ============================================
  
  yPos = tableStartY + tableHeight + 10;
  
  const totalsX = pageWidth - margin - 60;
  doc.setFontSize(10);
  
  // Subtotal
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', totalsX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`$${factura.subtotal.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });
  
  yPos += 6;
  
  // Descuento (solo si está aplicado)
  if (factura.aplicar_descuento && factura.descuento > 0) {
    const descuentoLabel = factura.tipo_descuento === 'porcentaje' && factura.valor_descuento
      ? `Descuento (${factura.valor_descuento}%):`
      : 'Descuento:';
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.success.r, colors.success.g, colors.success.b);
    doc.text(descuentoLabel, totalsX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`-$${factura.descuento.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });
    doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    
    yPos += 6;
    
    // Mostrar motivo del descuento si existe
    if (factura.notas_descuento) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(colors.textSecondary.r, colors.textSecondary.g, colors.textSecondary.b);
      doc.text(`(${factura.notas_descuento})`, totalsX, yPos);
      doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      doc.setFontSize(10);
      
      yPos += 6;
    }
  }
  
  // IVA (solo si está aplicado)
  if (factura.aplicar_iva) {
    const porcentaje = factura.porcentaje_iva || 16;
    doc.setFont('helvetica', 'bold');
    doc.text(`IVA (${porcentaje}%):`, totalsX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`$${factura.iva.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });
    
    yPos += 8;
  } else {
    yPos += 2;
  }
  
  // Total
  doc.setFillColor(colors.lightGray.r, colors.lightGray.g, colors.lightGray.b);
  doc.rect(totalsX - 2, yPos - 5, 62, 8, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.text('TOTAL:', totalsX, yPos);
  doc.text(`$${factura.total.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });
  
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);

  // ============================================
  // PAGOS
  // ============================================
  
  if (factura.pagos && factura.pagos.length > 0) {
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PAGOS REALIZADOS', margin, yPos);
    
    doc.setDrawColor(colors.success.r, colors.success.g, colors.success.b);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos + 1, margin + 48, yPos + 1);
    
    yPos += 6;
    
    doc.setFontSize(8);
    factura.pagos.forEach((pago) => {
      doc.setFont('helvetica', 'normal');
      doc.text(
        `• ${format(new Date(pago.fecha_pago), 'dd/MM/yyyy')} - $${pago.monto.toFixed(2)} (${pago.metodo_pago})`,
        margin + 3,
        yPos
      );
      yPos += 5;
    });
  }

  // ============================================
  // NOTAS
  // ============================================
  
  if (factura.notas) {
    yPos += 5;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTAS:', margin, yPos);
    
    yPos += 5;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(factura.notas, margin + 3, yPos, { maxWidth: contentWidth - 6 });
  }

  // ============================================
  // FOOTER
  // ============================================
  
  const footerY = pageHeight - 18;
  
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textSecondary.r, colors.textSecondary.g, colors.textSecondary.b);
  doc.text('Gracias por su preferencia', pageWidth / 2, footerY + 4, { align: 'center' });
  doc.text('Óptica Omega © 2025 - Todos los derechos reservados', pageWidth / 2, footerY + 8, { align: 'center' });
  
  doc.setFontSize(6);
  doc.text(
    `Generado el ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`,
    pageWidth / 2,
    footerY + 12,
    { align: 'center' }
  );

  // ============================================
  // GUARDAR PDF
  // ============================================
  
  const fileName = `Factura_${factura.folio}.pdf`;
  doc.save(fileName);
};