import ELK from 'elkjs/lib/elk.bundled.js';
import { DiagramNode, DiagramEdge, LayoutConfig, Position } from '../../types/diagram';

const elk = new ELK();

export class ElkJSLayoutEngine {
  async layout(nodes: DiagramNode[], edges: DiagramEdge[], config: LayoutConfig): Promise<DiagramNode[]> {
    // Convert to ELK format
    const elkGraph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': this.getElkDirection(config.direction),
        'elk.spacing.nodeNode': config.spacing.node.toString(),
        'elk.layered.spacing.nodeNodeBetweenLayers': config.spacing.vertical.toString(),
        'elk.spacing.edgeNode': '20',
        'elk.spacing.edgeEdge': '10'
      },
      children: nodes.map(node => ({
        id: node.id,
        width: node.size.width,
        height: node.size.height,
        labels: [{ text: node.data.label }]
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target]
      }))
    };

    try {
      // Run layout
      const layoutedGraph = await elk.layout(elkGraph);

      // Update node positions
      return nodes.map(node => {
        const layoutedNode = layoutedGraph.children?.find(n => n.id === node.id);
        if (layoutedNode && layoutedNode.x !== undefined && layoutedNode.y !== undefined) {
          return {
            ...node,
            position: {
              x: layoutedNode.x,
              y: layoutedNode.y
            }
          };
        }
        return node;
      });
    } catch (error) {
      console.error('ELK layout failed:', error);
      // Fallback to original positions
      return nodes;
    }
  }

  private getElkDirection(direction: string): string {
    switch (direction) {
      case 'top-bottom':
      case 'vertical':
        return 'DOWN';
      case 'bottom-top':
        return 'UP';
      case 'left-right':
      case 'horizontal':
        return 'RIGHT';
      case 'right-left':
        return 'LEFT';
      default:
        return 'DOWN';
    }
  }

  // Get layout bounds for viewport calculation
  getBounds(nodes: DiagramNode[]): { width: number; height: number; offset: Position } {
    if (nodes.length === 0) return { width: 800, height: 600, offset: { x: 0, y: 0 } };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.size.width);
      maxY = Math.max(maxY, node.position.y + node.size.height);
    });

    return {
      width: maxX - minX,
      height: maxY - minY,
      offset: { x: -minX + 50, y: -minY + 50 } // Add padding
    };
  }
}
