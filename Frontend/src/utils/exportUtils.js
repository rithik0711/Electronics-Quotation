import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './formatters';

/**
 * Format currency specifically for PDF documents using standard Latin ASCII font
 * to avoid WinAnsiEncoding unicode symbol corruption (\u20B9 rendering as ' or garbled character)
 */
export const formatCurrencyPdf = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rs. 0';
  return 'Rs. ' + Math.round(amount).toLocaleString('en-IN');
};

/**
 * Generate Excel data rows and filename for a single quotation
 */
export function getQuotationExcelData(quotation) {
  if (!quotation) return { rows: [], filename: 'Quotation.xlsx' };

  const { customer, items = [], totals, quotationId, createdAt } = quotation;
  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Prepare sheet data as Array of Arrays (AOA)
  const rows = [
    ['ROYAL LUXE ELECTRICALS - OFFICIAL QUOTATION'],
    ['Premium Electrical Switches, Switch Boxes, Luxury Lighting & Designer Fans'],
    [],
    ['QUOTATION DETAILS', '', 'CUSTOMER INFORMATION', ''],
    ['Quotation ID:', quotationId, 'Customer Name:', customer?.name || 'Valued Customer'],
    ['Date Generated:', formattedDate, 'Mobile Number:', customer?.mobile || 'N/A'],
    ['Validity:', '30 Days from date of issue', 'Email Address:', customer?.email || 'N/A'],
    [],
    ['ITEMIZED PRODUCT BREAKDOWN'],
    ['S.No', 'Product Description', 'Category', 'Unit Price (INR)', 'Quantity', 'Amount (INR)']
  ];

  // Add line items
  items.forEach((item, index) => {
    rows.push([
      index + 1,
      item.name,
      item.category || 'General Electricals',
      Number(item.price || 0),
      Number(item.quantity || 1),
      Number((item.price || 0) * (item.quantity || 1))
    ]);
  });

  // Add Summary & Financial Breakdown
  rows.push([]);
  rows.push(['', '', '', '', 'Subtotal:', Number(totals?.subtotal || 0)]);
  rows.push(['', '', '', '', 'GST (18%):', Number(totals?.gstAmount || 0)]);
  rows.push(['', '', '', '', 'Total Payable:', Number(totals?.total || 0)]);
  rows.push([]);
  rows.push(['TERMS & CONDITIONS:']);
  rows.push(['1. Prices are inclusive of standard manufacturer warranty.']);
  rows.push(['2. Delivery within 3-5 business days upon order confirmation.']);
  rows.push(['3. Payment terms: 50% advance upon order placement, balance upon delivery.']);
  rows.push(['Thank you for choosing Royal Luxe Electricals!']);

  const filename = `${quotationId || 'Quotation'}.xlsx`;
  return { rows, filename };
}

/**
 * Generate and download an Excel spreadsheet (.xlsx) for a single quotation
 */
export function exportQuotationToExcel(quotation) {
  if (!quotation) return;

  const { rows, filename } = getQuotationExcelData(quotation);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 8 },   // S.No
    { wch: 38 },  // Product Description
    { wch: 22 },  // Category
    { wch: 18 },  // Unit Price
    { wch: 12 },  // Quantity
    { wch: 20 }   // Total
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Quotation');

  // Trigger Excel download
  XLSX.writeFile(wb, filename);

  return true;
}

/**
 * Export all quotations into a master Excel ledger (.xlsx)
 */
