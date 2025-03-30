import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, X, Loader } from 'lucide-react';
import { MetricChart } from '@/components/financials/MetricChartforCharting';
// @ts-ignore
import { toPng } from 'html-to-image';
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
      // When dialog opens, start the capture process after a longer delay
      // to ensure the chart is fully rendered with all elements
      const timer = setTimeout(() => {
        if (exportChartRef.current) {
          // First ensure the container and its contents are fully visible
          const container = exportChartRef.current;
          
          // Make sure all SVG elements are properly sized
          const svg = container.querySelector('svg');
          if (svg) {
            // Force the SVG to take the full size of the container
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.display = 'block';
            
            // Make sure all text elements in the SVG are visible
            Array.from(svg.querySelectorAll('text')).forEach(text => {
              text.style.visibility = 'visible';
              text.style.display = 'block';
            });
          }
          
          // Make sure the legend displays properly without wrapping
          const legendItems = container.querySelectorAll('.recharts-legend-item');
          legendItems.forEach(item => {
            // Fix legend item width to prevent wrapping
            (item as HTMLElement).style.display = 'inline-block';
            (item as HTMLElement).style.whiteSpace = 'nowrap';
            (item as HTMLElement).style.overflow = 'visible';
            (item as HTMLElement).style.marginRight = '15px';
          });
          
          // Make sure legend text doesn't wrap
          const legendTexts = container.querySelectorAll('.recharts-legend-item-text');
          legendTexts.forEach(text => {
            (text as HTMLElement).style.whiteSpace = 'nowrap';
          });
          
          // Make sure all chart layers are visible
          Array.from(container.querySelectorAll('.recharts-layer')).forEach(layer => {
            (layer as HTMLElement).style.visibility = 'visible';
            (layer as HTMLElement).style.display = 'block';
          });
          
          // Ensure all labels and axes are visible
          Array.from(container.querySelectorAll('.recharts-cartesian-axis')).forEach(axis => {
            (axis as HTMLElement).style.visibility = 'visible';
            (axis as HTMLElement).style.display = 'block';
          });
          
          // Apply additional margin to ensure axes are captured
          adjustExportChartMargins(container);
          
          // Then start the capture process
          setTimeout(captureChart, 500);
        }
      }, 2000); // Longer delay to ensure chart is fully rendered
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  const captureChart = async () => {
    if (!exportChartRef.current) {
      console.error('Chart ref is null during capture');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Starting chart capture...');
      
      // Make sure the chart container is ready and visible
      const container = exportChartRef.current;
      
      // Check if element is in DOM and has dimensions
      if (!document.body.contains(container)) {
        throw new Error('Chart container is not in the DOM');
      }
      
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        throw new Error('Chart container has zero dimensions');
      }
      
      // IMPORTANT: Get the chart's actual dimensions including all elements
      // We need to capture the wrapper div that contains the chart, title, and labels
      const chartContainer = container.querySelector('[data-testid="export-chart-container"]') || container;
      
      console.log('Capturing element:', chartContainer);
      console.log('Container dimensions:', {
        offsetWidth: chartContainer.offsetWidth,
        offsetHeight: chartContainer.offsetHeight,
        scrollWidth: chartContainer.scrollWidth,
        scrollHeight: chartContainer.scrollHeight
      });
      
      // Add some additional padding to ensure all content is captured
      const paddingElement = chartContainer.querySelector('div');
      if (paddingElement) {
        paddingElement.style.padding = '20px 20px 40px 20px'; // Extra padding for bottom axis
      }
      
      // FIRST ATTEMPT: html-to-image with optimized settings for SVG/dots
      try {
        console.log('Attempting html-to-image with optimized settings');
        const htmlToImage = await import('html-to-image');
        
        // Pre-process the element to ensure all parts are visible
        // Fix for dots alignment in line charts
        const svgElement = chartContainer.querySelector('svg');
        if (svgElement) {
          // Ensure all dots are properly visible and aligned
          const dots = svgElement.querySelectorAll('.recharts-dot, .recharts-line-dot');
          dots.forEach(dot => {
            // Force dot visibility
            (dot as SVGElement).style.visibility = 'visible';
            // Ensure dot positioning is preserved
            const transform = (dot as SVGElement).getAttribute('transform');
            if (transform) {
              (dot as SVGElement).setAttribute('data-original-transform', transform);
            }
          });
          
          // Make sure text elements are visible
          svgElement.querySelectorAll('text').forEach(text => {
            (text as SVGElement).style.visibility = 'visible';
          });
        }
        
        // Use toPng with settings optimized for SVG content
        const dataUrl = await htmlToImage.toPng(chartContainer, {
          pixelRatio: 2, // Higher resolution
          backgroundColor: '#ffffff',
          skipFonts: false, // Include fonts
          canvasWidth: chartContainer.scrollWidth * 2,
          canvasHeight: chartContainer.scrollHeight * 2,
          cacheBust: true, // Prevent caching issues
          // Include custom styles to ensure everything is captured
          style: {
            margin: '0',
            padding: '20px',
            // Force SVG elements to render properly
            '.recharts-surface': {
              overflow: 'visible'
            },
            // Make sure dots render properly
            '.recharts-dot, .recharts-line-dot': {
              visibility: 'visible !important',
              opacity: '1 !important'
            }
          },
          // Custom filter to ensure dots and text render properly
          filter: (node) => {
            // Don't exclude any nodes - we want everything
            return true;
          }
        });
        
        console.log('Image capture successful with html-to-image');
        setPreviewUrl(dataUrl);
        setLoading(false);
        return;
      } catch (err1) {
        console.error('First attempt failed:', err1);
      }
      
      // SECOND ATTEMPT: html2canvas as a fallback
      try {
        console.log('Attempting html2canvas as fallback');
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;
        
        const canvas = await html2canvas(chartContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: chartContainer.scrollWidth,
          height: chartContainer.scrollHeight,
          windowWidth: chartContainer.scrollWidth + 100,
          windowHeight: chartContainer.scrollHeight + 100,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('[data-testid="export-chart-container"]');
            if (clonedElement) {
              // Ensure all dots are visible in the clone
              clonedElement.querySelectorAll('.recharts-dot, .recharts-line-dot').forEach(dot => {
                if (dot instanceof Element) {
                  (dot as HTMLElement).style.visibility = 'visible';
                  (dot as HTMLElement).style.opacity = '1';
                }
              });
              
              // Ensure all text elements are visible
              clonedElement.querySelectorAll('text').forEach(text => {
                if (text instanceof Element) {
                  (text as HTMLElement).style.visibility = 'visible';
                }
              });
            }
          }
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        console.log('Image capture successful with html2canvas');
        setPreviewUrl(dataUrl);
        setLoading(false);
        return;
      } catch (err2) {
        console.error('Second attempt failed:', err2);
      }
      
      // If all methods fail, throw an error
      throw new Error('All image capture methods failed');
      
    } catch (error) {
      console.error('Chart capture failed completely:', error);
      setLoading(false);
      // Show an error message to the user
      alert('Unable to generate chart preview. Please try again or contact support.');
    }
  };

  const downloadChart = () => {
    if (!previewUrl && exportChartRef.current) {
      // If previewUrl doesn't exist yet but the chart ref does, 
      // capture the chart immediately and then download
      setLoading(true);
      
      // Use the same html-to-image approach for download as in captureChart
      const chartContainer = exportChartRef.current.querySelector('[data-testid="export-chart-container"]') || exportChartRef.current;
      
      // Pre-process the SVG elements for better dot alignment
      const svgElement = chartContainer.querySelector('svg');
      if (svgElement) {
        const dots = svgElement.querySelectorAll('.recharts-dot, .recharts-line-dot');
        dots.forEach(dot => {
          (dot as SVGElement).style.visibility = 'visible';
        });
      }
      
      // Use html-to-image for better SVG rendering
      import('html-to-image').then(({ toPng }) => {
        toPng(chartContainer, {
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: false,
          cacheBust: true,
          style: {
            margin: '0',
            padding: '20px',
            '.recharts-surface': {
              overflow: 'visible'
            },
            '.recharts-dot, .recharts-line-dot': {
              visibility: 'visible !important',
              opacity: '1 !important'
            }
          }
        }).then(dataUrl => {
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
          console.error('Error capturing chart for download:', err);
          
          // Fallback to html2canvas if html-to-image fails
          import('html2canvas').then(module => {
            const html2canvas = module.default;
            
            html2canvas(chartContainer, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff'
            }).then(canvas => {
              const dataUrl = canvas.toDataURL('image/png');
              
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = `${fileName || 'chart-export'}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              setPreviewUrl(dataUrl);
              setLoading(false);
            }).catch(fallbackErr => {
              console.error('Fallback capture also failed:', fallbackErr);
              setLoading(false);
            });
          }).catch(() => {
            console.error('Could not load html2canvas');
            setLoading(false);
          });
        });
      }).catch(() => {
        console.error('Could not load html-to-image');
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