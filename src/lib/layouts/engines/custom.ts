import { DiagramNode, DiagramEdge, LayoutConfig, Position } from '../../types/diagram';
import { GeometryUtils } from '../../utils/geometry';

export interface CustomLayoutOptions {
  algorithm?: 'force' | 'circular' | 'tree' | 'grid' | 'organic';
  iterations?: number;
  repulsion?: number;
  attraction?: number;
  damping?: number;
  centerX?: number;
  centerY?: number;
}

export class CustomLayoutEngine {
  private nodes: DiagramNode[];
  private edges: DiagramEdge[];
  private options: Required<CustomLayoutOptions>;

  constructor(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    options: CustomLayoutOptions = {}
  ) {
    this.nodes = [...nodes];
    this.edges = [...edges];
    this.options = {
      algorithm: options.algorithm || 'force',
      iterations: options.iterations || 100,
      repulsion: options.repulsion || 1000,
      attraction: options.attraction || 0.1,
      damping: options.damping || 0.9,
      centerX: options.centerX || 400,
      centerY: options.centerY || 300
    };
  }

  layout(): DiagramNode[] {
    switch (this.options.algorithm) {
      case 'force':
        return this.forceDirectedLayout();
      case 'circular':
        return this.circularLayout();
      case 'tree':
        return this.treeLayout();
      case 'grid':
        return this.gridLayout();
      case 'organic':
        return this.organicLayout();
      default:
        return this.forceDirectedLayout();
    }
  }

  private forceDirectedLayout(): DiagramNode[] {
    const nodes = [...this.nodes];
    const forces: Position[] = nodes.map(() => ({ x: 0, y: 0 }));

    // Run multiple iterations
    for (let iteration = 0; iteration < this.options.iterations; iteration++) {
      // Reset forces
      forces.forEach(force => {
        force.x = 0;
        force.y = 0;
      });

      // Calculate repulsive forces between all pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];

          const distance = GeometryUtils.distance(node1.position, node2.position);
          const force = this.options.repulsion / (distance * distance + 1);

          const angle = GeometryUtils.angle(node1.position, node2.position);

          forces[i].x -= Math.cos(angle) * force;
          forces[i].y -= Math.sin(angle) * force;
          forces[j].x += Math.cos(angle) * force;
          forces[j].y += Math.sin(angle) * force;
        }
      }

      // Calculate attractive forces for connected nodes
      this.edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
          const distance = GeometryUtils.distance(sourceNode.position, targetNode.position);
          const force = this.options.attraction * distance;

          const angle = GeometryUtils.angle(sourceNode.position, targetNode.position);

          forces.find((_, idx) => nodes[idx] === sourceNode)!.x += Math.cos(angle) * force;
          forces.find((_, idx) => nodes[idx] === sourceNode)!.y += Math.sin(angle) * force;
          forces.find((_, idx) => nodes[idx] === targetNode)!.x -= Math.cos(angle) * force;
          forces.find((_, idx) => nodes[idx] === targetNode)!.y -= Math.sin(angle) * force;
        }
      });

      // Apply forces with damping
      nodes.forEach((node, index) => {
        const force = forces[index];
        node.position.x += force.x * this.options.damping;
        node.position.y += force.y * this.options.damping;

        // Keep nodes within reasonable bounds
        node.position.x = GeometryUtils.clamp(node.position.x, -1000, 2000);
        node.position.y = GeometryUtils.clamp(node.position.y, -1000, 2000);
      });
    }

    return nodes;
  }

  private circularLayout(): DiagramNode[] {
    const nodes = [...this.nodes];
    const centerX = this.options.centerX;
    const centerY = this.options.centerY;
    const radius = Math.min(300, (nodes.length * 50) / (2 * Math.PI));

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
      node.position.x = centerX + Math.cos(angle) * radius;
      node.position.y = centerY + Math.sin(angle) * radius;
    });

    return nodes;
  }

  private treeLayout(): DiagramNode[] {
    const nodes = [...this.nodes];

    // Build adjacency list
    const adjacencyList: Map<string, string[]> = new Map();
    const nodeMap: Map<string, DiagramNode> = new Map();

    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      adjacencyList.set(node.id, []);
    });

    this.edges.forEach(edge => {
      const list = adjacencyList.get(edge.source) || [];
      list.push(edge.target);
      adjacencyList.set(edge.source, list);
    });

    // Find root nodes (nodes with no incoming edges)
    const targets = new Set(this.edges.map(edge => edge.target));
    const rootNodes = nodes.filter(node => !targets.has(node.id));

    if (rootNodes.length === 0 && nodes.length > 0) {
      rootNodes.push(nodes[0]);
    }

    // Simple tree layout using BFS
    const visited = new Set<string>();
    const queue: Array<{ node: DiagramNode; x: number; y: number; level: number }> = [];

    rootNodes.forEach((root, index) => {
      queue.push({
        node: root,
        x: this.options.centerX + (index - rootNodes.length / 2) * 200,
        y: this.options.centerY - 200,
        level: 0
      });
    });

    while (queue.length > 0) {
      const { node, x, y, level } = queue.shift()!;

      if (visited.has(node.id)) continue;
      visited.add(node.id);

      node.position.x = x;
      node.position.y = y;

      // Position children
      const children = adjacencyList.get(node.id) || [];
      const childSpacing = 150;
      const startX = x - ((children.length - 1) * childSpacing) / 2;

      children.forEach((childId, index) => {
        const childNode = nodeMap.get(childId);
        if (childNode && !visited.has(childId)) {
          queue.push({
            node: childNode,
            x: startX + index * childSpacing,
            y: y + 100,
            level: level + 1
          });
        }
      });
    }

    return nodes;
  }

  private gridLayout(): DiagramNode[] {
    const nodes = [...this.nodes];
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);
    const spacingX = 150;
    const spacingY = 100;

    const startX = this.options.centerX - ((cols - 1) * spacingX) / 2;
    const startY = this.options.centerY - ((rows - 1) * spacingY) / 2;

    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      node.position.x = startX + col * spacingX;
      node.position.y = startY + row * spacingY;
    });

    return nodes;
  }

  private organicLayout(): DiagramNode[] {
    // Start with circular layout, then apply some randomization
    const nodes = this.circularLayout();

    // Add some organic variation
    nodes.forEach(node => {
      const variation = 30;
      node.position.x += (Math.random() - 0.5) * variation;
      node.position.y += (Math.random() - 0.5) * variation;
    });

    // Run a few iterations of force-directed layout for organic feel
    const organicLayout = new CustomLayoutEngine(nodes, this.edges, {
      algorithm: 'force',
      iterations: 20,
      repulsion: 500,
      attraction: 0.05,
      damping: 0.8
    });

    return organicLayout.layout();
  }
}

// Utility function to apply custom layout
export const applyCustomLayout = (
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  config: LayoutConfig,
  options: CustomLayoutOptions = {}
): DiagramNode[] => {
  const layoutEngine = new CustomLayoutEngine(nodes, edges, {
    algorithm: config.type === 'flowchart' ? 'force' :
              config.type === 'org-chart' ? 'tree' :
              config.type === 'mind-map' ? 'organic' : 'force',
    ...options
  });

  return layoutEngine.layout();
};
