import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartExportProps {
  chartRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
  companyName?: string;
  metrics?: string[];
}

/**
 * Component for exporting chart as image or PDF with fixed dimensions
 */
export const ChartExport: React.FC<ChartExportProps> = ({
  chartRef,
  fileName = 'financial-chart',
  companyName = '',
  metrics = [],
}) => {
  // Generate a descriptive file name
  const getFileName = (extension: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const company = companyName ? `-${companyName}` : '';
    const metricsText = metrics.length > 0 
      ? `-${metrics.slice(0, 2).join('-')}${metrics.length > 2 ? '-etc' : ''}`
      : '';
    
    return `${fileName}${company}${metricsText}-${timestamp}.${extension}`;
  };

  // Export chart as PNG image with fixed dimensions
  const exportAsPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      // Show loading state
      const originalButtonText = document.activeElement?.textContent;
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.textContent = 'Exporting...';
        document.activeElement.disabled = true;
      }
      
      // Store original dimensions
      const originalWidth = chartRef.current.style.width;
      const originalHeight = chartRef.current.style.height;
      const originalPosition = chartRef.current.style.position;
      
      // Set fixed dimensions for export (800x567)
      chartRef.current.style.width = '800px';
      chartRef.current.style.height = '567px';
      chartRef.current.style.position = 'relative';
      
      // Small delay to ensure rendering is complete with new dimensions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(chartRef.current, {
        width: 800,
        height: 567,
        scale: 1, // No scaling needed since we're setting exact dimensions
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Restore original dimensions
      chartRef.current.style.width = originalWidth;
      chartRef.current.style.height = originalHeight;
      chartRef.current.style.position = originalPosition;
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = getFileName('png');
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Restore button state
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.textContent = originalButtonText;
        document.activeElement.disabled = false;
      }
    } catch (error) {
      console.error('Error exporting chart as PNG:', error);
      alert('Failed to export as PNG. Please try again.');
      
      // Restore dimensions in case of error
      if (chartRef.current) {
        chartRef.current.style.width = '';
        chartRef.current.style.height = '';
        chartRef.current.style.position = '';
      }
      
      // Restore button state on error
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.textContent = 'PNG';
        document.activeElement.disabled = false;
      }
    }
  };

  // Export chart as PDF with fixed dimensions
  const exportAsPDF = async () => {
    if (!chartRef.current) return;
    
    try {
      // Show loading state
      const originalButtonText = document.activeElement?.textContent;
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.textContent = 'Exporting...';
        document.activeElement.disabled = true;
      }
      
      // Store original dimensions
      const originalWidth = chartRef.current.style.width;
      const originalHeight = chartRef.current.style.height;
      const originalPosition = chartRef.current.style.position;
      
      // Set fixed dimensions for export (800x567)
      chartRef.current.style.width = '800px';
      chartRef.current.style.height = '567px';
      chartRef.current.style.position = 'relative';
      
      // Small delay to ensure rendering is complete with new dimensions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(chartRef.current, {
        width: 800,
        height: 567,
        scale: 1,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Restore original dimensions
      chartRef.current.style.width = originalWidth;
      chartRef.current.style.height = originalHeight;
      chartRef.current.style.position = originalPosition;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 210] // A4 landscape
      });
      
      // Add metadata to PDF
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit the page while maintaining aspect ratio
      const ratio = 800 / 567; // Aspect ratio of our image
      const pdfWidth = width - 40; // Add some margins
      const pdfHeight = pdfWidth / ratio;
      const imgX = (width - pdfWidth) / 2;
      const imgY = (height - pdfHeight) / 2;
      
      // Add the chart image
      pdf.addImage(imgData, 'PNG', imgX, imgY, pdfWidth, pdfHeight);
      
      // Add footer with date
      pdf.setFontSize(8);
      const date = new Date().toLocaleDateString();
      pdf.text(`Generated on ${date} | ${companyName} | ${metrics.join(', ')}`, width / 2, height - 10, { align: 'center' });
      
      pdf.save(getFileName('pdf'));
      
      // Restore button state
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.textContent = originalButtonText;
        document.activeElement.disabled = false;
      }
    } catch (error) {
      console.error('Error exporting chart as PDF:', error);
      alert('Failed to export as PDF. Please try again.');
      
      // Restore dimensions in case of error
      if (chartRef.current) {
        chartRef.current.style.width = '';
        chartRef.current.style.height = '';
        chartRef.current.style.position = '';
      }
      
      // Restore button state on error
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.textContent = 'PDF';
        document.activeElement.disabled = false;
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportAsPNG}
        className="flex items-center gap-1"
      >
        <Download size={16} />
        PNG
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportAsPDF}
        className="flex items-center gap-1"
      >
        <Download size={16} />
        PDF
      </Button>
    </div>
  );
};

export default ChartExport;