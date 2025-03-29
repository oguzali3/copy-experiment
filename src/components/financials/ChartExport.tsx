import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, X, Loader } from 'lucide-react';
import { MetricChart } from '@/components/financials/MetricChartforCharting';
import html2canvas from 'html2canvas';
import { adjustExportChartMargins } from '@/utils/chartExportUtils';

interface ChartExportProps {
  data: any[]; // The processed data for the chart
  metrics: string[]; // Metrics to display
  ticker: string;
  metricTypes: Record<string, string>;
  stackedMetrics?: string[];
  companyName?: string;
  title?: string;
  metricSettings?: Record<string, any>;
  metricLabels?: Record<string, boolean>;
  fileName?: string;
}

const ChartExport: React.FC<ChartExportProps> = ({
  data,
  metrics,
  ticker,
  metricTypes,
  stackedMetrics = [],
  companyName = '',
  title = '',
  metricSettings = {},
  metricLabels = {},
  fileName = 'chart-export'
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const exportChartRef = useRef<HTMLDivElement>(null);
  
  // Cleanup URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // When dialog opens, we'll prepare to capture the chart
  useEffect(() => {
    if (!open) {
      // Clean up the preview URL when dialog closes
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } else {
      // When dialog opens, start the capture process after a short delay
      // to ensure the chart is fully rendered
      const timer = setTimeout(() => {
        // First adjust chart margins to ensure axes are visible
        if (exportChartRef.current) {
          adjustExportChartMargins(exportChartRef.current);
        }
        
        // Then capture the chart
        captureChart();
      }, 1000); // Longer delay to ensure chart is fully rendered
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  const captureChart = async () => {
    if (!exportChartRef.current) return;
    
    setLoading(true);
    try {
      // Wait a bit longer to ensure chart rendering is fully complete
      // This is important for proper axis alignment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use html2canvas to capture the newly rendered chart
      const canvas = await html2canvas(exportChartRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        // These settings help with alignment issues
        imageTimeout: 0,
        windowWidth: 800,
        windowHeight: 567,
        // Ensure we capture all content properly
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-testid="export-chart-container"]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = '800px';
            clonedElement.style.height = '567px';
            clonedElement.style.overflow = 'visible';
          }
        }
      });
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error('Error generating chart preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadChart = () => {
    if (!previewUrl && exportChartRef.current) {
      // If previewUrl doesn't exist yet but the chart ref does, 
      // capture the chart immediately and then download
      setLoading(true);
      html2canvas(exportChartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      }).then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create a download link and trigger click
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${fileName || 'chart-export'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Also update preview for future downloads
        setPreviewUrl(dataUrl);
        setLoading(false);
      }).catch(err => {
        console.error('Error capturing chart for direct download:', err);
        setLoading(false);
      });
      
      return;
    }
    
    if (previewUrl) {
      // Use existing preview URL if available
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `${fileName || 'chart-export'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleMetricTypeChange = () => {
    // This is a no-op function as we don't need to change metric types in the export
    // but MetricChart requires this prop
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => setOpen(true)}
      >
        <Download size={16} />
        <span>Export Chart</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Export Chart</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader className="animate-spin text-blue-500" size={32} />
                  <p className="text-sm text-gray-500">Generating preview...</p>
                </div>
              </div>
            ) : previewUrl ? (
              <div className="flex flex-col items-center">
                <img 
                  src={previewUrl} 
                  alt="Chart Preview" 
                  className="w-full max-h-[500px] object-contain border border-gray-200 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {title || `${companyName} ${metrics?.join(', ')}`}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  PNG image size: 1600 × 1134px (2× resolution for better quality)
                </p>
              </div>
            ) : (
              <div className="relative" style={{ width: '800px', height: '567px', overflow: 'hidden' }} ref={exportChartRef} data-testid="export-chart-container">
                {/* Add margin to ensure axes are fully visible */}
                <div style={{ width: '100%', height: '100%', padding: '1px 1px 2px 1px' }}>
                  <MetricChart
                    data={data}
                    metrics={metrics}
                    ticker={ticker}
                    metricTypes={metricTypes}
                    stackedMetrics={stackedMetrics}
                    onMetricTypeChange={handleMetricTypeChange}
                    companyName={companyName}
                    title={title}
                    metricSettings={metricSettings}
                    metricLabels={metricLabels}
                    exportMode={true} // Enable export mode
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Chart will be exported as a high-quality PNG image
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                <X size={16} className="mr-1" />
                Close
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={downloadChart}
                disabled={loading} // Enable as long as not loading
              >
                <Download size={16} className="mr-1" />
                Download PNG
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChartExport;