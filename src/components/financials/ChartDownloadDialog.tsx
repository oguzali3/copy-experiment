
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ChartDownloadDialogProps {
  onDownload: (options: DownloadOptions) => void;
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

export const ChartDownloadDialog = ({ onDownload }: ChartDownloadDialogProps) => {
  const [options, setOptions] = useState<DownloadOptions>({
    width: 800,
    height: 567,
    format: 'PNG',
    showTitle: true,
    showLegend: true,
    backgroundColor: '#FFFFFF',
    transparentBackground: false,
  });

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
