import { DiagramNode, DiagramEdge, LayoutConfig, SmartDiagramData } from '../types/diagram';
import { DagreLayoutEngine } from './engines/dagre';
import { ElkJSLayoutEngine } from './engines/elkjs';

export type LayoutEngineType = 'dagre' | 'elkjs' | 'none';

export class LayoutManager {
  private dagreEngine: DagreLayoutEngine;
  private elkEngine: ElkJSLayoutEngine;

  constructor() {
    this.dagreEngine = new DagreLayoutEngine();
    this.elkEngine = new ElkJSLayoutEngine();
  }

  async applyLayout(
    data: SmartDiagramData,
    engine: LayoutEngineType = 'dagre'
  ): Promise<SmartDiagramData> {
    if (engine === 'none' || data.nodes.length === 0) {
      return data;
    }

    let layoutedNodes: DiagramNode[];

    if (engine === 'dagre') {
      layoutedNodes = this.dagreEngine.layout(data.nodes, data.edges, data.layout);
    } else if (engine === 'elkjs') {
      layoutedNodes = await this.elkEngine.layout(data.nodes, data.edges, data.layout);
    } else {
      layoutedNodes = data.nodes;
    }

    // Calculate bounds and adjust positions to center the diagram
    const bounds = engine === 'dagre'
      ? this.dagreEngine.getBounds(layoutedNodes)
      : this.elkEngine.getBounds(layoutedNodes);

    // Center the layout in the viewport
    const centeredNodes = layoutedNodes.map(node => ({
      ...node,
      position: {
        x: node.position.x + bounds.offset.x,
        y: node.position.y + bounds.offset.y
      }
    }));

    return {
      ...data,
      nodes: centeredNodes
    };
  }

  // Auto-layout when nodes or edges change
  async autoLayout(data: SmartDiagramData): Promise<SmartDiagramData> {
    // Use dagre for automatic layout by default
    return this.applyLayout(data, 'dagre');
  }

  // Get available layout engines
  getAvailableEngines(): LayoutEngineType[] {
    return ['dagre', 'elkjs', 'none'];
  }

  // Validate layout configuration
  validateConfig(config: LayoutConfig): boolean {
    return !!(
      config &&
      config.type &&
      config.direction &&
      config.spacing &&
      typeof config.spacing.horizontal === 'number' &&
      typeof config.spacing.vertical === 'number' &&
      typeof config.spacing.node === 'number'
    );
  }
}

// Singleton instance
export const layoutManager = new LayoutManager();
