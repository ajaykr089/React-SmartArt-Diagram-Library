import React from 'react';
import { SmartDiagramData, DiagramNode, DiagramEdge, LayoutConfig } from '../types/diagram';
import { applyCustomLayout } from './engines/custom';

export interface AutoLayoutOptions {
  triggerOnNodeAdd?: boolean;
  triggerOnNodeRemove?: boolean;
  triggerOnNodeResize?: boolean;
  triggerOnEdgeAdd?: boolean;
  triggerOnEdgeRemove?: boolean;
  debounceMs?: number;
  enabled?: boolean;
}

export class AutoLayoutManager {
  private options: Required<AutoLayoutOptions>;
  private debounceTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(data: SmartDiagramData) => void> = [];

  constructor(options: AutoLayoutOptions = {}) {
    this.options = {
      triggerOnNodeAdd: options.triggerOnNodeAdd ?? true,
      triggerOnNodeRemove: options.triggerOnNodeRemove ?? true,
      triggerOnNodeResize: options.triggerOnNodeResize ?? false,
      triggerOnEdgeAdd: options.triggerOnEdgeAdd ?? true,
      triggerOnEdgeRemove: options.triggerOnEdgeRemove ?? true,
      debounceMs: options.debounceMs ?? 300,
      enabled: options.enabled ?? true
    };
  }

  // Subscribe to layout changes
  subscribe(callback: (data: SmartDiagramData) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Check if auto-layout should trigger based on the change
  shouldTrigger(changeType: 'node-add' | 'node-remove' | 'node-resize' | 'edge-add' | 'edge-remove'): boolean {
    if (!this.options.enabled) return false;

    switch (changeType) {
      case 'node-add':
        return this.options.triggerOnNodeAdd;
      case 'node-remove':
        return this.options.triggerOnNodeRemove;
      case 'node-resize':
        return this.options.triggerOnNodeResize;
      case 'edge-add':
        return this.options.triggerOnEdgeAdd;
      case 'edge-remove':
        return this.options.triggerOnEdgeRemove;
      default:
        return false;
    }
  }

  // Trigger auto-layout with debouncing
  triggerAutoLayout(
    data: SmartDiagramData,
    changeType: 'node-add' | 'node-remove' | 'node-resize' | 'edge-add' | 'edge-remove'
  ): void {
    if (!this.shouldTrigger(changeType)) return;

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounced timer
    this.debounceTimer = setTimeout(() => {
      const newData = this.applyLayout(data);
      this.notifyListeners(newData);
      this.debounceTimer = null;
    }, this.options.debounceMs);
  }

  // Apply the appropriate layout algorithm
  private applyLayout(data: SmartDiagramData): SmartDiagramData {
    const { layout } = data;

    // Apply layout based on configuration
    let positionedNodes: DiagramNode[];

    switch (layout.type) {
      case 'flowchart':
      case 'org-chart':
      case 'mind-map':
        positionedNodes = applyCustomLayout(data.nodes, data.edges, layout);
        break;
      default:
        // For other layout types, use custom layout with force-directed as default
        positionedNodes = applyCustomLayout(data.nodes, data.edges, {
          ...layout,
          type: 'flowchart'
        });
        break;
    }

    return {
      ...data,
      nodes: positionedNodes,
      metadata: {
        ...data.metadata,
        updatedAt: new Date()
      }
    };
  }

  // Notify all listeners of layout changes
  private notifyListeners(data: SmartDiagramData): void {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in auto-layout listener:', error);
      }
    });
  }

  // Update options
  updateOptions(newOptions: Partial<AutoLayoutOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  // Force immediate layout
  forceLayout(data: SmartDiagramData): SmartDiagramData {
    // Clear any pending debounced layout
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    const newData = this.applyLayout(data);
    this.notifyListeners(newData);
    return newData;
  }

  // Enable/disable auto-layout
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
  }

  // Clean up
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.listeners = [];
  }
}

// Utility functions for common auto-layout scenarios
export const createFlowchartAutoLayout = (options?: Partial<AutoLayoutOptions>): AutoLayoutManager => {
  return new AutoLayoutManager({
    triggerOnNodeAdd: true,
    triggerOnNodeRemove: true,
    triggerOnEdgeAdd: true,
    triggerOnEdgeRemove: true,
    debounceMs: 500,
    ...options
  });
};

export const createOrgChartAutoLayout = (options?: Partial<AutoLayoutOptions>): AutoLayoutManager => {
  return new AutoLayoutManager({
    triggerOnNodeAdd: true,
    triggerOnNodeRemove: true,
    triggerOnNodeResize: false,
    triggerOnEdgeAdd: true,
    triggerOnEdgeRemove: true,
    debounceMs: 300,
    ...options
  });
};

export const createMindMapAutoLayout = (options?: Partial<AutoLayoutOptions>): AutoLayoutManager => {
  return new AutoLayoutManager({
    triggerOnNodeAdd: true,
    triggerOnNodeRemove: true,
    triggerOnNodeResize: false,
    triggerOnEdgeAdd: true,
    triggerOnEdgeRemove: true,
    debounceMs: 200,
    ...options
  });
};

// Hook for using auto-layout in React components
export const useAutoLayout = (
  initialData: SmartDiagramData,
  options?: AutoLayoutOptions
) => {
  const [data, setData] = React.useState(initialData);
  const autoLayoutRef = React.useRef<AutoLayoutManager | null>(null);
  const dataRef = React.useRef(initialData);

  // Keep data ref in sync
  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Initialize auto-layout manager
  React.useEffect(() => {
    autoLayoutRef.current = new AutoLayoutManager(options);

    const unsubscribe = autoLayoutRef.current.subscribe((newData) => {
      setData(newData);
    });

    return () => {
      unsubscribe();
      autoLayoutRef.current?.destroy();
    };
  }, [options]);

  // Trigger layout changes
  const triggerLayout = React.useCallback((
    changeType: 'node-add' | 'node-remove' | 'node-resize' | 'edge-add' | 'edge-remove'
  ) => {
    autoLayoutRef.current?.triggerAutoLayout(dataRef.current, changeType);
  }, []);

  // Force immediate layout
  const forceLayout = React.useCallback(() => {
    if (autoLayoutRef.current) {
      const newData = autoLayoutRef.current.forceLayout(dataRef.current);
      setData(newData);
    }
  }, []);

  // Manual data update with layout trigger
  const updateData = React.useCallback((newData: SmartDiagramData, triggerChange?: boolean) => {
    setData(newData);
    if (triggerChange && autoLayoutRef.current) {
      autoLayoutRef.current.triggerAutoLayout(newData, 'node-add'); // Generic trigger
    }
  }, []);

  // Update initial data if it changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return {
    data,
    triggerLayout,
    forceLayout,
    updateData,
    autoLayoutManager: autoLayoutRef.current
  };
};