export function exportAllQuotationsToExcel(quotations = []) {
  if (!quotations || quotations.length === 0) return false;

  const rows = [
    ['ROYAL LUXE ELECTRICALS - ALL QUOTATIONS MASTER LEDGER'],
    [`Generated on: ${new Date().toLocaleString()}`],
    [],
    ['Quotation ID', 'Date', 'Customer Name', 'Mobile', 'Email', 'Items Count', 'Subtotal (INR)', 'GST 18% (INR)', 'Grand Total (INR)']
  ];

  quotations.forEach(q => {
    const formattedDate = new Date(q.createdAt || Date.now()).toLocaleDateString('en-IN');
    rows.push([
      q.quotationId,
      formattedDate,
      q.customer?.name || 'N/A',
      q.customer?.mobile || 'N/A',
      q.customer?.email || 'N/A',
      q.totals?.itemCount || (q.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0),
      Number(q.totals?.subtotal || 0),
      Number(q.totals?.gstAmount || 0),
      Number(q.totals?.total || 0)
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 26 },
    { wch: 18 },
    { wch: 28 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Master Ledger');
  XLSX.writeFile(wb, `RoyalLuxe_Quotations_Master_${Date.now()}.xlsx`);
  return true;
}

/**
 * Generate jsPDF document instance for a quotation
 */
export function generateQuotationPdfDoc(quotation) {
  if (!quotation) return null;

  const { customer, items = [], totals, quotationId, createdAt } = quotation;
  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Palette
  const primaryGold = [179, 135, 40];      // #b38728
  const darkNavy = [26, 28, 34];           // #1a1c22
  const textGray = [87, 94, 109];          // #575e6d
  const lightBg = [251, 245, 230];         // #fbf5e6

  // Header Banner Background (Height: 40mm)
  doc.setFillColor(...lightBg);
  doc.rect(0, 0, 210, 40, 'F');

  // Gold Top Border Bar
  doc.setFillColor(...primaryGold);
  doc.rect(0, 0, 210, 4, 'F');

  // Brand Titles on Left side (x = 16 to x = 138)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryGold);
  doc.text('ROYAL LUXE ELECTRICALS', 16, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textGray);
  doc.text('Premium Royal Switches | Modular Switch Boxes | BLDC Fans | Luxury Lighting', 16, 22);
  doc.text('GSTIN: 29AABCU9603R1ZX | Web: www.royalluxeelectricals.com', 16, 27);
  doc.text('Contact: +91 98765 43210 | Email: contact@royalluxeelectricals.com', 16, 32);

  // Quotation Badge on Right side (x = 144 to 194, width: 50mm)
  doc.setFillColor(...primaryGold);
  doc.roundedRect(144, 10, 50, 22, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ESTIMATE QUOTATION', 169, 17, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text(quotationId || 'RLQ-2026', 169, 23, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ESTIMATE', 169, 28, { align: 'center' });

  // Divider Line
  doc.setDrawColor(...primaryGold);
  doc.setLineWidth(0.6);
  doc.line(16, 40, 194, 40);

  // Customer & Meta Info Section (y = 48 to 68)
  doc.setFontSize(9.5);
  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION ISSUED TO:', 16, 48);
  doc.text('QUOTATION DETAILS:', 125, 48);

  // Customer details (Left column)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textGray);
  doc.text('Customer Name: ', 16, 54);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(`${customer?.name || 'Valued Customer'}`, 44, 54);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Mobile Number: ', 16, 60);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(`${customer?.mobile || 'N/A'}`, 44, 60);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Email Address: ', 16, 66);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(`${customer?.email || 'N/A'}`, 44, 66);

  // Metadata (Right column)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Quotation No: ', 125, 54);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(`${quotationId || 'RLQ-001'}`, 154, 54);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Date of Issue: ', 125, 60);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(`${formattedDate}`, 154, 60);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Validity: ', 125, 66);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryGold);
  doc.text('30 Days', 154, 66);

  // Product Table using autoTable with formatCurrencyPdf
  const tableData = items.map((item, index) => [
    index + 1,
    item.name,
    item.category || 'Electrical',
    item.quantity,
    formatCurrencyPdf(item.price),
    formatCurrencyPdf(item.price * item.quantity)
  ]);

  // Total printable width = 210 - (16 * 2) = 178 mm
  autoTable(doc, {
    startY: 73,
    head: [['#', 'Product Description', 'Category', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryGold,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: 3.5
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: darkNavy,
      lineColor: [225, 220, 210],
      cellPadding: 3
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 68 },
      2: { cellWidth: 28 },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 30 }
    },
    alternateRowStyles: {
      fillColor: [252, 251, 249]
    },
    margin: { left: 16, right: 16 }
  });

  const finalY = doc.lastAutoTable.finalY + 8;
  const totalsBoxX = 110;
  const totalsBoxWidth = 84;
  const totalsBoxRight = totalsBoxX + totalsBoxWidth - 6;

  // Totals Breakdown Box
  doc.setFillColor(250, 248, 242);
  doc.roundedRect(totalsBoxX, finalY, totalsBoxWidth, 38, 2.5, 2.5, 'F');
  doc.setDrawColor(...primaryGold);
  doc.setLineWidth(0.35);
  doc.roundedRect(totalsBoxX, finalY, totalsBoxWidth, 38, 2.5, 2.5, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textGray);
  doc.text(`Subtotal (${totals?.itemCount || items.length} items):`, totalsBoxX + 6, finalY + 9);
  doc.setTextColor(...darkNavy);
  doc.text(formatCurrencyPdf(totals?.subtotal || 0), totalsBoxRight, finalY + 9, { align: 'right' });

  doc.setTextColor(...textGray);
  doc.text('GST (18%):', totalsBoxX + 6, finalY + 18);
  doc.setTextColor(...darkNavy);
  doc.text(formatCurrencyPdf(totals?.gstAmount || 0), totalsBoxRight, finalY + 18, { align: 'right' });

  // Divider inside totals
  doc.setDrawColor(216, 212, 199);
  doc.setLineWidth(0.3);
  doc.line(totalsBoxX + 6, finalY + 23, totalsBoxRight, finalY + 23);

  // Grand Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryGold);
  doc.text('Grand Total:', totalsBoxX + 6, finalY + 32);
  doc.text(formatCurrencyPdf(totals?.total || 0), totalsBoxRight, finalY + 32, { align: 'right' });

  // Terms & Notes on Left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  doc.text('Terms & Notes:', 16, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textGray);
  doc.text('1. All electrical fittings meet BIS / ISI safety standards.', 16, finalY + 12);
  doc.text('2. Quotation is valid for 30 calendar days from the date of issue.', 16, finalY + 17);
  doc.text('3. Premium installation support available on customer request.', 16, finalY + 22);
  doc.text('4. Goods covered under official brand manufacturer warranty.', 16, finalY + 27);

  // Signatures at bottom
  const sigY = Math.max(finalY + 48, 255);
  doc.setDrawColor(180, 180, 180);
  doc.line(16, sigY, 70, sigY);
  doc.line(140, sigY, 194, sigY);

  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  doc.text('Customer Acceptance Sign', 16, sigY + 5);
  doc.text('Authorized Signatory (Royal Luxe)', 140, sigY + 5);

  return doc;
}

/**
 * Generate PDF blob URL for previewing in iframe / modal
 */
export function getQuotationPdfBlobUrl(quotation) {
  const doc = generateQuotationPdfDoc(quotation);
  if (!doc) return null;
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

/**
 * Directly download the quotation as a PDF file
 */
export function downloadQuotationPDF(quotation) {
  const doc = generateQuotationPdfDoc(quotation);
  if (!doc) return false;
  const filename = `${quotation.quotationId || 'Quotation'}.pdf`;
  doc.save(filename);
  return true;
}

/**
 * Generate and open/download PDF for a quotation
 * @param {Object} quotation
 * @param {boolean} openInBrowser - if true, opens in a new tab; also saves download
 */
export function exportQuotationToPDF(quotation, openInBrowser = false) {
  const doc = generateQuotationPdfDoc(quotation);
  if (!doc) return false;

  const filename = `${quotation.quotationId || 'Quotation'}.pdf`;

  if (openInBrowser) {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }

  doc.save(filename);
  return true;
}
