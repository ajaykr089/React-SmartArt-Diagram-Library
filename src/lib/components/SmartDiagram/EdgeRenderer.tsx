import React from 'react';
import { DiagramNode, DiagramEdge } from '../../types/diagram';

interface EdgeRendererProps {
  edges: DiagramEdge[];
  nodes: DiagramNode[];
  selectedEdge: DiagramEdge | null;
  onEdgeClick: (edge: DiagramEdge, event: React.MouseEvent) => void;
}

export const EdgeRenderer: React.FC<EdgeRendererProps> = ({
  edges,
  nodes,
  selectedEdge,
  onEdgeClick
}) => {
  return (
    <g>
      {/* Render edges */}
      {edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) return null;

        const sourceX = sourceNode.position.x + sourceNode.size.width / 2;
        const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
        const targetX = targetNode.position.x + targetNode.size.width / 2;
        const targetY = targetNode.position.y + targetNode.size.height / 2;

        const isSelected = selectedEdge?.id === edge.id;

        return (
          <g key={edge.id}>
            <line
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke={isSelected ? '#EF4444' : (edge.data.style?.strokeColor || '#6B7280')}
              strokeWidth={isSelected ? 3 : (edge.data.style?.strokeWidth || 2)}
              markerEnd={edge.data.style?.arrowhead === 'arrow' ? 'url(#arrowhead)' : undefined}
              style={{ cursor: 'pointer' }}
              onClick={(e) => onEdgeClick(edge, e)}
            />
            {edge.data.label && (
              <text
                x={(sourceX + targetX) / 2}
                y={(sourceY + targetY) / 2 - 5}
                textAnchor="middle"
                className="diagram-edge-label"
              >
                {edge.data.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
