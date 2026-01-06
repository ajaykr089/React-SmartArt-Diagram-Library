import React, { useRef, useEffect, useCallback } from 'react';
import { SmartDiagramData, DiagramNode, DiagramEdge } from '../types/diagram';

interface CanvasRendererProps {
  data: SmartDiagramData;
  width: number;
  height: number;
  backgroundColor?: string;
  onNodeClick?: (node: DiagramNode, event: MouseEvent) => void;
  onEdgeClick?: (edge: DiagramEdge, event: MouseEvent) => void;
  onCanvasClick?: (event: MouseEvent) => void;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Enable high-DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  setBackground(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawNode(node: DiagramNode, isSelected: boolean = false): void {
    const { position, size, data } = node;
    const { x, y } = position;
    const { width, height } = size;

    // Save context
    this.ctx.save();

    // Apply styles
    this.ctx.fillStyle = data.style?.backgroundColor || '#10B981';
    this.ctx.strokeStyle = isSelected ? '#EF4444' : (data.style?.borderColor || '#6B7280');
    this.ctx.lineWidth = isSelected ? 3 : (data.style?.borderWidth || 2);

    // Draw shape based on type
    switch (node.type) {
      case 'rectangle':
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);
        break;

      case 'rounded-rectangle':
        this.drawRoundedRect(x, y, width, height, data.style?.borderRadius || 8);
        break;

      case 'circle':
        const circleRadius = Math.min(width, height) / 2;
        const circleCenterX = x + width / 2;
        const circleCenterY = y + height / 2;
        this.ctx.beginPath();
        this.ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        break;

      case 'ellipse':
        const ellipseRadiusX = width / 2;
        const ellipseRadiusY = height / 2;
        const ellipseCenterX = x + width / 2;
        const ellipseCenterY = y + height / 2;
        this.ctx.beginPath();
        this.ctx.ellipse(ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        break;

      case 'diamond':
        this.drawDiamond(x, y, width, height);
        break;

      case 'triangle':
        this.drawTriangle(x, y, width, height);
        break;

      case 'hexagon':
        this.drawPolygon(x, y, width, height, 6);
        break;

      case 'pentagon':
        this.drawPolygon(x, y, width, height, 5);
        break;

      case 'star':
        this.drawStar(x, y, width, height);
        break;

      default:
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);
    }

    // Draw label
    if (data.label) {
      this.drawText(
        data.label,
        x + width / 2,
        y + height / 2,
        data.style?.textColor || '#FFFFFF',
        data.style?.fontSize || 14,
        'center',
        'middle'
      );
    }

    // Restore context
    this.ctx.restore();
  }

  drawEdge(edge: DiagramEdge, nodes: DiagramNode[], isSelected: boolean = false): void {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return;

    const sourceX = sourceNode.position.x + sourceNode.size.width / 2;
    const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
    const targetX = targetNode.position.x + targetNode.size.width / 2;
    const targetY = targetNode.position.y + targetNode.size.height / 2;

    // Save context
    this.ctx.save();

    // Apply edge styles
    this.ctx.strokeStyle = isSelected ? '#EF4444' : (edge.data.style?.strokeColor || '#6B7280');
    this.ctx.lineWidth = isSelected ? 3 : (edge.data.style?.strokeWidth || 2);

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(sourceX, sourceY);
    this.ctx.lineTo(targetX, targetY);
    this.ctx.stroke();

    // Draw arrowhead if specified
    if (edge.data.style?.arrowhead === 'arrow') {
      this.drawArrowhead(sourceX, sourceY, targetX, targetY);
    }

    // Draw label if present
    if (edge.data.label) {
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;
      this.drawText(
        edge.data.label,
        midX,
        midY - 5,
        edge.data.style?.strokeColor || '#6B7280',
        12,
        'center',
        'bottom'
      );
    }

    // Restore context
    this.ctx.restore();
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawDiamond(x: number, y: number, width: number, height: number): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(centerX, y); // top
    this.ctx.lineTo(x + width, centerY); // right
    this.ctx.lineTo(centerX, y + height); // bottom
    this.ctx.lineTo(x, centerY); // left
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawTriangle(x: number, y: number, width: number, height: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + width / 2, y); // top
    this.ctx.lineTo(x + width, y + height); // bottom right
    this.ctx.lineTo(x, y + height); // bottom left
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawPolygon(x: number, y: number, width: number, height: number, sides: number): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;

    this.ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const px = centerX + radius * Math.cos(angle);
      const py = centerY + radius * Math.sin(angle);

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawStar(x: number, y: number, width: number, height: number): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * 0.5;

    this.ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = centerX + radius * Math.cos(angle);
      const py = centerY + radius * Math.sin(angle);

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawArrowhead(fromX: number, fromY: number, toX: number, toY: number): void {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  private drawText(
    text: string,
    x: number,
    y: number,
    color: string,
    fontSize: number,
    textAlign: CanvasTextAlign = 'center',
    textBaseline: CanvasTextBaseline = 'middle'
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = textBaseline;
    this.ctx.fillText(text, x, y);
  }

  render(data: SmartDiagramData): void {
    this.clear();

    // Draw background
    this.setBackground('#FFFFFF');

    // Draw edges first
    data.edges.forEach(edge => {
      this.drawEdge(edge, data.nodes);
    });

    // Draw nodes
    data.nodes.forEach(node => {
      this.drawNode(node);
    });
  }
}

export const CanvasRendererComponent: React.FC<CanvasRendererProps> = ({
  data,
  width,
  height,
  backgroundColor = '#FFFFFF',
  onNodeClick,
  onEdgeClick,
  onCanvasClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current, width, height);
    }
  }, [width, height]);

  // Render diagram
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.render(data);
    }
  }, [data]);

  // Handle canvas clicks
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check for node clicks
    for (const node of data.nodes) {
      if (
        x >= node.position.x &&
        x <= node.position.x + node.size.width &&
        y >= node.position.y &&
        y <= node.position.y + node.size.height
      ) {
        onNodeClick?.(node, event.nativeEvent);
        return;
      }
    }

    // Check for edge clicks (simplified)
    for (const edge of data.edges) {
      // Basic edge click detection - could be improved
      onEdgeClick?.(edge, event.nativeEvent);
    }

    onCanvasClick?.(event.nativeEvent);
  }, [data.nodes, data.edges, onNodeClick, onEdgeClick, onCanvasClick]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleCanvasClick}
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '4px',
        cursor: 'default'
      }}
    />
  );
};
