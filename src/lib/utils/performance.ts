import { DiagramNode, DiagramEdge } from '../types/diagram';

export class PerformanceUtils {
  private static frameCount = 0;
  private static lastTime = 0;
  private static fps = 0;
  private static fpsCallback?: (fps: number) => void;

  /**
   * Start FPS monitoring
   */
  static startFPSMonitoring(callback: (fps: number) => void): () => void {
    this.fpsCallback = callback;
    this.frameCount = 0;
    this.lastTime = performance.now();

    const monitor = () => {
      this.frameCount++;
      const currentTime = performance.now();

      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.fpsCallback?.(this.fps);
        this.frameCount = 0;
        this.lastTime = currentTime;
      }

      requestAnimationFrame(monitor);
    };

    const animationId = requestAnimationFrame(monitor);

    return () => {
      cancelAnimationFrame(animationId);
      this.fpsCallback = undefined;
    };
  }

  /**
   * Measure execution time of a function
   */
  static measureExecutionTime<T>(
    label: string,
    fn: () => T,
    logToConsole: boolean = false
  ): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (logToConsole) {
      console.log(`${label} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  /**
   * Create a performance marker
   */
  static createMarker(name: string): () => void {
    if ('performance' in window && performance.mark) {
      performance.mark(`${name}-start`);
      return () => {
        performance.mark(`${name}-end`);
        try {
          performance.measure(name, `${name}-start`, `${name}-end`);
          const measure = performance.getEntriesByName(name)[0];
          console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        } catch (error) {
          console.warn('Performance measurement failed:', error);
        }
      };
    }

    // Fallback for browsers without performance.mark
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
    };
  }

  /**
   * Debounce function calls for performance
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(later, wait);

      if (callNow) {
        func(...args);
      }
    };
  }

  /**
   * Throttle function calls for performance
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Virtualize large lists for performance
   */
  static createVirtualList<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    overscan: number = 5
  ): {
    visibleItems: T[];
    startIndex: number;
    endIndex: number;
    offsetY: number;
  } {
    const totalHeight = items.length * itemHeight;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(-0 / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleCount + overscan * 2
    );

    return {
      visibleItems: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
      offsetY: startIndex * itemHeight
    };
  }

  /**
   * Optimize diagram rendering for large datasets
   */
  static optimizeDiagramRendering(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    viewport: { width: number; height: number; zoom: number; offset: { x: number; y: number } }
  ): {
    visibleNodes: DiagramNode[];
    visibleEdges: DiagramEdge[];
  } {
    const { width, height, zoom, offset } = viewport;

    // Calculate visible area bounds
    const left = -offset.x / zoom;
    const right = (-offset.x + width) / zoom;
    const top = -offset.y / zoom;
    const bottom = (-offset.y + height) / zoom;

    // Filter nodes within viewport
    const visibleNodes = nodes.filter(node => {
      const nodeRight = node.position.x + node.size.width;
      const nodeBottom = node.position.y + node.size.height;

      return nodeRight >= left &&
             node.position.x <= right &&
             nodeBottom >= top &&
             node.position.y <= bottom;
    });

    // Filter edges connected to visible nodes
    const visibleNodeIds = new Set(visibleNodes.map(node => node.id));
    const visibleEdges = edges.filter(edge =>
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );

    return { visibleNodes, visibleEdges };
  }

  /**
   * Memory usage monitoring
   */
  static getMemoryUsage(): {
    used: number;
    total: number;
    limit: number;
    percentage: number;
  } | null {
    const memInfo = (performance as any).memory;
    if (!memInfo) return null;

    const used = memInfo.usedJSHeapSize;
    const total = memInfo.totalJSHeapSize;
    const limit = memInfo.jsHeapSizeLimit;

    return {
      used,
      total,
      limit,
      percentage: (used / limit) * 100
    };
  }

  /**
   * Check if WebGL is available for advanced rendering
   */
  static isWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Get recommended rendering strategy based on diagram size
   */
  static getRecommendedRenderingStrategy(
    nodeCount: number,
    edgeCount: number
  ): 'canvas' | 'svg' | 'virtualized' {
    const totalElements = nodeCount + edgeCount;

    if (totalElements > 1000) {
      return 'virtualized';
    } else if (totalElements > 500 || this.isWebGLAvailable()) {
      return 'canvas';
    } else {
      return 'svg';
    }
  }

  /**
   * Create a performance budget checker
   */
  static createPerformanceBudget(
    budget: {
      maxNodes: number;
      maxEdges: number;
      maxRenderTime: number;
      maxMemoryUsage: number;
    },
    onViolation: (violation: string) => void
  ): {
    check: (nodes: DiagramNode[], edges: DiagramEdge[]) => boolean;
    destroy: () => void;
  } {
    let intervalId: NodeJS.Timeout;

    const check = (nodes: DiagramNode[], edges: DiagramEdge[]): boolean => {
      let violations: string[] = [];

      if (nodes.length > budget.maxNodes) {
        violations.push(`Node count (${nodes.length}) exceeds budget (${budget.maxNodes})`);
      }

      if (edges.length > budget.maxEdges) {
        violations.push(`Edge count (${edges.length}) exceeds budget (${budget.maxEdges})`);
      }

      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage && memoryUsage.percentage > budget.maxMemoryUsage) {
        violations.push(`Memory usage (${memoryUsage.percentage.toFixed(1)}%) exceeds budget (${budget.maxMemoryUsage}%)`);
      }

      if (violations.length > 0) {
        violations.forEach(violation => onViolation(violation));
        return false;
      }

      return true;
    };

    // Periodic memory check
    intervalId = setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage && memoryUsage.percentage > budget.maxMemoryUsage) {
        onViolation(`Memory usage (${memoryUsage.percentage.toFixed(1)}%) exceeds budget (${budget.maxMemoryUsage}%)`);
      }
    }, 10000); // Check every 10 seconds

    return {
      check,
      destroy: () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };
  }

  /**
   * Optimize event listeners for performance
   */
  static createOptimizedEventHandler<T extends Event>(
    handler: (event: T) => void,
    throttleMs: number = 16 // ~60fps
  ): (event: T) => void {
    return this.throttle(handler, throttleMs);
  }
}
