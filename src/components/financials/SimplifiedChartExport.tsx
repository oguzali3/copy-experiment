import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Image, Loader2 } from 'lucide-react';

interface ChartExportProps {
  chartRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
}

/**
 * A simplified chart export component that uses a more reliable approach
 * for capturing and exporting charts as PNG images.
 */
export const SimplifiedChartExport: React.FC<ChartExportProps> = ({
  chartRef,
  fileName = 'chart-export',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const   handleOpenDialog = async () => {
    if (!chartRef.current) {
      alert('Could not find the chart to export');
      return;
    }
    
    setIsDialogOpen(true);
    setIsExporting(true);
    
    try {
      // Create a wrapper div with exact export dimensions
      const wrapper = document.createElement('div');
      wrapper.style.width = '800px';
      wrapper.style.height = '567px';
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.backgroundColor = '#FFFFFF';
      wrapper.style.overflow = 'hidden';
      
      // Clone the chart element
      const clone = chartRef.current.cloneNode(true) as HTMLElement;
      
      // Remove unwanted elements from clone
      const elementsToRemove = ['button', 'input', 'table', '[class*="TimeRangePanel"]'];
      elementsToRemove.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.parentNode?.removeChild(el));
      });
      
      // Set the clone to fill the wrapper exactly
      clone.style.width = '100%';
      clone.style.height = '100%';
      
      // Add clone to wrapper
      wrapper.appendChild(clone);
      
      // Add to document for rendering
      document.body.appendChild(wrapper);
      
      // Capture with exact dimensions
      const canvas = await html2canvas(wrapper, {
        width: 800,
        height: 567,
        scale: 2, // For higher quality
        backgroundColor: '#FFFFFF',
        allowTaint: true,
        useCORS: true
      });
      
      // Remove the temporary elements
      document.body.removeChild(wrapper);
      
      // Convert and set preview image
      setPreviewImage(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Error capturing chart:', error);
      alert('Failed to generate chart preview. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!previewImage) return;
    
    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleOpenDialog}
        className="flex items-center gap-1"
      >
        <Image size={16} />
        <span>Export Chart</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chart Export</DialogTitle>
          </DialogHeader>

          {isExporting ? (
            <div className="h-80 w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : previewImage ? (
            <div className="w-full flex justify-center">
              <div className="border border-gray-200 rounded overflow-hidden" style={{ width: '800px', height: '567px' }}>
                <img 
                  src={previewImage} 
                  alt="Chart Preview" 
                  style={{ width: '800px', height: '567px', objectFit: 'contain' }}
                />
              </div>
            </div>
          ) : (
            <div className="h-80 w-full flex items-center justify-center">
              <p className="text-gray-500">No preview available</p>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Image size: 800×567px
            </div>
            <Button 
              onClick={handleDownload} 
              disabled={!previewImage}
              className="flex items-center gap-1"
            >
              <Download size={16} />
              <span>Download PNG</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimplifiedChartExport;