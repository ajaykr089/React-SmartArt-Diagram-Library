import React, { forwardRef, useMemo } from 'react';
import { DiagramNode, DiagramEdge, Position } from '../../types/diagram';

interface SVGRendererProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  width: number;
  height: number;
  zoom?: number;
  offset?: Position;
  className?: string;
  onNodeClick?: (node: DiagramNode) => void;
  onEdgeClick?: (edge: DiagramEdge) => void;
  onCanvasClick?: () => void;
  children?: React.ReactNode;
}

interface EdgeWithPath extends DiagramEdge {
  path: string;
}

export const SVGRenderer = forwardRef<SVGSVGElement, SVGRendererProps>(({
  nodes,
  edges,
  width,
  height,
  zoom = 1,
  offset = { x: 0, y: 0 },
  className,
  onNodeClick,
  onEdgeClick,
  onCanvasClick,
  children
}, ref) => {
  // Transform coordinates with zoom and offset
  const transformPoint = (point: Position): Position => ({
    x: (point.x + offset.x) * zoom,
    y: (point.y + offset.y) * zoom
  });

  // Calculate edge path between two nodes
  const getEdgePath = (sourceNode: DiagramNode, targetNode: DiagramNode, edge: DiagramEdge): string => {
    const sourceCenter = {
      x: sourceNode.position.x + sourceNode.size.width / 2,
      y: sourceNode.position.y + sourceNode.size.height / 2
    };

    const targetCenter = {
      x: targetNode.position.x + targetNode.size.width / 2,
      y: targetNode.position.y + targetNode.size.height / 2
    };

    const source = transformPoint(sourceCenter);
    const target = transformPoint(targetCenter);

    // Simple straight line for now - can be enhanced with different edge types
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  };

  // Memoize edges with their paths
  const edgesWithPaths: EdgeWithPath[] = useMemo(() => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return null;

      return {
        ...edge,
        path: getEdgePath(sourceNode, targetNode, edge)
      };
    }).filter((edge): edge is EdgeWithPath => edge !== null);
  }, [edges, nodes, zoom, offset]);

  // Calculate edge label position
  const getEdgeLabelPosition = (edge: EdgeWithPath) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return { x: 0, y: 0 };

    const sourceX = sourceNode.position.x + sourceNode.size.width / 2;
    const targetX = targetNode.position.x + targetNode.size.width / 2;
    const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
    const targetY = targetNode.position.y + targetNode.size.height / 2;

    return transformPoint({
      x: (sourceX + targetX) / 2,
      y: (sourceY + targetY) / 2
    });
  };

  // Transform node positions
  const transformedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      transformedPosition: transformPoint(node.position),
      transformedSize: {
        width: node.size.width * zoom,
        height: node.size.height * zoom
      }
    }));
  }, [nodes, zoom, offset]);

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      className={className}
      onClick={onCanvasClick}
      style={{ background: 'transparent' }}
    >
      <defs>
        {/* Arrow markers for edges */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#666"
          />
        </marker>

        {/* Filters for shadows */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.1"/>
        </filter>
      </defs>

      {/* Render edges first (behind nodes) */}
      {edgesWithPaths.map((edge) => (
        <g key={edge.id} onClick={() => onEdgeClick?.(edge)}>
          <path
            d={edge.path}
            stroke={edge.data.style?.strokeColor || '#666'}
            strokeWidth={edge.data.style?.strokeWidth || 2}
            fill="none"
            markerEnd={edge.data.style?.arrowhead === 'arrow' ? 'url(#arrowhead)' : undefined}
            strokeDasharray={edge.data.style?.strokeDasharray}
            className="cursor-pointer hover:stroke-blue-500 transition-colors"
          />
          {edge.data.label && (() => {
            const labelPos = getEdgeLabelPosition(edge);
            return (
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-gray-700 pointer-events-none"
                style={{ fontSize: '12px' }}
              >
                {edge.data.label}
              </text>
            );
          })()}
        </g>
      ))}

      {/* Render nodes */}
      {transformedNodes.map((node) => (
        <g
          key={node.id}
          onClick={() => onNodeClick?.(node)}
          className="cursor-pointer"
        >
          {/* Node background */}
          <rect
            x={node.transformedPosition.x}
            y={node.transformedPosition.y}
            width={node.transformedSize.width}
            height={node.transformedSize.height}
            rx={node.data.style?.borderRadius || 4}
            fill={node.data.style?.backgroundColor || '#fff'}
            stroke={node.data.style?.borderColor || '#ddd'}
            strokeWidth={node.data.style?.borderWidth || 1}
            filter={node.data.style?.shadow ? 'url(#shadow)' : undefined}
            className="hover:stroke-blue-500 transition-colors"
          />

          {/* Node label */}
          <text
            x={node.transformedPosition.x + node.transformedSize.width / 2}
            y={node.transformedPosition.y + node.transformedSize.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none select-none"
            style={{
              fontSize: node.data.style?.fontSize || 14,
              fontFamily: node.data.style?.fontFamily || 'Arial, sans-serif',
              fontWeight: node.data.style?.fontWeight || 'normal',
              fill: node.data.style?.textColor || '#333'
            }}
          >
            {node.data.label}
          </text>
        </g>
      ))}

      {/* Custom children (for overlays, controls, etc.) */}
      {children}
    </svg>
  );
});

SVGRenderer.displayName = 'SVGRenderer';
