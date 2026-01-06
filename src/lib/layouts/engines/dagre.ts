import dagre from 'dagre';
import { DiagramNode, DiagramEdge, LayoutConfig, Position } from '../../types/diagram';

export class DagreLayoutEngine {
  layout(nodes: DiagramNode[], edges: DiagramEdge[], config: LayoutConfig): DiagramNode[] {
    const graph = new dagre.graphlib.Graph();
    graph.setDefaultEdgeLabel(() => ({}));

    // Set graph direction
    let direction: string;
    switch (config.direction) {
      case 'top-bottom':
      case 'vertical':
        direction = 'TB';
        break;
      case 'bottom-top':
        direction = 'BT';
        break;
      case 'left-right':
      case 'horizontal':
        direction = 'LR';
        break;
      case 'right-left':
        direction = 'RL';
        break;
      default:
        direction = 'TB';
    }

    // Set graph direction
    graph.setGraph({
      rankdir: direction,
      nodesep: config.spacing.node,
      ranksep: config.spacing.vertical,
      edgesep: 50,
      align: config.alignment || 'UL'
    });

    // Add nodes to graph
    nodes.forEach(node => {
      graph.setNode(node.id, {
        width: node.size.width,
        height: node.size.height,
        label: node.data.label
      });
    });

    // Add edges to graph
    edges.forEach(edge => {
      graph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(graph);

    // Update node positions based on layout
    return nodes.map(node => {
      const graphNode = graph.node(node.id);
      if (graphNode) {
        return {
          ...node,
          position: {
            x: graphNode.x - node.size.width / 2, // Center the node
            y: graphNode.y - node.size.height / 2
          }
        };
      }
      return node;
    });
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
