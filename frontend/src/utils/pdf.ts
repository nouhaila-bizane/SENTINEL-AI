import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFReport = (analysis: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(34, 211, 238);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SENTINEL AI', 14, 18);
  doc.setTextColor(248, 250, 252);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Analysis Report', pageWidth - 14, 18, { align: 'right' });

  // Summary
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(analysis.projectName, 14, 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`ID: ${analysis._id}`, 14, 55);
  doc.text(`Created: ${new Date(analysis.createdAt).toLocaleString()}`, 14, 62);
  doc.text(`Decision: ${analysis.currentReleaseDecision}`, 14, 69);

  // Security findings
  let y = 85;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Security Findings', 14, y);
  y += 6;

  if (analysis.securityFindings.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(34, 197, 94);
    doc.text('No security issues detected.', 14, y + 4);
    y += 14;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Code', 'Severity', 'Title', 'File:Line']],
      body: analysis.securityFindings.map((f: any) => [f.code, f.severity, f.title, `${f.file || '-'}:${f.line || '-'}`]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Spec findings
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Specification Findings', 14, y);
  y += 6;

  if (analysis.specificationFindings.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No specification issues.', 14, y + 4);
    y += 14;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Code', 'Severity', 'Title']],
      body: analysis.specificationFindings.map((f: any) => [f.code, f.severity, f.title]),
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 8 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Verification
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Verification Runs', 14, y);
  y += 6;

  if (analysis.verificationRuns.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No verification runs.', 14, y + 4);
  } else {
    const lastRun = analysis.verificationRuns[analysis.verificationRuns.length - 1];
    autoTable(doc, {
      startY: y,
      head: [['Check', 'Status', 'Reason']],
      body: lastRun.checks.map((c: any) => [c.name, c.status, c.reason || '']),
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 8 },
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SENTINEL AI — Generated ${new Date().toLocaleString()} — Page ${i}/${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
  }

  const safeFileName = String(analysis.projectName || 'analysis')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60) || 'analysis';

doc.save(`sentinel-report-${safeFileName.toLowerCase()}.pdf`);
};