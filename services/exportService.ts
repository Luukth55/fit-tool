
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AppData, ActionItem, PerformanceMetric } from '../types';
import { calculateReliableFitScore } from './analysisUtils';

/**
 * Generates a comprehensive Strategic PDF Report
 */
export const generatePDFReport = (data: AppData) => {
  const doc = new jsPDF();
  const metrics = calculateReliableFitScore(data);
  const dateStr = new Date().toLocaleDateString('nl-NL');

  // Page 1: Cover & Executive Summary
  doc.setFillColor(30, 58, 138); // Deep Blue
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FIT Tool: Strategisch Audit Rapport', 20, 25);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Organisatie: ${data.orgProfile.name}`, 20, 55);
  doc.text(`Datum: ${dateStr}`, 20, 62);
  doc.text(`Sector: ${data.orgProfile.sector}`, 20, 69);

  doc.line(20, 75, 190, 75);

  // Executive Summary Section
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, 90);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = doc.splitTextToSize(metrics.breakdown, 170);
  doc.text(summaryText, 20, 100);

  // Core Metrics Table
  autoTable(doc, {
    startY: 120,
    head: [['Metriek', 'Score', 'Status']],
    body: [
      ['Validated FIT Score', `${metrics.totalFit}%`, metrics.status],
      ['Executie Kracht', `${metrics.executionScore}%`, metrics.executionScore > 70 ? 'Stabiel' : 'Risico'],
      ['Strategische Dekking', `${metrics.coverageScore}%`, metrics.coverageScore > 80 ? 'Goed' : 'Matig'],
      ['Data Betrouwbaarheid', `${metrics.dataConfidence}%`, 'N/A']
    ],
    theme: 'striped',
    headStyles: { fillStyle: [59, 130, 246] }
  });

  // Page 2: Gap Matrix
  doc.addPage();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Strategische Gap Matrix', 20, 20);

  autoTable(doc, {
    startY: 30,
    head: [['Doelstelling', 'Structuur', 'Middelen', 'Cultuur', 'Mensen', 'Fit']],
    body: data.inrichting.gapAnalysis.map(gap => [
      gap.goal,
      gap.structureFit,
      gap.resourcesFit,
      gap.cultureFit,
      gap.peopleFit,
      `${gap.score}/5`
    ]),
    styles: { fontSize: 8 }
  });

  // Page 3: Action Plan
  doc.addPage();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Operationeel Actieplan (Transitie)', 20, 20);

  autoTable(doc, {
    startY: 30,
    head: [['Actie', 'Type', 'Status', 'Eigenaar', 'Deadline', 'Impact']],
    body: data.actions.map(a => [
      a.title,
      a.type,
      a.status,
      a.owner,
      a.deadline,
      a.impact.toString()
    ]),
    styles: { fontSize: 8 }
  });

  // Page 4: External PESTLE
  if (data.externalAnalysis.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Externe Analyse (PESTLE)', 20, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Factor', 'Categorie', 'Horizon', 'Impact', 'Kans / Bedreiging']],
      body: data.externalAnalysis.map(f => [
        f.factor,
        f.category,
        f.horizon || 'TBD',
        f.impactScore?.toString() || '5',
        `${f.opportunity?.substring(0, 30)}... / ${f.threat?.substring(0, 30)}...`
      ]),
      styles: { fontSize: 8 }
    });
  }

  doc.save(`Strategisch_Rapport_${data.orgProfile.name.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Generates an Excel (XLSX) Export of Performance Metrics
 */
export const exportPerformanceToExcel = (metrics: PerformanceMetric[], orgName: string) => {
  const data = metrics.flatMap(m => 
    m.values.map(v => ({
      KPI: m.name,
      Domein: m.wheel,
      Jaar: v.year,
      Waarde: v.value,
      Eenheid: m.unit,
      Type: m.isStandard ? 'Standaard' : 'Custom'
    }))
  );

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Performance");

  XLSX.writeFile(workbook, `Performance_Data_${orgName.replace(/\s+/g, '_')}.xlsx`);
};

/**
 * Generates an Excel (XLSX) Export of the Action Portfolio
 */
export const exportActionsToExcel = (actions: ActionItem[], orgName: string) => {
  const data = actions.map(a => ({
    Titel: a.title,
    Type: a.type,
    Status: a.status,
    Eigenaar: a.owner,
    Deadline: a.deadline,
    Impact: a.impact,
    Moeite: a.effort,
    Voortgang: `${a.progress || 0}%`,
    Bron: a.origin,
    Risico: a.riskLevel || 'Medium'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Actieplan");

  XLSX.writeFile(workbook, `Transitie_Engine_Export_${orgName.replace(/\s+/g, '_')}.xlsx`);
};
