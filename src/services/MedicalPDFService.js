// Service pour gérer l'export PDF et l'impression des consultations médicales
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Export PDF avancé avec capture HTML
export const exportAdvancedPDF = async (elementId, consultation, options = {}) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Élément HTML non trouvé');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = options.filename || `consultation_avancee_${consultation.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Erreur lors de l\'export PDF avancé:', error);
    throw new Error('Impossible de générer le PDF avancé');
  }
};

// Export PDF professionnel de la consultation avec le même design que l'impression
export const exportToPDF = async (consultationData) => {
  console.log('Export PDF de la consultation:', consultationData);
  
  try {
    // Utiliser jsPDF avec un design amélioré similaire à l'impression
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    
    // Couleurs Mediai
    const primaryBlue = [35, 167, 246];
    const darkBlue = [16, 36, 58];
    const lightBlue = [248, 250, 252];
    const mediumGray = [117, 122, 132];
    const lightGray = [226, 232, 240];
    
    let currentY = margin;
    
    // En-tête avec gradient simulé
    pdf.setFillColor(...primaryBlue);
    pdf.rect(0, 0, pageWidth, 45, 'F');
    
    // Ajout d'un effet de dégradé avec une deuxième couleur
    pdf.setFillColor(33, 148, 243);
    pdf.rect(0, 35, pageWidth, 10, 'F');
    
    // Logo/Titre
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MEDIAI', margin, 22);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Fiche de Consultation Médicale', margin, 38);
    
    currentY = 60;
    
    // Boîtes d'information avec fond coloré
    const boxHeight = 35;
    const boxWidth = (contentWidth - 10) / 2;
    
    // Boîte Patient
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, currentY, boxWidth, boxHeight, 'F');
    pdf.setDrawColor(...lightGray);
    pdf.rect(margin, currentY, boxWidth, boxHeight);
    
    pdf.setTextColor(...primaryBlue);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations Patient', margin + 5, currentY + 8);
    
    pdf.setTextColor(...darkBlue);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Nom: ${consultationData.patient.nom}`, margin + 5, currentY + 16);
    pdf.text(`Âge: ${consultationData.patient.age} ans`, margin + 5, currentY + 22);
    pdf.text(`Tél: ${consultationData.patient.telephone}`, margin + 5, currentY + 28);
    
    // Boîte Consultation
    const boxX2 = margin + boxWidth + 10;
    pdf.setFillColor(248, 250, 252);
    pdf.rect(boxX2, currentY, boxWidth, boxHeight, 'F');
    pdf.setDrawColor(...lightGray);
    pdf.rect(boxX2, currentY, boxWidth, boxHeight);
    
    pdf.setTextColor(...primaryBlue);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations Consultation', boxX2 + 5, currentY + 8);
    
    pdf.setTextColor(...darkBlue);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const consultationDate = new Date(consultationData.date || consultationData.created_at).toLocaleDateString('fr-FR');
    pdf.text(`Date: ${consultationDate}`, boxX2 + 5, currentY + 16);
    pdf.text(`Heure: ${consultationData.heure || '10:00'}`, boxX2 + 5, currentY + 22);
    pdf.text(`Réf: CONS-${consultationData.id}`, boxX2 + 5, currentY + 28);
    
    currentY += boxHeight + 20;
    
    // Sections principales avec design amélioré
    const sections = [
      { title: 'Diagnostic', content: consultationData.diagnostic || 'Non renseigné' },
      { title: 'Recommandations Médicales', content: consultationData.recommandations || 'Non renseigné' },
      { title: 'Traitement Proposé', content: consultationData.traitement || 'Non renseigné' },
      { title: 'Examens Complémentaires', content: consultationData.examen_complementaire || 'Non renseigné' },
      { title: 'Motif de Consultation', content: consultationData.motif_consultation || 'Non renseigné' },
      { title: 'Histoire de la Maladie', content: consultationData.histoire_maladie || 'Non renseigné' }
    ];
    
    sections.forEach((section, index) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = margin;
      }
      
      currentY = addEnhancedSection(pdf, section.title, section.content, margin, currentY, contentWidth, primaryBlue, darkBlue, lightBlue, lightGray);
      currentY += 8;
    });
    
    // Section médecin avec design spécial
    if (currentY > pageHeight - 100) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Boîte médecin traitant (partie gauche)
    const doctorBoxHeight = 40;
    const doctorBoxWidth = contentWidth * 0.6; // 60% de la largeur pour le médecin
    
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, currentY, doctorBoxWidth, doctorBoxHeight, 'F');
    pdf.setDrawColor(...primaryBlue);
    pdf.setLineWidth(1);
    pdf.rect(margin, currentY, doctorBoxWidth, doctorBoxHeight);
    
    pdf.setTextColor(...primaryBlue);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MÉDECIN TRAITANT', margin + 5, currentY + 12);
    
    const doctorName = consultationData.medecin?.nom || consultationData.medecin_nom || 'Dr. Jean Dupont';
    const doctorSpecialty = consultationData.medecin?.specialite || consultationData.medecin_specialite || 'Médecine Générale';
    
    pdf.setTextColor(...darkBlue);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Nom: ${doctorName}`, margin + 5, currentY + 22);
    pdf.text(`Spécialité: ${doctorSpecialty}`, margin + 5, currentY + 30);
    
    // Zone signature séparée (partie droite)
    const signatureBoxX = margin + doctorBoxWidth + 10;
    const signatureBoxWidth = contentWidth - doctorBoxWidth - 10;
    const signatureBoxHeight = doctorBoxHeight;
    
    // Boîte signature
    pdf.setFillColor(255, 255, 255);
    pdf.rect(signatureBoxX, currentY, signatureBoxWidth, signatureBoxHeight, 'F');
    pdf.setDrawColor(...mediumGray);
    pdf.setLineWidth(0.5);
    pdf.rect(signatureBoxX, currentY, signatureBoxWidth, signatureBoxHeight);
    
    // Titre de la section signature
    pdf.setTextColor(...primaryBlue);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VALIDATION', signatureBoxX + 5, currentY + 10);
    
    // Date
    pdf.setFontSize(8);
    pdf.setTextColor(...mediumGray);
    pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, signatureBoxX + 5, currentY + 18);
    
    // Cadre signature interne
    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(0.3);
    pdf.rect(signatureBoxX + 5, currentY + 22, signatureBoxWidth - 10, 15);
    pdf.setFontSize(7);
    pdf.text('Signature et cachet médical', signatureBoxX + 7, currentY + 37);
    
    currentY += doctorBoxHeight + 15;
    
    // Pied de page stylisé
    const footerY = pageHeight - 20;
    pdf.setDrawColor(...lightGray);
    pdf.line(margin, footerY, pageWidth - margin, footerY);
    
    pdf.setFontSize(8);
    pdf.setTextColor(...mediumGray);
    pdf.text('Document généré par Mediai - Plateforme médicale numérique', margin, footerY + 8);
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth - margin - 80, footerY + 8);
    
    // Télécharger le PDF
    const fileName = `consultation_${consultationData.patient.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    
    // Fallback vers l'ancienne méthode en cas d'erreur
    return await exportToPDFFallback(consultationData);
  }
};

// Fonction pour ajouter une section avec design amélioré
const addEnhancedSection = (pdf, title, content, margin, currentY, contentWidth, primaryBlue, darkBlue, lightBlue, lightGray) => {
  const sectionHeight = 8 + Math.max(20, pdf.splitTextToSize(content, contentWidth - 10).length * 5);
  
  // Fond de section
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin, currentY, contentWidth, sectionHeight, 'F');
  
  // Bordure de section
  pdf.setDrawColor(...lightGray);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, currentY, contentWidth, sectionHeight);
  
  // Titre avec fond coloré
  pdf.setFillColor(...lightBlue);
  pdf.rect(margin, currentY, contentWidth, 12, 'F');
  
  pdf.setTextColor(...primaryBlue);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin + 5, currentY + 8);
  
  // Ligne de séparation
  pdf.setDrawColor(...primaryBlue);
  pdf.setLineWidth(0.3);
  pdf.line(margin + 5, currentY + 10, margin + contentWidth - 5, currentY + 10);
  
  // Contenu
  pdf.setTextColor(...darkBlue);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  const lines = pdf.splitTextToSize(content, contentWidth - 10);
  let textY = currentY + 18;
  lines.forEach(line => {
    pdf.text(line, margin + 5, textY);
    textY += 5;
  });
  
  return currentY + sectionHeight;
};

// Méthode de fallback pour l'export PDF (ancienne version)
const exportToPDFFallback = async (consultationData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // Couleurs Mediai
    const primaryBlue = [35, 167, 246];
    const darkBlue = [16, 36, 58];
    const mediumGray = [117, 122, 132];
    
    let currentY = margin;
    
    // En-tête du document
    pdf.setFillColor(...primaryBlue);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo/Titre
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MEDIAI', margin, 20);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Fiche de Consultation Médicale', margin, 32);
    
    currentY = 55;
    
    // Informations générales
    pdf.setTextColor(...darkBlue);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMATIONS GÉNÉRALES', margin, currentY);
    
    currentY += 8;
    pdf.setDrawColor(...mediumGray);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    // Date et référence
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const consultationDate = new Date(consultationData.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Date de consultation: ${consultationDate}`, margin, currentY);
    currentY += 6;
    pdf.text(`Référence: CONS-${consultationData.id}`, margin, currentY);
    currentY += 6;
    pdf.text(`Heure: ${consultationData.heure || '10:00'}`, margin, currentY);
    currentY += 15;
    
    // Informations Patient
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryBlue);
    pdf.text('PATIENT', margin, currentY);
    currentY += 8;
    
    pdf.setDrawColor(...primaryBlue);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    pdf.setTextColor(...darkBlue);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Nom complet: ${consultationData.patient.nom}`, margin, currentY);
    currentY += 6;
    pdf.text(`Âge: ${consultationData.patient.age} ans`, margin, currentY);
    currentY += 6;
    pdf.text(`Téléphone: ${consultationData.patient.telephone}`, margin, currentY);
    currentY += 15;
    
    // Informations Médecin
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryBlue);
    pdf.text('MÉDECIN TRAITANT', margin, currentY);
    currentY += 8;
    
    pdf.setDrawColor(...primaryBlue);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    pdf.setTextColor(...darkBlue);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const doctorName = consultationData.medecin?.nom || 'Dr. Jean Dupont';
    const doctorSpecialty = consultationData.medecin?.specialite || 'Médecine Générale';
    pdf.text(`Nom: ${doctorName}`, margin, currentY);
    currentY += 6;
    pdf.text(`Spécialité: ${doctorSpecialty}`, margin, currentY);
    currentY += 15;
    
    // Diagnostic
    currentY = addSection(pdf, 'DIAGNOSTIC', consultationData.diagnostic || 'Non renseigné', margin, currentY, contentWidth, primaryBlue, darkBlue);
    currentY += 10;
    
    // Recommandations Médicales
    currentY = addSection(pdf, 'RECOMMANDATIONS MÉDICALES', consultationData.recommandations || 'Non renseigné', margin, currentY, contentWidth, primaryBlue, darkBlue);
    currentY += 10;
    
    // Traitement Proposé
    currentY = addSection(pdf, 'TRAITEMENT PROPOSÉ', consultationData.traitement || 'Non renseigné', margin, currentY, contentWidth, primaryBlue, darkBlue);
    currentY += 10;
    
    // Vérifier si on a besoin d'une nouvelle page
    if (currentY > pageHeight - 80) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Examens Complémentaires
    currentY = addSection(pdf, 'EXAMENS COMPLÉMENTAIRES', consultationData.examen_complementaire || 'Non renseigné', margin, currentY, contentWidth, primaryBlue, darkBlue);
    currentY += 10;
    
    // Conseils et Recommandations
    currentY = addSection(pdf, 'CONSEILS ET RECOMMANDATIONS', consultationData.conseils || 'Non renseigné', margin, currentY, contentWidth, primaryBlue, darkBlue);
    currentY += 20;
    
    // Section Signature
    if (currentY > pageHeight - 60) {
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryBlue);
    pdf.text('VALIDATION MÉDICALE', margin, currentY);
    currentY += 8;
    
    pdf.setDrawColor(...primaryBlue);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;
    
    // Signature du médecin
    pdf.setTextColor(...darkBlue);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    const signatureX = pageWidth - margin - 60;
    pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, signatureX, currentY);
    currentY += 8;
    pdf.text(`Dr. ${doctorName}`, signatureX, currentY);
    currentY += 15;
    
    // Cadre pour signature
    pdf.setDrawColor(...mediumGray);
    pdf.rect(signatureX - 5, currentY, 60, 25);
    pdf.setFontSize(8);
    pdf.setTextColor(...mediumGray);
    pdf.text('Signature et cachet', signatureX, currentY + 30);
    
    // Intégrer la signature numérique si elle existe
    if (consultationData.signature_medecin) {
      try {
        const signatureImg = consultationData.signature_medecin;
        pdf.addImage(signatureImg, 'PNG', signatureX - 3, currentY + 2, 56, 21);
      } catch (error) {
        console.log('Erreur lors de l\'ajout de la signature:', error);
      }
    }
    
    // Pied de page
    const footerY = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setTextColor(...mediumGray);
    pdf.text('Document généré par Mediai - Plateforme médicale numérique', margin, footerY);
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth - margin - 60, footerY);
    
    // Télécharger le PDF
    const fileName = `consultation_${consultationData.patient.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF (fallback):', error);
    return { success: false, error: error.message };
  }
};

