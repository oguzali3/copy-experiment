// src/services/LogoCache.ts
class LogoCache {
    private cache: Map<string, boolean> = new Map();
    private loadingPromises: Map<string, Promise<boolean>> = new Map();
  
    async preloadLogo(symbol: string): Promise<boolean> {
      // If already cached, return result
      if (this.cache.has(symbol)) {
        return this.cache.get(symbol)!;
      }
  
      // If already loading, return existing promise
      if (this.loadingPromises.has(symbol)) {
        return this.loadingPromises.get(symbol)!;
      }
  
      // Create new loading promise
      const loadingPromise = new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.cache.set(symbol, true);
          this.loadingPromises.delete(symbol);
          resolve(true);
        };
        img.onerror = () => {
          this.cache.set(symbol, false);
          this.loadingPromises.delete(symbol);
          resolve(false);
        };
        img.src = `https://financialmodelingprep.com/image-stock/${symbol}.png`;
      });
  
      this.loadingPromises.set(symbol, loadingPromise);
      return loadingPromise;
    }
  
    async preloadLogos(symbols: string[]): Promise<void> {
      const promises = symbols.map(symbol => this.preloadLogo(symbol));
      await Promise.all(promises);
    }
  
    hasLogo(symbol: string): boolean | undefined {
      return this.cache.get(symbol);
    }
  }
  
  export const logoCache = new LogoCache();