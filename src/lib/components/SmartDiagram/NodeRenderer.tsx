import React from 'react';
import { DiagramNode, DiagramTheme } from '../../types/diagram';
import {
  RectangleNode,
  CircleNode,
  DiamondNode,
  TriangleNode,
  HexagonNode,
  PentagonNode,
  StarNode,
  RoundedRectangleNode,
  EllipseNode,
  ParallelogramNode,
  TrapezoidNode
} from '../nodes';

interface NodeRendererProps {
  nodes: DiagramNode[];
  selectedNode: DiagramNode | null;
  editable: boolean;
  theme?: DiagramTheme;
  onNodeClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onNodeMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  nodes,
  selectedNode,
  editable,
  onNodeClick,
  onNodeMouseDown
}) => {
  return (
    <g>
      {/* Render nodes */}
      {nodes.map(node => {
        const isSelected = selectedNode?.id === node.id;

        switch (node.type) {
          case 'rectangle':
            return (
              <RectangleNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'rounded-rectangle':
            return (
              <RoundedRectangleNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'circle':
            return (
              <CircleNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'ellipse':
            return (
              <EllipseNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'diamond':
            return (
              <DiamondNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'triangle':
            return (
              <TriangleNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'hexagon':
            return (
              <HexagonNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'pentagon':
            return (
              <PentagonNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'star':
            return (
              <StarNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'parallelogram':
            return (
              <ParallelogramNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'trapezoid':
            return (
              <TrapezoidNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );

          case 'custom':
          default:
            return (
              <RectangleNode
                key={node.id}
                node={node}
                isSelected={isSelected}
                editable={editable}
                onClick={onNodeClick}
                onMouseDown={onNodeMouseDown}
              />
            );
        }
      })}

      {/* Render node labels */}
      {nodes.map(node => {
        const centerX = node.position.x + node.size.width / 2;
        const centerY = node.position.y + node.size.height / 2;

        return (
          <text
            key={`label-${node.id}`}
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="diagram-node-label"
            style={{
              fontSize: node.data.style?.fontSize || 14,
              fill: node.data.style?.textColor || '#FFFFFF'
            }}
          >
            {node.data.label}
          </text>
        );
      })}
    </g>
  );
};
