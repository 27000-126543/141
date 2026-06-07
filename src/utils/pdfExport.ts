import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#0a0a0f',
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const headerHeight = 35;
  const contentY = headerHeight + 10;
  const availableHeight = pageHeight - contentY - 10;

  const totalPages = Math.ceil(imgHeight / availableHeight);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage();
    }

    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFillColor(0, 245, 255);
    pdf.rect(0, 0, pageWidth, 3, 'F');

    pdf.setFillColor(255, 0, 255);
    pdf.rect(0, 3, pageWidth, 1, 'F');

    pdf.setTextColor(0, 245, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('CYBER HACK WAR', 10, 15);

    pdf.setTextColor(150, 150, 170);
    pdf.setFontSize(10);
    pdf.text('赛博骇客战争 - 机密报告', 10, 23);

    pdf.setTextColor(0, 255, 136);
    pdf.setFontSize(9);
    const dateStr = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    pdf.text(`生成时间: ${dateStr}`, 10, 30);

    pdf.setTextColor(255, 0, 255);
    pdf.text(`第 ${page + 1} / ${totalPages} 页`, pageWidth - 35, 30);

    pdf.setDrawColor(0, 245, 255);
    pdf.setLineWidth(0.5);
    pdf.line(10, 33, pageWidth - 10, 33);

    const sourceY = page * availableHeight * (canvas.height / imgHeight);
    const sourceHeight = Math.min(availableHeight * (canvas.height / imgHeight), canvas.height - sourceY);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = sourceHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight,
        0, 0, canvas.width, sourceHeight
      );
      const tempImgData = tempCanvas.toDataURL('image/png');
      const displayHeight = (sourceHeight * imgWidth) / canvas.width;

      pdf.addImage(
        tempImgData,
        'PNG',
        10,
        contentY,
        imgWidth,
        displayHeight
      );
    }

    pdf.setFillColor(255, 0, 255);
    pdf.rect(0, pageHeight - 2, pageWidth, 2, 'F');

    pdf.setFillColor(0, 245, 255);
    pdf.rect(0, pageHeight - 3, pageWidth, 1, 'F');

    pdf.setTextColor(100, 100, 120);
    pdf.setFontSize(8);
    pdf.text('CLASSIFIED - CYBER HACK WAR CONFIDENTIAL', 10, pageHeight - 8);
    pdf.text('© 2025 Cyber Hack War - All Rights Reserved', pageWidth - 65, pageHeight - 8);
  }

  pdf.save(filename);
}
