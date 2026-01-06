import React from 'react';
import { BaseNode } from './BaseNode';
import { DiagramNode } from '../../types/diagram';

interface RoundedRectangleNodeProps {
  node: DiagramNode;
  isSelected: boolean;
  editable: boolean;
  onClick: (node: DiagramNode, event: React.MouseEvent) => void;
  onMouseDown: (node: DiagramNode, event: React.MouseEvent) => void;
}

export const RoundedRectangleNode: React.FC<RoundedRectangleNodeProps> = ({
  node,
  isSelected,
  editable,
  onClick,
  onMouseDown
}) => {
  const radius = Math.min(node.size.width, node.size.height) / 4;

  return (
    <BaseNode
      node={node}
      isSelected={isSelected}
      editable={editable}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <rect
        x={node.position.x}
        y={node.position.y}
        width={node.size.width}
        height={node.size.height}
        rx={radius}
        ry={radius}
      />
    </BaseNode>
  );
};
