import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  elementId: string;
  filename?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Captures an HTML element by ID and converts it into a high-res PDF file download.
 */
export async function exportElementToPdf({
  elementId,
  filename = 'Ident-Africa-Expedition-Dossier.pdf',
  onStart,
  onSuccess,
  onError,
}: ExportPdfOptions): Promise<void> {
  try {
    if (onStart) onStart();

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found for PDF export.`);
    }

    // Scroll element into view or ensure rendered properly
    const canvas = await html2canvas(element, {
      scale: 2, // High DPI capture
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FAF7F2', // Ivory luxury background
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Calculate PDF dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Handle multi-page content if the itinerary is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    // Save and trigger download
    pdf.save(filename);

    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('PDF generation error:', err);
    if (onError) onError(err);
    else throw err;
  }
}
