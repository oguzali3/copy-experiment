declare module 'html-to-image' {
    export function toPng(
      node: HTMLElement, 
      options?: {
        quality?: number;
        pixelRatio?: number;
        backgroundColor?: string;
        width?: number;
        height?: number;
        canvasWidth?: number;
        canvasHeight?: number;
        filter?: (node: Node) => boolean;
        skipFonts?: boolean;
        includeQueryParams?: boolean;
      }
    ): Promise<string>;
  
    export function toJpeg(node: HTMLElement, options?: any): Promise<string>;
    export function toBlob(node: HTMLElement, options?: any): Promise<Blob>;
    export function toCanvas(node: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
    export function toSvg(node: HTMLElement, options?: any): Promise<string>;
  }