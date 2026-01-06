import { SmartDiagramData, DiagramNode, DiagramEdge } from '../types/diagram';

export class ExportUtils {
  /**
   * Export diagram as PNG using html2canvas
   */
  static async exportAsPNG(
    diagramElement: HTMLElement,
    filename: string = 'diagram.png',
    scale: number = 2
  ): Promise<void> {
    // Dynamic import to avoid bundling html2canvas unless needed
    const html2canvas = (await import('html2canvas')).default;

    try {
      const canvas = await html2canvas(diagramElement, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: diagramElement.offsetWidth,
        height: diagramElement.offsetHeight
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('PNG export failed:', error);
      throw new Error('Failed to export diagram as PNG');
    }
  }

  /**
   * Export diagram as SVG
   */
  static exportAsSVG(
    data: SmartDiagramData,
    filename: string = 'diagram.svg',
    options: {
      width?: number;
      height?: number;
      padding?: number;
      backgroundColor?: string;
    } = {}
  ): void {
    const {
      width = 800,
      height = 600,
      padding = 20,
      backgroundColor = '#ffffff'
    } = options;

    const svgContent = this.generateSVGContent(data, width, height, padding, backgroundColor);

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Export diagram data as JSON
   */
  static exportAsJSON(data: SmartDiagramData, filename: string = 'diagram.json'): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Generate SVG content from diagram data
   */
  private static generateSVGContent(
    data: SmartDiagramData,
    width: number,
    height: number,
    padding: number,
    backgroundColor: string
  ): string {
    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    data.nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.size.width);
      maxY = Math.max(maxY, node.position.y + node.size.height);
    });

    const diagramWidth = maxX - minX + padding * 2;
    const diagramHeight = maxY - minY + padding * 2;
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${diagramWidth}" height="${diagramHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
    </marker>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="${backgroundColor}" />

  <!-- Edges -->`;

    // Add edges
    data.edges.forEach(edge => {
      const sourceNode = data.nodes.find(n => n.id === edge.source);
      const targetNode = data.nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      const sourceX = sourceNode.position.x + sourceNode.size.width / 2 + offsetX;
      const sourceY = sourceNode.position.y + sourceNode.size.height / 2 + offsetY;
      const targetX = targetNode.position.x + targetNode.size.width / 2 + offsetX;
      const targetY = targetNode.position.y + targetNode.size.height / 2 + offsetY;

      const strokeColor = edge.data.style?.strokeColor || '#6B7280';
      const strokeWidth = edge.data.style?.strokeWidth || 2;

      svg += `
  <line
    x1="${sourceX}"
    y1="${sourceY}"
    x2="${targetX}"
    y2="${targetY}"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    marker-end="url(#arrowhead)"
  />`;

      // Add edge label if present
      if (edge.data.label) {
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;

        svg += `
  <text
    x="${midX}"
    y="${midY}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Arial, sans-serif"
    font-size="12"
    fill="#374151"
  >${edge.data.label}</text>`;
      }
    });

    // Add nodes
    data.nodes.forEach(node => {
      const x = node.position.x + offsetX;
      const y = node.position.y + offsetY;
      const nodeWidth = node.size.width;
      const nodeHeight = node.size.height;

      const backgroundColor = node.data.style?.backgroundColor || '#ffffff';
      const borderColor = node.data.style?.borderColor || '#D1D5DB';
      const borderWidth = node.data.style?.borderWidth || 1;
      const borderRadius = node.data.style?.borderRadius || 4;
      const textColor = node.data.style?.textColor || '#111827';
      const fontSize = node.data.style?.fontSize || 14;

      // Node background
      svg += `
  <rect
    x="${x}"
    y="${y}"
    width="${nodeWidth}"
    height="${nodeHeight}"
    fill="${backgroundColor}"
    stroke="${borderColor}"
    stroke-width="${borderWidth}"
    rx="${borderRadius}"
  />`;

      // Node label
      const textX = x + nodeWidth / 2;
      const textY = y + nodeHeight / 2;

      svg += `
  <text
    x="${textX}"
    y="${textY}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Arial, sans-serif"
    font-size="${fontSize}"
    fill="${textColor}"
    font-weight="normal"
  >${node.data.label}</text>`;
    });

    svg += `
</svg>`;

    return svg;
  }

  /**
   * Import diagram from JSON string
   */
  static importFromJSON(jsonString: string): SmartDiagramData {
    try {
      const data = JSON.parse(jsonString);

      // Basic validation
      if (!data.nodes || !data.edges || !data.layout || !data.metadata) {
        throw new Error('Invalid diagram format');
      }

      return data as SmartDiagramData;
    } catch (error) {
      console.error('JSON import failed:', error);
      throw new Error('Failed to import diagram from JSON');
    }
  }

  /**
   * Validate diagram data structure
   */
  static validateDiagramData(data: any): boolean {
    try {
      if (!data || typeof data !== 'object') return false;
      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return false;
      if (!data.layout || !data.metadata) return false;

      // Validate nodes
      for (const node of data.nodes) {
        if (!node.id || !node.type || !node.position || !node.size || !node.data) {
          return false;
        }
      }

      // Validate edges
      for (const edge of data.edges) {
        if (!edge.id || !edge.source || !edge.target || !edge.data) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
}
