import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, X, Loader } from 'lucide-react';
import { MetricChart } from '@/components/financials/MetricChartforCharting';
// @ts-ignore
import { toPng } from 'html-to-image';
import { adjustExportChartMargins } from '@/utils/chartExportUtils';
import Logo from '@/components/Logo';
import logoPath from '/biggr.svg';

interface StatisticReferenceLine {
  companyTicker: string;
  metricId: string;
  statType: 'average' | 'median' | 'min' | 'max';
  value: number;
}

// Interface for daily price data
interface DailyPricePoint {
  time: string;
  price: number;
}

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
  directLegends?: string[]; // Add this line
  statisticalLines?: StatisticReferenceLine[]; // New prop
  labelVisibilityArray?: boolean[]; // New prop: array of visibility flags
  dailyPriceData?: DailyPricePoint[]; // Add this property for price data
  selectedPeriods?: string[];
  sliderValue?: [number, number];
  timePeriods?: string[];
}

// Update the component props:
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
  labelVisibilityArray = [], // Default to empty array
  fileName = 'chart-export',
  directLegends = [],
  statisticalLines = [], // Default to empty array
  dailyPriceData = [], // Add default empty array for price data
  selectedPeriods = [],
  sliderValue = [0, 0],
  timePeriods = []
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
          
          // Add more space between chart and legend
          const legendContainer = container.querySelector('.recharts-legend-wrapper');
          if (legendContainer) {
            // Add margin top to create space between chart and legend
            (legendContainer as HTMLElement).style.marginTop = '30px';
            (legendContainer as HTMLElement).style.paddingTop = '15px';
            (legendContainer as HTMLElement).style.textAlign = 'left';
            (legendContainer as HTMLElement).style.left = '0';
            (legendContainer as HTMLElement).style.width = '100%';
            
            // Force vertical layout for legends
            const legendItems = container.querySelectorAll('.recharts-legend-item');
            legendItems.forEach((item, index) => {
              // Set display block to force vertical stacking
              (item as HTMLElement).style.display = 'block';
              (item as HTMLElement).style.marginBottom = '4px';
              (item as HTMLElement).style.whiteSpace = 'nowrap';
              (item as HTMLElement).style.clear = 'both';
            });
          }
          
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
      
      // Add more space between chart and legend
      const legendContainer = chartContainer.querySelector('.recharts-legend-wrapper');
      if (legendContainer) {
        // Add margin top to create space between chart and legend
        (legendContainer as HTMLElement).style.marginTop = '30px';
        (legendContainer as HTMLElement).style.paddingTop = '15px';
        (legendContainer as HTMLElement).style.textAlign = 'left';
        (legendContainer as HTMLElement).style.left = '40px';
        (legendContainer as HTMLElement).style.width = '100%';
        
        // Force vertical layout for legends
        const legendItems = chartContainer.querySelectorAll('.recharts-legend-item');
        legendItems.forEach((item, index) => {
          // Set display block to force vertical stacking
          (item as HTMLElement).style.display = 'block';
          (item as HTMLElement).style.marginBottom = '4px';
          (item as HTMLElement).style.whiteSpace = 'nowrap';
          (item as HTMLElement).style.clear = 'both';
        });
      }
      
      // Fix for chart scaling - make the chart fill the available width
      // and reduce left/right margins to minimum
      const chartWrapper = chartContainer.querySelector('.recharts-wrapper');
      if (chartWrapper) {
        // Set the chart to fill the container width
        chartWrapper.style.width = '100%';
        chartWrapper.style.maxWidth = 'none';
        // Reduce side margins to minimum
        chartWrapper.style.marginLeft = '0';
        chartWrapper.style.marginRight = '0';
        chartWrapper.style.display = 'block';
        // Add bottom margin to create space for legend
        chartWrapper.style.marginBottom = '25px';
      }
      
      // Fix SVG viewBox if it has extra left space and scale it to fill width
      const svg = chartContainer.querySelector('svg');
      if (svg) {
        // Make SVG fill the container
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.maxWidth = 'none';
        
        // Adjust viewBox if needed
        const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number);
        if (viewBox && viewBox.length === 4) {
          // If there's negative space on the left (first value), reduce it
          if (viewBox[0] < 0) {
            // Set left edge to 0 or very minimal negative value
            viewBox[0] = Math.max(viewBox[0], -2);
            svg.setAttribute('viewBox', viewBox.join(' '));
          }
          
          // Make sure preserveAspectRatio is set to scale appropriately
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
      }

      // Add some additional padding to ensure all content is captured, but don't add too much horizontal padding
      const paddingElement = chartContainer.querySelector('div');
      if (paddingElement) {
        // Use minimal horizontal padding to maximize chart width
        // Add more bottom padding to give space for the legend
        paddingElement.style.padding = '20px 5px 20px 5px'; // More bottom padding
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
            padding: '5px',
            // Force SVG elements to render properly
            '.recharts-surface': {
              overflow: 'visible'
            },
            // Make sure dots render properly
            '.recharts-dot, .recharts-line-dot': {
              visibility: 'visible !important',
              opacity: '1 !important'
            },
            // Make chart fill available width
            '.recharts-wrapper': {
              width: '100% !important',
              maxWidth: 'none !important',
              marginLeft: '0 !important',
              marginRight: '0 !important',
              marginBottom: '5px !important',
              display: 'block !important'
            },
            // Make SVG fill the wrapper
            'svg': {
              width: '100% !important',
              height: 'auto !important',
              display: 'block !important',
              maxWidth: 'none !important'
            },
            // Force legend to display vertically with spacing from chart
            '.recharts-legend-wrapper': {
              textAlign: 'left !important',
              left: '0 !important',
              width: '100% !important',
              marginTop: '5px !important',
              paddingTop: '1px !important'
            },
            '.recharts-legend-item': {
              display: 'block !important',
              marginBottom: '8px !important',
              whiteSpace: 'nowrap !important',
              clear: 'both !important'
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
              // Fix legend layout in the clone with more spacing
              const legendContainer = clonedElement.querySelector('.recharts-legend-wrapper');
              if (legendContainer) {
                (legendContainer as HTMLElement).style.textAlign = 'left';
                (legendContainer as HTMLElement).style.left = '0';
                (legendContainer as HTMLElement).style.marginTop = '30px';
                (legendContainer as HTMLElement).style.paddingTop = '15px';
                
                // Force vertical layout for legends
                const legendItems = clonedElement.querySelectorAll('.recharts-legend-item');
                legendItems.forEach(item => {
                  (item as HTMLElement).style.display = 'block';
                  (item as HTMLElement).style.marginBottom = '4px';
                  (item as HTMLElement).style.clear = 'both';
                });
              }
              
              // Make chart fill available width in the clone
              const chartWrapper = clonedElement.querySelector('.recharts-wrapper');
              if (chartWrapper) {
                (chartWrapper as HTMLElement).style.width = '100%';
                (chartWrapper as HTMLElement).style.maxWidth = 'none';
                (chartWrapper as HTMLElement).style.marginLeft = '0';
                (chartWrapper as HTMLElement).style.marginRight = '0';
                (chartWrapper as HTMLElement).style.marginBottom = '25px';
                (chartWrapper as HTMLElement).style.display = 'block';
              }
              
              // Make SVG fill the wrapper in the clone
              const svg = clonedElement.querySelector('svg');
              if (svg) {
                (svg as SVGElement).style.width = '100%';
                (svg as SVGElement).style.height = 'auto';
                (svg as SVGElement).style.display = 'block';
                (svg as SVGElement).style.maxWidth = 'none';
              }
              
              // Add more bottom padding
              const paddingElement = clonedElement.querySelector('div');
              if (paddingElement) {
                (paddingElement as HTMLElement).style.padding = '20px 5px 60px 5px';
              }
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
      
      // Add more space between chart and legend
      const legendContainer = chartContainer.querySelector('.recharts-legend-wrapper');
      if (legendContainer) {
        // Add margin top to create space between chart and legend
        (legendContainer as HTMLElement).style.marginTop = '30px';
        (legendContainer as HTMLElement).style.paddingTop = '15px';
        (legendContainer as HTMLElement).style.textAlign = 'left';
        (legendContainer as HTMLElement).style.left = '0';
        (legendContainer as HTMLElement).style.width = '100%';
        
        // Force vertical layout for legends
        const legendItems = chartContainer.querySelectorAll('.recharts-legend-item');
        legendItems.forEach((item, index) => {
          // Set display block to force vertical stacking
          (item as HTMLElement).style.display = 'block';
          (item as HTMLElement).style.marginBottom = '8px';
          (item as HTMLElement).style.whiteSpace = 'nowrap';
          (item as HTMLElement).style.clear = 'both';
        });
      }
      
      // Fix for extra left space and make chart fill available width
      const chartWrapper = chartContainer.querySelector('.recharts-wrapper');
      if (chartWrapper) {
        // Set the chart to fill the container width
        chartWrapper.style.width = '100%';
        chartWrapper.style.maxWidth = 'none';
        // Reduce side margins to minimum
        chartWrapper.style.marginLeft = '0';
        chartWrapper.style.marginRight = '0';
        chartWrapper.style.display = 'block';
        // Add bottom margin to create space for legend
        chartWrapper.style.marginBottom = '25px';
      }
      
      // Make SVG fill the wrapper
      const svgElement = chartContainer.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.display = 'block';
        svgElement.style.maxWidth = 'none';
        
        // Ensure dots are visible
        const dots = svgElement.querySelectorAll('.recharts-dot, .recharts-line-dot');
        dots.forEach(dot => {
          (dot as SVGElement).style.visibility = 'visible';
        });
        
        // Fix SVG viewBox if it has extra left space
        const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number);
        if (viewBox && viewBox.length === 4 && viewBox[0] < 0) {
          viewBox[0] = Math.max(viewBox[0], -2); // Limit negative space to bare minimum
          svgElement.setAttribute('viewBox', viewBox.join(' '));
        }
        
        // Make sure preserveAspectRatio is set to scale appropriately
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }
      
      // Add more bottom padding for legend
      const paddingElement = chartContainer.querySelector('div');
      if (paddingElement) {
        paddingElement.style.padding = '20px 5px 60px 5px'; // More bottom padding
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
            padding: '5px', // Minimal padding
            '.recharts-surface': {
              overflow: 'visible'
            },
            '.recharts-dot, .recharts-line-dot': {
              visibility: 'visible !important',
              opacity: '1 !important'
            },
            // Make chart fill available width
            '.recharts-wrapper': {
              width: '100% !important',
              maxWidth: 'none !important',
              marginLeft: '0 !important',
              marginRight: '0 !important',
              marginBottom: '25px !important',
              display: 'block !important'
            },
            // Make SVG fill the wrapper
            'svg': {
              width: '100% !important',
              height: 'auto !important',
              display: 'block !important',
              maxWidth: 'none !important'
            },
            // Force legend to display vertically with spacing from chart
            '.recharts-legend-wrapper': {
              textAlign: 'left !important',
              left: '0 !important',
              width: '100% !important',
              marginTop: '30px !important',
              paddingTop: '15px !important'
            },
            '.recharts-legend-item': {
              display: 'block !important',
              marginBottom: '4px !important',
              whiteSpace: 'nowrap !important',
              clear: 'both !important'
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
              backgroundColor: '#ffffff',
              onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.querySelector('[data-testid="export-chart-container"]');
                if (clonedElement) {
                  // Fix legend layout in the clone with more spacing
                  const legendContainer = clonedElement.querySelector('.recharts-legend-wrapper');
                  if (legendContainer) {
                    (legendContainer as HTMLElement).style.textAlign = 'left';
                    (legendContainer as HTMLElement).style.left = '0';
                    (legendContainer as HTMLElement).style.marginTop = '30px';
                    (legendContainer as HTMLElement).style.paddingTop = '15px';
                    
                    // Force vertical layout for legends
                    const legendItems = clonedElement.querySelectorAll('.recharts-legend-item');
                    legendItems.forEach(item => {
                      (item as HTMLElement).style.display = 'block';
                      (item as HTMLElement).style.marginBottom = '8px';
                      (item as HTMLElement).style.clear = 'both';
                    });
                  }
                  
                  // Make chart fill available width in the clone
                  const chartWrapper = clonedElement.querySelector('.recharts-wrapper');
                  if (chartWrapper) {
                    (chartWrapper as HTMLElement).style.width = '100%';
                    (chartWrapper as HTMLElement).style.maxWidth = 'none';
                    (chartWrapper as HTMLElement).style.marginLeft = '0';
                    (chartWrapper as HTMLElement).style.marginRight = '0';
                    (chartWrapper as HTMLElement).style.marginBottom = '25px';
                    (chartWrapper as HTMLElement).style.display = 'block';
                  }
                  
                  // Make SVG fill the wrapper in the clone
                  const svg = clonedElement.querySelector('svg');
                  if (svg) {
                    (svg as SVGElement).style.width = '100%';
                    (svg as SVGElement).style.height = 'auto';
                    (svg as SVGElement).style.display = 'block';
                    (svg as SVGElement).style.maxWidth = 'none';
                  }
                  
                  // Add more bottom padding
                  const paddingElement = clonedElement.querySelector('div');
                  if (paddingElement) {
                    (paddingElement as HTMLElement).style.padding = '20px 5px 60px 5px';
                  }
                }
              }
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

  // Check if we have price metric
  const hasPriceMetric = metrics.some(m => m.toLowerCase() === 'price');

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
                <div style={{ width: '100%', height: '100%', padding: '20px 5px 20px 5px' }}>
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
                    labelVisibilityArray={labelVisibilityArray}
                    directLegends={directLegends}
                    statisticalLines={statisticalLines}
                    dailyPriceData={dailyPriceData}
                    selectedPeriods={selectedPeriods}
                    sliderValue={sliderValue}
                    timePeriods={timePeriods}
                  />
                </div>
                <div className="absolute bottom-10 right-10 z-10" style={{ width: '150px', height: '70px', opacity: 0.9 }}>
                  <img src={logoPath} alt="Logo" style={{ width: '100%', height: '100%' }} />
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