// Fonction utilitaire pour ajouter une section
const addSection = (pdf, title, content, margin, currentY, contentWidth, primaryBlue, darkBlue) => {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryBlue);
  pdf.text(title, margin, currentY);
  currentY += 8;
  
  pdf.setDrawColor(...primaryBlue);
  pdf.line(margin, currentY, 210 - margin, currentY);
  currentY += 10;
  
  pdf.setTextColor(...darkBlue);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  // Diviser le texte en lignes
  const lines = pdf.splitTextToSize(content, contentWidth);
  lines.forEach(line => {
    pdf.text(line, margin, currentY);
    currentY += 5;
  });
  
  return currentY;
};

// Impression directe de la consultation
export const printConsultation = (consultationData) => {
  console.log('Impression de la consultation:', consultationData);
  
  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open('', '_blank');
  const printContent = generatePrintHTML(consultationData);
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  
  // Attendre que le contenu soit chargé puis imprimer
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

// Génère le HTML stylisé pour l'impression
const generatePrintHTML = (consultationData) => {
  const consultationDate = new Date(consultationData.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const doctorName = consultationData.medecin?.nom || 'Dr. Jean Dupont';
  const doctorSpecialty = consultationData.medecin?.specialite || 'Médecine Générale';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Consultation Médicale - ${consultationData.patient.nom}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', Arial, sans-serif;
          color: #10243A;
          line-height: 1.6;
          font-size: 12px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          background: linear-gradient(135deg, #23A7F6, #2194F3);
          color: white;
          padding: 30px 20px;
          text-align: center;
          margin-bottom: 30px;
          border-radius: 8px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .info-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }
        
        .info-card h3 {
          color: #23A7F6;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          border-bottom: 2px solid #23A7F6;
          padding-bottom: 8px;
        }
        
        .info-item {
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: 600;
          color: #4a5568;
        }
        
        .section {
          margin-bottom: 25px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }
        
        .section h3 {
          color: #23A7F6;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          border-bottom: 2px solid #23A7F6;
          padding-bottom: 8px;
        }
        
        .section-content {
          color: #2d3748;
          line-height: 1.8;
          text-align: justify;
        }
        
        .signature-section {
          margin-top: 40px;
          padding: 30px;
          border: 2px solid #23A7F6;
          border-radius: 8px;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
        }
        
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 30px;
          align-items: end;
        }
        
        .signature-info {
          color: #4a5568;
        }
        
        .signature-box {
          border: 2px dashed #cbd5e0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          min-width: 200px;
          min-height: 80px;
          background: white;
        }
        
        .signature-label {
          color: #a0aec0;
          font-size: 11px;
          margin-bottom: 10px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #a0aec0;
          font-size: 10px;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 0;
            background: white;
          }
          .container {
            max-width: none;
            padding: 10px;
          }
          .no-print { 
            display: none; 
          }
          .header {
            background: #23A7F6 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .section {
            page-break-inside: avoid;
          }
          .signature-section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MEDIAI</h1>
          <p>Fiche de Consultation Médicale</p>
        </div>
        
        <div class="info-grid">
          <div class="info-card">
            <h3>Informations Patient</h3>
            <div class="info-item">
              <span class="info-label">Nom complet:</span> ${consultationData.patient.nom}
            </div>
            <div class="info-item">
              <span class="info-label">Âge:</span> ${consultationData.patient.age} ans
            </div>
            <div class="info-item">
              <span class="info-label">Téléphone:</span> ${consultationData.patient.telephone}
            </div>
          </div>
          
          <div class="info-card">
            <h3>Informations Consultation</h3>
            <div class="info-item">
              <span class="info-label">Date:</span> ${consultationDate}
            </div>
            <div class="info-item">
              <span class="info-label">Heure:</span> ${consultationData.heure || '10:00'}
            </div>
            <div class="info-item">
              <span class="info-label">Référence:</span> CONS-${consultationData.id}
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>Diagnostic</h3>
          <div class="section-content">
            ${consultationData.diagnostic || 'Non renseigné'}
          </div>
        </div>
        
        <div class="section">
          <h3>Recommandations Médicales</h3>
          <div class="section-content">
            ${consultationData.recommandations || 'Non renseigné'}
          </div>
        </div>
        
        <div class="section">
          <h3>Traitement Proposé</h3>
          <div class="section-content">
            ${consultationData.traitement || 'Non renseigné'}
          </div>
        </div>
        
        <div class="section">
          <h3>Examens Complémentaires</h3>
          <div class="section-content">
            ${consultationData.examen_complementaire || 'Non renseigné'}
          </div>
        </div>
        
        <div class="section">
          <h3>Motif de Consultation</h3>
          <div class="section-content">
            ${consultationData.motif_consultation || 'Non renseigné'}
          </div>
        </div>
        
        <div class="section">
          <h3>Histoire de la Maladie</h3>
          <div class="section-content">
            ${consultationData.histoire_maladie || 'Non renseigné'}
          </div>
        </div>
        
        <div class="signature-section">
          <div class="signature-grid">
            <div class="signature-info">
              <div style="margin-bottom: 10px;">
                <span class="info-label">Médecin:</span> ${doctorName}
              </div>
              <div style="margin-bottom: 10px;">
                <span class="info-label">Spécialité:</span> ${doctorSpecialty}
              </div>
              <div>
                <span class="info-label">Date:</span> ${new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
            
            <div class="signature-box">
              <div class="signature-label">Signature et cachet médical</div>
              ${consultationData.signature_medecin ? `<img src="${consultationData.signature_medecin}" alt="Signature" style="max-width: 100%; max-height: 60px;">` : ''}
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Document généré par Mediai - Plateforme médicale numérique</p>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
