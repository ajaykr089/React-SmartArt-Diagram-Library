import React, { useRef, useEffect, useCallback, useState } from 'react';
import { SmartDiagramData, DiagramNode, DiagramEdge } from '../types/diagram';
import { PerformanceUtils } from '../utils/performance';

interface VirtualRendererProps {
  data: SmartDiagramData;
  width: number;
  height: number;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  onNodeClick?: (node: DiagramNode, event: MouseEvent) => void;
  onEdgeClick?: (edge: DiagramEdge, event: MouseEvent) => void;
  onCanvasClick?: (event: MouseEvent) => void;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

interface RenderedItem {
  id: string;
  type: 'node' | 'edge';
  x: number;
  y: number;
  width: number;
  height: number;
  element: DiagramNode | DiagramEdge;
}

export const VirtualRenderer: React.FC<VirtualRendererProps> = ({
  data,
  width,
  height,
  viewport = { x: 0, y: 0, zoom: 1 },
  onNodeClick,
  onEdgeClick,
  onCanvasClick,
  onViewportChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<RenderedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Calculate viewport bounds
  const getViewportBounds = useCallback(() => {
    const left = -viewport.x / viewport.zoom;
    const top = -viewport.y / viewport.zoom;
    const right = (-viewport.x + width) / viewport.zoom;
    const bottom = (-viewport.y + height) / viewport.zoom;

    return { left, top, right, bottom };
  }, [viewport, width, height]);

  // Filter items within viewport
  const updateVisibleItems = useCallback(() => {
    const bounds = getViewportBounds();
    const items: RenderedItem[] = [];

    // Add visible nodes
    data.nodes.forEach(node => {
      const nodeRight = node.position.x + node.size.width;
      const nodeBottom = node.position.y + node.size.height;

      if (
        nodeRight >= bounds.left &&
        node.position.x <= bounds.right &&
        nodeBottom >= bounds.top &&
        node.position.y <= bounds.bottom
      ) {
        items.push({
          id: node.id,
          type: 'node',
          x: node.position.x,
          y: node.position.y,
          width: node.size.width,
          height: node.size.height,
          element: node
        });
      }
    });

    // Add visible edges (only if both source and target are visible or near viewport)
    const visibleNodeIds = new Set(items.filter(item => item.type === 'node').map(item => item.id));

    data.edges.forEach(edge => {
      const sourceNode = data.nodes.find(n => n.id === edge.source);
      const targetNode = data.nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        // Include edge if at least one endpoint is visible
        const sourceVisible = visibleNodeIds.has(edge.source);
        const targetVisible = visibleNodeIds.has(edge.target);

        if (sourceVisible || targetVisible) {
          // Calculate edge bounds for culling
          const minX = Math.min(sourceNode.position.x, targetNode.position.x);
          const minY = Math.min(sourceNode.position.y, targetNode.position.y);
          const maxX = Math.max(
            sourceNode.position.x + sourceNode.size.width,
            targetNode.position.x + targetNode.size.width
          );
          const maxY = Math.max(
            sourceNode.position.y + sourceNode.size.height,
            targetNode.position.y + targetNode.size.height
          );

          // Add some padding around edges
          const padding = 50;
          if (
            maxX + padding >= bounds.left &&
            minX - padding <= bounds.right &&
            maxY + padding >= bounds.top &&
            minY - padding <= bounds.bottom
          ) {
            items.push({
              id: edge.id,
              type: 'edge',
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
              element: edge
            });
          }
        }
      }
    });

    setVisibleItems(items);
  }, [data, getViewportBounds]);

  // Update visible items when data or viewport changes
  useEffect(() => {
    updateVisibleItems();
  }, [data, viewport, updateVisibleItems]);

  // Handle mouse events for panning
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 1 || (event.button === 0 && event.altKey)) { // Middle mouse or Alt+click
      setIsDragging(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
      event.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;

    const newViewport = {
      ...viewport,
      x: viewport.x + deltaX,
      y: viewport.y + deltaY
    };

    onViewportChange?.(newViewport);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [isDragging, lastMousePos, viewport, onViewportChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel events for zooming
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, viewport.zoom * zoomFactor));

    // Zoom towards mouse position
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const newX = viewport.x + mouseX * (viewport.zoom - newZoom) / viewport.zoom;
      const newY = viewport.y + mouseY * (viewport.zoom - newZoom) / viewport.zoom;

      onViewportChange?.({
        x: newX,
        y: newY,
        zoom: newZoom
      });
    }
  }, [viewport, onViewportChange]);

  // Handle clicks
  const handleClick = useCallback((event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (event.clientY - rect.top - viewport.y) / viewport.zoom;

    // Check for node clicks
    for (const item of visibleItems) {
      if (item.type === 'node') {
        const node = item.element as DiagramNode;
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
    }

    // Check for edge clicks
    for (const item of visibleItems) {
      if (item.type === 'edge') {
        // Simple edge click detection - could be improved
        onEdgeClick?.(item.element as DiagramEdge, event.nativeEvent);
        return;
      }
    }

    onCanvasClick?.(event.nativeEvent);
  }, [visibleItems, viewport, onNodeClick, onEdgeClick, onCanvasClick]);

  // Render individual items
  const renderItem = (item: RenderedItem) => {
    const transform = `translate(${item.x * viewport.zoom + viewport.x}px, ${item.y * viewport.zoom + viewport.y}px) scale(${viewport.zoom})`;

    if (item.type === 'node') {
      const node = item.element as DiagramNode;
      return (
        <div
          key={item.id}
          className="virtual-node"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${item.width}px`,
            height: `${item.height}px`,
            transform,
            transformOrigin: 'top left',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick?.(node, e.nativeEvent);
          }}
        >
          {/* Node shape would be rendered here */}
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: node.data.style?.backgroundColor || '#10B981',
              border: `2px solid ${node.data.style?.borderColor || '#6B7280'}`,
              borderRadius: node.type === 'rounded-rectangle' ? '8px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: node.data.style?.textColor || '#FFFFFF',
              fontSize: `${(node.data.style?.fontSize || 14) * viewport.zoom}px`,
              fontWeight: 'bold'
            }}
          >
            {node.data.label}
          </div>
        </div>
      );
    } else {
      const edge = item.element as DiagramEdge;
      const sourceNode = data.nodes.find(n => n.id === edge.source);
      const targetNode = data.nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return null;

      const sourceX = sourceNode.position.x + sourceNode.size.width / 2;
      const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
      const targetX = targetNode.position.x + targetNode.size.width / 2;
      const targetY = targetNode.position.y + targetNode.size.height / 2;

      return (
        <svg
          key={item.id}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${item.width}px`,
            height: `${item.height}px`,
            transform,
            transformOrigin: 'top left',
            pointerEvents: 'none'
          }}
        >
          <line
            x1={sourceX - item.x}
            y1={sourceY - item.y}
            x2={targetX - item.x}
            y2={targetY - item.y}
            stroke={edge.data.style?.strokeColor || '#6B7280'}
            strokeWidth={edge.data.style?.strokeWidth || 2}
          />
        </svg>
      );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '4px',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      {/* Render visible items */}
      {visibleItems.map(renderItem)}

      {/* Performance info overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        pointerEvents: 'none'
      }}>
        {visibleItems.length} items | {viewport.zoom.toFixed(2)}x
      </div>
    </div>
  );
};
