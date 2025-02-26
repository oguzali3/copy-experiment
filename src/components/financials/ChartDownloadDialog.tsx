
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ChartDownloadDialogProps {
  onDownload: (options: DownloadOptions) => void;
  previewRef: React.RefObject<HTMLDivElement>;
}

export interface DownloadOptions {
  width: number;
  height: number;
  format: 'PNG' | 'JPG';
  showTitle: boolean;
  showLegend: boolean;
  backgroundColor: string;
  transparentBackground: boolean;
}

export const ChartDownloadDialog = ({ onDownload, previewRef }: ChartDownloadDialogProps) => {
  const [options, setOptions] = useState<DownloadOptions>({
    width: 800,
    height: 567,
    format: 'PNG',
    showTitle: true,
    showLegend: true,
    backgroundColor: '#FFFFFF',
    transparentBackground: false,
  });
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const updatePreview = async () => {
    if (!previewRef.current || !previewCanvasRef.current) return;

    try {
      const chartDiv = previewRef.current;
      const chartSvg = chartDiv.querySelector('svg');
      const legendDiv = chartDiv.nextElementSibling as HTMLDivElement;
      
      if (!chartSvg || !legendDiv) return;

      // Create a container div for the combined content
      const container = document.createElement('div');
      container.style.backgroundColor = options.transparentBackground ? 'transparent' : options.backgroundColor;
      container.style.width = `${options.width}px`;
      container.style.height = `${options.height}px`;
      container.style.position = 'relative';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.padding = '16px';
      
      // Clone the SVG and legend
      const svgClone = chartSvg.cloneNode(true) as SVGElement;
      const legendClone = legendDiv.cloneNode(true) as HTMLDivElement;
      
      // Set the SVG to take up 80% of the container height
      svgClone.setAttribute('width', '100%');
      svgClone.setAttribute('height', '80%');
      svgClone.style.display = 'block';
      
      // Style the legend to take up 20% of the container height
      legendClone.style.height = '20%';
      legendClone.style.marginTop = '8px';
      
      container.appendChild(svgClone);
      container.appendChild(legendClone);

      // Convert to SVG string with proper dimensions
      const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.height}">
        <foreignObject width="100%" height="100%">
          ${container.outerHTML}
        </foreignObject>
      </svg>`;

      // Create a Blob from the SVG string
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create preview image
      const img = new Image();
      img.onload = () => {
        if (!previewCanvasRef.current) return;
        const ctx = previewCanvasRef.current.getContext('2d');
        if (!ctx) return;

        // Scale canvas for better preview quality
        const scale = 2;
        const previewWidth = 300;
        const previewHeight = 200;
        previewCanvasRef.current.width = previewWidth * scale;
        previewCanvasRef.current.height = previewHeight * scale;
        previewCanvasRef.current.style.width = `${previewWidth}px`;
        previewCanvasRef.current.style.height = `${previewHeight}px`;
        
        ctx.scale(scale, scale);

        if (!options.transparentBackground) {
          ctx.fillStyle = options.backgroundColor;
          ctx.fillRect(0, 0, previewWidth, previewHeight);
        }

        ctx.drawImage(img, 0, 0, previewWidth, previewHeight);
        setPreviewSrc(previewCanvasRef.current.toDataURL());
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  useEffect(() => {
    updatePreview();
  }, [options, previewRef.current]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDownload(options);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Chart</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
            <canvas
              ref={previewCanvasRef}
              className="w-full h-full object-contain"
            />
            {previewSrc && (
              <img
                src={previewSrc}
                alt="Chart preview"
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={options.width}
                  onChange={(e) => setOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={options.height}
                  onChange={(e) => setOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <RadioGroup
                value={options.format}
                onValueChange={(value: 'PNG' | 'JPG') => setOptions(prev => ({ ...prev, format: value }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PNG" id="png" />
                  <Label htmlFor="png">PNG</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="JPG" id="jpg" />
                  <Label htmlFor="jpg">JPG</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-title"
                  checked={options.showTitle}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, showTitle: checked === true }))
                  }
                />
                <Label htmlFor="show-title">Show Title</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-legend"
                  checked={options.showLegend}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, showLegend: checked === true }))
                  }
                />
                <Label htmlFor="show-legend">Show Legend</Label>
              </div>

              {options.format === 'PNG' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transparent-bg"
                    checked={options.transparentBackground}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, transparentBackground: checked === true }))
                    }
                  />
                  <Label htmlFor="transparent-bg">Transparent Background</Label>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Export as {options.format}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
