// @/utils/chartExportUtils.ts

/**
 * Adjusts chart margins for export to ensure axes are properly visible
 * @param containerRef Reference to the chart container
 */
 export const adjustExportChartMargins = (containerRef: HTMLElement | null) => {
    if (!containerRef) return;
    
    // Find the chart SVG element
    const svgElement = containerRef.querySelector('svg');
    if (!svgElement) return;
    
    // Ensure SVG takes full space of container
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '100%');
    
    // Ensure axes are visible by checking their boundaries
    const xAxis = svgElement.querySelector('.recharts-xAxis');
    const yAxis = svgElement.querySelector('.recharts-yAxis');
    
    if (xAxis) {
      // Ensure x-axis is fully visible
      const xAxisBounds = xAxis.getBoundingClientRect();
      const containerBounds = containerRef.getBoundingClientRect();
      
      // If x-axis extends beyond container, adjust padding
      if (xAxisBounds.right > containerBounds.right) {
        containerRef.style.paddingRight = `${xAxisBounds.right - containerBounds.right + 10}px`;
      }
      
      // Ensure bottom of x-axis is visible
      if (xAxisBounds.bottom > containerBounds.bottom) {
        containerRef.style.paddingBottom = `${xAxisBounds.bottom - containerBounds.bottom + 10}px`;
      }
    }
    
    if (yAxis) {
      // Ensure y-axis is fully visible
      const yAxisBounds = yAxis.getBoundingClientRect();
      const containerBounds = containerRef.getBoundingClientRect();
      
      // If y-axis extends beyond container, adjust padding
      if (yAxisBounds.left < containerBounds.left) {
        containerRef.style.paddingLeft = `${containerBounds.left - yAxisBounds.left + 10}px`;
      }
    }
  };
  
  /**
   * Creates a properly sized ResponsiveContainer config for chart export
   * @param width Desired width in pixels
   * @param height Desired height in pixels
   */
  export const getExportChartConfig = (width = 800, height = 567) => {
    return {
      // Adjust margins to ensure axes are visible
      margin: { 
        top: 30, 
        right: 30, 
        left: 30, 
        bottom: 50
      },
      // Responsive bar sizing for export
      barSize: Math.min(30, Math.floor(width / 20)),
      barGap: 4,
      barCategoryGap: Math.min(20, Math.floor(width / 40))
    };
  };
  
  /**
   * Configures the chart for export with proper dimensions
   * @param chartComponent The chart component to be configured
   * @param width Desired width in pixels
   * @param height Desired height in pixels 
   */
  export const configureChartForExport = (
    chartComponent: React.ReactElement,
    width = 800,
    height = 567
  ) => {
    // Clone the chart component with adjusted props
    return React.cloneElement(chartComponent, {
      width,
      height,
      exportMode: true,
      ...getExportChartConfig(width, height)
    });
  };